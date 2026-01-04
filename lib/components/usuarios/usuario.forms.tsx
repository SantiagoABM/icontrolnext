import React, { useEffect, useState } from "react";
import {
    Checkbox,
    TextInput,
    Select,
    SimpleGrid,
    Stack,
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
        nombre: initialData?.nombre || "",
        apellido: initialData?.apellido || "",
        correo: initialData?.correo || "",
        rol: initialData?.rol || "",
        activo: initialData?.activo ?? true,
    });

    const [formData, setFormData] = useState<Partial<Usuario>>(getInitialValues());
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        setFormData(getInitialValues());
        setErrors({});
    }, [initialData]);

    const handleChange = (field: keyof Usuario, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: "" })); // limpia error
    };

    const rolSelect = mapToSelectOptions(
        roles,
        (r) => r,
        (r) => r.toUpperCase()
    );

    /* ======================================================
       VALIDACIÓN DEL FORMULARIO
    ====================================================== */
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.dni || formData.dni.length !== 8) {
            newErrors["dni"] = "Ingrese un DNI válido de 8 dígitos";
        }

        if (!formData.nombre || formData.nombre.trim() === "") {
            newErrors["nombre"] = "El nombre es obligatorio";
        }

        if (!formData.apellido || formData.apellido.trim() === "") {
            newErrors["apellido"] = "El apellido es obligatorio";
        }

        if (!formData.correo || !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.correo)) {
            newErrors["correo"] = "Correo inválido";
        }

        if (!formData.rol || formData.rol === "") {
            newErrors["rol"] = "Seleccione un rol";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };
    const generarCorreo = (nombre?: string, apellido?: string) => {
        if (!nombre) return "";

        const n = nombre.trim().toLowerCase();
        const a = apellido?.trim().toLowerCase() ?? "";

        if (n.length === 0) return "";

        if (a.length > 0) {
            return `${n[0]}${a}@control.tottus.pe`;
        }

        // Si no hay apellido → usar todo el nombre
        return `${n}@control.tottus.pe`;
    };

    /* ======================================================
       SUBMIT
    ====================================================== */
    const handleSubmit = async () => {
        if (!validateForm()) return;
        await onSave(formData);
    };

    const handleClear = () => {
        setFormData(getInitialValues());
        setErrors({});
    };

    const titleHead: TitleHead = {
        title: formData._id ? "Actualizar Usuario" : "Registrar Usuario",
    };

    return (
        <ModalCustomComponent
            titleHead={titleHead}
            ConfirmText={formData._id ? "Guardar" : "Crear"}
            opened={opened}
            handlerClose={() => {
                handleClear();
                onClose();
            }}
            handleConfirm={handleSubmit}
        >
            <Stack gap="sm">
                {initialData && (
                    <Checkbox
                        label="Estado"
                        checked={formData.activo ?? true}
                        onChange={(e) => handleChange("activo", e.currentTarget.checked)}
                    />
                )}

                {/* DNI */}
                <TextInput
                    label="DNI"
                    withAsterisk
                    value={formData.dni ?? ""}
                    error={errors.dni}
                    onChange={(e) => {
                        const value = e.currentTarget.value;
                        const soloNumeros = value.replace(/\D/g, "");
                        if (soloNumeros.length > 8) return;
                        handleChange("dni", soloNumeros);
                    }}
                />

                {/* Nombre - Apellido */}
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xs">
                    <TextInput
                        label="Nombre"
                        withAsterisk
                        value={formData.nombre ?? ""}
                        error={errors.nombre}
                        onChange={(e) => {
                            const nombre = e.currentTarget.value;
                            const nuevoCorreo = generarCorreo(nombre, formData.apellido ?? "");

                            handleChange("nombre", nombre);
                            handleChange("correo", nuevoCorreo);
                        }}
                    />

                    <TextInput
                        label="Apellido"
                        withAsterisk
                        value={formData.apellido ?? ""}
                        error={errors.apellido}
                        onChange={(e) => {
                            const apellido = e.currentTarget.value;
                            const nuevoCorreo = generarCorreo(formData.nombre ?? "", apellido);
                            handleChange("apellido", apellido);
                            handleChange("correo", nuevoCorreo);
                        }}
                    />

                </SimpleGrid>

                {/* Correo */}
                <TextInput
                    label="Correo"
                    withAsterisk
                    value={formData.correo ?? ""}
                    error={errors.correo}
                    disabled
                />

                {/* Rol */}
                <Select
                    label="Rol"
                    withAsterisk
                    placeholder="Seleccionar..."
                    value={formData.rol || null}
                    error={errors.rol}
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
