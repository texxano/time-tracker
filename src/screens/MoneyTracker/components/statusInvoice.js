export const statusInvoice = (paidAmount, billedAmount) => {
    const percentage = (paidAmount / billedAmount) * 100;
    const colorMap = {
        0: '#ccc',
        100: '#17a2b8',
    };
    const color = colorMap[Math.round(percentage)] || '#ffc107';
    return color;
};
