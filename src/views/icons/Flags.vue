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
      <input type="date" v-model="fechaInicial" class="field-control" />
      <small v-if="fieldErrors.fechaInicial" class="error-text">{{ fieldErrors.fechaInicial }}</small>
    </div>
    <div class="field-group">
      <label class="field-label">Fecha final</label>
      <input type="date" v-model="fechaFinal" class="field-control" />
      <small v-if="fieldErrors.fechaFinal" class="error-text">{{ fieldErrors.fechaFinal }}</small>
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
  <ReportPreviewHeader
    v-if="ingresosEgresos.length"
    :empresa="nombreEncabezado"
    :subtitulo="`Dirección del Proyecto: ${direccionProyecto}`"
  >
    <div><strong>REPORTE:</strong> LIBRO DIARIO</div>
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
        <tr v-for="(fila, idx) in tablaFormateada" :key="idx" :class="{
          'fila-resaltada':
            fila.cuenta === 'Saldo inicial' ||
            fila.cuenta === 'Suma total'
        }">
          <!-- Filas especiales -->
          <template v-if="
            fila.cuenta === 'Saldo inicial' ||
            fila.cuenta === 'Suma total'
          ">
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

  <!-- **MODAL DE DESCARGA CORRECTA** ================================================================================================================================ -->
  <div v-if="mostrarModalExitoFormulario" class="modal-overlay">
    <div class="modal-content deposito-card" style="max-width: 450px; text-align: center;">
      <div style="margin-bottom: 1.5rem;">
        <div style="font-size: 3rem; color: #28a745; margin-bottom: 1rem;">✓</div>
        <h3 style="color: #14491b; margin-bottom: 0.5rem;">¡Descarga Exitosa!</h3>
        <p style="color: #6c757d;">El reporte en PDF se ha generado y descargado correctamente.</p>
      </div>
      <div class="form-actions" style="justify-content: center;">
        <button class="btn-primary" @click="cerrarModalExitoFormulario" style="min-width: 120px;">
          Aceptar
        </button>
      </div>
    </div>
  </div>

</template>

<script>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { useRouter } from 'vue-router'; // para redirección de rutas
import { manejarErrorRuta } from '../../../utils/manejarErrores.js';
import { buildReportPdf } from '@/pdf/PdfReportBuilder';
import { formatCurrency } from '@/pdf/format';
import ReportPreviewHeader from '@/components/ReportPreviewHeader.vue';
import '../../styles/css/LibroDiarioA.css'

export default {
  name: 'LibroDiario',
  components: { ReportPreviewHeader },
  setup() {
    const router = useRouter();
    const mostrarModalExitoFormulario = ref(false);
    const fechaInicial = ref('');
    const fechaFinal = ref('');
    const ingresosEgresos = ref([]);
    const nombreEncabezado = ref('PROYECTO AGRÍCOLA');
    const direccionProyecto = ref('8va calle 5-21 zona 10, Quetzaltenango');
    
    const fieldErrors = reactive({
      fechaInicial: '',
      fechaFinal: ''
    });

    const mostrarErrorCampo = (campo, mensaje) => {
      fieldErrors[campo] = mensaje;
      setTimeout(() => {
        fieldErrors[campo] = '';
      }, 5000);
    };

    onMounted(() => {
      window.addEventListener('keydown', manejarEnter);
    });

    onUnmounted(() => {
      // Apagamos el detector de teclado al salir de la pantalla
      window.removeEventListener('keydown', manejarEnter);
    });

    const manejarEnter = (event) => {
      if (event.key === 'Enter') {
        // En esta pantalla SOLO existe este modal de éxito
        if (mostrarModalExitoFormulario.value) {
          event.preventDefault();
          cerrarModalExitoFormulario(); 
        }
      }
    };

    const cerrarModalExitoFormulario = () => {
        mostrarModalExitoFormulario.value = false;
        limpiar(); 
    };

    const limpiar = () => {
      fechaFinal.value = '';
      fechaInicial. value = '';
      ingresosEgresos.value = [];
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

    const mostrarTabla = async () => {
      let tieneErrores = false;

      // Comprobación de campos vacíos
      if (!fechaInicial.value) { mostrarErrorCampo('fechaInicial', 'Falta por llenar datos'); tieneErrores = true; }
      if (!fechaFinal.value) { mostrarErrorCampo('fechaFinal', 'Falta por llenar datos'); tieneErrores = true; }

      if (tieneErrores) return;

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
        manejarErrorRuta(error, router);
      }
    };

    const generarPDF = async () => {
      let tieneErrores = false;

      // Comprobación de campos vacíos
      if (!fechaInicial.value) { mostrarErrorCampo('fechaInicial', 'Falta por llenar datos'); tieneErrores = true; }
      if (!fechaFinal.value) { mostrarErrorCampo('fechaFinal', 'Falta por llenar datos'); tieneErrores = true; }

      if (tieneErrores) return;

      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/in_eg/libroDiario',
          {
            fechaInicial: fechaInicial.value,
            fechaFinal: fechaFinal.value
          }
        );
        const data = response.data;

        const metadata = {
          empresa: nombreEncabezado.value,
          direccion: direccionProyecto.value,
          tipoReporte: 'LIBRO DIARIO',
          especificacion: `Desde: ${fechaInicial.value || '-'}, Hasta: ${fechaFinal.value || '-'}`
        };

        const columnas = [
          { header: 'Conteo', dataKey: 'nomenclatura', align: 'center' },
          { header: 'Número de Documento', dataKey: 'numero_documento', align: 'center' },
          { header: 'Fecha', dataKey: 'fecha', align: 'center' },
          { header: 'Cuenta', dataKey: 'cuenta', align: 'left' },
          { header: 'Descripción', dataKey: 'descripcion', align: 'left' },
          { header: 'Acredita', dataKey: 'acredita', type: 'acredita' },
          { header: 'Debita', dataKey: 'debita', type: 'debita' },
          { header: 'Saldo', dataKey: 'total', type: 'currency' }
        ];

        // Filas del PDF
        const filas = data.map((row) => {
          const esResumen =
            row.cuenta === 'Saldo inicial' ||
            row.cuenta === 'Suma total';

          return {
            nomenclatura: row.nomenclatura,
            numero_documento: row.numero_documento || '-',
            fecha: row.fecha || '',
            cuenta: row.cuenta,
            descripcion: row.descripcion,
            acredita: esResumen ? '' : (row.acredita ? formatCurrency(row.acredita) : ''),
            debita: esResumen ? '' : (row.debita ? formatCurrency(row.debita) : ''),
            total: row.total ? formatCurrency(row.total) : '',
            ...(esResumen ? { _variant: 'highlight' } : {})
          };
        });

        const doc = buildReportPdf({ orientation: 'landscape', metadata, columns: columnas, rows: filas });
        const blob = doc.output('blob');
        saveAs(blob, 'libro_diario_agrícola.pdf');
        mostrarModalExitoFormulario.value = true;
      } catch (error) {
        console.error('Error al generar el PDF:', error);
        manejarErrorRuta(error, router);
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
      generarPDF,
      //////////////////
      fieldErrors,
      cerrarModalExitoFormulario,
      limpiar,
      mostrarModalExitoFormulario
    };
  }
};
</script>
