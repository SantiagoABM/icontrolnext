
import { JSX, ReactElement } from 'react';

export interface RespuestaApi<T> {
  success: boolean;
  mensaje: string;
  datos: T | null;
  sesion?: boolean; // Opcional para evitar errores
  filename?: string;
}
export interface RespuestaApiPag<T> {
  success: boolean;
  mensaje: string;
  datos: T | null;
  sesion?: boolean; // Opcional para evitar errores
  totalRegistros: number;
  pagina: number;
  tamanoPagina: number;
}
export interface TokenReponse {
  jwt: string;
  message: string;
  success: boolean;
  tipo: number
}

export interface AccionesPermisos {
  codigo: string;
  esMenu: string;
  icono: string;
  idOpcion: string;
  idPrecedesor: string;
  nombre: string;
  nombrePredecesor: string;
  orden: string;
  url: string;
}
export interface TipoDocumento {
  codigo: string;
  nombre: string;
  selected: string;
};

export interface Acciones {
  idOpcion: string,
  idModulo: string,
  nombre: string,
  url: string,
  orden: string,
  icono: string,
  codigo: string,
  esMenu: string,
  idPredecesor: string,
  nombrePredecesor: string
}

export interface MenuOpcionesResponse {
  sidebar: MenuItem[];
  tiposAsignable: any[];
  acciones_asignables: any[];
  permisos: any[];
}

export interface MenuItem {
  idOpcion: string,
  nombre: string,
  url: string,
  orden: string,
  icono: string,
}
export interface MenuItemNormalized {
  id: string;
  label: string;
  icon: JSX.Element;
  url: string;
}

export interface CommonData {
  subdptos: string[] | []
}