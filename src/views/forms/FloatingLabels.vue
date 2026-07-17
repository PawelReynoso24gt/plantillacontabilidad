<template>
  <!-- Encabezado -->
  <div class="libro-header">
    <div>
      <h2 class="libro-title">Libro de Bancos - Capilla</h2>
      <p class="libro-subtitle">
        Consulta el movimiento bancario por rango de fechas y cuenta, y genera el PDF.
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

  <!-- Selección de cuenta bancaria -->
  <div class="division-container division-inline">
    <div class="field-group">
      <label class="field-label">Cuenta bancaria</label>
      <select v-model="cuentaBName" class="field-control">
        <option disabled value="">Seleccione una cuenta</option>
        <option v-for="cuentaN in cuentas_bancarias" :key="cuentaN.cuenta_bancaria" :value="cuentaN.cuenta_bancaria">
          {{ cuentaN.banco_y_cuenta }}
        </option>
      </select>
      <small v-if="fieldErrors.cuentaBName" class="error-text">{{ fieldErrors.cuentaBName }}</small>
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
    <div><strong>REPORTE:</strong> LIBRO BANCOS</div>
    <div>
      <strong>ESPECIFICACIÓN:</strong>
      Desde <span class="rp-value">{{ fechaInicial }}</span> hasta
      <span class="rp-value">{{ fechaFinal }}</span>
    </div>
    <div>
      <strong>CUENTA BANCARIA:</strong>
      {{
        cuentaBancariaSeleccionada
          ? cuentaBancariaSeleccionada.banco_y_cuenta ||
          cuentaBancariaSeleccionada.nombre_cuenta
          : ''
      }}
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
            fila.cuenta === 'Suma total Banco'
        }">
          <!-- Filas especiales -->
          <template v-if="
            fila.cuenta === 'Saldo inicial' ||
            fila.cuenta === 'Suma total Banco'
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
    No hay datos para mostrar.
    Selecciona rango de fechas y cuenta bancaria y presiona
    <strong>Vista previa</strong>.
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
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { useRouter } from 'vue-router'; // para redirección de rutas
import { manejarErrorRuta } from '../../../utils/manejarErrores.js';
import { buildReportPdf } from '@/pdf/PdfReportBuilder';
import { formatCurrency } from '@/pdf/format';
import ReportPreviewHeader from '@/components/ReportPreviewHeader.vue';
import '../../styles/css/InformeBancosC.css'
import '../../styles/css/GlobalAlertsModals.css';

export default {
  name: 'LibroBancosCapilla',
  components: { ReportPreviewHeader },
  setup() {
    const router = useRouter();
    const mostrarModalExitoFormulario = ref(false);
    const fechaInicial = ref('');
    const fechaFinal = ref('');
    const nombreEncabezado = ref('PROYECTO CAPILLA');
    const direccionProyecto = ref('15 avenida, entre 3a y 4a calle zona 3, Quetzaltenango');

    const cuentas_bancarias = reactive([]);
    const cuentaBName = ref('');

    const ingresosEgresos = ref([]);

    const fieldErrors = reactive({
      fechaInicial: '',
      fechaFinal: '',
      cuentaBName: ''
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

    const limpiar = () => {
      fechaFinal.value = '';
      fechaInicial.value = '';
      cuentaBName.value = '';
      ingresosEgresos.value = [];
    };

    const cerrarModalExitoFormulario = () => {
        mostrarModalExitoFormulario.value = false;
        limpiar(); 
    };

    const cargarBancosNoCuenta = () => {
      axios
        .get('http://127.0.0.1:8000/cuentasB/getConcatenada')
        .then((response) => {
          cuentas_bancarias.splice(
            0,
            cuentas_bancarias.length,
            ...response.data
          );
        })
        .catch((error) => {
          console.error(error);
          manejarErrorRuta(error, router);
        });
    };

    onMounted(() => {
      cargarBancosNoCuenta();
    });

    const cuentaBancariaSeleccionada = computed(() => {
      return cuentas_bancarias.find(
        (cuenta) => cuenta.cuenta_bancaria === cuentaBName.value
      );
    });

    const tablaFormateada = computed(() => {
      return ingresosEgresos.value.map((item) => {
        const esEspecial =
          item.cuenta === 'Saldo inicial' ||
          item.cuenta === 'Suma total Banco';

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

    const mostrarTabla = async () => {
      let tieneErrores = false;

      // Comprobación de campos vacíos
      if (!fechaInicial.value) { mostrarErrorCampo('fechaInicial', 'Falta por llenar datos'); tieneErrores = true; }
      if (!fechaFinal.value) { mostrarErrorCampo('fechaFinal', 'Falta por llenar datos'); tieneErrores = true; }
      if (!cuentaBName.value) { mostrarErrorCampo('cuentaBName', 'Falta por llenar datos'); tieneErrores = true; }

      if (tieneErrores) return;

      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/in_eg/fechaBancoCA',
          {
            fechaInicial: fechaInicial.value,
            fechaFinal: fechaFinal.value,
            banco_y_cuenta: cuentaBName.value
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
      if (!cuentaBName.value) { mostrarErrorCampo('cuentaBName', 'Falta por llenar datos'); tieneErrores = true; }

      if (tieneErrores) return;

      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/in_eg/fechaBancoCA',
          {
            fechaInicial: fechaInicial.value,
            fechaFinal: fechaFinal.value,
            banco_y_cuenta: cuentaBName.value
          }
        );
        const data = response.data;

        const cuentaBancariaTexto =
          cuentaBancariaSeleccionada.value?.nombre_cuenta ||
          cuentaBancariaSeleccionada.value?.banco_y_cuenta ||
          '-';

        const metadata = {
          empresa: nombreEncabezado.value,
          direccion: direccionProyecto.value,
          tipoReporte: 'LIBRO BANCOS',
          especificacion: [
            `Desde: ${fechaInicial.value || '-'}, Hasta: ${fechaFinal.value || '-'}`,
            `Cuenta bancaria: ${cuentaBancariaTexto}`
          ]
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
            row.cuenta === 'Suma total Banco';

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

        const doc = buildReportPdf({ orientation: 'landscape', metadata, columns, rows });
        const blob = doc.output('blob');
        saveAs(blob, 'libro_bancos_capilla.pdf');
        mostrarModalExitoFormulario.value = true;
      } catch (error) {
        console.error('Error al generar el PDF:', error);
        manejarErrorRuta(error, router);
      }
    };

    return {
      fechaInicial,
      fechaFinal,
      cuentaBName,
      nombreEncabezado,
      direccionProyecto,
      cuentas_bancarias,
      cuentaBancariaSeleccionada,
      ingresosEgresos,
      tablaFormateada,
      mostrarTabla,
      generarPDF,
      /////////////////////
      fieldErrors,
      cerrarModalExitoFormulario,
      limpiar,
      mostrarModalExitoFormulario
    };
  }
};
</script>
