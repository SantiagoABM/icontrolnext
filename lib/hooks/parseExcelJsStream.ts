import ExcelJS from "exceljs";
import { Producto } from "../interfaces/maestros/productos.interfaces";
import { uploadProductosLote } from "../actions/maestros/producto.action";

export async function parseExcelJsStream(
    file: File,
    chunkSize = 400,
    onProgress?: (count: number) => void
) {
    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();

    await workbook.xlsx.load(buffer);

    const sheet = workbook.worksheets[0];

    if (!sheet) {
        throw new Error('No se encontró ninguna hoja en el archivo');
    }

    let productosBuffer: Producto[] = [];
    let total = 0;

    // ✅ Primero recolectamos todos los productos
    const productos: Producto[] = [];

    sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber === 1) return; // Saltar encabezados

        // ✅ Excel usa índices desde 1, no desde 0
        const subdpto = row.getCell(1).text?.trim() || '';
        const proveedor = row.getCell(2).text?.trim() || '';
        const ean = row.getCell(3).text?.trim() || '';
        const sku = row.getCell(4).text?.trim() || '';
        const descripcion = row.getCell(5).text?.trim() || '';
        const marca = row.getCell(6).text?.trim() || '';
        const costoPromedio = Number(row.getCell(7).value) || 0;
        const precioVigente = Number(row.getCell(8).value) || 0;
        const casePack = Number(row.getCell(9).value) || 1;
        const uMedida = row.getCell(10).text?.trim() || '';

        // Cálculo del precioInv
        const valor1 = Number(row.getCell(11).value) || 0;
        const valor2 = Number(row.getCell(12).value) || 1; // Evitar división por 0
        const precioInv = valor1 !== 0 ? Number(valor2 / valor1).toFixed(2) : 0;

        // Validar que al menos tenga SKU o EAN
        if (!sku && !ean) return;

        productos.push({
            subdpto,
            proveedor,
            ean,
            sku,
            descripcion,
            marca,
            costoPromedio,
            precioVigente,
            casePack,
            uMedida,
            precioInv,
        } as Producto);
    });

    // ✅ Ahora procesamos los productos en lotes
    for (let i = 0; i < productos.length; i += chunkSize) {
        const chunk = productos.slice(i, i + chunkSize);

        await uploadProductosLote(chunk);

        total += chunk.length;
        onProgress?.(total);
    }

    return total;
}