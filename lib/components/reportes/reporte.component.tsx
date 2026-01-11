"use client";

import { useEffect, useState } from "react";
import { Badge } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconPlus } from "@tabler/icons-react";

import { useLoadingStore } from "@/lib/store/useLoadingStore";
import { useTitlePageStore } from "@/lib/store/useTitlePageStore";

import ResponsiveDataTable, {
    Column,
} from "../common/responsiveTable.component";
import ButtonActionTableComponent from "../common/buttonTable.component";

import { Reporte } from "@/lib/interfaces/maestros/reportes.interface";
import { ReporteFilter } from "@/lib/interfaces/filtros/reportes.filters.interface";

import ReporteFilters from "./reportes.filter";
import { getReportesByFilter } from "@/lib/actions/maestros/reporte.action";

import DetallesModal from "./detalles/detalles.modal";
import ModalCustomComponent from "../common/modalCustom.component";
import FileSelector from "../common/fileButton.component";
import { processExcelReportFront } from "@/lib/hooks/fileProcessor";
import { useUserDataStore } from "@/lib/store/useUserDataStore";
import { validarRolUsuario } from "@/lib/hooks/verificarRol";
import UnAuthoriceComponent from "../common/unauthorice.component";

export default function ReporteComponent() {
    const { show, hide } = useLoadingStore();
    const { setData } = useTitlePageStore();

    // ============================
    // ESTADOS
    // ============================
    const { userData } = useUserDataStore();
    const [reportes, setReportes] = useState<Reporte[]>([]);
    const [totalRows, setTotalRows] = useState(0);

    const [respaldoFiltros, setRespaldoFiltros] =
        useState<ReporteFilter | null>(null);

    // Modal detalle reporte
    const [openForm, setOpenForm] = useState<{
        open: boolean;
        data: Reporte | null;
    }>({ open: false, data: null });

    // Modal archivo
    const [openFileModal, setOpenFileModal] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    // ============================
    // TITULO + BOTONES
    // ============================
    useEffect(() => {
        setData({
            titulo: "Maestro de Reportes",
            buttons: [
                {
                    Texto: "Nuevo Reporte",
                    icon: IconPlus,
                    action: () => setOpenFileModal(true),
                }
            ],
        });
    }, [setData]);
    const ROLES_PERMITIDOS = ["administrador", "supervisor", "operador"];
    
        // ✅ VALIDACIÓN DESPUÉS DE LOS HOOKS
        const tieneAcceso = validarRolUsuario(userData, ROLES_PERMITIDOS);
    
        if (!tieneAcceso) {
            return <UnAuthoriceComponent />;
        }

    // ============================
    // COLUMNAS
    // ============================
    const columns: Column<Reporte>[] = [
        {
            field: "tim",
            headerName: "Tim",
            sortable: true,
            renderCell: (value, row) => (
                <ButtonActionTableComponent
                    texto={`${value}`}
                    action={() => setOpenForm({ open: true, data: row })}
                />
            ),
        },
        {
            field: "placa",
            headerName: "Placa",
            sortable: true,
        },
        {
            field: "origen",
            headerName: "Origen",
            sortable: true,
        },
        {
            field: "destino",
            headerName: "Destino",
            sortable: true,
        },
        {
            field: "fechaEnvio",
            headerName: "Fecha de Envío",
            sortable: true,
        },
        {
            field: "motivo",
            headerName: "Motivo",
            sortable: true,
        },
        {
            field: "estado",
            headerName: "Estado",
            sortable: true,
            renderCell: (_, row) => (
                <Badge color={row.estado ? "green" : "red"}>
                    {row.estado ? "Activo" : "Finalizado"}
                </Badge>
            ),
        },
    ];

    // ============================
    // HANDLERS
    // ============================
    const handlerCloseDetalle = () =>
        setOpenForm({ open: false, data: null });

    const onCloseFileModal = () => {
        setOpenFileModal(false);
        setFile(null);
    };

    const handleConfirmFile = async () => {
        show();
        if (!file) {
            notifications.show({
                title: "Archivo requerido",
                message: "Selecciona un archivo para continuar",
                color: "red",
            });
            return;
        }

        setLoading(true);
        const result = await processExcelReportFront(file, userData!);
        setLoading(false);

        if (!result.success) {
            notifications.show({
                title: "Error",
                message: result.message,
                color: "red",
            });
            onCloseFileModal();
            hide();
            return;
        }
        notifications.show({
            title: "Éxito",
            message: result.message,
            color: "green",
        });
        onCloseFileModal();

        hide();
        handlerFilter({
            tim: respaldoFiltros?.tim ?? null,
            origen: respaldoFiltros?.origen ?? null,
            destino: respaldoFiltros?.destino ?? null,
            fechaEnvio: respaldoFiltros?.fechaEnvio ?? null,
            motivo: "T",
            estado: true,
        });

    };

    const handlerFilter = async (filtros: ReporteFilter) => {
        show();
        const result = await getReportesByFilter(filtros);

        if (!result.success) {
            notifications.show({
                title: "Error",
                message: result.mensaje,
                color: "red",
            });
            hide();
            return;
        }

        setReportes(result.datos || []);
        setTotalRows(result.datos?.length || 0);
        hide();
    };

    // ============================
    // RENDER
    // ============================
    return (
        <div style={{ position: "relative" }}>
            <ReporteFilters
                handlerFilter={handlerFilter}
                SetRespaldoFiltros={setRespaldoFiltros}
            />

            <ResponsiveDataTable
                columns={columns}
                rows={reportes}
                manualMode={false}
                totalRows={totalRows}
            />

            <DetallesModal
                opened={openForm.open}
                initialData={openForm.data}
                onClose={handlerCloseDetalle}
            />

            {/* MODAL IMPORTAR ARCHIVO */}
            <ModalCustomComponent
                opened={openFileModal}
                handlerClose={onCloseFileModal}
                handleConfirm={handleConfirmFile}
                ConfirmText="Procesar"
                titleHead={{ title: "Procesar Reporte TIM" }}
            >
                <FileSelector
                    file={file}
                    onChange={setFile}
                    title="Archivo de reporte"
                />
            </ModalCustomComponent>
        </div>
    );
}
