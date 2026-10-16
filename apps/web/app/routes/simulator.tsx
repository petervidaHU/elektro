import { Alert, Stack, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";

/** Phase 4: the measurement simulator. */
export default function Simulator() {
  const { t } = useTranslation();

  return (
    <Stack gap="lg">
      <Title order={2}>{t("simulator.title")}</Title>
      <Alert variant="light">{t("simulator.comingSoon")}</Alert>
    </Stack>
  );
}
