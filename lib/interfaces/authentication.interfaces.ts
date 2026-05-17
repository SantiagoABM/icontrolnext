// export interface TipoDocumento  {
//   codigo: string;
//   nombre: string;
//   selected: string;
// };

// export interface UsuarioSesion  {
//   nombre: string;
//   rol: string;
//   id: number;
// };


export interface UsuarioSesion {
    id?: string;
    nombre: string;
    rol: string
    token: string
    updatePass: boolean
    correo?: string;
};

export interface DatosSesion {
    id?: string;
    nombre: string;
    rol: string
    token: string
    updatePass: boolean
    correo?: string;
};
