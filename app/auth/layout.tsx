import { urlBase } from "@/lib/utils/constantes";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Auth - IControl",
  description: "Página de autenticación de IControl",
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main
      className="flex flex-col items-center justify-center h-screen"
      style={{
        backgroundImage: `url("${urlBase}/banner.png")`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      {children}
    </main>
  );
}
