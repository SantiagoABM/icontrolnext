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
} from "@mantine/core";
import {
  IconArrowLeft,
  IconShoppingBag,
  IconShieldExclamation,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UnAuthoriceComponent() {
  const router = useRouter();
  const { resetData } = useTitlePageStore();

  useEffect(() => {
    resetData();
  }, []);

  return (
    <Box
      style={{
        background: "linear-gradient(135deg, #f8f9fc, #eef1f6)",
        minHeight: "100vh",
        paddingTop: "5rem",
      }}
    >
      <Container size="sm">
        <Paper
          shadow="lg"
          radius="lg"
          p="xl"
          style={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            textAlign: "center",
          }}
        >
          {/* Ícono principal */}
          <Center mb="md">
            <IconShoppingBag size={90} color="#1E90FF" />
          </Center>

          <Title
            order={1}
            style={{
              fontSize: "4.5rem",
              fontWeight: 900,
              color: "#1E1E1E",
            }}
          >
            401
          </Title>

          <Title
            order={2}
            mt="md"
            mb="sm"
            style={{ fontWeight: 700, color: "#374151" }}
          >
            Acceso no autorizado
          </Title>

          <Text size="lg" c="dimmed" maw={500} mx="auto" mb="xl">
            Parece que esta sección del centro comercial digital requiere un
            permiso especial.  
            Por favor regrese o contacte a un administrador.
          </Text>

          {/* Botones tipo mall wayfinding */}
          <Group>
            <Button
              size="md"
              variant="outline"
              color="blue"
              leftSection={<IconArrowLeft size={18} />}
              onClick={() => router.back()}
            >
              Volver atrás
            </Button>

            <Button
              size="md"
              variant="filled"
              color="blue"
              leftSection={<IconShieldExclamation size={18} />}
              onClick={() => router.push("/")}
            >
              Ir al inicio
            </Button>
          </Group>
        </Paper>
      </Container>
    </Box>
  );
}
