import { RespuestaApi } from "@/lib/interfaces/global.interfaces";
import { ObtenerSesion } from "../cookie.action";
import { peticionGET } from "../axios.action";
import { redirect } from "next/navigation";

export const getDetalleReporteByTim = async (tim: number): Promise<RespuestaApi<any>> => {
    try {
        const datosSesion = await ObtenerSesion();
        if (!datosSesion) {
            return {
                success: false,
                mensaje: 'No hay sesión activa',
                datos: null,
                sesion: false,
            };
        }
        const result = await peticionGET({
            endpoint: `${process.env.NEXT_PUBLIC_API_GET_DETALLES_BY_TIM}/${tim}`
        });

        return result;
    } catch (error) {
        redirect('/auth')
        return {
            success: false,
            mensaje: 'Error al obtener la sesion',
            datos: null,
            sesion: false
        };
    }
}