export interface ProductoFilter {
    ean: string | null;
    sku: string | null;
    subdpto: string[] | null;
    costoPromedio: number | null;
    casePack: number | null;
    descripcion: string | null;
    proveedor: string[] | null;
    marca: string[] | null;
}