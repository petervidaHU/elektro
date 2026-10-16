import { Alert, Anchor, Button, PasswordInput, Stack, Text, TextInput, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Form, Link, redirect, useActionData, useNavigation, useSearchParams } from "react-router";
import { DEFAULT_LOCALE, ERROR_CODES, isLocale, signUpSchema } from "@elektro/shared";
import { signUpErrorCode } from "../lib/auth-errors";
import { loginPath, safeReturnTo } from "../lib/return-to";
import { forwardSetCookies } from "../lib/session";
import { useLayoutData } from "../lib/use-layout-data";
import { apiUrl, forwardedHeaders } from "../lib/api";
import type { Route } from "./+types/register";

/**
 * Open self-registration (plan decision Q1). Every new account is a `student`:
 * better-auth does not let the client set the role.
 *
 * better-auth signs the new user in straight away; the session cookie it sets
 * is forwarded to the browser, so registering lands on the dashboard (or on
 * `returnTo`) already logged in.
 */
export async function action({ request, params }: Route.ActionArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const formData = await request.formData();
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      errorCode: ERROR_CODES.VALIDATION_FAILED,
      fields: parsed.error.issues.map((issue) => String(issue.path[0])),
    };
  }

  const response = await fetch(apiUrl("/api/auth/sign-up/email"), {
    method: "POST",
    headers: { ...forwardedHeaders(request), "content-type": "application/json" },
    body: JSON.stringify(parsed.data),
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { code?: unknown } | null;
    return { errorCode: signUpErrorCode(body, response.status), fields: [] as string[] };
  }

  const returnTo = safeReturnTo(String(formData.get("returnTo") ?? ""), locale);
  return redirect(returnTo, { headers: forwardSetCookies(response) });
}

export default function Register() {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? "";
  const invalid = (field: string) => actionData?.fields.includes(field) ?? false;

  return (
    <Stack gap="lg" maw={420}>
      <Title order={2}>{t("auth.register.title")}</Title>

      {actionData?.errorCode && (
        <Alert color="red" variant="light" role="alert">
          {t(`error.${actionData.errorCode}`)}
        </Alert>
      )}

      <Form method="post">
        <input type="hidden" name="returnTo" value={returnTo} />
        <Stack gap="md">
          <TextInput
            name="name"
            label={t("auth.register.name")}
            autoComplete="name"
            error={invalid("name")}
            required
          />
          <TextInput
            name="email"
            type="email"
            label={t("auth.register.email")}
            autoComplete="email"
            inputMode="email"
            error={invalid("email")}
            required
          />
          <PasswordInput
            name="password"
            label={t("auth.register.password")}
            description={t("auth.register.passwordHint")}
            autoComplete="new-password"
            minLength={10}
            error={invalid("password")}
            visibilityToggleButtonProps={{ "aria-label": t("auth.showPassword") }}
            required
          />

          <Alert variant="light" color="gray">
            {t("privacy.notice")}
          </Alert>

          <Button type="submit" loading={navigation.state === "submitting"} fullWidth>
            {t("auth.register.submit")}
          </Button>
        </Stack>
      </Form>

      <Text size="sm">
        {t("auth.register.haveAccount")}{" "}
        <Anchor component={Link} to={loginPath(locale, returnTo)}>
          {t("auth.register.loginLink")}
        </Anchor>
      </Text>
    </Stack>
  );
}
