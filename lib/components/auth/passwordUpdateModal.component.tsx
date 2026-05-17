import { useState } from "react";
import { Modal, Button, PasswordInput, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { ActualizarPasswordAction } from "../../actions/auth/auth.action";
import { useUserDataStore } from "../../store/useUserDataStore";
import { useLoadingStore } from "../../store/useLoadingStore";

interface PasswordUpdateModalProps {
    opened: boolean;
    onClose: () => void;
}

export function PasswordUpdateModal({ opened, onClose }: PasswordUpdateModalProps) {
    const { userData, setUserData } = useUserDataStore();
    const { show, hide } = useLoadingStore();

    const [passwordActual, setPasswordActual] = useState("");
    const [nuevaPassword, setNuevaPassword] = useState("");
    const [confirmarPassword, setConfirmarPassword] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
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
            if (userData) {
                setUserData({
                    userData: {
                        ...userData,
                        updatePass: true
                    }
                });
            }
            onClose();
        } else {
            notifications.show({
                title: "Error",
                message: res.mensaje || "Error al actualizar la contraseña",
                color: "red"
            });
        }
    };

    return (
        <Modal
            opened={opened}
            onClose={() => {
                // Prevenir cierre si el updatePass es obligatorio y sigue en false
                if (userData?.updatePass === false) {
                    notifications.show({
                        title: "Aviso",
                        message: "Debes actualizar tu contraseña por seguridad.",
                        color: "yellow"
                    });
                    return;
                }
                onClose();
            }}
            title="Actualización de Contraseña Requerida"
            closeOnClickOutside={userData?.updatePass !== false}
            closeOnEscape={userData?.updatePass !== false}
            withCloseButton={userData?.updatePass !== false}
            centered
        >
            <form onSubmit={handleSubmit}>
                <Stack>
                    <Text size="sm" c="dimmed">
                        Por motivos de seguridad, debes actualizar tu contraseña antes de continuar.
                    </Text>

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

                    <Button type="submit" fullWidth mt="md" color="green">
                        Actualizar Contraseña
                    </Button>
                </Stack>
            </form>
        </Modal>
    );
}
