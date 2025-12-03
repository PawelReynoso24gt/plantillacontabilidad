<template>
    <!-- Encabezado principal -->
      <div class="estado-header">
        <div>
          <h2 class="estado-title">Estado de Resultados - Agrícola</h2>
          <p class="estado-subtitle">
            Resumen de ingresos, egresos y saldos del proyecto agrícola por período.
          </p>
        </div>
      </div>

      <!-- Formulario de período / mes -->
      <div class="nombre-fecha-container">
        <div class="id-inputs">
          <div class="select-group">
            <label class="field-label">Período de informe</label>
            <select
              v-model="selectedPeriodo"
              @change="actualizarMeses"
              class="field-control"
            >
              <option disabled value="">Seleccione un período</option>
              <option
                v-for="periodo in periodos"
                :key="periodo"
                :value="periodo"
              >
                {{ periodo }}
              </option>
            </select>
          </div>

          <div class="select-group">
            <label class="field-label">Mes</label>
            <select v-model="selectedMes" class="field-control">
              <option disabled value="">Seleccione un mes</option>
              <option v-for="mes in meses" :key="mes" :value="mes">
                {{ mes }}
              </option>
            </select>
          </div>
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
        <button @click="limpiar" class="btn-ghost">
          Limpiar
        </button>
      </div>

      <!-- Encabezado tipo PDF / vista previa -->
      <div v-if="reporteData" class="encabezado-container">
        <div class="encabezado-box">
          <div class="encabezado-titulo">
            ESTADO DE RESULTADOS {{ selectedPeriodo.toUpperCase() }} {{ currentYear }}
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
              <!-- Columna de cuenta (clickeable si es cuenta) -->
              <td class="cuenta-col">
                <span
                  v-if="fila.esCuenta && fila.cuenta"
                  class="link-cuenta"
                  @click="irDetalleCuenta(fila.cuenta, fila.col1)"
                >
                  {{ fila.cuenta }}
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
                <td>{{ fila.col2 }}</td>
                <td class="right">{{ fila.col3 }}</td>
                <td class="right">{{ fila.col4 }}</td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mensaje si no hay datos todavía -->
      <div v-else class="sin-datos">
        No hay datos para mostrar.<br />
        Selecciona período y mes y presiona
        <span class="badge-ayuda">Vista previa</span>.
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
import '../../styles/css/EstadoResultadosAgricola.css'

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
          codigo: codigoCuenta,   
          cuenta: nombreCuenta    
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
            col1: eg.cuenta,
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

      return aplicarNumeracion(rows);
    });


    const mostrarTabla = async () => {
      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/in_eg/getReporteEstadoResultadosAG',
          {
            tipo: selectedPeriodo.value.toLowerCase(),
            mes: selectedMes.value.toLowerCase(),
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
  try {
    const response = await axios.post(
      'http://127.0.0.1:8000/in_eg/getReporteEstadoResultadosAG',
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

    // ---- Texto de periodo (igual que periodoTexto) ----
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
      periodoTextoPDF = `RESUMEN ${trimestre[selectedMes.value] || ''}`;
    } else if (selectedPeriodo.value === 'Semestral') {
      periodoTextoPDF =
        selectedMes.value === 'Enero'
          ? 'RESUMEN PRIMER SEMESTRE'
          : 'RESUMEN SEGUNDO SEMESTRE';
    } else if (selectedPeriodo.value === 'Anual') {
      periodoTextoPDF = 'RESUMEN ANUAL';
    }

    // ---------- ENCABEZADO PDF (AQUÍ CAMBIAMOS CAPILLA → AGRÍCOLA) ----------
    doc.setFontSize(16);
    doc.text(
      `ESTADO DE RESULTADOS ${selectedPeriodo.value.toUpperCase()} ${currentYear}`,
      105,
      27,
      { align: 'center' }
    );
    doc.setLineWidth(0.5);
    doc.line(40, 32, 170, 32);

    doc.setFontSize(12);
    yOffset = 40;
    doc.text(`INFORME CORRESPONDIENTE AL`, 20, 40);
    doc.text(periodoTextoPDF, 91, 40);
    doc.text(`DE`, 165, 40);
    doc.text(`${currentYear}`, 175, 40);

    // ⬇️ AQUÍ ESTABA EL TEXTO DE CAPILLA
    doc.text(
      `PROYECTO AGRÍCOLA HOGAR SANTA LUISA`,
      20,
      50
    );
    doc.text(`LUGAR:`, 130, 50);
    doc.text(`QUETZALTENANGO`, 155, 50);
    doc.text(`GUATEMALA`, 20, 60);
    doc.text(`FECHA:`, 130, 60);
    doc.text(fechaHoy, 160, 60);

    // ---------- TABLA ----------
    yOffset = 75;

    // (puedes eliminar esta redefinición si quieres, ya tienes parseNumber arriba)
    const parseNumberLocal = (v) => {
      if (v === null || v === undefined || v === '') return 0;
      const s = String(v).replace(/,/g, '');
      const n = parseFloat(s);
      return isNaN(n) ? 0 : n;
    };

    const tableData = [];

    // SALDO INICIAL
    tableData.push(['SALDO INICIAL', '', '', formatQ(parseNumberLocal(data.saldo_inicial))]);
    tableData.push(['SALDO INICIAL EN CAJA GENERAL', '', formatQ(parseNumberLocal(data.saldo_inicial_caja)), '']);
    tableData.push(['SALDO INICIAL EN BANCO', '', formatQ(parseNumberLocal(data.saldo_inicial_bancos)), '']);

    // EGRESOS - CAJA
    tableData.push(['EGRESOS', '', '', formatQ(parseNumberLocal(data.total_general_egresos))]);
    tableData.push(['CAJA GENERAL', '', formatQ(parseNumberLocal(data.total_egresos_caja)), '']);
    data.data_caja
      .filter((item) => parseNumberLocal(item.egresos) > 0)
      .forEach((eg) => {
        tableData.push([eg.cuenta, formatQ(parseNumberLocal(eg.egresos)), '', '']);
      });

    // EGRESOS - BANCOS
    tableData.push(['BANCO', '', formatQ(parseNumberLocal(data.total_egresos_bancos)), '']);
    data.data_bancos
      .filter((item) => parseNumberLocal(item.egresos) > 0)
      .forEach((eg) => {
        tableData.push([eg.cuenta, formatQ(parseNumberLocal(eg.egresos)), '', '']);
      });

    // SALDO FINAL
    tableData.push(['SALDO FINAL', '', '', formatQ(parseNumberLocal(data.total_saldo_final))]);
    tableData.push(['SALDO FINAL EN CAJA GENERAL', '', formatQ(parseNumberLocal(data.total_saldo_final_caja)), '']);
    tableData.push(['SALDO FINAL EN BANCO', '', formatQ(parseNumberLocal(data.total_saldo_final_bancos)), '']);

    // SUMAS IGUALES
    tableData.push([
      'SUMAS IGUALES',
      '',
      formatQ(parseNumberLocal(data.total_saldo_final)),
      formatQ(parseNumberLocal(data.total_saldo_final))
    ]);

    const tableHeaders = ['Descripción', 'Detalle', 'Saldo suma', 'Suma'];
    addTable(tableHeaders, tableData);

    const blob = doc.output('blob');

    // ⬇️ AQUÍ CAMBIAMOS EL NOMBRE DEL ARCHIVO
    saveAs(blob, 'estado_resultados_agricola.pdf');
  } catch (error) {
    console.error('Error al generar el PDF:', error);
  }
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
