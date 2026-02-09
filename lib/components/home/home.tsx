"use client";

import { getDetalleReporteByTim } from "@/lib/actions/maestros/detalle.action";
import { getReportesByMotivo } from "@/lib/actions/maestros/reporte.action";
import { Detalle, Reporte } from "@/lib/interfaces/maestros/reportes.interface";
import { useTitlePageStore } from "@/lib/store/useTitlePageStore";
import ExcelJS from "exceljs";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useRef } from "react";

import {
  Card,
  Grid,
  Select,
  Text,
  Divider,
  NumberInput,
  Flex,
  Table,
  Tabs,
  TextInput,
  Modal,
  Button,
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
import { IconBox, IconFile, IconFileExport, IconPackageOff, IconTrendingUp } from "@tabler/icons-react";
import { CATEGORIAS_MACRO, color_Primario, color_primary_darkMode, color_secondary_darkMode, color_SecundarioDark, SUBDEPARTAMENTOS } from "@/lib/utils/constantes";
import { color_PrimarioDark } from './../../utils/constantes';
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
  //exportarExcelTIM
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
  const [fechaRecepcion, setFechaRecepcion] = useState(""); // dd/mm/yy

  const [selectedDepartamento, setSelectedDepartamento] = useState<string | null>(null);
  const [subDptos, setSubDptos] = useState<string[]>([]);
  const [subDepartamentosFiltrados, setSubDepartamentosFiltrados] = useState<string[]>([]);
  const [subDepartamentosMSFiltrados, setSubDepartamentosMSFiltrados] = useState<string[]>([]);
  const [subDptosMS, setSubDptosMS] = useState<string[]>([]);

  const [selectedSubDpto, setSelectedSubDpto] = useState<string | null>(null);

  /* ===================== CARGA INICIAL ===================== */
  type ExportParams = {
    empresaTransporte: string;
    conductor: string;
    fechaRecepcion: string; // dd/mm/yy
  };


  useEffect(() => {
    setData({
      titulo: "Dashboard",
      buttons: [
        {
          Texto: "Exportar Excel",
          icon: IconFileExport,
          action: () => setOpenExportModal(true),
        }
        ,
        {
          Texto: "Exportar PDF",
          icon: IconFileExport,
          action: () => exportarPDF(),
        },
      ]
    });
  }, [selectedTim, detalles]);
  useEffect(() => {
    if (!selectedTim?.tim) return;

    console.log("🟢 Iniciando polling TIM:", selectedTim.tim);

    const interval = setInterval(() => {
      fetchDetalleSilencioso();
    }, 20000); // ⏱️ 5 segundos

    return () => {
      console.log("🧹 Deteniendo polling");
      clearInterval(interval);
    };
  }, [selectedTim?.tim]);

  const fetchReportes = async () => {
    show();

    const response = await getReportesByMotivo("T");
    if (!response.success) {
      notifications.show({
        title: "ERROR",
        message: "Hubo un problema al cargar los reportes",
      });
      return;
    }
    setReportes(response.datos);
    hide();

  };

  if (!userData) {
    return null; // o <LoadingOverlay visible />
  }

  const ROLES_PERMITIDOS = ["administrador", "supervisor", "operador"];
  const tieneAcceso = validarRolUsuario(userData, ROLES_PERMITIDOS);

  // ⛔ USUARIO SIN PERMISOS
  if (!tieneAcceso) {
    return <UnAuthoriceComponent />;
  }
  const fetchDetalle = async () => {

    if (!selectedTim?.tim) return;
    show();

    const response = await getDetalleReporteByTim(selectedTim.tim);

    if (!response.success) {
      notifications.show({
        title: "ERROR",
        message: "Error al cargar detalles del TIM",
      });
      return;
    }

    setDetalles(response.datos);

    procesarSubDptos(response.datos);
    procesarSubDptosMS(response.datos);

    setSelectedDepartamento(null);
    setSelectedSubDpto(null);
    hide();

  };
  const fetchDetalleSilencioso = async () => {
    if (!selectedTim?.tim) return;

    try {
      console.log("🔄 Polling TIM:", selectedTim.tim);

      const response = await getDetalleReporteByTim(selectedTim.tim);

      if (!response.success) return;

      setDetalles(response.datos);

      // 🔹 NO tocar filtros
      procesarSubDptos(response.datos);
      procesarSubDptosMS(response.datos);
    } catch (e) {
      console.error("❌ Error polling:", e);
    }
  };

  useEffect(() => {
    fetchReportes();
  }, []);

  useEffect(() => {
    if (selectedTim) fetchDetalle();
  }, [selectedTim]);

  /* ===================== PROCESAR SUBDPTOS ===================== */

  const procesarSubDptos = (data: Detalle[]) => {
    const lista = Array.from(
      new Set(
        data
          .map((d) => (d.subdpto ?? "").trim().toUpperCase())
          .filter((s) => s !== "" && s !== "NULL")
      )
    );
    setSubDptos(lista);
  };

  const procesarSubDptosMS = (data: Detalle[]) => {
    const lista = Array.from(
      new Set(
        data
          .filter((d) => d.marcaSensible === true)
          .map((d) => d.subdpto)
          .filter(
            (s): s is string =>
              typeof s === "string" && s.trim() !== ""
          )
      )
    );
    setSubDptosMS(lista);
  };
  const detallesMsTienda = detalles.filter(
    d => d.isContable === true
  );

  const totalEnviadasMs = detallesMsTienda.reduce(
    (s, d) => s + d.uEnviadas,
    0
  );

  const totalRecibidasMs = detallesMsTienda.reduce(
    (s, d) => s + d.uRecibidas,
    0
  );

  const porcentajeMsTienda =
    totalEnviadasMs > 0
      ? (totalRecibidasMs / totalEnviadasMs) * 100
      : 0;


  const exportarExcelTIM = async () => {
    if (!selectedTim?.tim) {
      notifications.show({
        title: "Atención",
        message: "Debe seleccionar un TIM antes de exportar",
        color: "yellow",
      });
      return;
    }
    // ===============================
    // PARSEO ORIGEN / DESTINO
    // ===============================

    // ORIGEN → "655   CD Secos Huachipa Template"
    const now = new Date();
    const fechaGeneracion = now.toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

    const origenRaw = selectedTim.origen ?? "";
    const origenParts = origenRaw.trim().split(/\s+/);

    const codigoOrigen = origenParts.length > 0 ? origenParts[0] : "";

    // 👉 SOLO "CD Secos"
    const movilOrigen =
      origenRaw.includes("CD Secos") ? "CD Secos" : "";

    // DESTINO → "352  -  Pacasmayo"
    const destinoRaw = selectedTim.destino ?? "";
    const destinoParts = destinoRaw.split(/\s*-\s*/);

    const codigoTienda = destinoParts.length > 0 ? destinoParts[0].trim() : "";
    const tiendaDestino =
      destinoParts.length > 1 ? destinoParts[1].trim() : "";

    const workbook = new ExcelJS.Workbook();

    /* ===============================
       HOJA 1 — RESUMEN TIM
    =============================== */
    const sheetResumen = workbook.addWorksheet("Resumen TIM");
    var diferenciaUnidades = totalFaltantes + totalSobrantes;
    var diferenciaMonto = montoTotalSobrantes - montoTotalFaltante;

    sheetResumen.addRows([
      ["Fecha Generación", fechaGeneracion],
      ["TIM", selectedTim.tim],
      ["Origen", selectedTim.origen],
      ["Fecha Envío", formatDate(selectedTim.fechaEnvio)],
      ["Fecha Recepción", fechaRecepcion],
      [],
      ["", "Unidades", "Monto (S/)"],
      ["Faltantes", totalFaltantes, montoTotalFaltante],
      ["Sobrantes", totalSobrantes, montoTotalSobrantes],
      ["Diferencia", diferenciaUnidades, diferenciaMonto],
      [],
      ["%Validación MS", Number(porcentajeMsTienda.toFixed(2))],
      ["%Validación Móvil", Number(avance.toFixed(2))],
    ]);

    sheetResumen.columns.forEach(col => (col.width = 32));

    /* ===============================
       HOJA 2 — FALTANTES (RMF)
    =============================== */
    const sheetFaltantes = workbook.addWorksheet("Faltantes");

    sheetFaltantes.columns = [
      { header: "FECHA ENVÍO", width: 15 },
      { header: "FECHA RECEPCIÓN", width: 18 },
      { header: "CÓDIGO DE TIENDA", width: 18 },
      { header: "TIENDA", width: 22 },
      { header: "ORIGEN", width: 18 },
      { header: "MÓVIL", width: 14 },
      { header: "EMPRESA DE TRANSPORTE", width: 26 },
      { header: "CONDUCTOR", width: 22 },
      { header: "ASUNTO", width: 22 },
      { header: "TIM", width: 14 },
      { header: "OLPN", width: 16 },
      { header: "DEPARTAMENTO", width: 16 },
      { header: "SKU", width: 16 },
      { header: "EAN", width: 18 },
      { header: "DESCRIPCIÓN DE SKU", width: 40 },
      { header: "UNIDAD DE MEDIDA", width: 18 },
      { header: "CANTIDAD EN GUIA", width: 20 },
      { header: "CANTIDAD RECIBIDA", width: 22 },
      { header: "DIFERENCIA", width: 14 },
      { header: "COSTO PROMEDIO", width: 18 },
      { header: "MONTO FALTANTE (S/)", width: 22 },
      { header: "RESPONSABLE", width: 20 },
      { header: "RESOLUCIÓN", width: 20 },
      { header: "MARCA SENSIBLE", width: 18 },
    ];

    faltantes.forEach(d => {
      const diferencia = d.uEnviadas - d.uRecibidas;
      const costo = d.costoPromedio ?? 0;
      const montoFaltante = diferencia * costo;
      const asunto = `DISCREPANCIA_${fechaRecepcion}_${movilOrigen}_TIM_${selectedTim.tim} ${codigoTienda}_${tiendaDestino}`;

      let marca = "-";
      if (d.marcaSensible) marca = "C";
      else if (d.isContable) marca = "T";

      sheetFaltantes.addRow([
        formatDate(selectedTim.fechaEnvio),
        fechaRecepcion,
        codigoTienda,
        tiendaDestino,
        codigoOrigen,
        movilOrigen,
        empresaTransporte,
        conductor,
        asunto ?? "",
        selectedTim.tim,
        d.olpn ?? "",
        d.subdpto?.substring(0, 3) ?? "",
        d.sku,
        d.ean ?? "",
        d.descripcion,
        d.uMedida ?? "",
        d.uEnviadas,
        d.uRecibidas,
        diferencia,
        costo,
        montoFaltante,
        d.modificadoPor ?? "",
        "PENDIENTE",
        marca,
      ]);
    });

    /* ===============================
       HOJA 3 — SOBRANTES
    =============================== */
    const sheetSobrantes = workbook.addWorksheet("Sobrantes");

    sheetSobrantes.columns = [
      { header: "FECHA ENVÍO", width: 15 },
      { header: "FECHA RECEPCIÓN", width: 18 },
      { header: "TIM", width: 14 },
      { header: "SKU", width: 16 },
      { header: "DESCRIPCIÓN", width: 40 },
      { header: "SUBDPTO", width: 14 },
      { header: "CAJAS ENVIADAS", width: 16 },
      { header: "UNIDADES ENVIADAS", width: 18 },
      { header: "CASEPACK", width: 14 },
      { header: "CAJAS RECIBIDAS", width: 18 },
      { header: "UNIDADES RECIBIDAS", width: 20 },
      { header: "SOBRANTE", width: 14 },
      { header: "COSTO PROMEDIO", width: 18 },
      { header: "TOTAL SOBRANTE", width: 18 },
      { header: "MARCA SENSIBLE", width: 16 },
    ];

    sobrantes.forEach(d => {
      const sobrante = d.uRecibidas - d.uEnviadas;
      const costo = d.costoPromedio ?? 0;

      let marca = "-";
      if (d.marcaSensible) marca = "C";
      else if (d.isContable) marca = "T";

      sheetSobrantes.addRow([
        formatDate(selectedTim.fechaEnvio),
        fechaRecepcion,
        selectedTim.tim,
        d.sku,
        d.descripcion,
        d.subdpto,
        d.casePack ? d.uEnviadas / d.casePack : 0,
        d.uEnviadas,
        d.casePack ?? 0,
        d.casePack ? d.uRecibidas / d.casePack : 0,
        d.uRecibidas,
        sobrante,
        costo,
        sobrante * costo,
        marca,
      ]);
    });

    /* ===============================
       DESCARGA
    =============================== */
    const buffer = await workbook.xlsx.writeBuffer();

    saveAs(
      new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      `BITACORA_TIM_${selectedTim.tim}.xlsx`
    );
  };

  /* ============ FILTRAR SUBDPTOS POR DEPARTAMENTO ============ */

  useEffect(() => {
    if (!selectedDepartamento) {
      setSubDepartamentosFiltrados(
        subDptos.filter((x): x is string => typeof x === "string")
      );
      setSubDepartamentosMSFiltrados(
        subDptosMS.filter((x): x is string => typeof x === "string")
      );
      return;
    }

    const filtrados = subDptos.filter((s) =>
      s.startsWith(selectedDepartamento)
    );
    const filtradosMS = subDptosMS.filter((s) =>
      s.startsWith(selectedDepartamento)
    );

    setSubDepartamentosFiltrados(
      filtrados.filter((x): x is string => typeof x === "string")
    );
    setSubDepartamentosMSFiltrados(
      filtradosMS.filter((x): x is string => typeof x === "string")
    );
  }, [selectedDepartamento, subDptos, subDptosMS]);

  /* ===================== FILTRO GLOBAL ===================== */

  const detallesFiltrados = useMemo(() => {
    let data = [...detalles];

    if (selectedDepartamento) {
      data = data.filter(d =>
        d.subdpto?.startsWith(selectedDepartamento)
      );
    }

    if (selectedSubDpto) {
      data = data.filter(d => d.subdpto === selectedSubDpto);
    }

    if (tipoMercaderia === "MS") {
      data = data.filter(d => d.marcaSensible === true);
    }

    if (tipoMercaderia === "CT") {
      data = data.filter(d => d.isContable === true);
    }

    return data;
  }, [
    detalles,
    selectedDepartamento,
    selectedSubDpto,
    tipoMercaderia,
  ]);


  /* ===================== MÉTRICAS ===================== */

  const totalDetalles = detallesFiltrados.length;
  const faltantes = detallesFiltrados.filter(
    (d) => d.uRecibidas < d.uEnviadas
  );
  const sobrantes = detallesFiltrados.filter(
    (d) => d.uRecibidas > d.uEnviadas
  );
  const msPorcentaje = detalles.filter(d => d.isContable).length > 0

  const totalFaltantes = faltantes.length;
  const totalSobrantes = sobrantes.length;

  const montoTotalFaltante = faltantes.reduce(
    (sum, d) =>
      sum +
      (d.uEnviadas - d.uRecibidas) * (d.costoPromedio ?? 0),
    0
  );

  const montoTotalSobrantes = sobrantes.reduce(
    (sum, d) =>
      sum +
      (d.uRecibidas - d.uEnviadas) * (d.costoPromedio ?? 0),
    0
  );

  const totalEnviadas = detallesFiltrados.reduce(
    (s, d) => s + d.uEnviadas,
    0
  );
  const totalRecibidas = detallesFiltrados.reduce(
    (s, d) => s + d.uRecibidas,
    0
  );
  const avance =
    totalEnviadas > 0
      ? (totalRecibidas / totalEnviadas) * 100
      : 0;

  const conformes = detallesFiltrados.filter(
    (d) => d.uRecibidas === d.uEnviadas
  ).length;

  /* ===================== CRÍTICOS / SOBRANTES ===================== */

  const criticosBase = faltantes.filter(
    (d) => (d.costoPromedio * (d.uEnviadas - d.uRecibidas)) >= montoMenor
  );

  const criticos = criticosBase
    .slice()
    .sort((a, b) => {
      const totalB =
        (b.costoPromedio) * ((b.uRecibidas ?? 0) - (b.uEnviadas ?? 0));

      const totalA =
        (a.costoPromedio) * ((a.uRecibidas ?? 0) - (a.uEnviadas ?? 0));

      return totalA - totalB;
    })
    .slice(0, limiteCriticos);


  const sobrantesOrdenados = sobrantes
    .slice()
    .sort((a, b) => {
      const montoA =
        (a.uRecibidas - a.uEnviadas) * (a.costoPromedio ?? 0);
      const montoB =
        (b.uRecibidas - b.uEnviadas) * (b.costoPromedio ?? 0);
      return montoB - montoA;
    })
    .slice(0, limiteCriticos);

  /* ===================== CHARTS ===================== */

  const donaData = {
    labels: ["Conformes", "Faltantes", "Sobrantes"],
    datasets: [
      {
        data: [conformes, totalFaltantes, totalSobrantes],
        backgroundColor: ["#4caf50", "#f44336", "#2196f3"],
      },
    ],
  };

  const faltantesPorCat: Record<string, number> = {};
  detallesFiltrados.forEach((d) => {
    if (d.uRecibidas < d.uEnviadas) {
      const key = d.subdpto ?? "SIN";
      faltantesPorCat[key] = (faltantesPorCat[key] || 0) + 1;
    }
  });

  const MAX_CATS = 15;
  const sortedCats = Object.entries(faltantesPorCat).sort(
    (a, b) => b[1] - a[1]
  );
  let topCats = sortedCats.slice(0, MAX_CATS);

  if (sortedCats.length > MAX_CATS) {
    const restantes = sortedCats.slice(MAX_CATS);
    const totalOtros = restantes.reduce(
      (sum, [, value]) => sum + value,
      0
    );
    topCats = [...topCats, ["OTROS", totalOtros]];
  }

  const barLabels = topCats.map(([code]) => {
    if (code === "OTROS") return "OTROS";
    const desc = SUBDEPARTAMENTOS.find(
      (s) => s.codigo === code
    )?.descripcion;
    return `${code} - ${desc ?? ""}`;
  });

  const barValues = topCats.map(([, value]) => value);

  const barData: ChartData<"bar", number[], string> = {
    labels: barLabels,
    datasets: [
      {
        label: "Faltantes",
        data: barValues,
        backgroundColor: "#ff9800",
      },
    ],
  };

  const barOptions: ChartOptions<"bar"> = {
    indexAxis: "y",
    plugins: { legend: { display: false } },
    maintainAspectRatio: false,
    responsive: true,
  };

  /* Título dinámico del gráfico de barras */
  let barTitle = "Faltantes por categoría (Todos los departamentos)";

  if (selectedSubDpto) {
    const sub = SUBDEPARTAMENTOS.find(
      (s) => s.codigo === selectedSubDpto
    );
    barTitle = `Faltantes - Subdepartamento ${selectedSubDpto}${sub ? ` — ${sub.descripcion}` : ""
      }`;
  } else if (selectedDepartamento) {
    const dept = CATEGORIAS_MACRO.find(
      (c) => c.prefix === selectedDepartamento
    );
    barTitle = `Faltantes por categoría — Departamento ${selectedDepartamento}${dept ? ` (${dept.label})` : ""
      }`;
  } else if (tipoMercaderia === "MS") {
    barTitle = "Faltantes — Sensible Central";
  } else if (tipoMercaderia === "CT") {
    barTitle = "Faltantes — Sensible Tienda";
  }


  /* ===================== HELPERS ===================== */
  const graficosRef = useRef<HTMLDivElement>(null);
  const tablasRef = useRef<HTMLDivElement>(null);


  const handleLimpiarFiltros = () => {
    setSelectedDepartamento(null);
    setSelectedSubDpto(null);
    setTipoMercaderia(null);
  };

  /* ===================== SECCIONES RENDER ===================== */
  const exportarPDF = async () => {
    show();
    console.log("graficosRef:", graficosRef.current);
    console.log("tablasRef:", tablasRef.current);

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPosition = 10;

    const captureAndAdd = async (
      ref: HTMLDivElement | null,
      title: string
    ) => {
      if (!ref) return;

      await new Promise(r => setTimeout(r, 300)); // charts

      const canvas = await html2canvas(ref, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");

      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      if (yPosition + imgHeight > 280) {
        pdf.addPage();
        yPosition = 10;
      }

      pdf.addImage(imgData, "PNG", 10, yPosition, imgWidth, imgHeight);
      yPosition += imgHeight + 10;
    };


    await captureAndAdd(graficosRef.current, "Gráficos");
    await captureAndAdd(tablasRef.current, "Tablas");

    pdf.save(`TIM_${selectedTim?.tim}_dashboard.pdf`);

    hide();
  };
  const renderResumen = () =>
    detallesFiltrados.length > 0 ? (
      <Grid mt="xl" gutter="lg">
        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
          <Card shadow="lg" p="lg" bg={color_PrimarioDark}>
            <Text size="sm" fw={500}>
              Total de Productos
            </Text>
            <Text size="xl" fw={900}>
              <IconBox /> {totalDetalles}
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
          <Card shadow="lg" p="lg" bg="red">
            <Text size="sm" fw={500}>
              Productos Faltantes
            </Text>
            <Text size="xl" fw={900}>
              <IconPackageOff /> {totalFaltantes}
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
          <Card shadow="lg" p="lg" bg="blue">
            <Text size="sm" fw={500}>
              Productos Sobrantes
            </Text>
            <Text size="xl" fw={900}>
              <IconPackageOff /> {totalSobrantes}
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
          <Card shadow="lg" p="lg" bg="red">
            <Text size="sm" fw={500}>
              Monto Total Faltante
            </Text>
            <Text size="xl" fw={900}>
              S/ {montoTotalFaltante.toFixed(2)}
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
          <Card shadow="lg" p="lg" bg="blue">
            <Text size="sm" fw={500}>
              Monto Total Sobrante
            </Text>
            <Text size="xl" fw={900}>
              S/ {montoTotalSobrantes.toFixed(2)}
            </Text>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 2 }}>
          <Card shadow="lg" p="lg" bg={color_SecundarioDark}>
            <Text size="sm" fw={600}>
              % Avance
            </Text>
            <Text size="xl" fw={900}>
              <IconTrendingUp /> {avance.toFixed(1)}%
            </Text>
          </Card>
        </Grid.Col>
      </Grid>
    ) : (
      <Text mt="xl" c="dimmed">
        Selecciona un TIM y filtros para ver el resumen.
      </Text>
    );

  const renderGraficos = () =>
    detallesFiltrados.length > 0 ? (
      <Grid mt="xl" gutter="lg">
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="md" p="lg" style={{ height: 320 }}>
            <Text ta="center" fw="bold" mb="xs">
              Conformes / Faltantes / Sobrantes
            </Text>
            <div style={{ height: 260 }}>
              <Doughnut
                data={donaData}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="md" p="lg" style={{ height: 320 }}>
            <Text ta="center" fw="bold" mb="xs">
              {barTitle}
            </Text>
            <div style={{ height: 260 }}>
              <Bar data={barData} options={barOptions} />
            </div>
          </Card>
        </Grid.Col>
      </Grid>
    ) : (
      <Text mt="xl" c="dimmed">
        No hay datos para mostrar gráficos.
      </Text>
    );

  const CriticosCard = () => (
    <Card mt="xl" p="lg" shadow="md">
      <Text fw="bold" size="xl">
        Top {Math.min(limiteCriticos, criticosBase.length)} de {criticosBase.length} Faltantes Críticos (≥ S/{montoMenor})
      </Text>
      <Divider my="sm" />

      {criticos.length === 0 && (
        <Text c="dimmed" my="md">
          No hay productos críticos.
        </Text>
      )}

      {criticos.length > 0 && (
        <Table
          striped
          highlightOnHover
          withTableBorder
          withColumnBorders
          mt="md"
          styles={{
            table: { borderRadius: 12, overflow: "hidden" },
          }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>SKU</Table.Th>
              <Table.Th>Descripción</Table.Th>
              <Table.Th>Faltantes (UND)</Table.Th>
              <Table.Th>Costo Unit.</Table.Th>
              <Table.Th>Monto Total</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {criticos.map((d, i) => {
              const unidadesFaltantes = d.uEnviadas - d.uRecibidas;
              const total =
                unidadesFaltantes * (d.costoPromedio ?? 0);

              return (
                <Table.Tr key={i}>
                  <Table.Td>{d.sku}</Table.Td>
                  <Table.Td>{d.descripcion}</Table.Td>
                  <Table.Td
                    style={{ color: "red", fontWeight: 700 }}
                  >
                    {unidadesFaltantes}
                  </Table.Td>
                  <Table.Td>
                    S/ {d.costoPromedio?.toFixed(2)}
                  </Table.Td>
                  <Table.Td
                    style={{ color: "#d32f2f", fontWeight: 800 }}
                  >
                    S/ {total.toFixed(2)}
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      )}
    </Card>
  );

  const SobrantesCard = () => (
    <Card mt="xl" p="lg" shadow="md">
      <Text fw="bold" size="xl">
        {Math.min(limiteCriticos, sobrantes.length)} Productos Sobrantes
      </Text>

      <Divider my="sm" />

      {sobrantesOrdenados.length === 0 && (
        <Text c="dimmed">No hay sobrantes.</Text>
      )}

      {sobrantesOrdenados.length > 0 && (
        <Table
          striped
          highlightOnHover
          withTableBorder
          withColumnBorders
          mt="md"
          styles={{
            table: { borderRadius: 12, overflow: "hidden" },
          }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th>SKU</Table.Th>
              <Table.Th>Descripción</Table.Th>
              <Table.Th>Sobrantes (UND)</Table.Th>
              <Table.Th>Costo Unit.</Table.Th>
              <Table.Th>Monto Total</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {sobrantesOrdenados.map((d, i) => {
              const unidadesSobrantes =
                d.uRecibidas - d.uEnviadas;
              const monto =
                unidadesSobrantes * (d.costoPromedio ?? 0);

              return (
                <Table.Tr key={i}>
                  <Table.Td>{d.sku}</Table.Td>

                  <Table.Td>{d.descripcion}</Table.Td>
                  <Table.Td
                    style={{ color: "red", fontWeight: 700 }}
                  >
                    {unidadesSobrantes}
                  </Table.Td>
                  <Table.Td>
                    S/ {d.costoPromedio?.toFixed(2)}
                  </Table.Td>
                  <Table.Td
                    style={{ color: "#322FD3FF", fontWeight: 800 }}
                  >
                    S/ {monto.toFixed(2)}
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      )}
    </Card>
  );

  const renderTablas = () => {
    if (detallesFiltrados.length === 0) {
      return (
        <Text mt="xl" c="dimmed">
          No hay datos para mostrar tablas.
        </Text>
      );
    }

    return (
      <>
        <Grid mt="lg" gutter="md">
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <NumberInput
              label="Monto mínimo crítico"
              min={0}
              value={montoMenor}
              onChange={(value) =>
                setMontoMenor(Number(value) || 0)
              }
            />
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <NumberInput
              label="Cantidad a mostrar (Top N)"
              min={1}
              max={Math.max(
                criticosBase.length,
                sobrantes.length,
                1
              )}
              value={limiteCriticos}
              onChange={(value) =>
                setLimiteCrit(Number(value) || 1)
              }
            />
          </Grid.Col>
        </Grid>

        {isMobile ? (
          <Tabs defaultValue="criticos" mt="md">
            <Tabs.List>
              <Tabs.Tab value="criticos">Críticos</Tabs.Tab>
              <Tabs.Tab value="sobrantes">Sobrantes</Tabs.Tab>
            </Tabs.List>

            <Tabs.Panel value="criticos">
              <CriticosCard />
            </Tabs.Panel>

            <Tabs.Panel value="sobrantes">
              <SobrantesCard />
            </Tabs.Panel>
          </Tabs>
        ) : (
          <Grid mt="lg" gutter="lg">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <CriticosCard />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <SobrantesCard />
            </Grid.Col>
          </Grid>
        )}
      </>
    );
  };

  /* ===================== RENDER PRINCIPAL ===================== */
  return (
    <div>
      {/* FILTROS SUPERIORES */}
      <Flex gap="md" align="flex-end" wrap="wrap">
        <Select
          label="Seleccione TIM"
          placeholder="Seleccione un TIM..."
          style={{ width: 260 }}
          data={reportes.map((r) => ({
            value: String(r.tim),
            label: `${r.tim} - ${r.origen} - ${formatDate(
              r.fechaEnvio
            )}`,
          }))}
          searchable
          clearable
          onChange={(value) => {
            const r = reportes.find(
              (x) => String(x.tim) === value
            );
            setSelectedTim(r ?? null);
          }}
        />

        <Select
          label="Departamento"
          disabled={!selectedTim}
          placeholder="Seleccione un departamento..."
          style={{ width: 260 }}
          data={Array.from(new Set(subDptos.map((s) => s.substring(0, 3)))).map(
            (prefix) => {
              const item = CATEGORIAS_MACRO.find((c) => prefix === c.prefix);
              return {
                value: prefix,
                label: `${prefix} - ${item?.label ?? "Sin categoría"}`,
              };
            }
          )}
          searchable
          clearable
          value={selectedDepartamento}
          onChange={(v) => {
            setSelectedDepartamento(v);
            setSelectedSubDpto(null); // limpiar subdpto
          }}
        />


        <Select
          label="Subdepartamento"
          disabled={!selectedDepartamento}
          placeholder="Seleccione subdepartamento..."
          style={{ width: 290 }}
          data={subDepartamentosFiltrados.map((s) => ({
            value: s,
            label: `${s} - ${SUBDEPARTAMENTOS.find((d) => d.codigo === s)?.descripcion ?? ""
              }`,
          }))}
          value={selectedSubDpto}
          searchable
          clearable
          onChange={(v) => {
            setSelectedSubDpto(v);
          }}
        />
        <Select
          label="Tipo de Mercadería"
          disabled={detalles.length === 0}
          placeholder="Todas"
          style={{ width: 290 }}
          data={[
            { value: "MS", label: "Sensible Central" },
            { value: "CT", label: "Sensible Tienda" },
          ]}
          value={tipoMercaderia}
          clearable
          onChange={(v) =>
            setTipoMercaderia(v as "MS" | "CT" | null)
          }
        />



        <button
          onClick={handleLimpiarFiltros}
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
      </Flex>

      {/* CONTENIDO SEGÚN TAMAÑO DE PANTALLA */}
      {isMobile ? (
        <Tabs defaultValue="resumen" mt="lg">
          <Tabs.List>
            <Tabs.Tab value="resumen">Resumen</Tabs.Tab>
            <Tabs.Tab value="graficos">Gráficos</Tabs.Tab>
            <Tabs.Tab value="tablas">Tablas</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="resumen">
            {renderResumen()}
          </Tabs.Panel>

          <Tabs.Panel value="graficos">
            <div ref={graficosRef}>
              {renderGraficos()}
            </div>
          </Tabs.Panel>

          <Tabs.Panel value="tablas">
            <div ref={tablasRef}>
              {renderTablas()}
            </div>
          </Tabs.Panel>
        </Tabs>
      ) : (
        <>
          {renderResumen()}
          <div
            ref={graficosRef}
          >
            {renderGraficos()}
          </div>

          <div
            ref={tablasRef}
          >
            {renderTablas()}
          </div>
        </>
      )}
      <>
        <Modal
          opened={openExportModal}
          onClose={() => setOpenExportModal(false)}
          title="Datos para Exportar Excel"
        >
          <TextInput
            label="Empresa de Transporte"
            value={empresaTransporte}
            onChange={(e) => setEmpresaTransporte(e.currentTarget.value)}
            required
          />

          <TextInput
            mt="sm"
            label="Conductor"
            value={conductor}
            onChange={(e) => setConductor(e.currentTarget.value)}
            required
          />

          <TextInput
            mt="sm"
            label="Fecha Recepción (dd/mm/yy)"
            placeholder="ej: 14/01/26"
            value={fechaRecepcion}
            onChange={(e) => setFechaRecepcion(e.currentTarget.value)}
            required
          />

          <Button
            fullWidth
            mt="md"
            onClick={() => {
              if (!empresaTransporte || !conductor || !fechaRecepcion) {
                notifications.show({
                  title: "Campos requeridos",
                  message: "Complete todos los datos",
                  color: "red",
                });
                return;
              }

              setOpenExportModal(false);
              exportarExcelTIM();
            }}
          >
            Exportar Excel
          </Button>
        </Modal>

      </>
    </div>

  );
}