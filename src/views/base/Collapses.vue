<template> 
      <!-- Encabezado principal -->
      <div class="reporte-header">
        <div>
          <h2 class="reporte-title">Ingresos y egresos - reporte final</h2>
          <p class="reporte-subtitle">
            Genera el resumen contable del proyecto agrícola por período.
          </p>
        </div>
      </div>

    <!-- Columna izquierda: período, año, mes o fechas -->
<div class="id-inputs">
  <div class="select-group">
    <label class="field-label">Período de informe</label>
    <select
      v-model="selectedPeriodo"
      @change="actualizarMeses"
      class="field-control"
    >
      <option disabled value="">Seleccione un período</option>
      <option v-for="periodo in periodos" :key="periodo" :value="periodo">
        {{ periodo }}
      </option>
    </select>
    <small v-if="fieldErrors.selectedPeriodo" class="error-text">{{ fieldErrors.selectedPeriodo }}</small>
  </div>

  <!-- Año: solo cuando sea Mensual / Trimestral / Semestral -->

  <div class="field-group" v-if="selectedPeriodo && selectedPeriodo !== 'Anual'">
    <label class="field-label">Año</label>
    <input
      type="number"
      v-model="selectedYear"
      class="field-control"
      placeholder="Ej: 2026"
      min="1900"
      max="2100"
    />
    <small v-if="fieldErrors.selectedYear" class="error-text">{{ fieldErrors.selectedYear }}</small>
  </div>

  <!--  Mes: solo si NO es anual -->
  <div class="select-group" v-if="selectedPeriodo && selectedPeriodo !== 'Anual'">
    <label class="field-label">Mes</label>
    <select v-model="selectedMes" class="field-control">
      <option disabled value="">Seleccione un mes</option>
      <option v-for="mes in meses" :key="mes" :value="mes">
        {{ mes }}
      </option>
    </select>
    <small v-if="fieldErrors.selectedMes" class="error-text">{{ fieldErrors.selectedMes }}</small>
  </div>

  <!--  Fechas: solo si es anual -->
  <div class="select-group" v-if="selectedPeriodo === 'Anual'">
    <label class="field-label">Fecha inicial</label>
    <input type="date" v-model="fechaInicio" class="field-control" />
    <small v-if="fieldErrors.fechaInicio" class="error-text">{{ fieldErrors.fechaInicio }}</small>
  </div>

  <div class="select-group" v-if="selectedPeriodo === 'Anual'">
    <label class="field-label">Fecha final</label>
    <input type="date" v-model="fechaFin" class="field-control" />
    <small v-if="fieldErrors.fechaFin" class="error-text">{{ fieldErrors.fechaFin }}</small>
  </div>

        <!-- Columna derecha: responsables -->
        <div class="nombre-inputs">
          <div class="numero-input">
            <label class="field-label">Contador</label>
            <input type="text" v-model="contador" class="field-control" />
            <small v-if="fieldErrors.contador" class="error-text">{{ fieldErrors.contador }}</small>
          </div>
          <div class="numero-input">
            <label class="field-label">Responsable de proyecto agrícola</label>
            <input
              type="text"
              v-model="responsableAgricola"
              class="field-control"
            />
            <small v-if="fieldErrors.responsableAgricola" class="error-text">{{ fieldErrors.responsableAgricola }}</small>
          </div>
          <div class="numero-input">
            <label class="field-label">Economa provincial</label>
            <input
              type="text"
              v-model="economaProvincial"
              class="field-control"
            />
            <small v-if="fieldErrors.economaProvincial" class="error-text">{{ fieldErrors.economaProvincial }}</small>
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

      <!-- Vista previa del informe (solo si ya hay datos) -->
      <ReportPreviewHeader
        v-if="reporteData"
        :empresa="`REPORTE FINAL ${selectedPeriodo.toUpperCase()} ${currentYear}`"
      >
        <div>
          <strong>INFORME CORRESPONDIENTE AL:</strong>
          {{ periodoTexto }}
        </div>
        <div v-if="selectedPeriodo !== 'Anual'">
          <strong>AÑO:</strong> <span class="rp-value">{{ selectedYear }}</span>
        </div>
        <div v-else>
          <strong>FECHAS SELECCIONADA:</strong>
          <span class="rp-value">{{ fechaInicio }}</span> a
          <span class="rp-value">{{ fechaFin }}</span>
        </div>
        <div><strong>PROYECTO:</strong> AGRÍCOLA HOGAR SANTA LUISA</div>
        <div><strong>LUGAR:</strong> QUETZALTENANGO, GUATEMALA</div>
        <div>
          <strong>FECHA DE CREACIÓN:</strong> {{ fechaHoy }}
        </div>
      </ReportPreviewHeader>

      <!-- Tabla principal (preview en pantalla) -->
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
            <tr v-for="(fila, idx) in tablaPreview" :key="idx">
              <!-- Encabezados de sección -->
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

              <!-- Filas normales -->
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

      <!-- Bloque de firmas / responsables -->
      <div v-if="reporteData" class="firmas-wrapper">
        <div class="firma-col">
          <div class="firma-line">(f) _____________________________</div>
          <div class="firma-nombre">
            {{ reporteData.contador || contador }}
          </div>
          <div class="firma-cargo">Contador</div>
        </div>

        <div class="firma-col">
          <div class="firma-line">(f) _____________________________</div>
          <div class="firma-nombre">
            Vo.Bo. {{ reporteData.responsable || responsableAgricola }}
          </div>
          <div class="firma-cargo">Responsable de Proyecto Agrícola</div>
        </div>

        <div class="firma-col firma-centro">
          <div class="firma-line">(f) _____________________________</div>
          <div class="firma-nombre">
            {{ reporteData.economa || economaProvincial }}
          </div>
          <div class="firma-cargo">Economa provincial</div>
        </div>
      </div>

      <!-- Mensaje cuando aún no se ha pedido nada -->
      <div v-else class="sin-datos">
        No hay datos para mostrar.<br />
        Selecciona período, fechas o mes, y responsables y presiona
        <span class="badge-ayuda">Vista previa</span>.
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
import axios from 'axios';
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue';
import { saveAs } from 'file-saver';
import { buildReportPdf } from '@/pdf/PdfReportBuilder';
import { formatCurrency } from '@/pdf/format';
import ReportPreviewHeader from '@/components/ReportPreviewHeader.vue';
import '../../styles/css/IngresosyEgresosA.css'
import '../../styles/css/GlobalAlertsModals.css';
import { useRouter } from 'vue-router'; // para redirección de rutas
import { manejarErrorRuta } from '../../../utils/manejarErrores.js';

export default {
  name: 'ReporteAG',
  components: { ReportPreviewHeader },
  setup() {
    const router = useRouter();
    const mostrarModalExitoFormulario = ref(false);
    const contador = ref('');
    const responsableAgricola = ref('');
    const economaProvincial = ref('');
    const selectedPeriodo = ref('');
    const selectedMes = ref('');
    const periodos = ['Mensual', 'Trimestral', 'Semestral', 'Anual'];
    const meses = ref([]);
    const selectedYear = ref('');
    const years = ref([]);
    const fechaInicio = ref('');
    const fechaFin = ref('');
    const reporteData = ref(null);

    const fieldErrors = reactive({
      selectedPeriodo: '',
      selectedYear: '',
      selectedMes: '',
      fechaInicio: '',
      fechaFin: '',
      contador: '',
      responsableAgricola: '',
      economaProvincial: '',
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

    const generarAnios = () => {
      const actual = new Date().getFullYear();
      years.value = [];
      for (let y = actual; y >= 2020; y--) {
        years.value.push(y);
      }
    };
    generarAnios();

  const construirPayload = () => {
    const tipo = selectedPeriodo.value.toLowerCase();

    const base = {
      tipo,
      contador: contador.value,
      responsable: responsableAgricola.value,
      economa: economaProvincial.value
    };

    if (selectedPeriodo.value === 'Anual') {
      return {
        ...base,
        fecha_inicial: fechaInicio.value,
        fecha_final: fechaFin.value
      };
    }

    return {
      ...base,
      anio: selectedYear.value,
      mes: selectedMes.value.toLowerCase()
    };
  };

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
      meses.value = [];
      selectedMes.value = '';
      break;
        default:
          meses.value = [];
      }
    };

    const tablaPreview = computed(() => {
      if (!reporteData.value) return [];

      const d = reporteData.value;

     
      const rows = [
        {
          tipo: 'heading',
          col1: 'SALDO INICIAL',
          col2: '',
          col3: '',
          col4: formatCurrency(d.saldo_inicial)
        },
        {
          tipo: 'normal',
          col1: 'SALDO INICIAL EN CAJA GENERAL',
          col2: '',
          col3: formatCurrency(d.saldo_inicial_caja),
          col4: ''
        },
        {
          tipo: 'normal',
          col1: 'SALDO INICIAL EN BANCO',
          col2: '',
          col3: formatCurrency(d.saldo_inicial_bancos),
          col4: ''
        },

       
        {
          tipo: 'heading',
          col1: 'INGRESOS',
          col2: '',
          col3: '',
          col4: formatCurrency(d.total_general_ingresos)
        },
        {
          tipo: 'normal',
          col1: 'CAJA GENERAL',
          col2: '',
          col3: formatCurrency(d.total_ingresos_caja),
          col4: ''
        },
      
        ...d.data_caja
          .filter(
            (item) => item.ingresos && parseFloat(item.ingresos) > 0
          )
          .map((ingreso) => ({
            tipo: 'normal',
            col1: ingreso.cuenta,
            col2: formatCurrency(ingreso.ingresos),
            col3: '',
            col4: ''
          })),
        {
          tipo: 'normal',
          col1: 'BANCO',
          col2: '',
          col3: formatCurrency(d.total_ingresos_bancos),
          col4: ''
        },
        
        ...d.data_bancos
          .filter(
            (item) => item.ingresos && parseFloat(item.ingresos) > 0
          )
          .map((ingreso) => ({
            tipo: 'normal',
            col1: ingreso.cuenta,
            col2: formatCurrency(ingreso.ingresos),
            col3: '',
            col4: ''
          })),

     
        {
          tipo: 'heading',
          col1: 'EGRESOS',
          col2: '',
          col3: '',
          col4: formatCurrency(d.total_general_egresos)
        },
        {
          tipo: 'normal',
          col1: 'CAJA GENERAL',
          col2: '',
          col3: formatCurrency(d.total_egresos_caja),
          col4: ''
        },
        ...d.data_caja
          .filter(
            (item) => item.egresos && parseFloat(item.egresos) > 0
          )
          .map((egreso) => ({
            tipo: 'normal',
            col1: egreso.cuenta,
            col2: formatCurrency(egreso.egresos),
            col3: '',
            col4: ''
          })),
        {
          tipo: 'normal',
          col1: 'BANCO',
          col2: '',
          col3: formatCurrency(d.total_egresos_bancos),
          col4: ''
        },
        ...d.data_bancos
          .filter(
            (item) => item.egresos && parseFloat(item.egresos) > 0
          )
          .map((egreso) => ({
            tipo: 'normal',
            col1: egreso.cuenta,
            col2: formatCurrency(egreso.egresos),
            col3: '',
            col4: ''
          })),
        {
          tipo: 'heading',
          col1: 'SALDO FINAL',
          col2: '',
          col3: '',
          col4: formatCurrency(d.total_saldo_final)
        },
        {
          tipo: 'normal',
          col1: 'SALDO FINAL EN CAJA GENERAL',
          col2: '',
          col3: formatCurrency(d.total_saldo_final_caja),
          col4: ''
        },
        {
          tipo: 'normal',
          col1: 'SALDO FINAL EN BANCO',
          col2: '',
          col3: formatCurrency(d.total_saldo_final_bancos),
          col4: ''
        },
        {
          tipo: 'heading',
          col1: 'SUMAS IGUALES',
          col2: '',
          col3: formatCurrency(d.total_saldo_final),
          col4: formatCurrency(d.total_saldo_final)
        }
      ];

      return rows;
    });

    const limpiar = () => {
      selectedPeriodo.value = '';
      selectedMes.value = '';
      contador.value = '';
      responsableAgricola.value = '';
      economaProvincial.value = '';
      meses.value = [];
      reporteData.value = null;
      selectedYear.value = '';
      fechaInicio.value = '';
      fechaFin.value = '';

    };

    const validarFormulario = () => {
      let tieneErrores = false;

      // 1. Validar campos que SIEMPRE están visibles
      if (!selectedPeriodo.value) { mostrarErrorCampo('selectedPeriodo', 'Falta por llenar datos'); tieneErrores = true; }
      if (!contador.value) { mostrarErrorCampo('contador', 'Falta por llenar datos'); tieneErrores = true; }
      if (!responsableAgricola.value) { mostrarErrorCampo('responsableAgricola', 'Falta por llenar datos'); tieneErrores = true; }
      if (!economaProvincial.value) { mostrarErrorCampo('economaProvincial', 'Falta por llenar datos'); tieneErrores = true; }

      // 2. Validar campos dinámicos según el período
      if (selectedPeriodo.value === 'Anual') {
        if (!fechaInicio.value) { mostrarErrorCampo('fechaInicio', 'Falta por llenar datos'); tieneErrores = true; }
        if (!fechaFin.value) { mostrarErrorCampo('fechaFin', 'Falta por llenar datos'); tieneErrores = true; }
      } else if (selectedPeriodo.value) {
        // Para Mensual, Trimestral o Semestral
        if (!selectedYear.value) { mostrarErrorCampo('selectedYear', 'Falta por llenar datos'); tieneErrores = true; }
        if (!selectedMes.value) { mostrarErrorCampo('selectedMes', 'Falta por llenar datos'); tieneErrores = true; }
      }

      return !tieneErrores; // Retorna true si todo está bien, false si hay errores
    };

    const mostrarTabla = async () => {
      if (!validarFormulario()) return;
    try {
      const payload = construirPayload();

      const response = await axios.post(
        'http://127.0.0.1:8000/in_eg/reporteFinalAG',
        payload
      );

      reporteData.value = response.data || null;
    } catch (error) {
      console.error('Error al obtener datos del reporte:', error);
      reporteData.value = null;
      manejarErrorRuta(error, router);
    }
  };

    const generarPDF = async () => {
      if (!validarFormulario()) return;
      try {
         const payload = construirPayload();
        const response = await axios.post(
          'http://127.0.0.1:8000/in_eg/reporteFinalAG',
          payload
        );

        const data = response.data;

        let periodoTextoPDF = '';
        if (selectedPeriodo.value === 'Mensual') {
          periodoTextoPDF = `RESUMEN DE ${selectedMes.value.toUpperCase()}`;
        } else if (selectedPeriodo.value === 'Trimestral') {
          const trimestre = {
            Enero: 'PRIMER TRIMESTRE',
            Abril: 'SEGUNDO TRIMESTRE',
            Julio: 'TERCER TRIMESTRE',
            Octubre: 'CUARTO TRIMESTRE'
          };
          periodoTextoPDF = `RESUMEN ${
            trimestre[selectedMes.value] || ''
          }`;
        } else if (selectedPeriodo.value === 'Semestral') {
          periodoTextoPDF =
            selectedMes.value === 'Enero'
              ? 'RESUMEN PRIMER SEMESTRE'
              : 'RESUMEN SEGUNDO SEMESTRE';
        } else if (selectedPeriodo.value === 'Anual') {
          periodoTextoPDF = 'RESUMEN ANUAL';
        }

        const metadata = {
          empresa: 'PROYECTO AGRÍCOLA HOGAR SANTA LUISA',
          direccion: 'QUETZALTENANGO, GUATEMALA',
          tipoReporte:
            selectedPeriodo.value === 'Anual'
              ? 'REPORTE FINAL ANUAL'
              : `REPORTE FINAL ${selectedPeriodo.value.toUpperCase()} ${selectedYear.value}`,
          especificacion: [
            `Informe correspondiente al ${periodoTextoPDF}`,
            `Fecha: ${fechaHoy}`
          ]
        };

        const columns = [
          { header: 'Descripción', dataKey: 'descripcion', align: 'left' },
          { header: 'Detalle', dataKey: 'detalle', type: 'currency' },
          { header: 'Saldo suma', dataKey: 'saldo_suma', type: 'currency' },
          { header: 'Suma', dataKey: 'suma', type: 'currency' }
        ];

        const rows = [];
        const pushRow = (descripcion, detalle, saldo_suma, suma, highlight = false) => {
          rows.push({ descripcion, detalle, saldo_suma, suma, ...(highlight ? { _variant: 'highlight' } : {}) });
        };

        pushRow('SALDO INICIAL', '', '', formatCurrency(data.saldo_inicial), true);
        pushRow('SALDO INICIAL EN CAJA GENERAL', '', formatCurrency(data.saldo_inicial_caja), '');
        pushRow('SALDO INICIAL EN BANCO', '', formatCurrency(data.saldo_inicial_bancos), '');

        pushRow('INGRESOS', '', '', formatCurrency(data.total_general_ingresos), true);
        pushRow('CAJA GENERAL', '', formatCurrency(data.total_ingresos_caja), '');
        data.data_caja
          .filter((item) => item.ingresos && parseFloat(item.ingresos) > 0)
          .forEach((ingreso) => pushRow(ingreso.cuenta, formatCurrency(ingreso.ingresos), '', ''));
        pushRow('BANCO', '', formatCurrency(data.total_ingresos_bancos), '');
        data.data_bancos
          .filter((item) => item.ingresos && parseFloat(item.ingresos) > 0)
          .forEach((ingreso) => pushRow(ingreso.cuenta, formatCurrency(ingreso.ingresos), '', ''));

        pushRow('EGRESOS', '', '', formatCurrency(data.total_general_egresos), true);
        pushRow('CAJA GENERAL', '', formatCurrency(data.total_egresos_caja), '');
        data.data_caja
          .filter((item) => item.egresos && parseFloat(item.egresos) > 0)
          .forEach((egreso) => pushRow(egreso.cuenta, formatCurrency(egreso.egresos), '', ''));
        pushRow('BANCO', '', formatCurrency(data.total_egresos_bancos), '');
        data.data_bancos
          .filter((item) => item.egresos && parseFloat(item.egresos) > 0)
          .forEach((egreso) => pushRow(egreso.cuenta, formatCurrency(egreso.egresos), '', ''));

        pushRow('SALDO FINAL', '', '', formatCurrency(data.total_saldo_final), true);
        pushRow('SALDO FINAL EN CAJA GENERAL', '', formatCurrency(data.total_saldo_final_caja), '');
        pushRow('SALDO FINAL EN BANCO', '', formatCurrency(data.total_saldo_final_bancos), '');
        pushRow('SUMAS IGUALES', '', formatCurrency(data.total_saldo_final), formatCurrency(data.total_saldo_final), true);

        const doc = buildReportPdf({ orientation: 'portrait', metadata, columns, rows });

        // Firmas
        let yOffset = doc.lastAutoTable.finalY + 15;
        const pageHeight = doc.internal.pageSize.height;
        const pageMargin = 20;
        const addPageIfNeeded = () => {
          if (yOffset > pageHeight - pageMargin) {
            doc.addPage();
            yOffset = 20;
          }
        };

        doc.setFontSize(10);
        addPageIfNeeded();
        doc.text('Hecho por:', 20, yOffset);
        doc.text('Revisado por:', 140, yOffset);
        yOffset += 15;
        addPageIfNeeded();
        doc.text('(f)_____________________________', 20, yOffset);
        doc.text('(f)_____________________________', 120, yOffset);
        yOffset += 5;
        addPageIfNeeded();
        doc.text(data.contador, 25, yOffset);
        doc.text('Contador', 40, yOffset + 5);
        doc.text('Vo.Bo. ' + data.responsable, 125, yOffset);
        doc.text(
          'Responsable de Proyecto Agricola',
          125,
          yOffset + 5
        );
        yOffset += 40;
        addPageIfNeeded();
        doc.text('(f)__________________________________', 65, yOffset);
        yOffset += 4;
        addPageIfNeeded();
        doc.text(data.economa, 75, yOffset);
        doc.text('Economa provincial', 85, yOffset + 5);

        const blob = doc.output('blob');
        saveAs(blob, 'reporte_final_agrícola.pdf');
        mostrarModalExitoFormulario.value = true;
      } catch (error) {
        console.error('Error al generar el PDF:', error);
        manejarErrorRuta(error, router);
      }
    };

    return {
      contador,
      responsableAgricola,
      economaProvincial,
      selectedPeriodo,
      selectedMes,
      periodos,
      meses,
      selectedYear,
      years,
      fechaInicio,
      fechaFin,
      reporteData,
      currentYear,
      fechaHoy,
      periodoTexto,
      tablaPreview,
      actualizarMeses,
      limpiar,
      mostrarTabla,
      generarPDF,
      /////////////
      fieldErrors,
      cerrarModalExitoFormulario,
      mostrarModalExitoFormulario
    };
  }
};
</script>

