import ExcelJS from "exceljs";
import { Detalle, Reporte } from "../interfaces/maestros/reportes.interface";
import { CreateReporte } from "../actions/maestros/reporte.action";
import { UsuarioSesion } from "../interfaces/authentication.interfaces";
import { CargarDetallesByLote } from "../actions/maestros/detalle.action";

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

    if (!user || !user.nombre) {
      return {
        success: false,
        message:
          "No hay un usuario válido en sesión. Por favor, inicia sesión nuevamente.",
      };
    }

    // ============================
    // LEER ARCHIVO EXCEL
    // ============================
    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    const sheet = workbook.getWorksheet("Página1_1");
    if (!sheet) {
      return {
        success: false,
        message: 'No se encontró la hoja "Página1_1" en el archivo',
      };
    }

    if (sheet.rowCount < 10) {
      return {
        success: false,
        message: "El archivo no tiene suficientes filas (mínimo 10)",
      };
    }

    // ============================
    // HELPERS
    // ============================
    const getCellValue = (row: ExcelJS.Row, cellNumber: number): any => {
      const cell = row.getCell(cellNumber);

      if (cell.value === null || cell.value === undefined) return "";

      if (typeof cell.value === "object" && "result" in cell.value) {
        return (cell.value as any).result;
      }

      if (typeof cell.value === "object" && "richText" in cell.value) {
        return (cell.value as any).richText.map((t: any) => t.text).join("");
      }

      if (typeof cell.value === "object" && "text" in cell.value) {
        return (cell.value as any).text;
      }

      return cell.value;
    };

    const extractValueAfterColon = (rawValue: any): string => {
      const str = String(rawValue ?? "").trim();
      return str.includes(":")
        ? str.split(":").slice(1).join(":").trim()
        : str;
    };

    const extractTim = (rawValue: any): number => {
      const str = String(rawValue ?? "").trim();
      const afterColon = str.includes(":") ? str.split(":")[1] : str;
      const numbers = afterColon.replace(/\D/g, "");
      return Number(numbers) || 0;
    };

    // ============================
    // CREAR CABECERA REPORTE
    // ============================
    const reporteTim: Reporte = {
      tim: extractTim(getCellValue(sheet.getRow(4), 1)),
      placa: extractValueAfterColon(getCellValue(sheet.getRow(6), 1)),
      origen: extractValueAfterColon(getCellValue(sheet.getRow(7), 1)),
      destino: extractValueAfterColon(getCellValue(sheet.getRow(8), 1)),
      fechaEnvio: extractValueAfterColon(getCellValue(sheet.getRow(9), 1)),
      creadoPor: String(user.nombre),
      motivo: "T",
    };

    if (reporteTim.tim === 0) {
      return {
        success: false,
        message: "El número TIM no es válido en la fila 4",
      };
    }

    // ============================
    // ENVIAR CABECERA AL BACKEND
    // ============================
    const reporteCreado = await CreateReporte(reporteTim);
    if (!reporteCreado.success) {
      return {
        success: false,
        message: reporteCreado.mensaje,
      };
    }

    // ============================
    // PROCESAR DETALLES POR LOTES
    // ============================
    const lote: Detalle[] = [];
    const loteSize = 100;
    let totalProcesados = 0;

    for (let i = 12; i <= sheet.rowCount; i++) {
      const row = sheet.getRow(i);

      const sku = String(getCellValue(row, 6) ?? "").trim();
      if (!sku) continue;
      const valorK = Number(getCellValue(row, 11));
      const valorI = Number(getCellValue(row, 9));

      const uEnviadas =
        !isNaN(valorK) && valorK > 0
          ? valorK
          : !isNaN(valorI)
            ? valorI
            : 0;
      const detalle: Detalle = {
        _id: "",
        tim: reporteTim.tim,
        olpn: String(getCellValue(row, 1) ?? ""),
        ean: "",
        subdpto: String(getCellValue(row, 5) ?? ""),
        sku,
        descripcion: String(getCellValue(row, 7) ?? ""),
        casePack: Number(getCellValue(row, 8)) || 0,
        uMedida: "",
        costoPromedio: 0,
        precioVigente: 0,
        uEnviadas: uEnviadas,
        uRecibidas: 0,
        fechavencimiento: "",
        observacion: "PERTENECE",
        modificadoPor: "",
        fastRegister: false,
      };

      lote.push(detalle);
      console.log("Detalle agregado al lote:", lote);
      totalProcesados++;

      // ============================
      // ENVIAR LOTE
      // ============================
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
    // ENVIAR ÚLTIMO LOTE
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

export async function leerSkusDesdeArchivo (file: File): Promise<string[]> {
  const buffer = await file.arrayBuffer();

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  // 🧠 Primera hoja
  const worksheet = workbook.worksheets[0];

  if (!worksheet) return [];

  const skus: string[] = [];

  // 🧠 Desde fila 2 (A2 hacia abajo)
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // saltar encabezado

    const cellValue = row.getCell(1).value; // columna A

    if (cellValue) {
      skus.push(String(cellValue).trim());
    }
  });

  return skus.filter(Boolean);
};
