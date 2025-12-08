// stores/useCommonDataStore.ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { CommonData } from "../interfaces/global.interfaces";
import { compressedStorage } from "../utils/compresores";

export const useCommonDataStore = create<{
  commonData: CommonData | null;
  resetCommonData: () => void;
  setCommonData: ({ commonData }: { commonData: CommonData | null }) => void;
}>()(
  persist(
    (set) => ({
      commonData: null,
      resetCommonData: () => set({ commonData: null }),
      setCommonData: ({ commonData }) => set({ commonData }),
    }),
    {
      name: "common-data-bo-storage",
      storage: createJSONStorage(() => compressedStorage),
    }
  )
);
