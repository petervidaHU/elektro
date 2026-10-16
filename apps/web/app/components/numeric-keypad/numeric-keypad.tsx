import { useId } from "react";
import { Button, SimpleGrid, Stack, TextInput } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { decimalSeparator, type Locale } from "@elektro/shared";
import { MIN_TOUCH_TARGET } from "../../theme";
import { applyKeypadKey, keyFromKeyboard, type KeypadKey } from "./keypad";

export interface NumericKeypadProps {
  /** The typed text, in the locale's notation (e.g. "2,5"). */
  value: string;
  onChange: (value: string) => void;
  locale: Locale;
  label: string;
  /** Unit shown next to the value; the student never types units. */
  unit?: string;
  /** Shown under the field, e.g. the accepted tolerance. */
  description?: string;
  allowNegative?: boolean;
  error?: string;
}

/**
 * On-screen keypad for numeric answers (docs/DEVELOPMENT_PLAN.md §2.5).
 *
 * Arbitrary values like "3,47" are slow to reach with steppers, so practice
 * answers use this: thumb-sized keys, the locale's decimal separator, and no
 * soft keyboard (`inputMode="none"`). A hardware keyboard still works on
 * desktop. Parse the text with `parseLocaleNumber` from `@elektro/shared`.
 */
export function NumericKeypad({
  value,
  onChange,
  locale,
  label,
  unit,
  description,
  allowNegative = false,
  error,
}: NumericKeypadProps) {
  const { t } = useTranslation();
  const separator = decimalSeparator(locale);
  const inputId = useId();

  const press = (key: KeypadKey) =>
    onChange(applyKeypadKey(value, key, { decimalSeparator: separator, allowNegative }));

  const keys: { key: KeypadKey; label: string; ariaLabel?: string }[] = [
    { key: "7", label: "7" },
    { key: "8", label: "8" },
    { key: "9", label: "9" },
    { key: "backspace", label: "⌫", ariaLabel: t("keypad.backspace") },
    { key: "4", label: "4" },
    { key: "5", label: "5" },
    { key: "6", label: "6" },
    { key: "clear", label: "C", ariaLabel: t("keypad.clear") },
    { key: "1", label: "1" },
    { key: "2", label: "2" },
    { key: "3", label: "3" },
    allowNegative
      ? { key: "sign", label: "±", ariaLabel: t("keypad.sign") }
      : { key: "decimal", label: separator, ariaLabel: t("keypad.decimal") },
    { key: "0", label: "0" },
    ...(allowNegative
      ? [{ key: "decimal" as const, label: separator, ariaLabel: t("keypad.decimal") }]
      : []),
  ];

  return (
    <Stack gap="xs">
      <TextInput
        id={inputId}
        label={label}
        description={description}
        error={error}
        value={value}
        readOnly
        inputMode="none"
        rightSection={unit}
        rightSectionWidth={unit ? 56 : undefined}
        onKeyDown={(event) => {
          const key = keyFromKeyboard(event.key);
          if (key) {
            event.preventDefault();
            press(key);
          }
        }}
        styles={{ input: { fontSize: "1.25rem", textAlign: "right" } }}
      />
      <SimpleGrid cols={4} spacing="xs" role="group" aria-label={t("keypad.label")}>
        {keys.map(({ key, label: keyLabel, ariaLabel }) => (
          <Button
            key={key}
            variant={/^\d$/.test(key) ? "default" : "light"}
            onClick={() => press(key)}
            aria-label={ariaLabel}
            aria-controls={inputId}
            style={{ minHeight: `calc(${MIN_TOUCH_TARGET} + 8px)`, fontSize: "1.25rem" }}
          >
            {keyLabel}
          </Button>
        ))}
      </SimpleGrid>
    </Stack>
  );
}
