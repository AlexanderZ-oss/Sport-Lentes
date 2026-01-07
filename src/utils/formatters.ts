/**
 * Formats a number as currency (Peruvian Soles)
 * @param amount - Amount to format
 * @returns Formatted string (e.g., "S/ 299.90")
 */
export const formatCurrency = (amount: number): string => {
    return `S/ ${amount.toFixed(2)}`;
};

/**
 * Formats a date to localized string
 * @param date - Date string or Date object
 * @returns Formatted date string
 */
export const formatDate = (date: string | Date): string => {
    return new Date(date).toLocaleDateString('es-ES');
};

/**
 * Formats a date and time to localized string
 * @param date - Date string or Date object
 * @returns Formatted datetime string
 */
export const formatDateTime = (date: string | Date): string => {
    return new Date(date).toLocaleString('es-ES');
};

/**
 * Generates a unique ID
 * @returns Random alphanumeric string
 */
export const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9);
};

/**
 * Calculates IGV amount from total
 * @param total - Total amount including IGV
 * @param rate - IGV rate (default 0.18)
 * @returns IGV amount
 */
export const calculateIGV = (total: number, rate: number = 0.18): number => {
    return total * rate;
};

/**
 * Calculates base amount (without IGV)
 * @param total - Total amount including IGV
 * @param rate - IGV rate (default 0.18)
 * @returns Base amount
 */
export const calculateBaseAmount = (total: number, rate: number = 0.18): number => {
    return total * (1 - rate);
};

/**
 * Applies discount to amount
 * @param amount - Original amount
 * @param discountPercent - Discount percentage (0-100)
 * @returns Amount after discount
 */
export const applyDiscount = (amount: number, discountPercent: number): number => {
    return amount * (1 - discountPercent / 100);
};
