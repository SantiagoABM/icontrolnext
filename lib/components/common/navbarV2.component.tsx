"use client";

import {
    Box,
    Group,
    Image,
    useMantineColorScheme,
    ScrollArea,
    Drawer,
    ActionIcon,
    Paper,
    Text,
    Divider,
    Stack,
    Flex,
} from "@mantine/core";
import {
    IconMenu2,
} from "@tabler/icons-react";

import { randomId, useDisclosure, useMediaQuery } from "@mantine/hooks";
import { useEffect, useMemo, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import TitlePageComponent from "@/lib/components/common/TitlePage.component";
import { menuItemsMock, urlBase } from "@/lib/utils/constantes";
import {
    MenuItem,
    MenuItemNormalized,
} from "@/lib/interfaces/global.interfaces";
import { useLoadingStore } from "@/lib/store/useLoadingStore";
import { useTitlePageStore } from "@/lib/store/useTitlePageStore";
import { useUserDataStore } from "@/lib/store/useUserDataStore";
// import { LinksGroup } from "./linkGroup.component";
import { UserButton } from "./userButton.component";
import { Global } from "@mantine/styles";
import { useStyles } from "@/lib/hooks/useStyles";
import * as TablerIcons from "@tabler/icons-react";


// Interfaces
interface NavbarProps {
    children: React.ReactNode;
}

const LAYOUT_CONFIG = {
    sidebar: {
        collapsed: 48,
        expanded: 320,
    },
    topbar: {
        height: 62,
    },
    mobile: {
        breakpoint: "(max-width: 768px)",
    },
} as const;
const IconMap: Record<string, any> = TablerIcons;

export function normalizeSidebar(apiSidebar: any[]): MenuItemNormalized[] {
    return apiSidebar.map((item) => {
        const IconComponent = IconMap[item.icono] ?? TablerIcons.IconCircle;

        return {
            id: item.idOpcion,
            label: item.nombre,
            icon: <IconComponent size={20} />,
            url: item.url
        };
    });
}


// Main Component
export default function NavbarComponent({ children }: NavbarProps) {

    // Hooks
    const { show, hide, isLoading } = useLoadingStore();
    const { titulo, subtitle, buttons } = useTitlePageStore();
    const { colorScheme } = useMantineColorScheme();
    const [opened, { toggle, close }] = useDisclosure();
    const isMobile = useMediaQuery(LAYOUT_CONFIG.mobile.breakpoint);
    const router = useRouter();
    const pathname = usePathname();
    const { classes } = useStyles();

    // State
    const [menus, setMenuItems] = useState<MenuItem[] | null>(null);
    const [collapsed, setCollapsed] = useState(true);
    // const [userData, setUserData] = useState<UserData | null>(null);
    const { setUserData, userData } = useUserDataStore();


    // Event handlers
    const handleNavigation = useCallback(
        (item: MenuItemNormalized) => {
            let url = item.url?.replaceAll("/Index", "").toLowerCase();
            if (url !== "home") url = `home/${url}`;
            router.push(`/${url}`);
        },
        [router]
    );

    const handleMenuToggle = useCallback(() => {
        if (isMobile) {
            toggle();
        } else {
            setCollapsed((prev) => !prev);
        }
    }, [isMobile, toggle]);

    // Effects
    useEffect(() => {
        const loadUserData = async () => {
            show();
            try {
                // const result = await ObtenerOpcionesMenu();
                // const data = await ObtenerSesion();
                // if (!result.success) {
                //     notifications.show({
                //         title: "Error",
                //         message: result.mensaje,
                //     });
                //     return;
                // }

                // if (result.datos === null) {
                //     notifications.show({
                //         title: "Error",
                //         message: "data de opciones de menú nula",
                //     });

                //     return;
                // }
                setMenuItems(menuItemsMock);
                // setUserData({
                //     userData: {
                //         nombre: data!.nombre,
                //         rol: data!.rol
                //     },
                // });
            } catch (error) {
                console.error(error)
            } finally {
                hide();
            }
        };

        loadUserData();
    }, [hide, show]);

    // const menuItems = useMemo(() => normalizeSidebar(menus ?? []), [menus]);

    const menuItemsByRole = useMemo(() => {
        if (!menus || !userData?.rol) return [];

        return menus
            .filter((item) =>
                item.rolesPermitidos.includes(userData.rol)
            )
            .sort((a, b) => Number(a.orden) - Number(b.orden));
    }, [menus, userData?.rol]);
    const menuItems = useMemo(
        () => normalizeSidebar(menuItemsByRole),
        [menuItemsByRole]
    );

    // Theme styles
    const getThemeStyles = useCallback(
        () => ({
            backdrop: colorScheme === "dark" ? "#1b1c1db6" : "#fcf7f7d8",
            sidebar: colorScheme === "dark" ? "#1A1B1E" : "#dfe055",
            border: colorScheme === "dark" ? "#2C2E33" : "#dee2e6",
            iconColor: colorScheme === "dark" ? "#fff" : "#000",
            iconColor2: colorScheme === "dark" ? "#dfe055" : "#000",
            logoSrc: `${urlBase}/${colorScheme === "dark" ? "Logo_Tottus.png" : "Logo_Tottus.png"
                }`,
            cardBg: colorScheme === "dark" ? "#25262B" : "#ffffff",
            cardBorder: colorScheme === "dark" ? "#2C2E33" : "#e9ecef",
        }),
        [colorScheme]
    );

    const themeStyles = getThemeStyles();

    // Layout calculations
    const sidebarWidth =
        collapsed && !isMobile
            ? LAYOUT_CONFIG.sidebar.collapsed
            : isMobile
                ? 0
                : LAYOUT_CONFIG.sidebar.expanded;

    const contentMargin = {
        left: isMobile ? 0 : collapsed ? 50 : LAYOUT_CONFIG.sidebar.expanded,
        top: LAYOUT_CONFIG.topbar.height,
        paddingTop: titulo.trim() !== "" ? "65px" : "1px",
        paddingLeft: isMobile ? 10 : collapsed ? 0 : 10,
    };
    // const renderRegularModule = (items: MenuItemNormalized[]) =>
    //     items.flatMap(
    //         (item) =>
    //             item.children?.map((child) => (
    //                 <LinksGroup
    //                     key={child.id}
    //                     item={child}
    //                     collapsed={collapsed && !isMobile}
    //                     onItemClick={handleNavigation}
    //                 />
    //             )) ?? []
    //     );

    const NavigationContent = (
        <ScrollArea style={{ flex: 1 }} scrollbarSize={7}>
            <Stack pt={isMobile ? 20 : 70} pb={20} px={isMobile ? 20 : 8} gap={4}>
                {menuItems.map((item) => {
                    const isActive = item.url === "/home" 
                        ? pathname === "/home" 
                        : pathname?.startsWith(item.url) || false;
                    
                    return (
                        <Flex
                            key={item.id}
                            align="center"
                            justify={collapsed && !isMobile ? "center" : "flex-start"}
                            gap={collapsed && !isMobile ? 0 : 12}
                            px={collapsed && !isMobile ? 0 : 12}
                            py={10}
                            onClick={() => {
                                router.push(item.url);
                                if (isMobile) close();
                            }}
                            style={{
                                cursor: "pointer",
                                borderRadius: 12,
                                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                backgroundColor: isActive 
                                    ? (colorScheme === "dark" ? "rgba(107, 207, 68, 0.15)" : "rgba(12, 194, 12, 0.1)")
                                    : "transparent",
                                color: isActive
                                    ? (colorScheme === "dark" ? "#6BCF44" : "#0CC20C")
                                    : "inherit",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = "scale(1.02)";
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = colorScheme === "dark"
                                        ? "rgba(255,255,255,0.06)"
                                        : "rgba(0,0,0,0.04)";
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                if (!isActive) {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                }
                            }}
                        >

                            {/* Ícono */}
                            <Box
                                style={{
                                    minWidth: collapsed && !isMobile ? "auto" : 24,
                                    display: "flex",
                                    justifyContent: "center",
                                    opacity: isActive ? 1 : 0.75,
                                    transition: "opacity 0.2s ease",
                                }}
                            >
                                {item.icon}
                            </Box>

                            {/* Texto — SOLO si no está colapsado y NO es mobile */}
                            {(!collapsed || isMobile) && (
                                <Text size={isMobile ? "md" : "sm"} fw={isActive ? 600 : 500} style={{ whiteSpace: "nowrap" }}>
                                    {item.label}
                                </Text>
                            )}
                        </Flex>
                    );
                })}
            </Stack>
        </ScrollArea>
    );



    const TopNavbar = (
        <Box
            style={{
                position: "fixed",
                top: 0,
                left: sidebarWidth,
                right: 0,
                transition: "left 0.3s ease",
                backdropFilter: "blur(13px)",
                backgroundColor: themeStyles.backdrop,
                // zIndex: 1
            }}
        >
            <Paper
                bg="transparent"
                shadow="lg"
                style={{
                    borderRadius: 0,
                    position: "relative",
                }}
            >
                <Group
                    justify="space-between"
                    h={LAYOUT_CONFIG.topbar.height}
                    px="md"
                    style={{
                        transition: "all 0.3s ease",
                    }}
                >
                    <Group>
                        <Image
                            src={themeStyles.logoSrc}
                            alt="Logo"
                            style={{ width: 110, height: "auto" }}
                        />
                    </Group>

                    <UserButton nombre={userData?.nombre} />
                </Group>
                {titulo.trim() !== "" && (
                    <TitlePageComponent
                        titulo={titulo}
                        subtitle={subtitle}
                        buttons={buttons}
                    />
                )}
                <Divider />
            </Paper>
        </Box>
    );

    const SidebarContent = (
        <Box
            style={{
                padding: "0px",
                display: "flex",
                flexDirection: "column",
                height: "100%",
                backgroundColor: themeStyles.sidebar,
            }}
        >
            {NavigationContent}
        </Box>
    );

    return (
        <Box>
            <Global
                styles={(theme) => ({
                    /* === BUTTONS === */
                    "button:disabled, button[data-disabled]": {
                        color:
                            colorScheme === "dark"
                                ? `${theme.colors.gray[5]} !important`
                                : `${theme.colors.gray[6]} !important`,
                        backgroundColor:
                            colorScheme === "dark"
                                ? `rgba(255,255,255,0.08) !important`
                                : `rgba(0,0,0,0.08) !important`,
                        opacity: "1 !important",
                        cursor: "not-allowed !important",
                    },

                    /* === TEXT INPUTS, TEXTAREA, PASSWORD, EMAIL === */
                    "input:disabled, input[data-disabled], textarea:disabled, textarea[data-disabled]":
                    {
                        color:
                            colorScheme === "dark"
                                ? `${theme.colors.gray[5]} !important`
                                : `${theme.colors.gray[7]} !important`,
                        backgroundColor:
                            colorScheme === "dark"
                                ? `rgba(0,0,0,0.2) !important`
                                : `rgba(0,0,0,0.07) !important`,
                        opacity: "1 !important",
                        cursor: "not-allowed !important",
                    },

                    /* === SELECTS === */
                    "select:disabled, select[data-disabled]": {
                        color:
                            colorScheme === "dark"
                                ? `${theme.colors.gray[5]} !important`
                                : `${theme.colors.gray[7]} !important`,
                        backgroundColor:
                            colorScheme === "dark"
                                ? `rgba(0,0,0,0.2) !important`
                                : `rgba(0,0,0,0.07) !important`,
                        opacity: "1 !important",
                        cursor: "not-allowed !important",
                    },

                    /* === AUTOCOMPLETE, COMBOBOX y componentes que usan data-disabled === */
                    '[role="combobox"][data-disabled], [data-autocomplete][data-disabled]':
                    {
                        color:
                            colorScheme === "dark"
                                ? `${theme.colors.gray[5]} !important`
                                : `${theme.colors.gray[7]} !important`,
                        backgroundColor:
                            colorScheme === "dark"
                                ? `rgba(0,0,0,0.2) !important`
                                : `rgba(0,0,0,0.07) !important`,
                        opacity: "1 !important",
                        cursor: "not-allowed !important",
                    },
                    // DatePickerInput específico
                    '[data-disabled="true"] .mantine-DatePickerInput-input, .mantine-DatePickerInput-input:disabled':
                    {
                        color:
                            colorScheme === "dark"
                                ? `${theme.colors.gray[5]} !important`
                                : `${theme.colors.gray[7]} !important`,
                        backgroundColor:
                            colorScheme === "dark"
                                ? `rgba(0,0,0,0.2) !important`
                                : `rgba(0,0,0,0.07) !important`,
                        opacity: "1 !important",
                        cursor: "not-allowed !important",
                    },
                })}
            />
            {menus && (
                <Box
                    style={{
                        marginLeft: contentMargin.left,
                        marginTop: contentMargin.top,
                        transition: "margin-left 0.3s ease",
                        minHeight: `calc(100vh - ${LAYOUT_CONFIG.topbar.height}px)`,
                        padding: "20px",
                        paddingTop: contentMargin.paddingTop,
                        // paddingLeft: contentMargin.paddingLeft,
                        paddingBottom: isMobile ? 140 : 20,
                    }}
                >
                    {children}
                </Box>
            )}

            {TopNavbar}

            {/* Mobile Drawer */}
            {isMobile ? (
                <Drawer
                    opened={opened}
                    onClose={close}
                    padding={0}
                    size={`${LAYOUT_CONFIG.sidebar.expanded}px`}
                    withCloseButton={false}
                    styles={{
                        body: { padding: 0, height: "100%" },
                        content: { display: "flex", flexDirection: "column" },
                    }}
                    transitionProps={{
                        transition: "slide-right",
                        duration: 300,
                    }}
                >
                    {SidebarContent}
                </Drawer>
            ) : (
                /* Desktop Sidebar */
                <Paper
                    shadow="sm"
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: sidebarWidth,
                        display: "flex",
                        flexDirection: "column",
                        borderRadius: 0,
                        borderRight: `1px solid ${themeStyles.border}`,
                        transition: "width 0.3s ease",
                    }}
                >
                    {SidebarContent}
                </Paper>
            )}
            {/* Main Content */}

            <Flex
                justify={isMobile ? "inherit" : "flex-start"}
                align={isMobile ? "inherit" : "center"}
                direction={"column"}
                w={isMobile ? "100%" : "auto"}
                style={{
                    position: "fixed",
                    top: isMobile ? "inherit" : "0px",
                    bottom: isMobile ? "0px" : "inherit",
                    backgroundColor: "transparent",
                }}
            >
                <Paper
                    radius={isMobile ? "0px" : "xl"}
                    shadow="lg"
                    m={isMobile ? 0 : 10}
                    p={isMobile ? 0 : 2}
                    w={isMobile ? "100%" : "max-content"}
                    style={{
                        backgroundColor:
                            colorScheme === "dark"
                                ? "rgba(53, 53, 53, 0.7)"
                                : "rgba(255,255,255,0.7)",
                        right: 0,
                        backdropFilter: "blur(20px)",
                        // width: isMobile ? "calc(100vw - 20px)" : "auto",
                        // maxWidth: isMobile ? "400px" : "auto",
                        zIndex: 1000,
                        border:
                            colorScheme === "dark"
                                ? "1px solid rgba(255,255,255,0.1)"
                                : "1px solid rgba(0,0,0,0.1)",
                    }}
                >
                    <Flex
                        gap={isMobile ? 4 : 2}
                        p={isMobile ? 5 : 0}
                        justify="center"
                        align="center"
                        h="100%"
                        w="100%"
                        wrap="nowrap"
                    >
                        <ActionIcon
                            variant="subtle"
                            size={isMobile ? "xl" : "lg"}
                            radius="xl"
                            onClick={handleMenuToggle}
                            style={{
                                color: themeStyles.iconColor,
                                minWidth: isMobile ? "48px" : "auto",
                                height: isMobile ? "48px" : "auto",
                            }}
                            aria-label="Menú"
                        >
                            <IconMenu2 size={isMobile ? 22 : 18} />
                        </ActionIcon>

                        {/* <ActionIcon
                            onClick={() => router.push(`/home`)}
                            radius="xl"
                            variant="subtle"
                            size={isMobile ? "xl" : "lg"}
                            title="Ir a Home"
                            style={{
                                minWidth: isMobile ? "48px" : "auto",
                                height: isMobile ? "48px" : "auto",
                                flex: "1 1 auto",
                            }}
                            aria-label="Inicio"
                        >
                            <IconHome size={isMobile ? 22 : 18} />
                        </ActionIcon> */}
                    </Flex>
                </Paper>
            </Flex>
        </Box>
    );
}
