import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { APP_CONFIG, PDF_CONFIG } from '../constants';
import type { Sale } from '../context/DataContext';

/**
 * Generates a sales receipt PDF
 * @param sale - Sale data containing items and totals
 * @param applyIgv - Whether to include IGV breakdown
 * @returns void - Downloads PDF automatically
 */
export const generateReceiptPDF = (sale: any, applyIgv: boolean = true): void => {
    const doc = new jsPDF();

    // Header
    doc.setFontSize(PDF_CONFIG.FONT_SIZE.TITLE + 4);
    doc.setFont('helvetica', 'bold');
    doc.text(APP_CONFIG.NAME.toUpperCase(), 105, 20, { align: 'center' });

    doc.setFontSize(PDF_CONFIG.FONT_SIZE.NORMAL - 1);
    doc.setFont('helvetica', 'normal');
    doc.text(`RUC: ${APP_CONFIG.RUC}`, 105, 28, { align: 'center' });
    doc.text(APP_CONFIG.ADDRESS, 105, 33, { align: 'center' });
    doc.text(`Tel: ${APP_CONFIG.PHONE}`, 105, 38, { align: 'center' });

    doc.setLineWidth(0.5);
    doc.line(20, 45, 190, 45);

    // Receipt Info
    doc.setFontSize(PDF_CONFIG.FONT_SIZE.SUBTITLE);
    doc.setFont('helvetica', 'bold');
    doc.text('BOLETA DE VENTA ELECTRÓNICA', 105, 55, { align: 'center' });
    doc.text(`N° ${sale.id ? sale.id.toUpperCase() : '---'}`, 105, 62, { align: 'center' });

    doc.setFontSize(PDF_CONFIG.FONT_SIZE.NORMAL - 1);
    doc.setFont('helvetica', 'bold');
    doc.text('Fecha:', 20, 75);
    doc.setFont('helvetica', 'normal');
    doc.text(`${new Date(sale.date).toLocaleString()}`, 40, 75);

    doc.setFont('helvetica', 'bold');
    doc.text('Vendedor:', 20, 82);
    doc.setFont('helvetica', 'normal');
    doc.text(`${sale.sellerName}`, 40, 82);

    // Table
    const tableColumn = ['Cant.', 'Descripción', 'P. Unit', 'Total'];
    const tableRows: string[][] = [];

    sale.items.forEach((item: any) => {
        const ticketData = [
            item.quantity.toString(),
            item.name,
            `S/ ${item.price.toFixed(2)}`,
            `S/ ${(item.price * item.quantity).toFixed(2)}`
        ];
        tableRows.push(ticketData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 90,
        theme: 'grid',
        headStyles: {
            fillColor: PDF_CONFIG.COLORS.PRIMARY,
            textColor: PDF_CONFIG.COLORS.TEXT
        },
        alternateRowStyles: { fillColor: PDF_CONFIG.COLORS.ALT_ROW }
    });

    // Totals
    // @ts-ignore
    let finalY = doc.lastAutoTable.finalY + 10;

    if (applyIgv) {
        const baseAmount = sale.total * (1 - APP_CONFIG.IGV_RATE);
        const igvAmount = sale.total * APP_CONFIG.IGV_RATE;

        doc.text(`OP. GRAVADA:   S/ ${baseAmount.toFixed(2)}`, 140, finalY, { align: 'right' });
        doc.text(`IGV (${APP_CONFIG.IGV_RATE * 100}%):   S/ ${igvAmount.toFixed(2)}`, 140, finalY + 7, { align: 'right' });
        finalY += 15;
    }

    doc.setFontSize(PDF_CONFIG.FONT_SIZE.SUBTITLE);
    doc.setFont('helvetica', 'bold');
    doc.text(`TOTAL:   S/ ${sale.total.toFixed(2)}`, 140, finalY, { align: 'right' });

    // Footer
    doc.setFontSize(PDF_CONFIG.FONT_SIZE.SMALL);
    doc.setFont('helvetica', 'italic');
    doc.text('Representación impresa de la Boleta de Venta Electrónica', 105, finalY + 15, { align: 'center' });
    doc.text('Gracias por su preferencia', 105, finalY + 20, { align: 'center' });

    doc.save(`Boleta_${sale.id}.pdf`);
};

/**
 * Generates a sales report PDF
 * @param sales - Array of sales
 * @param totalRevenue - Total revenue amount
 * @param totalTransactions - Total number of transactions
 * @returns void - Downloads PDF automatically
 */
export const generateSalesReportPDF = (
    sales: Sale[],
    totalRevenue: number,
    totalTransactions: number
): void => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(PDF_CONFIG.FONT_SIZE.TITLE);
    doc.setFont('helvetica', 'bold');
    doc.text(`Reporte de Ventas - ${APP_CONFIG.NAME}`, 14, 22);

    doc.setFontSize(PDF_CONFIG.FONT_SIZE.NORMAL);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 30);

    // Summary
    doc.setTextColor(0);
    doc.setFontSize(12);
    doc.text(`Ingresos Totales: S/ ${totalRevenue.toFixed(2)}`, 14, 45);
    doc.text(`Transacciones: ${totalTransactions}`, 14, 52);
    doc.text(`Ticket Promedio: S/ ${(totalTransactions > 0 ? (totalRevenue / totalTransactions) : 0).toFixed(2)}`, 14, 59);

    // Table
    const tableColumn = ['#', 'Fecha', 'Vendedor', 'Items', 'Total'];
    const tableRows: (string | number)[][] = [];

    sales.forEach((sale, index) => {
        const saleData = [
            index + 1,
            new Date(sale.date).toLocaleDateString(),
            sale.sellerName || 'N/A',
            sale.items?.length || 0,
            `S/ ${(sale.total || 0).toFixed(2)}`
        ];
        tableRows.push(saleData);
    });

    autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 70,
        theme: 'grid',
        headStyles: {
            fillColor: PDF_CONFIG.COLORS.PRIMARY,
            textColor: PDF_CONFIG.COLORS.TEXT
        },
        alternateRowStyles: { fillColor: PDF_CONFIG.COLORS.ALT_ROW }
    });

    doc.save(`Reporte_Ventas_${new Date().toISOString().slice(0, 10)}.pdf`);
};
