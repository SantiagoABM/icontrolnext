import React, { useEffect, useState } from "react";
import {
    Checkbox,
    Button,
    Stack,
    TextInput,
    Select,
    SimpleGrid,
} from "@mantine/core";
import ModalCustomComponent, { TitleHead } from "../common/modalCustom.component";
import { Usuario } from "@/lib/interfaces/maestros/usuarios.interface";
import { mapToSelectOptions } from "@/lib/hooks/selectMapper";
import { roles } from "@/lib/utils/constantes";

export interface UsuarioFormProps {
    opened?: boolean;
    onClose?: () => void;
    onSave?: (data: Partial<Usuario>) => Promise<void> | void;
    initialData?: Partial<Usuario> | null;
    roles?: string[]; // opcional si deseas cargar roles dinámicos
}

const UsuarioForm: React.FC<UsuarioFormProps> = ({
    opened = true,
    onClose = () => { },
    onSave = () => { },
    initialData = {},
}) => {
    const getInitialValues = (): Partial<Usuario> => ({
        _id: initialData?._id || null,
        dni: initialData?.dni || "",
        tienda: initialData?.tienda || null,
        nombre: initialData?.nombre || "",
        apellido: initialData?.apellido || "",
        correo: initialData?.correo || "",
        rol: initialData?.rol || "",
        activo: initialData?.activo ?? true,
    });

    // STATE PRINCIPAL DEL FORMULARIO
    const [formData, setFormData] = useState<Partial<Usuario>>(getInitialValues());

    // ACTUALIZA EL FORM AL CAMBIAR `initialData`
    useEffect(() => {
        setFormData(getInitialValues());
    }, [initialData]);

    // HANDLER GENERAL PARA CAMPOS
    const handleChange = (field: keyof Usuario, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // MAPEAMOS ROLES A SELECT
    const rolSelect = mapToSelectOptions(
        roles,
        (r) => r,
        (r) => r.toUpperCase()
    );

    // SUBMIT
    const handleSubmit = async () => {
        await onSave(formData);
    };

    // LIMPIAR FORMULARIO
    const handleClear = () => setFormData(getInitialValues());

    const titleHead: TitleHead = {
        title: initialData?._id ? "Actualizar Usuario" : "Registrar Usuario",
    };

    return (
        <ModalCustomComponent
            titleHead={titleHead}
            ConfirmText={initialData?._id ? "Guardar" : "Crear"}
            opened={opened}
            handlerClose={() => {
                handleClear();
                onClose();
            }}
            handleConfirm={handleSubmit}
        >
            <Stack gap="sm">

                {/* SOLO SE MUESTRA EN EDICIÓN */}
                {initialData && (
                    <Checkbox
                        label="Estado"
                        variant="outline"
                        radius="md"
                        checked={formData.activo ?? true}
                        onChange={(e) => handleChange("activo", e.currentTarget.checked)}
                    />
                )}

                {/* DNI */}
                <TextInput
                    label="DNI"
                    withAsterisk
                    value={formData.dni ?? ""}
                    onChange={(e) => handleChange("dni", e.currentTarget.value)}
                />

                {/* Nombre - Apellido */}
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                    <TextInput
                        label="Nombre"
                        withAsterisk
                        value={formData.nombre ?? ""}
                        onChange={(e) => handleChange("nombre", e.currentTarget.value)}
                    />
                    <TextInput
                        label="Apellido"
                        withAsterisk
                        value={formData.apellido ?? ""}
                        onChange={(e) => handleChange("apellido", e.currentTarget.value)}
                    />
                </SimpleGrid>

                {/* Correo */}
                <TextInput
                    label="Correo"
                    withAsterisk
                    value={formData.correo ?? ""}
                    onChange={(e) => handleChange("correo", e.currentTarget.value)}
                />

                {/* Rol */}
                <Select
                    label="Rol"
                    placeholder="Seleccionar..."
                    value={formData.rol || null}
                    onChange={(val) => handleChange("rol", val)}
                    data={rolSelect}
                    searchable
                    clearable
                />
            </Stack>
        </ModalCustomComponent>
    );
};

export default UsuarioForm;
