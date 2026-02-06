import { RespuestaApi } from "@/lib/interfaces/global.interfaces";
import { peticionGET } from "../axios.action";
import { ObtenerSesion } from "../cookie.action";
import { redirect } from "next/navigation";
import { BitacoraFilter } from "@/lib/interfaces/maestros/bitacora.interface";

export const getBitacoraByFilter = async (filtros : BitacoraFilter): Promise<RespuestaApi<any>> => {
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
            endpoint: `${process.env.NEXT_PUBLIC_API_GET_BITACORA_BY_FILTER_POST}?tipo=${filtros.tipo}`
        });
        console.log('Resultado de getBitacoraByFilter:', result);
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

export const deleteBitacora = async (): Promise<RespuestaApi<any>> => {
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
            endpoint: `${process.env.NEXT_PUBLIC_API_DELETE_BITACORA}`
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