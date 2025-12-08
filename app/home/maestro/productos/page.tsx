
import ProductosComponent from "@/lib/components/productos/maestroProductos.component";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Lista de Productos",
    description: "Lista de productos del maestro",
  };

export default function Producto(){
    return (<ProductosComponent></ProductosComponent>)
}