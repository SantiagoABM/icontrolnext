'use server'

import { RespuestaApi, RespuestaApiPag } from "@/lib/interfaces/global.interfaces";
import { redirect } from "next/navigation";
import { convertirFecha } from "@/lib/utils/constantes";
import { ProductoFilter } from "@/lib/interfaces/filtros/productos.filters.interface";
import { ObtenerSesion } from "../cookie.action";
import { peticionGET, peticionPOST } from "../axios.action";
import { Producto } from "@/lib/interfaces/maestros/productos.interfaces";
import { useMediaQuery } from "@mantine/hooks";

export const getAllProductosByFilter = async (
    filtros: ProductoFilter): Promise<RespuestaApi<any>> => {
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
        // filtros.endTime = convertirFecha(String(filtros.endTime));
        // filtros.startTime = convertirFecha(String(filtros.startTime));
        console.log(process.env.NEXT_PUBLIC_API_PRODUCTO_GET_ALL_FILTER_POST)
        const result = await peticionPOST({
            endpoint: `${process.env.NEXT_PUBLIC_API_PRODUCTO_GET_ALL_FILTER_POST}`,
            body: {
                ean: filtros.ean,
                sku: filtros.sku,
                subdpto: filtros.subdpto,
                precio: filtros.precio,
                casePack: filtros.casePack,
                descripcion: filtros.descripcion,
                proveedor: filtros.proveedor,
                marca: filtros.marca
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
export const getAllSubdptos = async (): Promise<RespuestaApi<any>> => {
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
            endpoint: `${process.env.NEXT_PUBLIC_API_GET_SUBDPTO}`
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
export const getAlluMedidas = async (): Promise<RespuestaApi<any>> => {
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
            endpoint: `${process.env.NEXT_PUBLIC_API_GET_MEDIDA}`
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
export const getAllProveedores = async (): Promise<RespuestaApi<any>> => {
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
            endpoint: `${process.env.NEXT_PUBLIC_API_GET_PROVEEDOR}`
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
export const getAllMarcas = async (): Promise<RespuestaApi<any>> => {
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
            endpoint: `${process.env.NEXT_PUBLIC_API_GET_MARCA}`
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
export const createProducto = async (data: Partial<Producto>): Promise<RespuestaApi<any>> => {
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
            endpoint: `${process.env.NEXT_PUBLIC_API_ADD_PRODUCTO}`,
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

export const updateProducto = async (data: Partial<Producto>): Promise<RespuestaApi<any>> => {
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
            endpoint: `${process.env.NEXT_PUBLIC_API_UPDATE_PRODUCTO}`,
            body:{
                ean: data.ean,
                sku: data.sku,
                uMedida: data.uMedida,
                precioVigente: data.precioVigente,
                costoPromedio: data.costoPromedio,
                marca: data.marca,
                proveedor: data.proveedor,
                subdpto: data.subdpto,
                descripcion: data.descripcion
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