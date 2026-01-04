export interface  Reporte {
    _id?: String | null
    tim: number | null
    placa: String | null
    origen: String | null
    destino: String | null
    fechaEnvio: String | null
    estado?: boolean
    expireAt?: null
    creadoPor?: String | null
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
    marcaSensible?: boolean | null,
    isContable?: boolean | null,
    uMedida: String | null,
    precioVigente: number | null,
    costoPromedio: number | 0,
    modificadoPor?: String | null
}