// "use client";
// import React, { useEffect, useState } from "react";
// import { Badge, Box, Button, Flex, Select } from "@mantine/core";
// import ResponsiveDataTable, {
//   Column,
// } from "@/lib/components/common/ResponsiveDataTable";
// import { useLoadingStore } from "@/lib/stores/useLoadingStore";
// import { toast } from "sonner";
// import { IconArrowRight, IconPlus } from "@tabler/icons-react";
// import { DatePickerInput } from "@mantine/dates";
// import { mapToSelectOptions } from "@/lib/hooks/selectMapper";
// import { TipoCambioViewModel } from "@/lib/interfaces/tipoCambio.interface";
// import {
//   createTipoCambio,
//   getTipoCambioComboAnio,
//   getTipoCambioMonedaAnioMes,
//   updateTipoCambio,
// } from "@/lib/actions/Configuraciones/tipoCambio.action";
// import { meses } from "@/lib/constantes";
// import { ComboViewModel } from "@/lib/interfaces/combo.interface";
// import { getAllMoneda } from "@/lib/actions/Configuraciones/moneda.action";
// import { MonedaModel } from "@/lib/interfaces/moneda.interface";
// import { useTitlePageStore } from "@/lib/stores/useTitlePageSotre";
// import TipoCambioForm from "./tipoCambio.form";
// import ButtonActionTableComponent from "@/lib/components/common/buttonActionTable.component";

// // export const formatearFechaDDMMYYYY = (fecha?: string | null): string => {
// //   if (!fecha) return ""; // Evita errores si llega null o undefined
// //   const [anio, mes, dia] = fecha.split("-");
// //   return `${dia.padStart(2, "0")}/${mes.padStart(2, "0")}/${anio}`;
// // };

// export default function PageTipoCambio() {
//   const { show, hide } = useLoadingStore();
//   const [tipoCambio, setTipoCambio] = useState<TipoCambioViewModel[]>([]);
//   const { setData } = useTitlePageStore();
//   const [monedaOptions, setMonedas] = useState<MonedaModel[]>([]);
//   const [moneda, setMoneda] = useState<number>(-1);
//   const [anioOptions, setAnios] = useState<ComboViewModel[]>([]);
//   const [anio, setAnio] = useState<number>(new Date().getFullYear());
//   const [mesesOptions, setMeses] = useState<any[]>([]);
//   const [openForm, setOpenForm] = useState<{
//     open: boolean | undefined;
//     data: TipoCambioViewModel | null;
//   }>({
//     open: false,
//     data: null,
//   });
//   const [refreshTable, setRefreshTable] = useState(false);

//   const [mes, setMes] = useState<number>(new Date().getMonth() + 1);
//   const columns: Column<TipoCambioViewModel>[] = [
//     {
//       field: "fecha_Contable",
//       headerName: "Fecha",
//       renderCell: (value: any, row: TipoCambioViewModel) => {
//         return (
//           <ButtonActionTableComponent
//             texto={row.fecha_Contable}
//             action={() => {
//               setOpenForm({ open: true, data: row });
//             }}
//           />
//         );
//       },
//     },
//     { field: "descripcion_Corta", headerName: "Moneda" },
//     { field: "tC_Compra", headerName: "Compra" },
//     {
//       field: "tC_Venta",
//       headerName: "Venta",
//     },
//     {
//       field: "descripcion_CortaBase",
//       headerName: "Moneda Base",
//     },
//     {
//       field: "estado",
//       headerName: "Estado",
//       renderCell: (row) => (
//         <Badge color={row ? "green" : "red"} variant="light">
//           {row ? "Activo" : "Inactivo"}
//         </Badge>
//       ),
//     },
//     { field: "fechaCreacion", headerName: "F.Creación" },
//     { field: "usuarioCreador", headerName: "Creado por" },
//   ];
//   const handlerClose = () => {
//     setOpenForm({ open: false, data: null });
//   };
//   const handleSave = async (
//     data: Partial<TipoCambioViewModel>
//   ): Promise<void> => {
//     show();
//     const result = !data.id
//       ? await createTipoCambio(data)
//       : await updateTipoCambio(data);
//     if (!result.success) {
//       toast.warning(result.mensaje);
//       hide();
//       return;
//     }
//     toast.success(result.mensaje);
//     handlerClose();
//     setRefreshTable((prev) => !prev);
//     hide();
//   };
//   const fetchTipoCambio = async ({
//     moneda,
//     anio,
//     mes,
//   }: {
//     moneda?: number;
//     anio?: number;
//     mes?: number;
//   }) => {
//     show();
//     const result = await getTipoCambioMonedaAnioMes({
//       idMoneda: moneda,
//       anio,
//       mes,
//     });
//     if (!result.success) {
//       toast(result.mensaje);
//       hide();
//       return;
//     }
//     const mappedData: TipoCambioViewModel[] = (result.datos || []).map(
//       (item: TipoCambioViewModel) => ({
//         id: item.id,
//         fecha_Contable: item.fecha_Contable ?? "",
//         descripcion_Corta: item.moneda.descripcion_Corta ?? "",
//         fecha_ContableString: item.fecha_ContableString ?? "",
//         tC_Compra: item.tC_Compra ?? "",
//         tC_Venta: item.tC_Venta ?? "",
//         descripcion_CortaBase: item.monedaBase.descripcion_Corta ?? "",
//         estado: item.estado ?? "",
//         fechaCreacion: item.fechaCreacion ?? "",
//         moneda_Base_Id: item.moneda_Base_Id ?? -1,
//         moneda_Id: item.moneda_Id ?? -1,
//         usuarioCreador: item.usuarioCreador.nombreConca ?? "",
//       })
//     );
//     setTipoCambio(mappedData);
//     hide();
//   };
//   useEffect(() => {
//     show();
//     setData({
//       titulo: "Lista de Tipo de Cambio",
//       buttons: [
//         {
//           Texto: "Agregar Cambio",
//           icon: IconPlus,
//           action: () => setOpenForm({ open: true, data: null }),
//         },
//       ],
//     });
//     const fetchComboMoneda = async () => {
//       const res = await getAllMoneda();
//       if (!res.success) {
//         toast.error(res.mensaje || "Error al cargar las monedas");
//         hide();
//         return;
//       }
//       setMonedas(res.datos || []);
//     };
//     const fetchComboAnio = async () => {
//       const res = await getTipoCambioComboAnio();
//       if (!res.success) {
//         toast.error(res.mensaje || "Error al cargar los años");
//         hide();
//         return;
//       }
//       setAnios(res.datos || []);
//     };
//     setMeses(meses);
//     fetchComboMoneda();
//     fetchComboAnio();
//     hide();
//   }, []);
//   useEffect(() => {
//     fetchTipoCambio({ anio, mes });
//   }, [anio, mes, refreshTable]);
//   const mesesSelect = mapToSelectOptions(
//     mesesOptions,
//     (c) => c.value,
//     (c) => c.label
//   );
//   const anioSelect = mapToSelectOptions(
//     anioOptions,
//     (c) => c.value,
//     (c) => c.text
//   );
//   const monedaSelect = mapToSelectOptions(
//     monedaOptions,
//     (c) => c.id!,
//     (c) => c.descripcion_Corta!
//   );
//   const data = tipoCambio;
//   return (
//     <>
//       <Box w={"100%"}>
//         <Flex gap={9} mb={5}>
//           {/* <Select
//             label="Moneda"
//             placeholder="Selecciona una moneda"
//             data={monedaSelect.length > 0 ? monedaSelect : []}
//             value={moneda ? String(moneda) : ""}
//             onChange={(value) => {
//               setMoneda(value ? Number(value) : -1);
//             }}
//             searchable
//           /> */}
//           <Select
//             label="Año"
//             placeholder="Selecciona un año"
//             data={anioSelect.length > 0 ? anioSelect : []}
//             value={anio ? String(anio) : "2025"}
//             onChange={(value) => {
//               setAnio(value ? Number(value) : 2025);
//             }}
//             searchable
//           />
//           <Select
//             label="Mes"
//             placeholder="Selecciona un mes"
//             data={mesesSelect.length > 0 ? mesesSelect : []}
//             value={mes ? String(mes) : "-1"}
//             onChange={(value) => {
//               setMes(value ? Number(value) : -1);
//             }}
//             searchable
//           />
//         </Flex>
//         <Box>
//           <ResponsiveDataTable rows={data} columns={columns} />
//         </Box>
//       </Box>
//       <TipoCambioForm
//         opened={openForm.open}
//         initialData={openForm.data}
//         monedas={monedaOptions}
//         onClose={handlerClose}
//         onSave={handleSave}
//       ></TipoCambioForm>
//     </>
//   );
// }
