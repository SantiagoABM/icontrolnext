import { UsuarioSesion } from "../interfaces/authentication.interfaces";
import { Usuario } from "../interfaces/maestros/usuarios.interface";

export function validarRolUsuario(
  usuario: UsuarioSesion | null | undefined,
  rolesPermitidos: string[]
): boolean {
  if (!usuario) return false;
  if (!usuario.rol) return false;

  return rolesPermitidos.includes(usuario.rol);
}
