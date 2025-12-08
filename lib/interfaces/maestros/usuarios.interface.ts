export interface Usuario {
    _id: string | null
    dni: string | null
    tienda: number | null
    correo: string | null
    password?: string | null
    nombre: string | null
    apellido: string | null
    rol: string | null
    activo: boolean
    createAt: Date
}