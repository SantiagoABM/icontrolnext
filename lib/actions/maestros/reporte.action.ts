import { RespuestaApi } from "@/lib/interfaces/global.interfaces";
import { ObtenerSesion } from "../cookie.action";
import { peticionGET, peticionPOST } from "../axios.action";
import { redirect } from "next/navigation";
import { ReporteFilter } from "@/lib/interfaces/filtros/reportes.filters.interface";
import { Reporte } from "@/lib/interfaces/maestros/reportes.interface";

export const getReportesByMotivo = async (motivo: string): Promise<RespuestaApi<any>> => {
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
            endpoint: `${process.env.NEXT_PUBLIC_API_GET_REPORTES_MOTIVO}?motivo=${motivo}`
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
export const getReportesByFilter = async (
    filtros: ReporteFilter): Promise<RespuestaApi<any>> => {
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
        const result = await peticionPOST({
            endpoint: `${process.env.NEXT_PUBLIC_API_GET_REPORTES_BY_FILTER_POST}`,
            body: {
                tim: filtros.tim,
                motivo: filtros.motivo,
                estado: filtros.estado
            }
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

export const CreateReporte = async (
    reporte: Reporte): Promise<RespuestaApi<any>> => {
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
        console.log('Reporte a crear:', reporte.creadoPor);

        const result = await peticionPOST({
            endpoint: `${process.env.NEXT_PUBLIC_API_GET_REPORTES_CREATE}`,
            body: {
                tim: reporte.tim,
                placa: reporte.placa,
                origen: reporte.origen,
                destino: reporte.destino,
                fechaEnvio: reporte.fechaEnvio,
                creadoPor: reporte.creadoPor,
                motivo: reporte.motivo
            }
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
export const reactivarTim = async (
    tim: number
): Promise<RespuestaApi<any>> => {
    try {
        // 🔐 Validar sesión
        const datosSesion = await ObtenerSesion();

        if (!datosSesion) {
            return {
                success: false,
                mensaje: "No hay sesión activa",
                datos: null,
                sesion: false,
            };
        }

        // 🚀 Llamada al backend
        const result = await peticionGET({
            endpoint: `${process.env.NEXT_PUBLIC_API_REACTIVAR_TIM}/${tim}`,
        });

        return result;
    } catch (error) {
        redirect("/auth");

        return {
            success: false,
            mensaje: "Error al actualizar flags por subdepartamento",
            datos: null,
            sesion: false,
        };
    }
};