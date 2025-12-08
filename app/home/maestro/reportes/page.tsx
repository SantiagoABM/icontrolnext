import UsuarioComponent from "@/lib/components/usuarios/usuario.component";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Lista de Reportes",
    description: "Lista de reportes del maestro",
};

export default function Reporte() {
    return (<UsuarioComponent></UsuarioComponent>)
}