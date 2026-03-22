import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import {
    Group,
    MultiSelect,
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
import { ProductoFilter } from "@/lib/interfaces/filtros/productos.filters.interface";
import { getAllMarcas, getAllProveedores, getAllSubdptos } from "@/lib/actions/maestros/producto.action";
import { notifications } from "@mantine/notifications";
import { mapToSelectOptions } from "@/lib/hooks/selectMapper";

export default function ProductosFilter({
    handlerFilter = () => { },
    SetRespaldoFiltros = () => { },
}: {
    handlerFilter: (filtrosCampos: ProductoFilter) => void;
    SetRespaldoFiltros: Dispatch<SetStateAction<ProductoFilter | null>>;
}) {
    //   const hoy = new Date();
    //   hoy.setHours(0, 0, 0, 0);
    //   const fechaFormateada = hoy.toISOString().split("T")[0];
    const [opened, { toggle }] = useDisclosure(false);
    const [ean, setEAN] = useState<string | null>(null);
    const [sku, setSKU] = useState<string | null>(null);
    const [subdpto, setSubdpto] = useState<string[]>([]);
    //   const [fechaIni, setFechaIni] = useState<string | null>(fechaFormateada);
    //   const [fechaFin, setFechaFin] = useState<string | null>(fechaFormateada);
    const [costoPromedio, setcostoPromedio] = useState<number | null>(null);
    const [casePack, setCasePack] = useState<number | null>(null);
    const [descripcion, setDescripcion] = useState<string | null>(null);
    const [marca, setMarca] = useState<string[]>([]);
    const [proveedor, setProveedor] = useState<string[]>([]);

    const [subdptosOptions, setSubdptosOptions] = useState<string[]>([]);
    const [proveedoresOptions, setProveedoresOptions] = useState<string[]>([]);
    const [marcasOptions, setMarcasOptions] = useState<string[]>([]);

    const fetchFiltros = async () => {
        const [marcas, proveedores, subDptos] = await Promise.all([
            getAllMarcas(),
            getAllProveedores(),
            getAllSubdptos(),
        ]);
        if (!marcas.datos || !proveedores.datos || !subDptos.datos) {
            notifications.show({ title: "ERROR", message: "No se encontraron algunos datos iniciales" });
        }
        setMarcasOptions(marcas.datos || []);
        setProveedoresOptions(proveedores.datos || []);
        setSubdptosOptions(subDptos.datos || []);
    };
    useEffect(() => {
        fetchFiltros();
    }, []);
    const marcasSelect = mapToSelectOptions(
        marcasOptions,
        (m) => m,
        (m) => m || "No Definido"
    );

    const subDptosSelect = mapToSelectOptions(
        subdptosOptions,
        (m) => m,
        (m) => m || "No Definido"
    );
    const proveedoresSelect = mapToSelectOptions(
        proveedoresOptions,
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
                            label="Descripción"
                            placeholder="Escriba una Descripción"
                            onChange={(e) => setDescripcion(e.currentTarget.value || "")}
                            value={descripcion || ""}
                        />
                        <SimpleGrid
                            cols={{ base: 1, sm: 2, md: 2, lg: 2 }}
                        >
                            <TextInput
                                label="EAN"
                                placeholder="Digite el EAN del producto"
                                onChange={(e) => setEAN(e.currentTarget.value || "")}
                                value={ean || ""}
                            />

                            <TextInput
                                label="SKU"
                                placeholder="Digite el SKU del producto"
                                onChange={(e) => setSKU(e.currentTarget.value || "")}
                                value={sku || ""}
                            />

                        </SimpleGrid>
                        <MultiSelect
                            label="Sub Departamento"
                            placeholder="Subdepartamentos..."
                            onChange={(v) => setSubdpto(v)}
                            value={subdpto}
                            data={subDptosSelect}
                            searchable
                            clearable
                            hidePickedOptions
                            styles={{
                                input: {
                                    maxHeight: '36px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                },
                                pill: {
                                    maxWidth: '120px',
                                }
                            }}
                        />

                        <MultiSelect
                            label="Proveedor"
                            placeholder="Proveedores..."
                            onChange={(v) => setProveedor(v)}
                            value={proveedor}
                            data={proveedoresSelect}
                            searchable
                            clearable
                            hidePickedOptions
                            styles={{
                                input: {
                                    maxHeight: '36px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                },
                                pill: {
                                    maxWidth: '120px',
                                }
                            }}
                        />

                        <MultiSelect
                            label="Marca"
                            placeholder="Marcas..."
                            onChange={(v) => setMarca(v)}
                            value={marca}
                            data={marcasSelect}
                            searchable
                            clearable
                            hidePickedOptions
                            styles={{
                                input: {
                                    maxHeight: '36px',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                },
                                pill: {
                                    maxWidth: '100px',
                                }
                            }}
                        />
                        <SimpleGrid
                            cols={{ base: 1, sm: 2, md: 2, lg: 2 }}
                        >
                            <NumberInput
                                label="CasePack"
                                placeholder="Digita el CasePack"
                                hideControls
                                value={casePack ?? ""}
                                onChange={(v) => {
                                    setCasePack(v === "" ? null : Number(v));
                                }}
                            />
                            <NumberInput
                                label="Costo Promedio"
                                placeholder="Digita costo promedio"
                                hideControls
                                value={costoPromedio ?? ""}
                                onChange={(value) => {
                                    if (value === undefined || value === null || value === "") {
                                        setcostoPromedio(null);
                                    } else {
                                        setcostoPromedio(Number(value));
                                    }
                                }}
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
                                        ean: ean || null,
                                        sku: sku || null,
                                        subdpto: subdpto || null,
                                        costoPromedio: costoPromedio != null && costoPromedio >= 0 ? costoPromedio : null,
                                        casePack: casePack,
                                        descripcion: descripcion || null,
                                        marca: marca || null,
                                        proveedor: proveedor || null
                                    });

                                    SetRespaldoFiltros({
                                        ean: ean || "",
                                        sku: sku || "",
                                        subdpto: subdpto || "",
                                        costoPromedio: costoPromedio != null && costoPromedio >= 0 ? costoPromedio : null,
                                        casePack: casePack,
                                        descripcion: descripcion || "",
                                        marca: marca || "",
                                        proveedor: proveedor || ""
                                    });
                                }}
                            >
                                Filtrar
                            </Button>

                            <Button
                                variant="subtle"
                                size="sm"
                                onClick={() => {
                                    setDescripcion(null);
                                    setEAN(null);
                                    setSKU(null);
                                    setMarca([]);
                                    setProveedor([]);
                                    setSubdpto([]);
                                    setcostoPromedio(null);
                                    setCasePack(null);
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
