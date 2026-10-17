import { useMemo, useState } from "react";
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Group,
  SegmentedControl,
  Stack,
  Switch,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Form, Link, useActionData, useLoaderData, useNavigation } from "react-router";
import {
  availableContentActions,
  DEFAULT_LOCALE,
  diffLines,
  isContentAction,
  isLocale,
  parseLessonBody,
  type ContentAction,
  type ContentStatus,
  type ErrorCode,
  type Role,
  type TopicId,
} from "@elektro/shared";
import type { BreadcrumbHandle } from "../components/app-shell/breadcrumbs";
import { LessonBody } from "../components/lesson/lesson-body";
import { localePath } from "../i18n/locale";
import { ApiError, apiFetch } from "../lib/api";
import { requireStaff } from "../lib/session";
import { useLayoutData } from "../lib/use-layout-data";
import type { Route } from "./+types/teacher-review-lesson";

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
  toStatus: ContentStatus;
  actorDeleted: boolean;
  actorName: string | null;
  actorEmail: string | null;
  actorRole: Role;
  note: string | null;
  createdAt: string;
}

interface ReviewData {
  latest: {
    version: number;
    topicId: TopicId;
    title: string;
    summary: string | null;
    body: string;
    status: ContentStatus;
    reviewNote: string | null;
    approval: Approval | null;
  };
  live: { version: number; title: string; body: string; approval: Approval } | null;
  reviews: ReviewEvent[];
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const user = await requireStaff(request, locale);
  try {
    const data = await apiFetch<ReviewData>(
      request,
      `/api/manage/lessons/${encodeURIComponent(String(params.slug))}/review?locale=${locale}`,
    );
    return { ...data, slug: String(params.slug), role: user.role };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      throw new Response(null, { status: 404 });
    }
    throw error;
  }
}

/** Approve / request changes / submit, with the note required for changes (plan J8). */
export async function action({ request, params }: Route.ActionArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const form = await request.formData();
  const reviewAction = form.get("reviewAction");
  const note = String(form.get("note") ?? "").trim();

  if (!isContentAction(reviewAction) || (reviewAction === "request_changes" && !note)) {
    return { errorCode: "VALIDATION_FAILED" as ErrorCode };
  }
  try {
    await apiFetch(request, `/api/lessons/${encodeURIComponent(String(params.slug))}/review`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: reviewAction, locale, ...(note ? { note } : {}) }),
    });
    return { ok: true as const, done: reviewAction };
  } catch (error) {
    if (error instanceof ApiError) {
      return { errorCode: error.body.code as ErrorCode };
    }
    throw error;
  }
}

export const handle: BreadcrumbHandle = {
  breadcrumbs: (data) => {
    const title = (data as { latest?: { title: string } } | undefined)?.latest?.title;
    return [{ labelKey: "teacher.review.title", path: "teacher/review" }, { label: title ?? "" }];
  },
};

type View = "preview" | "diff" | "history";

export default function TeacherReviewLesson() {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const { slug, role, latest, live, reviews } = useLoaderData<typeof loader>();
  const result = useActionData<typeof action>();
  const navigation = useNavigation();
  const [view, setView] = useState<View>("preview");
  const [phoneWidth, setPhoneWidth] = useState(true);

  const tree = useMemo(() => parseLessonBody(latest.body), [latest.body]);
  const diff = useMemo(() => (live ? diffLines(live.body, latest.body) : []), [live, latest.body]);
  const actions = availableContentActions(latest.status, role);
  const busy = navigation.state === "submitting";
  const dateFormat = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Budapest" });

  return (
    <Stack gap="md" maw={760}>
      <Stack gap={4}>
        <Group justify="space-between" wrap="nowrap" align="flex-start">
          <Title order={2}>{latest.title}</Title>
          <Badge variant="light" color={latest.status === "approved" ? "green" : "yellow"}>
            {t(`lessons.status.${latest.status}`)}
          </Badge>
        </Group>
        <Text size="sm" c="dimmed">
          {t(`topic.${latest.topicId}`)} · {t("review.version", { version: latest.version })}
        </Text>
        {latest.reviewNote && <Text size="sm">{t("review.lastNote", { note: latest.reviewNote })}</Text>}
      </Stack>

      <ApprovalRecord approval={live?.approval ?? latest.approval} version={live?.version ?? latest.version} dateFormat={dateFormat} />

      <Card withBorder padding="md" radius="md" data-testid="review-actions">
        <Stack gap="sm">
          {result && "errorCode" in result && (
            <Alert color="red" variant="light" role="alert">
              {t(`error.${result.errorCode}`)}
            </Alert>
          )}
          {result && "ok" in result && (
            <Alert color="green" variant="light" role="status">
              {t(`teacher.review.done.${result.done}`)}
            </Alert>
          )}
          {actions.length === 0 ? (
            <Text size="sm" c="dimmed">
              {t("teacher.review.noActions")}
            </Text>
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
          <Button component={Link} to={localePath(locale, `teacher/content/lessons/${slug}`)} variant="subtle" size="xs">
            {t("teacher.review.edit")}
          </Button>
        </Stack>
      </Card>

      <SegmentedControl
        fullWidth
        value={view}
        onChange={(value) => setView(value as View)}
        aria-label={t("teacher.review.view")}
        data={[
          { value: "preview", label: t("teacher.review.views.preview") },
          { value: "diff", label: t("teacher.review.views.diff") },
          { value: "history", label: t("teacher.review.views.history") },
        ]}
      />

      {view === "preview" && (
        <Stack gap="xs">
          <Switch
            checked={phoneWidth}
            onChange={(event) => setPhoneWidth(event.currentTarget.checked)}
            label={t("teacher.review.phoneWidth")}
          />
          <Box
            data-testid="review-preview"
            maw={phoneWidth ? 390 : undefined}
            p="md"
            style={{ border: "1px solid var(--mantine-color-default-border)", borderRadius: 12 }}
          >
            <LessonBody tree={tree} />
          </Box>
        </Stack>
      )}

      {view === "diff" &&
        (live ? (
          <Stack gap="xs" data-testid="review-diff">
            <Text size="sm" c="dimmed">
              {t("teacher.review.diffAgainst", { version: live.version })}
            </Text>
            <Box component="pre" m={0} p="sm" style={{ overflowX: "auto", border: "1px solid var(--mantine-color-default-border)", borderRadius: 8, fontSize: 13 }}>
              {diff.map((line, index) => (
                <Box
                  key={index}
                  component="div"
                  data-diff={line.type}
                  style={{
                    whiteSpace: "pre-wrap",
                    overflowWrap: "anywhere",
                    background:
                      line.type === "add"
                        ? "var(--mantine-color-green-light)"
                        : line.type === "remove"
                          ? "var(--mantine-color-red-light)"
                          : undefined,
                  }}
                >
                  <span aria-hidden="true">{line.type === "add" ? "+ " : line.type === "remove" ? "− " : "  "}</span>
                  <span className="sr-only" style={{ position: "absolute", left: -9999 }}>
                    {t(`teacher.review.diffLine.${line.type}`)}
                  </span>
                  {line.text || " "}
                </Box>
              ))}
            </Box>
          </Stack>
        ) : (
          <Text c="dimmed">{t("teacher.review.noLive")}</Text>
        ))}

      {view === "history" && (
        <Stack gap="xs" data-testid="review-history">
          {reviews.length === 0 ? (
            <Text c="dimmed">{t("teacher.review.noHistory")}</Text>
          ) : (
            reviews.map((event) => (
              <Card key={event.id} withBorder padding="sm" radius="md">
                <Text fw={600} size="sm">
                  {t(`review.action.${event.action}`)} · {t("review.version", { version: event.version })}
                </Text>
                <Text size="sm">{reviewerLabel(event, t)}</Text>
                <Text size="xs" c="dimmed">
                  {dateFormat.format(new Date(event.createdAt))}
                </Text>
                {event.note && <Text size="sm">{event.note}</Text>}
              </Card>
            ))
          )}
        </Stack>
      )}
    </Stack>
  );
}

function reviewerLabel(
  event: { actorDeleted: boolean; actorName: string | null; actorEmail: string | null; actorRole: Role },
  t: ReturnType<typeof useTranslation>["t"],
) {
  // A deleted account is shown by role only, never with name or email (Q11).
  return event.actorDeleted
    ? t("teacher.review.deletedReviewer", { role: t(`role.${event.actorRole}`) })
    : t("teacher.review.reviewer", { name: event.actorName, email: event.actorEmail, role: t(`role.${event.actorRole}`) });
}

function ApprovalRecord({
  approval,
  version,
  dateFormat,
}: {
  approval: Approval | null;
  version: number;
  dateFormat: Intl.DateTimeFormat;
}) {
  const { t } = useTranslation();
  if (!approval || !approval.at) {
    return (
      <Alert variant="light" color="gray" data-testid="approval-record">
        {t("teacher.review.notApprovedYet")}
      </Alert>
    );
  }
  return (
    <Alert variant="light" color="green" data-testid="approval-record">
      <Text size="sm" fw={600}>
        {t("teacher.review.liveVersion", { version })}
      </Text>
      <Text size="sm">
        {approval.deleted || !approval.role
          ? t("teacher.review.deletedReviewer", { role: approval.role ? t(`role.${approval.role}`) : "" })
          : t("teacher.review.reviewer", { name: approval.name, email: approval.email, role: t(`role.${approval.role}`) })}
      </Text>
      <Text size="xs" c="dimmed">
        {dateFormat.format(new Date(approval.at))}
      </Text>
    </Alert>
  );
}

