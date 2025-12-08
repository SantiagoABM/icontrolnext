import { createTheme } from "@mantine/core";
import { IconHome } from "@tabler/icons-react";
import { MenuItem } from "../interfaces/global.interfaces";

export type IconType = typeof IconHome;
export const redondear = (valor: number) => Number(valor.toFixed(2));

export const apiBase = process.env.NEXT_PUBLIC_URL_API_CONTROVERDE;
export const urlBase = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const urlBaseApplication = process.env.NEXT_PUBLIC_BASE_URL_APPLICATION || ''
export const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || "error";
export const minutosSesion = 10;
export const title = process.env.NEXT_PUBLIC_TITLE || "Control Verde"

export const cookieName = "control_name_sesion";
export const Mb1 = 1024; //para calcular
export const maxMB = 40; //maximo de archivos de subida

export const color_Primario = "#0CC20CFF"; //"#0CC20CFF"; // #4AD32FFF
export const color_PrimarioDark = "#6BCF44FF";

export const color_Secundario = "#785200FF";
export const color_SecundarioDark = "#EEA722FF";


export const color_success = "#2e7d32";
export const color_secondary = "#00bcd4";

export const color_primary_darkMode = "#006fe1";
export const color_secondary_darkMode = "#68daf9";

export const radiusStyle = "3px"

export function convertirFecha(fechaISO: string) {
    if (!fechaISO) return "";

    const [yyyy, mm, dd] = fechaISO.split("-");
    return `${dd}/${mm}/${yyyy}`;
}

export const ID_PAGES = {
    EPORT: 'REPORTE'
}


export const motivos = [{
    value: "D",
    label: "Donación",
},
{
    value: "T",
    label: "Reporte Tim"
},
{
    value: "I",
    label: "Inventario"
}]
export const ums = ["KG", "UN"]
export const roles = ["administrador", "operador", "supervisor"];

export const menuItemsMock: MenuItem[] = [
    {
        idOpcion: "1",
        nombre: "Dashboard",
        url: "/home",
        orden: "1",
        icono: "IconHome",
    },
    {
        idOpcion: "2",
        nombre: "Productos",
        url: "/home/maestro/productos",
        orden: "2",
        icono: "IconTable",
    },
    {
        idOpcion: "3",
        nombre: "Reportes",
        url: "/home/maestro/reportes",
        orden: "3",
        icono: "IconClipboardTextFilled",
    },
    {
        idOpcion: "4",
        nombre: "Usuarios",
        url: "/home/maestro/usuarios",
        orden: "4",
        icono: "IconUsersGroup",
    }
];


export const ControlTheme = createTheme({
    primaryColor: 'green',
    fontFamily: 'system-ui, sans-serif',
    defaultRadius: radiusStyle,
    colors: {
        green: ['#F2FFF0FF', '#D4FFC7FF', '#A9FF9EFF', '#8CFF75FF', '#71FF4DFF', '#45F522FF', '#29CF13FF', '#14A807FF', '#008207FF', '#085C00FF'],
    },
    components: {
        Input: {
            styles: {
                section: {
                    zIndex: 0,
                }
            }
        },
        Button: {
            styles: {
                root: {
                    zIndex: 0, // Establece z-index base
                    '&:focus': {
                        zIndex: '0 !important',
                    },
                    '&:focusVisible': {
                        zIndex: '0 !important',
                    },
                    // Si necesitas mantener el hover funcional
                    '&:hover': {
                        zIndex: 0,
                    }
                }
            }
        }
    }
});