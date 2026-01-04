export interface ReporteFilter{
    tim: String | null
    motivo: String | null
    origen?: String | null
    destino?: Number | null
    fechaEnvio?: Number | null
    estado: boolean
}