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
import '../../styles/css/LibroDiarioA.css'; // ¡IMPORTANTE: Importar el mismo CSS!

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
        console.log('[CAPILLA] cuenta (NOMBRE) enviada al backend:', nombreCuenta.value);

        const resp = await axios.post(
          'http://127.0.0.1:8000/cuentas/libro-diario/por-cuenta',
          {
            cuenta: nombreCuenta.value,
            year: year
          }
        );

        console.log('[CAPILLA] Movimientos recibidos para', nombreCuenta.value, resp.data);
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

<style scoped>
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  border-radius: 8px;
  background-color: #fdfdfd;
  border: 1px solid #ccc;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
}

.encabezado-container {
  margin-top: 0.5rem;
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.encabezado-box {
  padding: 0.75rem 1rem;
  border-radius: 12px;
  background: #f7f7f7;
  border: 1px solid #e2e2e2;
}

.encabezado-titulo {
  font-size: 1rem;
  font-weight: 700;
  color: #292b57;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.encabezado-direccion {
  font-size: 0.85rem;
  color: #41251c;
  margin-top: 0.35rem;
}

.encabezado-detalles {
  font-size: 0.9rem;
  color: #080808;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

/* Tabla */
.tabla-wrapper {
  margin-top: 0.5rem;
  overflow-x: auto;
}

.tabla-libro {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
  background-color: #ffffff;
}

.tabla-libro thead {
  background: #292b57;
  color: #ffffff;
}

.tabla-libro th,
.tabla-libro td {
  padding: 0.45rem 0.5rem;
  border: 1px solid #dee2e6;
  text-align: left;
}

.tabla-libro th.right,
.tabla-libro td.right {
  text-align: right;
}

.descripcion-col {
  max-width: 320px;
  word-wrap: break-word;
}

/* Filas especiales */
.fila-resaltada {
  background-color: #f9f3e6;
}

.bold-text {
  font-weight: 700;
}

/* Sin datos */
.sin-datos {
  margin-top: 1rem;
  text-align: center;
  font-size: 0.95rem;
  color: #6c757d;
}

.badge-ayuda {
  display: inline-block;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  background: #bd9f69;
  color: #ffffff;
  font-size: 0.8rem;
}

/* Responsivo */
@media (max-width: 768px) {
  .libro-diario-card {
    padding: 1.5rem 1.25rem;
  }

  .libro-title {
    font-size: 1.5rem;
  }

  .encabezado-container {
    flex-direction: column;
  }
}

.botones {
  margin-top: 15px;
  margin-bottom: 10px;
}

button {
  padding: 10px 16px;
  background-color: #14491b;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
}

button:hover {
  background-color: #475f27;
}

.espacio {
  margin-left: 10px;
}

.right {
  text-align: right !important;
}

.fila-resaltada {
  background-color: #f3f6fa;
  font-weight: 600;
}

.descripcion-col {
  text-align: left;
}

.sin-datos {
  margin-top: 30px;
  font-size: 0.9rem;
  color: #555;
  text-align: center;
  font-style: italic;
}

.error {
  color: #b3261e;
}

/* Libro Mayor links */
.tabla-libro td.link-cuenta {
  color: #0a53be !important;
  cursor: pointer !important;
  text-decoration: underline !important;
  font-weight: 600;
}

.tabla-libro td.link-cuenta:hover {
  color: #063a83 !important;
}

.btn-primary,
.btn-secondary {
  border-radius: 999px;
  padding: 0.45rem 1.4rem;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease;
}

/* Generar PDF */
.btn-primary {
  background: #a0834e;
  color: #ffffff;
}
.btn-primary:hover {
  background: #bd9f69;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
  transform: translateY(-1px);
}

/* Vista previa */
.btn-secondary {
  background: #f7f7f7;
  color: #292b57;
  border: 1px solid #bd9f69;
}
.btn-secondary:hover {
  background: #ffffff;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.18);
  transform: translateY(-1px);
}
</style>
