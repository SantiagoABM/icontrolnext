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
import { ProductoFilter } from "@/lib/interfaces/filtros/productos.filters.interface";
import { createProducto, getAllProductosByFilter, updateProducto } from "@/lib/actions/maestros/producto.action";
import ProductosFilter from "./productos.filter";
import ProductoForm from "./producto.forms";
import { useCommonDataStore } from './../../store/useCommonDataStore';
import ButtonActionTableComponent from "../common/buttonTable.component";

export default function ProductosComponent() {
  const { show, hide } = useLoadingStore();
  const { setData } = useTitlePageStore();
  const { commonData } = useCommonDataStore();
  const [openForm, setOpenForm] = useState<{ open: boolean | undefined, data: Producto | null }>({ open: false, data: null })
  // ✅ TODOS LOS HOOKS PRIMERO
  const [refreshTable, setRefreshTable] = useState(false);

  const [productos, setProductos] = useState<Producto[]>([]);
  const [respaldoFiltros, setRespaldoFiltros] = useState<ProductoFilter | null>(null);
  const [totalRows, setTotalRows] = useState(0);

  useEffect(() => {
    setData({
      titulo: "Maestro de Productos",
      buttons: [
        {
          Texto: "Agregar Producto",
          icon: IconPlus,
          action: () => setOpenForm({ open: true, data: null }),
        },
      ],
    });
  }, [setProductos]);

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

  const columns: Column<Producto>[] = [
    {
      field: "sku",
      headerName: "SKU",
      align: "left",
      sortable: true,
      renderCell: (value, row: Producto) => (
        <ButtonActionTableComponent texto={`${row.sku} - ${row.ean}`} action={() => {
          setOpenForm({ open: true, data: row })
        }}></ButtonActionTableComponent>
      ),
    },
    {
      field: "descripcion",
      headerName: "Descripción",
      align: "left",
      sortable: true,
    },
    {
      field: "casePack",
      headerName: "Case Pack",
      align: "left",
      sortable: true,
    },
    {
      field: "uMedida",
      headerName: "U.M.",
      align: "left",
      sortable: true,
    },
    {
      field: "costoPromedio",
      headerName: "C.P.",
      align: "left",
      sortable: true
      //   renderCell: (_, row: Producto) => {
      //     const tieneFoto = !!row.checkFace?.nombreFile;

      //     if (!tieneFoto) {
      //       return (
      //         <Badge color="red" variant="filled">
      //           No Tiene
      //         </Badge>
      //       );
      //     }

      //     return (
      //       <Button
      //         color={color_AzulLinea}
      //         onClick={() => {
      //           const url = `data:image/jpeg;base64,${row.checkFace.file_base64}`;
      //           setImageModal({
      //             url,
      //             filename: row.checkFace.nombreFile,
      //           });
      //           setOpenModal(true);
      //         }}
      //       >
      //         Ver
      //       </Button>
      //     );
      //   },
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
      ? await createProducto(data)
      : await updateProducto(data);
    if (!result.success) {
      notifications.show({title: "ERROR", message: result.mensaje});
      hide();
      return;
    }
    notifications.show({title: !data._id ? "Producto Creado": "Producto Actualizado", message: result.mensaje});
    handlerClose();
    setRefreshTable((prev) => !prev);
    hide();
  };

  const handlerFilter = async (filtrosCampos: ProductoFilter) => {
    show();
    const result = await getAllProductosByFilter(filtrosCampos);
    if (!result.success) {
      notifications.show({
        title: "Error",
        message: result.mensaje,
      });
      hide();
      return;
    }
    setProductos(result.datos || []);
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
      <ProductosFilter
        handlerFilter={handlerFilter}
        SetRespaldoFiltros={setRespaldoFiltros}
      />
      <ResponsiveDataTable
        columns={columns}
        rows={productos}
        manualMode={false}
        totalRows={totalRows}
      />
      {/* <ImageViewComponent
        open={openModal}
        handlerClose={() => setOpenModal(false)}
        data={imageModal}
      /> */}
      <ProductoForm
        opened={openForm.open}
        initialData={openForm.data}
        onClose={handlerClose}
        onSave={handleSave}
      ></ProductoForm>
    </div>
  );
}