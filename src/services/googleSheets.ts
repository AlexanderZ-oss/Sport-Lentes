export interface SheetSaleData {
    id: string;
    date: string;
    total: number;
    seller: string;
    client: string;
    items: string;
    paymentType: string;
}

export const GOOGLE_SHEET_URL = ""; // Usuario debe pegar su URL aquí

export const saveToGoogleSheets = async (data: SheetSaleData) => {
    if (!GOOGLE_SHEET_URL) {
        console.warn("GOOGLE_SHEET_URL no está configurado. La venta no se guardó en Sheets.");
        return false;
    }

    try {
        // Enviar como 'no-cors' permite enviar datos a Google Form/Script pero no leer respuesta
        // Para leer respuesta se necesita configurar CORS en el script, pero 'no-cors' es más facil de configurar
        await fetch(GOOGLE_SHEET_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        console.log("Datos enviados a Google Sheets");
        return true;
    } catch (error) {
        console.error("Error enviando a Google Sheets:", error);
        return false;
    }
};
