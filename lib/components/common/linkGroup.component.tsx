// import { useState } from 'react';
// import {
//   Box,
//   Collapse,
//   Group,
//   Text,
//   UnstyledButton,
//   rem,
//   ThemeIcon,
//   Tooltip,
//   Badge,
//   useMantineColorScheme,
//   useMantineTheme,
// } from '@mantine/core';
// import { IconChevronRight, IconFolder, IconFile } from '@tabler/icons-react';
// import { MenuItemNormalized } from '@/lib/interfaces/global.interfaces';
// import { color_Secundario, color_SecundarioDark, radiusStyle } from '@/lib/utils/constantes';

// interface LinksGroupProps {
//   item: MenuItemNormalized;
//   depth?: number;
//   collapsed: boolean;
//   onItemClick?: (item: MenuItemNormalized) => void;
// }

// export function LinksGroup({
//   item,
//   depth = 0,
//   collapsed,
//   onItemClick
// }: LinksGroupProps) {
//   const [opened, setOpened] = useState(false);
//   const hasChildren = Array.isArray(item.children) && item.children.length > 0;

//   const { colorScheme } = useMantineColorScheme();
//   const theme = useMantineTheme();

//   const activeBg =
//     colorScheme === 'dark'
//       ? 'rgba(99, 102, 241, 0.15)'
//       : 'rgba(99, 102, 241, 0.08)';

//   const hoverBg =
//     colorScheme === 'dark'
//       ? 'rgba(255,255,255,0.06)'
//       : 'rgba(0,0,0,0.04)';

//   const activeColor = colorScheme === 'dark'
//     ? color_SecundarioDark
//     : color_Secundario;

//   const handleClick = () => {
//     if (hasChildren) setOpened(o => !o);
//     else onItemClick?.(item);
//   };

//   const renderIcon = () => {
//     // si hay icono desde la API, úsalo
//     if (item.icon) {
//       return <img src={item.icon} width={14} height={14} />;
//     }

//     // si no, usa íconos por defecto
//     if (hasChildren) return <IconFolder size={14} />;
//     return <IconFile size={14} />;
//   };

//   return (
//     <Box style={{ overflow: 'hidden' }}>
//       <UnstyledButton
//         onClick={handleClick}
//         style={{
//           width: '100%',
//           display: 'flex',
//           alignItems: 'center',
//           padding: `${rem(10)} ${rem(7)}`,
//           marginBottom: rem(2),
//           borderRadius: radiusStyle,
//           transition: 'all 150ms ease',
//           backgroundColor: opened ? activeBg : 'transparent',
//           position: 'relative',
//         }}
//         onMouseEnter={(e) => {
//           if (!opened) e.currentTarget.style.backgroundColor = hoverBg;
//         }}
//         onMouseLeave={(e) => {
//           e.currentTarget.style.backgroundColor = opened ? activeBg : 'transparent';
//         }}
//       >
//         <Group justify="space-between" style={{ flex: 1 }} wrap="nowrap">
//           <Group gap="7px" align="center" style={{ flex: 1, minWidth: 0 }}>
//             {/* ICONO */}
//             <ThemeIcon
//               variant={opened ? 'filled' : 'light'}
//               size={hasChildren ? 'sm' : 'xs'}
//             >
//               {renderIcon()}
//             </ThemeIcon>

//             {/* TEXTO */}
//             <Box style={{ flex: 1, minWidth: 0 }}>
//               <Text
//                 size={depth > 0 ? 'xs' : 'sm'}
//                 fw={hasChildren ? 600 : 500}
//                 style={{
//                   color: opened ? activeColor : 'inherit',
//                   transition: 'color 150ms ease',
//                 }}
//               >
//                 {item.label}
//               </Text>
//             </Box>
//           </Group>

//           {/* CHEVRON */}
//           {hasChildren && (
//             <ThemeIcon
//               variant="subtle"
//               size="xs"
//               color={opened ? activeColor : 'gray'}
//             >
//               <IconChevronRight size={12} />
//             </ThemeIcon>
//           )}
//         </Group>
//       </UnstyledButton>

//       {/* HIJOS */}
//       {hasChildren && !collapsed && (
//         <Collapse in={opened}>
//           <Box
//             style={{
//               borderLeft: `1px solid ${
//                 colorScheme === 'dark'
//                   ? 'rgba(255,255,255,0.1)'
//                   : 'rgba(0,0,0,0.1)'
//               }`,
//               marginLeft: rem(7),
//               paddingLeft: rem(10),
//               marginTop: rem(4),
//             }}
//           >
//             {item.children.map(child => (
//               <LinksGroup
//                 key={child.id}
//                 item={child}
//                 depth={depth + 1}
//                 collapsed={collapsed}
//                 onItemClick={onItemClick}
//               />
//             ))}
//           </Box>
//         </Collapse>
//       )}
//     </Box>
//   );
// }
