import { useState } from "react";
import { parseCsvStream } from "./parseCSV";
import { parseExcelJsStream } from "./parseExcelJsStream";


export function useUploadProductosFile() {
  const [loading, setLoading] = useState(false);
  const [processed, setProcessed] = useState(0);

  const upload = async (file: File) => {
    setLoading(true);
    setProcessed(0);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase();

      if (ext === "csv") {
        await parseCsvStream(file, 500, setProcessed);
      } else if (ext === "xlsx") {
        await parseExcelJsStream(file, 500, setProcessed);
      } else {
        throw new Error("Formato no soportado");
      }

      return true;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { upload, loading, processed };
}
