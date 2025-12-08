"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
    ActionIcon,
    Box,
    Button,
    Group,
    Stack,
    PasswordInput,
    Select,
    Title,
    LoadingOverlay,
    Text,
    TextInput,
    useMantineColorScheme,
} from "@mantine/core";
import { color_Primario, title, urlBase } from "@/lib/utils/constantes";
// import Turnstile from "react-turnstile";
import { IconRestore } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useLoadingStore } from "@/lib/store/useLoadingStore";
import { LoginAction } from "@/lib/actions/auth/auth.action";
import { GuardarSesion } from "@/lib/actions/cookie.action";
import { DatosSesion, UsuarioSesion } from "@/lib/interfaces/authentication.interfaces";
import { useCommonDataStore } from "@/lib/store/useCommonDataStore";
import { getAllSubdptos } from "@/lib/actions/maestros/producto.action";

declare global {
    interface Window {
        turnstile: {
            reset: (widgetId: string) => void;
        };
    }
}

export default function LoginPageComponent() {
    const { colorScheme } = useMantineColorScheme();
    const router = useRouter();
    const { hide } = useLoadingStore();

    // Estados
    //   const [tiposDocumento, setTiposDocumento] = useState<TipoDocumento[]>([]);
    //   const [selectedTipoDoc, setSelectedTipoDoc] = useState<TipoDocumento | null>(
    //     null
    //   );

    const { resetCommonData, setCommonData } = useCommonDataStore();
    const [error, setError] = useState("");
    //   const [empresas, setEmpresas] = useState<EmpresaSesion[]>([]);
    const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);
    //   const [empresa, setEmpresa] = useState<EmpresaSesion | null>(null);
    // const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    // const [turnstileWidgetId, setTurnstileWidgetId] = useState<string | null>(
    //     null
    // );
    const [showPassword, setShowPassword] = useState(false);

    // const resetCaptcha = () => {
    //     if (
    //         turnstileWidgetId &&
    //         typeof window !== "undefined" &&
    //         window.turnstile
    //     ) {
    //         window.turnstile.reset(turnstileWidgetId);
    //         setCaptchaToken(null);
    //     }
    // };

    const submitForm = async (ev: React.FormEvent<HTMLFormElement>) => {
        setLoading(true);
        ev.preventDefault();
        setError("");

        // const res = await fetch(urlBase + "/api/validate-captcha", {
        //     method: "POST",
        //     body: JSON.stringify({ captchaToken }),
        //     headers: { "Content-Type": "application/json" },
        // });
        // const data = await res.json();
        // if (!data.success) {
        //     setError("Captcha inválido, intenta nuevamente");
        //     resetCaptcha();
        //     setLoading(false);
        //     return;
        // }
        const formData = new FormData(ev.target as HTMLFormElement);
        const result = await LoginAction({
            dni: formData.get("nroDoc") || "",
            password: formData.get("password") || "",
        });
        if (!result.success) {
            console.log("Error en login:", result.mensaje);
            setError(result.mensaje);
            // resetCaptcha();
            notifications.show({
                title: "Error",
                message: result.mensaje,
            });
            setLoading(false);
            return;
        }

        setUsuario(result.datos);
        setLoading(false);
    };

    const guardarSesion = async () => {
        // Validación temprana antes de setLoading
        console.log(usuario)
        if (!usuario) {
            return;
        }

        setLoading(true);

        const datosSesion: DatosSesion = {
            nombre: usuario.nombre,
            rol: usuario.rol,
            token: usuario.token,
        };
        const res = await GuardarSesion({ datosSesion });
        if (!res.success) { notifications.show({ title: "ERROR", message: "No se pudo guardar la sesión" }) }


        router.refresh();
        setLoading(false);
    };

    // Preparar datos para el Select
    // const tiposDocumentoData = tiposDocumento.map((tipo) => ({
    //     value: tipo.codigo,
    //     label: tipo.nombre,
    // }));
    // Efecto inicial: cargar tipos de documento
    // useEffect(() => {
    //     const fetchTiposDocumentos = async () => {
    //         hide();
    //         const response = await ObtenerTiposDocumentoLogin();
    //         setLoading(false);

    //         if (response && response.success && response.datos!.length > 0) {
    //             const defaultDoc =
    //                 response.datos!.find((doc: TipoDocumento) => doc.selected !== "") ||
    //                 response.datos![0];
    //             setTiposDocumento(response.datos!);
    //             setSelectedTipoDoc(defaultDoc);
    //         }
    //     };
    //     fetchTiposDocumentos();
    // }, []);

    // Efecto: cuando hay usuario, obtener empresas
    useEffect(() => {
        if (loading) {
            setLoading(false)
        }
    }, []);

    useEffect(() => {
        if (usuario) {
            guardarSesion();
        }
        setLoading(false);
    }, [usuario]);

    return (
        <Box
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                textAlign: "center",
            }}
        >
            <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />

            <Box
                component="form"
                onSubmit={submitForm}
                style={{
                    maxWidth: 400,
                    width: "100%",
                    padding: 24,
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    backgroundColor: "white",
                }}
            >
                {/* LOGO */}
                <Box
                    style={{
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <img
                        src={
                            urlBase +
                            (colorScheme === "dark"
                                ? "/Logo_Tottus.png"
                                : "/Logo_Tottus.png")
                        }
                        alt="Logo Empresa"
                        style={{ width: 150 }}
                    />
                </Box>

                {/* TÍTULO */}
                <Title order={1} size={50} fw="bold" mb="md" c={color_Primario}>
                    {title}
                </Title>

                <Stack gap="md">
                    <Group grow align="flex-start">
                        {/* <Select
                            label="Tipo de Documento"
                            placeholder="Selecciona"
                            data={tiposDocumentoData}
                            value={selectedTipoDoc?.codigo || null}
                            onChange={(value) => {
                                const selected = tiposDocumento.find(
                                    (doc) => doc.codigo === value
                                );
                                setSelectedTipoDoc(selected || null);
                            }}
                            searchable
                            required
                        /> */}
                        <TextInput
                            label="Número de documento"
                            placeholder="Ingresa tu número de Dni"
                            name="nroDoc"
                            required
                            maxLength={20}
                        />
                    </Group>

                    <PasswordInput
                        label="Contraseña"
                        placeholder="Ingresa tu contraseña"
                        name="password"
                        required
                        maxLength={50}
                        visible={showPassword}
                        onVisibilityChange={setShowPassword}
                    />

                    {/* <Group gap="xs" align="center">
            <Turnstile
              sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
              onVerify={(token) => setCaptchaToken(token)}
              onLoad={(widgetId) => setTurnstileWidgetId(widgetId)}
            />
            <ActionIcon
              onClick={resetCaptcha}
              variant="subtle"
              title="Reiniciar CAPTCHA"
            >
              <IconRestore />
            </ActionIcon>
          </Group> */}

                    {error && (
                        <Text c="#67ab25" size="sm">
                            {error}
                        </Text>
                    )}

                    <Button type="submit" fullWidth>
                        Iniciar Sesión
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
}
