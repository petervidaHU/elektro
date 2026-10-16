import { Alert, Anchor, Button, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Form, Link, redirect, useActionData, useNavigation, useSearchParams } from "react-router";
import { credentialsSchema, DEFAULT_LOCALE, ERROR_CODES, isLocale } from "@elektro/shared";
import { registerPath, safeReturnTo } from "../lib/return-to";
import { forwardSetCookies } from "../lib/session";
import { useLayoutData } from "../lib/use-layout-data";
import { apiUrl, forwardedHeaders } from "../lib/api";
import type { Route } from "./+types/login";

/**
 * Email + password sign-in (the only method in v1).
 *
 * The form posts to this action, which calls better-auth on the API and
 * forwards the session cookie it sets back to the browser. Afterwards the user
 * returns to `returnTo` - the page that sent them here - if it is a safe
 * in-app path.
 */
export async function action({ request, params }: Route.ActionArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const formData = await request.formData();
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errorCode: ERROR_CODES.VALIDATION_FAILED };
  }

  const response = await fetch(apiUrl("/api/auth/sign-in/email"), {
    method: "POST",
    headers: { ...forwardedHeaders(request), "content-type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (!response.ok) {
    return { errorCode: ERROR_CODES.INVALID_CREDENTIALS };
  }

  const returnTo = safeReturnTo(String(formData.get("returnTo") ?? ""), locale);
  return redirect(returnTo, { headers: forwardSetCookies(response) });
}

export default function Login() {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? "";

  return (
    <Stack gap="lg" maw={420}>
      <Title order={2}>{t("auth.login.title")}</Title>

      {actionData?.errorCode && (
        <Alert color="red" variant="light" role="alert">
          {t(`error.${actionData.errorCode}`)}
        </Alert>
      )}

      <Form method="post">
        <input type="hidden" name="returnTo" value={returnTo} />
        <Stack gap="md">
          <TextInput
            name="email"
            type="email"
            label={t("auth.login.email")}
            autoComplete="email"
            inputMode="email"
            required
          />
          <PasswordInput
            name="password"
            label={t("auth.login.password")}
            autoComplete="current-password"
            visibilityToggleButtonProps={{ "aria-label": t("auth.showPassword") }}
            required
          />
          <Button type="submit" loading={navigation.state === "submitting"} fullWidth>
            {t("auth.login.submit")}
          </Button>
        </Stack>
      </Form>

      <Text size="sm">
        {t("auth.login.noAccount")}{" "}
        <Anchor component={Link} to={registerPath(locale, returnTo)}>
          {t("auth.login.registerLink")}
        </Anchor>
      </Text>
    </Stack>
  );
}
