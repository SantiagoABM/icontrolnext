// stores/useLoadingStore.ts
import { create } from 'zustand';
import { ButtonOnTitle } from '@/lib/components/common/TitlePage.component';

export const useTitlePageStore = create<{
    titulo: string;
    subtitle?: string;
    buttons?: ButtonOnTitle[];
    resetData: () => void;
    setData: ({titulo, subtitle, buttons}:{titulo: string, subtitle?: string, buttons?: ButtonOnTitle[]}) => void
}>((set) => ({
    titulo: "",
    subtitle: "",
    buttons: [],
    respaldoButtons: [],
    resetData: () => {set({titulo: '', subtitle:'', buttons: []})},
    setData: ({titulo, subtitle, buttons}) =>  {
        set({titulo, subtitle, buttons})
    }
}));

