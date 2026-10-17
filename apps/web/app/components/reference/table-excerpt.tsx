import { Alert, Table, Text } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { excerptRows, formatNumber, type Locale, type ReferenceTableContent, type TableCell } from "@elektro/shared";

/**
 * "Kivonat a táblázatból" (plan §2.3): the rows a task needs, with the source
 * always shown underneath. Students only ever get verified tables; teachers
 * see unverified ones with a warning.
 */
export function TableExcerpt({
  table,
  source,
  locale,
  rowIndexes,
  unverified = false,
}: {
  table: ReferenceTableContent;
  source: string;
  locale: Locale;
  /** The rows to show; the whole table when omitted (teacher view). */
  rowIndexes?: readonly number[];
  unverified?: boolean;
}) {
  const { t } = useTranslation();
  const shown = rowIndexes ? excerptRows(table, rowIndexes) : table;
  const format = (cell: TableCell) =>
    typeof cell === "number" ? formatNumber(cell, locale, { maximumSignificantDigits: 6, useGrouping: false }) : cell;

  return (
    <div data-testid="table-excerpt">
      {unverified && (
        <Alert color="orange" variant="light" mb="xs" data-testid="unverified-banner">
          {t("referenceTables.unverifiedBanner")}
        </Alert>
      )}
      <Table.ScrollContainer minWidth={240}>
        <Table withTableBorder withColumnBorders>
          <Table.Thead>
            <Table.Tr>
              {shown.columns.map((column) => (
                <Table.Th key={column.id}>
                  {column.label}
                  {column.unit ? ` (${t(`unit.${column.unit}`)})` : ""}
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {shown.rows.map((row, index) => (
              <Table.Tr key={index}>
                {row.map((cell, k) => (
                  <Table.Td key={k}>{format(cell)}</Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
      <Text size="xs" c="dimmed" mt={4}>
        {t("referenceTables.source", { source })}
      </Text>
    </div>
  );
}
