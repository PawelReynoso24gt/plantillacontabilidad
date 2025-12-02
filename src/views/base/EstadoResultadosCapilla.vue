<template>
  <div>
    <h1>Estado de Resultados - Agricola</h1>
  </div>

  <!-- Formulario -->
  <div class="nombre-fecha-container">
    <div class="id-inputs">
      <div class="select-group">
        <label>Período de informe</label>
        <select v-model="selectedPeriodo" @change="actualizarMeses">
          <option v-for="periodo in periodos" :key="periodo" :value="periodo">
            {{ periodo }}
          </option>
        </select>
      </div>

      <div class="select-group">
        <label>Mes</label>
        <select v-model="selectedMes">
          <option v-for="mes in meses" :key="mes" :value="mes">
            {{ mes }}
          </option>
        </select>
      </div>
    </div>
  </div>

  <!-- Botones -->
  <div style="margin-top: 20px;"></div>
  <button @click="generarPDF">Generar PDF</button>
  <button @click="mostrarTabla" class="espacio">Vista previa</button>
  <button @click="limpiar" class="espacio">Limpiar</button>

  <!-- Encabezado tipo PDF / vista previa -->
  <div v-if="reporteData" class="encabezado-container">
    <div class="encabezado-box">
      <div class="encabezado-titulo">
        REPORTE FINAL {{ selectedPeriodo.toUpperCase() }} {{ currentYear }}
      </div>
    </div>

    <div class="encabezado-detalles">
      <div>
        <strong>INFORME CORRESPONDIENTE AL:</strong>
        {{ periodoTexto }}
      </div>
      <div><strong>AÑO:</strong> {{ currentYear }}</div>
      <div>
        <strong>PROYECTO:</strong> PROYECTO AGRÍCOLA HOGAR SANTA LUISA
      </div>
      <div><strong>LUGAR:</strong> QUETZALTENANGO, GUATEMALA</div>
      <div><strong>FECHA:</strong> {{ fechaHoy }}</div>
    </div>
  </div>

  <!-- Tabla resumen -->
  <div v-if="reporteData" class="tabla-wrapper">
    <table class="tabla-libro">
      <thead>
        <tr>
          <th>Cuenta</th>
          <th>Descripción</th>
          <th>Detalle</th>
          <th class="right">Saldo suma</th>
          <th class="right">Suma</th>
        </tr>
      </thead>

      <tbody>
        <tr
          v-for="(fila, idx) in tablaPreview"
          :key="idx"
          :class="{ 'fila-resaltada': fila.tipo === 'heading' }"
        >
          <!-- Columna Cuenta (muestra código y manda código+nombre) -->
          <td class="right bold-text">
            <span
              v-if="fila.esCuenta && fila.cuenta"
              class="link-cuenta"
              @click="irDetalleCuenta(fila.cuenta, fila.col1)"  
            >
              {{ fila.cuenta }}  <!-- código: 2.1.1, etc. -->
            </span>
            <span v-else>
              {{ fila.cuenta || '' }}
            </span>
          </td>

          <!-- fila tipo heading (título/sección/gran total) -->
          <template v-if="fila.tipo === 'heading'">
            <td class="bold-text">{{ fila.col1 }}</td>
            <td></td>
            <td class="right bold-text">
              {{ fila.col3 || '' }}
            </td>
            <td class="right bold-text">
              {{ fila.col4 || '' }}
            </td>
          </template>

          <!-- fila normal -->
          <template v-else>
            <td>{{ fila.col1 }}</td>
            <td class="right">{{ fila.col3 }}</td>
            <td class="right">{{ fila.col4 }}</td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Mensaje si no hay datos todavía -->
  <div v-else class="sin-datos">
    No hay datos para mostrar. Selecciona período y mes y presiona "Vista previa".
  </div>
</template>

<script>
import axios from 'axios';
import { ref, computed } from 'vue';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { useRouter } from 'vue-router';
import { aplicarNumeracion } from '../../../utils/numeracion';

export default {
  name: 'ReporteAgricolaFinal',
  setup() {
    const router = useRouter();

    const selectedPeriodo = ref('');
    const selectedMes = ref('');
    const periodos = ['Mensual', 'Trimestral', 'Semestral', 'Anual'];
    const meses = ref([]);

    const reporteData = ref(null);

    const now = new Date();
    const currentYear = now.getFullYear();
    const fechaHoy = now.toLocaleDateString('es-ES');

    const periodoTexto = computed(() => {
      if (selectedPeriodo.value === 'Mensual') {
        return `RESUMEN DE ${selectedMes.value?.toUpperCase?.() || ''}`;
      } else if (selectedPeriodo.value === 'Trimestral') {
        const trimestre = {
          Enero: 'PRIMER TRIMESTRE',
          Abril: 'SEGUNDO TRIMESTRE',
          Julio: 'TERCER TRIMESTRE',
          Octubre: 'CUARTO TRIMESTRE'
        };
        return `RESUMEN ${trimestre[selectedMes.value] || ''}`;
      } else if (selectedPeriodo.value === 'Semestral') {
        return selectedMes.value === 'Enero'
          ? 'RESUMEN PRIMER SEMESTRE'
          : 'RESUMEN SEGUNDO SEMESTRE';
      } else if (selectedPeriodo.value === 'Anual') {
        return 'RESUMEN ANUAL';
      }
      return '';
    });

    const actualizarMeses = () => {
      switch (selectedPeriodo.value) {
        case 'Mensual':
          meses.value = [
            'Enero', 'Febrero', 'Marzo', 'Abril',
            'Mayo', 'Junio', 'Julio', 'Agosto',
            'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
          ];
          break;
        case 'Trimestral':
          meses.value = ['Enero', 'Abril', 'Julio', 'Octubre'];
          break;
        case 'Semestral':
          meses.value = ['Enero', 'Julio'];
          break;
        case 'Anual':
          meses.value = ['Enero'];
          selectedMes.value = 'Enero';
          break;
        default:
          meses.value = [];
      }
    };

    const parseNumber = (v) => {
      if (v === null || v === undefined || v === '') return 0;
      const s = String(v).replace(/,/g, '');
      const n = parseFloat(s);
      return isNaN(n) ? 0 : n;
    };

    const formatQ = (n) => {
      const num = parseNumber(n);
      return (
        'Q ' +
        num.toLocaleString('es-GT', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      );
    };

    const irDetalleCuenta = (codigoCuenta, nombreCuenta) => {
      router.push({
        name: 'ReporteCuentaAgricolaCuenta',
        params: {
          codigo: codigoCuenta,   // código contable
          cuenta: nombreCuenta    // nombre de la cuenta
        }
      });
    };

    const tablaPreview = computed(() => {
      if (!reporteData.value) return [];

      const d = reporteData.value;
      const rows = [];

      // SALDO INICIAL
      rows.push({
        tipo: 'heading',
        nivel: 1,
        col1: 'SALDO INICIAL',
        col2: '',
        col3: '',
        col4: formatQ(d.saldo_inicial)
      });

      rows.push({
        tipo: 'normal',
        nivel: 2,
        col1: 'SALDO INICIAL EN CAJA GENERAL',
        col2: '',
        col3: formatQ(d.saldo_inicial_caja),
        col4: ''
      });

      rows.push({
        tipo: 'normal',
        nivel: 2,
        col1: 'SALDO INICIAL EN BANCO',
        col2: '',
        col3: formatQ(d.saldo_inicial_bancos),
        col4: ''
      });

      // EGRESOS
      rows.push({
        tipo: 'heading',
        nivel: 1,
        col1: 'EGRESOS',
        col2: '',
        col3: '',
        col4: formatQ(d.total_general_egresos)
      });

      rows.push({
        tipo: 'normal',
        nivel: 2,
        col1: 'CAJA GENERAL',
        col2: '',
        col3: formatQ(d.total_egresos_caja),
        col4: ''
      });

      (d.data_caja || [])
        .filter((item) => parseNumber(item.egresos) > 0)
        .forEach((eg) => {
          rows.push({
            tipo: 'normal',
            nivel: 3,
            esCuenta: true,
            col1: eg.cuenta,             // nombre
            col2: formatQ(eg.egresos),
            col3: '',
            col4: ''
          });
        });

      rows.push({
        tipo: 'normal',
        nivel: 2,
        col1: 'BANCO',
        col2: '',
        col3: formatQ(d.total_egresos_bancos),
        col4: ''
      });

      (d.data_bancos || [])
        .filter((item) => parseNumber(item.egresos) > 0)
        .forEach((eg) => {
          rows.push({
            tipo: 'normal',
            nivel: 3,
            esCuenta: true,
            col1: eg.cuenta,
            col2: formatQ(eg.egresos),
            col3: '',
            col4: ''
          });
        });

      // SALDO FINAL
      rows.push({
        tipo: 'heading',
        nivel: 1,
        col1: 'SALDO FINAL',
        col2: '',
        col3: '',
        col4: formatQ(d.total_saldo_final)
      });

      rows.push({
        tipo: 'normal',
        nivel: 2,
        col1: 'SALDO FINAL EN CAJA GENERAL',
        col2: '',
        col3: formatQ(d.total_saldo_final_caja),
        col4: ''
      });

      rows.push({
        tipo: 'normal',
        nivel: 2,
        col1: 'SALDO FINAL EN BANCO',
        col2: '',
        col3: formatQ(d.total_saldo_final_bancos),
        col4: ''
      });

      // SUMAS IGUALES
      rows.push({
        tipo: 'heading',
        nivel: 1,
        col1: 'SUMAS IGUALES',
        col2: '',
        col3: formatQ(d.total_saldo_final),
        col4: formatQ(d.total_saldo_final)
      });

      // aplicarNumeracion agregará algo como fila.cuenta (1, 1.1, etc.)
      return aplicarNumeracion(rows);
    });

    const mostrarTabla = async () => {
      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/in_eg/getReporteEstadoResultadosAG',
          {
            tipo: selectedPeriodo.value.toLowerCase(),
            mes: selectedMes.value.toLowerCase()
          }
        );
        reporteData.value = response.data || null;
      } catch (error) {
        console.error('Error al obtener datos del reporte:', error);
        reporteData.value = null;
      }
    };

    const limpiar = () => {
      selectedPeriodo.value = '';
      selectedMes.value = '';
      meses.value = [];
      reporteData.value = null;
    };

    const generarPDF = async () => {
      // Aquí puedes usar tu lógica de PDF si la necesitas.
    };

    return {
      selectedPeriodo,
      selectedMes,
      periodos,
      meses,
      currentYear,
      fechaHoy,
      periodoTexto,
      tablaPreview,
      reporteData,
      actualizarMeses,
      mostrarTabla,
      limpiar,
      generarPDF,
      irDetalleCuenta
    };
  }
};
</script>

<style scoped>
/* mismo estilo que ya usabas */
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

.nombre-fecha-container {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  width: 100%;
}

.id-inputs {
  flex: 1;
  min-width: 260px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.select-group {
  flex: 1 1 140px;
  min-width: 140px;
}

label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  display: block;
}

select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #bbb;
  border-radius: 5px;
  box-sizing: border-box;
  font-size: 0.9rem;
  background-color: #fff;
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

/* Encabezado tipo PDF */
.encabezado-container {
  margin-top: 30px;
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

/* Tabla */
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

.sin-datos {
  margin-top: 30px;
  font-size: 0.9rem;
  color: #555;
  text-align: center;
  font-style: italic;
}

.link-cuenta {
  color: #0a53be;
  cursor: pointer;
  text-decoration: underline;
}

.link-cuenta:hover {
  color: #063a83;
}
</style>
