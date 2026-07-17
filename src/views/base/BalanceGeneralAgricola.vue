<template>
  <div class="balance-agricola-page">
  <!-- Título principal -->
  <div class="reporte-header">
    <h2 class="reporte-title">Balance General - Agrícola</h2>
    <p class="reporte-subtitle">
      Resumen de saldos, ingresos y egresos del período seleccionado.
    </p>
  </div>

  <!-- Filtros / encabezado del form -->
  <div class="division-container">
    <!-- Filtros / encabezado del form -->
    <div class="nombre-fecha-container">
      <div class="id-inputs">
        <div class="select-group">
          <label>Período de informe</label>
          <select v-model="selectedPeriodo" @change="actualizarMeses">
            <option
              v-for="periodo in periodos"
              :key="periodo"
              :value="periodo"
            >
              {{ periodo }}
            </option>
          </select>
          <small v-if="fieldErrors.selectedPeriodo" class="error-text">{{ fieldErrors.selectedPeriodo }}</small>
        </div>

        <div class="select-group" v-if="selectedPeriodo !== 'Anual'">
        <label>Mes</label>
        <select v-model="selectedMes">
          <option v-for="mes in meses" :key="mes" :value="mes">
            {{ mes }}
          </option>
        </select>
        <small v-if="fieldErrors.selectedMes" class="error-text">{{ fieldErrors.selectedMes }}</small>
      </div>

       <div class="select-group" v-if="selectedPeriodo !== 'Anual'">
        <label>Año</label>
        <input
          type="number"
          v-model="selectedYear"
          :max="currentYear"
          min="2000"
          placeholder="Ej: 2025"
        />
        <small v-if="fieldErrors.selectedYear" class="error-text">{{ fieldErrors.selectedYear }}</small>
      </div>
    
       <div class="select-group" v-if="selectedPeriodo === 'Anual'">
        <label>Fecha inicial</label>
        <input type="date" v-model="fechaInicio" />
        <small v-if="fieldErrors.fechaInicio" class="error-text">{{ fieldErrors.fechaInicio }}</small>
      </div>

      <div class="select-group" v-if="selectedPeriodo === 'Anual'">
        <label>Fecha final</label>
        <input type="date" v-model="fechaFin" />
        <small v-if="fieldErrors.fechaFin" class="error-text">{{ fieldErrors.fechaFin }}</small>
      </div>

      </div>
    </div>
  </div>

  <!-- Botones -->
  <div class="form-actions">
    <button @click="generarPDF" class="btn-secondary">
      Generar PDF
    </button>
    <button @click="mostrarTabla" class="btn-secondary">
      Vista previa
    </button>
    <button @click="limpiar" class="btn-ghost">
      Limpiar
    </button>
  </div>

  <!-- Vista previa del informe (solo si ya hay datos) -->
  <ReportPreviewHeader
    v-if="reporteData"
    :empresa="`REPORTE FINAL ${selectedPeriodo.toUpperCase()} ${selectedPeriodo === 'Anual' ? '' : selectedYear}`"
  >
    <div>
      <strong>INFORME CORRESPONDIENTE AL:</strong>
      {{ periodoTexto }}
    </div>
    <div v-if="selectedPeriodo !== 'Anual'">
      <strong>AÑO:</strong> <span class="rp-value">{{ selectedYear }}</span>
    </div>

    <div v-else>
      <strong>RANGO:</strong>
      <span class="rp-value">{{ fechaInicio }}</span> al
      <span class="rp-value">{{ fechaFin }}</span>
    </div>
    <div><strong>PROYECTO:</strong> PROYECTO AGRÍCOLA - HOGAR SANTA LUISA DE MARILLAC</div>
    <div><strong>LUGAR:</strong> QUETZALTENANGO, GUATEMALA</div>
    <div>
      <strong>FECHA:</strong> {{ fechaHoy }}
    </div>
  </ReportPreviewHeader>

  <!-- Tabla principal (preview en pantalla) -->
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
        <tr v-for="(fila, idx) in tablaPreview" :key="idx">
          <!-- Columna Cuenta: código numerado + link a Libro Mayor -->
          <td class="right bold-text">
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

          <!-- fila tipo heading (título/sección) -->
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

          <!-- filas normales -->
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

  <!-- Mensaje cuando aún no se ha pedido nada -->
  <div v-else class="sin-datos">
    No hay datos para mostrar. Selecciona período y mes y presiona
    <strong>"Vista previa"</strong>.
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
</template>

<script>
import axios from 'axios';
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue';
import { saveAs } from 'file-saver';
import { useRouter } from 'vue-router';
import { aplicarNumeracion } from '../../../utils/numeracion';
import { buildReportPdf } from '@/pdf/PdfReportBuilder';
import { formatCurrency } from '@/pdf/format';
import ReportPreviewHeader from '@/components/ReportPreviewHeader.vue';
import '../../styles/css/GlobalAlertsModals.css';
import { manejarErrorRuta } from '../../../utils/manejarErrores.js';
import '../../styles/css/BalanceGeneralAgricola.css';

export default {
  name: 'BalanceGeneralAgricola',
  components: { ReportPreviewHeader },
  setup() {
    const router = useRouter();
    const mostrarModalExitoFormulario = ref(false);
    const selectedYear = ref('');
    const fechaInicio = ref('');
    const fechaFin = ref('');
    const selectedPeriodo = ref('');
    const selectedMes = ref('');
    const periodos = ['Mensual', 'Trimestral', 'Semestral', 'Anual'];
    const meses = ref([]);
    const reporteData = ref(null);

    const fieldErrors = reactive({
      selectedPeriodo: '',
      selectedYear: '',
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
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 150);
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

    const now = new Date();
    const currentYear = now.getFullYear();
    const fechaHoy = now.toLocaleDateString('es-ES');

    const periodoTexto = computed(() => {
      if (selectedPeriodo.value === 'Mensual') {
        return `RESUMEN DE ${selectedMes.value?.toUpperCase?.() || ''} ${selectedYear.value}`;
      } else if (selectedPeriodo.value === 'Trimestral') {
        const trimestre = {
          Enero: 'PRIMER TRIMESTRE',
          Abril: 'SEGUNDO TRIMESTRE',
          Julio: 'TERCER TRIMESTRE',
          Octubre: 'CUARTO TRIMESTRE'
        };
        return `RESUMEN ${trimestre[selectedMes.value] || ''} ${selectedYear.value}`;
      } else if (selectedPeriodo.value === 'Semestral') {
        const sem = selectedMes.value === 'Enero'
          ? 'RESUMEN PRIMER SEMESTRE'
          : 'RESUMEN SEGUNDO SEMESTRE';
        return `${sem} ${selectedYear.value}`;
      } else if (selectedPeriodo.value === 'Anual') {
        return `RESUMEN ANUAL (${fechaInicio.value} al ${fechaFin.value})`;
      }
      return '';
    });

      const actualizarMeses = () => {
  
      selectedMes.value = '';
      reporteData.value = null;

      if (selectedPeriodo.value !== 'Anual') {
        fechaInicio.value = '';
        fechaFin.value = '';
        selectedYear.value = '';
      } else {
        selectedYear.value = '';
      }

      switch (selectedPeriodo.value) {
        case 'Mensual':
          meses.value = [
            'Enero','Febrero','Marzo','Abril','Mayo','Junio',
            'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
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
          break;
        default:
          meses.value = [];
      }
    };
        const parseNumberString = (v) => {
            if (v === null || v === undefined || v === '') return 0;
            if (typeof v === 'number') return v;
            const s = String(v).replace(/[^0-9\.-]+/g, '');
            const n = parseFloat(s);
            return isNaN(n) ? 0 : n;
        };

        const getItems = (container, flatArray, cat, sub, field) => {
            try {
                if (container && container[cat] && container[cat][sub] && Array.isArray(container[cat][sub])) {
                    return container[cat][sub].filter((it) => parseNumberString(it[field]) > 0);
                }

                if (Array.isArray(flatArray)) {
                    return flatArray.filter((it) => {
                        const tipo = it.tipoCuenta ?? it.tipo_cuenta ?? it.tipo ?? null; 
                        const corriente = it.corriente ?? it.es_corriente ?? null; 
                        const tipoMatch = cat === 'activos' ? tipo == 1 : tipo == 0;
                        const subMatch = sub === 'corriente' ? corriente == 1 : corriente == 0;
                        return tipoMatch && subMatch && parseNumberString(it[field]) > 0;
                    });
                }

                return [];
            } catch (e) {
                return [];
            }
        };

    // Ir al libro mayor de la cuenta (Agrícola)
    const irDetalleCuenta = (codigoCuenta, nombreCuenta) => {
      router.push({
        name: 'ReporteCuentaAgricolaCuenta', // aquí sí es agrícola
        params: {
          codigo: codigoCuenta,
          cuenta: nombreCuenta
        }
      });
    };

    // Tabla con numeración jerárquica + marca de cuentas (esCuenta)
  const tablaPreview = computed(() => {
    if (!reporteData.value) return [];

    const d = reporteData.value;

    // Función para filtrar cuentas por tipo y corriente
    const filtrarCuentas = (dataArray, tipoCuenta, corriente, campo) => {
      return (dataArray || []).filter(item => 
        item.tipo_cuenta == tipoCuenta && 
        item.corriente == corriente && 
        item[campo] && 
        parseFloat(item[campo]) > 0
      );
    };

    // Filtrar ingresos (ACTIVO = 1)
    const ingresosCajaCorriente = filtrarCuentas(d.data_caja, 1, 1, 'ingresos');
    const ingresosCajaNoCorriente = filtrarCuentas(d.data_caja, 1, 0, 'ingresos');
    const ingresosBancosCorriente = filtrarCuentas(d.data_bancos, 1, 1, 'ingresos');
    const ingresosBancosNoCorriente = filtrarCuentas(d.data_bancos, 1, 0, 'ingresos');

    // Filtrar egresos (PASIVO = 2)
    const egresosCajaCorriente = filtrarCuentas(d.data_caja, 0, 1, 'egresos');
    const egresosCajaNoCorriente = filtrarCuentas(d.data_caja, 0, 0, 'egresos');
    const egresosBancosCorriente = filtrarCuentas(d.data_bancos, 0, 1, 'egresos');
    const egresosBancosNoCorriente = filtrarCuentas(d.data_bancos, 0, 0, 'egresos');

    const rows = [
      // SALDO INICIAL (mantener igual)
      {
        tipo: 'heading',
        nivel: 1,
        col1: 'SALDO INICIAL',
        col2: '',
        col3: '',
        col4: formatCurrency(d.saldo_inicial)
      },
      {
        tipo: 'normal',
        nivel: 2,
        col1: 'SALDO INICIAL EN CAJA GENERAL',
        col2: '',
        col3: formatCurrency(d.saldo_inicial_caja),
        col4: ''
      },
      {
        tipo: 'normal',
        nivel: 2,
        col1: 'SALDO INICIAL EN BANCO',
        col2: '',
        col3: formatCurrency(d.saldo_inicial_bancos),
        col4: ''
      },

      // INGRESOS - ACTIVO
      {
        tipo: 'heading',
        nivel: 1,
        col1: 'INGRESOS',
        col2: '',
        col3: '',
        col4: formatCurrency(d.total_general_ingresos)
      },
      {
        tipo: 'normal',
        nivel: 2,
        col1: 'ACTIVO',
        col2: '',
        col3: '',
        col4: ''
      },
      
      // CAJA GENERAL - INGRESOS
      {
        tipo: 'normal',
        nivel: 3,
        col1: 'CAJA GENERAL',
        col2: '',
        col3: formatCurrency(d.total_ingresos_caja),
        col4: ''
      },
      
      // CORRIENTE - CAJA
      {
        tipo: 'normal',
        nivel: 4,
        col1: 'CORRIENTE',
        col2: '',
        col3: '',
        col4: ''
      },
      ...ingresosCajaCorriente.map((item) => ({
        tipo: 'normal',
        nivel: 5,
        esCuenta: true,
        col1: item.cuenta,
        col2: formatCurrency(item.ingresos),
        col3: '',
        col4: ''
      })),
      
      // NO CORRIENTE - CAJA
      {
        tipo: 'normal',
        nivel: 4,
        col1: 'NO CORRIENTE',
        col2: '',
        col3: '',
        col4: ''
      },
      ...ingresosCajaNoCorriente.map((item) => ({
        tipo: 'normal',
        nivel: 5,
        esCuenta: true,
        col1: item.cuenta,
        col2: formatCurrency(item.ingresos),
        col3: '',
        col4: ''
      })),

      // BANCOS - INGRESOS
      {
        tipo: 'normal',
        nivel: 3,
        col1: 'BANCOS',
        col2: '',
        col3: formatCurrency(d.total_ingresos_bancos),
        col4: ''
      },
      
      // CORRIENTE - BANCOS
      {
        tipo: 'normal',
        nivel: 4,
        col1: 'CORRIENTE',
        col2: '',
        col3: '',
        col4: ''
      },
      ...ingresosBancosCorriente.map((item) => ({
        tipo: 'normal',
        nivel: 5,
        esCuenta: true,
        col1: item.cuenta,
        col2: formatCurrency(item.ingresos),
        col3: '',
        col4: ''
      })),
      
      // NO CORRIENTE - BANCOS
      {
        tipo: 'normal',
        nivel: 4,
        col1: 'NO CORRIENTE',
        col2: '',
        col3: '',
        col4: ''
      },
      ...ingresosBancosNoCorriente.map((item) => ({
        tipo: 'normal',
        nivel: 5,
        esCuenta: true,
        col1: item.cuenta,
        col2: formatCurrency(item.ingresos),
        col3: '',
        col4: ''
      })),

      // EGRESOS - PASIVO
      {
        tipo: 'heading',
        nivel: 1,
        col1: 'EGRESOS',
        col2: '',
        col3: '',
        col4: formatCurrency(d.total_general_egresos)
      },
      {
        tipo: 'normal',
        nivel: 2,
        col1: 'PASIVO',
        col2: '',
        col3: '',
        col4: ''
      },
      
      // CAJA GENERAL - EGRESOS
      {
        tipo: 'normal',
        nivel: 3,
        col1: 'CAJA GENERAL',
        col2: '',
        col3: formatCurrency(d.total_egresos_caja),
        col4: ''
      },
      
      // CORRIENTE - CAJA
      {
        tipo: 'normal',
        nivel: 4,
        col1: 'CORRIENTE',
        col2: '',
        col3: '',
        col4: ''
      },
      ...egresosCajaCorriente.map((item) => ({
        tipo: 'normal',
        nivel: 5,
        esCuenta: true,
        col1: item.cuenta,
        col2: formatCurrency(item.egresos),
        col3: '',
        col4: ''
      })),
      
      // NO CORRIENTE - CAJA
      {
        tipo: 'normal',
        nivel: 4,
        col1: 'NO CORRIENTE',
        col2: '',
        col3: '',
        col4: ''
      },
      ...egresosCajaNoCorriente.map((item) => ({
        tipo: 'normal',
        nivel: 5,
        esCuenta: true,
        col1: item.cuenta,
        col2: formatCurrency(item.egresos),
        col3: '',
        col4: ''
      })),

      // BANCOS - EGRESOS
      {
        tipo: 'normal',
        nivel: 3,
        col1: 'BANCOS',
        col2: '',
        col3: formatCurrency(d.total_egresos_bancos),
        col4: ''
      },
      
      // CORRIENTE - BANCOS
      {
        tipo: 'normal',
        nivel: 4,
        col1: 'CORRIENTE',
        col2: '',
        col3: '',
        col4: ''
      },
      ...egresosBancosCorriente.map((item) => ({
        tipo: 'normal',
        nivel: 5,
        esCuenta: true,
        col1: item.cuenta,
        col2: formatCurrency(item.egresos),
        col3: '',
        col4: ''
      })),
      
      // NO CORRIENTE - BANCOS
      {
        tipo: 'normal',
        nivel: 4,
        col1: 'NO CORRIENTE',
        col2: '',
        col3: '',
        col4: ''
      },
      ...egresosBancosNoCorriente.map((item) => ({
        tipo: 'normal',
        nivel: 5,
        esCuenta: true,
        col1: item.cuenta,
        col2: formatCurrency(item.egresos),
        col3: '',
        col4: ''
      })),

      // SALDO FINAL (mantener igual)
      {
        tipo: 'heading',
        nivel: 1,
        col1: 'SALDO FINAL',
        col2: '',
        col3: '',
        col4: formatCurrency(d.total_saldo_final)
      },
      {
        tipo: 'normal',
        nivel: 2,
        col1: 'SALDO FINAL EN CAJA GENERAL',
        col2: '',
        col3: formatCurrency(d.total_saldo_final_caja),
        col4: ''
      },
      {
        tipo: 'normal',
        nivel: 2,
        col1: 'SALDO FINAL EN BANCO',
        col2: '',
        col3: formatCurrency(d.total_saldo_final_bancos),
        col4: ''
      },

      // SUMAS IGUALES
      {
        tipo: 'heading',
        nivel: 1,
        col1: 'SUMAS IGUALES',
        col2: '',
        col3: formatCurrency(d.total_saldo_final),
        col4: formatCurrency(d.total_saldo_final)
      }
    ];

    return aplicarNumeracion(rows);
    });

   const limpiar = () => {
      selectedPeriodo.value = '';
      selectedMes.value = '';
      selectedYear.value = '';
      fechaInicio.value = '';
      fechaFin.value = '';
      meses.value = [];
      reporteData.value = null;
    };

  const buildPayload = () => {
    const tipo = selectedPeriodo.value.toLowerCase();

    if (selectedPeriodo.value === 'Anual') {
      return {
        tipo,
        fecha_inicio: fechaInicio.value,
        fecha_fin: fechaFin.value
      };
    }

    return {
      tipo,
      mes: selectedMes.value.toLowerCase(),
      year: Number(selectedYear.value)
    };
  };

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
        if (!selectedYear.value) { mostrarErrorCampo('selectedYear', 'Falta por llenar datos'); tieneErrores = true; }
        if (!selectedMes.value) { mostrarErrorCampo('selectedMes', 'Falta por llenar datos'); tieneErrores = true; }
      }

      return !tieneErrores; // Retorna true si todo está bien
    };

    const mostrarTabla = async () => {
      if (!validarFormulario()) return;
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/in_eg/reporteGeneralAG',
        buildPayload()
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
      const response = await axios.post(
      'http://127.0.0.1:8000/in_eg/reporteGeneralAG',
      buildPayload()
    );
      const data = response.data;

      // Texto de periodo
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
        periodoTextoPDF = `RESUMEN ${trimestre[selectedMes.value] || ''}`;
      } else if (selectedPeriodo.value === 'Semestral') {
        periodoTextoPDF =
          selectedMes.value === 'Enero'
            ? 'RESUMEN PRIMER SEMESTRE'
            : 'RESUMEN SEGUNDO SEMESTRE';
      } else if (selectedPeriodo.value === 'Anual') {
        periodoTextoPDF = 'RESUMEN ANUAL';
      }

      const rangoPeriodo =
        selectedPeriodo.value === 'Anual'
          ? `${fechaInicio.value} al ${fechaFin.value}`
          : `${selectedYear.value}`;

      const metadata = {
        empresa: 'PROYECTO AGRÍCOLA HOGAR SANTA LUISA',
        direccion: 'QUETZALTENANGO, GUATEMALA',
        tipoReporte:
          selectedPeriodo.value === 'Anual'
            ? 'REPORTE FINAL ANUAL'
            : `REPORTE FINAL ${selectedPeriodo.value.toUpperCase()} ${selectedYear.value}`,
        especificacion: [
          `Informe correspondiente al ${periodoTextoPDF} de ${rangoPeriodo}`,
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

      // SALDO INICIAL
      pushRow('SALDO INICIAL', '', '', formatCurrency(data.saldo_inicial), true);
      pushRow('SALDO INICIAL EN CAJA GENERAL', '', formatCurrency(data.saldo_inicial_caja), '');
      pushRow('SALDO INICIAL EN BANCO', '', formatCurrency(data.saldo_inicial_bancos), '');

      // INGRESOS / ACTIVOS
      pushRow('INGRESOS', '', '', formatCurrency(data.total_general_ingresos), true);
      pushRow('ACTIVO', '', '', '');

      pushRow('CAJA GENERAL', '', formatCurrency(data.total_ingresos_caja), '');
      pushRow('CORRIENTE', '', '', '');
      const caja_corriente = getItems(data, data.data_caja, 'activos', 'corriente', 'ingresos');
      caja_corriente.forEach((it) => pushRow(it.cuenta, formatCurrency(it.ingresos), '', ''));
      pushRow('NO CORRIENTE', '', '', '');
      const caja_no = getItems(data, data.data_caja, 'activos', 'no_corriente', 'ingresos');
      caja_no.forEach((it) => pushRow(it.cuenta, formatCurrency(it.ingresos), '', ''));

      pushRow('BANCOS', '', formatCurrency(data.total_ingresos_bancos), '');
      pushRow('CORRIENTE', '', '', '');
      const bancos_corriente = getItems(data, data.data_bancos, 'activos', 'corriente', 'ingresos');
      bancos_corriente.forEach((it) => pushRow(it.cuenta, formatCurrency(it.ingresos), '', ''));
      pushRow('NO CORRIENTE', '', '', '');
      const bancos_no = getItems(data, data.data_bancos, 'activos', 'no_corriente', 'ingresos');
      bancos_no.forEach((it) => pushRow(it.cuenta, formatCurrency(it.ingresos), '', ''));

      // EGRESOS / PASIVOS
      pushRow('EGRESOS', '', '', formatCurrency(data.total_general_egresos), true);
      pushRow('PASIVO', '', '', '');

      pushRow('CAJA GENERAL', '', formatCurrency(data.total_egresos_caja), '');
      pushRow('CORRIENTE', '', '', '');
      const caja_corriente_e = getItems(data, data.data_caja, 'pasivos', 'corriente', 'egresos');
      caja_corriente_e.forEach((it) => pushRow(it.cuenta, formatCurrency(it.egresos), '', ''));
      pushRow('NO CORRIENTE', '', '', '');
      const caja_no_e = getItems(data, data.data_caja, 'pasivos', 'no_corriente', 'egresos');
      caja_no_e.forEach((it) => pushRow(it.cuenta, formatCurrency(it.egresos), '', ''));

      pushRow('BANCOS', '', formatCurrency(data.total_egresos_bancos), '');
      pushRow('CORRIENTE', '', '', '');
      const bancos_corriente_e = getItems(data, data.data_bancos, 'pasivos', 'corriente', 'egresos');
      bancos_corriente_e.forEach((it) => pushRow(it.cuenta, formatCurrency(it.egresos), '', ''));
      pushRow('NO CORRIENTE', '', '', '');
      const bancos_no_e = getItems(data, data.data_bancos, 'pasivos', 'no_corriente', 'egresos');
      bancos_no_e.forEach((it) => pushRow(it.cuenta, formatCurrency(it.egresos), '', ''));

      // SALDO FINAL
      pushRow('SALDO FINAL', '', '', formatCurrency(data.total_saldo_final), true);
      pushRow('SALDO FINAL EN CAJA GENERAL', '', formatCurrency(data.total_saldo_final_caja), '');
      pushRow('SALDO FINAL EN BANCO', '', formatCurrency(data.total_saldo_final_bancos), '');
      pushRow('SUMAS IGUALES', '', formatCurrency(data.total_saldo_final), formatCurrency(data.total_saldo_final), true);

      const doc = buildReportPdf({ orientation: 'portrait', metadata, columns, rows });
      const blob = doc.output('blob');
      saveAs(blob, 'reporte_balance_agricola.pdf');
      mostrarModalExitoFormulario.value = true;
    } catch (error) {
      console.error('Error al generar el PDF:', error);
      manejarErrorRuta(error, router);
    }
  };


    return {
      selectedPeriodo,
      selectedMes,
      selectedYear,
      fechaInicio,
      fechaFin,
      periodos,
      meses,
      reporteData,
      currentYear,
      fechaHoy,
      periodoTexto,
      tablaPreview,
      actualizarMeses,
      limpiar,
      mostrarTabla,
      generarPDF,
      irDetalleCuenta,
      fieldErrors,
      cerrarModalExitoFormulario,
      mostrarModalExitoFormulario
    };
  }
};
</script>
