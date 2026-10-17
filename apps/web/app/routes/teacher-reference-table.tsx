import { useState } from "react";
import { Alert, Badge, Button, Card, Checkbox, Group, Stack, Text, TextInput, Textarea, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Form, useActionData, useLoaderData, useNavigation } from "react-router";
import {
  DEFAULT_LOCALE,
  isLocale,
  type ReferenceTableContent,
  type Role,
  type TableStatus,
} from "@elektro/shared";
import type { BreadcrumbHandle } from "../components/app-shell/breadcrumbs";
import { FormError } from "../components/content/form-error";
import { TableEditor } from "../components/reference/table-editor";
import { TableExcerpt } from "../components/reference/table-excerpt";
import { ApiError, apiFetch } from "../lib/api";
import { actionFailure } from "../lib/content-admin";
import { jsonBody } from "../lib/content-admin-actions";
import { parseTableEdit } from "../lib/reference-table-actions";
import { requireStaff } from "../lib/session";
import { useLayoutData } from "../lib/use-layout-data";
import type { Route } from "./+types/teacher-reference-table";

interface Verification {
  at: string;
  role: Role | null;
  deleted: boolean;
  name: string | null;
  email: string | null;
}

interface TableVersion extends ReferenceTableContent {
  version: number;
  title: string;
  source: string;
  status: TableStatus;
  verification: Verification | null;
}

interface TableEvent {
  id: string;
  version: number;
  action: string;
  actorDeleted: boolean;
  actorName: string | null;
  actorEmail: string | null;
  actorRole: Role;
  note: string | null;
  createdAt: string;
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  await requireStaff(request, locale);
  const key = encodeURIComponent(String(params.key));
  try {
    const [{ table }, { events }] = await Promise.all([
      apiFetch<{ table: { key: string; latest: TableVersion; live: TableVersion | null } }>(request, `/api/reference-tables/${key}`),
      apiFetch<{ events: TableEvent[] }>(request, `/api/reference-tables/${key}/events`),
    ]);
    return { table, events };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new Response(null, { status: 404 });
    }
    throw error;
  }
}

/** Save the content (a new version if the newest is verified) or verify the newest version. */
export async function action({ request, params }: Route.ActionArgs) {
  const form = await request.formData();
  const key = encodeURIComponent(String(params.key));
  try {
    if (form.get("intent") === "verify") {
      if (form.get("compared") !== "yes") {
        return { errorCode: "VALIDATION_FAILED", fields: ["compared"] };
      }
      const note = String(form.get("note") ?? "").trim();
      await apiFetch(request, `/api/reference-tables/${key}/verify`, {
        method: "POST",
        ...jsonBody({ version: Number(form.get("version")), ...(note ? { note } : {}) }),
      });
      return { ok: "verified" as const };
    }
    const parsed = parseTableEdit(form);
    if (!parsed.ok) {
      return parsed.failure;
    }
    await apiFetch(request, `/api/reference-tables/${key}`, { method: "PUT", ...jsonBody(parsed.value) });
    return { ok: "saved" as const };
  } catch (error) {
    return actionFailure(error);
  }
}

export const handle: BreadcrumbHandle = {
  breadcrumbs: (data) => {
    const title = (data as { table?: { latest: { title: string } } } | undefined)?.table?.latest.title;
    return [{ labelKey: "referenceTables.title", path: "teacher/reference-tables" }, { label: title ?? "" }];
  },
};

export default function TeacherReferenceTable() {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const { table, events } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  const navigation = useNavigation();
  const busy = navigation.state === "submitting";
  const [compared, setCompared] = useState(false);
  const { latest, live } = table;
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Budapest" });
  const failure = result && "errorCode" in result ? result : undefined;

  return (
    <Stack gap="lg" maw={760}>
      <Stack gap={4}>
        <Group justify="space-between" wrap="nowrap" align="flex-start">
          <Title order={2}>{latest.title}</Title>
          <Badge color={latest.status === "verified" ? "green" : "orange"} variant="light">
            {t(`referenceTables.status.${latest.status}`)}
          </Badge>
        </Group>
        <Text size="sm" c="dimmed">
          {table.key} · {t("review.version", { version: latest.version })}
        </Text>
      </Stack>

      {result && "ok" in result && (
        <Alert color="green" variant="light" role="status">{t(`referenceTables.done.${result.ok}`)}</Alert>
      )}

      <TableExcerpt table={latest} source={latest.source} locale={locale} unverified={latest.status !== "verified"} />

      {latest.verification && (
        <Alert variant="light" color="green" data-testid="verification-record">
          <Text size="sm" fw={600}>{t("referenceTables.verifiedRecord")}</Text>
          <Text size="sm">
            {latest.verification.deleted || !latest.verification.role
              ? t("teacher.review.deletedReviewer", { role: latest.verification.role ? t(`role.${latest.verification.role}`) : "" })
              : t("teacher.review.reviewer", { name: latest.verification.name, email: latest.verification.email, role: t(`role.${latest.verification.role}`) })}
          </Text>
          <Text size="xs" c="dimmed">{dateFormat.format(new Date(latest.verification.at))}</Text>
        </Alert>
      )}
      {live && <Alert color="gray" variant="light">{t("referenceTables.liveStill", { version: live.version })}</Alert>}

      {latest.status === "unverified" && (
        <Card withBorder padding="md" radius="md" data-testid="verify-card">
          <Form method="post">
            <input type="hidden" name="intent" value="verify" />
            <input type="hidden" name="version" value={latest.version} />
            <Stack gap="sm">
              <Text fw={600}>{t("referenceTables.verify.title")}</Text>
              <Text size="sm" c="dimmed">{t("referenceTables.verify.hint")}</Text>
              <Checkbox
                name="compared"
                value="yes"
                checked={compared}
                onChange={(event) => setCompared(event.currentTarget.checked)}
                label={t("referenceTables.verify.compared")}
                styles={{ input: { minWidth: 24, minHeight: 24 } }}
              />
              <Textarea name="note" label={t("referenceTables.verify.note")} autosize minRows={2} />
              <Button type="submit" disabled={!compared} loading={busy}>
                {t("referenceTables.verify.button")}
              </Button>
            </Stack>
          </Form>
        </Card>
      )}

      <Card withBorder padding="md" radius="md">
        <Form method="post" key={`${latest.version}-${latest.status}`}>
          <Stack gap="md">
            <Text fw={600}>{t("referenceTables.edit.title")}</Text>
            <Text size="sm" c="dimmed">
              {latest.status === "verified" ? t("referenceTables.edit.newVersionHint") : t("referenceTables.edit.inPlaceHint")}
            </Text>
            <FormError failure={failure} />
            <TextInput name="title" label={t("referenceTables.editor.titleLabel")} defaultValue={latest.title} required />
            <Textarea name="source" label={t("referenceTables.editor.source")} description={t("referenceTables.editor.sourceHint")} defaultValue={latest.source} autosize minRows={2} required />
            <TableEditor initial={{ columns: latest.columns, rows: latest.rows }} />
            <Button type="submit" variant="light" loading={busy}>
              {t("referenceTables.edit.save")}
            </Button>
          </Stack>
        </Form>
      </Card>

      <Stack gap="xs" data-testid="table-history">
        <Title order={3} size="h4">{t("referenceTables.history")}</Title>
        {events.map((event) => (
          <Card key={event.id} withBorder padding="sm" radius="md">
            <Text size="sm" fw={600}>
              {t(`referenceTables.action.${event.action}`)} · {t("review.version", { version: event.version })}
            </Text>
            <Text size="sm">
              {event.actorDeleted
                ? t("teacher.review.deletedReviewer", { role: t(`role.${event.actorRole}`) })
                : t("teacher.review.reviewer", { name: event.actorName, email: event.actorEmail, role: t(`role.${event.actorRole}`) })}
            </Text>
            <Text size="xs" c="dimmed">{dateFormat.format(new Date(event.createdAt))}</Text>
            {event.note && <Text size="sm">{event.note}</Text>}
          </Card>
        ))}
      </Stack>
    </Stack>
  );
}
