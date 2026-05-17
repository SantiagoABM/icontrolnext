'use server'

import { RespuestaApi, RespuestaApiPag } from "@/lib/interfaces/global.interfaces";
import { redirect } from "next/navigation";
import { convertirFecha } from "@/lib/utils/constantes";
import { ProductoFilter } from "@/lib/interfaces/filtros/productos.filters.interface";
import { ObtenerSesion } from "../cookie.action";
import { peticionGET, peticionPOST } from "../axios.action";
import { UsuarioFilter } from "@/lib/interfaces/filtros/usuarios.filters.interface";
import { Usuario } from "@/lib/interfaces/maestros/usuarios.interface";

export const getAllUsuariosByFilter = async (
    filtros: UsuarioFilter): Promise<RespuestaApi<any>> => {
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
            endpoint: `${process.env.NEXT_PUBLIC_API_USUARIO_GET_ALL_FILTER_POST}`,
            body: {
                dni: filtros.dni,
                correo: filtros.correo,
                nombre: filtros.nombre,
                rol: filtros.rol,
                activo: filtros.activo
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
export const getAllRoles = async (): Promise<RespuestaApi<any>> => {
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
            endpoint: `${process.env.NEXT_PUBLIC_API_USUARIO_GET_ALL_ROLES_GET}`
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

export const createUsuario = async (data: Partial<Usuario>): Promise<RespuestaApi<any>> => {
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
            endpoint: `${process.env.NEXT_PUBLIC_API_USUARIO_CREATE}`,
            body: data
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
export const updateUsuario = async (data: Partial<Usuario>): Promise<RespuestaApi<any>> => {
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
            endpoint: `${process.env.NEXT_PUBLIC_API_USUARIO_UPDATE}/${data._id}`,
            body: data
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

export const reestablecerPasswordAction = async (id: string): Promise<RespuestaApi<any>> => {
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
            endpoint: `${process.env.NEXT_PUBLIC_API_USUARIO_REESTABLECER_PASSWORD}/${id}`,
            body: {}
        });

        return result;
    } catch (error) {
        return {
            success: false,
            mensaje: 'Error al obtener la sesion',
            datos: null,
            sesion: false
        };
    }
}
