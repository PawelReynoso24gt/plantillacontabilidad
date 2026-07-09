import { COLORS } from './theme';

/**
 * Dibuja la tabla principal compartida por todos los reportes: header navy
 * con texto blanco, filas de "Saldo inicial"/totales resaltadas en beige, y
 * columnas de tipo 'acredita'/'debita' coloreadas en verde/rojo. Agrega el
 * pie de página (fecha de generación + número de página) en todas las hojas.
 *
 * @param {import('jspdf').jsPDF} doc
 * @param {{startY:number, columns:Array<{header:string,dataKey:string,align?:string,type?:string}>, rows:Array<Object>}} params
 * @returns {number} finalY de la tabla
 */
export function drawReportTable(doc, { startY, columns, rows }) {
  const head = [columns.map((c) => c.header)];
  const body = rows.map((row) => columns.map((c) => row[c.dataKey] ?? ''));

  const columnStyles = columns.reduce((acc, col, i) => {
    const align =
      col.align ||
      (col.type === 'currency' || col.type === 'acredita' || col.type === 'debita' ? 'right' : undefined);
    if (align) acc[i] = { halign: align };
    return acc;
  }, {});

  doc.autoTable({
    head,
    body,
    startY,
    theme: 'grid',
    styles: {
      cellPadding: 2.5,
      fontSize: 8,
      halign: 'center',
      valign: 'middle',
      overflow: 'linebreak',
      textColor: COLORS.text,
    },
    headStyles: {
      fillColor: COLORS.navy,
      textColor: COLORS.white,
      fontStyle: 'bold',
      halign: 'center',
    },
    alternateRowStyles: {
      fillColor: COLORS.altRow,
    },
    columnStyles,
    didParseCell: (data) => {
      if (data.section !== 'body') return;
      const row = rows[data.row.index];
      const col = columns[data.column.index];
      if (!row || !col) return;

      if (row._variant === 'highlight') {
        data.cell.styles.fillColor = COLORS.highlightBg;
        data.cell.styles.fontStyle = 'bold';
      }

      if (col.type === 'acredita' || col.type === 'debita') {
        const raw = row[col.dataKey];
        if (raw !== null && raw !== undefined && raw !== '') {
          data.cell.styles.textColor = col.type === 'acredita' ? COLORS.positive : COLORS.negative;
        }
      } else if (row._variant === 'highlight') {
        data.cell.styles.textColor = COLORS.navy;
      }

      // Permite marcar el color de una celda puntual (ej. "DIFERENCIA" en rojo
      // solo cuando la partida no cuadra), sin acoplar el motor a ese caso.
      const cellColorKey = row._cellColors && row._cellColors[col.dataKey];
      if (cellColorKey && COLORS[cellColorKey]) {
        data.cell.styles.textColor = COLORS[cellColorKey];
      }
    },
  });

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(...COLORS.gold);
    doc.setLineWidth(0.4);
    doc.line(10, pageHeight - 14, pageWidth - 10, pageHeight - 14);

    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.setFont(undefined, 'normal');
    doc.text(`Generado el ${new Date().toLocaleDateString('es-GT')}`, 10, pageHeight - 8);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 10, pageHeight - 8, { align: 'right' });
  }

  return doc.lastAutoTable.finalY;
}
