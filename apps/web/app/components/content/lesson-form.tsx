import { useState } from "react";
import { Alert, Button, Card, Stack, Textarea, TextInput } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Form, useNavigation } from "react-router";
import type { TopicId } from "@elektro/shared";
import type { ActionFailure } from "../../lib/content-admin";
import { FormError } from "./form-error";
import { TopicSelect } from "./topic-select";

export interface LessonFormValues {
  slug: string;
  topicId: TopicId;
  title: string;
  summary: string;
  body: string;
}

/**
 * Create / edit a lesson in the page's locale. Authoring needs typing; the
 * touch-only rule is for learning interactions. The body is the lesson
 * Markdown (plan §1.3); the API rejects unknown blocks.
 */
export function LessonForm({
  initial,
  isNew,
  isAdmin,
  failure,
}: {
  initial: LessonFormValues;
  isNew: boolean;
  isAdmin: boolean;
  failure: ActionFailure | undefined;
}) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [topicId, setTopicId] = useState<TopicId>(initial.topicId);

  return (
    <Form method="post">
      <Stack gap="md">
        <FormError failure={failure} />
        <Alert variant="light" color={isAdmin ? "green" : "blue"} role="note">
          {isAdmin ? t("contentAdmin.lesson.publishesDirectly") : t("contentAdmin.lesson.savesDraft")}
        </Alert>
        <Card withBorder padding="md" radius="md">
          <Stack gap="md">
            {isNew && (
              <TextInput
                name="slug"
                label={t("contentAdmin.field.slug")}
                description={t("contentAdmin.field.slugHint")}
                defaultValue={initial.slug}
                required
                autoCapitalize="none"
                autoCorrect="off"
              />
            )}
            <TopicSelect name="topicId" value={topicId} onChange={setTopicId} />
            <TextInput name="title" label={t("contentAdmin.field.title")} defaultValue={initial.title} required />
            <Textarea
              name="summary"
              label={t("contentAdmin.field.summary")}
              defaultValue={initial.summary}
              autosize
              minRows={2}
              size="md"
            />
            <Textarea
              name="body"
              label={t("contentAdmin.field.body")}
              description={t("contentAdmin.field.bodyHint")}
              defaultValue={initial.body}
              autosize
              minRows={12}
              maxRows={40}
              size="md"
              required
              styles={{ input: { fontFamily: "ui-monospace, monospace", fontSize: "0.9rem" } }}
            />
          </Stack>
        </Card>
        <Button type="submit" loading={navigation.state === "submitting"} fullWidth>
          {isAdmin ? t("contentAdmin.savePublish") : t("contentAdmin.saveDraft")}
        </Button>
      </Stack>
    </Form>
  );
}
