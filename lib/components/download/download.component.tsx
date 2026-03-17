"use client";

import { useEffect, useState } from "react";
import {
  Paper,
  Text,
  Title,
  Button,
  Stack,
  Grid,
  Container,
  ThemeIcon,
} from "@mantine/core";
import { IconDownload, IconDeviceMobile } from "@tabler/icons-react";

const APK_PATH = "/apk/icontrol.apk";

export default function ApkDownloadCard() {
  const [size, setSize] = useState("Calculando...");

  useEffect(() => {
    fetch(APK_PATH, { method: "HEAD" })
      .then((res) => {
        const bytes = res.headers.get("content-length");
        if (!bytes) return;
        setSize(`${(Number(bytes) / 1024 / 1024).toFixed(2)} MB`);
      })
      .catch(() => setSize("No disponible"));
  }, []);

  return (
    <Container
      size="xs"
      style={{
        minHeight: "calc(100vh - 140px)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <Paper
        radius="lg"
        p={{ base: "md", sm: "xl" }}
        shadow="xl"
        withBorder
        w="100%"
      >
        <Stack align="center" gap="md">
          <ThemeIcon size={72} radius="xl" variant="light" color="green">
            <IconDeviceMobile size={40} />
          </ThemeIcon>

          <Title order={2} ta="center">
            Control Verde
          </Title>

          <Text size="sm" c="dimmed" ta="center">
            Descarga la última versión oficial de la aplicación Android.
          </Text>

          {/* ✅ GRID RESPONSIVE REAL */}
          <Grid w="100%" mt="md">
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Info label="Versión" value="2.1.2+1" />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Info label="Compilado" value="17/03/2026" />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Info label="Peso" value={size} />
            </Grid.Col>
          </Grid>

          <Button
            component="a"
            href={APK_PATH}
            download
            size="md"
            radius="md"
            leftSection={<IconDownload size={18} />}
            color="green"
            fullWidth
            mt="md"
          >
            Descargar APK
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <Paper radius="md" p="sm" bg="gray.0">
      <Text size="xs" c="dimmed" ta="center">
        {label}
      </Text>
      <Text fw={600} ta="center">
        {value}
      </Text>
    </Paper>
  );
}
