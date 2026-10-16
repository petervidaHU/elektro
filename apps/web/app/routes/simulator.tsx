import { Alert, Stack, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { DEFAULT_LOCALE, isLocale } from "@elektro/shared";
import { requireUser } from "../lib/session";
import type { Route } from "./+types/simulator";

/** Login only (plan §3.3): guests are sent to log in and brought back. */
export async function loader({ request, params }: Route.LoaderArgs) {
  await requireUser(request, isLocale(params.locale) ? params.locale : DEFAULT_LOCALE);
  return null;
}

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
