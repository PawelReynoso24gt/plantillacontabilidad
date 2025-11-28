<template>
      <!-- Encabezado principal -->
      <div class="libro-header">
        <div>
          <h2 class="libro-title">Libro diario</h2>
          <p class="libro-subtitle">
            Consulta y genera el reporte del libro diario del proyecto agrícola.
          </p>
        </div>
      </div>

      <!-- Filtros de fecha -->
      <div class="division-container division-inline">
        <div class="field-group">
          <label class="field-label">Fecha inicial</label>
          <input
            type="date"
            v-model="fechaInicial"
            class="field-control"
          />
        </div>
        <div class="field-group">
          <label class="field-label">Fecha final</label>
          <input
            type="date"
            v-model="fechaFinal"
            class="field-control"
          />
        </div>
      </div>

      <!-- Botones -->
      <div class="form-actions">
        <button @click="mostrarTabla" class="btn-secondary">
          Vista previa
        </button>
        <button @click="generarPDF" class="btn-primary">
          Generar PDF
        </button>
      </div>

      <!-- Encabezado tipo PDF / vista previa -->
      <div v-if="ingresosEgresos.length" class="encabezado-container">
        <div class="encabezado-box">
          <div class="encabezado-titulo">{{ nombreEncabezado }}</div>
          <div class="encabezado-direccion">
            Dirección del Proyecto: {{ direccionProyecto }}
          </div>
        </div>

        <div class="encabezado-detalles">
          <div><strong>REPORTE:</strong> LIBRO DIARIO</div>
          <div>
            <strong>ESPECIFICACIÓN:</strong>
            Desde: {{ fechaInicial || '—' }}, Hasta: {{ fechaFinal || '—' }}
          </div>
        </div>
      </div>

      <!-- Tabla de resultados -->
      <div v-if="ingresosEgresos.length" class="tabla-wrapper">
        <table class="tabla-libro">
          <thead>
            <tr>
              <th>Conteo</th>
              <th>Número de Documento</th>
              <th>Fecha</th>
              <th>Cuenta</th>
              <th>Descripción</th>
              <th class="right">Acredita</th>
              <th class="right">Debita</th>
              <th class="right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(fila, idx) in tablaFormateada"
              :key="idx"
              :class="{
                'fila-resaltada':
                  fila.cuenta === 'Saldo inicial' ||
                  fila.cuenta === 'Suma total'
              }"
            >
              <!-- Filas especiales -->
              <template
                v-if="
                  fila.cuenta === 'Saldo inicial' ||
                  fila.cuenta === 'Suma total'
                "
              >
                <td>{{ fila.nomenclatura }}</td>
                <td>{{ fila.numero_documento }}</td>
                <td>{{ fila.fecha || '' }}</td>
                <td class="bold-text">{{ fila.cuenta }}</td>
                <td class="descripcion-col bold-text">
                  {{ fila.descripcion }}
                </td>
                <td class="right bold-text"></td>
                <td class="right bold-text"></td>
                <td class="right bold-text">{{ fila.total }}</td>
              </template>

              <!-- Filas normales -->
              <template v-else>
                <td>{{ fila.nomenclatura }}</td>
                <td>{{ fila.numero_documento }}</td>
                <td>{{ fila.fecha }}</td>
                <td>{{ fila.cuenta }}</td>
                <td class="descripcion-col">{{ fila.descripcion }}</td>
                <td class="right">{{ fila.acredita }}</td>
                <td class="right">{{ fila.debita }}</td>
                <td class="right">{{ fila.total }}</td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mensaje cuando no hay datos aún -->
      <div v-else class="sin-datos">
        No hay datos para mostrar.<br />
        Selecciona un rango de fechas y presiona
        <span class="badge-ayuda">Vista previa</span>.
      </div>
   

</template>

<script>
import { ref, computed } from 'vue';
import jsPDF from 'jspdf';
import axios from 'axios';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import '../../styles/css/LibroDiarioA.css'

export default {
  name: 'LibroDiario',
  setup() {
    const fechaInicial = ref('');
    const fechaFinal = ref('');
    const nombreEncabezado = ref('PROYECTO AGRÍCOLA');
    const direccionProyecto = ref('8va calle 5-21 zona 10, Quetzaltenango');

    const ingresosEgresos = ref([]);

    const formatNumber = (value) => {
      if (value === null || value === undefined || value === '') return '';
      const num = parseFloat(value);
      if (isNaN(num)) return '';
      return (
        'Q. ' +
        num.toLocaleString('es-GT', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      );
    };

    const tablaFormateada = computed(() => {
      return ingresosEgresos.value.map((item) => {
        const esEspecial =
          item.cuenta === 'Saldo inicial' || item.cuenta === 'Suma total';

        return {
          nomenclatura: item.nomenclatura,
          numero_documento: item.numero_documento || '-',
          fecha: item.fecha || '',
          cuenta: item.cuenta,
          descripcion: item.descripcion,
          acredita: esEspecial
            ? ''
            : item.acredita
            ? formatNumber(item.acredita)
            : '',
          debita: esEspecial
            ? ''
            : item.debita
            ? formatNumber(item.debita)
            : '',
          total: item.total ? formatNumber(item.total) : ''
        };
      });
    });

    const mostrarTabla = async () => {
      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/in_eg/libroDiario',
          {
            fechaInicial: fechaInicial.value,
            fechaFinal: fechaFinal.value
          }
        );
        ingresosEgresos.value = response.data || [];
      } catch (error) {
        console.error('Error al mostrar la tabla:', error);
        ingresosEgresos.value = [];
      }
    };

    const generarPDF = async () => {
      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/in_eg/libroDiario',
          {
            fechaInicial: fechaInicial.value,
            fechaFinal: fechaFinal.value
          }
        );
        const data = response.data;

        const doc = new jsPDF('landscape');

        doc.setFontSize(16);
        doc.text(nombreEncabezado.value, 148.5, 27, { align: 'center' });
        doc.rect(60, 17, 170, 15);

        doc.setFontSize(12);
        doc.text(
          `Dirección del Proyecto: ${direccionProyecto.value}`,
          20,
          40
        );

        const textoAdicional = 'REPORTE: LIBRO DIARIO';
        doc.setFontSize(10);
        doc.text(textoAdicional, 20, 50);

        const especificacionFechas = `ESPECIFICACIÓN: Desde: ${fechaInicial.value}, Hasta: ${fechaFinal.value}`;
        doc.text(especificacionFechas, 20, 60);

        const columnas = [
          { title: 'Conteo', dataKey: 'nomenclatura' },
          { title: 'Número de Documento', dataKey: 'numero_documento' },
          { title: 'Fecha', dataKey: 'fecha' },
          { title: 'Cuenta', dataKey: 'cuenta' },
          { title: 'Descripción', dataKey: 'descripcion' },
          { title: 'Acredita', dataKey: 'acredita' },
          { title: 'Debita', dataKey: 'debita' },
          { title: 'Saldo', dataKey: 'total' }
        ];

        // Filas del PDF
        const filas = data.map((row) => {
          const total = row.total ? formatNumber(row.total) : '';

          if (
            row.cuenta === 'Saldo inicial' ||
            row.cuenta === 'Suma total'
          ) {
            return {
              nomenclatura: row.nomenclatura,
              numero_documento: row.numero_documento || '-',
              fecha: row.fecha || '',
              cuenta: row.cuenta,
              descripcion: row.descripcion,
              acredita: '',
              debita: '',
              total: { content: total, styles: { fontStyle: 'bold' } }
            };
          }

          return {
            nomenclatura: row.nomenclatura,
            numero_documento: row.numero_documento || '-',
            fecha: row.fecha,
            cuenta: row.cuenta,
            descripcion: row.descripcion,
            acredita: row.acredita ? formatNumber(row.acredita) : '',
            debita: row.debita ? formatNumber(row.debita) : '',
            total: total
          };
        });

        doc.autoTable({
          columns: columnas,
          body: filas,
          startY: 80,
          theme: 'grid',
          styles: {
            cellPadding: 3,
            fontSize: 8,
            halign: 'left',
            valign: 'middle'
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: [255, 255, 255]
          },
          columnStyles: {
            nomenclatura: {
              minCellWidth: 20,
              overflow: 'visible',
              halign: 'left'
            },
            numero_documento: {
              minCellWidth: 30,
              overflow: 'visible',
              halign: 'left'
            },
            fecha: {
              minCellWidth: 20,
              overflow: 'visible',
              halign: 'left'
            },
            cuenta: {
              minCellWidth: 40,
              overflow: 'linebreak',
              halign: 'left'
            },
            descripcion: {
              minCellWidth: 40,
              overflow: 'linebreak',
              halign: 'left'
            },
            acredita: { minCellWidth: 20, halign: 'right' },
            debita: { minCellWidth: 20, halign: 'right' },
            total: { minCellWidth: 20, halign: 'right' }
          }
        });

        const blob = doc.output('blob');
        saveAs(blob, 'libro_diario_agrícola.pdf');
      } catch (error) {
        console.error('Error al generar el PDF:', error);
      }
    };

    return {
      fechaInicial,
      fechaFinal,
      nombreEncabezado,
      direccionProyecto,

      ingresosEgresos,
      tablaFormateada,

      mostrarTabla,
      generarPDF
    };
  }
};
</script>
