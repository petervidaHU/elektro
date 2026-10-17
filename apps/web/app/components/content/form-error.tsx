import { Alert, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import type { ActionFailure } from "../../lib/content-admin";

/** The API's error code as a message, plus the fields it complained about. */
export function FormError({ failure }: { failure: ActionFailure | undefined }) {
  const { t } = useTranslation();
  if (!failure) {
    return null;
  }
  return (
    <Alert color="red" variant="light" role="alert">
      <Text size="sm">{t(`error.${failure.errorCode}`, { defaultValue: t("error.INTERNAL_ERROR") })}</Text>
      {failure.fields && failure.fields.length > 0 && (
        <Text size="sm" mt={4}>
          {t("contentAdmin.invalidFields", {
            fields: failure.fields
              .map((field) => t(`contentAdmin.fieldName.${field}`, { defaultValue: field }))
              .join(", "),
          })}
        </Text>
      )}
    </Alert>
  );
}
