'use server';
import axios from "axios";
import { headers } from "next/headers";
import { apiBase } from "../utils/constantes";
import { RespuestaApi, RespuestaApiPag, TokenReponse } from "../interfaces/global.interfaces";
import { base64ToBlob } from "../hooks/helpers";
import { ObtenerSesion } from "./cookie.action";

export async function obtenerIp(): Promise<string> {
    const headerList = headers();
    const ip = (await headerList).get("x-forwarded-for") || "0.0.0.0"; // IP del cliente o valor por defecto

    return ip;
}

export async function peticionGET({
    endpoint,
}: {
    endpoint: string;
}): Promise<RespuestaApi<any>> {

    try {
        const session = await ObtenerSesion();

        const res = await axios.get(`${apiBase}${endpoint}`, {
            headers: {
                Authorization: `Bearer ${session?.token}`,
            },
        });

        return {
            success: res.data.success,     // ✔ SIN INVERTIRLO
            mensaje: res.data.message,
            datos: res.data.datos,
            sesion: false
        };

    } catch (error: any) {

        const statusCode = error?.response?.status;
        const isAuthError = statusCode === 401 || statusCode === 403;

        return {
            success: false,
            mensaje: error?.response?.data?.message || error.message || "Error desconocido",
            datos: null,
            sesion: isAuthError,
        };
    }
}


export async function peticionGETPag({
    endpoint,
}: {
    endpoint: string;
}): Promise<RespuestaApiPag<any>> {

    try {
        // 🔥 Verificar y refrescar sesión si es necesario
        const session = await ObtenerSesion();

        console.log("Realizando petición GET a:", `${apiBase}${endpoint}`);

        const res = await axios.get(`${apiBase}${endpoint}`, {
            headers: {
                Authorization: `Bearer ${session?.token}`,
            },
        });

        return {
            success: !res.data.success,
            mensaje: res.data.message,
            datos: res.data.datos,
            sesion: false,
            pagina: res.data.pagina,
            tamanoPagina: res.data.tamanoPagina,
            totalRegistros: res.data.totalRegistros
        };

    } catch (error: any) {
        // 🔥 Detectar errores de autenticación/autorización
        const statusCode = error?.response?.status;
        const isAuthError = statusCode === 401 || statusCode === 403;

        const mensajeServidor =
            error?.response?.data?.status?.message || error.message || "Error desconocido";

        return {
            success: false,
            mensaje: mensajeServidor,
            datos: null,
            sesion: isAuthError, // 🔥 Indicar si es un error de sesión
            pagina: 1,
            tamanoPagina: 10,
            totalRegistros: 0
        };
    }
}

export async function peticionPOSTPag({
    endpoint,
    body
}: {
    endpoint: string;
    body: any;
}): Promise<RespuestaApiPag<any>> {

    try {
        // 🔥 Verificar y refrescar sesión si es necesario
        const session = await ObtenerSesion();

        console.log("Realizando petición POST a:", `${apiBase}${endpoint}`);

        const res = await axios.post(`${apiBase}${endpoint}`, body, {
            headers: {
                Authorization: `Bearer ${session?.token}`,
            },
        });

        return {
            success: !res.data.success,
            mensaje: res.data.message,
            datos: res.data.datos,
            sesion: false,
            pagina: res.data.pagina,
            tamanoPagina: res.data.tamanoPagina,
            totalRegistros: res.data.totalRegistros
        };

    } catch (error: any) {
        // 🔥 Detectar errores de autenticación/autorización
        const statusCode = error?.response?.status;
        const isAuthError = statusCode === 401 || statusCode === 403;

        const mensajeServidor =
            error?.response?.data?.status?.message || error.message || "Error desconocido";

        return {
            success: false,
            mensaje: mensajeServidor,
            datos: null,
            sesion: isAuthError, // 🔥 Indicar si es un error de sesión
            pagina: 1,
            tamanoPagina: 10,
            totalRegistros: 0
        };
    }
}


export async function peticionPOST({
    endpoint,
    body,
}: {
    endpoint: string;
    body: any;
}): Promise<RespuestaApi<any>> {

    try {
        const session = await ObtenerSesion();

        const res = await axios.post(`${apiBase}${endpoint}`, body, {
            headers: {
                Authorization: `Bearer ${session?.token}`,
            },
        });

        return {
            success: res.data.success,   // ✔ YA NO HAY INVERSION
            mensaje: res.data.message,
            datos: res.data.datos,
            sesion: false
        };

    } catch (error: any) {

        const statusCode = error?.response?.status;
        const isAuthError = statusCode === 401 || statusCode === 403;

        return {
            success: false,
            mensaje: error?.response?.data?.message || error.message || "Error desconocido",
            datos: null,
            sesion: isAuthError,
        };
    }
}


export async function peticionPOSTWithBlobReturn({
    endpoint,
    body,
}: {
    endpoint: string;
    body: any;
}): Promise<RespuestaApi<any>> {

    console.log("Realizando petición POST a:", `${apiBase}${endpoint}`);

    try {

        const session = await ObtenerSesion();

        const res = await axios.post(`${apiBase}${endpoint}`, body, {
            headers: {
                Authorization: `Bearer ${session?.token}`,
            },
        });

        if (res.data.success) {
            return {
                success: false,
                mensaje: res.data.message,
                datos: null,
                sesion: false,
                filename: ""
            }
        }
        const fileBlob = res.data.datos.file_base64?.trim();
        const blob = fileBlob ? base64ToBlob(fileBlob, res.data.contentType) : null;

        const respuesta = {
            success: blob ? true : false,
            mensaje: blob ? res.data.status.message : "No se ha podido obtener el archivo",
            datos: blob,
            sesion: false,
            filename: res.data.data.nombreFile
        }

        return respuesta

    } catch (error: any) {
        // 🔥 Detectar errores de autenticación/autorización
        const statusCode = error?.response?.status;
        const isAuthError = statusCode === 401 || statusCode === 403;

        const mensajeServidor =
            error?.response?.data?.status?.message || error.message || "Error desconocido";

        return {
            success: false,
            mensaje: mensajeServidor,
            datos: null,
            sesion: isAuthError, // 🔥 Indicar si es un error de sesión
            filename: ""
        };
    }
}

export async function peticionGETWithBlobReturn({
    endpoint,
}: {
    endpoint: string;
}): Promise<RespuestaApi<any>> {

    console.log("Realizando petición GET a:", `${apiBase}${endpoint}`);

    try {
        const session = await ObtenerSesion();

        const res = await axios.get(`${apiBase}${endpoint}`, {
            headers: {
                Authorization: `Bearer ${session?.token}`,
            },
        });

        if (res.data.status.isError) {
            return {
                success: false,
                mensaje: res.data.status.message,
                datos: null,
                sesion: false,
                filename: ""
            }
        }
        const fileBlob = res.data.data.file_base64?.trim();
        const blob = fileBlob ? base64ToBlob(fileBlob, res.data.data.contentType) : null;

        const respuesta = {
            success: blob ? true : false,
            mensaje: blob ? res.data.status.message : "No se ha podido obtener el archivo",
            datos: blob,
            sesion: false,
            filename: res.data.data.nombreFile
        }

        return respuesta

    } catch (error: any) {
        // 🔥 Detectar errores de autenticación/autorización
        const statusCode = error?.response?.status;
        const isAuthError = statusCode === 401 || statusCode === 403;

        const mensajeServidor =
            error?.response?.data?.status?.message || error.message || "Error desconocido";

        return {
            success: false,
            mensaje: mensajeServidor,
            datos: null,
            sesion: isAuthError, // 🔥 Indicar si es un error de sesión
            filename: ""
        };
    }
}


export async function peticionPOSTSesion({
    endpoint,
    body,
}: {
    endpoint: string;
    body: any;
}): Promise<RespuestaApi<any>> {

    console.log("Realizando petición POST a:", `${apiBase}${endpoint}`);

    try {
        const res = await axios.post(`${apiBase}${endpoint}`, body);
        console.log("RESPONSE FROM SERVER:", res.data);

        return {
            success: res.data.success !== undefined ? res.data.success : !res.data.status?.isError,
            mensaje: res.data.message || res.data.status?.message || "Sin mensaje",
            datos: res.data.datos || res.data.data || null,
            sesion: false
        };

    } catch (error: any) {
        console.error("DEBUG peticionPOSTSesion API Error:", {
            message: error?.message,
            code: error?.code,
            status: error?.response?.status,
            data: error?.response?.data
        });

        const statusCode = error?.response?.status;
        const isAuthError = statusCode === 401 || statusCode === 403;

        return {
            success: false,
            mensaje: error?.response?.data?.message || error.message || "Error desconocido",
            datos: null,
            sesion: isAuthError,
        };
    }
}


export async function peticionPOSTRefresh({
    endpoint,
    refreshToken
}: {
    endpoint: string;
    refreshToken: string;
}): Promise<RespuestaApi<any>> {

    console.log("Realizando petición POST a:", `${apiBase}${endpoint}`);

    try {
        const session = await ObtenerSesion();

        const res = await axios.get(`${apiBase}${endpoint}`, {
            headers: {
                Authorization: `Bearer ${session?.token}`,
            },
        });

        return {
            success: !res.data.status.isError,
            mensaje: res.data.status.message,
            datos: res.data.data,
            sesion: false
        };

    } catch (error: any) {
        // 🔥 Detectar errores de autenticación/autorización
        const statusCode = error?.response?.status;
        const isAuthError = statusCode === 401 || statusCode === 403;

        const mensajeServidor =
            error?.response?.data?.status?.message || error.message || "Error desconocido";

        return {
            success: false,
            mensaje: mensajeServidor,
            datos: null,
            sesion: isAuthError, // 🔥 Indicar si es un error de sesión
        };
    }
}
