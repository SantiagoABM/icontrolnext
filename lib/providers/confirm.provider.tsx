// providers/ConfirmProvider.tsx
"use client";

import { createContext, useState, ReactNode } from "react";
import { Modal, Button, Group, Text, Box } from "@mantine/core";
import ModalCustomComponent, { TitleHead } from "../components/common/modalCustom.component";

export interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

export interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

export const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [resolver, setResolver] = useState<(value: boolean) => void>(() => {});

  const confirm = (opts: ConfirmOptions) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  };

  const handleClose = () => {
    setIsOpen(false);
    resolver(false);
  };

  const handleConfirm = () => {
    setIsOpen(false);
    resolver(true);
  };

  const titleHead: TitleHead = {
    title: options.title || "¿Estás seguro?",
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      <ModalCustomComponent
        isConfirmModal={true}
        opened={isOpen}
        handlerClose={handleClose}
        handleConfirm={handleConfirm}
        titleHead={titleHead}
        children={
          <Text mb="md">
            {options.message || "Esta acción no se puede deshacer."}
          </Text>
        }
        ConfirmText="Si"
        Canceltext="No"
      ></ModalCustomComponent>
      {children}
    </ConfirmContext.Provider>
  );
}
