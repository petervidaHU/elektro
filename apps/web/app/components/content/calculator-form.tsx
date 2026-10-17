import { useState } from "react";
import { Button, Card, Select, Stack, Switch, Textarea, TextInput } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Form, useNavigation } from "react-router";
import type { CalculatorDefinition, CalculatorId, TopicId } from "@elektro/shared";
import type { ActionFailure } from "../../lib/content-admin";
import { FormError } from "./form-error";
import { TopicSelect } from "./topic-select";

export interface CalculatorFormValues {
  id: CalculatorId | null;
  topicId: TopicId;
  published: boolean;
  title: string;
  description: string;
}

/**
 * Lists a calculator (new) or edits its registry entry. The calculator itself
 * - formula, inputs, page - is code; only these fields live in the database.
 */
export function CalculatorForm({
  initial,
  available,
  failure,
}: {
  initial: CalculatorFormValues;
  /** For a new entry: the calculators implemented in code but not listed yet. */
  available?: CalculatorDefinition[];
  failure: ActionFailure | undefined;
}) {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [id, setId] = useState<CalculatorId | null>(initial.id);
  const [topicId, setTopicId] = useState<TopicId>(initial.topicId);
  const [published, setPublished] = useState(initial.published);

  return (
    <Form method="post">
      <Stack gap="md">
        <FormError failure={failure} />
        <Card withBorder padding="md" radius="md">
          <Stack gap="md">
            {available && (
              <Select
                name="id"
                label={t("contentAdmin.field.calculator")}
                description={t("contentAdmin.field.calculatorHint")}
                data={available.map((item) => ({
                  value: item.id,
                  label: t(`contentAdmin.calculatorIds.${item.id}`),
                }))}
                value={id}
                onChange={(next) => {
                  const definition = available.find((item) => item.id === next);
                  setId(definition?.id ?? null);
                  if (definition) setTopicId(definition.defaultTopicId);
                }}
                allowDeselect={false}
                required
              />
            )}
            <TopicSelect name="topicId" value={topicId} onChange={setTopicId} />
            <TextInput name="title" label={t("contentAdmin.field.title")} defaultValue={initial.title} required />
            <Textarea
              name="description"
              label={t("contentAdmin.field.description")}
              defaultValue={initial.description}
              autosize
              minRows={2}
              size="md"
            />
            <Switch
              label={t("contentAdmin.field.published")}
              description={t("contentAdmin.field.publishedHint")}
              checked={published}
              onChange={(event) => setPublished(event.currentTarget.checked)}
              size="lg"
            />
            <input type="hidden" name="published" value={published ? "true" : "false"} />
          </Stack>
        </Card>
        <Button type="submit" loading={navigation.state === "submitting"} fullWidth disabled={available && !id}>
          {t("contentAdmin.save")}
        </Button>
      </Stack>
    </Form>
  );
}
