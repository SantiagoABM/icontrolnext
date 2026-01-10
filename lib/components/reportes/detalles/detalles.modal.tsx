import React, { useEffect, useMemo, useState } from "react";
import { Select, Flex, Text, Badge, Tooltip, ActionIcon } from "@mantine/core";
import ModalCustomComponent, { TitleHead } from "../../common/modalCustom.component";
import { Detalle, Reporte } from "@/lib/interfaces/maestros/reportes.interface";
import ResponsiveDataTable, { Column } from "../../common/responsiveTable.component";
import { getDetalleReporteByTim } from "@/lib/actions/maestros/detalle.action";
import { CATEGORIAS_MACRO, SUBDEPARTAMENTOS } from "@/lib/utils/constantes";
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    Table,
    TableRow,
    TableCell,
    WidthType,
    AlignmentType,
    TableLayoutType,
    VerticalAlign
} from "docx";
import { saveAs } from "file-saver";
import { useLoadingStore } from "@/lib/store/useLoadingStore";
import { formatDate } from "@/lib/hooks/helpers";
import { IconFile, IconRefresh } from "@tabler/icons-react";


export interface DetallesModalProps {
    opened?: boolean;
    onClose?: () => void;
    initialData?: Partial<Reporte> | null;
}

const DetallesModal: React.FC<DetallesModalProps> = ({
    opened = false,
    onClose = () => { },
    initialData = null,
}) => {
    /* ===================== DATA ===================== */
    const [rowsOriginales, setRowsOriginales] = useState<Detalle[]>([]);
    const { show, hide } = useLoadingStore();

    /* ===================== FILTROS ===================== */
    const [selectedDepartamento, setSelectedDepartamento] = useState<string | null>(null);
    const [selectedSubDpto, setSelectedSubDpto] = useState<string | null>(null);
    const [selectedSubDptoMS, setSelectedSubDptoMS] = useState<string | null>(null);

    /* ===================== CARGA ÚNICA ===================== */
    useEffect(() => {
        if (!opened || !initialData?.tim) return;
        const cargar = async () => {
            show();
            const resp = await getDetalleReporteByTim(initialData.tim!);
            console.log("Detalles cargados:", resp);
            setRowsOriginales(resp?.datos ?? []);
            limpiarFiltros();
            hide();
        };

        cargar();
    }, [opened, initialData?.tim]);
    const recargarDatos = async () => {
        if (!initialData?.tim) return;

        show();
        try {
            const resp = await getDetalleReporteByTim(initialData.tim);
            setRowsOriginales(resp?.datos ?? []);
            // 👉 si quieres conservar filtros, NO llames limpiarFiltros()
            // limpiarFiltros();
        } finally {
            hide();
        }
    };

    const columns: Column<Detalle>[] = [
        {
            field: "sku",
            headerName: "SKU",
            align: "left",
            sortable: true
        },
        {
            field: "olpn",
            headerName: "#OLPN",
            align: "left",
            sortable: true,
            renderCell: (_, row: Detalle) => {
                return (
                    <>{row.tim}/{row.olpn}</>
                );
            }
        },
        {
            field: "subdpto",
            headerName: "Sub Departamento",
            align: "left",
            sortable: true,
        },
        {
            field: "descripcion",
            headerName: "Descripción",
            align: "left",
            sortable: true,
        },
        {
            field: "marcaSensible",
            headerName: "Sensible Central",
            align: "center",
            sortable: true,
            renderCell: (_, row: Detalle) => {
                return (
                    <Badge color={row.marcaSensible ? "blue" : "red"} variant="filled">
                        {row.marcaSensible ? "Sí" : "No"}
                    </Badge>
                );

            }
        },
        {
            field: "isContable",
            headerName: "Sensible Tienda",
            align: "center",
            sortable: true,
            renderCell: (_, row: Detalle) => {
                return (
                    <Badge color={row.isContable ? "green" : "red"} variant="filled">
                        {row.isContable ? "Sí" : "No"}
                    </Badge>
                );

            }
        },
        {
            field: "casePack",
            headerName: "Case Pack",
            align: "left",
            sortable: true,
        },
        {
            field: "uEnviadas",
            headerName: "Unidades Enviadas",
            align: "left",
            sortable: true,
        },
        {
            field: "cajas",
            headerName: "Cajas Enviadas",
            align: "left",
            sortable: true,
            renderCell: (_, row: Detalle) => {
                return (
                    <>
                        {row.casePack > 0
                            ? (() => {
                                const valor = row.uEnviadas / row.casePack;
                                return Number.isInteger(valor) ? valor : valor.toFixed(2);
                            })()
                            : 0}
                    </>
                );

            }
        },
        {
            field: "uRecibidas",
            headerName: "Unidades Recibidas",
            align: "left",
            sortable: true,
        },
        {
            field: "modificadoPor",
            headerName: "Verificado Por",
            align: "left",
            sortable: true,
        },

    ];
    /* ===================== SUBDPTOS ===================== */
    const subDptos = useMemo(
        () =>
            Array.from(
                new Set(
                    rowsOriginales
                        .map((d) => d.subdpto)
                        .filter((s): s is string => !!s)
                )
            ),
        [rowsOriginales]
    );

    const subDptosMS = useMemo(
        () =>
            Array.from(
                new Set(
                    rowsOriginales
                        .filter((d) => d.marcaSensible)
                        .map((d) => d.subdpto)
                        .filter((s): s is string => !!s)
                )
            ),
        [rowsOriginales]
    );

    /* ===================== FILTRO LOCAL ===================== */
    const rowsFiltrados = useMemo(() => {
        let data = [...rowsOriginales];

        // 🟢 MERCADERÍA SENSIBLE
        if (selectedSubDptoMS) {
            data = data.filter((d) => d.marcaSensible === true);

            if (selectedSubDptoMS !== "TODOS") {
                data = data.filter((d) => d.subdpto === selectedSubDptoMS);
            }
        }
        // 🟡 DEPARTAMENTO / SUBDEPTO
        else {
            if (selectedDepartamento) {
                data = data.filter((d) =>
                    d.subdpto?.startsWith(selectedDepartamento)
                );
            }

            if (selectedSubDpto) {
                data = data.filter((d) => d.subdpto === selectedSubDpto);
            }
        }

        return data;
    }, [rowsOriginales, selectedDepartamento, selectedSubDpto, selectedSubDptoMS]);

    /* ===================== HELPERS ===================== */
    const limpiarFiltros = () => {
        setSelectedDepartamento(null);
        setSelectedSubDpto(null);
        setSelectedSubDptoMS(null);
    };

    const disableMS = Boolean(selectedDepartamento || selectedSubDpto);
    const disableDept = Boolean(selectedSubDptoMS);

    const titleHead: TitleHead = {
        title: `Detalles del Reporte #${initialData?.tim ?? ""}`,
    };
    const exportarWordMotivoT = async () => {
        if (!initialData?.tim) return;

        /* ===================== HELPERS ===================== */
        const cell = (
            text: string,
            width: number,
            align: (typeof AlignmentType)[keyof typeof AlignmentType] = AlignmentType.CENTER,
            bold = false
        ) =>

            new TableCell({
                width: { size: width, type: WidthType.PERCENTAGE },
                children: [
                    new Paragraph({
                        alignment: align,
                        children: [
                            new TextRun({
                                text,
                                bold,
                                size: 22,
                            }),
                        ],
                    }),
                ],
            });

        /* ===================== DATOS ===================== */
        const titulo = "ACTA DE ENTREGA DE DONACIÓN";
        const empresa = "Hipermercados Tottus S.A.";
        const RUC = "20508565934";
        const donatario = "Santa Rita";

        const fecha = new Date();
        const dia = fecha.getDate();
        const mes = fecha.toLocaleString("es-PE", { month: "long" });
        const anio = fecha.getFullYear();

        const parrafoIntro = `
En el distrito de Pacasmayo, provincia de Pacasmayo del día ${dia} de ${mes} del ${anio}, 
suscriben la siguiente acta; de parte de ${empresa} con RUC N° ${RUC} (donante) y de la otra 
parte el Sr(a) ____________________________________, C.E. ______________________ como 
representante del comedor ${donatario} (donatario), para proceder con la entrega (donación) 
de los bienes detallados líneas abajo; los cuales serán destinados a obras sociales de la 
entidad beneficiada.`.trim();
        const parrafoIntro2 = `Se detalla la relación y cantidad de artículos a donar por ${empresa}.`.trim();

        /* ===================== TABLA PRODUCTOS ===================== */
        const headerRow = new TableRow({
            children: [
                cell("N°", 5, AlignmentType.CENTER, true),
                cell("SKU", 15, AlignmentType.CENTER, true),
                cell("DESCRIPCIÓN", 60, AlignmentType.CENTER, true),
                cell("CANT.", 20, AlignmentType.CENTER, true),
            ],
        });

        const bodyRows = rowsFiltrados.map((d, i) =>
            new TableRow({
                children: [
                    cell(String(i + 1), 5),
                    cell(String(d.sku ?? ""), 15),
                    cell(String(d.descripcion ?? ""), 60, AlignmentType.LEFT),
                    cell(String(d.uRecibidas ?? 0), 20),
                ],
            })
        );

        const productosTable = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [headerRow, ...bodyRows],
        });

        /* ===================== TABLA FIRMAS (ESTILO ACTA REAL) ===================== */
        const firmasTable = new Table({
            width: {
                size: 100,
                type: WidthType.PERCENTAGE,
            },
            layout: TableLayoutType.FIXED,
            rows: [
                /* ================= ENCABEZADO ================= */
                new TableRow({
                    children: [
                        // Celda vacía esquina
                        new TableCell({
                            width: { size: 20, type: WidthType.PERCENTAGE },
                            children: [new Paragraph("")],
                        }),

                        new TableCell({
                            width: { size: 40, type: WidthType.PERCENTAGE },
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                        new TextRun({ text: "RECIBÍ CONFORME", bold: true }),
                                    ],
                                }),
                            ],
                        }),

                        new TableCell({
                            width: { size: 40, type: WidthType.PERCENTAGE },
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                        new TextRun({ text: "ENTREGUÉ CONFORME", bold: true }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                }),

                /* ================= NOMBRES ================= */
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({ text: "NOMBRES", bold: true }),
                                ],
                            })],
                        }),
                        new TableCell({
                            children: [new Paragraph("")],
                        }),
                        new TableCell({
                            children: [new Paragraph("")],
                        }),
                    ],
                }),

                /* ================= DNI ================= */
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({ text: "DNI", bold: true }),
                                ],
                            })],
                        }),
                        new TableCell({
                            children: [new Paragraph("")],
                        }),
                        new TableCell({
                            children: [new Paragraph("")],
                        }),
                    ],
                }),

                /* ================= FIRMA (MÁS ALTA) ================= */
                new TableRow({
                    height: {
                        value: 1200, // 🔥 más alto para firma
                        rule: "atLeast",
                    },
                    children: [
                        new TableCell({
                            verticalAlign: VerticalAlign.CENTER,
                            children: [new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [
                                    new TextRun({ text: "FIRMA", bold: true }),
                                ],
                            })],
                        }),
                        new TableCell({
                            children: [new Paragraph("")],
                        }),
                        new TableCell({
                            children: [new Paragraph("")],
                        }),
                    ],
                }),
            ],
        });


        /* ===================== DOCUMENTO ===================== */
        const doc = new Document({
            sections: [
                {
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 400 },
                            children: [
                                new TextRun({
                                    text: titulo,
                                    bold: true,
                                    size: 32,
                                }),
                            ],
                        }),

                        new Paragraph({
                            spacing: { after: 400 },
                            children: [
                                new TextRun({
                                    text: parrafoIntro,
                                    size: 22,
                                }),
                            ],
                        }),
                        new Paragraph({
                            spacing: { after: 400 },
                            children: [
                                new TextRun({
                                    text: parrafoIntro2,
                                    size: 22,
                                }),
                            ],
                        }),
                        productosTable,

                        new Paragraph({
                            spacing: { before: 400, after: 300 },
                            children: [
                                new TextRun({
                                    text: "Las personas que firman esta acta dan conformidad a la misma.",
                                    size: 22,
                                }),
                            ],
                        }),

                        firmasTable,
                    ],
                },
            ],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `ACTA_DONACION_TIM_${initialData.tim}.docx`);
    };





    /* ===================== RENDER ===================== */
    return (
        <ModalCustomComponent
            titleHead={titleHead}
            opened={opened}
            size="100%"
            handlerClose={() => {
                limpiarFiltros();
                onClose();
            }}
            showConfirm={false}
        >
            <>
                {/* ===================== FILTROS ===================== */}
                <Flex gap="md" align="flex-end" wrap="wrap" mb="md">

                    <Select
                        label="Departamento"
                        placeholder="Seleccione..."
                        style={{ width: 260 }}
                        disabled={disableDept}
                        searchable
                        clearable
                        value={selectedDepartamento}
                        data={Array.from(new Set(subDptos.map((s) => s.substring(0, 3)))).map(
                            (prefix) => {
                                const cat = CATEGORIAS_MACRO.find((c) => c.prefix === prefix);
                                return {
                                    value: prefix,
                                    label: `${prefix} - ${cat?.label ?? "Sin categoría"}`,
                                };
                            }
                        )}
                        onChange={(v) => {
                            setSelectedDepartamento(v);
                            setSelectedSubDpto(null);
                            setSelectedSubDptoMS(null);
                        }}
                    />

                    <Select
                        label="Subdepartamento"
                        placeholder="Seleccione..."
                        style={{ width: 280 }}
                        disabled={!selectedDepartamento || disableDept}
                        searchable
                        clearable
                        value={selectedSubDpto}
                        data={subDptos
                            .filter((s) =>
                                selectedDepartamento ? s.startsWith(selectedDepartamento) : true
                            )
                            .map((s) => ({
                                value: s,
                                label: `${s} - ${SUBDEPARTAMENTOS.find((d) => d.codigo === s)?.descripcion ?? ""
                                    }`,
                            }))}
                        onChange={(v) => {
                            setSelectedSubDpto(v);
                            setSelectedSubDptoMS(null);
                        }}
                    />

                    <Select
                        label="Mercadería Sensible"
                        placeholder="Seleccione..."
                        style={{ width: 300 }}
                        disabled={disableMS}
                        searchable
                        clearable
                        value={selectedSubDptoMS}
                        data={[
                            { value: "TODOS", label: "TODOS (solo sensibles)" },
                            ...subDptosMS.map((s) => ({
                                value: s,
                                label: `${s} - ${SUBDEPARTAMENTOS.find((d) => d.codigo === s)?.descripcion ?? ""
                                    }`,
                            })),
                        ]}
                        onChange={(v) => {
                            setSelectedSubDptoMS(v);
                            setSelectedDepartamento(null);
                            setSelectedSubDpto(null);
                        }}
                    />

                    <button
                        onClick={limpiarFiltros}
                        style={{
                            padding: "8px 16px",
                            background: "#0CC20CFF",
                            color: "white",
                            borderRadius: 8,
                            border: "none",
                            cursor: "pointer",
                            height: 40,
                        }}
                    >
                        Limpiar
                    </button>
                    {initialData?.motivo === "D" && (

                        <Tooltip label="Exportar Word">
                            <ActionIcon
                                variant="filled"
                                color="blue"
                                size="lg"
                                onClick={exportarWordMotivoT}
                                style={{ height: 40 }}
                            >
                                <IconFile size={20} />
                            </ActionIcon>
                        </Tooltip>
                    )}
                    <Tooltip label="Recargar datos">
                        <ActionIcon
                            variant="filled"
                            color="blue"
                            size="lg"
                            onClick={recargarDatos}
                            style={{ height: 40 }}
                        >
                            <IconRefresh size={20} />
                        </ActionIcon>
                    </Tooltip>

                </Flex>

                {/* ===================== TABLA ===================== */}
                {rowsFiltrados.length === 0 ? (
                    <Text mt="lg" c="dimmed">
                        No hay datos para mostrar.
                    </Text>
                ) : (
                    <ResponsiveDataTable
                        columns={columns}
                        rows={rowsFiltrados}
                        manualMode={false}
                        totalRows={rowsFiltrados.length}
                    />
                )}
            </>
        </ModalCustomComponent>
    );
};

export default DetallesModal;
