"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Modal,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconFileSpreadsheet,
  IconLockSquareRounded,
  IconPlus,
} from "@tabler/icons-react";

import ResponsiveDataTable, { Column } from "../common/responsiveTable.component";
import ButtonActionTableComponent from "../common/buttonTable.component";
import FileSelector from "../common/fileButton.component";

import ProductosFilter from "./productos.filter";
import ProductoForm from "./producto.forms";
import SubdptoFlagsAccordion from "./acordeon/subdpto.component";

import { Producto } from "@/lib/interfaces/maestros/productos.interfaces";
import { ProductoFilter } from "@/lib/interfaces/filtros/productos.filters.interface";

import {
  createProducto,
  getAllProductosByFilter,
  updateProducto,
  importarSkusAction,
} from "@/lib/actions/maestros/producto.action";

import { leerSkusDesdeArchivo } from "@/lib/hooks/fileProcessor";
import { useLoadingStore } from "@/lib/store/useLoadingStore";
import { useTitlePageStore } from "@/lib/store/useTitlePageStore";
import { validarRolUsuario } from "@/lib/hooks/verificarRol";
import UnAuthoriceComponent from "../common/unauthorice.component";
import { useUserDataStore } from "@/lib/store/useUserDataStore";

export default function ProductosComponent() {
  /* ===================== STORES ===================== */
  const { show, hide } = useLoadingStore();
  const { setData } = useTitlePageStore();

  /* ===================== STATES ===================== */
  const [vista, setVista] = useState<"LISTA" | "FLAGS">("LISTA");
  const [refreshTable, setRefreshTable] = useState(false);
  const [sensibleTienda, setSensibleTienda] = useState(false);
  const [sensibleCentral, setSensibleCentral] = useState(false);

  const [productos, setProductos] = useState<Producto[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [respaldoFiltros, setRespaldoFiltros] =
    useState<ProductoFilter | null>(null);
  const { userData } = useUserDataStore();

  const [openForm, setOpenForm] = useState<{
    open: boolean;
    data: Producto | null;
  }>({ open: false, data: null });

  /* ===== IMPORT SKUS ===== */
  const [openImportModal, setOpenImportModal] = useState(false);
  const [fileSkus, setFileSkus] = useState<File | null>(null);
  const [skusNoEncontrados, setSkusNoEncontrados] = useState<string[]>([]);

  /* ===================== HEADER ===================== */
  useEffect(() => {
    setData({
      titulo: "Maestro de Productos",
      buttons: [
        {
          Texto: "Importar SKUS",
          icon: IconFileSpreadsheet,
          action: () => setOpenImportModal(true),
        },
        {
          Texto:
            vista === "LISTA"
              ? "Mercadería Sensible"
              : "Volver a Productos",
          icon: IconLockSquareRounded,
          action: () =>
            setVista((prev) =>
              prev === "LISTA" ? "FLAGS" : "LISTA"
            ),
        },
        {
          Texto: "Agregar Producto",
          icon: IconPlus,
          action: () =>
            setOpenForm({ open: true, data: null }),
        },
      ],
    });
  }, [vista]);

  /* ===================== FETCH ===================== */
  useEffect(() => {
    if (!respaldoFiltros) return;

    const fetch = async () => {
      show();
      const result = await getAllProductosByFilter(
        respaldoFiltros
      );

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

    fetch();
  }, [refreshTable]);
  const ROLES_PERMITIDOS = ["administrador", "supervisor"];

  // ✅ VALIDACIÓN DESPUÉS DE LOS HOOKS
  const tieneAcceso = validarRolUsuario(userData, ROLES_PERMITIDOS);

  if (!tieneAcceso) {
    return <UnAuthoriceComponent />;
  }
  /* ===================== COLUMNS ===================== */
  const columns: Column<Producto>[] = [
    {
      field: "sku",
      headerName: "SKU - EAN",
      renderCell: (_, row) => (
        <ButtonActionTableComponent
          texto={`${row.sku} - ${row.ean}`}
          action={() =>
            setOpenForm({ open: true, data: row })
          }
        />
      ),
    },
    { field: "descripcion", headerName: "Descripción" },
    { field: "casePack", headerName: "Case Pack" },
    { field: "subdpto", headerName: "Sub Departamento" },
    { field: "uMedida", headerName: "U.M." },
    { field: "costoPromedio", headerName: "C.P." },
    {
      field: "marcaSensible",
      headerName: "Sensible Central",
      align: "center",
      renderCell: (_, r) => (
        <Badge color={r.marcaSensible ? "blue" : "red"}>
          {r.marcaSensible ? "Si" : "No"}
        </Badge>
      ),
    },
    {
      field: "isContable",
      headerName: "Sensible Tienda",
      align: "center",
      renderCell: (_, r) => (
        <Badge color={r.isContable ? "blue" : "red"}>
          {r.isContable ? "Si" : "No"}
        </Badge>
      ),
    },
  ];
  const toggleSensibleTienda = (checked: boolean) => {
    setSensibleTienda(checked);

    // ❌ Si tienda se desmarca, central también
    if (!checked) {
      setSensibleCentral(false);
    }
  };

  const toggleSensibleCentral = (checked: boolean) => {
    setSensibleCentral(checked);

    // ✅ Si central se marca, tienda se marca
    if (checked) {
      setSensibleTienda(true);
    }
  };


  /* ===================== HANDLERS ===================== */
  const handleSave = async (data: Partial<Producto>) => {
    show();
    const result = !data._id
      ? await createProducto(data)
      : await updateProducto(data);

    if (!result.success) {
      notifications.show({
        title: "Error",
        message: result.mensaje,
      });
      hide();
      return;
    }

    notifications.show({
      title: "Éxito",
      message: result.mensaje,
    });

    setOpenForm({ open: false, data: null });
    setRefreshTable((p) => !p);
    hide();
  };

  const importarSkus = async () => {
    if (!fileSkus) return;

    show();

    try {
      const skus = await leerSkusDesdeArchivo(fileSkus);

      if (skus.length === 0) {
        notifications.show({
          title: "Archivo inválido",
          message: "No se encontraron SKUs",
        });
        return;
      }

      const result = await importarSkusAction(skus, sensibleCentral, sensibleTienda);

      notifications.show({
        title: "Importación",
        message: result.mensaje,
      });

      setSkusNoEncontrados(result.datos || []);
      setRefreshTable((p) => !p);
    } finally {
      hide();
    }
  };

  /* ===================== RENDER ===================== */
  return (
    <div>
      {vista === "LISTA" && (
        <>
          <ProductosFilter
            handlerFilter={async (f) => {
              setRespaldoFiltros(f);
              setRefreshTable((p) => !p);
            }}
            SetRespaldoFiltros={setRespaldoFiltros}
          />

          <ResponsiveDataTable
            columns={columns}
            rows={productos}
            totalRows={totalRows}
          />

          <ProductoForm
            opened={openForm.open}
            initialData={openForm.data}
            onClose={() =>
              setOpenForm({ open: false, data: null })
            }
            onSave={handleSave}
          />
        </>
      )}

      {vista === "FLAGS" && <SubdptoFlagsAccordion />}

      {/* ===== MODAL IMPORT ===== */}
      <Modal
        opened={openImportModal}
        onClose={() => setOpenImportModal(false)}
        title="Importar SKUs como Mercadería Sensible"
      >
        <FileSelector
          file={fileSkus}
          onChange={setFileSkus}
          title="Se tomará solo los sku desde A2 hacia abajo"
        />
        <Checkbox
          mt="md"
          label="Sensible Tienda"
          checked={sensibleTienda}
          onChange={(e) =>
            toggleSensibleTienda(e.currentTarget.checked)
          }
        />

        <Checkbox
          mt="xs"
          label="Sensible Central"
          checked={sensibleCentral}
          onChange={(e) =>
            toggleSensibleCentral(e.currentTarget.checked)
          }
        />

        <Button fullWidth mt="md" onClick={importarSkus}>
          Procesar archivo
        </Button>

        {skusNoEncontrados.length > 0 && (
          <Card mt="md">
            <Text fw={600}>
              SKUs no encontrados ({skusNoEncontrados.length})
            </Text>

            {skusNoEncontrados.map((s) => (
              <Badge key={s} color="red" mr="xs" mt="xs">
                {s}
              </Badge>
            ))}
          </Card>
        )}
      </Modal>
    </div>
  );
}
