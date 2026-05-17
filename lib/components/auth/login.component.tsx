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
import { useUserDataStore } from "@/lib/store/useUserDataStore";
import { Usuario } from './../../interfaces/maestros/usuarios.interface';

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
    const { userData, setUserData } = useUserDataStore();
    //   const [empresa, setEmpresa] = useState<EmpresaSesion | null>(null);
    // const [captchaToken, setCaptchaToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [usuario  , setUsuario ] = useState<UsuarioSesion | null>(null);
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
        const dni = formData.get("nroDoc") || "";
        const password = formData.get("password") || "";
        
        console.log("FORM SUBMITTED - DNI:", dni, "PASSWORD:", password ? "***" : "EMPTY");

        const result = await LoginAction({
            dni,
            password,
        });
        if (!result.success) {
            const errorMsg = result.mensaje === "Error" || !result.mensaje 
                ? "No se pudo conectar con el servidor. Verifica que el backend esté encendido." 
                : result.mensaje;
            console.log("Error en login:", errorMsg);
            setError(errorMsg);
            notifications.show({
                title: "Error de autenticación",
                message: errorMsg,
            });
            setLoading(false);
            return;
        }
        console.log("Usuario en login:", result.datos);
        setUsuario(result.datos);
        setUserData({ userData: result.datos });
        
        if (result.datos) {
            await guardarSesion(result.datos);
        }
    };

    const guardarSesion = async (usuarioData: UsuarioSesion) => {
        if (!usuarioData) {
            setLoading(false);
            return;
        }

        const datosSesion: DatosSesion = {
            id: usuarioData.id,
            nombre: usuarioData.nombre,
            correo: usuarioData.correo,
            rol: usuarioData.rol,
            token: usuarioData.token,
            updatePass: usuarioData.updatePass
        };
        const res = await GuardarSesion({ datosSesion });
        if (!res.success) {
            notifications.show({ title: "ERROR", message: "No se pudo guardar la sesión" });
            setLoading(false);
            return;
        }

        router.push("/home");
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
            hide()
        }
    }, []);



    return (
        <Box
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "100vh",
                width: "100%",
                background: colorScheme === 'dark' 
                    ? "radial-gradient(circle at top left, #1a1b1e 0%, #0d0d0d 100%)" 
                    : "radial-gradient(circle at top left, #ffffff 0%, #f1f3f5 100%)",
                position: "relative",
                overflow: "hidden",
                padding: "20px",
            }}
        >
            {/* Elementos decorativos de fondo para darle un look "striking" */}
            <Box
                style={{
                    position: "absolute",
                    top: "-10%",
                    left: "-10%",
                    width: "40vw",
                    height: "40vw",
                    borderRadius: "50%",
                    background: colorScheme === 'dark' 
                        ? "radial-gradient(circle, rgba(103, 171, 37, 0.15) 0%, rgba(0,0,0,0) 70%)"
                        : "radial-gradient(circle, rgba(103, 171, 37, 0.1) 0%, rgba(255,255,255,0) 70%)",
                    filter: "blur(60px)",
                    zIndex: 0,
                }}
            />
            <Box
                style={{
                    position: "absolute",
                    bottom: "-10%",
                    right: "-5%",
                    width: "35vw",
                    height: "35vw",
                    borderRadius: "50%",
                    background: colorScheme === 'dark' 
                        ? "radial-gradient(circle, rgba(43, 138, 62, 0.1) 0%, rgba(0,0,0,0) 70%)"
                        : "radial-gradient(circle, rgba(43, 138, 62, 0.08) 0%, rgba(255,255,255,0) 70%)",
                    filter: "blur(60px)",
                    zIndex: 0,
                }}
            />

            <Box
                component="form"
                onSubmit={submitForm}
                style={{
                    maxWidth: 420,
                    width: "100%",
                    padding: "48px 40px",
                    borderRadius: 24,
                    boxShadow: colorScheme === 'dark' 
                        ? "0 30px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)"
                        : "0 20px 40px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.5)",
                    backgroundColor: colorScheme === 'dark' ? "rgba(26, 27, 30, 0.7)" : "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(20px)",
                    border: colorScheme === 'dark' ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(255,255,255,0.5)",
                    zIndex: 1,
                }}
            >
                <LoadingOverlay visible={loading} overlayProps={{ blur: 2, radius: "lg" }} />

                {/* LOGO */}
                <Box
                    style={{
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: "32px"
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
                        style={{ width: 160, filter: colorScheme === 'dark' ? 'drop-shadow(0px 4px 10px rgba(0,0,0,0.3))' : 'none' }}
                    />
                </Box>

                {/* TÍTULO */}
                <Box mb="xl" ta="center">
                    <Title order={2} size={26} fw={800} c={colorScheme === 'dark' ? "white" : "dark.8"} style={{ letterSpacing: "-0.5px" }}>
                        Bienvenido de vuelta
                    </Title>
                    <Text c="dimmed" size="sm" mt={4}>
                        Ingresa tus credenciales para continuar
                    </Text>
                </Box>

                <Stack gap="lg">
                    <TextInput
                        label="Número de Documento"
                        placeholder="Ingresa tu DNI"
                        name="nroDoc"
                        required
                        maxLength={20}
                        size="md"
                        radius="md"
                        styles={{
                            input: {
                                backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                                border: colorScheme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                                '&:focus': {
                                    borderColor: color_Primario,
                                }
                            }
                        }}
                    />

                    <PasswordInput
                        label="Contraseña"
                        placeholder="Ingresa tu contraseña"
                        name="password"
                        required
                        maxLength={50}
                        visible={showPassword}
                        onVisibilityChange={setShowPassword}
                        size="md"
                        radius="md"
                        styles={{
                            input: {
                                backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                                border: colorScheme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
                                '&:focus': {
                                    borderColor: color_Primario,
                                }
                            }
                        }}
                    />

                    {error && (
                        <Text c="red.5" size="sm" ta="center" fw={500}>
                            {error}
                        </Text>
                    )}

                    <Button 
                        type="submit" 
                        fullWidth 
                        size="md" 
                        radius="md" 
                        mt="xs"
                        color={color_Primario}
                        style={{
                            transition: "transform 0.2s ease, box-shadow 0.2s ease",
                            boxShadow: `0 4px 14px 0 rgba(103, 171, 37, 0.39)`,
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = `0 6px 20px 0 rgba(103, 171, 37, 0.39)`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'none';
                            e.currentTarget.style.boxShadow = `0 4px 14px 0 rgba(103, 171, 37, 0.39)`;
                        }}
                    >
                        Iniciar Sesión
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
}
