
import {
  Box,
  Button,
  Flex,
  Group,
  Modal,
  Paper,
  ScrollArea,
  Title,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { ReactElement } from "react";

export interface TitleHead {
  title: string;
  aditionalChild?: ReactElement | null;
  buttonText?: string | null
}

export default function ModalCustomComponent({
  children,
  titleHead = {
    title: "",
  },
  opened = false,
  handlerClose = () => {},
  handleConfirm = () => {},
  ConfirmText = "Aceptar",
  Canceltext = "Cancelar",
  isConfirmModal = false,
  isModalMedium = false,
  showConfirm = true,
  Header = null,
  Footer = null,
  size = "lg",
}: {
  children: ReactElement;
  titleHead: TitleHead;
  opened: boolean;
  handlerClose?: () => void;
  handleConfirm?: () => void;
  ConfirmText?: string;
  Canceltext?: string;
  isConfirmModal?: boolean;
  isModalMedium?: boolean;
  showConfirm?: boolean;
  Footer?: ReactElement | null;
  Header?: ReactElement | null;
  size?: string;
}) {
  // Hook para detectar pantallas pequeñas (mobile/tablet)
  const isMobile = useMediaQuery("(max-width: 768px)");

  const getZIndex = () => {
    if (isConfirmModal) return 999999; // Confirm siempre al tope
    if (isModalMedium) return 99999; // Medio por debajo del confirm
    return 0; // Normal con z-index base más alto
  };

  // Función para determinar el tamaño del modal
  const getModalSize = () => {
    if (isMobile) {
      // En móviles, usar tamaño completo excepto para modales de confirmación
      return isConfirmModal ? "xs" : "lg";
    }
    // En pantallas grandes, usar el size proporcionado
    return isConfirmModal ? "xs" : size;
  };

  const zIndexValue = getZIndex();

  return (
    <Modal
      size={getModalSize()}
      scrollAreaComponent={ScrollArea.Autosize}
      opened={opened}
      onClose={handlerClose}
      withCloseButton={true}
      title={
        <Group wrap="wrap" mt={-10} mb={0}>
          <Title order={5}>{titleHead.title}</Title>
          {titleHead.aditionalChild}
        </Group>
      }
      overlayProps={{
        backgroundOpacity: 0.4,
        zIndex: zIndexValue + (isConfirmModal ? 0 : isModalMedium ? 0 : 200), // El overlay debe estar un nivel por debajo del modal
      }}
      zIndex={zIndexValue}
      style={{
        position: "relative",
      }}
      transitionProps={{ duration: 200 }}
    >
      <Box>
       
        {Header && (
          <Paper
            style={{
              position: "sticky",
              top: 57,
              width: "100%",
              borderTop: 0,
              borderLeft: 0,
              borderRight: 0,
              zIndex: 1,
              
            }}
            
            withBorder
            radius={0}
          >
            {Header}
          </Paper>
        )}

        <ScrollArea
          style={{
            paddingBottom:
              Footer && showConfirm ? 170 : Footer ? 70 : showConfirm ? isConfirmModal ? 0 : 10 : 0,
            paddingTop: Header ? 20 : 0,
          }}
        >
          {children}
        </ScrollArea>

        {(Footer || showConfirm) && (
          <Box
            style={{
              position: "sticky",
              bottom: 0,
              width: "100%",
              backdropFilter: "blur(13px)",
            }}
          >
            {Footer && <Box style={{ padding: 10 }}>{Footer}</Box>}
            {showConfirm && (
              <Flex direction={"row"} gap={5} >
                <Button fullWidth onClick={handleConfirm}>
                  {ConfirmText}
                </Button>
                <Button variant="subtle" fullWidth onClick={handlerClose}>
                  {Canceltext}
                </Button>
              </Flex>
            )}
          </Box>
        )}
      </Box>
    </Modal>
  );
}
