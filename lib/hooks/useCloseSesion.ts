// hooks/useCloseSesion.ts
import { redirect } from 'next/navigation';
import { useConfirm } from './useConfirm';
import { EliminarCookie } from '../actions/cookie.action';
import { useLoadingStore } from '../store/useLoadingStore';

export function useCloseSesion() {
    const { confirm } = useConfirm();

    return async () => {
        const result = await confirm({
            title: 'Cerrar Sesión',
            message: '¿Desea cerrar la sesión?',
            confirmText: 'Sí',
            cancelText: 'No',
        });

        if (result) {
            try {
                useLoadingStore.getState().show();
                await EliminarCookie();
                redirect('/auth');
            } catch (error) {
                redirect('/auth');
            }
        }
    };
}
