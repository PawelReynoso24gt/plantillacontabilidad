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
  </div>

  <div class="field-group" v-if="selectedPeriodo && selectedPeriodo !== 'Anual'">
    <label class="field-label">Mes</label>
    <select v-model="selectedMes" class="field-control">
      <option disabled value="">Seleccione un mes</option>
      <option v-for="mes in meses" :key="mes" :value="mes">
        {{ mes }}
      </option>
    </select>
  </div>

  <div class="field-group" v-if="selectedPeriodo === 'Anual'">
    <label class="field-label">Fecha inicial</label>
    <input type="date" v-model="fechaInicio" class="field-control" />
  </div>

  <div class="field-group" v-if="selectedPeriodo === 'Anual'">
    <label class="field-label">Fecha final</label>
    <input type="date" v-model="fechaFin" class="field-control" />
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
        </div>

        <div class="field-group">
          <label class="field-label">Hermana Sirviente</label>
          <input
            type="text"
            v-model="hermanaSirviente"
            class="field-control"
            placeholder="Nombre de la hermana sirviente"
          />
        </div>

        <div class="field-group">
          <label class="field-label">Economa Provincial</label>
          <input
            type="text"
            v-model="economaProvincial"
            class="field-control"
            placeholder="Nombre de la economa provincial"
          />
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
          <strong>FECHA SELECCIONADA:</strong>
          <span class="rp-value">{{ fechaInicio }}</span> a
          <span class="rp-value">{{ fechaFin }}</span>
        </div>

        <div>
          <strong>PROYECTO:</strong> PROYECTO CAPILLA HOGAR SANTA LUISA
        </div>
        <div><strong>LUGAR:</strong> QUETZALTENANGO, GUATEMALA</div>
        <div><strong>FECHA DE CREACIÓN:</strong> {{ fechaHoy }}</div>
      </ReportPreviewHeader>

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

   
  
</template>

<script>
import axios from 'axios';
import { ref, computed } from 'vue';
import { saveAs } from 'file-saver';
import { buildReportPdf } from '@/pdf/PdfReportBuilder';
import { formatCurrency } from '@/pdf/format';
import ReportPreviewHeader from '@/components/ReportPreviewHeader.vue';
import '../../styles/css/InformeInEgr.css'

export default {
  name: 'ReporteCapillaFinal',
  components: { ReportPreviewHeader },
  setup() {
    // Form fields
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
          meses.value = [];
          selectedMes.value = '';
          break;
        default:
          meses.value = [];
      }
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

        // INGRESOS
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

        // EGRESOS
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

        // SALDO FINAL
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

        // SUMAS IGUALES
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

    const mostrarTabla = async () => {
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
      try {
           const payload = construirPayload();

    const response = await axios.post(
      'http://127.0.0.1:8000/in_eg/reporteFinalCA',
      payload
    );

        const data = response.data;

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

        const metadata = {
          empresa: 'PROYECTO CAPILLA HOGAR SANTA LUISA',
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
      } catch (error) {
        console.error('Error al generar el PDF:', error);
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
      generarPDF
    };
  }
};
</script>

