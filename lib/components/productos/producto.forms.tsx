import React, { useEffect, useState } from "react";
import {
    NumberInput,
    Stack,
    TextInput,
    Select,
    SimpleGrid,
    Divider,
    Switch,
} from "@mantine/core";
import ModalCustomComponent, { TitleHead } from "../common/modalCustom.component";
import { Producto } from "@/lib/interfaces/maestros/productos.interfaces";
import { mapToSelectOptions } from "@/lib/hooks/selectMapper";
import { getAllSubdptos } from "@/lib/actions/maestros/producto.action";
import { notifications } from "@mantine/notifications";
import { ums } from "@/lib/utils/constantes";

export interface ProductoFormProps {
    opened?: boolean;
    onClose?: () => void;
    onSave?: (data: Partial<Producto>) => Promise<void> | void;
    initialData?: Partial<Producto> | null;
}



const ProductoForm: React.FC<ProductoFormProps> = ({
    opened = true,
    onClose = () => { },
    onSave = () => { },
    initialData = {},
}) => {
    const getInitialValues = (): Partial<Producto> => ({
        _id: initialData?._id || null,
        sku: initialData?.sku || "",
        ean: initialData?.ean || "",
        descripcion: initialData?.descripcion || "",
        casePack: initialData?.casePack ?? 1,
        precioVigente: initialData?.precioVigente ?? 0,
        costoPromedio: initialData?.costoPromedio ?? 0,
        marca: initialData?.marca || "",
        proveedor: initialData?.proveedor || "",
        marcaSensible: initialData?.marcaSensible || false,
        uMedida: initialData?.uMedida || "UN",
        isContable: initialData?.isContable || false,
        subdpto: initialData?.subdpto || "",
        updatedAt: initialData?.updatedAt || null,
    });

    const [formData, setFormData] = useState<Partial<Producto>>(getInitialValues());
    const [subdptos, setSubdptos] = useState<string[] | []>([]);
    const fetchFiltros = async () => {
        const [subdos] = await Promise.all([
            getAllSubdptos()
        ]);
        if (!subdos.datos) {
            notifications.show({ title: "ERROR", message: "No se encontraron algunos datos iniciales" });
        }
        setSubdptos(subdos.datos || []);
    };
    useEffect(() => {
        fetchFiltros();
    }, []);
    useEffect(() => {
        console.log(initialData)
        setFormData(getInitialValues());
    }, [initialData]);

    const handleChange = (field: keyof Producto, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const subDptosSelect = mapToSelectOptions(
        subdptos,
        (v) => v,
        (v) => v || "No definido"
    );

    const umSelect = mapToSelectOptions(
        ums,
        (v) => v,
        (v) => v
    );

    const handleSubmit = async () => {
        console.log(formData)
        await onSave(formData);
    };

    const handleClear = () => {
        setFormData(getInitialValues());
    };

    const handleClose = () => {
        handleClear();
        onClose();
    };

    const titleHead: TitleHead = {
        title: initialData?._id ? "Actualizar Producto" : "Registrar Producto",
    };

    return (
        <ModalCustomComponent
            titleHead={titleHead}
            ConfirmText={initialData?._id ? "Guardar" : "Crear"}
            opened={opened}
            handlerClose={handleClose}
            handleConfirm={handleSubmit}
        >
            <Stack gap="sm">

                {/* Descripción */}
                <TextInput
                    label="Descripción"
                    required
                    withAsterisk
                    value={formData.descripcion ?? ""}
                    onChange={(e) => handleChange("descripcion", e.currentTarget.value)}
                />

                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xs">
                    {/* SKU */}
                    <TextInput
                        label="Sku"
                        required
                        withAsterisk
                        value={formData.sku ?? ""}
                        onChange={(e) => handleChange("sku", e.currentTarget.value)}
                    />


                    {/* EAN */}
                    <NumberInput
                        label="Ean"
                        hideControls
                        value={formData.ean ?? ""}
                        onChange={(v) => handleChange("ean", v === "" ? null : Number(v))}
                    />
                    <Select
                        label="Unidad de Medida"
                        placeholder="Seleccionar..."
                        value={formData.uMedida || null}
                        onChange={(value) => handleChange("uMedida", value || "")}
                        data={umSelect}
                    />
                </SimpleGrid>


                {/* Proveedor */}
                <TextInput
                    label="Proveedor"
                    required
                    withAsterisk
                    value={formData.proveedor ?? ""}
                    onChange={(e) => handleChange("proveedor", e.currentTarget.value)}
                />

                {/* Marca */}
                <TextInput
                    label="Marca"
                    required
                    withAsterisk
                    value={formData.marca ?? ""}
                    onChange={(e) => handleChange("marca", e.currentTarget.value)}
                />

                {/* Sub Departamento */}
                <Select
                    label="Sub Departamento"
                    placeholder="Seleccionar..."
                    value={formData.subdpto || null}
                    onChange={(value) => handleChange("subdpto", value || "")}
                    data={subDptosSelect}
                    searchable
                    clearable
                />


                {/* Numeros */}
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xs">
                    {/* Precio Vigente */}
                    <NumberInput
                        label="Precio Vigente"
                        hideControls
                        value={formData.precioVigente ?? ""}
                        onChange={(v) => handleChange("precioVigente", v === "" ? null : Number(v))}
                    />

                    {/* Costo Promedio */}
                    <NumberInput
                        label="Costo Promedio"
                        hideControls
                        value={formData.costoPromedio ?? ""}
                        onChange={(v) => handleChange("costoPromedio", v === "" ? null : Number(v))}
                    />

                    {/* Case Pack */}
                    <NumberInput
                        label="Case Pack"
                        hideControls
                        value={formData.casePack ?? ""}
                        onChange={(v) => handleChange("casePack", v === "" ? null : Number(v))}
                    />
                </SimpleGrid>
                <Divider></Divider>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xs">
                    <Switch
                        label="Marca Sensible"
                        checked={formData.marcaSensible ?? false}
                        onChange={(e) => {
                            handleChange("marcaSensible", e.currentTarget.checked)
                            if (e.currentTarget.checked) {
                                handleChange("isContable", true)
                            }
                        }}
                    />
                    <Switch
                        label="Mercadería Contable"
                        checked={formData.isContable ?? false}
                        onChange={(e) => {
                            handleChange("isContable", e.currentTarget.checked)
                            if (!e.currentTarget.checked) {
                                handleChange("marcaSensible", false)
                            }
                        }}
                    /></SimpleGrid>
            </Stack>
        </ModalCustomComponent>
    );
};

export default ProductoForm;
