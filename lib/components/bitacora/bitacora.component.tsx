"use client";

import { useEffect, useState } from "react";
import { Badge, Button, Group, Modal } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconFileDownload, IconPlus } from "@tabler/icons-react";
import * as XLSX from 'xlsx';
import { modals } from "@mantine/modals";

import { useLoadingStore } from "@/lib/store/useLoadingStore";
import { useTitlePageStore } from "@/lib/store/useTitlePageStore";

import ResponsiveDataTable, {
    Column,
} from "../common/responsiveTable.component";
import { useUserDataStore } from "@/lib/store/useUserDataStore";
import { validarRolUsuario } from "@/lib/hooks/verificarRol";
import UnAuthoriceComponent from "../common/unauthorice.component";
import BitacoraFilters from "./bitacora.filter";
import { Bitacora, BitacoraFilter } from "@/lib/interfaces/maestros/bitacora.interface";
import { getBitacoraByFilter } from "@/lib/actions/maestros/bitacora.action";
import { IconTrash } from "@tabler/icons-react";
import { deleteBitacora } from "@/lib/actions/maestros/bitacora.action";

export default function BitacoraComponent() {
    const { show, hide } = useLoadingStore();
    const { setData } = useTitlePageStore();

    // ============================
    // ESTADOS
    // ============================
    const { userData } = useUserDataStore();
    const [bitacora, setBitacora] = useState<Bitacora[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [opened, setOpened] = useState(false);

    const [respaldoFiltros, setRespaldoFiltros] =
        useState<BitacoraFilter | null>(null);

    // Modal archivo
    const [loading, setLoading] = useState(false);

    // ============================
    // FUNCIÓN EXPORTAR EXCEL
    // ============================
    const exportarExcel = () => {
        if (bitacora.length === 0) {
            notifications.show({
                title: "Sin datos",
                message: "No hay datos para exportar",
                color: "yellow",
            });
            return;
        }

        // Preparar los datos solo con las columnas que quieres
        const datosExportar = bitacora.map(item => ({
            "DNI": item.dni,
            "Mensaje Registro": item.mensaje,
            "Fecha y Hora": item.creadoEn
        }));

        // Crear el libro de trabajo
        const ws = XLSX.utils.json_to_sheet(datosExportar);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Bitácora");

        // Ajustar ancho de columnas
        ws['!cols'] = [
            { wch: 15 }, // DNI
            { wch: 60 }, // Mensaje
            { wch: 20 }  // Fecha y Hora
        ];

        // Generar nombre de archivo con fecha actual
        const fecha = new Date().toLocaleDateString('es-PE').replace(/\//g, '-');
        const nombreArchivo = `Bitacora_${fecha}.xlsx`;

        // Descargar el archivo
        XLSX.writeFile(wb, nombreArchivo);

        notifications.show({
            title: "Exportación exitosa",
            message: "El archivo Excel se descargó correctamente",
            color: "green",
        });
    };

    // ============================
    // FUNCIÓN ELIMINAR BITÁCORA
    // ============================
    const confirmarEliminarBitacora = () => {
        modals.openConfirmModal({
            title: "Eliminar Bitácora",
            centered: true,
            children: (
                <p>
                    ⚠️ Esta acción <b>eliminará todos los registros</b> de la bitácora.
                    <br />
                    ¿Estás seguro de continuar?
                </p>
            ),
            labels: { confirm: "Sí, eliminar", cancel: "Cancelar" },
            confirmProps: { color: "red" },
            onConfirm: async () => {
                show();
                try {
                    const resp = await deleteBitacora();

                    if (!resp.success) {
                        notifications.show({
                            title: "Error",
                            message: resp.mensaje,
                            color: "red",
                        });
                        return;
                    }

                    notifications.show({
                        title: "Bitácora eliminada",
                        message: "Todos los registros fueron eliminados correctamente",
                        color: "green",
                    });

                    // Limpiar tabla
                    setBitacora([]);
                    setTotalRows(0);
                } catch (error: any) {
                    notifications.show({
                        title: "Error",
                        message: error.message || "Error al eliminar bitácora",
                        color: "red",
                    });
                } finally {
                    hide();
                }
            },
        });
    };

    // ============================
    // TITULO + BOTONES
    // ============================
    useEffect(() => {
        setData({
            titulo: "Bitacora",
            buttons: [
                {
                    Texto: "Exportar Bitacora",
                    icon: IconFileDownload,
                    action: exportarExcel
                },
                {
                    Texto: "Eliminar Bitacora",
                    icon: IconTrash,
                    action: () => setOpened(true), // ✅ Corregido: función que abre el modal
                },
            ],
        });
    }, [bitacora]); // ✅ Agregué bitacora como dependencia

    const ROLES_PERMITIDOS = ["administrador", "supervisor", "operador"];

    // ✅ VALIDACIÓN DESPUÉS DE LOS HOOKS
    const tieneAcceso = validarRolUsuario(userData, ROLES_PERMITIDOS);

    if (!tieneAcceso) {
        return <UnAuthoriceComponent />;
    }

    // ============================
    // COLUMNAS
    // ============================
    const columns: Column<Bitacora>[] = [
        {
            field: "dni",
            headerName: "DNI",
            sortable: true,
        },
        {
            field: "mensaje",
            headerName: "Mensaje Registro",
            sortable: true,
        },
        {
            field: "creadoEn",
            headerName: "Fecha y Hora",
            sortable: true,
        }
    ];

    // ============================
    // HANDLERS
    // ============================
    const handlerFilter = async (filtros: BitacoraFilter) => {
        show();
        const result = await getBitacoraByFilter(filtros);

        if (!result.success) {
            notifications.show({
                title: "Error",
                message: result.mensaje,
                color: "red",
            });
            hide();
            return;
        }

        setBitacora(result.datos || []);
        setTotalRows(result.datos?.length || 0);
        hide();
    };

    // ============================
    // RENDER
    // ============================
    return (
        <div style={{ position: "relative" }}>
            <BitacoraFilters
                handlerFilter={handlerFilter}
                SetRespaldoFiltros={setRespaldoFiltros}
            />

            <ResponsiveDataTable
                columns={columns}
                rows={bitacora}
                manualMode={false}
                totalRows={totalRows}
            />

            {/* ✅ Modal para confirmar eliminación */}
            <Modal
                opened={opened}
                onClose={() => setOpened(false)}
                title="⚠️ Confirmar Eliminación"
                centered
            >
                <p style={{ marginBottom: 20 }}>
                    Esta acción <b>eliminará todos los registros</b> de la bitácora.
                    <br />
                    ¿Estás seguro de continuar?
                </p>

                <Group justify="flex-end" gap="sm">
                    <Button
                        variant="default"
                        onClick={() => setOpened(false)}
                    >
                        Cancelar
                    </Button>

                    <Button
                        color="red"
                        leftSection={<IconTrash size={16} />}
                        onClick={async () => {
                            setOpened(false);
                            show();
                            
                            try {
                                const resp = await deleteBitacora();

                                if (!resp.success) {
                                    notifications.show({
                                        title: "Error",
                                        message: resp.mensaje,
                                        color: "red",
                                    });
                                    return;
                                }

                                notifications.show({
                                    title: "Bitácora eliminada",
                                    message: "Todos los registros fueron eliminados correctamente",
                                    color: "green",
                                });

                                // Limpiar tabla
                                setBitacora([]);
                                setTotalRows(0);
                            } catch (error: any) {
                                notifications.show({
                                    title: "Error",
                                    message: error.message || "Error al eliminar bitácora",
                                    color: "red",
                                });
                            } finally {
                                hide();
                            }
                        }}
                    >
                        Sí, eliminar todo
                    </Button>
                </Group>
            </Modal>
        </div>
    );
}