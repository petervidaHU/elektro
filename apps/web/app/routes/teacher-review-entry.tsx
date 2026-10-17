import { Alert, Badge, Button, Card, Group, Stack, Text, Textarea, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Form, Link, useActionData, useLoaderData, useNavigation } from "react-router";
import {
  availableContentActions,
  DEFAULT_LOCALE,
  diffLines,
  isContentAction,
  isLocale,
  isTopicId,
  type ContentAction,
  type ContentStatus,
  type ErrorCode,
  type Role,
} from "@elektro/shared";
import type { BreadcrumbHandle } from "../components/app-shell/breadcrumbs";
import { localePath } from "../i18n/locale";
import { ApiError, apiFetch } from "../lib/api";
import { requireStaff } from "../lib/session";
import { useLayoutData } from "../lib/use-layout-data";
import type { Route } from "./+types/teacher-review-entry";

interface Approval {
  at: string | null;
  role: Role | null;
  deleted: boolean;
  name: string | null;
  email: string | null;
}

interface ReviewEvent {
  id: string;
  version: number;
  action: ContentAction;
  actorDeleted: boolean;
  actorName: string | null;
  actorEmail: string | null;
  actorRole: Role;
  note: string | null;
  createdAt: string;
}

interface Data {
  latest: { version: number; title: string; body: string; status: ContentStatus; reviewNote: string | null; approval: Approval | null };
  live: { version: number; title: string; body: string; approval: Approval } | null;
  reviews: ReviewEvent[];
}

const KINDS = ["glossary", "intro"] as const;
type Kind = (typeof KINDS)[number];

const isKind = (value: string): value is Kind => (KINDS as readonly string[]).includes(value);

/** API paths of the two reviewable entities that are not lessons. */
const apiBase = (kind: Kind, id: string) =>
  kind === "glossary" ? `/api/glossary/${encodeURIComponent(id)}` : `/api/topic-intros/${encodeURIComponent(id)}`;
const dataPath = (kind: Kind, id: string, locale: string) =>
  kind === "glossary"
    ? `/api/manage/glossary/${encodeURIComponent(id)}/review?locale=${locale}`
    : `/api/manage/intros/${encodeURIComponent(id)}/review?locale=${locale}`;

/** Review screen for glossary terms and topic intros (plan §3.3 `/teacher/review/:kind/:id`). */
export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const user = await requireStaff(request, locale);
  const kind = String(params.kind);
  const id = String(params.id);
  if (!isKind(kind) || (kind === "intro" && !isTopicId(id))) throw new Response(null, { status: 404 });
  try {
    const data = await apiFetch<Data>(request, dataPath(kind, id, locale));
    return { ...data, kind, id, role: user.role };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) throw new Response(null, { status: 404 });
    throw error;
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const kind = String(params.kind);
  const form = await request.formData();
  const reviewAction = form.get("reviewAction");
  const note = String(form.get("note") ?? "").trim();
  if (!isKind(kind) || !isContentAction(reviewAction) || (reviewAction === "request_changes" && !note)) {
    return { errorCode: "VALIDATION_FAILED" as ErrorCode };
  }
  try {
    await apiFetch(request, `${apiBase(kind, String(params.id))}/review`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: reviewAction, locale, ...(note ? { note } : {}) }),
    });
    return { ok: true as const, done: reviewAction };
  } catch (error) {
    if (error instanceof ApiError) return { errorCode: error.body.code as ErrorCode };
    throw error;
  }
}

export const handle: BreadcrumbHandle = {
  breadcrumbs: () => [{ labelKey: "teacher.review.title", path: "teacher/review" }, { labelKey: "teacher.review.entry" }],
};

export default function TeacherReviewEntry() {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const { kind, id, role, latest, live, reviews } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  const busy = useNavigation().state === "submitting";
  const actions = availableContentActions(latest.status, role);
  const heading = kind === "intro" ? t(`topic.${id}`) : latest.title;
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Budapest" });
  const diff = live ? diffLines(live.body, latest.body) : [];
  const approval = live?.approval ?? latest.approval;
  const editPath = kind === "glossary" ? `teacher/glossary/${id}` : `teacher/intros/${id}`;

  return (
    <Stack gap="md" maw={760}>
      <Stack gap={4}>
        <Group justify="space-between" wrap="nowrap" align="flex-start">
          <Title order={2}>{heading}</Title>
          <Badge variant="light" color={latest.status === "approved" ? "green" : "yellow"}>{t(`lessons.status.${latest.status}`)}</Badge>
        </Group>
        <Text size="sm" c="dimmed">{t(`teacher.review.kind.${kind}`)} · {t("review.version", { version: latest.version })}</Text>
        {latest.reviewNote && <Text size="sm">{t("review.lastNote", { note: latest.reviewNote })}</Text>}
      </Stack>

      {approval && approval.at ? (
        <Alert variant="light" color="green" data-testid="approval-record">
          <Text size="sm" fw={600}>{t("teacher.review.liveVersion", { version: live?.version ?? latest.version })}</Text>
          <Text size="sm">
            {approval.deleted || !approval.role
              ? t("teacher.review.deletedReviewer", { role: approval.role ? t(`role.${approval.role}`) : "" })
              : t("teacher.review.reviewer", { name: approval.name, email: approval.email, role: t(`role.${approval.role}`) })}
          </Text>
          <Text size="xs" c="dimmed">{dateFormat.format(new Date(approval.at))}</Text>
        </Alert>
      ) : (
        <Alert variant="light" color="gray" data-testid="approval-record">{t("teacher.review.notApprovedYet")}</Alert>
      )}

      <Card withBorder padding="md" radius="md" data-testid="review-actions">
        <Stack gap="sm">
          {result && "errorCode" in result && <Alert color="red" variant="light" role="alert">{t(`error.${result.errorCode}`)}</Alert>}
          {result && "ok" in result && <Alert color="green" variant="light" role="status">{t(`teacher.review.done.${result.done}`)}</Alert>}
          {actions.length === 0 ? (
            <Text size="sm" c="dimmed">{t("teacher.review.noActions")}</Text>
          ) : (
            <Form method="post">
              <Stack gap="sm">
                {actions.includes("request_changes") && (
                  <Textarea name="note" label={t("review.note")} description={t("review.noteHint")} autosize minRows={2} />
                )}
                <Group grow>
                  {actions.map((reviewAction) => (
                    <Button
                      key={reviewAction}
                      type="submit"
                      name="reviewAction"
                      value={reviewAction}
                      loading={busy}
                      variant={reviewAction === "approve" ? "filled" : "light"}
                      color={reviewAction === "request_changes" ? "orange" : undefined}
                    >
                      {t(`review.action.${reviewAction}`)}
                    </Button>
                  ))}
                </Group>
              </Stack>
            </Form>
          )}
          <Button component={Link} to={localePath(locale, editPath)} variant="subtle" size="xs">{t("teacher.review.edit")}</Button>
        </Stack>
      </Card>

      <Card withBorder padding="md" radius="md" data-testid="review-preview">
        <Text style={{ lineHeight: 1.6 }}>{latest.body}</Text>
      </Card>

      {live && (
        <Stack gap={2} data-testid="review-diff">
          <Text size="sm" c="dimmed">{t("teacher.review.diffAgainst", { version: live.version })}</Text>
          {diff.map((line, index) => (
            <Text
              key={index}
              size="sm"
              data-diff={line.type}
              style={{
                overflowWrap: "anywhere",
                background: line.type === "add" ? "var(--mantine-color-green-light)" : line.type === "remove" ? "var(--mantine-color-red-light)" : undefined,
              }}
            >
              {line.type === "add" ? "+ " : line.type === "remove" ? "− " : "  "}
              {line.text}
            </Text>
          ))}
        </Stack>
      )}

      <Stack gap="xs" data-testid="review-history">
        {reviews.map((event) => (
          <Card key={event.id} withBorder padding="sm" radius="md">
            <Text fw={600} size="sm">{t(`review.action.${event.action}`)} · {t("review.version", { version: event.version })}</Text>
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
