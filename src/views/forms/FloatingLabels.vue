<template>
  <div class="page-wrapper">
    <div class="page-card">
  <!-- Encabezado -->
  <div class="module-header">
    <div>
      <h2 class="module-title">Libro de Bancos - Capilla</h2>
      <p class="module-subtitle">
        Consulta el movimiento bancario por rango de fechas y cuenta, y genera el PDF.
      </p>
    </div>
  </div>

  <!-- Filtros de fecha -->
  <div class="section-container section-container--inline">
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
  <div class="section-container section-container--inline">
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
    <button @click="mostrarTabla" class="btn btn-secondary">
      Vista previa
    </button>
    <button @click="generarPDF" class="btn btn-primary">
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
      <div><strong>REPORTE:</strong> LIBRO BANCOS</div>
      <div>
        <strong>ESPECIFICACIÓN:</strong>
        Desde {{ fechaInicial }} hasta {{ fechaFinal }}
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
    </div>
  </div>

  <!-- Tabla de resultados -->
  <div v-if="ingresosEgresos.length" class="table-wrapper">
    <table class="data-table">
      <thead>
        <tr>
          <th>Conteo</th>
          <th>Fecha</th>
          <th>Cuenta</th>
          <th>Descripción</th>
          <th class="cell-right">Acredita</th>
          <th class="cell-right">Debita</th>
          <th class="cell-right">Saldo</th>
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
            <td class="text-bold">{{ fila.cuenta }}</td>
            <td class="descripcion-col bold-text">
              {{ fila.descripcion }}
            </td>
            <td class="cell-right text-bold"></td>
            <td class="cell-right text-bold"></td>
            <td class="cell-right text-bold">{{ fila.total }}</td>
          </template>

          <!-- Filas normales -->
          <template v-else>
            <td>{{ fila.nomenclatura }}</td>
            <td>{{ fila.fecha }}</td>
            <td>{{ fila.cuenta }}</td>
            <td class="descripcion-col">{{ fila.descripcion }}</td>
            <td class="cell-right">{{ fila.acredita }}</td>
            <td class="cell-right">{{ fila.debita }}</td>
            <td class="cell-right">{{ fila.total }}</td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Mensaje cuando no hay datos aún -->
  <div v-else class="table-empty">
    No hay datos para mostrar.
    Selecciona rango de fechas y cuenta bancaria y presiona
    <strong>Vista previa</strong>.
  </div>

    </div><!-- /page-card -->
  </div><!-- /page-wrapper -->  <!-- **MODAL DE DESCARGA CORRECTA** ================================================================================================================================ -->
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
import jsPDF from 'jspdf';
import axios from 'axios';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { useRouter } from 'vue-router'; // para redirección de rutas
import { manejarErrorRuta } from '../../../utils/manejarErrores.js';
import '@/styles/global.css';
import '../../styles/css/GlobalAlertsModals.css';

export default {
  name: 'LibroBancosCapilla',
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

        const doc = new jsPDF('landscape');

        // Encabezado PDF
        doc.setFontSize(16);
        doc.text(nombreEncabezado.value, 148.5, 27, { align: 'center' });
        doc.rect(60, 17, 170, 15);

        doc.setFontSize(12);
        doc.text(
          `Dirección del Proyecto: ${direccionProyecto.value}`,
          20,
          40
        );

        const textoAdicional = 'REPORTE: LIBRO BANCOS';
        doc.setFontSize(10);
        doc.text(textoAdicional, 20, 50);

        const especificacionFechas = `ESPECIFICACIÓN: Desde: ${fechaInicial.value}, Hasta: ${fechaFinal.value}`;
        doc.text(especificacionFechas, 20, 60);

        const cuentaBancariaTexto = `CUENTA BANCARIA: ${cuentaBancariaSeleccionada.value?.nombre_cuenta ||
          cuentaBancariaSeleccionada.value?.banco_y_cuenta ||
          ''
          }`;
        doc.text(cuentaBancariaTexto, 20, 70);

        const columns = [
          { title: 'Conteo', dataKey: 'nomenclatura' },
          { title: 'Fecha', dataKey: 'fecha' },
          { title: 'Cuenta', dataKey: 'cuenta' },
          { title: 'Descripción', dataKey: 'descripcion' },
          { title: 'Acredita', dataKey: 'acredita' },
          { title: 'Debita', dataKey: 'debita' },
          { title: 'Saldo', dataKey: 'total' }
        ];

        const filas = data.map((row) => {
          const total = row.total ? formatNumber(row.total) : '';

          if (
            row.cuenta === 'Saldo inicial' ||
            row.cuenta === 'Suma total Banco'
          ) {
            return {
              nomenclatura: row.nomenclatura,
              fecha: row.fecha || '',
              cuenta: row.cuenta,
              descripcion: row.descripcion,
              acredita: '',
              debita: '',
              total: {
                content: total,
                styles: { fontStyle: 'bold' }
              },
              borderBottom: {
                width: 4,
                color: [0, 0, 0],
                double: true
              }
            };
          }

          return {
            nomenclatura: row.nomenclatura,
            fecha: row.fecha,
            cuenta: row.cuenta,
            descripcion: row.descripcion,
            acredita: row.acredita ? formatNumber(row.acredita) : '',
            debita: row.debita ? formatNumber(row.debita) : '',
            total: total
          };
        });

        doc.autoTable({
          columns,
          body: filas,
          startY: 75,
          theme: 'grid',
          styles: {
            cellPadding: 2.5,
            fontSize: 7,
            halign: 'center',
            valign: 'middle',
            overflow: 'linebreak'
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
          },
          tableWidth: 'auto',
          margin: { left: 10, right: 10 }
        });

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
