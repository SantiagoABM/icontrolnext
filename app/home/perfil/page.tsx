"use client";

import { Box, Button, Card, Flex, PasswordInput, Stack, Text, Title, TextInput } from "@mantine/core";
import { useState, useEffect } from "react";
import { useUserDataStore } from "@/lib/store/useUserDataStore";
import { useLoadingStore } from "@/lib/store/useLoadingStore";
import { useTitlePageStore } from "@/lib/store/useTitlePageStore";
import { ActualizarPasswordAction } from "@/lib/actions/auth/auth.action";
import { updateUsuario } from "@/lib/actions/maestros/usuario.actions";
import { notifications } from "@mantine/notifications";
import { color_Primario } from "@/lib/utils/constantes";

export default function PerfilPage() {
    const { userData, setUserData } = useUserDataStore();
    const { show, hide } = useLoadingStore();
    const { setData } = useTitlePageStore();

    const [passwordActual, setPasswordActual] = useState("");
    const [nuevaPassword, setNuevaPassword] = useState("");
    const [confirmarPassword, setConfirmarPassword] = useState("");

    const [correo, setCorreo] = useState("");

    useEffect(() => {
        if (userData?.correo) {
            setCorreo(userData.correo);
        }
    }, [userData]);

    useEffect(() => {
        setData({
            titulo: "Mi Perfil",
            buttons: [],
        });
    }, [setData]);

    const handleUpdateDatos = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userData?.id) {
            notifications.show({ title: "Error", message: "No se puede identificar el usuario", color: "red" });
            return;
        }
        
        show();
        const res = await updateUsuario({ _id: userData.id, correo });
        hide();

        if (res.success) {
            notifications.show({ title: "Éxito", message: "Correo actualizado correctamente", color: "green" });
            setUserData({ userData: { ...userData, correo } });
        } else {
            notifications.show({ title: "Error", message: res.mensaje || "Error al actualizar", color: "red" });
        }
    }

    const handleSubmitPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (nuevaPassword !== confirmarPassword) {
            notifications.show({
                title: "Error",
                message: "Las contraseñas nuevas no coinciden",
                color: "red"
            });
            return;
        }

        if (nuevaPassword.length < 6) {
            notifications.show({
                title: "Error",
                message: "La nueva contraseña debe tener al menos 6 caracteres",
                color: "red"
            });
            return;
        }

        show();
        const res = await ActualizarPasswordAction({
            passwordActual,
            nuevaPassword
        });
        hide();

        if (res.success) {
            notifications.show({
                title: "Éxito",
                message: "Contraseña actualizada correctamente",
                color: "green"
            });
            setPasswordActual("");
            setNuevaPassword("");
            setConfirmarPassword("");
        } else {
            notifications.show({
                title: "Error",
                message: res.mensaje || "Error al actualizar la contraseña",
                color: "red"
            });
        }
    };

    return (
        <Box p="md">
            <Flex gap="md" direction={{ base: "column", md: "row" }}>
                <Card shadow="sm" padding="lg" radius="md" withBorder style={{ flex: 1, height: "fit-content" }}>
                    <Title order={4} mb="md">Mis Datos</Title>
                    <Stack>
                        <Box>
                            <Text fw={500} size="sm">Nombre:</Text>
                            <Text c="dimmed">{userData?.nombre || "No disponible"}</Text>
                        </Box>
                        
                        <Box>
                            <Text fw={500} size="sm">Rol de Usuario:</Text>
                            <Text c="dimmed" style={{ textTransform: "capitalize" }}>{userData?.rol || "No disponible"}</Text>
                        </Box>

                        <form onSubmit={handleUpdateDatos}>
                            <Stack mt="md">
                                <TextInput 
                                    label="Correo Electrónico"
                                    placeholder="correo@ejemplo.com"
                                    value={correo}
                                    onChange={(e) => setCorreo(e.currentTarget.value)}
                                    required
                                />
                                <Button type="submit" mt="xs" variant="outline">Actualizar Correo</Button>
                            </Stack>
                        </form>
                    </Stack>
                </Card>

                <Card shadow="sm" padding="lg" radius="md" withBorder style={{ flex: 2 }}>
                    <Title order={4} mb="md">Actualizar Contraseña</Title>
                    <form onSubmit={handleSubmitPassword}>
                        <Stack>
                            <PasswordInput
                                label="Contraseña Actual"
                                placeholder="Ingresa tu contraseña actual"
                                value={passwordActual}
                                onChange={(e) => setPasswordActual(e.currentTarget.value)}
                                required
                            />

                            <PasswordInput
                                label="Nueva Contraseña"
                                placeholder="Ingresa tu nueva contraseña"
                                value={nuevaPassword}
                                onChange={(e) => setNuevaPassword(e.currentTarget.value)}
                                required
                            />

                            <PasswordInput
                                label="Confirmar Nueva Contraseña"
                                placeholder="Repite tu nueva contraseña"
                                value={confirmarPassword}
                                onChange={(e) => setConfirmarPassword(e.currentTarget.value)}
                                required
                            />

                            <Button type="submit" color="green" mt="md">
                                Actualizar Contraseña
                            </Button>
                        </Stack>
                    </form>
                </Card>
            </Flex>
        </Box>
    );
}
