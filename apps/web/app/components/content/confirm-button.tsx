import { useState } from "react";
import { Button, Group } from "@mantine/core";
import { useTranslation } from "react-i18next";

/**
 * A destructive action in two taps: the first shows "confirm / cancel", so a
 * stray touch never archives or removes anything. Submits the surrounding form
 * with `name=value` when confirmed.
 */
export function ConfirmButton({
  label,
  confirmLabel,
  name,
  value,
  loading,
}: {
  label: string;
  confirmLabel: string;
  name: string;
  value: string;
  loading?: boolean;
}) {
  const { t } = useTranslation();
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <Button variant="subtle" color="red" onClick={() => setConfirming(true)}>
        {label}
      </Button>
    );
  }
  return (
    <Group gap="xs" wrap="nowrap">
      <Button type="submit" color="red" name={name} value={value} loading={loading}>
        {confirmLabel}
      </Button>
      <Button variant="default" onClick={() => setConfirming(false)}>
        {t("contentAdmin.cancel")}
      </Button>
    </Group>
  );
}
