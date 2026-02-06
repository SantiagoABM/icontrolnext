import { uploadProductosLote } from "../actions/maestros/producto.action";
import { Producto } from "../interfaces/maestros/productos.interfaces";
import Papa from "papaparse";

export async function parseCsvStream(
    file: File,
    chunkSize = 500,
    onProgress?: (count: number) => void
) {
    let buffer: Producto[] = [];
    let total = 0;

    return new Promise<void>((resolve, reject) => {
        Papa.parse(file, {
            delimiter: ";",
            skipEmptyLines: true,
            header: false,
            step: async (results, parser) => {
                try {
                    const row = results.data as string[];

                    // saltar header
                    if (total === 0) {
                        total++;
                        return;
                    }

                    buffer.push({
                        subdpto: row[0],
                        proveedor: row[1],
                        ean: row[2],
                        sku: row[3],
                        descripcion: row[4],
                        marca: row[5],
                        costoPromedio: Number(row[6]) || 0,
                        precioVigente: Number(row[7]) || 0,
                        casePack: Number(row[8]) || 1,
                        uMedida: row[9]?.trim(),
                        precioInv: (Number(row[11]) / Number(row[12])),
                    }as Producto);

                    total++;

                    if (buffer.length >= chunkSize) {
                        parser.pause();
                        await uploadProductosLote(buffer);
                        buffer = [];
                        onProgress?.(total);
                        parser.resume();
                    }
                } catch (err) {
                    parser.abort();
                    reject(err);
                }
            },
            complete: async () => {
                if (buffer.length) {
                    await uploadProductosLote(buffer);
                }
                resolve();
            },
            error: reject,
        });
    });
}
