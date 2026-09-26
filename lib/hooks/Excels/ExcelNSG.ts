import { Detalle, Reporte } from "@/lib/interfaces/maestros/reportes.interface";
import { formatFechaDDMMYY, formatFechaEnvio } from "@/lib/utils/constantes";
import ExcelJS from "exceljs";
import 'dayjs/locale/es';
import saveAs from "file-saver";

export const exportarExcelNSG = async (
    data: Partial<Reporte> | null,
    fechaRecepcion: string | null,
    productos: Detalle[],
    usuarioNombre: string
) => {
    const fechaRecepcionFormatted = formatFechaDDMMYY(new Date(fechaRecepcion as string));
    const fechaEnvioFormatted = formatFechaEnvio(data?.fechaEnvio as string);

    const workbook = new ExcelJS.Workbook();

    /* =============== HOJA NSG =============== */
    const sheetNSG = workbook.addWorksheet("NSG");

    // Encabezado de información del reporte (equivalente a los appendRow
    // sueltos del Dart antes de la tabla)
    sheetNSG.addRow(["Preventores:", usuarioNombre]);
    sheetNSG.addRow(["Inventario NSG:", data?.tim ?? ""]);
    sheetNSG.addRow(["Origen:", data?.origen ?? "352 Pacasmayo"]);
    sheetNSG.addRow(["Destino:", data?.destino ?? "NSG"]);
    sheetNSG.addRow(["Fecha Registro:", fechaEnvioFormatted]);
    sheetNSG.addRow([]); // fila en blanco, igual que el appendRow([TextCellValue('')])

    // Encabezados de la tabla de productos
    const headerRow = sheetNSG.addRow([
        "DIVISION",
        "EAN",
        "SKU",
        "DESCRIPCIÓN",
        "OK",
        "OBSERVACIÓN",
    ]);
    headerRow.font = { bold: true };

    // Anchos de columna. Se hace por columna (no con `worksheet.columns =`)
    // para no pisar las filas de información que ya escribimos arriba.
    sheetNSG.getColumn(1).width = 14; // DIVISION
    sheetNSG.getColumn(2).width = 16; // EAN
    sheetNSG.getColumn(3).width = 16; // SKU
    sheetNSG.getColumn(4).width = 40; // DESCRIPCIÓN
    sheetNSG.getColumn(5).width = 12; // OK
    sheetNSG.getColumn(6).width = 40; // OBSERVACIÓN

    // Filas de productos
    productos.forEach((d) => {
        sheetNSG.addRow([
            d.subdpto,
            d.ean,
            d.sku,
            d.descripcion,
            d.uRecibidas > 0 ? "OK" : "NO",
            d.observacion,
        ]);
    });

    /* =============== DESCARGA =============== */
    const buffer = await workbook.xlsx.writeBuffer();

    saveAs(
        new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `REPORTE_NSG_${data?.tim}.xlsx`
    );
};