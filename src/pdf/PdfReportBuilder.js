import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { drawReportHeader } from './PdfHeaderRenderer';
import { drawReportTable } from './PdfTableRenderer';

/**
 * Punto único de construcción de PDFs contables. Nuevos tipos de reporte se
 * agregan aportando otro {metadata, columns, rows} — esta función no cambia
 * (OCP) y no conoce de dónde vienen los datos (DIP).
 *
 * @param {Object} params
 * @param {'portrait'|'landscape'} [params.orientation]
 * @param {{empresa:string, direccion:string, tipoReporte:string, especificacion:string|string[]}} params.metadata
 * @param {Array<{header:string, dataKey:string, align?:string, type?:'text'|'currency'|'acredita'|'debita'}>} params.columns
 * @param {Array<Object & {_variant?:'highlight', _cellColors?:Object}>} params.rows
 * @returns {import('jspdf').jsPDF}
 */
export function buildReportPdf({ orientation = 'landscape', metadata, columns, rows }) {
  const doc = new jsPDF({ orientation });
  const startY = drawReportHeader(doc, metadata);
  drawReportTable(doc, { startY, columns, rows });
  return doc;
}
