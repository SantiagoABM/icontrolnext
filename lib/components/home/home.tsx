"use client";

import { getDetalleReporteByTim } from "@/lib/actions/maestros/detalle.action";
import { getReportesByMotivo } from "@/lib/actions/maestros/reporte.action";
import { Detalle, Reporte } from "@/lib/interfaces/maestros/reportes.interface";
import { useTitlePageStore } from "@/lib/store/useTitlePageStore";

import {
  Card,
  Grid,
  Group,
  Select,
  Text,
  Divider,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";

// Registrar elementos Chart.js
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

  useEffect(() => {
    setData({
      titulo: "Dashboard",
      subtitle: "Qué hacemos hoy?",
    });
  }, []);

  const [selectedTim, setSelectedTim] = useState<Reporte | null>(null);
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [detalles, setDetalles] = useState<Detalle[]>([]);

  /* ============================================
          CARGAR REPORTES TIM
  ============================================ */
  const fetchReportes = async () => {
    const response = await getReportesByMotivo("T");
    if (!response.success) {
      notifications.show({
        title: "ERROR",
        message: "Hubo un problema al cargar los reportes",
      });
      return;
    }
    setReportes(response.datos);
  };

  /* ============================================
        CARGAR DETALLES DEL TIM
  ============================================ */
  const fetchDetalle = async () => {
    const response = await getDetalleReporteByTim(selectedTim!.tim!);
    if (!response.success) {
      notifications.show({
        title: "ERROR",
        message: "Error al cargar detalles del TIM",
      });
      return;
    }
    setDetalles(response.datos);
  };

  useEffect(() => {
    fetchReportes();
  }, []);

  useEffect(() => {
    if (selectedTim) fetchDetalle();
  }, [selectedTim]);

  /* ============================================
          MÉTRICAS
  ============================================ */

  const totalEnviadas = detalles.reduce((s, d) => s + d.uEnviadas, 0);
  const totalRecibidas = detalles.reduce((s, d) => s + d.uRecibidas, 0);
  const faltantes = totalEnviadas - totalRecibidas;
  const avance = totalEnviadas > 0 ? (totalRecibidas / totalEnviadas) * 100 : 0;

  const conformes = detalles.filter((d) => d.uRecibidas === d.uEnviadas).length;
  const productosFaltantes = detalles.length - conformes;

  const donaData = {
    labels: ["Conformes", "Faltantes"],
    datasets: [
      {
        data: [conformes, productosFaltantes],
        backgroundColor: ["#4caf50", "#f44336"],
      },
    ],
  };

  /* ============================================
      FALTANTES POR CATEGORÍA (gráfico barras)
  ============================================ */
  const faltantesPorCat: Record<string, number> = {};

  detalles.forEach((d) => {
    if (d.uRecibidas < d.uEnviadas) {
      const key = d.subdpto || "SIN_SUBDPTO";
      faltantesPorCat[key] = (faltantesPorCat[key] || 0) + 1;
    }
  });

  const barData = {
    labels: Object.keys(faltantesPorCat),
    datasets: [
      {
        label: "Faltantes",
        data: Object.values(faltantesPorCat),
        backgroundColor: "#ff9800",
      },
    ],
  };

  const barOptions = {
    indexAxis: "y" as const,
    plugins: { legend: { display: false } },
    maintainAspectRatio: false,
  };

  /* ============================================
        TOP 10 CRÍTICOS
  ============================================ */
  const criticos = detalles
    .filter((d) => d.uRecibidas < d.uEnviadas && d.costoPromedio > 50)
    .sort((a, b) => b.costoPromedio - a.costoPromedio)
    .slice(0, 10);

  return (
    <div>
      {/* =====================
          SELECTOR DE TIM
        ====================== */}
      <Select
        label="Seleccione TIM"
        placeholder="Seleccione un TIM..."
        data={reportes.map((r) => ({
          label: `${r.tim} - ${r.origen} - ${r.fechaEnvio}`,
          value: String(r.tim),
        }))}
        onChange={(value) => {
          const report = reportes.find((r) => String(r.tim) === value);
          setSelectedTim(report ?? null);
        }}
      />

      {/* =====================
          TARJETAS PREMIUM
        ====================== */}
      {detalles.length > 0 && (
        <Grid mt="xl" gutter="lg">
          
          {/* ENVIADAS */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card
              shadow="lg"
              p="lg"
              style={{
                background: "linear-gradient(135deg, #4caf50, #66bb6a)",
                color: "white",
                borderRadius: 16,
              }}
            >
              <Text size="sm" fw={500}>Total Unidades Enviadas</Text>
              <Text size="xl" fw={900}>{totalEnviadas}</Text>
            </Card>
          </Grid.Col>

          {/* CONTADAS */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card
              shadow="lg"
              p="lg"
              style={{
                background: "linear-gradient(135deg, #2196f3, #42a5f5)",
                color: "white",
                borderRadius: 16,
              }}
            >
              <Text size="sm" fw={500}>Total Unidades Contadas</Text>
              <Text size="xl" fw={900}>{totalRecibidas}</Text>
            </Card>
          </Grid.Col>

          {/* FALTANTES */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card
              shadow="lg"
              p="lg"
              style={{
                background: "linear-gradient(135deg, #e53935, #ef5350)",
                color: "white",
                borderRadius: 16,
              }}
            >
              <Text size="sm" fw={500}>Unidades Faltantes</Text>
              <Text size="xl" fw={900}>{faltantes}</Text>
            </Card>
          </Grid.Col>

          {/* AVANCE */}
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <Card
              shadow="lg"
              p="lg"
              style={{
                background: "linear-gradient(135deg, #ffb300, #ffca28)",
                color: "black",
                borderRadius: 16,
              }}
            >
              <Text size="sm" fw={600}>% Avance</Text>
              <Text size="xl" fw={900}>{avance.toFixed(1)}%</Text>
            </Card>
          </Grid.Col>

        </Grid>
      )}

      {/* =====================
          DONUT + BARRAS
        ====================== */}
      {detalles.length > 0 && (
        <Grid mt="xl" gutter="lg">
          
          {/* DONUT */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="md" p="lg" style={{ height: 320 }}>
              <Text fw="bold" mb="xs">Unidades Conformes vs Unidades Faltantes</Text>
              <div style={{ height: "250px" }}>
                <Doughnut data={donaData} options={{ maintainAspectRatio: false }} />
              </div>
            </Card>
          </Grid.Col>

          {/* BARRAS */}
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card shadow="md" p="lg" style={{ height: 320 }}>
              <Text fw="bold" mb="xs">Unidades Faltantes por categoría</Text>
              <div style={{ height: "250px" }}>
                <Bar data={barData} options={barOptions} />
              </div>
            </Card>
          </Grid.Col>

        </Grid>
      )}

      {/* =====================
          TOP 10 CRÍTICOS
        ====================== */}
      {detalles.length > 0 && (
        <Card mt="xl" p="lg" shadow="md">
          <Text fw="bold" size="xl">Top 10 Unidades Faltantes Críticos (Mayores a S/50)</Text>
          <Divider my="sm" />

          {criticos.length === 0 && (
            <Text c="dimmed">No hay productos críticos.</Text>
          )}

          {criticos.map((d, i) => (
            <Group
              key={i}
              justify="space-between"
              py={4}
              style={{ borderBottom: "1px solid #eee" }}
            >
              <Text>{d.descripcion}</Text>
              <Text c="red" fw="bold">S/ {d.costoPromedio}</Text>
            </Group>
          ))}
        </Card>
      )}
    </div>
  );
}
