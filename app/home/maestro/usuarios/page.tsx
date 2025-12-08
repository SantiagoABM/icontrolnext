import UsuarioComponent from "@/lib/components/usuarios/usuario.component";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Lista de Usuarios",
    description: "Lista de usuarios del maestro",
};

export default function Usuario() {
    return (<UsuarioComponent></UsuarioComponent>)
}