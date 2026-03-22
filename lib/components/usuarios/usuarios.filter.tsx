import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import {
    Group,
    Select,
    Checkbox,
    Stack,
    Grid,
    Paper,
    Title,
    rem,
    Flex,
    SimpleGrid,
    Collapse,
    Box,
    Button,
    ActionIcon,
    ButtonGroup,
    Divider,
    Combobox,
    TextInput,
    useCombobox,
    Typography,
    NumberInput,
} from "@mantine/core";
import {
    IconCalendar,
    IconMapPin,
    IconBuilding,
    IconUser,
    IconUsers,
    IconChevronCompactUp,
    IconChevronCompactDown,
    IconFilter,
    IconTrash,
    IconStatusChange,
    IconSalt,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { getAllMarcas, getAllProveedores, getAllSubdptos } from "@/lib/actions/maestros/producto.action";
import { notifications } from "@mantine/notifications";
import { mapToSelectOptions } from "@/lib/hooks/selectMapper";
import { getAllRoles } from "@/lib/actions/maestros/usuario.actions";
import { UsuarioFilter } from "@/lib/interfaces/filtros/usuarios.filters.interface";
import { roles } from "@/lib/utils/constantes";

const Estados = [
    {
        value: "true",
        label: "Activo",
    },
    {
        value: "false",
        label: "Inactivo",
    }
];

export default function UsuarioFilters({
    handlerFilter = () => { },
    SetRespaldoFiltros = () => { },
}: {
    handlerFilter: (filtrosCampos: UsuarioFilter) => void;
    SetRespaldoFiltros: Dispatch<SetStateAction<UsuarioFilter | null>>;
}) {
    const [opened, { toggle }] = useDisclosure(false);
    const [dni, setDni] = useState<string | null>(null);
    const [nombre, setNombre] = useState<string | null>(null);
    const [correo, setCorreo] = useState<string | null>(null);
    const [estado, setEstado] = useState<string>("true");
    const [rol, setRol] = useState<string | null>(null);

    const estadosSelect = mapToSelectOptions(
        Estados,
        (m) => m.value,
        (m) => m.label || "No Definido"
    );

    const rolesSelect = mapToSelectOptions(
        roles,
        (m) => m,
        (m) => m || "No Definido"
    );

    return (
        <Paper radius="md" mb={"md"}>
            <Group justify="space-between" align="center">
                <Title order={4} mb="xs">
                    Filtros de Búsqueda
                </Title>
                <ActionIcon onClick={toggle} variant="subtle">
                    {opened ? (
                        <IconChevronCompactUp size="1.2rem" />
                    ) : (
                        <IconChevronCompactDown size="1.2rem" />
                    )}
                </ActionIcon>
            </Group>

            <Collapse in={opened}>
                <Stack gap="lg">
                    <SimpleGrid
                        cols={{ base: 1, sm: 2, md: 3, lg: 4 }}
                        spacing="md"
                    >
                        <TextInput
                            label="Nombre"
                            placeholder="Escriba el nombre"
                            onChange={(e) => setNombre(e.currentTarget.value || null)}
                            value={nombre || ""}
                        />
                        <Select
                            label="Rol"
                            placeholder="Selecciona un Rol"
                            onChange={(e) => setRol(e || null)}
                            value={rol}
                            data={rolesSelect}
                            searchable
                            clearable
                        />
                        <SimpleGrid
                            cols={{ base: 1, sm: 2, md: 2, lg: 2 }}
                        >
                            <TextInput
                                label="DNI"
                                placeholder="Digite el Dni"
                                onChange={(e) => setDni(e.currentTarget.value || null)}
                                value={dni || ""}
                            />

                            <Select
                                label="Estado"
                                placeholder="Selecciona un Estado"
                                onChange={(e) => setEstado(e || "true")}
                                value={estado}
                                data={estadosSelect}
                                searchable
                            />

                        </SimpleGrid>
                        {/* BOTONES EN UNA FILA CON RESPONSIVE */}
                        <Flex
                            gap="sm"
                            align="flex-end"
                            direction={{ base: "column", sm: "row" }}
                            mt={26}
                        >
                            <Button
                                variant="filled"
                                size="sm"
                                leftSection={<IconFilter size="1rem" />}
                                onClick={() => {
                                    handlerFilter({
                                        dni: dni || null,
                                        activo: estado == "true" ? true : false,
                                        correo: correo || null,
                                        nombre: nombre || null,
                                        rol: rol || null
                                    });

                                    SetRespaldoFiltros({
                                        dni: dni || null,
                                        activo: estado == "true" ? true : false,
                                        correo: correo || null,
                                        nombre: nombre || null,
                                        rol: rol || null
                                    });
                                }}
                            >
                                Filtrar
                            </Button>

                            <Button
                                variant="subtle"
                                size="sm"
                                onClick={() => {
                                    setDni(null);
                                    setCorreo(null);
                                    setNombre(null);
                                    setRol(null);
                                    setEstado("true");
                                }}
                            >
                                <IconTrash size="1.4rem" />
                            </Button>
                        </Flex>
                    </SimpleGrid>
                </Stack>
            </Collapse>

            <Divider mt={10}></Divider>
        </Paper>
    );
}
