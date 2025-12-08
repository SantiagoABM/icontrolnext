"use client";
import { IconType } from "@/lib/utils/constantes";
import {
  Box,
  Button,
  Divider,
  Flex,
  Menu,
  Paper,
  Text,
  Title,
  useMantineColorScheme,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconChevronDown, IconHome } from "@tabler/icons-react";
import { useState, useRef, useEffect } from "react";

export interface ButtonSubMenuOnTitle {
  texto: string;
  icon: IconType;
  action?: any;
}

export interface ButtonOnTitle {
  Texto: string;
  icon: IconType;
  action?: any;
  isSecondary?: boolean;
  subMenuItems?: ButtonSubMenuOnTitle[];
}

export default function TitlePageComponent({
  titulo,
  subtitle,
  buttons,
}: {
  titulo: string;
  subtitle?: string;
  buttons?: ButtonOnTitle[];
}) {
  const [openMenus, setOpenMenus] = useState<{ [key: number]: boolean }>({});
  const [isCompact, setIsCompact] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { colorScheme } = useMantineColorScheme();

  const toggleMenu = (index: number, isOpen: boolean) => {
    setOpenMenus(prev => ({ ...prev, [index]: isOpen }));
  };

  return (
    <Box
      py={0}
      px={isMobile ? 10 : 20}
      mt={-5}
      pb={10}
      pr={isMobile ? 5 : 10}
      style={{
        zIndex: 0,
        position: "relative",
      }}
    >
      <Flex
        direction={"row"}
        justify={"space-between"}
        align={"flex-end"}
        gap={isMobile ? 5 : 10}
      >
        <Flex direction={"column"} style={{ minWidth: 0 }}>
          <Title 
            order={isMobile ? 5 : 5} 
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: isMobile ? 2 : 3,
              WebkitBoxOrient: "vertical",
              textWrap: 'nowrap'
            }}
          >
            {titulo}
          </Title>
          {subtitle && (
            <Text 
              mb={5} 
              size={isMobile ? "0.7rem" : "0.8rem"} 
              opacity={0.5}
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: isMobile ? 1 : 2,
                WebkitBoxOrient: "vertical",
                wordBreak: "break-word",
              }}
            >
              {subtitle}
            </Text>
          )}
        </Flex>
        <Flex 
          direction="row" 
          gap="4px" 
          style={{ height: "max-content" }}
          wrap="nowrap"
        >
          {buttons &&
            buttons.map((x, index) => {
              const Icon = x.icon;
              return (
                <Flex
                  key={index}
                  direction={"row"}
                  align={"center"}
                  style={{ height: "max-content" }}
                >
                  {index === 1 && (
                    <Divider
                      orientation="vertical"
                      style={{
                        height: 15,
                        margin: "auto",
                        marginRight: "4px",
                      }}
                    ></Divider>
                  )}

                  {x.subMenuItems ? (
                    <Menu
                      opened={openMenus[index] || false}
                      onChange={(isOpen) => toggleMenu(index, isOpen)}
                      position="bottom-end"
                      arrowPosition="center"
                      arrowSize={12}
                      withArrow
                    >
                      <Menu.Target>
                        <Button
                          size={isMobile ? "sm" : "xs"}
                          variant={!x.isSecondary ? "subtle" : "transparent"}
                          title={(isMobile || isCompact) ? x.Texto : ""}
                          radius={'lg'}
                          py={2}
                          px={4}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                          }}
                        >
                          <Icon size={isMobile ? 20 : 18} />
                          {!isMobile && !isCompact && <Text pl={5}>{x.Texto}</Text>}
                          <IconChevronDown
                            size={isMobile ? 16 : 14}
                            stroke={1.5}
                            style={{
                              transform: openMenus[index]
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                              transition: "transform 150ms ease",
                            }}
                          />
                        </Button>
                      </Menu.Target>

                      <Menu.Dropdown>
                        {x.subMenuItems.flatMap((subitem, index) => {
                          const Iconsub = x.icon;
                          return (
                            <Menu.Item
                              key={index}
                              leftSection={<Iconsub size="12px"></Iconsub>}
                              onClick={subitem.action}
                            >
                              {subitem.texto}
                            </Menu.Item>
                          );
                        })}
                      </Menu.Dropdown>
                    </Menu>
                  ) : (
                    <Button
                      size={isMobile ? "sm" : "xs"}
                      variant={!x.isSecondary ? "subtle" : "transparent"}
                      title={(isMobile || isCompact) ? x.Texto : ""}
                      radius={'lg'}
                      py={2}
                      px={4}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                      onClick={x.action}
                    >
                      <Icon size={isMobile ? 20 : 18} />
                      {!isMobile && !isCompact && (
                        x.Texto.trim() !== '' && <Text pl={5} size="14px" pr={5}>
                          {x.Texto}
                        </Text>
                      )}
                    </Button>
                  )}
                </Flex>
              );
            })}
        </Flex>
      </Flex>
    </Box>
  );
}