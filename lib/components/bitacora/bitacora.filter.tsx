import React, { useState, Dispatch, SetStateAction } from "react";
import {
    Group,
    Select,
    Stack,
    Paper,
    Title,
    Flex,
    SimpleGrid,
    Collapse,
    Button,
    ActionIcon,
    Divider,
    TextInput,
} from "@mantine/core";
import {
    IconChevronCompactUp,
    IconChevronCompactDown,
    IconFilter,
    IconTrash,
    IconCalendar,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { mapToSelectOptions } from "@/lib/hooks/selectMapper";
import { BitacoraFilter } from "@/lib/interfaces/maestros/bitacora.interface";

const Tipos = [
    {
        value: "AUTH",
        label: "Sesiones",
    },
    {
        value: "REPORTES",
        label: "Gestión de Reportes",
    },
    {
        value: "USUARIOS",
        label: "Gestión de Usuarios",
    },
    {
        value: "PRODUCTOS",
        label: "Gestión de Productos",
    },
];

export default function BitacoraFilters({
    handlerFilter = () => { },
    SetRespaldoFiltros = () => { },
}: {
    handlerFilter: (filtrosCampos: BitacoraFilter) => void;
    SetRespaldoFiltros: Dispatch<SetStateAction<BitacoraFilter | null>>;
}) {
    const [opened, { toggle }] = useDisclosure(false);
    const [dni, setDni] = useState<string | null>(null);
    const [tipo, setTipo] = useState<string | null>(null);
    const [desde, setDesde] = useState<Date | null>(null);
    const [hasta, setHasta] = useState<Date | null>(null);

    const tiposSelect = mapToSelectOptions(
        Tipos,
        (m) => m.value,
        (m) => m.label || "No Definido"
    );

    // Función para formatear fecha a YYYY-MM-DD
    const formatearFecha = (fecha: Date | null): string | null => {
        if (!fecha) return null;
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Handlers tipados explícitamente
    const handleDesdeChange = (value: Date | null) => {
        setDesde(value);
    };

    const handleHastaChange = (value: Date | null) => {
        setHasta(value);
    };

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
                        {/* <TextInput
                            label="DNI"
                            placeholder="Digite el DNI"
                            onChange={(e) => setDni(e.currentTarget.value)}
                            value={dni || ""}
                        /> */}
                        <Select
                            label="Tipo"
                            placeholder="Selecciona un tipo"
                            onChange={(e) => setTipo(e || null)}
                            value={tipo}
                            data={tiposSelect}
                            clearable
                            searchable
                        />
                        {/* <DatePickerInput
                            label="Desde"
                            placeholder="Selecciona fecha de inicio"
                            value={desde}
                            onChange={handleDesdeChange}
                            leftSection={<IconCalendar size="1rem" />}
                            clearable
                            valueFormat="DD/MM/YYYY"
                        />
                        <DatePickerInput
                            label="Hasta"
                            placeholder="Selecciona fecha de fin"
                            value={hasta}
                            onChange={handleHastaChange}
                            leftSection={<IconCalendar size="1rem" />}
                            clearable
                            valueFormat="DD/MM/YYYY"
                            minDate={desde || undefined}
                        /> */}

                        {/* BOTONES EN UNA FILA CON RESPONSIVE */}
                        <Flex
                            gap="sm"
                            align="flex-end"
                            direction={{ base: "column", sm: "row" }}
                            mt={10}
                        >
                            <Button
                                variant="filled"
                                size="small"
                                leftSection={<IconFilter size="1rem" />}
                                onClick={() => {
                                    const filtros: BitacoraFilter = {
                                        dni: dni || null,
                                        tipo: tipo || null,
                                        desde: formatearFecha(desde) || null,
                                        hasta: formatearFecha(hasta) || null,
                                    };

                                    handlerFilter(filtros);
                                    SetRespaldoFiltros(filtros);
                                }}
                            >
                                Filtrar
                            </Button>

                            <Button
                                variant="subtle"
                                size="small"
                                onClick={() => {
                                    setDni("");
                                    setTipo("REPORTES");
                                    setDesde(null);
                                    setHasta(null);
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