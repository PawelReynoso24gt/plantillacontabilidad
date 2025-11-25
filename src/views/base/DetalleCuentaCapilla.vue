<template>
  <div class="container">
    <!-- Encabezado -->
    <div class="encabezado-container">
      <div class="encabezado-box">
        <div class="encabezado-titulo">
          ESTADO DE MOVIMIENTOS - CAPILLA
        </div>
      </div>

      <div class="encabezado-detalles">
        <div>
          <strong>CUENTA:</strong> {{ cuenta }}
        </div>
        <div>
          <strong>PROYECTO:</strong> PROYECTO CAPILLA HOGAR SANTA LUISA
        </div>
        <div>
          <strong>LUGAR:</strong> QUETZALTENANGO, GUATEMALA
        </div>
        <div>
          <strong>FECHA:</strong> {{ fechaHoy }}
        </div>
      </div>
    </div>

    <!-- Botones -->
    <div class="botones">
      <button @click="generarPDF">Generar PDF</button>
      <button class="espacio" @click="volver">Regresar</button>
    </div>

    <!-- Tabla de movimientos -->
    <div v-if="!loading && !error && movimientos.length" class="tabla-wrapper">
      <table class="tabla-libro">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Descripción</th>
            <th class="right">Ingreso</th>
            <th class="right">Egreso</th>
            <th class="right">Saldo</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(mov, idx) in movimientosConSaldo" :key="idx">
            <td>{{ mov.fecha }}</td>
            <td>{{ mov.descripcion }}</td>
            <td class="right">{{ mov.ingreso ? formatQ(mov.ingreso) : '' }}</td>
            <td class="right">{{ mov.egreso ? formatQ(mov.egreso) : '' }}</td>
            <td class="right">{{ formatQ(mov.saldo) }}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr class="fila-resaltada">
            <td colspan="2" class="bold-text">TOTALES</td>
            <td class="right bold-text">{{ formatQ(totalIngresos) }}</td>
            <td class="right bold-text">{{ formatQ(totalEgresos) }}</td>
            <td class="right bold-text">{{ formatQ(saldoFinal) }}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- Mensajes de estado -->
    <div v-if="loading" class="sin-datos">Cargando movimientos...</div>
    <div v-else-if="error" class="sin-datos error">
      Ocurrió un error al cargar los movimientos.
    </div>
    <div v-else-if="!movimientos.length" class="sin-datos">
      No hay movimientos registrados para esta cuenta.
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import '../../styles/css/DetalleCu.css'

export default {
  name: 'ReporteCuentaCapillaCuenta',
  setup() {
    const route = useRoute();
    const router = useRouter();

    // Cuenta viene desde la URL: /capilla/cuenta/:cuenta
    const cuenta = computed(() => route.params.cuenta || '');

    const movimientos = ref([]);
    const loading = ref(false);
    const error = ref(false);

    const now = new Date();
    const fechaHoy = now.toLocaleDateString('es-ES');

    const formatQ = (n) => {
      if (n === null || n === undefined || n === '') return '';
      const num = parseFloat(String(n).replace(/,/g, ''));
      if (isNaN(num)) return '';
      return (
        'Q ' +
        num.toLocaleString('es-GT', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      );
    };

    // Agregar saldo acumulado
    const movimientosConSaldo = computed(() => {
      let saldo = 0;
      return movimientos.value.map((m) => {
        const ingreso = parseFloat(m.ingreso || 0);
        const egreso = parseFloat(m.egreso || 0);
        saldo += ingreso - egreso;

        return {
          ...m,
          ingreso,
          egreso,
          saldo
        };
      });
    });

    const totalIngresos = computed(() =>
      movimientosConSaldo.value.reduce((acc, m) => acc + (m.ingreso || 0), 0)
    );

    const totalEgresos = computed(() =>
      movimientosConSaldo.value.reduce((acc, m) => acc + (m.egreso || 0), 0)
    );

    const saldoFinal = computed(
      () => totalIngresos.value - totalEgresos.value
    );

    const cargarMovimientos = async () => {
      loading.value = true;
      error.value = false;
      try {
        // 🔴 Ajusta este endpoint y payload a tu backend real
        const resp = await axios.post(
          'http://127.0.0.1:8000/in_eg/reporteMovimientosCuentaCA',
          {
            cuenta: cuenta.value
          }
        );

        // Se asume que resp.data es un array de:
        // [{ fecha: '2025-01-01', descripcion: '...', ingreso: 100, egreso: 0 }, ...]
        movimientos.value = resp.data || [];
      } catch (e) {
        console.error('Error al cargar movimientos de la cuenta:', e);
        error.value = true;
      } finally {
        loading.value = false;
      }
    };

    const generarPDF = () => {
      const doc = new jsPDF();
      let yOffset = 20;

      // Título
      doc.setFontSize(14);
      doc.text(
        `ESTADO DE MOVIMIENTOS - CUENTA ${cuenta.value}`,
        105,
        yOffset,
        {
          align: 'center'
        }
      );
      yOffset += 8;
      doc.setLineWidth(0.5);
      doc.line(40, yOffset, 170, yOffset);

      // Datos de encabezado
      yOffset += 10;
      doc.setFontSize(10);
      doc.text(`PROYECTO CAPILLA HOGAR SANTA LUISA`, 20, yOffset);
      yOffset += 5;
      doc.text(`LUGAR: QUETZALTENANGO, GUATEMALA`, 20, yOffset);
      yOffset += 5;
      doc.text(`FECHA: ${fechaHoy}`, 20, yOffset);

      // Tabla
      yOffset += 10;

      const tableBody = movimientosConSaldo.value.map((m) => [
        m.fecha,
        m.descripcion,
        m.ingreso ? formatQ(m.ingreso) : '',
        m.egreso ? formatQ(m.egreso) : '',
        formatQ(m.saldo)
      ]);

      tableBody.push([
        'TOTALES',
        '',
        formatQ(totalIngresos.value),
        formatQ(totalEgresos.value),
        formatQ(saldoFinal.value)
      ]);

      doc.autoTable({
        head: [['Fecha', 'Descripción', 'Ingreso', 'Egreso', 'Saldo']],
        body: tableBody,
        startY: yOffset,
        theme: 'grid',
        styles: {
          cellPadding: 2.5,
          fontSize: 8,
          halign: 'center',
          valign: 'middle',
          overflow: 'linebreak'
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255]
        }
      });

      const blob = doc.output('blob');
      saveAs(blob, `movimientos_cuenta_${cuenta.value}.pdf`);
    };

    const volver = () => {
      router.back();
    };

    onMounted(() => {
      cargarMovimientos();
    });

    return {
      cuenta,
      fechaHoy,
      movimientos,
      movimientosConSaldo,
      totalIngresos,
      totalEgresos,
      saldoFinal,
      loading,
      error,
      formatQ,
      generarPDF,
      volver
    };
  }
};
</script>


