import { Detalle, Reporte } from "@/lib/interfaces/maestros/reportes.interface";
import ExcelJS from "exceljs";
import 'dayjs/locale/es';
import { formatFechaDD_MM_YY, formatFechaDDMMYY, formatFechaEnvio } from "@/lib/utils/constantes";
import saveAs from "file-saver";

export const exportarExcelDonacion = async (data: Partial<Reporte> | null, fechaRecepcion: string | null, productos: Detalle[], usuarioNombre: string) => {
    const fechaRecepcionFormatted = formatFechaDDMMYY(new Date(fechaRecepcion as string));


    const workbook = new ExcelJS.Workbook();

    /* =============== HOJA FALTANTES =============== */
    const sheetFaltantes = workbook.addWorksheet(`Donación`);

    sheetFaltantes.columns = [
        { header: "FECHA ENVIO", width: 18 },
        { header: "CÓDIGO DE TIENDA", width: 18 },
        { header: "TIENDA DONANTE", width: 22 },
        { header: "ORIGEN", width: 18 },
        { header: "DESTINO", width: 22 },
        { header: "#REPORTE", width: 14 },
        { header: "DEPARTAMENTO", width: 16 },
        { header: "SKU", width: 16 },
        { header: "EAN", width: 18 },   
        { header: "DESCRIPCIÓN DE SKU", width: 40 },
        { header: "UNIDAD DE MEDIDA", width: 18 },
        { header: "CANTIDAD REGISTRADA", width: 22 },
        { header: "C.P.", width: 18 },
        { header: "C.P. TOTAL", width: 22 },
        { header: "P.V.", width: 18 },
        { header: "P.V. TOTAL", width: 22 },
        { header: "RESPONSABLE", width: 20 },
        { header: "MARCA SENSIBLE", width: 18 },
    ];

    productos.forEach(d => {
        const costo = d.costoPromedio ?? 0;
        const precio = d.precioVigente ?? 0;
        const cpTotal = d.uRecibidas * costo;
        const pvTotal = d.uRecibidas * precio;

        let marca = "-";
        if (d.marcaSensible) marca = "C";
        else if (d.isContable) marca = "T";

        sheetFaltantes.addRow([
            fechaRecepcionFormatted,
            "352",
            "20508565934 - Hipermercados Tottus S.A.",
            "Pacasmayo",
            "Santa Rita",
            data?.tim,
            d.subdpto ?? "",
            d.sku,
            d.ean ?? "",
            d.descripcion,
            d.uMedida ?? "",
            d.uRecibidas,
            costo,
            cpTotal,
            precio,
            pvTotal,
            d.modificadoPor ?? usuarioNombre,
            marca,
        ]);
    });

    /* =============== DESCARGA =============== */
    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(
        new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        }),
        `DONACION_${formatFechaDD_MM_YY(fechaRecepcionFormatted)}_${data?.tim}.xlsx`
    );
}
