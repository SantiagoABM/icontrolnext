// stores/useLoadingStore.ts
import { create } from 'zustand';
import { createJSONStorage, persist } from "zustand/middleware";
import { compressedStorage } from '../utils/compresores';
import { UsuarioSesion } from '../interfaces/authentication.interfaces';

export const useUserDataStore = create<{
  userData: UsuarioSesion | null;
  resetUserData: () => void;
  setUserData: ({ userData }: { userData: UsuarioSesion | null }) => void;
}>()(
  persist(
    (set) => ({
      userData: null,
      resetUserData: () => set({ userData: null }),
      setUserData: ({ userData }) => set({ userData }),
    }),
    {
      name: "user-data-storage", // clave en localStorage
      storage: createJSONStorage(() => compressedStorage), // ✅ evita errores de tipo
    }
  )
);