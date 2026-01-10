"use client";
import { Acciones, MenuItem } from "@/lib/interfaces/global.interfaces";
import { Producto } from "@/lib/interfaces/maestros/productos.interfaces";
import { useLoadingStore } from "@/lib/store/useLoadingStore";
import { useTitlePageStore } from "@/lib/store/useTitlePageStore";
import { useUserDataStore } from "@/lib/store/useUserDataStore";
import { IconFileSpreadsheet, IconPlus } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import ResponsiveDataTable, { Column } from "../common/responsiveTable.component";
import { notifications } from "@mantine/notifications";
import { getAllProductosByFilter } from "@/lib/actions/maestros/producto.action";
import { useCommonDataStore } from './../../store/useCommonDataStore';
import { Usuario } from "@/lib/interfaces/maestros/usuarios.interface";
import { UsuarioFilter } from "@/lib/interfaces/filtros/usuarios.filters.interface";
import { createUsuario, getAllUsuariosByFilter, updateUsuario } from "@/lib/actions/maestros/usuario.actions";
import UsuarioFilters from "./usuarios.filter";
import { Badge } from "@mantine/core";
import ButtonActionTableComponent from "../common/buttonTable.component";
import UsuarioForm from "./usuario.forms";
import { validarRolUsuario } from "@/lib/hooks/verificarRol";
import UnAuthoriceComponent from "../common/unauthorice.component";

export default function UsuarioComponent() {
    const { show, hide } = useLoadingStore();
    const { setData } = useTitlePageStore();
    const { commonData } = useCommonDataStore();
    const [openForm, setOpenForm] = useState<{ open: boolean | undefined, data: Usuario | null }>({ open: false, data: null })
    // ✅ TODOS LOS HOOKS PRIMERO
    const [refreshTable, setRefreshTable] = useState(false);
    const { userData } = useUserDataStore();
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [respaldoFiltros, setRespaldoFiltros] = useState<UsuarioFilter | null>(null);
    const [totalRows, setTotalRows] = useState(0);

    useEffect(() => {
        setData({
            titulo: "Maestro de Usuarios",
            buttons: [
                {
                    Texto: "Agregar Usuario",
                    icon: IconPlus,
                    action: () => setOpenForm({ open: true, data: null }),
                },
            ],
        });
    }, [setUsuarios]);

    const ROLES_PERMITIDOS = ["administrador"];

    // ✅ VALIDACIÓN DESPUÉS DE LOS HOOKS
    const tieneAcceso = validarRolUsuario(userData, ROLES_PERMITIDOS);

    if (!tieneAcceso) {
        return <UnAuthoriceComponent />;
    }
    // ✅ AHORA SÍ, DESPUÉS DE LOS HOOKS, HACEMOS LA VALIDACIÓN
    //   function buscarRolEnMenu(
    //     rol: MenuItem[],
    //     url: string
    //   ): {
    //     menu?: MenuItem;
    //     accion?: Acciones;
    //   } | null {
    //     for (const item of menu) {
    //       if (item.url === url) {
    //         return { menu: item };
    //       }

    //       const accionEncontrada = item.acciones?.find((a) => a.url === url);
    //       if (accionEncontrada) {
    //         return { menu: item, accion: accionEncontrada };
    //       }

    //       if (item.modulos && item.modulos.length > 0) {
    //         const resultado = buscarUrlEnMenu(item.modulos, url);
    //         if (resultado) return resultado;
    //       }
    //     }

    //     return null;
    //   }

    //   const pagina = buscarUrlEnMenu(userData?.rol , ID_PAGES.EPORT);

    //   // ✅ Return condicional DESPUÉS de todos los hooks
    //   if (!pagina) {
    //     return <UnAuthoriceComponent />;
    //   }
    useEffect(() => {
        if (!respaldoFiltros) return; // si no hay filtros previos, no carga nada

        const refetch = async () => {
            show();
            const result = await getAllUsuariosByFilter(respaldoFiltros);

            if (!result.success) {
                notifications.show({
                    title: "Error",
                    message: result.mensaje,
                });
                hide();
                return;
            }

            setUsuarios(result.datos || []);
            setTotalRows(result.datos?.length || 0);
            hide();
        };

        refetch();
    }, [refreshTable]);

    const columns: Column<Producto>[] = [
        {
            field: "dni",
            headerName: "DNI",
            align: "left",
            sortable: true,
            renderCell: (value, row: Usuario) => (
                <ButtonActionTableComponent texto={`${row.dni}`} action={() => {
                    setOpenForm({ open: true, data: row })
                }}></ButtonActionTableComponent>
            ),
        },
        {
            field: "nombre",
            headerName: "Nombres",
            align: "left",
            sortable: true,
            renderCell: (_, row: Usuario) => {
                return (
                    <> {row.nombre} {row.apellido}</>
                );
            }
        },

        {
            field: "rol",
            headerName: "Rol",
            align: "left",
            sortable: true,
        },
        {
            field: "activo",
            headerName: "Estado",
            align: "left",
            sortable: true,
            renderCell: (_, row: Usuario) => {
                return (
                    <Badge color={row.activo ? "green" : "red"} variant="filled">
                        {row.activo ? "Activo" : "Inactivo"}
                    </Badge>
                );

            }
        },


    ];
    const handlerClose = () => {
        setOpenForm({ open: false, data: null });
    };

    const handleSave = async (
        data: Partial<Producto>
    ): Promise<void> => {
        show();
        const result = !data._id
            ? await createUsuario(data)
            : await updateUsuario(data);
        if (!result.success) {
            console.log(result.mensaje)
            notifications.show({ title: "ERROR", message: result.mensaje });
            hide();
            return;
        }
        notifications.show({ title: !data._id ? "Usuario Creado" : "Usuario Actualizado", message: result.mensaje });
        handlerClose();
        setRefreshTable((prev) => !prev);
        hide();
    };

    const handlerFilter = async (filtrosCampos: UsuarioFilter) => {
        show();
        const result = await getAllUsuariosByFilter(filtrosCampos);
        if (!result.success) {
            notifications.show({
                title: "Error",
                message: result.mensaje,
            });
            hide();
            return;
        }
        setUsuarios(result.datos || []);
        setTotalRows(result.datos.length || 0);
        hide();
    };

    //   const onExport = async () => {
    //     if (historialData.length === 0) return;

    //     const workbook = new ExcelJS.Workbook();
    //     const sheet = workbook.addWorksheet("Historial");

    //     // Títulos
    //     sheet.mergeCells("A1:I1");
    //     const title = sheet.getCell("A1");
    //     title.value = "Historial de Registros";
    //     title.font = { size: 16, bold: true };
    //     title.alignment = { horizontal: "center" };

    //     // Encabezados
    //     const headers = [
    //       "GID",
    //       "Nombre",
    //       "Nombre Departamento",
    //       "Equipo",
    //       "Concentracion Alcohol",
    //       "Dirección IP",
    //       "Authenticación",
    //       "Resultado",
    //       "Foto",
    //     ];
    //     sheet.addRow(headers);
    //     sheet.getRow(2).font = { bold: true };
    //     sheet.getRow(2).alignment = { horizontal: "center" };

    //     // Datos
    //     historialData.forEach((item) => {
    //       sheet.addRow([
    //         item.gid,
    //         item.name,
    //         item.deptName,
    //         `${item.equipmentModel}-${item.checkSerialNumber}`,
    //         item.formattedAlcoholStrength,
    //         item.ipAdress,
    //         item.authentication,
    //         item.checkResult,
    //         "", // imagen va luego
    //       ]);
    //     });

    //     // Insertar imágenes en ExcelJS
    //     historialData.forEach((item, index) => {
    //       if (!item.checkFace?.file_base64) return;

    //       const imgId = workbook.addImage({
    //         base64: item.checkFace.file_base64,
    //         extension: "png",
    //       });

    //       sheet.addImage(imgId, {
    //         tl: { col: 8, row: index + 2 },
    //         ext: { width: 60, height: 60 },
    //       });

    //       sheet.getRow(index + 3).height = 45;
    //     });

    //     // Ajustar columnas
    //     sheet.columns.forEach((col) => {
    //       col.width = 25;
    //     });

    //     // Descargar
    //     const buffer = await workbook.xlsx.writeBuffer();
    //     saveAs(new Blob([buffer]), "Historial.xlsx");
    //   };

    return (
        <div style={{ position: "relative" }}>
            <UsuarioFilters
                handlerFilter={handlerFilter}
                SetRespaldoFiltros={setRespaldoFiltros}
            />
            <ResponsiveDataTable
                columns={columns}
                rows={usuarios}
                manualMode={false}
                totalRows={totalRows}
            />
            <UsuarioForm
                opened={openForm.open}
                initialData={openForm.data}
                onClose={handlerClose}
                onSave={handleSave}
            ></UsuarioForm>
        </div>
    );
}