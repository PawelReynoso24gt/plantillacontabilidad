<template>
  <!-- Encabezado principal -->
  <div class="libro-header">
    <div>
      <h2 class="libro-title">Libro de caja</h2>
      <p class="libro-subtitle">
        Consulta y genera el reporte del libro de caja del proyecto agrícola.
      </p>
    </div>
  </div>

  <!-- Filtros de fecha -->
  <div class="division-container division-inline">
    <div class="field-group">
      <label class="field-label">Fecha inicial</label>
      <input type="date" v-model="fechaInicial" class="field-control" />
    </div>
    <div class="field-group">
      <label class="field-label">Fecha final</label>
      <input type="date" v-model="fechaFinal" class="field-control" />
    </div>
  </div>

  <!-- Botones -->
  <div class="form-actions">
    <button class="btn-secondary" @click="mostrarTabla">
      Vista previa
    </button>
    <button class="btn-primary" @click="generarPDF">
      Generar PDF
    </button>
  </div>

  <!-- Encabezado tipo PDF (solo si hay datos) -->
  <ReportPreviewHeader
    v-if="ingresosEgresos.length"
    :empresa="nombreEncabezado"
    :subtitulo="`Dirección del Proyecto: ${direccionProyecto}`"
  >
    <div><strong>REPORTE:</strong> LIBRO CAJA</div>
    <div>
      <strong>ESPECIFICACIÓN:</strong>
      Desde: <span class="rp-value">{{ fechaInicial || '—' }}</span>, Hasta:
      <span class="rp-value">{{ fechaFinal || '—' }}</span>
    </div>
  </ReportPreviewHeader>

  <!-- Tabla de resultados -->
  <div v-if="ingresosEgresos.length" class="tabla-wrapper">
    <table class="tabla-libro">
      <thead>
        <tr>
          <th>Conteo</th>
          <th>Fecha</th>
          <th>Cuenta</th>
          <th>Descripción</th>
          <th class="right">Acredita</th>
          <th class="right">Debita</th>
          <th class="right">Saldo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(fila, idx) in tablaFormateada" :key="idx" :class="{
          'fila-resaltada':
            fila.cuenta === 'Saldo inicial' ||
            fila.cuenta === 'Suma total Caja'
        }">
          <!-- Filas especiales -->
          <template v-if="
            fila.cuenta === 'Saldo inicial' ||
            fila.cuenta === 'Suma total Caja'
          ">
            <td>{{ fila.nomenclatura }}</td>
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
    <span class="badge-ayuda">Vista previa</span>
  </div>


</template>

<script>
import { ref, computed } from 'vue';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { buildReportPdf } from '@/pdf/PdfReportBuilder';
import { formatCurrency } from '@/pdf/format';
import ReportPreviewHeader from '@/components/ReportPreviewHeader.vue';
import '../../styles/css/LibroCajaA.css'

export default {
  name: 'LibroCaja',
  components: { ReportPreviewHeader },
  setup() {
    const fechaInicial = ref('');
    const fechaFinal = ref('');

    const nombreEncabezado = ref('PROYECTO AGRÍCOLA');
    const direccionProyecto = ref('8va calle 5-21 zona 10, Quetzaltenango');

    // esto guardará lo que regrese el backend
    const ingresosEgresos = ref([]);

    // adaptamos los datos como en el PDF
    const tablaFormateada = computed(() => {
      return ingresosEgresos.value.map((item) => {
        const esEspecial =
          item.cuenta === 'Saldo inicial' ||
          item.cuenta === 'Suma total Caja';

        return {
          nomenclatura: item.nomenclatura,
          fecha: item.fecha || '',
          cuenta: item.cuenta,
          descripcion: item.descripcion,
          acredita: esEspecial
            ? ''
            : item.acredita
              ? formatCurrency(item.acredita)
              : '',
          debita: esEspecial
            ? ''
            : item.debita
              ? formatCurrency(item.debita)
              : '',
          total: item.total ? formatCurrency(item.total) : ''
        };
      });
    });

    // -------- construir PDF con el diseño compartido --------
    const buildPDF = async () => {
      const response = await axios.post(
        'http://127.0.0.1:8000/in_eg/fecha',
        {
          fechaInicial: fechaInicial.value,
          fechaFinal: fechaFinal.value
        }
      );

      const data = response.data;

      const metadata = {
        empresa: nombreEncabezado.value,
        direccion: direccionProyecto.value,
        tipoReporte: 'LIBRO CAJA',
        especificacion: `Desde: ${fechaInicial.value || '-'}, Hasta: ${fechaFinal.value || '-'}`
      };

      const columns = [
        { header: 'Conteo', dataKey: 'nomenclatura', align: 'center' },
        { header: 'Fecha', dataKey: 'fecha', align: 'center' },
        { header: 'Cuenta', dataKey: 'cuenta', align: 'left' },
        { header: 'Descripción', dataKey: 'descripcion', align: 'left' },
        { header: 'Acredita', dataKey: 'acredita', type: 'acredita' },
        { header: 'Debita', dataKey: 'debita', type: 'debita' },
        { header: 'Saldo', dataKey: 'total', type: 'currency' }
      ];

      const rows = data.map((row) => {
        const esResumen =
          row.cuenta === 'Saldo inicial' ||
          row.cuenta === 'Suma total Caja';

        return {
          nomenclatura: row.nomenclatura,
          fecha: row.fecha || '',
          cuenta: row.cuenta,
          descripcion: row.descripcion,
          acredita: esResumen ? '' : (row.acredita ? formatCurrency(row.acredita) : ''),
          debita: esResumen ? '' : (row.debita ? formatCurrency(row.debita) : ''),
          total: row.total ? formatCurrency(row.total) : '',
          ...(esResumen ? { _variant: 'highlight' } : {})
        };
      });

      return buildReportPdf({ orientation: 'landscape', metadata, columns, rows });
    };

    const generarPDF = async () => {
      try {
        const doc = await buildPDF();
        const blob = doc.output('blob');
        saveAs(blob, 'libro_caja_agrícola.pdf');
      } catch (error) {
        console.error('Error al generar el PDF:', error);
      }
    };

    const mostrarTabla = async () => {
      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/in_eg/fecha',
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

    return {
      fechaInicial,
      fechaFinal,
      nombreEncabezado,
      direccionProyecto,
      ingresosEgresos,
      tablaFormateada,
      generarPDF,
      mostrarTabla
    };
  }
};
</script>
