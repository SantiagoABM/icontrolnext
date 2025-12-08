"use server";

import { MenuItem, MenuOpcionesResponse, RespuestaApi, TipoDocumento } from "@/lib/interfaces/global.interfaces";


import { cookies } from "next/headers";
import { ObtenerSesion } from "../cookie.action";
import { obtenerIp, peticionGET, peticionPOST, peticionPOSTRefresh, peticionPOSTSesion } from "../axios.action";
import { DatosSesion, UsuarioSesion } from "@/lib/interfaces/authentication.interfaces";

export async function CerrarSesion(): Promise<boolean> {
    const cookie = await cookies();

    cookie.delete("geco_session_token");

    return true;
}

// export async function ObtenerTiposDocumentoLogin(): Promise<RespuestaApi<TipoDocumento[]>> {

//     try {
//         return await peticionGET({
//             endpoint: `${process.env.NEXT_PUBLIC_ENDPOINT_AUTENTICACION_TIPOS_DOCUMENTO}`
//         });
//     } catch (error) {
//         return {
//             success: false,
//             mensaje:
//                 "Ha ocurrido un error tratando de obtener los tipos de documentos",
//             datos: null
//         };
//     }
// }

export async function LoginAction({
    dni,
    password,
    admin = true
}: {
    admin?: boolean;
    dni: string | any;
    password: string | any;
}): Promise<RespuestaApi<UsuarioSesion>> {

    try {
        return await peticionPOSTSesion({
            endpoint: `${process.env.NEXT_PUBLIC_ENDPOINT_AUTENTICACION_INICIAR_SESION}`,
            body: {
                dni: dni,
                password: password,
                admin
            },
        });
    } catch (error) {
        return {
            success: false,
            mensaje: "Ha ocurrido un error tratando de validar los accesos",
            datos: null,
        };
    }
}

export async function RefrescarToken(refreshtoken: string): Promise<RespuestaApi<DatosSesion | null>> {
    const datosSesion = await ObtenerSesion();
    if (!datosSesion) {
        return {
            success: false,
            mensaje: 'No hay sesión activa',
            datos: null,
            sesion: false
        };
    }
    const result = await peticionPOSTRefresh({
        endpoint: process.env.NEXT_PUBLIC_API_AUTH_REFRESH_TOKEN || '',
        refreshToken: refreshtoken
    });

    if (result.success === true) {
        return {
            success: true,
            mensaje: result.mensaje,
            datos: result.datos,
            sesion: false
        };
    }

    return result;
}

// export async function ObtenerOpcionesMenu(): Promise<RespuestaApi<MenuOpcionesResponse>> {
//     const datosSesion = await ObtenerSesion();

//     if (!datosSesion) {
//         return {
//             success: false,
//             mensaje: "Su sesión ha expirado",
//             datos: null,
//             sesion: true,
//         };
//     }


//     try {
//         return await peticionPOST({
//             endpoint: process.env.NEXT_PUBLIC_ENDPOINT_AUTENTICACION_OPCIONES_MENU || "",
//             body: {
//                 idUsuario: datosSesion.idUsuario,
//             },
//         });
//     } catch (error) {
//         return {
//             success: false,
//             mensaje: "Ha ocurrido un error tratando de obtener las opciones de menú.",
//             datos: null,
//             sesion: false,
//         };
//     }
// }
