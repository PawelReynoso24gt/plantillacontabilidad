<template>
  <!-- Fondo y centrado general -->
  <div>
    <div>
      
      <!-- Encabezado principal -->
      <div class="libro-header">
        <h2 class="libro-title">Libro Mayor - Capilla</h2>
        <p class="libro-subtitle">
          Detalle de movimientos de la cuenta seleccionada para el período anual {{ year }}.
        </p>
      </div>

      <!-- Información de contexto (solo lectura) -->
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
            PROYECTO CAPILLA HOGAR SANTA LUISA
          </div>
          <div class="encabezado-direccion">
            Dirección del Proyecto: 8va calle 5-21 zona 10, Quetzaltenango
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
                <!-- Link en Nomenclatura -->
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

      <!-- Mensajes de estado -->
      <div v-if="loading" class="sin-datos">Cargando movimientos...</div>
      <div v-else-if="error" class="sin-datos error">
        Ocurrió un error al cargar los movimientos.
      </div>
      <div v-else-if="!tablaFormateada.length" class="sin-datos">
        No hay movimientos registrados para esta cuenta.
      </div>

    </div> <!-- Cierre de .libro-diario-card -->
  </div> <!-- Cierre de .libro-diario-wrapper -->
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import '../../styles/css/LibroDiarioA.css'; 

export default {
  name: 'ReporteCuentaCapillaCuenta',
  setup() {
    const route = useRoute();
    const router = useRouter();

    // Código contable (2.1.1)
    const codigoCuenta = computed(() => route.params.codigo || '');

    // Nombre de la cuenta
    const nombreCuenta = computed(() => route.params.cuenta || '');

    const year = new Date().getFullYear();
    const fechaHoy = new Date().toLocaleDateString('es-ES');

    const ingresosEgresos = ref([]);
    const loading = ref(false);
    const error = ref(false);

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
          idIngresoEgreso: item.id_ingresos_egresos,
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

    const cargarMovimientos = async () => {
      loading.value = true;
      error.value = false;
      try {
       // console.log('[CAPILLA] cuenta (NOMBRE) enviada al backend:', nombreCuenta.value);

        const resp = await axios.post(
          'http://127.0.0.1:8000/cuentas/libro-diario/por-cuentaCA',
          {
            cuenta: nombreCuenta.value,
            year: year
          }
        );

       // console.log('[CAPILLA] Movimientos recibidos para', nombreCuenta.value, resp.data);
        ingresosEgresos.value = resp.data || [];
      } catch (e) {
        console.error('Error al cargar movimientos de la cuenta (Capilla):', e);
        error.value = true;
        ingresosEgresos.value = [];
      } finally {
        loading.value = false;
      }
    };

    const irAPartida = (idIngresoEgreso) => {
      router.push({ 
        name: 'Partidas',
        query: { id: idIngresoEgreso } 
      });
    };

    const generarPDF = () => {
      if (!ingresosEgresos.value.length) {
        console.warn('No hay movimientos para generar el PDF.');
        return;
      }

      const doc = new jsPDF('landscape');

      // Encabezado
      doc.setFontSize(16);
      doc.text('PROYECTO CAPILLA HOGAR SANTA LUISA', 148.5, 27, { align: 'center' });
      doc.rect(60, 17, 170, 15);

      doc.setFontSize(12);
      doc.text(
        'Dirección del Proyecto: 8va calle 5-21 zona 10, Quetzaltenango',
        20,
        40
      );

      const textoAdicional = 'REPORTE: LIBRO MAYOR - ESTADO DE MOVIMIENTOS POR CUENTA (CAPILLA)';
      doc.setFontSize(10);
      doc.text(textoAdicional, 20, 50);

      const especificacion = `CUENTA: ${nombreCuenta.value} | PERÍODO: Anual ${year}`;
      doc.text(especificacion, 20, 60);

      const columns = [
        { title: 'Conteo', dataKey: 'nomenclatura' },
        { title: 'Número de Documento', dataKey: 'numero_documento' },
        { title: 'Fecha', dataKey: 'fecha' },
        { title: 'Cuenta', dataKey: 'cuenta' },
        { title: 'Descripción', dataKey: 'descripcion' },
        { title: 'Acredita', dataKey: 'acredita' },
        { title: 'Debita', dataKey: 'debita' },
        { title: 'Saldo', dataKey: 'total' }
      ];

      const filas = ingresosEgresos.value.map((row) => {
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
        columns,         
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
          nomenclatura: { minCellWidth: 20, halign: 'left' },
          numero_documento: { minCellWidth: 30, halign: 'left' },
          fecha: { minCellWidth: 20, halign: 'left' },
          cuenta: { minCellWidth: 40, halign: 'left' },
          descripcion: { minCellWidth: 40, halign: 'left' },
          acredita: { minCellWidth: 20, halign: 'right' },
          debita: { minCellWidth: 20, halign: 'right' },
          total: { minCellWidth: 20, halign: 'right' }
        }
      });

      const blob = doc.output('blob');
      saveAs(blob, `libro_mayor_capilla_cuenta_${codigoCuenta.value}.pdf`);
    };

    const volver = () => {
      router.back();
    };

    onMounted(() => {
      cargarMovimientos();
    });

    return {
      codigoCuenta,
      nombreCuenta,
      year,
      fechaHoy,
      ingresosEgresos,
      tablaFormateada,
      loading,
      error,
      generarPDF,
      volver,
      irAPartida
    };
  }
};
</script>

