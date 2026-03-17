"use client";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { useEffect, useState } from "react";
import "dayjs/locale/es";
import "@mantine/notifications/styles.css";
import { ControlTheme } from "@/lib/utils/constantes";
import { Notifications } from "@mantine/notifications";
import { ConfirmProvider } from "@/lib/providers/confirm.provider";
import { GlobalLoader } from "./globalLoader.component";
import NextTopLoader from "nextjs-toploader";
import dayjs from "dayjs";
dayjs.locale("es");

export default function LayoutGlobalComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Esperar hasta que estemos en el cliente
    setIsMounted(true);
  }, []);

  if (!isMounted) return null; // Evita render en SSR

  return (
    <>
      <NextTopLoader color="#0CC20C" showSpinner={false} />
      <MantineProvider theme={ControlTheme}>
        <ConfirmProvider>{children}</ConfirmProvider>
        <Notifications />
        <GlobalLoader></GlobalLoader>
      </MantineProvider>
    </>
  );
}
