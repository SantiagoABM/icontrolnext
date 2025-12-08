'use server'

import { cookies } from "next/headers";
import { cookieName, minutosSesion } from "../utils/constantes";
import { compressToBase64, decompressFromBase64 } from "../utils/compresores";
import { DatosSesion } from "../interfaces/authentication.interfaces";

export async function ObtenerSesion(): Promise<DatosSesion | null> {
    try {
        const cookieStore = await cookies();
        const sesionData = cookieStore.get(cookieName)?.value;

        // 1️⃣ No existe cookie
        if (!sesionData) return null;

        // 2️⃣ Intentar descomprimir
        const dataComprimida = decompressFromBase64(sesionData);
        if (!dataComprimida || dataComprimida.trim() === "") {
            console.log("⛔ Cookie corrupta o vacía");
            return null;
        }

        let datosSesion: DatosSesion;
        try {
            datosSesion = JSON.parse(dataComprimida);
        } catch (err) {
            console.log("⛔ JSON inválido en cookie");
            return null;
        }

        // 3️⃣ Validar fecha de expiración
        // if (!datosSesion.fechaExpiracion) return null;

        // const exp = new Date(datosSesion.fechaExpiracion);
        // if (exp < new Date()) {
        //   console.log("⛔ Sesión vencida");
        //   return null;
        // }

        return datosSesion;

    } catch (error) {
        console.error("❌ Error al leer cookie:", error);
        return null;
    }
}

export async function VerifyCookie() {
    try {
        const cookieStore = await cookies();
        const sesionData = cookieStore.get(cookieName)?.value;

        if (!sesionData) return false;

        let jsonString = null;

        try {
            jsonString = decompressFromBase64(sesionData);
        } catch {
            // Cookie corrupta → no válida
            return false;
        }

        let sesion = null;

        try {
            sesion = JSON.parse(jsonString);
        } catch {
            return false;
        }

        // Validar expiración real
        if (!sesion.fechaExpiracion) return false;

        const exp = new Date(sesion.fechaExpiracion);
        if (isNaN(exp.getTime())) return false;

        if (new Date() > exp) return false;

        return true;
    } catch (error) {
        console.error("Error en VerifyCookie:", error);
        return false;
    }
}


export async function GuardarSesion({
    datosSesion
}: {
    datosSesion: DatosSesion;
}): Promise<{ success: boolean; mensaje: string }> {
    const cookieStore = await cookies();
    const fechaExpiracion = new Date();
    fechaExpiracion.setMinutes(fechaExpiracion.getMinutes() + 30);
    const datosSesionConExp = {
        ...datosSesion,
        refreshToken: null,
        fechaExpiracion: fechaExpiracion.toISOString()
    };
    const sesionData = JSON.stringify(datosSesionConExp);

    const dataComprimida = compressToBase64(sesionData);

    const expiresDate = new Date();
    expiresDate.setMinutes(expiresDate.getMinutes() + minutosSesion); // Expira en 30 minuto

    cookieStore.set(cookieName, dataComprimida, {
        expires: expiresDate,
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
    });

    
    return { success: true, mensaje: "Sesión actualizada correctamente" };
}


export async function EliminarCookie(): Promise<void> {
    // const datosSesion = await ObtenerSesion();
    // if (!datosSesion) return;

    const cookieStore = await cookies();
    // cookieStore.set(cookieName, "", {
    //   expires: new Date(0), // Expirar inmediatamente
    //   path: "/",
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "lax",
    // });
    cookieStore.delete(cookieName)
}
