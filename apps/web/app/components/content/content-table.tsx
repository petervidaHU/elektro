import { ActionIcon, Anchor, Badge, Button, Group, Stack, Table, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Form, Link, useNavigation } from "react-router";
import {
  formatDateTime,
  topicsByModule,
  type CalculatorDefinition,
  type Locale,
  type ModuleId,
  type Topic,
} from "@elektro/shared";
import { localePath } from "../../i18n/locale";
import type { ManagedCalculators, ManagedLesson } from "../../lib/content-admin";
import { ConfirmButton } from "./confirm-button";

type ManagedCalculator = ManagedCalculators["calculators"][number];

/** Number of columns, for the topic header rows that span the table. */
const COLUMNS = 7;

/**
 * The detailed list of the syllabus page for teachers and admins (plan U14,
 * Q21): one Mantine table per module, a header row per topic, then the
 * topic's lessons and calculators with their status, approval and actions.
 * The forms post to the syllabus route's action; the API checks every role.
 */
export function ModuleContentTable({
  module,
  lessons,
  calculators,
  available,
  isAdmin,
  locale,
}: {
  module: ModuleId;
  lessons: ManagedLesson[];
  calculators: ManagedCalculator[];
  available: CalculatorDefinition[];
  isAdmin: boolean;
  locale: Locale;
}) {
  const { t } = useTranslation();

  return (
    <Stack gap="sm" component="section" aria-labelledby={`module-${module}`}>
      <Title order={3} size="h4" id={`module-${module}`}>
        {t(`module.${module}`)}
      </Title>
      <Table.ScrollContainer minWidth={1040}>
        <Table verticalSpacing="sm" highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th w={110}>{t("contentAdmin.column.order")}</Table.Th>
              <Table.Th w={140}>{t("contentAdmin.column.type")}</Table.Th>
              <Table.Th>{t("contentAdmin.column.title")}</Table.Th>
              <Table.Th w={190}>{t("contentAdmin.column.status")}</Table.Th>
              <Table.Th>{t("contentAdmin.column.live")}</Table.Th>
              <Table.Th w={150}>{t("contentAdmin.column.updated")}</Table.Th>
              <Table.Th>{t("contentAdmin.column.actions")}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {topicsByModule(module).map((topic) => (
              <TopicRows
                key={topic.id}
                topic={topic}
                lessons={lessons.filter((lesson) => lesson.topicId === topic.id)}
                calculators={calculators.filter((calculator) => calculator.topicId === topic.id)}
                canAddCalculator={available.length > 0}
                isAdmin={isAdmin}
                locale={locale}
              />
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Stack>
  );
}

function TopicRows({
  topic,
  lessons,
  calculators,
  canAddCalculator,
  isAdmin,
  locale,
}: {
  topic: Topic;
  lessons: ManagedLesson[];
  calculators: ManagedCalculator[];
  canAddCalculator: boolean;
  isAdmin: boolean;
  locale: Locale;
}) {
  const { t } = useTranslation();
  const active = lessons.filter((lesson) => !lesson.archivedAt);
  const empty = lessons.length === 0 && calculators.length === 0;

  return (
    <>
      <Table.Tr bg="var(--mantine-color-gray-light)">
        <Table.Td colSpan={COLUMNS}>
          <Group justify="space-between" gap="xs">
            <Group gap="xs">
              <Anchor component={Link} to={localePath(locale, `topics/${topic.id}`)} fw={600}>
                {t(`topic.${topic.id}`)}
              </Anchor>
              {topic.contentPhase > 1 && (
                <Badge color="gray" variant="light">
                  {t("syllabus.comingSoon")}
                </Badge>
              )}
              {empty && (
                <Text size="sm" c="dimmed">
                  {t("contentAdmin.noContent")}
                </Text>
              )}
            </Group>
            <Group gap="xs">
              <Button
                component={Link}
                to={localePath(locale, `teacher/content/lessons/new?topicId=${topic.id}`)}
                size="compact-md"
                variant="light"
              >
                {t("contentAdmin.lesson.new")}
              </Button>
              {canAddCalculator && (
                <Button
                  component={Link}
                  to={localePath(locale, `teacher/content/calculators/new?topicId=${topic.id}`)}
                  size="compact-md"
                  variant="light"
                >
                  {t("contentAdmin.calculator.new")}
                </Button>
              )}
            </Group>
          </Group>
        </Table.Td>
      </Table.Tr>

      {lessons.map((lesson) => {
        const index = active.indexOf(lesson);
        return (
          <LessonRow
            key={lesson.lessonId}
            lesson={lesson}
            canUp={index > 0}
            canDown={index >= 0 && index < active.length - 1}
            isAdmin={isAdmin}
            locale={locale}
          />
        );
      })}
      {calculators.map((calculator, index) => (
        <CalculatorRow
          key={calculator.id}
          calculator={calculator}
          canUp={index > 0}
          canDown={index < calculators.length - 1}
          isAdmin={isAdmin}
          locale={locale}
        />
      ))}
    </>
  );
}

function LessonRow({
  lesson,
  canUp,
  canDown,
  isAdmin,
  locale,
}: {
  lesson: ManagedLesson;
  canUp: boolean;
  canDown: boolean;
  isAdmin: boolean;
  locale: Locale;
}) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const archived = lesson.archivedAt !== null;
  const { latest, live } = lesson;

  return (
    <Table.Tr opacity={archived ? 0.6 : 1} data-slug={lesson.slug}>
      <Table.Td>
        {!archived && <MoveButtons intent="moveLesson" target={lesson.slug} canUp={canUp} canDown={canDown} />}
      </Table.Td>
      <Table.Td>
        <Badge variant="outline">{t("contentAdmin.type.lesson")}</Badge>
      </Table.Td>
      <Table.Td>
        <Stack gap={0}>
          {latest ? (
            <Anchor component={Link} to={localePath(locale, `lessons/${lesson.slug}`)} fw={500}>
              {latest.title}
            </Anchor>
          ) : (
            <Text c="dimmed">{t("contentAdmin.lesson.noTranslation")}</Text>
          )}
          <Text size="xs" c="dimmed">
            {lesson.slug}
          </Text>
        </Stack>
      </Table.Td>
      <Table.Td>
        <Group gap={4}>
          {archived && <Badge color="gray">{t("contentAdmin.lesson.archived")}</Badge>}
          {latest && (
            <Badge variant="light" color={latest.status === "approved" ? "green" : "yellow"}>
              {t(`lessons.status.${latest.status}`)}
            </Badge>
          )}
          {latest && (
            <Text size="xs" c="dimmed">
              {t("contentAdmin.versionShort", { version: latest.version })}
            </Text>
          )}
        </Group>
      </Table.Td>
      <Table.Td>
        {live ? (
          <Stack gap={0}>
            <Text size="sm">
              {t("contentAdmin.liveShort", {
                version: live.version,
                approver: live.approvedByDeleted ? t("contentAdmin.deletedAccount") : (live.approvedByName ?? ""),
                role: live.approvedByRole ? t(`role.${live.approvedByRole}`) : "",
              })}
            </Text>
            {live.approvedAt && (
              <Text size="xs" c="dimmed">
                {formatDateTime(live.approvedAt, locale)}
              </Text>
            )}
          </Stack>
        ) : (
          <Text size="sm" c="dimmed">
            {t("contentAdmin.lesson.notLiveShort")}
          </Text>
        )}
      </Table.Td>
      <Table.Td>
        <Text size="sm">{formatDateTime(archived && lesson.archivedAt ? lesson.archivedAt : (latest?.updatedAt ?? lesson.updatedAt), locale)}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          {!archived && (
            <Button
              component={Link}
              to={localePath(locale, `teacher/content/lessons/${lesson.slug}`)}
              size="compact-md"
              variant="light"
            >
              {t("contentAdmin.edit")}
            </Button>
          )}
          {isAdmin && (
            <Form method="post" preventScrollReset>
              <input type="hidden" name="target" value={lesson.slug} />
              {archived ? (
                <Button
                  type="submit"
                  name="intent"
                  value="restoreLesson"
                  size="compact-md"
                  variant="light"
                  loading={navigation.state === "submitting"}
                >
                  {t("contentAdmin.lesson.restore")}
                </Button>
              ) : (
                <ConfirmButton
                  label={t("contentAdmin.lesson.archive")}
                  confirmLabel={t("contentAdmin.lesson.archiveConfirm")}
                  name="intent"
                  value="archiveLesson"
                  loading={navigation.state === "submitting"}
                />
              )}
            </Form>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}

function CalculatorRow({
  calculator,
  canUp,
  canDown,
  isAdmin,
  locale,
}: {
  calculator: ManagedCalculator;
  canUp: boolean;
  canDown: boolean;
  isAdmin: boolean;
  locale: Locale;
}) {
  const { t } = useTranslation();
  const navigation = useNavigation();

  return (
    <Table.Tr data-calculator={calculator.id}>
      <Table.Td>
        <MoveButtons intent="moveCalculator" target={calculator.id} canUp={canUp} canDown={canDown} />
      </Table.Td>
      <Table.Td>
        <Badge variant="outline" color="grape">
          {t("contentAdmin.type.calculator")}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Stack gap={0}>
          <Anchor component={Link} to={localePath(locale, calculator.path)} fw={500}>
            {calculator.title ?? t(`contentAdmin.calculatorIds.${calculator.id}`)}
          </Anchor>
          <Text size="xs" c="dimmed">
            {calculator.id}
          </Text>
          {calculator.title === null && (
            <Text size="xs" c="orange">
              {t("contentAdmin.calculator.noText")}
            </Text>
          )}
        </Stack>
      </Table.Td>
      <Table.Td>
        <Badge variant="light" color={calculator.published ? "green" : "gray"}>
          {calculator.published ? t("contentAdmin.calculator.published") : t("contentAdmin.calculator.hidden")}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text size="sm" c="dimmed" lineClamp={2}>
          {calculator.description}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{formatDateTime(calculator.updatedAt, locale)}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap="xs" wrap="nowrap">
          <Button
            component={Link}
            to={localePath(locale, `teacher/content/calculators/${calculator.id}`)}
            size="compact-md"
            variant="light"
          >
            {t("contentAdmin.edit")}
          </Button>
          {isAdmin && (
            <Form method="post" preventScrollReset>
              <input type="hidden" name="target" value={calculator.id} />
              <ConfirmButton
                label={t("contentAdmin.calculator.remove")}
                confirmLabel={t("contentAdmin.calculator.removeConfirm")}
                name="intent"
                value="removeCalculator"
                loading={navigation.state === "submitting"}
              />
            </Form>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}

/** Up / down buttons that post `intent` with the item and the direction. */
function MoveButtons({
  intent,
  target,
  canUp,
  canDown,
}: {
  intent: string;
  target: string;
  canUp: boolean;
  canDown: boolean;
}) {
  const { t } = useTranslation();
  const busy = useNavigation().state !== "idle";

  return (
    <Form method="post" preventScrollReset>
      <input type="hidden" name="intent" value={intent} />
      <input type="hidden" name="target" value={target} />
      <Group gap={4} wrap="nowrap">
        <ActionIcon
          type="submit"
          name="direction"
          value="up"
          variant="default"
          disabled={!canUp || busy}
          aria-label={t("contentAdmin.moveUp")}
        >
          <span aria-hidden>↑</span>
        </ActionIcon>
        <ActionIcon
          type="submit"
          name="direction"
          value="down"
          variant="default"
          disabled={!canDown || busy}
          aria-label={t("contentAdmin.moveDown")}
        >
          <span aria-hidden>↓</span>
        </ActionIcon>
      </Group>
    </Form>
  );
}
