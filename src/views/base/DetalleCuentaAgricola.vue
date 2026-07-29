<template>
      <!-- Encabezado principal -->
      <div class="libro-header">
        <h2 class="libro-title">Libro Mayor</h2>
        <p class="libro-subtitle">
          Detalle de movimientos de la cuenta seleccionada para el período anual {{ year }}.
        </p>
      </div>

      <!-- “Filtros” / info de contexto (solo lectura) -->
      <div class="division-container">
        <div class="numero-fecha-container">
          <div class="fecha-inputs">
            <label>Cuenta</label>
            <input
              class="field-control"
              type="text"
              :value="`${codigoCuenta} - ${nombreCuenta}`"
              disabled
            />
          </div>
          <div class="fecha-inputs">
            <label>Período</label>
            <input
              class="field-control"
              type="text"
              :value="`Anual ${year}`"
              disabled
            />
          </div>
        </div>
      </div>

      <!-- Botones -->
      <div class="form-actions">
        <button @click="generarPDF" class="btn-primary">
          Generar PDF
        </button>
        <button class="btn-primary" @click="volver">
          Regresar
        </button>
      </div>

      <!-- Encabezado tipo PDF / vista previa -->
      <div v-if="ingresosEgresos.length" class="encabezado-container">
        <div class="encabezado-box">
          <div class="encabezado-titulo">
            {{ nombreEncabezado }}
          </div>
          <div class="encabezado-direccion">
            Dirección del Proyecto: {{ direccionProyecto }}
          </div>
        </div>

        <div class="encabezado-detalles">
          <div><strong>REPORTE:</strong> LIBRO MAYOR</div>
          <div>
            <strong>CUENTA:</strong>
            {{ nombreCuenta }}
          </div>
          <div>
            <strong>PERÍODO:</strong>
            Anual {{ year }}
          </div>
          <div>
            <strong>FECHA REPORTE:</strong>
            {{ fechaHoy }}
          </div>
        </div>
      </div>

      <!-- Tabla de movimientos -->
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
              <!-- Filas especiales (Saldo inicial / Suma total) -->
              <template
                v-if="fila.cuenta === 'Saldo inicial' || fila.cuenta === 'Suma total'"
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
                <!-- AQUI ESTÁ EL CAMBIO: Link en Nomenclatura -->
              <td
                class="link-cuenta"
                @click="irAPartida(fila.idIngresoEgreso)"
                title="Ver Partida"
              >
                {{ fila.nomenclatura }}
              </td>

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

      <!-- Mensaje cuando no hay datos -->
      <div v-else class="sin-datos">
        No hay datos para mostrar. Esta cuenta no tiene movimientos para el período.
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { buildReportPdf } from '@/pdf/PdfReportBuilder';
import { formatCurrency } from '@/pdf/format';
import '../../styles/css/LibroDiarioA.css';
import '../../styles/css/GlobalAlertsModals.css';
import { manejarErrorRuta } from '../../../utils/manejarErrores.js';

export default {
  name: 'ReporteCuentaAgricolaCuenta',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const mostrarModalExitoFormulario = ref(false); 
    // Código contable (2.1.1)
    const codigoCuenta = computed(() => route.params.codigo || '');

    // Nombre de la cuenta ("Compra de Cerdos")
    const nombreCuenta = computed(() => route.params.cuenta || '');

    const year = new Date().getFullYear();
    const fechaHoy = new Date().toLocaleDateString('es-ES');

    // Encabezado igual que LibroDiario
    const nombreEncabezado = ref('PROYECTO AGRÍCOLA');
    const direccionProyecto = ref('8va calle 5-21 zona 10, Quetzaltenango');

    const ingresosEgresos = ref([]);
    const loading = ref(false);
    const error = ref(false);

    const tablaFormateada = computed(() => {
      return ingresosEgresos.value.map((item) => {
        const esEspecial =
          item.cuenta === 'Saldo inicial' || item.cuenta === 'Suma total';

        return {
          idIngresoEgreso: item.id_ingresos_egresos,
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

    const cargarMovimientos = async () => {
      loading.value = true;
      error.value = false;
      try {
       // console.log('Código que se muestra:', codigoCuenta.value);
        //console.log('Nombre que se envía al backend:', nombreCuenta.value);

        const resp = await axios.post(
          'http://127.0.0.1:8000/cuentas/libro-diario/por-cuentaAG',
          {
            cuenta: nombreCuenta.value // aquí va el nombre, igual que en Postman
          }
        );

        ingresosEgresos.value = resp.data || [];
      } catch (e) {
        console.error('Error al cargar movimientos de la cuenta:', e);
        error.value = true;
        ingresosEgresos.value = [];
        manejarErrorRuta(e, router);
      } finally {
        loading.value = false;
      }
    };

    // --- NUEVA FUNCIÓN PARA EL LINK ---
    const irAPartida = (idIngresoEgreso) => {
        // Redirige a la ruta 'Partidas' definida en tu router
        router.push({ 
            name: 'Partidas',
            // Opcional: Enviamos el numero de documento como query param
            // por si quieres filtrar al llegar a esa vista.
            query: { id: idIngresoEgreso } 
        });
    };

    const generarPDF = () => {

    if (!ingresosEgresos.value.length) {
      console.warn('No hay movimientos para generar el PDF.');
      return;
    }

    const metadata = {
      empresa: nombreEncabezado.value,
      direccion: direccionProyecto.value,
      tipoReporte: 'LIBRO MAYOR - ESTADO DE MOVIMIENTOS POR CUENTA',
      especificacion: `Cuenta: ${codigoCuenta.value} - ${nombreCuenta.value} | Período: Anual ${year}`
    };

    const columns = [
      { header: 'Conteo', dataKey: 'nomenclatura', align: 'center' },
      { header: 'Número de Documento', dataKey: 'numero_documento', align: 'center' },
      { header: 'Fecha', dataKey: 'fecha', align: 'center' },
      { header: 'Cuenta', dataKey: 'cuenta', align: 'left' },
      { header: 'Descripción', dataKey: 'descripcion', align: 'left' },
      { header: 'Acredita', dataKey: 'acredita', type: 'acredita' },
      { header: 'Debita', dataKey: 'debita', type: 'debita' },
      { header: 'Saldo', dataKey: 'total', type: 'currency' }
    ];

    const filas = ingresosEgresos.value.map((row) => {
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

    const doc = buildReportPdf({ orientation: 'landscape', metadata, columns, rows: filas });
    const blob = doc.output('blob');
    saveAs(blob, `libro_mayor_cuenta_${codigoCuenta.value}.pdf`);
    mostrarModalExitoFormulario.value = true;
  };

    const volver = () => {
      router.back();
    };

    
    onMounted(() => {
      cargarMovimientos();
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
    };

    return {
      codigoCuenta,
      nombreCuenta,
      year,
      fechaHoy,
      nombreEncabezado,
      direccionProyecto,
      ingresosEgresos,
      tablaFormateada,
      loading,
      error,
      generarPDF,
      volver,
      irAPartida,
      ///////////////
      cerrarModalExitoFormulario,
      mostrarModalExitoFormulario   
    };
  }
};
</script>