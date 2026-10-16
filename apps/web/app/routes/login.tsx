import { Alert, Button, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Form, redirect, useActionData, useNavigation } from "react-router";
import { credentialsSchema, DEFAULT_LOCALE, ERROR_CODES, isLocale } from "@elektro/shared";
import { localePath } from "../i18n/locale";
import type { Route } from "./+types/login";

/**
 * Email + password sign-in (the only method in v1).
 *
 * The form posts to this action, which calls better-auth on the API and
 * forwards the session cookie it sets back to the browser.
 */
export async function action({ request, params }: Route.ActionArgs) {
  const formData = await request.formData();
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errorCode: ERROR_CODES.VALIDATION_FAILED };
  }

  const response = await fetch(new URL("/api/auth/sign-in/email", request.url), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (!response.ok) {
    return { errorCode: ERROR_CODES.INVALID_CREDENTIALS };
  }

  const headers = new Headers();
  for (const cookie of response.headers.getSetCookie()) {
    headers.append("set-cookie", cookie);
  }

  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;

  return redirect(localePath(locale), { headers });
}

export default function Login() {
  const { t } = useTranslation();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  return (
    <Stack gap="lg" maw={420}>
      <Title order={2}>{t("auth.login.title")}</Title>

      {actionData?.errorCode && (
        <Alert color="red" variant="light">
          {t(`error.${actionData.errorCode}`)}
        </Alert>
      )}

      <Form method="post">
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
            required
          />
          <Button type="submit" loading={navigation.state === "submitting"} fullWidth>
            {t("auth.login.submit")}
          </Button>
        </Stack>
      </Form>

      <Text size="sm" c="dimmed">
        {t("auth.login.noAccountNote")}
      </Text>
    </Stack>
  );
}
