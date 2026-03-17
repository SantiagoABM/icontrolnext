import * as XLSX from "xlsx";

import { Detalle, Reporte } from "../interfaces/maestros/reportes.interface";
import { CreateReporte } from "../actions/maestros/reporte.action";
import { UsuarioSesion } from "../interfaces/authentication.interfaces";
import { CargarDetallesByLote } from "../actions/maestros/detalle.action";

/**
 * ============================
 * PROCESAR EXCEL TIM (FRONTEND)
 * ============================
 */
export async function processExcelReportFront(
  file: File,
  user: UsuarioSesion
): Promise<{ success: boolean; message: string }> {
  try {
    // ============================
    // VALIDACIONES INICIALES
    // ============================
    if (!file) {
      return { success: false, message: "No se proporcionó ningún archivo" };
    }

    if (!user?.nombre) {
      return {
        success: false,
        message: "No hay un usuario válido en sesión",
      };
    }

    // ============================
    // LEER ARCHIVO CON SHEETJS
    // ============================
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    

    if (workbook.SheetNames.length === 0) {
      return {
        success: false,
        message: "El archivo no contiene hojas válidas",
      };
    }

    // 👉 Usa la primera hoja o busca por nombre
    const sheetName =
      workbook.SheetNames.find(n => n.trim() === "Página1_1") ??
      workbook.SheetNames[0];

    const sheet = workbook.Sheets[sheetName];

    if (!sheet) {
      return {
        success: false,
        message: 'No se encontró la hoja "Página1_1"',
      };
    }

    // ============================
    // CONVERTIR A MATRIZ (FILAS)
    // ============================
    const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
      header: 1,
      defval: "",
    });

    if (rows.length < 10) {
      return {
        success: false,
        message: "El archivo no tiene suficientes filas (mínimo 10)",
      };
    }

    // ============================
    // HELPERS
    // ============================
    const getCell = (row: number, col: number) =>
      rows[row - 1]?.[col - 1] ?? "";

    const extractValueAfterColon = (value: any): string => {
      const str = String(value).trim();
      return str.includes(":")
        ? str.split(":").slice(1).join(":").trim()
        : str;
    };

    const extractTim = (value: any): number => {
      const str = String(value).trim();
      const afterColon = str.includes(":") ? str.split(":")[1] : str;
      const numbers = afterColon.replace(/\D/g, "");
      return Number(numbers) || 0;
    };

    // ============================
    // CREAR CABECERA REPORTE
    // ============================
    const reporteTim: Reporte = {
      tim: extractTim(getCell(4, 1)),
      placa: extractValueAfterColon(getCell(6, 1)),
      origen: extractValueAfterColon(getCell(7, 1)),
      destino: extractValueAfterColon(getCell(8, 1)),
      fechaEnvio: extractValueAfterColon(getCell(9, 1)),
      creadoPor: user.nombre,
      motivo: "T",
    };

    console.log("TIM detectado:", reporteTim.tim);

    if (!reporteTim.tim) {
      return {
        success: false,
        message: "El TIM no es válido (fila 4)",
      };
    }

    // ============================
    // CREAR REPORTE (BACKEND)
    // ============================
    const reporteCreado = await CreateReporte(reporteTim);

    if (!reporteCreado.success) {
      return {
        success: false,
        message: reporteCreado.mensaje,
      };
    }

    // ============================
    // PROCESAR DETALLES
    // ============================
    const lote: Detalle[] = [];
    const loteSize = 100;
    let totalProcesados = 0;

    for (let i = 12; i <= rows.length; i++) {
      const sku = String(getCell(i, 6)).trim();
      if (!sku) continue;

      const valorK = Number(getCell(i, 11));
      const valorI = Number(getCell(i, 9));

      const uEnviadas =
        !isNaN(valorK) && valorK > 0
          ? valorK
          : !isNaN(valorI)
            ? valorI
            : 0;

      const detalle: Detalle = {
        _id: "",
        tim: reporteTim.tim,
        olpn: String(getCell(i, 1)),
        ean: "",
        subdpto: String(getCell(i, 5)),
        sku,
        descripcion: String(getCell(i, 7)),
        casePack: Number(getCell(i, 8)) || 0,
        uMedida: "",
        costoPromedio: 0,
        precioVigente: 0,
        uEnviadas,
        uRecibidas: 0,
        fechavencimiento: "",
        observacion: "PERTENECE",
        modificadoPor: "",
        fastRegister: false,
      };

      lote.push(detalle);
      totalProcesados++;

      if (lote.length === loteSize) {
        const resp = await CargarDetallesByLote(lote);
        if (!resp.success) {
          return {
            success: false,
            message: `Error al enviar lote: ${resp.mensaje}`,
          };
        }
        lote.length = 0;
      }
    }

    // ============================
    // ÚLTIMO LOTE
    // ============================
    if (lote.length > 0) {
      const resp = await CargarDetallesByLote(lote);
      if (!resp.success) {
        return {
          success: false,
          message: `Error al enviar último lote: ${resp.mensaje}`,
        };
      }
    }

    // ============================
    // FINAL
    // ============================
    return {
      success: true,
      message: `Archivo procesado correctamente. TIM #${reporteTim.tim}. Total ${totalProcesados} productos cargados.`,
    };
  } catch (error) {
    console.error("❌ Error procesando Excel:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Error desconocido al procesar el archivo",
    };
  }
}

/**
 * ============================
 * LEER SKUS DESDE ARCHIVO
 * ============================
 */
export async function leerSkusDesdeArchivo(file: File): Promise<string[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: "array" });

  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return [];

  const sheet = workbook.Sheets[sheetName];
  const rows: any[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
  });

  const skus: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const sku = String(rows[i][0] ?? "").trim();
    if (sku && sku !== "SKU") {
      skus.push(sku);
    }
  }


  return skus;
}
