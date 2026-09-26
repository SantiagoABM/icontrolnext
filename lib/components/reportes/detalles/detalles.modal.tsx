import React, { useEffect, useMemo, useState } from "react";
import { Select, Flex, Text, Badge, Tooltip, ActionIcon, Button, MultiSelect, Modal, TextInput } from "@mantine/core";
import ModalCustomComponent, { TitleHead } from "../../common/modalCustom.component";
import { Detalle, Reporte } from "@/lib/interfaces/maestros/reportes.interface";
import ResponsiveDataTable, { Column } from "../../common/responsiveTable.component";
import { getDetalleReporteByTim } from "@/lib/actions/maestros/detalle.action";
import { DatePickerInput } from "@mantine/dates";
import ExcelJS from "exceljs";
import 'dayjs/locale/es';
import '@mantine/dates/styles.css';
import { CATEGORIAS_MACRO, formatFechaDDMMYY, formatFechaEnvio, SUBDEPARTAMENTOS } from "@/lib/utils/constantes";
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
import { IconFile, IconRefresh, IconFileSpreadsheet } from "@tabler/icons-react";
import { reactivarTim } from "@/lib/actions/maestros/reporte.action";
import { notifications } from "@mantine/notifications";
import { useUserDataStore } from "@/lib/store/useUserDataStore";
import { exportarExcelDonacion } from "@/lib/hooks/Excels/ExcelDonacion";
import { exportarExcelTIM } from "@/lib/hooks/Excels/ExcelBitacora";
import { exportarExcelNSG } from "@/lib/hooks/Excels/ExcelNSG";

type TipoSensible = "TIENDA" | "CENTRAL" | null;

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
    const { userData } = useUserDataStore();

    /* ===================== FILTROS ===================== */
    const [selectedDepartamento, setSelectedDepartamento] = useState<string[]>([]);
    const [selectedSubDptos, setSelectedSubDptos] = useState<string[]>([]);
    const [tipoSensible, setTipoSensible] = useState<TipoSensible>(null);

    /* ===================== MODAL EXPORTACIÓN ===================== */
    const [modalOpen, setModalOpen] = useState(false);
    const [empresaTransporte, setEmpresaTransporte] = useState("");
    const [conductor, setConductor] = useState("");
    const [fechaRecepcion, setFechaRecepcion] = useState<string | null>(new Date().toISOString().split('T')[0]);

    /* ===================== HELPERS ===================== */


    const limpiarFiltros = () => {
        setSelectedDepartamento([]);
        setSelectedSubDptos([]);
        setTipoSensible(null);
    };

    const limpiarModalExportacion = () => {
        setEmpresaTransporte("");
        setConductor("");
        setFechaRecepcion(new Date().toISOString().split('T')[0]);
    };

    const cerrarModalExportacion = () => {
        setModalOpen(false);
        limpiarModalExportacion();
    };

    /* ===================== CARGA ÚNICA ===================== */
    useEffect(() => {
        if (!opened || !initialData?.tim) return;
        const cargar = async () => {
            show();
            const resp = await getDetalleReporteByTim(initialData.tim!);
            console.log("Detalles cargados:", resp);
            setRowsOriginales(resp?.datos ?? []);
            setSelectedDepartamento([]);
            setSelectedSubDptos([]);
            setTipoSensible(null);
            hide();
        };

        cargar();
    }, [opened, initialData?.tim]);

    const activarTim = async () => {
        if (!initialData?.tim) return;
        show();
        const resp = await reactivarTim(initialData.tim);
        notifications.show({
            title: resp.success ? "Éxito" : "Error",
            message: resp.mensaje,
            color: resp.success ? "green" : "red",
        });
        window.location.reload();
        hide();
    }

    const recargarDatos = async () => {
        if (!initialData?.tim) return;

        show();
        try {
            const resp = await getDetalleReporteByTim(initialData.tim);
            setRowsOriginales(resp?.datos ?? []);
        } finally {
            hide();
        }
    };
    /* ===================== COLUMNAS NSG ===================== */
    const columnsNSG: Column<Detalle>[] = [
        {
            field: "subdpto",
            headerName: "División",
            align: "left",
            sortable: true,
        },
        {
            field: "ean",
            headerName: "EAN",
            align: "left",
            sortable: true,
        },
        {
            field: "sku",
            headerName: "SKU",
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
            field: "uRecibidas",
            headerName: "OK",
            align: "center",
            sortable: true,
            renderCell: (_, row: Detalle) => (
                <Badge color={row.uRecibidas > 0 ? "green" : "red"} variant="filled">
                    {row.uRecibidas > 0 ? "OK" : "NO"}
                </Badge>
            )
        },
        {
            field: "observacion",
            headerName: "Observación",
            align: "left",
            sortable: true,
        },
    ];
    /* ===================== COLUMNAS ===================== */
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

    /* ===================== FILTRO LOCAL ===================== */
    const rowsFiltrados = useMemo(() => {
        let data = [...rowsOriginales];

        if (selectedDepartamento.length > 0) {
            data = data.filter((d) =>
                selectedDepartamento.some(dept => d.subdpto?.startsWith(dept))
            );
        }

        if (selectedSubDptos.length > 0) {
            data = data.filter((d) => selectedSubDptos.includes(d.subdpto!));
        }

        if (tipoSensible === "TIENDA") {
            data = data.filter((d) => d.isContable === true);
        }

        if (tipoSensible === "CENTRAL") {
            data = data.filter((d) => d.marcaSensible === true);
        }

        return data;
    }, [
        rowsOriginales,
        selectedDepartamento,
        selectedSubDptos,
        tipoSensible,
    ]);

    /* ===================== FALTANTES Y SOBRANTES ===================== */
    const faltantes = useMemo(() => {
        return rowsFiltrados.filter(d => d.uRecibidas < d.uEnviadas);
    }, [rowsFiltrados]);

    const sobrantes = useMemo(() => {
        return rowsFiltrados.filter(d => d.uRecibidas > d.uEnviadas);
    }, [rowsFiltrados]);

    /* ===================== EXPORTAR EXCEL ===================== */

    const exportarExcel = async () => {
        if (!initialData?.tim) {
            notifications.show({
                title: "Atención",
                message: "Debe seleccionar un reporte antes de exportar",
                color: "yellow",
            });
            return;
        }
        if (!fechaRecepcion) {
            notifications.show({
                title: "Error",
                message: "Debe seleccionar la fecha de recepción",
                color: "yellow",
            });
            return;
        }
        show();
        try {
            switch (initialData?.motivo) {
                case "D":
                    await exportarExcelDonacion(initialData, fechaRecepcion, rowsOriginales, userData?.nombre ?? "");
                    return;
                case "T":
                    await exportarExcelTIM(initialData, empresaTransporte, conductor, fechaRecepcion, faltantes, sobrantes, userData?.nombre ?? "");
                    return;
                case "NSG":
                    await exportarExcelNSG(initialData, fechaRecepcion, rowsOriginales, userData?.nombre ?? "");
                    return;
            };
        } catch (err) {
            console.error("Error al exportar Excel:", err);
            notifications.show({
                title: "Error",
                message: "Error al exportar Excel",
                color: "red",
            });
        } finally {
            notifications.show({
                title: "Éxito",
                message: "Excel exportado correctamente",
                color: "green",
            });
            hide();
        }
    }
    // const exportarExcelTIM = async () => {
    //     if (!initialData?.tim) {
    //         notifications.show({
    //             title: "Atención",
    //             message: "Debe seleccionar un TIM antes de exportar",
    //             color: "yellow",
    //         });
    //         return;
    //     }
    //     if (!fechaRecepcion) {
    //         notifications.show({
    //             title: "Error",
    //             message: "Debe seleccionar la fecha de recepción",
    //             color: "red",
    //         });
    //         return;
    //     }

    //     show();

    //     try {
    //         const fechaRecepcionFormatted = formatFechaDDMMYY(new Date(fechaRecepcion as string));
    //         const fechaEnvioFormatted = formatFechaEnvio(initialData?.fechaEnvio as string);
    //         const origenRaw = initialData?.origen ?? "";
    //         const origenParts = origenRaw.trim().split(/\s+/);
    //         const codigoOrigen = origenParts.length > 0 ? origenParts[0] : "";
    //         const movilOrigen = origenRaw.includes("CD Secos") ? "CD Secos" : "CD Frescos";
    //         const destinoRaw = initialData?.destino ?? "";
    //         const destinoParts = destinoRaw.split(/\s*-\s*/);
    //         const codigoTienda = destinoParts.length > 0 ? destinoParts[0].trim() : "";
    //         const tiendaDestino = destinoParts.length > 1 ? destinoParts[1].trim() : "";

    //         const workbook = new ExcelJS.Workbook();

    //         /* =============== HOJA FALTANTES =============== */
    //         const sheetFaltantes = workbook.addWorksheet("Faltantes");

    //         sheetFaltantes.columns = [
    //             { header: "FECHA ENVÍO", width: 15 },
    //             { header: "FECHA RECEPCIÓN", width: 18 },
    //             { header: "CÓDIGO DE TIENDA", width: 18 },
    //             { header: "TIENDA", width: 22 },
    //             { header: "ORIGEN", width: 18 },
    //             { header: "MÓVIL", width: 14 },
    //             { header: "EMPRESA DE TRANSPORTE", width: 26 },
    //             { header: "CONDUCTOR", width: 22 },
    //             { header: "ASUNTO", width: 22 },
    //             { header: "TIM", width: 14 },
    //             { header: "OLPN", width: 16 },
    //             { header: "DEPARTAMENTO", width: 16 },
    //             { header: "SKU", width: 16 },
    //             { header: "EAN", width: 18 },
    //             { header: "DESCRIPCIÓN DE SKU", width: 40 },
    //             { header: "UNIDAD DE MEDIDA", width: 18 },
    //             { header: "CANTIDAD EN GUIA", width: 20 },
    //             { header: "CANTIDAD RECIBIDA", width: 22 },
    //             { header: "DIFERENCIA", width: 14 },
    //             { header: "COSTO PROMEDIO", width: 18 },
    //             { header: "MONTO FALTANTE (S/)", width: 22 },
    //             { header: "RESPONSABLE", width: 20 },
    //             { header: "RESOLUCIÓN", width: 20 },
    //             { header: "MARCA SENSIBLE", width: 18 },
    //         ];

    //         faltantes.forEach(d => {
    //             const diferencia = d.uEnviadas - d.uRecibidas;
    //             const costo = d.costoPromedio ?? 0;
    //             const montoFaltante = diferencia * costo;
    //             const asunto = `DISCREPANCIA_${fechaRecepcionFormatted}_${movilOrigen}_TIM_${initialData.tim} ${codigoTienda}_${tiendaDestino}`;

    //             let marca = "-";
    //             if (d.marcaSensible) marca = "C";
    //             else if (d.isContable) marca = "T";

    //             sheetFaltantes.addRow([
    //                 fechaEnvioFormatted,
    //                 fechaRecepcionFormatted,
    //                 codigoTienda,
    //                 tiendaDestino,
    //                 codigoOrigen,
    //                 movilOrigen,
    //                 empresaTransporte,
    //                 conductor,
    //                 asunto ?? "",
    //                 initialData.tim,
    //                 d.olpn ?? "",
    //                 d.subdpto ?? "",
    //                 d.sku,
    //                 d.ean ?? "",
    //                 d.descripcion,
    //                 d.uMedida ?? "",
    //                 d.uEnviadas,
    //                 d.uRecibidas,
    //                 diferencia,
    //                 costo,
    //                 montoFaltante,
    //                 d.modificadoPor ?? userData?.nombre,
    //                 "PENDIENTE",
    //                 marca,
    //             ]);
    //         });

    //         /* =============== HOJA SOBRANTES =============== */
    //         const sheetSobrantes = workbook.addWorksheet("Sobrantes");

    //         sheetSobrantes.columns = [
    //             { header: "FECHA ENVÍO", width: 15 },
    //             { header: "FECHA RECEPCIÓN", width: 18 },
    //             { header: "TIM", width: 14 },
    //             { header: "SKU", width: 16 },
    //             { header: "DESCRIPCIÓN", width: 40 },
    //             { header: "SUBDPTO", width: 14 },
    //             { header: "CAJAS ENVIADAS", width: 16 },
    //             { header: "UNIDADES ENVIADAS", width: 18 },
    //             { header: "CASEPACK", width: 14 },
    //             { header: "CAJAS RECIBIDAS", width: 18 },
    //             { header: "UNIDADES RECIBIDAS", width: 20 },
    //             { header: "SOBRANTE", width: 14 },
    //             { header: "COSTO PROMEDIO", width: 18 },
    //             { header: "TOTAL SOBRANTE", width: 18 },
    //             { header: "MARCA SENSIBLE", width: 16 },
    //         ];

    //         sobrantes.forEach(d => {
    //             const sobrante = d.uRecibidas - d.uEnviadas;
    //             const costo = d.costoPromedio ?? 0;

    //             let marca = "-";
    //             if (d.marcaSensible) marca = "C";
    //             else if (d.isContable) marca = "T";

    //             sheetSobrantes.addRow([
    //                 fechaEnvioFormatted,
    //                 fechaRecepcionFormatted,
    //                 initialData.tim,
    //                 d.sku,
    //                 d.descripcion,
    //                 d.subdpto,
    //                 d.casePack ? d.uEnviadas / d.casePack : 0,
    //                 d.uEnviadas,
    //                 d.casePack ?? 0,
    //                 d.casePack ? d.uRecibidas / d.casePack : 0,
    //                 d.uRecibidas,
    //                 sobrante,
    //                 costo,
    //                 sobrante * costo,
    //                 marca,
    //             ]);
    //         });

    //         /* =============== DESCARGA =============== */
    //         const buffer = await workbook.xlsx.writeBuffer();

    //         saveAs(
    //             new Blob([buffer], {
    //                 type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    //             }),
    //             `BITACORA_TIM_${initialData?.tim}.xlsx`
    //         );

    //         notifications.show({
    //             title: "Éxito",
    //             message: "Excel exportado correctamente",
    //             color: "green",
    //         });

    //     } catch (error) {
    //         console.error("Error al exportar:", error);
    //         notifications.show({
    //             title: "Error",
    //             message: "No se pudo exportar el Excel",
    //             color: "red",
    //         });
    //     } finally {
    //         hide();
    //     }
    // };

    /* ===================== EXPORTAR WORD ===================== */
    const exportarWordMotivoT = async () => {
        if (!initialData?.tim) return;

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

        const titulo = "ACTA DE ENTREGA DE DONACIÓN";
        const empresa = "Hipermercados Tottus S.A.";
        const RUC = "20508565934";
        const donatario = "Santa Rita";

        const fecha = new Date();
        const dia = fecha.getDate();
        const mes = fecha.toLocaleString("es-PE", { month: "long" });
        const anio = fecha.getFullYear();

        const parrafoIntro = `En el distrito de Pacasmayo, provincia de Pacasmayo del día ${dia} de ${mes} del ${anio}, suscriben la siguiente acta; de parte de ${empresa} con RUC N° ${RUC} (donante) y de la otra parte el Sr(a) ____________________________________, D.I. ______________________ como representante del comedor ${donatario} (donatario), para proceder con la entrega (donación) de los bienes detallados líneas abajo; los cuales serán destinados a obras sociales de la entidad beneficiada.`.trim();

        const parrafoIntro2 = `Se detalla la relación y cantidad de artículos a donar por ${empresa}.`.trim();

        const headerRow = new TableRow({
            children: [
                cell("N°", 4, AlignmentType.CENTER, true),
                cell("SKU", 12, AlignmentType.CENTER, true),
                cell("DESCRIPCIÓN", 30, AlignmentType.CENTER, true),
                cell("CANT.", 10, AlignmentType.CENTER, true),
                cell("FEC. VENC.", 15, AlignmentType.CENTER, true),
                cell("UM", 4, AlignmentType.CENTER, true),
                cell("MOTIVO", 20, AlignmentType.CENTER, true),
            ],
        });

        const bodyRows = rowsFiltrados.map((d, i) =>
            new TableRow({
                children: [
                    cell(String(i + 1), 4),
                    cell(String(d.sku ?? ""), 12),
                    cell(String(d.descripcion ?? ""), 30, AlignmentType.LEFT),
                    cell(String(d.uRecibidas ?? 0), 10),
                    cell(String(d.fechavencimiento), 15, AlignmentType.CENTER),
                    cell(String(d.uMedida), 4, AlignmentType.CENTER),
                    cell(String(d.observacion ?? ""), 20, AlignmentType.CENTER),
                ],
            })
        );

        const productosTable = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [headerRow, ...bodyRows],
        });

        const firmasTable = new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            layout: TableLayoutType.FIXED,
            rows: [
                new TableRow({
                    children: [
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
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: "NOMBRES", bold: true })],
                            })],
                        }),
                        new TableCell({ children: [new Paragraph("")] }),
                        new TableCell({ children: [new Paragraph("")] }),
                    ],
                }),
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: "DNI", bold: true })],
                            })],
                        }),
                        new TableCell({ children: [new Paragraph("")] }),
                        new TableCell({ children: [new Paragraph("")] }),
                    ],
                }),
                new TableRow({
                    height: { value: 1200, rule: "atLeast" },
                    children: [
                        new TableCell({
                            verticalAlign: VerticalAlign.CENTER,
                            children: [new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: "FIRMA", bold: true })],
                            })],
                        }),
                        new TableCell({ children: [new Paragraph("")] }),
                        new TableCell({ children: [new Paragraph("")] }),
                    ],
                }),
            ],
        });

        const doc = new Document({
            sections: [
                {
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 400 },
                            children: [new TextRun({ text: titulo, bold: true, size: 32 })],
                        }),
                        new Paragraph({
                            spacing: { after: 400 },
                            children: [new TextRun({ text: parrafoIntro, size: 22 })],
                        }),
                        new Paragraph({
                            spacing: { after: 400 },
                            children: [new TextRun({ text: parrafoIntro2, size: 22 })],
                        }),
                        productosTable,
                        new Paragraph({
                            spacing: { before: 400, after: 300 },
                            children: [new TextRun({
                                text: "Las personas que firman esta acta dan conformidad a la misma.",
                                size: 22
                            })],
                        }),
                        firmasTable,
                    ],
                },
            ],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `ACTA_DONACION_TIM_${initialData.tim}.docx`);
    };

    const titleHead: TitleHead = {
        title: `Detalles del Reporte #${initialData?.tim ?? ""}`,
    };

    /* ===================== RENDER ===================== */
    return (
        <>
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
                <div>
                    <Flex gap="md" align="flex-end" wrap="wrap" mb="md">
                        <MultiSelect
                            label="Departamento"
                            placeholder="Departamentos..."
                            style={{ width: 260 }}
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
                                setSelectedSubDptos([]);
                            }}
                        />

                        <MultiSelect
                            label="Subdepartamento"
                            placeholder="Subdepartamentos..."
                            style={{ width: 280 }}
                            disabled={selectedDepartamento.length === 0}
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
                            value={selectedSubDptos}
                            data={subDptos
                                .filter((s) =>
                                    selectedDepartamento.length > 0
                                        ? selectedDepartamento.some(dept => s.startsWith(dept))
                                        : true
                                )
                                .map((s) => ({
                                    value: s,
                                    label: `${s} - ${SUBDEPARTAMENTOS.find((d) => d.codigo === s)?.descripcion ?? ""}`,
                                }))}
                            onChange={(values) => {
                                setSelectedSubDptos(values);
                            }}
                        />

                        <Select
                            label="Mercadería Sensible"
                            placeholder="Todos"
                            style={{ width: 300 }}
                            searchable
                            clearable
                            value={tipoSensible}
                            data={[
                                { value: "TIENDA", label: "Sensible Tienda" },
                                { value: "CENTRAL", label: "Sensible Central" },
                            ]}
                            onChange={(v) => setTipoSensible(v as TipoSensible)}
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

                        {/* {initialData?.motivo === "T" && initialData.estado == false && (
                            <Tooltip label="Exportar Excel">
                                <ActionIcon
                                    variant="filled"
                                    color="teal"
                                    size="lg"
                                    onClick={() => setModalOpen(true)}
                                    style={{ height: 40 }}
                                >
                                    <IconFileSpreadsheet size={20} />
                                </ActionIcon>
                            </Tooltip>
                        )} */}

                        <Tooltip label={initialData?.motivo == "T" ? "Exportar Excel Bitacora" : "Exportar Excel Donación"}>
                            <ActionIcon
                                variant="filled"
                                color="teal"
                                size="lg"
                                onClick={() => { initialData?.motivo == "T" ? setModalOpen(true) : exportarExcel() }}
                                style={{ height: 40 }}
                            >
                                <IconFileSpreadsheet size={20} />
                            </ActionIcon>
                        </Tooltip>

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

                        {initialData?.estado == false && initialData.motivo == "T" && (userData?.rol === "administrador" || userData?.rol === "supervisor") && (
                            <button
                                style={{
                                    padding: "8px 16px",
                                    background: "red",
                                    color: "white",
                                    borderRadius: 8,
                                    border: "none",
                                    cursor: "pointer",
                                    height: 40,
                                }}
                                onClick={activarTim}
                            >
                                Activar Tim
                            </button>
                        )}
                    </Flex>

                    {rowsFiltrados.length === 0 ? (
                        <Text mt="lg" c="dimmed">
                            No hay datos para mostrar.
                        </Text>
                    ) : (
                        <ResponsiveDataTable
                            columns={initialData?.motivo == "NSG" ? columnsNSG : columns}
                            rows={rowsFiltrados}
                            manualMode={false}
                            totalRows={rowsFiltrados.length}
                        />
                    )}
                </div>
            </ModalCustomComponent>

            <Modal
                opened={modalOpen}
                onClose={cerrarModalExportacion}
                title="Datos para exportar Excel"
                centered
            >
                <Flex direction="column" gap="md">
                    <TextInput
                        label="Empresa de transporte"
                        placeholder="Ingrese empresa"
                        value={empresaTransporte}
                        onChange={(e) => setEmpresaTransporte(e.currentTarget.value)}
                        required
                    />

                    <TextInput
                        label="Conductor"
                        placeholder="Ingrese conductor"
                        value={conductor}
                        onChange={(e) => setConductor(e.currentTarget.value)}
                        required
                    />

                    <DatePickerInput
                        label="Fecha de recepción"
                        placeholder="Seleccione fecha"
                        value={fechaRecepcion}
                        onChange={(value) => setFechaRecepcion(value)}
                        valueFormat="DD/MM/YYYY"
                        clearable={false}
                        required
                        locale="es"
                    />

                    <Flex justify="flex-end" gap="sm" mt="md">
                        <Button variant="default" onClick={cerrarModalExportacion}>
                            Cancelar
                        </Button>

                        <Button
                            onClick={() => {
                                if (!empresaTransporte || !conductor) {
                                    notifications.show({
                                        title: "Datos incompletos",
                                        message: "Debe ingresar empresa y conductor",
                                        color: "red",
                                    });
                                    return;
                                }

                                setModalOpen(false);
                                exportarExcel();
                                limpiarModalExportacion();
                            }}
                        >
                            Exportar
                        </Button>
                    </Flex>
                </Flex>
            </Modal>
        </>
    );
};

export default DetallesModal;