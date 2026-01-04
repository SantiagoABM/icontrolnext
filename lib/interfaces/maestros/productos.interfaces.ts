export interface Producto {
    _id: string | null
    sku: string | null
    ean: string | null
    subdpto: string | null
    descripcion: string | null
    marca: string | null
    proveedor: string | null
    casePack: number | null
    costoPromedio: number | null
    precioVigente: number | null
    uMedida: string | null
    marcaSensible: boolean | false
    isContable: boolean | false
    createdAt: string | null
    updatedAt: string | null
}

export interface SubdptoFlag {
  subdpto: string;
  marcaSensible?: boolean;
  isContable?: boolean;
}