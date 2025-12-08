
import LoginPageComponent from "@/lib/components/auth/login.component";
import { Metadata } from "next";
import { Children } from "react";

export const metadata: Metadata = {
    title: "Login",
    description: "Página de autenticación",
  };

export default function Login(){
    return (<LoginPageComponent></LoginPageComponent>)
}