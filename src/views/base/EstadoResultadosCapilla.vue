<!--ESTADO DE RESULTADOS CAPILLA-->
<template>
  <div>
    <h1>Estado de Resultados - Capilla</h1>
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

    <!-- removed responsable/firmas inputs as requested -->
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
        <strong>PROYECTO:</strong> PROYECTO CAPILLA HOGAR SANTA LUISA
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
          <th>Descripción</th>
          <th>Detalle</th>
          <th class="right">Saldo suma</th>
          <th class="right">Suma</th>
        </tr>
      </thead>

      <tbody>
        <tr v-for="(fila, idx) in tablaPreview" :key="idx" :class="{ 'fila-resaltada': fila.tipo === 'heading' }">
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
            <td>{{ fila.col2 }}</td>
            <td class="right">{{ fila.col3 }}</td>
            <td class="right">{{ fila.col4 }}</td>
          </template>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Firmas removed per request -->

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

export default {
  name: 'ReporteCapillaFinal',
  setup() {
  // Form fields
    const selectedPeriodo = ref('');
    const selectedMes = ref('');
    const periodos = ['Mensual', 'Trimestral', 'Semestral', 'Anual'];
    const meses = ref([]);

    // Datos que regresa el backend cuando consultás
    const reporteData = ref(null);

    // Año y fecha actual
    const now = new Date();
    const currentYear = now.getFullYear();
    const fechaHoy = now.toLocaleDateString('es-ES');

    // Lógica de período -> texto humano (igual a tu PDF)
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

    // llenar <select> de Mes según Período
    const actualizarMeses = () => {
      switch (selectedPeriodo.value) {
        case 'Mensual':
          meses.value = [
            'Enero',
            'Febrero',
            'Marzo',
            'Abril',
            'Mayo',
            'Junio',
            'Julio',
            'Agosto',
            'Septiembre',
            'Octubre',
            'Noviembre',
            'Diciembre'
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

    // helper parse and formato dinero (maneja comas en strings)
    const parseNumber = (v) => {
      if (v === null || v === undefined || v === '') return 0;
      const s = String(v).replace(/,/g, '');
      const n = parseFloat(s);
      return isNaN(n) ? 0 : n;
    };

    const formatQ = (n) => {
      const num = parseNumber(n);
      if (num === 0 && (n === null || n === undefined || n === '' || String(n).trim() === '0' || String(n).trim() === '0.0')) {
        // return consistent empty for zero/empty when requested elsewhere; still show 0 as Q 0.00 when explicit
      }
      return (
        'Q ' +
        num.toLocaleString('es-GT', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      );
    };

    // Tabla que mostramos en pantalla: construida con reporteData (SOLO EGRESOS)
    const tablaPreview = computed(() => {
      if (!reporteData.value) return [];

      const d = reporteData.value;

      const rows = [];

      // SALDO INICIAL
      rows.push({ tipo: 'heading', col1: 'SALDO INICIAL', col2: '', col3: '', col4: formatQ(d.saldo_inicial) });
      rows.push({ tipo: 'normal', col1: 'SALDO INICIAL EN CAJA GENERAL', col2: '', col3: formatQ(d.saldo_inicial_caja), col4: '' });
      rows.push({ tipo: 'normal', col1: 'SALDO INICIAL EN BANCO', col2: '', col3: formatQ(d.saldo_inicial_bancos), col4: '' });

      // EGRESOS (solo cuentas con valor > 0)
      rows.push({ tipo: 'heading', col1: 'EGRESOS', col2: '', col3: '', col4: formatQ(d.total_general_egresos) });
      rows.push({ tipo: 'normal', col1: 'CAJA GENERAL', col2: '', col3: formatQ(d.total_egresos_caja), col4: '' });
      (d.data_caja || [])
        .filter((item) => parseNumber(item.egresos) > 0)
        .forEach((eg) => {
          rows.push({ tipo: 'normal', col1: eg.cuenta, col2: formatQ(eg.egresos), col3: '', col4: '' });
        });

      rows.push({ tipo: 'normal', col1: 'BANCO', col2: '', col3: formatQ(d.total_egresos_bancos), col4: '' });
      (d.data_bancos || [])
        .filter((item) => parseNumber(item.egresos) > 0)
        .forEach((eg) => {
          rows.push({ tipo: 'normal', col1: eg.cuenta, col2: formatQ(eg.egresos), col3: '', col4: '' });
        });

      // SALDO FINAL
      rows.push({ tipo: 'heading', col1: 'SALDO FINAL', col2: '', col3: '', col4: formatQ(d.total_saldo_final) });
      rows.push({ tipo: 'normal', col1: 'SALDO FINAL EN CAJA GENERAL', col2: '', col3: formatQ(d.total_saldo_final_caja), col4: '' });
      rows.push({ tipo: 'normal', col1: 'SALDO FINAL EN BANCO', col2: '', col3: formatQ(d.total_saldo_final_bancos), col4: '' });

      // SUMAS IGUALES
      rows.push({ tipo: 'heading', col1: 'SUMAS IGUALES', col2: '', col3: formatQ(d.total_saldo_final), col4: formatQ(d.total_saldo_final) });

      return rows;
    });

    const mostrarTabla = async () => {
      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/in_eg/getReporteEstadoResultadosCA',
          {
            tipo: selectedPeriodo.value.toLowerCase(),
            mes: selectedMes.value.toLowerCase(),
            // only tipo and mes required for this report
          }
        );

        reporteData.value = response.data || null;
      } catch (error) {
        console.error('Error al obtener datos del reporte:', error);
        reporteData.value = null;
      }
    };

    // Limpiar formulario y preview
    const limpiar = () => {
      selectedPeriodo.value = '';
      selectedMes.value = '';
      meses.value = [];
      reporteData.value = null;
    };

    // Generar PDF (tu lógica original con firmas)
    const generarPDF = async () => {
      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/in_eg/getReporteEstadoResultadosCA',
          {
            tipo: selectedPeriodo.value.toLowerCase(),
            mes: selectedMes.value.toLowerCase()
          }
        );
        const data = response.data;

  const doc = new jsPDF();
        let yOffset = 20;
        const pageHeight = doc.internal.pageSize.height;
        const pageMargin = 20;

        const addPageIfNeeded = () => {
          if (yOffset > pageHeight - pageMargin) {
            doc.addPage();
            yOffset = 20;
          }
        };

        const addTable = (head, body) => {
          doc.autoTable({
            head: [head],
            body: body,
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
          yOffset = doc.autoTable.previous.finalY + 10;
        };

  // Determinar texto de periodo (mismo que periodoTexto)
        let periodoTextoPDF;
        if (selectedPeriodo.value === 'Mensual') {
          periodoTextoPDF = `RESUMEN DE ${selectedMes.value.toUpperCase()}`;
        } else if (selectedPeriodo.value === 'Trimestral') {
          const trimestre = {
            Enero: 'PRIMER TRIMESTRE',
            Abril: 'SEGUNDO TRIMESTRE',
            Julio: 'TERCER TRIMESTRE',
            Octubre: 'CUARTO TRIMESTRE'
          };
          periodoTextoPDF = `RESUMEN ${trimestre[selectedMes.value] || ''
            }`;
        } else if (selectedPeriodo.value === 'Semestral') {
          periodoTextoPDF =
            selectedMes.value === 'Enero'
              ? 'RESUMEN PRIMER SEMESTRE'
              : 'RESUMEN SEGUNDO SEMESTRE';
        } else if (selectedPeriodo.value === 'Anual') {
          periodoTextoPDF = 'RESUMEN ANUAL';
        }

        // Encabezado
        doc.setFontSize(16);
        doc.text(
          `REPORTE FINAL ${selectedPeriodo.value.toUpperCase()} ${currentYear}`,
          105,
          27,
          { align: 'center' }
        );
        doc.setLineWidth(0.5);
        doc.line(60, 32, 150, 32);

        doc.setFontSize(12);
        yOffset = 40;
        doc.text(`INFORME CORRESPONDIENTE AL`, 20, 40);
        doc.text(periodoTextoPDF, 91, 40);
        doc.text(`DE`, 165, 40);
        doc.text(`${currentYear}`, 175, 40);
        doc.text(
          `PROYECTO CAPILLA HOGAR SANTA LUISA`,
          20,
          50
        );
        doc.text(`LUGAR:`, 130, 50);
        doc.text(`QUETZALTENANGO`, 155, 50);
        doc.text(`GUATEMALA`, 20, 60);
        doc.text(`FECHA:`, 130, 60);
        doc.text(fechaHoy, 160, 60);

        // Tabla (SOLO EGRESOS). Construimos filas solo con egresos > 0
        yOffset = 75;

        const parseNumber = (v) => {
          if (v === null || v === undefined || v === '') return 0;
          const s = String(v).replace(/,/g, '');
          const n = parseFloat(s);
          return isNaN(n) ? 0 : n;
        };

        const tableData = [];

        // SALDO INICIAL
        tableData.push(['SALDO INICIAL', '', '', formatQ(parseNumber(data.saldo_inicial))]);
        tableData.push(['SALDO INICIAL EN CAJA GENERAL', '', formatQ(parseNumber(data.saldo_inicial_caja)), '']);
        tableData.push(['SALDO INICIAL EN BANCO', '', formatQ(parseNumber(data.saldo_inicial_bancos)), '']);

        // EGRESOS - CAJA
        tableData.push(['EGRESOS', '', '', formatQ(parseNumber(data.total_general_egresos))]);
        tableData.push(['CAJA GENERAL', '', formatQ(parseNumber(data.total_egresos_caja)), '']);
        data.data_caja
          .filter((item) => parseNumber(item.egresos) > 0)
          .forEach((eg) => {
            tableData.push([eg.cuenta, formatQ(parseNumber(eg.egresos)), '', '']);
          });

        // EGRESOS - BANCOS
        tableData.push(['BANCO', '', formatQ(parseNumber(data.total_egresos_bancos)), '']);
        data.data_bancos
          .filter((item) => parseNumber(item.egresos) > 0)
          .forEach((eg) => {
            tableData.push([eg.cuenta, formatQ(parseNumber(eg.egresos)), '', '']);
          });

        // SALDO FINAL
        tableData.push(['SALDO FINAL', '', '', formatQ(parseNumber(data.total_saldo_final))]);
        tableData.push(['SALDO FINAL EN CAJA GENERAL', '', formatQ(parseNumber(data.total_saldo_final_caja)), '']);
        tableData.push(['SALDO FINAL EN BANCO', '', formatQ(parseNumber(data.total_saldo_final_bancos)), '']);

        // SUMAS IGUALES
        tableData.push(['SUMAS IGUALES', '', formatQ(parseNumber(data.total_saldo_final)), formatQ(parseNumber(data.total_saldo_final))]);

        const tableHeaders = ['Descripción', 'Detalle', 'Saldo suma', 'Suma'];
        addTable(tableHeaders, tableData);

        // (Se eliminaron las firmas de la versión PDF)

        const blob = doc.output('blob');
        saveAs(blob, 'informe_final_capilla.pdf');
      } catch (error) {
        console.error('Error al generar el PDF:', error);
      }
    };

    return {
      // formulario
      selectedPeriodo,
      selectedMes,
      periodos,
      meses,

      // derivados para UI
      currentYear,
      fechaHoy,
      periodoTexto,
      tablaPreview,

      // data del backend
      reporteData,

      // acciones
      actualizarMeses,
      mostrarTabla,
      limpiar,
      generarPDF
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

.division-container {
  border: 1px solid rgb(19, 19, 75);
  border-radius: 6px;
  padding: 12px 16px;
  margin-top: 10px;
  background-color: #fff;
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

.nombre-inputs {
  flex: 2;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.numero-input {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 200px;
}

label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  display: block;
}

input[type='text'],
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
  line-height: 1.2;
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

/* Firmas */
.firmas-wrapper {
  margin-top: 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: space-evenly;
  text-align: center;
  font-size: 0.8rem;
  color: #000;
}

.firma-col {
  min-width: 200px;
}

.firma-line {
  margin-bottom: 8px;
  font-size: 0.8rem;
  color: #000;
}

.firma-nombre {
  font-weight: 600;
}

.firma-cargo {
  font-size: 0.7rem;
  color: #333;
}

.sin-datos {
  margin-top: 30px;
  font-size: 0.9rem;
  color: #555;
  text-align: center;
  font-style: italic;
}
</style>
