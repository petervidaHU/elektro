import { useMemo, useState } from "react";
import { Badge, Button, Card, Group, Stack, Text, TextInput, Title } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router";
import { DEFAULT_LOCALE, glossaryLetter, isLocale, type ContentStatus } from "@elektro/shared";
import { apiFetch } from "../lib/api";
import type { Route } from "./+types/glossary";

interface Term {
  key: string;
  term: string;
  definition: string;
  status: ContentStatus;
}

/** Glossary (fogalomtár, plan §3.3 `/glossary`): public, searchable, with an alphabetic index. */
export async function loader({ request, params }: Route.LoaderArgs) {
  const locale = isLocale(params.locale) ? params.locale : DEFAULT_LOCALE;
  const { terms } = await apiFetch<{ terms: Term[] }>(request, `/api/glossary?locale=${locale}`);
  return { terms };
}

export default function GlossaryPage() {
  const { t } = useTranslation();
  const { terms } = useLoaderData<typeof loader>();
  const [letter, setLetter] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const letters = useMemo(() => [...new Set(terms.map((entry) => glossaryLetter(entry.term)))], [terms]);
  const needle = query.trim().toLocaleLowerCase();
  const shown = terms.filter(
    (entry) =>
      (letter === null || glossaryLetter(entry.term) === letter) &&
      (needle === "" || entry.term.toLocaleLowerCase().includes(needle) || entry.definition.toLocaleLowerCase().includes(needle)),
  );

  return (
    <Stack gap="md" maw={720}>
      <Title order={2}>{t("glossary.title")}</Title>

      {terms.length === 0 ? (
        <Text c="dimmed" data-testid="glossary-empty">{t("glossary.empty")}</Text>
      ) : (
        <>
          <TextInput
            type="search"
            aria-label={t("glossary.search")}
            placeholder={t("glossary.search")}
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
          <Group gap={6} role="group" aria-label={t("glossary.index")}>
            <Button size="compact-md" miw={44} mih={44} variant={letter === null ? "filled" : "light"} onClick={() => setLetter(null)}>
              {t("glossary.all")}
            </Button>
            {letters.map((item) => (
              <Button
                key={item}
                size="compact-md"
                miw={44}
                mih={44}
                variant={letter === item ? "filled" : "light"}
                aria-pressed={letter === item}
                onClick={() => setLetter(item)}
              >
                {item}
              </Button>
            ))}
          </Group>

          {shown.length === 0 && <Text c="dimmed">{t("glossary.noMatch")}</Text>}
          {shown.map((entry) => (
            <Card key={entry.key} withBorder padding="md" radius="md" id={`term-${entry.key}`} data-term-key={entry.key}>
              <Group justify="space-between" wrap="nowrap" align="flex-start">
                <Text fw={600}>{entry.term}</Text>
                {entry.status !== "approved" && (
                  <Badge variant="light" color="yellow">{t(`lessons.status.${entry.status}`)}</Badge>
                )}
              </Group>
              <Text size="sm" mt={4} style={{ lineHeight: 1.6 }}>{entry.definition}</Text>
            </Card>
          ))}
        </>
      )}
    </Stack>
  );
}
