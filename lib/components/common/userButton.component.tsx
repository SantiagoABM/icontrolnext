import {
  Avatar,
  Group,
  Text,
  Box,
  Menu,
  ActionIcon,
  useMantineColorScheme,
  rem,
  Flex,
  Badge,
} from "@mantine/core";
import {
  IconUser,
  IconLogout,
  IconSettings,
  IconUserCircle,
  IconChevronDown,
  IconSun,
  IconMoon,
} from "@tabler/icons-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { color_Secundario } from "@/lib/utils/constantes";
import { useCloseSesion } from "@/lib/hooks/useCloseSesion";

interface UserButtonProps {
  nombre?: string;
  perfil?: string;
  id?: string;
  img?: string;
  showLogout?: boolean;
  compact?: boolean;
}

export function UserButton({ nombre, perfil, img, id }: UserButtonProps) {
  const closeSesion = useCloseSesion();
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  // const [menuOpened, setMenuOpened] = useState(false);
  // const [errorImg, setErrorImg] = useState(false);
  const router = useRouter();

  // const handlerGoPerfil = () => {
  //   router.push(`/home/usuario/${id}`);
  // };

  return (
    <Flex gap={4} wrap="nowrap">
      {/* <Menu
        opened={menuOpened}
        onChange={setMenuOpened}
        position="bottom-end"
        arrowPosition="center"
        withArrow
        arrowSize={10}
        arrowOffset={50}
      >
        <Menu.Target>
          <Box
          p={{base: "10px 10px",md: "2px 13px"}}
            style={{
              borderRadius: rem(25),
              transition: "background-color 150ms ease",
              cursor: "pointer",
              backgroundColor: colorScheme === "dark"
                  ? "rgba(255, 255, 255, 0.09)"
                  : "rgba(0, 0, 0, 0.07)"
            }}
          >
            <Group gap="sm">
              <Avatar
                radius="xl"
                size="sm"
                src={
                  !errorImg && img
                    ? `${
                        img?.startsWith("http")
                          ? ""
                          : process.env.NEXT_PUBLIC_API_BASE
                      }${img}`
                    : undefined
                }
                onError={() => setErrorImg(true)}
                style={{
                  margin: "-5px",
                  backgroundColor: color_RojoLinea,
                  color: "white",
                }}
              >
                {(!img || errorImg) && <IconUser size="1rem" color="white" />}
              </Avatar>

              <Box visibleFrom="md" style={{ flex: 1 }}>
                  <Text size="sm" fw={500} style={{ marginBottom: "-2px" }}>
                    {nombre}
                  </Text>
                  <Text c="dimmed" size="xs" style={{ marginTop: "-1px" }}>
                    {perfil}
                  </Text>
                </Box>

              <IconChevronDown
                size={14}
                stroke={1.5}
                style={{
                  transform: menuOpened ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 150ms ease",
                }}
              />
            </Group>
          </Box>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label
            style={{ color: colorScheme === "dark" ? "white" : "black" }}
            hiddenFrom="md"
          >
            <Text  size="sm" fw={500}>
              {nombre}
            </Text>
            <Text size="xs" c="dimmed">
              {perfil}
            </Text>
          </Menu.Label>

          <Menu.Divider hiddenFrom="md" />

          <Menu.Item
            leftSection={<IconUserCircle size={16} />}
            onClick={() => handlerGoPerfil()}
          >
            Mi Perfil
          </Menu.Item>
        </Menu.Dropdown>
      </Menu> */}
      <Group gap={4} wrap="nowrap">
        {nombre && (
           <Badge variant="outline" color="green" radius="sm" fw={600} visibleFrom="sm">
              {nombre}
           </Badge>
        )}
        
        <ActionIcon
          variant="subtle"
          size="md"
          onClick={() => toggleColorScheme()}
          title={
            colorScheme === "dark"
              ? "Cambiar a modo claro"
              : "Cambiar a modo oscuro"
          }
        >
          {colorScheme === "dark" ? (
            <IconSun size={16} />
          ) : (
            <IconMoon size={16} />
          )}
        </ActionIcon>

        <ActionIcon
          variant="subtle"
          size="md"
          onClick={() => router.push('/home/perfil')}
          title="Mi Perfil"
        >
          <IconUserCircle size={18} />
        </ActionIcon>

        <ActionIcon
          variant="subtle"
          size="md"
          onClick={async () => await closeSesion()}
          title="Cerrar sesión"
        >
          <IconLogout size={18} />
        </ActionIcon>
        {/* {Entorno !== "production" && (
          <Badge
            autoContrast
            p={4}
            color={
              Entorno === "development"
                ? "#67ab25"
                : Entorno === "test"
                ? "yellow"
                : "blue"
            }
          >
            {Entorno === "development"
              ? "DEV"
              : Entorno === "test"
              ? "DEMO"
              : "PROD"}
          </Badge>
        )} */}
      </Group>
    </Flex>
  );
}
