"use client";

import {
  Accordion,
  Checkbox,
  Group,
  Text,
  Stack,
  Button,
  Divider,
  Badge,
  Loader,
  Center,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useMemo, useState } from "react";
import { CATEGORIAS_MACRO, SUBDEPARTAMENTOS } from "@/lib/utils/constantes";
import { getFlagsSubdptoAction, updateFlagsSubdptoAction } from "@/lib/actions/maestros/producto.action";
import { useLoadingStore } from "@/lib/store/useLoadingStore";

/* =========================
   TIPOS
========================= */

interface SubdptoItem {
  subdpto: string;
  marcaSensible: boolean;
  isContable: boolean;
}

interface SubdptoUpdate {
  subdpto: string;
  marcaSensible?: boolean;
  isContable?: boolean;
}

/* =========================
   HELPERS
========================= */

const getEstadoCampo = (
  items: SubdptoItem[],
  changes: Record<string, SubdptoUpdate>,
  campo: "marcaSensible" | "isContable"
) => {
  const valores = items.map((item) => {
    const local = changes[item.subdpto];
    return local?.[campo] ?? item[campo];
  });

  const total = valores.length;
  const activos = valores.filter(Boolean).length;

  return {
    checked: activos === total && total > 0,
    indeterminate: activos > 0 && activos < total,
  };
};

export default function SubdptoTreeAccordion() {
  const [data, setData] = useState<SubdptoItem[]>([]);
  const {show, hide}= useLoadingStore();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changes, setChanges] = useState<Record<string, SubdptoUpdate>>({});

  /* =========================
     MAPA DE DESCRIPCIONES
     codigo -> descripcion
  ========================= */

  const subdptoDescMap = useMemo(() => {
    const m = new Map<string, string>();
    SUBDEPARTAMENTOS.forEach((x) => m.set(x.codigo, x.descripcion));
    return m;
  }, []);

  const getDescripcion = (codigo: string) =>
    subdptoDescMap.get(codigo) ?? "SIN DESCRIPCIÓN";

  /* =========================
     CARGA INICIAL
  ========================= */

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getFlagsSubdptoAction();
        if (!res.success) {
          notifications.show({
            color: "red",
            title: "Error",
            message: res.mensaje,
          });
          return;
        }
        setData(res.datos);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* =========================
     ARMAR ÁRBOL REAL
     J01 → J0101 → J010101
  ========================= */

  const tree = useMemo(() => {
    const macros: Record<string, Record<string, SubdptoItem[]>> = {};

    data.forEach((item) => {
      const macro = item.subdpto.substring(0, 3); // J01
      const nivel2 = item.subdpto.substring(0, 5); // J0101

      if (!macros[macro]) macros[macro] = {};
      if (!macros[macro][nivel2]) macros[macro][nivel2] = [];

      macros[macro][nivel2].push(item);
    });

    return CATEGORIAS_MACRO.map((cat) => ({
      ...cat,
      grupos: Object.entries(macros[cat.prefix] ?? {}).map(([key, items]) => ({
        key,
        items,
      })),
    }));
  }, [data]);

  /* =========================
     MARCADO MASIVO POR PREFIJO
  ========================= */

  const marcarPorPrefijo = (
    prefijo: string,
    campo: "marcaSensible" | "isContable",
    valor: boolean
  ) => {
    setChanges((prev) => {
      const nuevo = { ...prev };

      data.forEach((item) => {
        if (item.subdpto.startsWith(prefijo)) {
          nuevo[item.subdpto] = {
            subdpto: item.subdpto,
            ...(campo === "marcaSensible"
              ? {
                  // sensible => contable
                  marcaSensible: valor,
                  isContable: valor ? true : prev[item.subdpto]?.isContable,
                }
              : {
                  // contable false => sensible false
                  isContable: valor,
                  marcaSensible: valor ? prev[item.subdpto]?.marcaSensible : false,
                }),
          };
        }
      });

      return nuevo;
    });
  };

  /* =========================
     MARCADO INDIVIDUAL
  ========================= */

  const setMarcaSensible = (item: SubdptoItem, value: boolean) => {
    setChanges((prev) => ({
      ...prev,
      [item.subdpto]: {
        subdpto: item.subdpto,
        marcaSensible: value,
        isContable: value ? true : prev[item.subdpto]?.isContable,
      },
    }));
  };

  const setIsContable = (item: SubdptoItem, value: boolean) => {
    setChanges((prev) => ({
      ...prev,
      [item.subdpto]: {
        subdpto: item.subdpto,
        isContable: value,
        marcaSensible: value ? prev[item.subdpto]?.marcaSensible : false,
      },
    }));
  };

  /* =========================
     GUARDAR
  ========================= */

  const handleSave = async () => {
    const payload = Object.values(changes);
    if (payload.length === 0) return;
    
    try {
      show();
      setSaving(true);
      console.log(payload)
      const res = await updateFlagsSubdptoAction(payload);

      if (!res.success) {
        notifications.show({
          color: "red",
          title: "Error",
          message: res.mensaje,
        });
        return;
      }

      notifications.show({
        color: "green",
        title: "Correcto",
        message: "Cambios guardados correctamente",
      });

      setChanges({});
      const refreshed = await getFlagsSubdptoAction();
      if (refreshed.success) setData(refreshed.datos);
    } finally {
      setSaving(false);
      hide();
    }
  };

  /* =========================
     RENDER
  ========================= */

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  return (
    <>
      <Accordion multiple>
        {tree.map((macro) => {
          const macroItems = macro.grupos.flatMap((g) => g.items);

          const estadoMacroS = getEstadoCampo(macroItems, changes, "marcaSensible");
          const estadoMacroC = getEstadoCampo(macroItems, changes, "isContable");

          return (
            <Accordion.Item key={macro.prefix} value={macro.prefix}>
              <Accordion.Control>
                <Group justify="space-between">
                  <Text fw={700}>
                    {macro.label} ({macro.prefix})
                  </Text>

                  <Group>
                    <Checkbox
                      label="Central"
                      checked={estadoMacroS.checked}
                      indeterminate={estadoMacroS.indeterminate}
                      onChange={(e) =>
                        marcarPorPrefijo(
                          macro.prefix,
                          "marcaSensible",
                          e.currentTarget.checked
                        )
                      }
                    />
                    <Checkbox
                      label="Tienda"
                      checked={estadoMacroC.checked}
                      indeterminate={estadoMacroC.indeterminate}
                      onChange={(e) =>
                        marcarPorPrefijo(
                          macro.prefix,
                          "isContable",
                          e.currentTarget.checked
                        )
                      }
                    />
                  </Group>
                </Group>
              </Accordion.Control>

              <Accordion.Panel>
                <Accordion multiple>
                  {macro.grupos.map((grupo) => {
                    const estadoGrupoS = getEstadoCampo(grupo.items, changes, "marcaSensible");
                    const estadoGrupoC = getEstadoCampo(grupo.items, changes, "isContable");

                    return (
                      <Accordion.Item key={grupo.key} value={grupo.key}>
                        <Accordion.Control>
                          <Group justify="space-between">
                            <Text fw={600}>{grupo.key}</Text>

                            <Group>
                              <Checkbox
                                label="Central"
                                checked={estadoGrupoS.checked}
                                indeterminate={estadoGrupoS.indeterminate}
                                onChange={(e) =>
                                  marcarPorPrefijo(
                                    grupo.key,
                                    "marcaSensible",
                                    e.currentTarget.checked
                                  )
                                }
                              />
                              <Checkbox
                                label="Tienda"
                                checked={estadoGrupoC.checked}
                                indeterminate={estadoGrupoC.indeterminate}
                                onChange={(e) =>
                                  marcarPorPrefijo(
                                    grupo.key,
                                    "isContable",
                                    e.currentTarget.checked
                                  )
                                }
                              />
                            </Group>
                          </Group>
                        </Accordion.Control>

                        <Accordion.Panel>
                          <Stack gap="sm">
                            {grupo.items.map((item) => {
                              const local = changes[item.subdpto];
                              const marcaSensible = local?.marcaSensible ?? item.marcaSensible;
                              const isContable = local?.isContable ?? item.isContable;

                              return (
                                <Group key={item.subdpto} justify="space-between">
                                  <Group gap="xs">
                                    <Text fw={600}>{item.subdpto}</Text>
                                    <Text c="dimmed" size="sm">
                                      {getDescripcion(item.subdpto)}
                                    </Text>

                                    {marcaSensible && (
                                      <Badge color="red" size="xs">
                                        Central
                                      </Badge>
                                    )}
                                    {isContable && (
                                      <Badge color="blue" size="xs">
                                        Tienda
                                      </Badge>
                                    )}
                                  </Group>

                                  <Group>
                                    <Checkbox
                                      label="Central"
                                      checked={marcaSensible}
                                      onChange={(e) =>
                                        setMarcaSensible(item, e.currentTarget.checked)
                                      }
                                    />
                                    <Checkbox
                                      label="Tienda"
                                      checked={isContable}
                                      onChange={(e) =>
                                        setIsContable(item, e.currentTarget.checked)
                                      }
                                    />
                                  </Group>
                                </Group>
                              );
                            })}
                          </Stack>
                        </Accordion.Panel>
                      </Accordion.Item>
                    );
                  })}
                </Accordion>
              </Accordion.Panel>
            </Accordion.Item>
          );
        })}
      </Accordion>

      <Divider my="md" />

      <Group justify="flex-end">
        <Button
          onClick={handleSave}
          loading={saving}
          disabled={Object.keys(changes).length === 0}
        >
          Guardar cambios
        </Button>
      </Group>
    </>
  );
}
