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
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { mapToSelectOptions } from "@/lib/hooks/selectMapper";
import { ReporteFilter } from "@/lib/interfaces/filtros/reportes.filters.interface";

const Estados = [
    {
        value: "true",
        label: "Activo",
    },
    {
        value: "false",
        label: "Finalizado",
    }
];
const Motivos = [
    {
        value: "D",
        label: "Donación",
    },
    {
        value: "T",
        label: "Reporte Tim",
    }
];
export default function ReporteFilters({
    handlerFilter = () => { },
    SetRespaldoFiltros = () => { },
}: {
    handlerFilter: (filtrosCampos: ReporteFilter) => void;
    SetRespaldoFiltros: Dispatch<SetStateAction<ReporteFilter | null>>;
}) {
    const [opened, { toggle }] = useDisclosure(false);
    const [nroReporte, setNroReporte] = useState<string | null>(null);
    const [motivo, setMotivo] = useState<string>("T");
    const [estado, setEstado] = useState<string>("true");

    const estadosSelect = mapToSelectOptions(
        Estados,
        (m) => m.value,
        (m) => m.label || "No Definido"
    );

    const motivosSelect = mapToSelectOptions(
        Motivos,
        (m) => m.value,
        (m) => m.label || "No Definido"
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
                            label="#Reporte"
                            placeholder="Digite el Nro del Reporte"
                            onChange={(e) => setNroReporte(e.currentTarget.value || null)}
                            value={nroReporte || ""}
                        />
                        <Select
                            label="Motivo"
                            placeholder="Selecciona un motivo"
                            onChange={(e) => setMotivo(e || "D")}
                            value={motivo}
                            data={motivosSelect}
                            searchable
                        />

                        <Select
                            label="Estado"
                            placeholder="Selecciona un Estado"
                            onChange={(e) => setEstado(e || "true")}
                            value={estado}
                            data={estadosSelect}
                            searchable
                        />

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
                                    handlerFilter({
                                        tim: nroReporte || null,
                                        motivo: motivo,
                                        estado: estado == "true" ? true : false,
                                    });

                                    SetRespaldoFiltros({
                                        tim: nroReporte || null,
                                        motivo: motivo,
                                        estado: estado == "true" ? true : false,
                                    });
                                }}
                            >
                                Filtrar
                            </Button>

                            <Button
                                variant="subtle"
                                size="small"
                                onClick={() => {
                                    setNroReporte(null);
                                    setMotivo("T");
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
