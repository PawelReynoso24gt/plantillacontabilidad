<template>
      <!-- Encabezado -->
      <div class="libro-header">
        <div>
          <h2 class="libro-title">Informe final - Capilla</h2>
          <p class="libro-subtitle">
            Genera el reporte final de ingresos y egresos por período.
          </p>
        </div>
      </div>

     <div class="division-container division-inline">

  <!-- PERIODO -->
  <div class="field-group">
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

  <div class="field-group" v-if="selectedPeriodo && selectedPeriodo !== 'Anual'">
    <label class="field-label">Mes</label>
    <select v-model="selectedMes" class="field-control">
      <option disabled value="">Seleccione un mes</option>
      <option v-for="mes in meses" :key="mes" :value="mes">
        {{ mes }}
      </option>
    </select>
    <small v-if="fieldErrors.selectedMes" class="error-text">{{ fieldErrors.selectedMes }}</small>
  </div>

  <div class="field-group" v-if="selectedPeriodo === 'Anual'">
    <label class="field-label">Fecha inicial</label>
    <input type="date" v-model="fechaInicio" class="field-control" />
    <small v-if="fieldErrors.fechaInicio" class="error-text">{{ fieldErrors.fechaInicio }}</small>
  </div>

  <div class="field-group" v-if="selectedPeriodo === 'Anual'">
    <label class="field-label">Fecha final</label>
    <input type="date" v-model="fechaFin" class="field-control" />
    <small v-if="fieldErrors.fechaFin" class="error-text">{{ fieldErrors.fechaFin }}</small>
  </div>

</div>
      <!-- Formulario: responsables -->
      <div class="division-container division-block">
        <p class="division-title">Responsables del informe</p>

        <div class="field-group">
          <label class="field-label">Responsable de Capilla</label>
          <input
            type="text"
            v-model="responsable"
            class="field-control"
            placeholder="Nombre de la responsable de capilla"
          />
          <small v-if="fieldErrors.responsable" class="error-text">{{ fieldErrors.responsable }}</small>
        </div>

        <div class="field-group">
          <label class="field-label">Hermana Sirviente</label>
          <input
            type="text"
            v-model="hermanaSirviente"
            class="field-control"
            placeholder="Nombre de la hermana sirviente"
          />
          <small v-if="fieldErrors.hermanaSirviente" class="error-text">{{ fieldErrors.hermanaSirviente }}</small>
        </div>

        <div class="field-group">
          <label class="field-label">Economa Provincial</label>
          <input
            type="text"
            v-model="economaProvincial"
            class="field-control"
            placeholder="Nombre de la economa provincial"
          />
          <small v-if="fieldErrors.economaProvincial" class="error-text">{{ fieldErrors.economaProvincial }}</small>
        </div>
      </div>

      <!-- Botones -->
      <div class="form-actions">
        <button @click="mostrarTabla" class="btn-secondary">
          Vista previa
        </button>
        <button @click="limpiar" class="btn-secondary">
          Limpiar
        </button>
        <button @click="generarPDF" class="btn-primary">
          Generar PDF
        </button>
      </div>

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
          <div v-if="selectedPeriodo !== 'Anual'">
          <strong>AÑO:</strong> {{ selectedYear }}
        </div>

        <div v-else>
          <strong>FECHA SELECCIONADA:</strong> {{ fechaInicio }} a {{ fechaFin }}
        </div>

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
            <tr
              v-for="(fila, idx) in tablaPreview"
              :key="idx"
              :class="{ 'fila-resaltada': fila.tipo === 'heading' }"
            >
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

      <!-- Firmas -->
      <div v-if="reporteData" class="firmas-wrapper">
        <div class="firma-col">
          <div class="firma-line">(f) _____________________________</div>
          <div class="firma-nombre">
            {{ reporteData.responsable || responsable }}
          </div>
          <div class="firma-cargo">Responsable de Capilla</div>
        </div>

        <div class="firma-col">
          <div class="firma-line">(f) _____________________________</div>
          <div class="firma-nombre">
            Vo.Bo. {{ reporteData.sirviente || hermanaSirviente }}
          </div>
          <div class="firma-cargo">Hermana Sirviente</div>
        </div>

        <div class="firma-col firma-centro">
          <div class="firma-line">(f) _____________________________</div>
          <div class="firma-nombre">
            {{ reporteData.economa || economaProvincial }}
          </div>
          <div class="firma-cargo">Economa Provincial</div>
        </div>
      </div>

      <!-- Mensaje si no hay datos todavía -->
      <div v-else class="sin-datos">
        No hay datos para mostrar.  
        Selecciona período y mes, llena los responsables y presiona
        <strong>Vista previa</strong>.
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
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import '../../styles/css/InformeInEgr.css'
import '../../styles/css/GlobalAlertsModals.css';
import { useRouter } from 'vue-router'; // para redirección de rutas
import { manejarErrorRuta } from '../../../utils/manejarErrores.js';

export default {
  name: 'ReporteCapillaFinal',
  setup() {
    // Form fields
    const router = useRouter();
    const mostrarModalExitoFormulario = ref(false);
    const responsable = ref('');
    const hermanaSirviente = ref('');
    const economaProvincial = ref('');
    const selectedPeriodo = ref('');
    const selectedMes = ref('');
    const periodos = ['Mensual', 'Trimestral', 'Semestral', 'Anual'];
    const meses = ref([]);
    const selectedYear = ref('');
    const fechaInicio = ref('');
    const fechaFin = ref('');

    // Datos que regresa el backend cuando consultás
    const reporteData = ref(null);


    const now = new Date();
    const currentYear = now.getFullYear();
    const fechaHoy = now.toLocaleDateString('es-ES');

    const fieldErrors = reactive({
      selectedPeriodo: '',
      selectedYear: '',
      selectedMes: '',
      fechaInicio: '',
      fechaFin: '',
      responsable: '',
      hermanaSirviente: '',
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


    const construirPayload = () => {
    const tipo = selectedPeriodo.value.toLowerCase();

    const base = {
      tipo,
      responsable: responsable.value,
      sirviente: hermanaSirviente.value,
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

    // helper dinero
    const formatQ = (n) => {
      if (n === null || n === undefined || n === '') return '';
      const num = parseFloat(n);
      if (isNaN(num)) return '';
      return (
        'Q ' +
        num.toLocaleString('es-GT', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      );
    };

    // Tabla que mostramos en pantalla: construida con reporteData
    const tablaPreview = computed(() => {
      if (!reporteData.value) return [];

      const d = reporteData.value;

      // Igual estructura que usamos en agrícola pero con labels capilla
      const rows = [
        // SALDO INICIAL
        {
          tipo: 'heading',
          col1: 'SALDO INICIAL',
          col2: '',
          col3: '',
          col4: formatQ(d.saldo_inicial)
        },
        {
          tipo: 'normal',
          col1: 'SALDO INICIAL EN CAJA GENERAL',
          col2: '',
          col3: formatQ(d.saldo_inicial_caja),
          col4: ''
        },
        {
          tipo: 'normal',
          col1: 'SALDO INICIAL EN BANCO',
          col2: '',
          col3: formatQ(d.saldo_inicial_bancos),
          col4: ''
        },

        // INGRESOS
        {
          tipo: 'heading',
          col1: 'INGRESOS',
          col2: '',
          col3: '',
          col4: formatQ(d.total_general_ingresos)
        },
        {
          tipo: 'normal',
          col1: 'CAJA GENERAL',
          col2: '',
          col3: formatQ(d.total_ingresos_caja),
          col4: ''
        },
        ...d.data_caja
          .filter(
            (item) => item.ingresos && parseFloat(item.ingresos) > 0
          )
          .map((ingreso) => ({
            tipo: 'normal',
            col1: ingreso.cuenta,
            col2: formatQ(ingreso.ingresos),
            col3: '',
            col4: ''
          })),
        {
          tipo: 'normal',
          col1: 'BANCO',
          col2: '',
          col3: formatQ(d.total_ingresos_bancos),
          col4: ''
        },
        ...d.data_bancos
          .filter(
            (item) => item.ingresos && parseFloat(item.ingresos) > 0
          )
          .map((ingreso) => ({
            tipo: 'normal',
            col1: ingreso.cuenta,
            col2: formatQ(ingreso.ingresos),
            col3: '',
            col4: ''
          })),

        // EGRESOS
        {
          tipo: 'heading',
          col1: 'EGRESOS',
          col2: '',
          col3: '',
          col4: formatQ(d.total_general_egresos)
        },
        {
          tipo: 'normal',
          col1: 'CAJA GENERAL',
          col2: '',
          col3: formatQ(d.total_egresos_caja),
          col4: ''
        },
        ...d.data_caja
          .filter(
            (item) => item.egresos && parseFloat(item.egresos) > 0
          )
          .map((egreso) => ({
            tipo: 'normal',
            col1: egreso.cuenta,
            col2: formatQ(egreso.egresos),
            col3: '',
            col4: ''
          })),
        {
          tipo: 'normal',
          col1: 'BANCO',
          col2: '',
          col3: formatQ(d.total_egresos_bancos),
          col4: ''
        },
        ...d.data_bancos
          .filter(
            (item) => item.egresos && parseFloat(item.egresos) > 0
          )
          .map((egreso) => ({
            tipo: 'normal',
            col1: egreso.cuenta,
            col2: formatQ(egreso.egresos),
            col3: '',
            col4: ''
          })),

        // SALDO FINAL
        {
          tipo: 'heading',
          col1: 'SALDO FINAL',
          col2: '',
          col3: '',
          col4: formatQ(d.total_saldo_final)
        },
        {
          tipo: 'normal',
          col1: 'SALDO FINAL EN CAJA GENERAL',
          col2: '',
          col3: formatQ(d.total_saldo_final_caja),
          col4: ''
        },
        {
          tipo: 'normal',
          col1: 'SALDO FINAL EN BANCO',
          col2: '',
          col3: formatQ(d.total_saldo_final_bancos),
          col4: ''
        },

        // SUMAS IGUALES
        {
          tipo: 'heading',
          col1: 'SUMAS IGUALES',
          col2: '',
          col3: formatQ(d.total_saldo_final),
          col4: formatQ(d.total_saldo_final)
        }
      ];

      return rows;
    });

    const validarFormulario = () => {
      let tieneErrores = false;

      // 1. Validar campos que SIEMPRE están visibles
      if (!selectedPeriodo.value) { mostrarErrorCampo('selectedPeriodo', 'Falta por llenar datos'); tieneErrores = true; }
      if (!responsable.value) { mostrarErrorCampo('responsable', 'Falta por llenar datos'); tieneErrores = true; }
      if (!hermanaSirviente.value) { mostrarErrorCampo('hermanaSirviente', 'Falta por llenar datos'); tieneErrores = true; }
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
      'http://127.0.0.1:8000/in_eg/reporteFinalCA',
      payload
    );

        reporteData.value = response.data || null;
      } catch (error) {
        console.error('Error al obtener datos del reporte:', error);
        reporteData.value = null;
        manejarErrorRuta(error, router);
      }
    };

    // Limpiar formulario y preview
    const limpiar = () => {
      selectedPeriodo.value = '';
      selectedMes.value = '';
      responsable.value = '';
      hermanaSirviente.value = '';
      economaProvincial.value = '';
      meses.value = [];
      reporteData.value = null;
      selectedYear.value = '';
      fechaInicio.value = '';
      fechaFin.value = '';
    };

    // Generar PDF (tu lógica original con firmas)
    const generarPDF = async () => {
      if (!validarFormulario()) return;
      try {
           const payload = construirPayload();

    const response = await axios.post(
      'http://127.0.0.1:8000/in_eg/reporteFinalCA',
      payload
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

        // Encabezado
        doc.setFontSize(16);
        const tituloPDF =
  selectedPeriodo.value === 'Anual'
    ? `REPORTE FINAL ANUAL`
    : `REPORTE FINAL ${selectedPeriodo.value.toUpperCase()} ${selectedYear.value}`; 
    doc.text(tituloPDF, 105, 27, { align: 'center' });
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

        // Tabla
        yOffset = 75;
        const tableData = [
          ['SALDO INICIAL', '', '', 'Q ' + data.saldo_inicial.toFixed(2)],
          [
            'SALDO INICIAL EN CAJA GENERAL',
            '',
            'Q ' + data.saldo_inicial_caja.toFixed(2),
            ''
          ],
          [
            'SALDO INICIAL EN BANCO',
            '',
            'Q ' + data.saldo_inicial_bancos.toFixed(2),
            ''
          ],
          [
            'INGRESOS',
            '',
            '',
            'Q ' + data.total_general_ingresos.toFixed(2)
          ],
          [
            'CAJA GENERAL',
            '',
            'Q ' + data.total_ingresos_caja.toFixed(2),
            ''
          ],
          ...data.data_caja
            .filter(
              (item) => item.ingresos && parseFloat(item.ingresos) > 0
            )
            .map((ingreso) => [
              ingreso.cuenta,
              'Q ' + ingreso.ingresos,
              '',
              ''
            ]),
          [
            'BANCO',
            '',
            'Q ' + data.total_ingresos_bancos.toFixed(2),
            ''
          ],
          ...data.data_bancos
            .filter(
              (item) => item.ingresos && parseFloat(item.ingresos) > 0
            )
            .map((ingreso) => [
              ingreso.cuenta,
              'Q ' + ingreso.ingresos,
              '',
              ''
            ]),
          [
            'EGRESOS',
            '',
            '',
            'Q ' + data.total_general_egresos.toFixed(2)
          ],
          [
            'CAJA GENERAL',
            '',
            'Q ' + data.total_egresos_caja.toFixed(2),
            ''
          ],
          ...data.data_caja
            .filter(
              (item) => item.egresos && parseFloat(item.egresos) > 0
            )
            .map((egreso) => [
              egreso.cuenta,
              'Q ' + egreso.egresos,
              '',
              ''
            ]),
          [
            'BANCO',
            '',
            'Q ' + data.total_egresos_bancos.toFixed(2),
            ''
          ],
          ...data.data_bancos
            .filter(
              (item) => item.egresos && parseFloat(item.egresos) > 0
            )
            .map((egreso) => [
              egreso.cuenta,
              'Q ' + egreso.egresos,
              '',
              ''
            ]),
          [
            'SALDO FINAL',
            '',
            '',
            'Q ' + data.total_saldo_final.toFixed(2)
          ],
          [
            'SALDO FINAL EN CAJA GENERAL',
            '',
            'Q ' + data.total_saldo_final_caja.toFixed(2),
            ''
          ],
          [
            'SALDO FINAL EN BANCO',
            '',
            'Q ' + data.total_saldo_final_bancos.toFixed(2),
            ''
          ],
          [
            'SUMAS IGUALES',
            '',
            'Q ' + data.total_saldo_final.toFixed(2),
            'Q ' + data.total_saldo_final.toFixed(2)
          ]
        ];

        const tableHeaders = [
          'Descripción',
          'Detalle',
          'Saldo suma',
          'Suma'
        ];

        addTable(tableHeaders, tableData);

        // Firmas
        yOffset += 5;
        const espacioNecesario = 60;
        if (yOffset + espacioNecesario > pageHeight - pageMargin) {
          doc.addPage();
          yOffset = 20;
        }

        doc.setFontSize(10);
        doc.text('Hecho por:', 20, yOffset);
        doc.text('Revisado por:', 140, yOffset);
        yOffset += 15;
        doc.text('(f)_____________________________', 20, yOffset);
        doc.text('(f)_____________________________', 120, yOffset);
        yOffset += 5;
        doc.text(data.responsable, 25, yOffset);
        doc.text('Responsable de Capilla', 30, yOffset + 5);
        doc.text('Vo.Bo. ' + data.sirviente, 130, yOffset);
        doc.text('Hermana Sirviente', 135, yOffset + 5);
        yOffset += 40;
        doc.text('(f)__________________________________', 65, yOffset);
        yOffset += 4;
        doc.text(data.economa, 75, yOffset);
        doc.text('Economa Provincial', 85, yOffset + 5);

        const blob = doc.output('blob');
        saveAs(blob, 'informe_final_capilla.pdf');
        mostrarModalExitoFormulario.value = true;
      } catch (error) {
        console.error('Error al generar el PDF:', error);
        manejarErrorRuta(error, router);
      }
    };

    return {
      // formulario
      responsable,
      hermanaSirviente,
      economaProvincial,
      selectedPeriodo,
      selectedMes,
      periodos,
      meses,
      selectedYear,
      fechaInicio,
      fechaFin,

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
      generarPDF,
      /////////////
      fieldErrors,
      cerrarModalExitoFormulario,
      mostrarModalExitoFormulario
    };
  }
};
</script>

