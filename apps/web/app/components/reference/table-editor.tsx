import { useState } from "react";
import { ActionIcon, Button, Group, Select, Stack, Text, TextInput } from "@mantine/core";
import { useTranslation } from "react-i18next";
import { UNITS, type TableCell } from "@elektro/shared";
import { rowsFromText, textToRows } from "../../lib/reference-table-form";

export interface EditorColumn {
  id: string;
  label: string;
  unit?: string;
}

export interface TableEditorValue {
  columns: EditorColumn[];
  rows: TableCell[][];
}

/**
 * Grid editor for a reference table (teacher area: authoring may need typing).
 * Column ids are generated from the position, so a teacher only types labels,
 * units and cells. The grid is sent as one hidden JSON field named `content`.
 */
export function TableEditor({ initial }: { initial: TableEditorValue }) {
  const { t } = useTranslation();
  const [columns, setColumns] = useState<EditorColumn[]>(initial.columns);
  const [rows, setRows] = useState<string[][]>(textToRows(initial.rows));

  const nextId = () => {
    let n = columns.length + 1;
    while (columns.some((column) => column.id === `c${n}`)) n++;
    return `c${n}`;
  };
  const setColumn = (index: number, change: Partial<EditorColumn>) =>
    setColumns((current) => current.map((c, k) => (k === index ? { ...c, ...change } : c)));
  const setCell = (row: number, col: number, value: string) =>
    setRows((current) => current.map((r, i) => (i === row ? r.map((c, k) => (k === col ? value : c)) : r)));

  const content = JSON.stringify({
    columns: columns.map((column) => ({ id: column.id, label: column.label, ...(column.unit ? { unit: column.unit } : {}) })),
    rows: rowsFromText(rows),
  });

  return (
    <Stack gap="md">
      <input type="hidden" name="content" value={content} />

      {columns.map((column, index) => (
        <Group key={column.id} align="flex-end" wrap="nowrap" data-column-index={index}>
          <TextInput
            style={{ flex: 1 }}
            label={t("referenceTables.editor.columnLabel", { n: index + 1 })}
            value={column.label}
            onChange={(event) => setColumn(index, { label: event.currentTarget.value })}
          />
          <Select
            style={{ width: 130 }}
            label={t("referenceTables.editor.unit")}
            value={column.unit ?? null}
            clearable
            onChange={(value) => setColumn(index, { unit: value ?? undefined })}
            data={UNITS.filter((unit) => unit !== "dimensionless").map((unit) => ({ value: unit, label: t(`unit.${unit}`) }))}
          />
          {columns.length > 1 && (
            <ActionIcon
              size={44}
              variant="subtle"
              color="red"
              aria-label={t("referenceTables.editor.removeColumn", { n: index + 1 })}
              onClick={() => {
                setColumns((current) => current.filter((_c, k) => k !== index));
                setRows((current) => current.map((r) => r.filter((_c, k) => k !== index)));
              }}
            >
              ✕
            </ActionIcon>
          )}
        </Group>
      ))}
      <Button
        variant="light"
        onClick={() => {
          setColumns((current) => [...current, { id: nextId(), label: "" }]);
          setRows((current) => current.map((r) => [...r, ""]));
        }}
      >
        {t("referenceTables.editor.addColumn")}
      </Button>

      <Text fw={600}>{t("referenceTables.editor.rows")}</Text>
      {rows.map((row, rowIndex) => (
        <Group key={rowIndex} align="flex-end" wrap="nowrap" data-row-index={rowIndex}>
          {row.map((cell, colIndex) => (
            <TextInput
              key={colIndex}
              style={{ flex: 1, minWidth: 0 }}
              aria-label={t("referenceTables.editor.cell", { row: rowIndex + 1, column: columns[colIndex]?.label || colIndex + 1 })}
              value={cell}
              onChange={(event) => setCell(rowIndex, colIndex, event.currentTarget.value)}
            />
          ))}
          {rows.length > 1 && (
            <ActionIcon
              size={44}
              variant="subtle"
              color="red"
              aria-label={t("referenceTables.editor.removeRow", { n: rowIndex + 1 })}
              onClick={() => setRows((current) => current.filter((_r, i) => i !== rowIndex))}
            >
              ✕
            </ActionIcon>
          )}
        </Group>
      ))}
      <Button variant="light" onClick={() => setRows((current) => [...current, columns.map(() => "")])}>
        {t("referenceTables.editor.addRow")}
      </Button>
    </Stack>
  );
}
