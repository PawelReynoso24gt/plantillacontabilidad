// Formateo de moneda compartido — reemplaza los formatNumber/formatQ
// duplicados en cada vista.
export function formatCurrency(value) {
  if (value === null || value === undefined || value === '') return '';
  const num = typeof value === 'string' ? parseFloat(value.replace(/,/g, '')) : parseFloat(value);
  if (Number.isNaN(num)) return '';
  return (
    'Q. ' +
    num.toLocaleString('es-GT', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
}
