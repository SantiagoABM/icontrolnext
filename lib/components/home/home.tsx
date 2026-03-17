"use client";

import { getDetalleReporteByTim } from "@/lib/actions/maestros/detalle.action";
import { getReportesByMotivo } from "@/lib/actions/maestros/reporte.action";
import { Detalle, Reporte } from "@/lib/interfaces/maestros/reportes.interface";
import { useTitlePageStore } from "@/lib/store/useTitlePageStore";
import ExcelJS from "exceljs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";
import dayjs from "dayjs";
import { DateTimePicker } from "@mantine/dates";
import "@mantine/dates/styles.css";

import {
  Card,
  Grid,
  Table,
  Tabs,
  TextInput,
  Modal,
  Button,
  Text,
  MultiSelect,
  Select,
  Flex,
  NumberInput,
  Divider,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState, useMemo } from "react";
import { useMediaQuery } from "@mantine/hooks";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  ChartData,
  ChartOptions,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import { IconBox, IconFileExport, IconPackageOff, IconTrendingUp } from "@tabler/icons-react";
import { CATEGORIAS_MACRO, SUBDEPARTAMENTOS } from "@/lib/utils/constantes";
import { color_PrimarioDark, color_SecundarioDark } from './../../utils/constantes';
import { saveAs } from "file-saver";
import { useLoadingStore } from "@/lib/store/useLoadingStore";
import { formatDate } from "@/lib/hooks/helpers";
import { validarRolUsuario } from "@/lib/hooks/verificarRol";
import UnAuthoriceComponent from "../common/unauthorice.component";
import { useUserDataStore } from "@/lib/store/useUserDataStore";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function HomeComponent() {
  const { setData } = useTitlePageStore();
  const isMobile = useMediaQuery("(max-width: 900px)");
  const { show, hide } = useLoadingStore();
  const { userData } = useUserDataStore();

  const [selectedTim, setSelectedTim] = useState<Reporte | null>(null);
  const [limiteCriticos, setLimiteCrit] = useState<number>(10);
  const [montoMenor, setMontoMenor] = useState<number>(0);

  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [detalles, setDetalles] = useState<Detalle[]>([]);
  const [tipoMercaderia, setTipoMercaderia] =
    useState<"MS" | "CT" | null>(null);
  const [openExportModal, setOpenExportModal] = useState(false);

  const [empresaTransporte, setEmpresaTransporte] = useState("");
  const [conductor, setConductor] = useState("");
  const [fechaRecepcion, setFechaRecepcion] = useState<Date | null>(new Date());

  const [selectedDepartamento, setSelectedDepartamento] = useState<string[]>([]);
  const [subDptos, setSubDptos] = useState<string[]>([]);
  const [subDepartamentosFiltrados, setSubDepartamentosFiltrados] = useState<string[]>([]);
  const [subDepartamentosMSFiltrados, setSubDepartamentosMSFiltrados] = useState<string[]>([]);
  const [subDptosMS, setSubDptosMS] = useState<string[]>([]);
  const [selectedSubDpto, setSelectedSubDpto] = useState<string[]>([]);

  const graficosRef = useRef<HTMLDivElement>(null);
  const tablasRef = useRef<HTMLDivElement>(null);

  /* ===================== HOOKS DE CÓMPUTO ===================== */

  const detallesFiltrados = useMemo(() => {
    let data = [...detalles];
    if (selectedDepartamento.length > 0) {
      data = data.filter(d => selectedDepartamento.some(dept => d.subdpto?.startsWith(dept)));
    }
    if (selectedSubDpto.length > 0) {
      data = data.filter(d => d.subdpto && selectedSubDpto.includes(d.subdpto));
    }
    if (tipoMercaderia === "MS") data = data.filter(d => d.marcaSensible === true);
    if (tipoMercaderia === "CT") data = data.filter(d => d.isContable === true);
    return data;
  }, [detalles, selectedDepartamento, selectedSubDpto, tipoMercaderia]);

  /* ===================== FUNCIONES DE CARGA Y EXPORTACIÓN ===================== */

  const fetchReportes = async () => {
    show();
    const response = await getReportesByMotivo("T");
    if (!response.success) {
      notifications.show({ title: "ERROR", message: "Hubo un problema al cargar los reportes" });
      hide();
      return;
    }
    setReportes(response.datos);
    hide();
  };

  const procesarSubDptos = (data: Detalle[]) => {
    const lista = Array.from(new Set(data.map(d => (d.subdpto ?? "").trim().toUpperCase()).filter(s => s !== "" && s !== "NULL")));
    setSubDptos(lista);
  };

  const procesarSubDptosMS = (data: Detalle[]) => {
    const lista = Array.from(new Set(data.filter(d => d.marcaSensible === true).map(d => d.subdpto).filter((s): s is string => typeof s === "string" && s.trim() !== "")));
    setSubDptosMS(lista);
  };

  const fetchDetalle = async () => {
    if (!selectedTim?.tim) return;
    show();
    const response = await getDetalleReporteByTim(selectedTim.tim);
    if (!response.success) {
      notifications.show({ title: "ERROR", message: "Error al cargar detalles del TIM" });
      hide();
      return;
    }
    setDetalles(response.datos);
    procesarSubDptos(response.datos);
    procesarSubDptosMS(response.datos);
    setSelectedDepartamento([]);
    setSelectedSubDpto([]);
    hide();
  };

  const fetchDetalleSilencioso = async () => {
    if (!selectedTim?.tim) return;
    try {
      const response = await getDetalleReporteByTim(selectedTim.tim);
      if (!response.success) return;
      setDetalles(response.datos);
      procesarSubDptos(response.datos);
      procesarSubDptosMS(response.datos);
    } catch (e) {
      console.error("❌ Error polling:", e);
    }
  };

  const exportarPDF = async () => {
    show();
    const pdf = new jsPDF("p", "mm", "a4");
    let yPosition = 10;
    const captureAndAdd = async (ref: HTMLDivElement | null) => {
      if (!ref) return;
      await new Promise(r => setTimeout(r, 300));
      const canvas = await html2canvas(ref, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      if (yPosition + imgHeight > 280) { pdf.addPage(); yPosition = 10; }
      pdf.addImage(imgData, "PNG", 10, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 10;
    };
    await captureAndAdd(graficosRef.current);
    await captureAndAdd(tablasRef.current);
    pdf.save(`TIM_${selectedTim?.tim}_dashboard.pdf`);
    hide();
  };

  const exportarExcelTIM = async () => {
    if (!selectedTim?.tim) return;
    const now = new Date();
    const fechaGeneracion = now.toLocaleString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
    const fechaRec = dayjs(fechaRecepcion).format("DD/MM/YY HH:mm:ss");
    const origenRaw = selectedTim.origen ?? "";
    const movilOrigen = origenRaw.includes("CD Secos") ? "CD Secos" : "";
    const origenParts = origenRaw.trim().split(/\s+/);
    const codigoOrigen = origenParts.length > 0 ? origenParts[0] : "";
    const destinoRaw = selectedTim.destino ?? "";
    const destinoParts = destinoRaw.split(/\s*-\s*/);
    const codigoTienda = destinoParts.length > 0 ? destinoParts[0].trim() : "";
    const tiendaDestino = destinoParts.length > 1 ? destinoParts[1].trim() : "";

    const workbook = new ExcelJS.Workbook();
    const sheetResumen = workbook.addWorksheet("Resumen TIM");
    const faltantesExport = detallesFiltrados.filter(d => d.uRecibidas < d.uEnviadas);
    const sobrantesExport = detallesFiltrados.filter(d => d.uRecibidas > d.uEnviadas);
    const totalFaltantesE = faltantesExport.length;
    const totalSobrantesE = sobrantesExport.length;
    const montoFaltanteE = faltantesExport.reduce((s, d) => s + (d.uEnviadas - d.uRecibidas) * (d.costoPromedio ?? 0), 0);
    const montoSobranteE = sobrantesExport.reduce((s, d) => s + (d.uRecibidas - d.uEnviadas) * (d.costoPromedio ?? 0), 0);
    const totalEnvE = detallesFiltrados.reduce((s, d) => s + d.uEnviadas, 0);
    const totalRecE = detallesFiltrados.reduce((s, d) => s + d.uRecibidas, 0);
    const avanceE = totalEnvE > 0 ? (totalRecE / totalEnvE) * 100 : 0;
    const detallesMsTiendaE = detalles.filter(d => d.isContable === true);
    const envMsE = detallesMsTiendaE.reduce((s, d) => s + d.uEnviadas, 0);
    const recMsE = detallesMsTiendaE.reduce((s, d) => s + d.uRecibidas, 0);
    const porMsE = envMsE > 0 ? (recMsE / envMsE) * 100 : 0;

    sheetResumen.addRows([
      ["Fecha Generación", fechaGeneracion], ["TIM", selectedTim.tim], ["Origen", selectedTim.origen],
      ["Fecha Envío", formatDate(selectedTim.fechaEnvio)], ["Fecha Recepción", fechaRec], [],
      ["", "Unidades", "Monto (S/)"], ["Faltantes", totalFaltantesE, montoFaltanteE],
      ["Sobrantes", totalSobrantesE, montoSobranteE], ["Diferencia", (totalFaltantesE + totalSobrantesE), (montoSobranteE - montoFaltanteE)], [],
      ["%Validación MS", Number(porMsE.toFixed(2))], ["%Validación Móvil", Number(avanceE.toFixed(2))],
    ]);
    sheetResumen.columns.forEach(col => (col.width = 30));

    const sheetF = workbook.addWorksheet("Faltantes");
    sheetF.columns = [{ header: "FECHA ENVÍO", width: 15 }, { header: "FECHA RECEPCIÓN", width: 18 }, { header: "CÓDIGO TIENDA", width: 15 }, { header: "TIENDA", width: 22 }, { header: "ORIGEN", width: 15 }, { header: "MÓVIL", width: 12 }, { header: "EMPRESA TRANSPORTE", width: 25 }, { header: "CONDUCTOR", width: 22 }, { header: "ASUNTO", width: 30 }, { header: "TIM", width: 12 }, { header: "OLPN", width: 16 }, { header: "SUBDEPARTAMENTO", width: 20 }, { header: "SKU", width: 15 }, { header: "EAN", width: 18 }, { header: "DESCRIPCIÓN", width: 40 }, { header: "U.M.", width: 10 }, { header: "GUIA", width: 12 }, { header: "RECIBIDA", width: 12 }, { header: "DIF", width: 10 }, { header: "COSTO", width: 12 }, { header: "MONTO FALTANTE", width: 18 }, { header: "RESPONSABLE", width: 20 }, { header: "RESOLUCIÓN", width: 15 }, { header: "MS", width: 10 }];
    faltantesExport.forEach(d => {
      const dif = d.uEnviadas - d.uRecibidas;
      const costo = d.costoPromedio ?? 0;
      const asunto = `DISCREPANCIA_${dayjs(fechaRecepcion).format("DD/MM/YY")}_${movilOrigen}_TIM_${selectedTim.tim}_${codigoTienda}`;
      sheetF.addRow([formatDate(selectedTim.fechaEnvio), dayjs(fechaRecepcion).format("DD/MM/YY HH:mm:ss"), codigoTienda, tiendaDestino, codigoOrigen, movilOrigen, empresaTransporte, conductor, asunto, selectedTim.tim, d.olpn ?? "", d.subdpto ?? "", d.sku, d.ean ?? "", d.descripcion, d.uMedida ?? "", d.uEnviadas, d.uRecibidas, dif, costo, dif * costo, d.modificadoPor ?? "", "PENDIENTE", (d.marcaSensible ? "C" : (d.isContable ? "T" : "-"))]);
    });

    const sheetS = workbook.addWorksheet("Sobrantes");
    sheetS.columns = [{ header: "FECHA ENVÍO", width: 15 }, { header: "FECHA RECEPCIÓN", width: 18 }, { header: "TIM", width: 12 }, { header: "SKU", width: 15 }, { header: "DESCRIPCIÓN", width: 40 }, { header: "SUBDPTO", width: 15 }, { header: "U. ENVIADAS", width: 15 }, { header: "U. RECIBIDAS", width: 15 }, { header: "SOBRANTE", width: 12 }, { header: "COSTO", width: 12 }, { header: "TOTAL", width: 15 }, { header: "MS", width: 10 }];
    sobrantesExport.forEach(d => {
      const sob = d.uRecibidas - d.uEnviadas;
      const costo = d.costoPromedio ?? 0;
      sheetS.addRow([formatDate(selectedTim.fechaEnvio), dayjs(fechaRecepcion).format("DD/MM/YY HH:mm:ss"), selectedTim.tim, d.sku, d.descripcion, d.subdpto, d.uEnviadas, d.uRecibidas, sob, costo, sob * costo, (d.marcaSensible ? "C" : (d.isContable ? "T" : "-"))]);
    });

    const buf = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `BITACORA_TIM_${selectedTim.tim}.xlsx`);
  };

  const handleLimpiarFiltros = () => {
    setSelectedDepartamento([]);
    setSelectedSubDpto([]);
    setTipoMercaderia(null);
  };

  /* ===================== HOOKS DE EFECTO ===================== */

  useEffect(() => {
    setData({
      titulo: "Dashboard",
      buttons: [
        { Texto: "Exportar Excel", icon: IconFileExport, action: () => setOpenExportModal(true) },
        { Texto: "Exportar PDF", icon: IconFileExport, action: () => exportarPDF() },
      ]
    });
  }, [selectedTim, detalles, fechaRecepcion, setData]);

  useEffect(() => {
    if (!selectedTim?.tim) return;
    const interval = setInterval(() => { fetchDetalleSilencioso(); }, 20000);
    return () => clearInterval(interval);
  }, [selectedTim?.tim]);

  useEffect(() => { fetchReportes(); }, []);
  useEffect(() => { if (selectedTim) fetchDetalle(); }, [selectedTim]);

  useEffect(() => {
    if (openExportModal) setFechaRecepcion(new Date());
  }, [openExportModal]);

  useEffect(() => {
    if (selectedDepartamento.length === 0) {
      setSubDepartamentosFiltrados(subDptos);
      setSubDepartamentosMSFiltrados(subDptosMS);
      return;
    }
    const filtered = subDptos.filter(s => selectedDepartamento.some(dept => s.startsWith(dept)));
    const filteredMS = subDptosMS.filter(s => selectedDepartamento.some(dept => s.startsWith(dept)));
    setSubDepartamentosFiltrados(filtered);
    setSubDepartamentosMSFiltrados(filteredMS);
  }, [selectedDepartamento, subDptos, subDptosMS]);

  /* ===================== VALIDACIONES ===================== */

  if (!userData) return null;
  const ROLES_PERMITIDOS = ["administrador", "supervisor", "operador"];
  const tieneAcceso = validarRolUsuario(userData, ROLES_PERMITIDOS);
  if (!tieneAcceso) return <UnAuthoriceComponent />;

  /* ===================== MÉTRICAS FINALES ===================== */

  const detallesMsTienda = detalles.filter(d => d.isContable === true);
  const totalEnviadasMs = detallesMsTienda.reduce((s, d) => s + d.uEnviadas, 0);
  const totalRecibidasMs = detallesMsTienda.reduce((s, d) => s + d.uRecibidas, 0);
  const porcentajeMsTienda = totalEnviadasMs > 0 ? (totalRecibidasMs / totalEnviadasMs) * 100 : 0;

  const totalDetalles = detallesFiltrados.length;
  const faltantes = detallesFiltrados.filter(d => d.uRecibidas < d.uEnviadas);
  const sobrantes = detallesFiltrados.filter(d => d.uRecibidas > d.uEnviadas);
  const conformes = detallesFiltrados.filter(d => d.uRecibidas === d.uEnviadas).length;

  const totalFaltantes = faltantes.length;
  const totalSobrantes = sobrantes.length;
  const montoTotalFaltante = faltantes.reduce((s, d) => s + (d.uEnviadas - d.uRecibidas) * (d.costoPromedio ?? 0), 0);
  const montoTotalSobrantes = sobrantes.reduce((s, d) => s + (d.uRecibidas - d.uEnviadas) * (d.costoPromedio ?? 0), 0);
  const totalEnviadas = detallesFiltrados.reduce((s, d) => s + d.uEnviadas, 0);
  const totalRecibidas = detallesFiltrados.reduce((s, d) => s + d.uRecibidas, 0);
  const avance = totalEnviadas > 0 ? (totalRecibidas / totalEnviadas) * 100 : 0;

  const criticosBase = faltantes.filter(d => (d.costoPromedio * (d.uEnviadas - d.uRecibidas)) >= montoMenor);
  const criticos = [...criticosBase].sort((a, b) => (b.costoPromedio * (b.uEnviadas - b.uRecibidas)) - (a.costoPromedio * (a.uEnviadas - a.uRecibidas))).slice(0, limiteCriticos);
  const sobrantesOrdenados = [...sobrantes].sort((a, b) => (b.costoPromedio * (b.uRecibidas - b.uEnviadas)) - (a.costoPromedio * (a.uRecibidas - a.uEnviadas))).slice(0, limiteCriticos);

  const donaData = {
    labels: ["Conformes", "Faltantes", "Sobrantes"],
    datasets: [{ data: [conformes, totalFaltantes, totalSobrantes], backgroundColor: ["#4caf50", "#f44336", "#2196f3"] }]
  };

  const faltantesPorCat: Record<string, number> = {};
  detallesFiltrados.forEach(d => { if (d.uRecibidas < d.uEnviadas) { const key = d.subdpto ?? "SIN"; faltantesPorCat[key] = (faltantesPorCat[key] || 0) + 1; } });
  const sortedCats = Object.entries(faltantesPorCat).sort((a, b) => b[1] - a[1]);
  const MAX_CATS = 15;
  let topCats = sortedCats.slice(0, MAX_CATS);
  if (sortedCats.length > MAX_CATS) {
    const totalOtros = sortedCats.slice(MAX_CATS).reduce((s, [, v]) => s + v, 0);
    topCats = [...topCats, ["OTROS", totalOtros]];
  }

  const barLabels = topCats.map(([code]) => {
    if (code === "OTROS") return "OTROS";
    const desc = SUBDEPARTAMENTOS.find(s => s.codigo === code)?.descripcion;
    return `${code} - ${desc ?? ""}`;
  });

  const barData: ChartData<"bar", number[], string> = {
    labels: barLabels,
    datasets: [{ label: "Faltantes", data: topCats.map(([, v]) => v), backgroundColor: "#ff9800" }]
  };

  const barOptions: ChartOptions<"bar"> = { indexAxis: "y", plugins: { legend: { display: false } }, maintainAspectRatio: false, responsive: true };

  let barTitle = "Faltantes por categoría (Todos los departamentos)";
  if (selectedSubDpto.length > 0) {
    barTitle = selectedSubDpto.length === 1 ? `Faltantes - Subdepartamento ${selectedSubDpto[0]}` : `Faltantes - Múltiples Subdepartamentos (${selectedSubDpto.length})`;
  } else if (selectedDepartamento.length > 0) {
    barTitle = selectedDepartamento.length === 1 ? `Faltantes por categoría — Departamento ${selectedDepartamento[0]}` : `Faltantes por categoría — Múltiples Departamentos (${selectedDepartamento.length})`;
  } else if (tipoMercaderia) {
    barTitle = tipoMercaderia === "MS" ? "Faltantes — Sensible Central" : "Faltantes — Sensible Tienda";
  }

  /* ===================== RENDER HELPERS ===================== */

  const renderResumen = () => (
    detallesFiltrados.length > 0 ? (
      <Grid mt="xl" gutter="lg">
        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}><Card shadow="lg" p="lg" bg={color_PrimarioDark}><Text size="sm" fw={500}>Productos</Text><Text size="xl" fw={900}><IconBox /> {totalDetalles}</Text></Card></Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}><Card shadow="lg" p="lg" bg="red"><Text size="sm" fw={500}>Faltantes</Text><Text size="xl" fw={900}><IconPackageOff /> {totalFaltantes}</Text></Card></Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}><Card shadow="lg" p="lg" bg="blue"><Text size="sm" fw={500}>Sobrantes</Text><Text size="xl" fw={900}><IconPackageOff /> {totalSobrantes}</Text></Card></Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}><Card shadow="lg" p="lg" bg="red"><Text size="sm" fw={500}>Monto Faltante</Text><Text size="xl" fw={900}>S/ {montoTotalFaltante.toFixed(2)}</Text></Card></Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}><Card shadow="lg" p="lg" bg="blue"><Text size="sm" fw={500}>Monto Sobrante</Text><Text size="xl" fw={900}>S/ {montoTotalSobrantes.toFixed(2)}</Text></Card></Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}><Card shadow="lg" p="lg" bg={color_SecundarioDark}><Text size="sm" fw={600}>% Avance</Text><Text size="xl" fw={900}><IconTrendingUp /> {avance.toFixed(1)}%</Text></Card></Grid.Col>
      </Grid>
    ) : <Text mt="xl" c="dimmed">Selecciona un TIM para ver el resumen.</Text>
  );

  const renderGraficos = () => (
    detallesFiltrados.length > 0 ? (
      <Grid mt="xl" gutter="lg">
        <Grid.Col span={{ base: 12, md: 6 }}><Card shadow="md" p="lg" style={{ height: 320 }}><Text ta="center" fw="bold" mb="xs">Status Unidades</Text><div style={{ height: 260 }}><Doughnut data={donaData} options={{ maintainAspectRatio: false }} /></div></Card></Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}><Card shadow="md" p="lg" style={{ height: 320 }}><Text ta="center" fw="bold" mb="xs">{barTitle}</Text><div style={{ height: 260 }}><Bar data={barData} options={barOptions} /></div></Card></Grid.Col>
      </Grid>
    ) : <Text mt="xl" c="dimmed">No hay datos para mostrar gráficos.</Text>
  );

  const CriticosCard = () => (
    <Card mt="xl" p="lg" shadow="md">
      <Text fw="bold" size="xl">Top {criticos.length} Faltantes Críticos (≥ S/{montoMenor})</Text>
      <Divider my="sm" />
      {criticos.length === 0 ? <Text c="dimmed" my="md">No hay productos críticos.</Text> : (
        <Table striped highlightOnHover withTableBorder withColumnBorders mt="md">
          <Table.Thead><Table.Tr><Table.Th>SKU</Table.Th><Table.Th>Descripción</Table.Th><Table.Th>Faltantes</Table.Th><Table.Th>Monto</Table.Th></Table.Tr></Table.Thead>
          <Table.Tbody>{criticos.map((d, i) => (<Table.Tr key={i}><Table.Td>{d.sku}</Table.Td><Table.Td>{d.descripcion}</Table.Td><Table.Td style={{ color: "red", fontWeight: 700 }}>{d.uEnviadas - d.uRecibidas}</Table.Td><Table.Td style={{ fontWeight: 800 }}>S/ {((d.uEnviadas - d.uRecibidas) * (d.costoPromedio ?? 0)).toFixed(2)}</Table.Td></Table.Tr>))}</Table.Tbody>
        </Table>
      )}
    </Card>
  );

  const SobrantesCard = () => (
    <Card mt="xl" p="lg" shadow="md">
      <Text fw="bold" size="xl">Top {sobrantesOrdenados.length} Productos Sobrantes</Text>
      <Divider my="sm" />
      {sobrantesOrdenados.length === 0 ? <Text c="dimmed">No hay sobrantes.</Text> : (
        <Table striped highlightOnHover withTableBorder withColumnBorders mt="md">
          <Table.Thead><Table.Tr><Table.Th>SKU</Table.Th><Table.Th>Descripción</Table.Th><Table.Th>Sobrantes</Table.Th><Table.Th>Monto</Table.Th></Table.Tr></Table.Thead>
          <Table.Tbody>{sobrantesOrdenados.map((d, i) => (<Table.Tr key={i}><Table.Td>{d.sku}</Table.Td><Table.Td>{d.descripcion}</Table.Td><Table.Td style={{ color: "blue", fontWeight: 700 }}>{d.uRecibidas - d.uEnviadas}</Table.Td><Table.Td style={{ fontWeight: 800 }}>S/ {((d.uRecibidas - d.uEnviadas) * (d.costoPromedio ?? 0)).toFixed(2)}</Table.Td></Table.Tr>))}</Table.Tbody>
        </Table>
      )}
    </Card>
  );

  const renderTablas = () => (
    detallesFiltrados.length === 0 ? <Text mt="xl" c="dimmed">No hay datos para mostrar tablas.</Text> : (
      <>
        <Grid mt="lg" gutter="md">
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}><NumberInput label="Monto mínimo crítico" min={0} value={montoMenor} onChange={(v) => setMontoMenor(Number(v) || 0)} /></Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}><NumberInput label="Top N" min={1} value={limiteCriticos} onChange={(v) => setLimiteCrit(Number(v) || 1)} /></Grid.Col>
        </Grid>
        {isMobile ? (
          <Tabs defaultValue="criticos" mt="md"><Tabs.List><Tabs.Tab value="criticos">Críticos</Tabs.Tab><Tabs.Tab value="sobrantes">Sobrantes</Tabs.Tab></Tabs.List><Tabs.Panel value="criticos"><CriticosCard /></Tabs.Panel><Tabs.Panel value="sobrantes"><SobrantesCard /></Tabs.Panel></Tabs>
        ) : <Grid mt="lg" gutter="lg"><Grid.Col span={{ base: 12, md: 6 }}><CriticosCard /></Grid.Col><Grid.Col span={{ base: 12, md: 6 }}><SobrantesCard /></Grid.Col></Grid>}
      </>
    )
  );

  return (
    <div>
      <Flex gap="md" align="flex-end" wrap="wrap">
        <Select label="TIM" placeholder="Seleccione..." style={{ width: 260 }} data={reportes.map(r => ({ value: String(r.tim), label: `${r.tim} - ${r.origen}` }))} searchable clearable onChange={v => setSelectedTim(reportes.find(x => String(x.tim) === v) ?? null)} />
        <MultiSelect label="Departamento" disabled={!selectedTim} placeholder="Dptos..." style={{ width: 260 }} data={Array.from(new Set(subDptos.map(s => s.substring(0, 3)))).map(prefix => ({ value: prefix, label: `${prefix} - ${CATEGORIAS_MACRO.find(c => prefix === c.prefix)?.label ?? ""}` }))} value={selectedDepartamento} onChange={v => { setSelectedDepartamento(v); setSelectedSubDpto([]); }} styles={{ input: { maxHeight: '36px', overflow: 'hidden' } }} />
        <MultiSelect label="Subdepartamento" disabled={selectedDepartamento.length === 0} placeholder="Subs..." style={{ width: 290 }} data={subDepartamentosFiltrados.map(s => ({ value: s, label: `${s} - ${SUBDEPARTAMENTOS.find(d => d.codigo === s)?.descripcion ?? ""}` }))} value={selectedSubDpto} onChange={v => setSelectedSubDpto(v)} styles={{ input: { maxHeight: '36px', overflow: 'hidden' } }} />
        <Select label="Mercadería" disabled={detalles.length === 0} placeholder="Todas" style={{ width: 200 }} data={[{ value: "MS", label: "Sensible Central" }, { value: "CT", label: "Sensible Tienda" }]} value={tipoMercaderia} clearable onChange={v => setTipoMercaderia(v as any)} />
        <Button onClick={handleLimpiarFiltros} color="green" h={40}>Limpiar</Button>
      </Flex>

      {isMobile ? (
        <Tabs defaultValue="resumen" mt="lg"><Tabs.List><Tabs.Tab value="resumen">Resumen</Tabs.Tab><Tabs.Tab value="graficos">Gráficos</Tabs.Tab><Tabs.Tab value="tablas">Tablas</Tabs.Tab></Tabs.List><Tabs.Panel value="resumen">{renderResumen()}</Tabs.Panel><Tabs.Panel value="graficos"><div ref={graficosRef}>{renderGraficos()}</div></Tabs.Panel><Tabs.Panel value="tablas"><div ref={tablasRef}>{renderTablas()}</div></Tabs.Panel></Tabs>
      ) : (
        <><div style={{ marginBottom: 20 }}>{renderResumen()}</div><div ref={graficosRef}>{renderGraficos()}</div><div ref={tablasRef} style={{ marginTop: 24 }}>{renderTablas()}</div></>
      )}

      <Modal opened={openExportModal} onClose={() => setOpenExportModal(false)} title="Exportar Excel">
        <TextInput label="Empresa" value={empresaTransporte} onChange={e => setEmpresaTransporte(e.currentTarget.value)} required />
        <TextInput mt="sm" label="Conductor" value={conductor} onChange={e => setConductor(e.currentTarget.value)} required />
        <DateTimePicker mt="sm" label="Fecha Recepción" placeholder="Seleccione..." value={fechaRecepcion as any} onChange={v => setFechaRecepcion(v as any)} required valueFormat="DD/MM/YY HH:mm:ss" />
        <Button fullWidth mt="md" onClick={() => { if (empresaTransporte && conductor && fechaRecepcion) { setOpenExportModal(false); exportarExcelTIM(); } }}>Exportar</Button>
      </Modal>
    </div>
  );
}