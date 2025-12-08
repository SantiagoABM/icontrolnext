// hooks/useConfirm.ts
import { useContext } from 'react';
import { ConfirmContext } from '../providers/confirm.provider';

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) throw new Error('useConfirm debe usarse dentro de ConfirmProvider');
  return context;
}
