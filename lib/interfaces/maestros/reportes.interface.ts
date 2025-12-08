export interface Reporte {
    _id: String | null
    tim: number | null
    placa: String | null
    origen: String | null
    destino: String | null
    fechaEnvio: Date | null
    estado: boolean
    expireAt: null
    motivo: String | null
}

export interface Detalle {
    _id: String | null,
    tim: number | null,
    olpn: String | null,
    sku: String | null,
    uEnviadas: number | 0,
    uRecibidas: number | 0,
    fechavencimiento: String | null,
    observacion: String | null,
    fastRegister: boolean,
    ean: String | null,
    subdpto: string | null,
    descripcion: String | null,
    casePack: number | 1,
    uMedida: String | null,
    precioVigente: number | null,
    costoPromedio: number | 0
}