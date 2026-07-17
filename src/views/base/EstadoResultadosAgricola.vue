<template>
  <div class="page-wrapper">
    <div class="page-card">

      <!-- Encabezado -->
      <div class="module-header">
        <div>
          <h2 class="module-title module-title--upper">Estado de Resultados - Agrícola</h2>
          <p class="module-subtitle">
            Resumen de ingresos, egresos y saldos del proyecto agrícola por período.
          </p>
        </div>
      </div>

      <!-- Filtros -->
      <div class="section-container section-container--inline">
        <div class="field-group">
          <label class="field-label">Período de informe</label>
          <select v-model="selectedPeriodo" @change="actualizarMeses" class="field-control">
            <option disabled value="">Seleccione un período</option>
            <option v-for="periodo in periodos" :key="periodo" :value="periodo">{{ periodo }}</option>
          </select>
            <small v-if="fieldErrors.selectedPeriodo" class="error-text">{{ fieldErrors.selectedPeriodo }}</small>
        </div>

        <div class="field-group" v-if="selectedPeriodo !== 'Anual'">
          <label class="field-label">Mes</label>
          <select v-model="selectedMes" class="field-control">
            <option disabled value="">Seleccione un mes</option>
            <option v-for="mes in meses" :key="mes" :value="mes">{{ mes }}</option>
          </select>
          <small v-if="fieldErrors.selectedMes" class="error-text">{{ fieldErrors.selectedMes }}</small>
</div>

        <div class="field-group" v-if="selectedPeriodo !== 'Anual'">
          <label class="field-label">Año</label>
          <input type="number" v-model="selectedAnio" class="field-control" min="2000" max="2100" placeholder="Ej: 2026" />
          <small v-if="fieldErrors.selectedAnio" class="error-text">{{ fieldErrors.selectedAnio }}</small>
</div>

        <div class="field-group" v-if="selectedPeriodo === 'Anual'">
          <label class="field-label">Fecha Inicio</label>
          <input type="date" v-model="fechaInicio" class="field-control" />
          <small v-if="fieldErrors.fechaInicio" class="error-text">{{ fieldErrors.fechaInicio }}</small>
  </div>

        <div class="field-group" v-if="selectedPeriodo === 'Anual'">
          <label class="field-label">Fecha Fin</label>
          <input type="date" v-model="fechaFin" class="field-control" />
    <small v-if="fieldErrors.fechaFin" class="error-text">{{ fieldErrors.fechaFin }}</small>
        </div>
      </div>

      <!-- Botones -->
      <div class="form-actions">
        <button @click="mostrarTabla" class="btn btn-secondary">Vista previa</button>
        <button @click="generarPDF" class="btn btn-primary">Generar PDF</button>
        <button @click="limpiar" class="btn btn-ghost">Limpiar</button>
      </div>

      <!-- Encabezado visual del reporte -->
      <div v-if="reporteData" class="encabezado-container">
        <div class="encabezado-box">
          <div class="encabezado-titulo">
            ESTADO DE RESULTADOS {{ selectedPeriodo.toUpperCase() }} {{ currentYear }}
          </div>
        </div>
        <div class="encabezado-detalles">
          <div><strong>INFORME CORRESPONDIENTE AL:</strong> {{ periodoTexto }}</div>
          <div v-if="selectedPeriodo === 'Anual'">
            <strong>FECHAS SELECCIONADAS:</strong> {{ fechaInicio }} al {{ fechaFin }}
          </div>
          <div v-else><strong>AÑO:</strong> {{ selectedAnio }}</div>
          <div><strong>PROYECTO:</strong> PROYECTO AGRÍCOLA HOGAR SANTA LUISA</div>
          <div><strong>LUGAR:</strong> QUETZALTENANGO, GUATEMALA</div>
          <div><strong>FECHA:</strong> {{ fechaHoy }}</div>
        </div>
      </div>

      <!-- Tabla resumen -->
      <div v-if="reporteData" class="table-wrapper mt-3">
        <table class="data-table">
          <thead>
            <tr>
              <th>Cuenta</th>
              <th>Descripción</th>
              <th>Detalle</th>
              <th class="cell-right">Saldo suma</th>
              <th class="cell-right">Suma</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(fila, idx) in tablaPreview" :key="idx" :class="{ 'fila-resaltada': fila.tipo === 'heading' }">
              <td>
                <span v-if="fila.esCuenta && fila.cuenta" class="link-cuenta" @click="irDetalleCuenta(fila.cuenta, fila.col1)">
                  {{ fila.cuenta }}
                </span>
                <span v-else>{{ fila.cuenta || '' }}</span>
              </td>
              <template v-if="fila.tipo === 'heading'">
                <td class="text-bold">{{ fila.col1 }}</td>
                <td></td>
                <td class="cell-right text-bold">{{ fila.col3 || '' }}</td>
                <td class="cell-right text-bold">{{ fila.col4 || '' }}</td>
              </template>
              <template v-else>
                <td>{{ fila.col1 }}</td>
                <td>{{ fila.col2 }}</td>
                <td class="cell-right">{{ fila.col3 }}</td>
                <td class="cell-right">{{ fila.col4 }}</td>
              </template>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Sin datos -->
      <div v-else class="table-empty mt-3">
        No hay datos para mostrar.<br />
        Selecciona período y mes y presiona <strong>Vista previa</strong>.
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

    </div>
  </div>
</template>


<script>
import axios from 'axios';
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { useRouter } from 'vue-router';   
import { aplicarNumeracion } from '../../../utils/numeracion';
import '@/styles/global.css';
import '../../styles/css/GlobalAlertsModals.css';
import { manejarErrorRuta } from '../../../utils/manejarErrores.js';

export default {
  name: 'ReporteAgricolaFinal',          
  setup() {
    const router = useRouter();
    const mostrarModalExitoFormulario = ref(false);       
    const now = new Date();
    const currentYear = now.getFullYear();
    const fechaHoy = now.toLocaleDateString('es-ES');
    const selectedPeriodo = ref('');
    const selectedMes = ref('');
    const periodos = ['Mensual', 'Trimestral', 'Semestral', 'Anual'];
    const meses = ref([]);
    const selectedAnio = ref('');
    const fechaInicio = ref('');
    const fechaFin = ref('');
    const reporteData = ref(null);


    const fieldErrors = reactive({
      selectedPeriodo: '',
      selectedAnio: '',
      selectedMes: '',
      fechaInicio: '',
      fechaFin: ''
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

    const cerrarModalExitoFormulario = () => {
        mostrarModalExitoFormulario.value = false;
        limpiar(); 
    };

  const buildPayload = () => {
  const tipo = selectedPeriodo.value.toLowerCase();
  if (tipo === 'anual') {
    return {
      tipo: 'anual',
      fecha_inicio: fechaInicio.value || `${selectedAnio.value}-01-01`,
      fecha_fin: fechaFin.value || `${selectedAnio.value}-12-31`
    };
  }
  return {
    tipo,
    mes: selectedMes.value.toLowerCase(),
    anio: selectedAnio.value
  };
};


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
      fechaInicio.value = '';
      fechaFin.value = '';

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
      meses.value = [];
      selectedMes.value = '';
      fechaInicio.value = `${selectedAnio.value}-01-01`;
      fechaFin.value = `${selectedAnio.value}-12-31`;
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

    const validarFormulario = () => {
      let tieneErrores = false;

      // 1. Validar el campo obligatorio principal
      if (!selectedPeriodo.value) { 
        mostrarErrorCampo('selectedPeriodo', 'Falta por llenar datos'); 
        tieneErrores = true; 
      }

      // 2. Validar campos dinámicos según el período
      if (selectedPeriodo.value === 'Anual') {
        // Validar rango de fechas para el reporte anual
        if (!fechaInicio.value) { mostrarErrorCampo('fechaInicio', 'Falta por llenar datos'); tieneErrores = true; }
        if (!fechaFin.value) { mostrarErrorCampo('fechaFin', 'Falta por llenar datos'); tieneErrores = true; }
      } else if (selectedPeriodo.value) {
        // Validar Año y Mes para Mensual, Trimestral o Semestral
        if (!selectedAnio.value) { mostrarErrorCampo('selectedAnio', 'Falta por llenar datos'); tieneErrores = true; }
        if (!selectedMes.value) { mostrarErrorCampo('selectedMes', 'Falta por llenar datos'); tieneErrores = true; }
      }

      return !tieneErrores; // Retorna true si todo está bien
    };

    const mostrarTabla = async () => {
      if (!validarFormulario()) return;
      try {
    const response = await axios.post(
      'http://127.0.0.1:8000/in_eg/getReporteEstadoResultadosAG',
      buildPayload()
    );
        reporteData.value = response.data || null;
      } catch (error) {
        console.error('Error al obtener datos del reporte:', error);
        reporteData.value = null;
        manejarErrorRuta(error, router);
      }
    };

    const limpiar = () => {
      selectedPeriodo.value = '';
      selectedMes.value = '';
      meses.value = [];
      reporteData.value = null;
      selectedAnio.value = '';
      fechaInicio.value = '';
      fechaFin.value = '';
    };

    const generarPDF = async () => {
      if (!validarFormulario()) return;
    try {
    const response = await axios.post(
      'http://127.0.0.1:8000/in_eg/getReporteEstadoResultadosAG',
      buildPayload()
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
      `ESTADO DE RESULTADOS ${selectedPeriodo.value.toUpperCase()} ${selectedAnio.value}`,
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
    mostrarModalExitoFormulario.value = true;
  } catch (error) {
    console.error('Error al generar el PDF:', error);
    manejarErrorRuta(error, router);
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
      irDetalleCuenta,
      selectedAnio,
      fechaInicio,
      fechaFin,
      /////////////
      fieldErrors,
      cerrarModalExitoFormulario,
      mostrarModalExitoFormulario
    };
  }
};
</script>
