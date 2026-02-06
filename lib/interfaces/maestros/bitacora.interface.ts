export interface Bitacora {
    dni: string;
    tipo: string;
    mensaje: string;
    creadoEn: string;
}
export interface BitacoraFilter {
    dni?: string | null;
    tipo?: string | null;
    desde?: string | null;
    hasta?: string | null;
}