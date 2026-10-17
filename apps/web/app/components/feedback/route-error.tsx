import { Button, Group, Stack, Text, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { isRouteErrorResponse, Link, useLocation, useRevalidator } from "react-router";
import { ERROR_CODES } from "@elektro/shared";
import { localeFromPathname, localePath } from "../../i18n/locale";
import { ApiError } from "../../lib/api";

/** The error code to show for whatever a loader or action threw. */
export function errorCodeOf(error: unknown): string {
  if (error instanceof ApiError) return error.body.code;
  if (isRouteErrorResponse(error)) {
    if (error.status === 404) return ERROR_CODES.NOT_FOUND;
    if (error.status === 403) return ERROR_CODES.FORBIDDEN;
    if (error.status === 401) return ERROR_CODES.UNAUTHENTICATED;
  }
  return ERROR_CODES.INTERNAL_ERROR;
}

/**
 * Route-level error boundary (plan §3.5): the error as a translated message,
 * a retry and a way home, inside the app frame.
 */
export function RouteErrorBoundary({ error }: { error: unknown }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const revalidator = useRevalidator();
  const locale = localeFromPathname(pathname);
  const code = errorCodeOf(error);

  return (
    <Stack gap="md" maw={560} role="alert">
      <Title order={2}>{t("feedback.errorTitle")}</Title>
      <Text>{t(`error.${code}`, { defaultValue: t("error.INTERNAL_ERROR") })}</Text>
      <Group>
        <Button onClick={() => revalidator.revalidate()} loading={revalidator.state === "loading"}>
          {t("feedback.retry")}
        </Button>
        <Button component={Link} to={localePath(locale)} variant="default">
          {t("error.backHome")}
        </Button>
      </Group>
    </Stack>
  );
}
