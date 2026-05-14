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
  Accordion,
  List,
} from "@mantine/core";
import { IconDownload, IconDeviceMobile, IconNotes } from "@tabler/icons-react";

const APK_PATH = "/apk/IControl_2_4_0.apk";

export default function ApkDownloadCard() {

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
            IControl
          </Title>

          <Text size="sm" c="dimmed" ta="center">
            Descarga la última versión oficial de la aplicación Android.
          </Text>

          {/* ✅ GRID RESPONSIVE REAL */}
          <Grid w="100%" mt="md">
            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Info label="Versión" value="2.2.1+2" />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Info label="Compilado" value="29/03/2026" />
            </Grid.Col>

            <Grid.Col span={{ base: 12, sm: 4 }}>
              <Info label="Peso" value="81.2" />
            </Grid.Col>
          </Grid>
          
          <Accordion variant="separated" w="100%">
            <Accordion.Item value="release-notes">
              <Accordion.Control icon={<IconNotes size={18} color="green" />}>
                <Text size="sm" fw={500}>Notas de versión (2.4.0+3)</Text>
              </Accordion.Control>
              <Accordion.Panel>
                <List size="sm" spacing="xs">
                  <List.Item>Se agregó un selector de obserbación al agregar un nuevo producto para donación.</List.Item>
                  <List.Item>Nuevo módulo inventario pgc versión Beta(Por testear).</List.Item>
                </List>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>

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
