import { createTheme } from "@mantine/core";
import { IconHome } from "@tabler/icons-react";
import { MenuItem } from "../interfaces/global.interfaces";

export type IconType = typeof IconHome;
export const redondear = (valor: number) => Number(valor.toFixed(2));
export const apiBase = process.env.NEXT_PUBLIC_URL_API_CONTROVERDE;
export const urlBase = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const urlBaseApplication = process.env.NEXT_PUBLIC_BASE_URL_APPLICATION || ''
export const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || "error";
export const minutosSesion = 60;
export const title = process.env.NEXT_PUBLIC_TITLE || "Control Verde"

export const cookieName = "control_name_sesion";
export const Mb1 = 1024; //para calcular
export const maxMB = 40; //maximo de archivos de subida

export const color_Primario = "#0CC20CFF"; //"#0CC20CFF"; // #4AD32FFF
export const color_PrimarioDark = "#6BCF44FF";

export const color_Secundario = "#785200FF";
export const color_SecundarioDark = "#FCB022FF";


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
    EPORT: 'REPORTE',
    RODUC: 'PRODUCTOS',
    SUARI: 'USUARIOS',
    PLICA: 'APLICACION'
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
        rolesPermitidos: ["administrador", "supervisor"],
        icono: "IconHome",
    },
    {
        idOpcion: "2",
        nombre: "Productos",
        url: "/home/maestro/productos",
        orden: "2",
        rolesPermitidos: ["administrador", "supervisor"],
        icono: "IconDatabase",
    },
    {
        idOpcion: "3",
        nombre: "Reportes",
        url: "/home/maestro/reportes",
        orden: "3",
        rolesPermitidos: ["administrador", "supervisor", "operador"],
        icono: "IconClipboardTextFilled",
    },
    {
        idOpcion: "4",
        nombre: "Usuarios",
        url: "/home/maestro/usuarios",
        orden: "4",
        rolesPermitidos: ["administrador"],
        icono: "IconUsersGroup",
    },
    {
        idOpcion: "5",
        nombre: "Bitácora",
        url: "/home/bitacora",
        orden: "5",
        rolesPermitidos: ["administrador"],
        icono: "IconBook",
    },
    {
        idOpcion: "6",
        nombre: "Aplicación",
        url: "/home/aplicacion",
        orden: "6",
        rolesPermitidos: ["administrador", "supervisor", "operador"],
        icono: "IconDownload",
    }
];
export const MB = 1024;

export const SUBDEPARTAMENTOS = [
    { codigo: "J010101", descripcion: "ALIMENTOS BASICOS" },
    { codigo: "J010102", descripcion: "ALIMENTOS EN CONSERVA" },
    { codigo: "J010103", descripcion: "ALIMENTOS PARA BEBE" },
    { codigo: "J010104", descripcion: "ALIMENTOS Y ARTICULOS MASCOTAS" },
    { codigo: "J010105", descripcion: "COCKTAIL" },
    { codigo: "J010106", descripcion: "CONFITERIA" },
    { codigo: "J010107", descripcion: "DESAYUNOS/DULCES" },
    { codigo: "J010108", descripcion: "POSTRES/REPOSTERIA" },
    { codigo: "J010109", descripcion: "ARTICULOS PROMOCIONALES" },
    { codigo: "J010201", descripcion: "BEBIDAS" },
    { codigo: "J010202", descripcion: "BEBIDAS ALCOHOLICAS" },
    { codigo: "J020101", descripcion: "LAVADO Y CUIDADO HOGAR" },
    { codigo: "J020102", descripcion: "LAVADO Y CUIDADO ROPA" },
    { codigo: "J020103", descripcion: "PRODUCTOS DE PAPEL PARA EL HOGAR" },
    { codigo: "J020201", descripcion: "CUIDADO DEL BEBE" },
    { codigo: "J020202", descripcion: "CUIDADO Y BELLEZA" },
    { codigo: "J020203", descripcion: "HIGIENE PERSONAL" },
    { codigo: "J020301", descripcion: "ALIMENTOS PARA MASCOTAS" },
    { codigo: "J020302", descripcion: "CUIDADO DE MASCOTAS" },
    { codigo: "J020401", descripcion: "ALIMENTOS PARA BEBES" },
    { codigo: "J030101", descripcion: "CARNES DE VACUNO" },
    { codigo: "J030102", descripcion: "CARNES DE CERDO" },
    { codigo: "J030104", descripcion: "CARNES DE POLLO" },
    { codigo: "J030105", descripcion: "CARNES DE PAVO" },
    { codigo: "J030106", descripcion: "CARNES ESPECIALES" },
    { codigo: "J030107", descripcion: "INSUMOS Y RESIDUOS CARNICERIA" },
    { codigo: "J030201", descripcion: "PESCADOS" },
    { codigo: "J030202", descripcion: "MARISCOS" },
    { codigo: "J040101", descripcion: "FRUTAS" },
    { codigo: "J040102", descripcion: "VERDURAS" },
    { codigo: "J050101", descripcion: "FIAMBRES/CECINAS" },
    { codigo: "J050205", descripcion: "YOGHURT" },
    { codigo: "J050301", descripcion: "ALIMENTOS CONGELADOS" },
    { codigo: "J050201", descripcion: "LECHES Y CREMAS" },
    { codigo: "J050306", descripcion: "HELADOS" },
    { codigo: "J050204", descripcion: "QUESOS" },
    { codigo: "J050202", descripcion: "MANTECAS Y MANTEQUILLAS" },
    { codigo: "J050102", descripcion: "HUEVOS FRESCOS" },
    { codigo: "J050302", descripcion: "MASAS Y PASTAS CONGELADAS" },
    { codigo: "J060101", descripcion: "PANADERIA A GRANEL" },
    { codigo: "J060102", descripcion: "PANADERIA EMPACADA" },
    { codigo: "J060201", descripcion: "PASTELERIA FRESCA" },
    { codigo: "J060202", descripcion: "PASTELERIA SECA" },
    { codigo: "J070101", descripcion: "COMIDAS PREPARADAS" },
    { codigo: "J070102", descripcion: "TOTTUS AL PLATO" },
    { codigo: "J070103", descripcion: "CAFETERIA" },
    { codigo: "J070107", descripcion: "CENTRO DE PRODUCCION PLATOS PREPARADOS" },
    { codigo: "J070109", descripcion: "COMIDA RAPIDA" },
    { codigo: "J080101", descripcion: "BOTTOMS DAMAS" },
    { codigo: "J080102", descripcion: "TOPS DAMAS" },
    { codigo: "J080103", descripcion: "CHOMPAS POLERON / DAMAS" },
    { codigo: "J080104", descripcion: "OUTERWEAR DAMAS" },
    { codigo: "J080201", descripcion: "DENIM JUVENIL DAMAS" },
    { codigo: "J080202", descripcion: "BOTTOMS JUVENIL DAMAS" },
    { codigo: "J080203", descripcion: "TOPS JUVENIL DAMAS" },
    { codigo: "J080204", descripcion: "CHOMPAS / POLERON" },
    { codigo: "J080205", descripcion: "OUTERWEAR" },
    { codigo: "J080206", descripcion: "PLAYA" },
    { codigo: "J080301", descripcion: "BOTTOMS HOMBRES" },
    { codigo: "J080302", descripcion: "TOPS HOMBRES" },
    { codigo: "J080303", descripcion: "CHOMPAS HOMBRES" },
    { codigo: "J080304", descripcion: "OUTERWEAR HOMBRES" },
    { codigo: "J080305", descripcion: "PLAYA HOMBRES" },
    { codigo: "J080401", descripcion: "DENIM JUVENIL HOMBRES" },
    { codigo: "J080402", descripcion: "BOTTOMS JUVENIL HOMBRES" },
    { codigo: "J080403", descripcion: "TOPS JUVENIL HOMBRES" },
    { codigo: "J080404", descripcion: "CHOMPAS JUVENIL HOMBRES" },
    { codigo: "J080405", descripcion: "OUTERWEAR JUVENIL HOMBRES" },
    { codigo: "J080406", descripcion: "PLAYA JUVENIL HOMBRES" },
    { codigo: "J080501", descripcion: "NIÑAS 2-8 AÑOS" },
    { codigo: "J080502", descripcion: "NIÑAS 10-16 AÑOS" },
    { codigo: "J080503", descripcion: "NIÑOS 2-8 AÑOS" },
    { codigo: "J080504", descripcion: "NIÑOS 10-16 AÑOS" },
    { codigo: "J080506", descripcion: "BEBES" },
    { codigo: "J080601", descripcion: "ROPA INTERIOR DAMAS" },
    { codigo: "J080602", descripcion: "ROPA INTERIOR HOMBRES" },
    { codigo: "J080603", descripcion: "ROPA INTERIOR DE NIÑAS" },
    { codigo: "J080604", descripcion: "ROPA INTERIOR DE NIÑOS" },
    { codigo: "J080701", descripcion: "VESTUARIO DEPORTIVO DAMAS" },
    { codigo: "J080802", descripcion: "CALZADO DE DAMA" },
    { codigo: "J080803", descripcion: "CALZADO HOMBRES" },
    { codigo: "J080804", descripcion: "CALZADO NIÑA" },
    { codigo: "J080805", descripcion: "CALZADO NIÑO" },
    { codigo: "J080806", descripcion: "CALZADO DEPORTIVO" },
    { codigo: "J080810", descripcion: "CALZADO ESCOLAR" },
    { codigo: "J080901", descripcion: "CARTERAS BILLETERAS Y OTROS" },
    { codigo: "J080903", descripcion: "OPTICA Y RELOJES" },
    { codigo: "J090101", descripcion: "NAVIDAD" },
    { codigo: "J090102", descripcion: "PLAYA" },
    { codigo: "J090103", descripcion: "TERRAZA" },
    { codigo: "J090105", descripcion: "CONCESIONES" },
    { codigo: "J090201", descripcion: "ALFOMBRAS" },
    { codigo: "J090204", descripcion: "MUEBLES" },
    { codigo: "J090205", descripcion: "REGALOS" },
    { codigo: "J090302", descripcion: "ACCESORIOS DE COCINA" },
    { codigo: "J090303", descripcion: "ACCESORIOS DE MESA" },
    { codigo: "J090304", descripcion: "BATERIAS DE COCINA" },
    { codigo: "J090305", descripcion: "CRISTALERIA" },
    { codigo: "J090306", descripcion: "CUBIERTERIA Y CUCHILLERIA" },
    { codigo: "J090307", descripcion: "ORGANIZADORES DEL HOGAR" },
    { codigo: "J090308", descripcion: "PLASTICOS DE COCINA/MESA" },
    { codigo: "J090310", descripcion: "VAJILLAS" },
    { codigo: "J090401", descripcion: "BAÑO" },
    { codigo: "J090402", descripcion: "COCINA" },
    { codigo: "J090404", descripcion: "DORMITORIO" },
    { codigo: "J090405", descripcion: "DORMITORIO Y CRIANZA DEL BEBE" },
    { codigo: "J090406", descripcion: "MESA" },
    { codigo: "J090501", descripcion: "COLCHONES" },
    { codigo: "J090502", descripcion: "ARTICULOS PROMOCIONALES" },
    { codigo: "J100101", descripcion: "ACCESORIOS AUTOMOVIL" },
    { codigo: "J100102", descripcion: "LIMPIEZA Y MANTENIMIENTO AUTOMOVIL" },
    { codigo: "J100202", descripcion: "BICICLETAS Y ACCESORIOS" },
    { codigo: "J100203", descripcion: "CAMPING" },
    { codigo: "J100204", descripcion: "FITNESS" },
    { codigo: "J100205", descripcion: "UTILITARIOS DEPORTES" },
    { codigo: "J100301", descripcion: "LIBROS Y REVISTAS" },
    { codigo: "J100304", descripcion: "ARTICULOS PROMOCIONALES" },
    { codigo: "J100305", descripcion: "CONCESIONES" },
    { codigo: "J100307", descripcion: "COTILLON" },
    { codigo: "J100401", descripcion: "ACCESORIOS DE FERRETERIA" },
    { codigo: "J100402", descripcion: "HERRAMIENTAS" },
    { codigo: "J100403", descripcion: "ILUMINACION" },
    { codigo: "J100408", descripcion: "PILAS Y BATERIAS" },
    { codigo: "J100602", descripcion: "BATERIA Y RODADOS" },
    { codigo: "J100603", descripcion: "JUEGOS ELECTRONICOS" },
    { codigo: "J100604", descripcion: "JUGUETES AIRE LIBRE" },
    { codigo: "J100605", descripcion: "JUGUETES NIÑAS" },
    { codigo: "J100606", descripcion: "JUGUETES NIÑOS" },
    { codigo: "J100607", descripcion: "JUGUETES PRIMERA EDAD" },
    { codigo: "J100608", descripcion: "JUGUETES UNISEX" },
    { codigo: "J100612", descripcion: "RODADOS Y COCHES" },
    { codigo: "J100701", descripcion: "CUADERNOS Y AGENDAS" },
    { codigo: "J100702", descripcion: "TEXTOS" },
    { codigo: "J100703", descripcion: "UTILES" },
    { codigo: "J100704", descripcion: "LONCHERAS Y CARTUCHERAS" },
    { codigo: "J100705", descripcion: "MOCHILAS" },
    { codigo: "J100706", descripcion: "ARTICULOS PROMOCIONALES" },
    { codigo: "J100801", descripcion: "MALETAS/BOLSOS" },
    { codigo: "J100805", descripcion: "CARRITOS DE MERCADO" },
    { codigo: "J110101", descripcion: "AUDIO" },
    { codigo: "J110102", descripcion: "VIDEO" },
    { codigo: "J110103", descripcion: "ARTICULOS PROMOCIONALES" },
    { codigo: "J110201", descripcion: "ASPIRADO Y LIMPIEZA" },
    { codigo: "J110202", descripcion: "ELECTRODOMESTICOS" },
    { codigo: "J110203", descripcion: "VENTILACION Y CALEFACCION" },
    { codigo: "J110204", descripcion: "ARTICULOS PROMOCIONALES" },
    { codigo: "J110301", descripcion: "CAMPANAS Y TERMAS" },
    { codigo: "J110302", descripcion: "COCINAS" },
    { codigo: "J110303", descripcion: "LAVADO Y SECADO" },
    { codigo: "J110304", descripcion: "REFRIGERADORAS" },
    { codigo: "J110401", descripcion: "COMPUTACION" },
    { codigo: "J110402", descripcion: "FOTOGRAFIA" },
    { codigo: "J110403", descripcion: "TELEFONIA Y COMUNICACIONES" },
    { codigo: "J120101", descripcion: "CANASTAS" },
    { codigo: "J120106", descripcion: "MATERIALES" }
];

export const CATEGORIAS_MACRO = [
    { prefix: "J01", label: "PGC COMESTIBLES" },
    { prefix: "J02", label: "PGC NO COMESTIBLES" },
    { prefix: "J03", label: "CÁRNICOS Y MARISCOS" },
    { prefix: "J04", label: "FRUTAS Y VERDURAS" },
    { prefix: "J05", label: "CONGELADOS / LÁCTEOS / FIAMBRES" },
    { prefix: "J06", label: "PANADERÍA Y PASTELERÍA" },
    { prefix: "J07", label: "PLATOS PREPARADOS" },
    { prefix: "J08", label: "VESTUARIO Y CALZADO" },
    { prefix: "J09", label: "HOGAR Y DECORACIÓN" },
    { prefix: "J10", label: "JUGUETERÍA / DEPORTES / FERRETERÍA" },
    { prefix: "J11", label: "ELECTRODOMÉSTICOS Y ELECTRÓNICA" },
    { prefix: "J12", label: "TEMPORADA / OTROS" },
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
