export function base64ToBlob(base64String: string, contentType: string): Blob {
  const base64Data = base64String.split(',')[1] || base64String;
  const byteCharacters = atob(base64Data);
  const byteArrays = new Uint8Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteArrays[i] = byteCharacters.charCodeAt(i);
  }

  return new Blob([byteArrays], { type: contentType });
}



export function textoABase64(objeto: string): string {
  return btoa(
    Array.from(new TextEncoder().encode(objeto))
      .map(byte => String.fromCharCode(byte))
      .join("")
  );
}

export function base64ATexto<T>(base64: string) {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  const text = new TextDecoder().decode(bytes);
  return text;
}
export function formatDate(date?: string | null): string {
  if (!date || typeof date !== "string") return "";

  // Normalizar espacios
  const clean = date.trim();
  if (!clean) return "";

  const d = new Date(clean);

  // ⛔ FECHA INVÁLIDA
  if (isNaN(d.getTime())) return "";

  return d.toISOString().split("T")[0];
}
