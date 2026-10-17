import { useEffect, useState } from "react";
import { Alert, Button, Drawer, Select, Stack, Textarea } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link, useFetcher, useLocation } from "react-router";
import { REPORT_CATEGORIES, type ReportTargetKind } from "@elektro/shared";
import { localePath } from "../../i18n/locale";
import { loginPath } from "../../lib/return-to";
import { useLayoutData } from "../../lib/use-layout-data";
import { useToast } from "../feedback/toast";
import type { action } from "../../routes/report";

interface ReportButtonProps {
  targetKind: ReportTargetKind;
  /** Lesson slug, calculator id or practice template id. */
  targetId: string;
  targetVersion?: number;
}

/**
 * "Hibát találtam" (plan J9): a button that opens a bottom sheet with a
 * category and an optional note. Guests are sent to the login page; the API
 * stores the report and the toast thanks the reader.
 */
export function ReportButton({ targetKind, targetId, targetVersion }: ReportButtonProps) {
  const { t } = useTranslation();
  const { locale, user } = useLayoutData();
  const { pathname } = useLocation();
  const fetcher = useFetcher<typeof action>();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [seen, setSeen] = useState(fetcher.data);

  // A new answer from the API: close the sheet when the report was stored.
  if (fetcher.data !== seen) {
    setSeen(fetcher.data);
    if (fetcher.data?.ok) {
      setOpen(false);
      setCategory(null);
    }
  }

  useEffect(() => {
    if (fetcher.data?.ok) {
      toast(t("report.thanks"));
    }
  }, [fetcher.data, toast, t]);

  if (!user) {
    return (
      <Button
        component={Link}
        to={loginPath(locale, pathname)}
        variant="subtle"
        size="xs"
        c="dimmed"
      >
        {t("report.button")}
      </Button>
    );
  }

  const failure = fetcher.data && !fetcher.data.ok ? fetcher.data.errorCode : null;

  return (
    <>
      <Button variant="subtle" size="xs" c="dimmed" onClick={() => setOpen(true)} data-testid="report-open">
        {t("report.button")}
      </Button>
      <Drawer
        opened={open}
        onClose={() => setOpen(false)}
        position="bottom"
        size="auto"
        title={t("report.title")}
        padding="md"
      >
        <fetcher.Form method="post" action={localePath(locale, "report")}>
          <input type="hidden" name="targetKind" value={targetKind} />
          <input type="hidden" name="targetId" value={targetId} />
          {targetVersion !== undefined && <input type="hidden" name="targetVersion" value={targetVersion} />}
          <Stack gap="sm">
            {failure && (
              <Alert color="red" variant="light" role="alert">
                {t(`error.${failure}`)}
              </Alert>
            )}
            <Select
              name="category"
              label={t("report.category")}
              required
              allowDeselect={false}
              data={REPORT_CATEGORIES.map((value) => ({ value, label: t(`report.categories.${value}`) }))}
              value={category}
              onChange={setCategory}
              comboboxProps={{ withinPortal: true }}
            />
            <Textarea name="note" label={t("report.note")} maxLength={1000} autosize minRows={2} />
            <Button type="submit" disabled={category === null} loading={fetcher.state !== "idle"}>
              {t("report.send")}
            </Button>
          </Stack>
        </fetcher.Form>
      </Drawer>
    </>
  );
}
