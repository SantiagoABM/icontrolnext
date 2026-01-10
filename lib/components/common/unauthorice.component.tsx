"use client";

import { useTitlePageStore } from "@/lib/store/useTitlePageStore";
import {
  Center,
  Container,
  Title,
  Text,
  Group,
  Button,
  Paper,
  Box,
  Divider,
} from "@mantine/core";
import {
  IconArrowLeft,
  IconLockAccess,
  IconShieldLock,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UnAuthoriceComponent() {
  const router = useRouter();
  const { resetData } = useTitlePageStore();

  useEffect(() => {
    resetData();
  }, [resetData]);

  return (
    <Box
      style={{
        background: "linear-gradient(135deg, #f4f6fb, #eef2f7)",
        minHeight: "100vh",
        paddingTop: "6rem",
      }}
    >
      <Container size="sm">
        <Paper
          shadow="lg"
          radius="lg"
          p="xl"
          withBorder
          style={{
            backgroundColor: "white",
            textAlign: "center",
          }}
        >
          {/* Ícono principal */}
          <Center mb="lg">
            <IconShieldLock size={88} />
          </Center>

          <Title
            order={1}
            style={{
              fontSize: "4.2rem",
              fontWeight: 900,
              color: "#1f2937",
            }}
          >
            401
          </Title>

          <Title
            order={3}
            mt="md"
            mb="xs"
            style={{ fontWeight: 700, color: "#374151" }}
          >
            Acceso restringido
          </Title>

          <Divider my="md" />

          <Text size="md" c="dimmed" maw={520} mx="auto">
            No cuenta con los permisos necesarios para acceder a este módulo.
            <br />
            Si considera que esto es un error, comuníquese con el administrador
            del sistema.
          </Text>

          {/* Acciones */}
          <Group justify="center" mt="xl">
            <Button
              size="md"
              variant="default"
              leftSection={<IconArrowLeft size={18} />}
              onClick={() => router.back()}
            >
              Volver
            </Button>

            <Button
              size="md"
              variant="filled"
              leftSection={<IconLockAccess size={18} />}
              onClick={() => router.push("/home")}
            >
              Ir al panel principal
            </Button>
          </Group>
        </Paper>
      </Container>
    </Box>
  );
}
