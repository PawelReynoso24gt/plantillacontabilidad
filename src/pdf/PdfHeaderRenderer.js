import { COLORS, LAYOUT } from './theme';
import { defaultLogoDataUrl } from './logo';

/**
 * Dibuja el encabezado compartido de todos los reportes: barra navy superior,
 * tarjeta blanca con borde dorado, bloque izquierdo (empresa + dirección) y
 * bloque derecho (REPORTE: / ESPECIFICACIÓN:) separados por una línea vertical.
 *
 * @param {import('jspdf').jsPDF} doc
 * @param {{empresa:string, direccion:string, tipoReporte:string, especificacion:string|string[]}} metadata
 * @returns {number} y donde debe iniciar el contenido siguiente (la tabla)
 */
export function drawReportHeader(doc, metadata) {
  const { margin, cardTop, cardRadius, topBarHeight } = LAYOUT;
  const pageWidth = doc.internal.pageSize.getWidth();
  const cardWidth = pageWidth - margin * 2;

  const especLinesRaw = Array.isArray(metadata.especificacion)
    ? metadata.especificacion
    : [metadata.especificacion || ''];

  const leftX = margin + 8;
  const rightX = margin + cardWidth * 0.6;
  const logoCx = leftX + 4;
  const logoRadius = 6;
  const textX = logoCx + 12;
  const rightEdge = margin + cardWidth - 6;

  // Anchos disponibles reales para cada bloque de texto, medidos desde donde
  // el texto realmente inicia (no desde leftX/rightX) para que nada cruce la
  // línea divisoria ni el borde derecho de la tarjeta.
  const leftBlockWidth = rightX - 10 - textX;
  const reporteValueWidth = rightEdge - (rightX + 22);
  const especWidth = rightEdge - rightX;

  const EMPRESA_LH = 5.5;
  const TEXT_LH = 4.5;
  const REPORT_LH = 5;
  const ESPEC_LH = 5.5;

  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  const empresaLines = doc.splitTextToSize(metadata.empresa || '', leftBlockWidth);

  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  const direccionLines = doc.splitTextToSize(
    `Dirección del Proyecto: ${metadata.direccion || ''}`,
    leftBlockWidth
  );

  doc.setFontSize(10);
  const tipoReporteLines = doc.splitTextToSize(metadata.tipoReporte || '', reporteValueWidth);
  const especLines = especLinesRaw.flatMap((line) => doc.splitTextToSize(line, especWidth));

  const leftBlockBottom = 10 + empresaLines.length * EMPRESA_LH + 3 + direccionLines.length * TEXT_LH;
  const rightBlockBottom =
    10 + tipoReporteLines.length * REPORT_LH + 4 + ESPEC_LH + especLines.length * ESPEC_LH;
  const cardHeight = Math.max(leftBlockBottom, rightBlockBottom, logoRadius * 2 + 8) + 6;

  // Barra navy superior con el título del reporte
  doc.setFillColor(...COLORS.navy);
  doc.rect(0, 0, pageWidth, topBarHeight, 'F');
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.white);
  doc.setFont(undefined, 'bold');
  doc.text((metadata.tipoReporte || '').toUpperCase(), pageWidth / 2, 13, { align: 'center' });

  // Tarjeta blanca con borde dorado
  doc.setFillColor(...COLORS.white);
  doc.roundedRect(margin, cardTop, cardWidth, cardHeight, cardRadius, cardRadius, 'F');
  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.6);
  doc.roundedRect(margin, cardTop, cardWidth, cardHeight, cardRadius, cardRadius, 'S');

  // Logo circular decorativo
  const logoCy = cardTop + cardHeight / 2;
  const logoImage = metadata.logoDataUrl || defaultLogoDataUrl;

  if (logoImage) {
    doc.saveGraphicsState();
    doc.circle(logoCx, logoCy, logoRadius, null);
    doc.clip();
    doc.discardPath();
    doc.addImage(
      logoImage,
      logoCx - logoRadius,
      logoCy - logoRadius,
      logoRadius * 2,
      logoRadius * 2
    );
    doc.restoreGraphicsState();
  }

  doc.setDrawColor(...COLORS.gold);
  doc.setLineWidth(0.6);
  doc.circle(logoCx, logoCy, logoRadius, 'S');

  // Bloque izquierdo: empresa + dirección
  let y = cardTop + 10;
  doc.setTextColor(...COLORS.navy);
  doc.setFontSize(13);
  doc.setFont(undefined, 'bold');
  empresaLines.forEach((line, i) => doc.text(line, textX, y + i * EMPRESA_LH));
  y += empresaLines.length * EMPRESA_LH + 3;

  doc.setTextColor(...COLORS.text);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  direccionLines.forEach((line, i) => doc.text(line, textX, y + i * TEXT_LH));

  // Línea vertical divisoria
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(rightX - 8, cardTop + 6, rightX - 8, cardTop + cardHeight - 6);

  // Bloque derecho: REPORTE: / ESPECIFICACIÓN:
  let ry = cardTop + 10;
  doc.setTextColor(...COLORS.navy);
  doc.setFontSize(10);
  doc.setFont(undefined, 'bold');
  doc.text('REPORTE:', rightX, ry);
  doc.setFont(undefined, 'normal');
  tipoReporteLines.forEach((line, i) => doc.text(line, rightX + 22, ry + i * REPORT_LH));
  ry += tipoReporteLines.length * REPORT_LH + 4;

  doc.setFont(undefined, 'bold');
  doc.text('ESPECIFICACIÓN:', rightX, ry);
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...COLORS.text);
  ry += ESPEC_LH;
  especLines.forEach((line, i) => doc.text(line, rightX, ry + i * ESPEC_LH));

  return cardTop + cardHeight + 8;
}
