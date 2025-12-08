// 'use server'

// import { RespuestaApi, RespuestaApiPag } from "@/lib/interfaces/global.interfaces";
// import { ObtenerSesion } from "../cookie.admin.action";
// import { peticionGETPag, peticionPOST, peticionPOSTPag } from "../axios.actions";
// import { redirect } from "next/navigation";
// import { ConsultarHistoryFilter } from "@/lib/interfaces/ejemplo.interface";
// import { convertirFecha } from "@/lib/utils/constantes";

// export const getAllProductos = async (
//     filtros: ConsultarHistoryFilter): Promise<RespuestaApi<any>> => {
//     try {
//         console.log("hola")
//         const datosSesion = await ObtenerSesion();
//         console.log(datosSesion)
//         if (!datosSesion) {
//             return {
//                 success: false,
//                 mensaje: 'No hay sesión activa',
//                 datos: null,
//                 sesion: false,
//             };
//         }
//         filtros.endTime = convertirFecha(String(filtros.endTime));
//         filtros.startTime = convertirFecha(String(filtros.startTime));

//         const result = await peticionPOST({
//             endpoint: `${process.env.NEXT_PUBLIC_API_PROVEEDORE_GET_ALL_FILTER}`,
//             body: {
//                 IPAdress: filtros.iPAdress,
//                 Name: filtros.name,
//                 Unit: filtros.unit,
//                 StartTime: filtros.startTime,
//                 EndTime: filtros.endTime,
//                 State: filtros.state
//             }
//         });
        
//         return result;
//     } catch (error) {
//         redirect('/auth')
//         return {
//             success: false,
//             mensaje: 'Error al obtener la sesion',
//             datos: null,
//             sesion: false
//         };
//     }
// }