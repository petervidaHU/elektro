import { Skeleton, Stack } from "@mantine/core";
import { useTranslation } from "react-i18next";

/** A page-shaped placeholder shown while the next page loads (plan §3.5). */
export function PageSkeleton() {
  const { t } = useTranslation();
  return (
    <Stack gap="md" maw={720} aria-busy="true" aria-label={t("feedback.loading")} role="status">
      <Skeleton height={32} width="55%" radius="md" />
      <Skeleton height={16} width="80%" radius="md" />
      {[0, 1, 2].map((item) => (
        <Skeleton key={item} height={84} radius="md" />
      ))}
    </Stack>
  );
}
