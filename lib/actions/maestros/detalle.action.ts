import { RespuestaApi } from "@/lib/interfaces/global.interfaces";
import { ObtenerSesion } from "../cookie.action";
import { peticionGET, peticionPOST } from "../axios.action";
import { redirect } from "next/navigation";
import { Detalle } from "@/lib/interfaces/maestros/reportes.interface";

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

export const CargarDetallesByLote = async (reportes: Detalle[]): Promise<RespuestaApi<any>> => {
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
        console.log("Cargando detalles por lote:", reportes);
        const result = await peticionPOST({
            endpoint: `${process.env.NEXT_PUBLIC_API_GET_DETALLES_CARGAR_LOTE}`,
            body: {reportes}
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