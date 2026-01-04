"use client";

import { FileInput, Text, Card } from "@mantine/core";
import { IconFileSpreadsheet } from "@tabler/icons-react";

interface FileSelectorProps {
  file: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  title?: string;
}

export default function FileSelector({
  file,
  onChange,
  accept = ".xlsx,.xls,.csv",
  title = "Seleccionar archivo",
}: FileSelectorProps) {
  const pesoArchivo = file
    ? `${(file.size / 1024).toFixed(2)} KB (${(
        file.size /
        1024 /
        1024
      ).toFixed(2)} MB)`
    : "";

  return (
    <Card withBorder radius="md" p="md">
      <Text fw={600} mb="xs">
        {title}
      </Text>

      <FileInput
        placeholder="Selecciona un archivo"
        accept={accept}
        leftSection={<IconFileSpreadsheet size={18} />}
        value={file}
        onChange={onChange}
        clearable
      />

      {file && (
        <Text size="sm" mt="xs" c="dimmed">
          📄 {file.name} — {pesoArchivo}
        </Text>
      )}
    </Card>
  );
}
