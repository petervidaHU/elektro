import { Select } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { MODULES, topicsByModule, type TopicId } from "@elektro/shared";

/** Topic picker grouped by module, in syllabus order; posts `name`. */
export function TopicSelect({
  name,
  value,
  onChange,
}: {
  name: string;
  value: TopicId;
  onChange: (topicId: TopicId) => void;
}) {
  const { t } = useTranslation();
  const data = MODULES.map((module) => ({
    group: t(`module.${module}`),
    items: topicsByModule(module).map((topic) => ({ value: topic.id, label: t(`topic.${topic.id}`) })),
  })).filter((group) => group.items.length > 0);

  return (
    <Select
      name={name}
      label={t("contentAdmin.field.topic")}
      data={data}
      value={value}
      onChange={(next) => next && onChange(next as TopicId)}
      allowDeselect={false}
      searchable
      required
    />
  );
}
