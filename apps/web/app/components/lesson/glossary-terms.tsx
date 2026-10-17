import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { Drawer, Stack, Text, UnstyledButton } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { localePath } from "../../i18n/locale";
import { useLayoutData } from "../../lib/use-layout-data";

export interface GlossaryEntry {
  key: string;
  term: string;
  definition: string;
}

const TermsContext = createContext<{ open: (key: string) => void; known: ReadonlySet<string> }>({
  open: () => {},
  known: new Set(),
});

/**
 * Glossary terms in a lesson open in a bottom sheet (plan J5), so the reader
 * never leaves the page. A reference to a term that is not (yet) in the
 * glossary is shown as plain text.
 */
export function GlossaryProvider({ terms, children }: { terms: GlossaryEntry[]; children: ReactNode }) {
  const { t } = useTranslation();
  const { locale } = useLayoutData();
  const [openKey, setOpenKey] = useState<string | null>(null);
  const byKey = useMemo(() => new Map(terms.map((entry) => [entry.key, entry])), [terms]);
  const value = useMemo(() => ({ open: setOpenKey, known: new Set(byKey.keys()) }), [byKey]);
  const entry = openKey ? byKey.get(openKey) : undefined;

  return (
    <TermsContext.Provider value={value}>
      {children}
      <Drawer
        opened={entry !== undefined}
        onClose={() => setOpenKey(null)}
        position="bottom"
        size="auto"
        title={entry?.term}
        padding="md"
      >
        <Stack gap="sm">
          <Text data-testid="term-definition" style={{ lineHeight: 1.6 }}>
            {entry?.definition}
          </Text>
          <Text component={Link} to={localePath(locale, "glossary")} size="sm" td="underline">
            {t("glossary.toGlossary")}
          </Text>
        </Stack>
      </Drawer>
    </TermsContext.Provider>
  );
}

/** An inline `:term[label]{id=key}` reference. */
export function TermLink({ id, children }: { id: string; children: ReactNode }) {
  const { open, known } = useContext(TermsContext);
  if (!known.has(id)) {
    return <>{children}</>;
  }
  return (
    <UnstyledButton
      onClick={() => open(id)}
      data-term={id}
      style={{
        display: "inline",
        font: "inherit",
        color: "var(--mantine-primary-color-filled)",
        textDecoration: "underline dotted",
        minHeight: 24,
      }}
    >
      {children}
    </UnstyledButton>
  );
}
