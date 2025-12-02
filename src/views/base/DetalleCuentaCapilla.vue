<template>
  <div class="container">
    <!-- Encabezado -->
    <div class="encabezado-container">
      <div class="encabezado-box">
        <div class="encabezado-titulo">
          ESTADO DE MOVIMIENTOS - CUENTA {{ codigoCuenta }} (CAPILLA)
        </div>
      </div>

      <div class="encabezado-detalles">
        <div>
          <strong>CÓDIGO:</strong> {{ codigoCuenta }}
        </div>
        <div>
          <strong>CUENTA:</strong> {{ nombreCuenta }}
        </div>
        <div>
          <strong>PROYECTO:</strong> PROYECTO CAPILLA HOGAR SANTA LUISA
        </div>
        <div>
          <strong>PERÍODO:</strong> ANUAL {{ year }}
        </div>
        <div>
          <strong>FECHA REPORTE:</strong> {{ fechaHoy }}
        </div>
      </div>
    </div>

    <!-- Botones -->
    <div class="botones">
      <button @click="generarPDF">Generar PDF</button>
      <button class="espacio" @click="volver">Regresar</button>
    </div>

    <!-- Tabla de movimientos -->
    <div v-if="!loading && !error && tablaFormateada.length" class="tabla-wrapper">
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
              v-if="fila.cuenta === 'Saldo inicial' || fila.cuenta === 'Suma total'"
            >
              <td>{{ fila.nomenclatura }}</td>
              <td>{{ fila.numero_documento }}</td>
              <td>{{ fila.fecha || '' }}</td>
              <td class="bold-text">{{ fila.cuenta }}</td>
              <td class="descripcion-col bold-text">{{ fila.descripcion }}</td>
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

    <!-- Mensajes de estado -->
    <div v-if="loading" class="sin-datos">Cargando movimientos...</div>
    <div v-else-if="error" class="sin-datos error">
      Ocurrió un error al cargar los movimientos.
    </div>
    <div v-else-if="!tablaFormateada.length" class="sin-datos">
      No hay movimientos registrados para esta cuenta.
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';

export default {
  name: 'ReporteCuentaCapillaCuenta',
  setup() {
    const route = useRoute();
    const router = useRouter();

    // params que vienen desde EstadoResultadosCapilla
    const codigoCuenta = computed(() => route.params.codigo || '');
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
            cuenta: nombreCuenta.value, // backend busca por nombre de cuenta
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

    const generarPDF = () => {
      const doc = new jsPDF('landscape');

      // Encabezado
      doc.setFontSize(16);
      doc.text(
        `ESTADO DE MOVIMIENTOS - CUENTA ${codigoCuenta.value} (CAPILLA)`,
        148.5,
        20,
        { align: 'center' }
      );
      doc.rect(60, 12, 170, 15);

      doc.setFontSize(12);
      doc.text(`CUENTA: ${nombreCuenta.value}`, 20, 32);
      doc.text(
        `Dirección del Proyecto: 8va calle 5-21 zona 10, Quetzaltenango`,
        20,
        40
      );
      doc.text(`PERÍODO: ANUAL ${year}`, 20, 48);
      doc.text(`FECHA REPORTE: ${fechaHoy}`, 20, 56);

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

      const filas = ingresosEgresos.value.map((row) => {
        const total = row.total ? formatNumber(row.total) : '';

        if (row.cuenta === 'Saldo inicial' || row.cuenta === 'Suma total') {
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
        startY: 70,
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
      saveAs(blob, `libro_diario_capilla_cuenta_${codigoCuenta.value}.pdf`);
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
      volver
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
  margin-top: 10px;
  border: 1px solid #133;
  border-radius: 6px;
  background-color: #fff;
  padding: 16px;
}

.encabezado-box {
  border: 2px solid #133;
  border-radius: 4px;
  padding: 10px;
  text-align: center;
  max-width: 480px;
  margin: 0 auto 16px auto;
}

.encabezado-titulo {
  font-size: 1rem;
  font-weight: 600;
  color: #000;
}

.encabezado-detalles {
  font-size: 0.8rem;
  color: #000;
  line-height: 1.4;
  text-align: center;
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

.tabla-wrapper {
  width: 100%;
  overflow-x: auto;
  margin-top: 20px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #fff;
}

.tabla-libro {
  width: 100%;
  border-collapse: collapse;
  min-width: 600px;
  font-size: 0.8rem;
}

.tabla-libro thead th {
  background-color: rgb(41, 128, 185);
  color: #fff;
  text-align: center;
  padding: 8px;
  font-weight: 600;
  border: 1px solid #999;
  white-space: nowrap;
}

.tabla-libro tbody td {
  border: 1px solid #ccc;
  padding: 6px 8px;
  vertical-align: middle;
  text-align: center;
  word-break: break-word;
}

.tabla-libro tbody td.bold-text {
  font-weight: 600;
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
</style>
