import { Detalle, Reporte } from "@/lib/interfaces/maestros/reportes.interface";
import { formatFechaDDMMYY, formatFechaEnvio } from "@/lib/utils/constantes";
import ExcelJS from "exceljs";
import 'dayjs/locale/es';
import saveAs from "file-saver";

export const exportarExcelTIM = async (data: Partial<Reporte> | null, empresaTransporte: string, conductor: string, fechaRecepcion: string | null, faltantes: Detalle[], sobrantes: Detalle[], usuarioNombre: string) => {
    const fechaRecepcionFormatted = formatFechaDDMMYY(new Date(fechaRecepcion as string));
    const fechaEnvioFormatted = formatFechaEnvio(data?.fechaEnvio as string);
    const origenRaw = data?.origen ?? "";
    const origenParts = origenRaw.trim().split(/\s+/);
    const codigoOrigen = origenParts.length > 0 ? origenParts[0] : "";
    const movilOrigen = origenRaw.includes("CD Secos") ? "CD Secos" : "CD Frescos";
    const destinoRaw = data?.destino ?? "";
    const destinoParts = destinoRaw.split(/\s*-\s*/);
    const codigoTienda = destinoParts.length > 0 ? destinoParts[0].trim() : "";
    const tiendaDestino = destinoParts.length > 1 ? destinoParts[1].trim() : "";

    const workbook = new ExcelJS.Workbook();

    /* =============== HOJA FALTANTES =============== */
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
        const asunto = `DISCREPANCIA_${fechaRecepcionFormatted}_${movilOrigen}_TIM_${data?.tim} ${codigoTienda}_${tiendaDestino}`;

        let marca = "-";
        if (d.marcaSensible) marca = "C";
        else if (d.isContable) marca = "T";

        sheetFaltantes.addRow([
            fechaEnvioFormatted,
            fechaRecepcionFormatted,
            codigoTienda,
            tiendaDestino,
            codigoOrigen,
            movilOrigen,
            empresaTransporte,
            conductor,
            asunto ?? "",
            data?.tim,
            d.olpn ?? "",
            d.subdpto ?? "",
            d.sku,
            d.ean ?? "",
            d.descripcion,
            d.uMedida ?? "",
            d.uEnviadas,
            d.uRecibidas,
            diferencia,
            costo,
            montoFaltante,
            d.modificadoPor ?? usuarioNombre,
            "PENDIENTE",
            marca,
        ]);
    });

    /* =============== HOJA SOBRANTES =============== */
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
            fechaEnvioFormatted,
            fechaRecepcionFormatted,
            data?.tim,
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

    /* =============== DESCARGA =============== */
    const buffer = await workbook.xlsx.writeBuffer();

    saveAs(
        new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `BITACORA_TIM_${data?.tim}.xlsx`
    );
}