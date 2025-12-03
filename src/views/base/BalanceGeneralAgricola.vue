<template>
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
        </div>

        <div class="select-group">
          <label>Mes</label>
          <select v-model="selectedMes">
            <option
              v-for="mes in meses"
              :key="mes"
              :value="mes"
            >
              {{ mes }}
            </option>
          </select>
        </div>
      </div>
    </div>
  </div>

  <!-- Botones -->
  <div class="form-actions">
    <button @click="generarPDF" class="btn-primary">
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
  <div v-if="reporteData" class="encabezado-container">
    <div class="encabezado-box">
      <div class="encabezado-titulo">
        REPORTE FINAL {{ selectedPeriodo.toUpperCase() }}
        {{ currentYear }}
      </div>
    </div>

    <div class="encabezado-detalles">
      <div>
        <strong>INFORME CORRESPONDIENTE AL:</strong>
        {{ periodoTexto }}
      </div>
      <div><strong>AÑO:</strong> {{ currentYear }}</div>
      <div><strong>PROYECTO:</strong> PROYECTO AGRÍCOLA - HOGAR SANTA LUISA DE MARILLAC</div>
      <div><strong>LUGAR:</strong> QUETZALTENANGO, GUATEMALA</div>
      <div>
        <strong>FECHA:</strong> {{ fechaHoy }}
      </div>
    </div>
  </div>

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
</template>

<script>
import axios from 'axios';
import { ref, computed } from 'vue';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { useRouter } from 'vue-router';
import { aplicarNumeracion } from '../../../utils/numeracion';
import '../../styles/css/BalanceGeneralCapilla.css';

export default {
  name: 'BalanceGeneralAgricola',
  setup() {
    const router = useRouter();

    const selectedPeriodo = ref('');
    const selectedMes = ref('');
    const periodos = ['Mensual', 'Trimestral', 'Semestral', 'Anual'];
    const meses = ref([]);

    const reporteData = ref(null);

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

        // helper: parse numbers robustly (accepts '1,234.56' and 'Q 1,234.56')
        const parseNumberString = (v) => {
            if (v === null || v === undefined || v === '') return 0;
            if (typeof v === 'number') return v;
            const s = String(v).replace(/[^0-9\.-]+/g, '');
            const n = parseFloat(s);
            return isNaN(n) ? 0 : n;
        };

        // getItems: prefer nested container[cat][sub] arrays; otherwise filter flatArray by flags
        const getItems = (container, flatArray, cat, sub, field) => {
            try {
                if (container && container[cat] && container[cat][sub] && Array.isArray(container[cat][sub])) {
                    return container[cat][sub].filter((it) => parseNumberString(it[field]) > 0);
                }

                if (Array.isArray(flatArray)) {
                    return flatArray.filter((it) => {
                        const tipo = it.tipoCuenta ?? it.tipo_cuenta ?? it.tipo ?? null; // 1=ACTIVO,0=PASIVO
                        const corriente = it.corriente ?? it.es_corriente ?? null; // 1=CORRIENTE,0=NO
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

    // 👉 Ir al libro mayor de la cuenta (Agrícola)
    const irDetalleCuenta = (codigoCuenta, nombreCuenta) => {
      router.push({
        name: 'ReporteCuentaAgricolaCuenta', // aquí sí es agrícola
        params: {
          codigo: codigoCuenta,
          cuenta: nombreCuenta
        }
      });
    };

    // 👉 Tabla con numeración jerárquica + marca de cuentas (esCuenta)
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
    const egresosCajaCorriente = filtrarCuentas(d.data_caja, 2, 1, 'egresos');
    const egresosCajaNoCorriente = filtrarCuentas(d.data_caja, 2, 0, 'egresos');
    const egresosBancosCorriente = filtrarCuentas(d.data_bancos, 2, 1, 'egresos');
    const egresosBancosNoCorriente = filtrarCuentas(d.data_bancos, 2, 0, 'egresos');

    const rows = [
      // SALDO INICIAL (mantener igual)
      {
        tipo: 'heading',
        nivel: 1,
        col1: 'SALDO INICIAL',
        col2: '',
        col3: '',
        col4: formatQ(d.saldo_inicial)
      },
      {
        tipo: 'normal',
        nivel: 2,
        col1: 'SALDO INICIAL EN CAJA GENERAL',
        col2: '',
        col3: formatQ(d.saldo_inicial_caja),
        col4: ''
      },
      {
        tipo: 'normal',
        nivel: 2,
        col1: 'SALDO INICIAL EN BANCO',
        col2: '',
        col3: formatQ(d.saldo_inicial_bancos),
        col4: ''
      },

      // INGRESOS - ACTIVO
      {
        tipo: 'heading',
        nivel: 1,
        col1: 'INGRESOS',
        col2: '',
        col3: '',
        col4: formatQ(d.total_general_ingresos)
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
        col3: formatQ(d.total_ingresos_caja),
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
        col2: formatQ(item.ingresos),
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
        col2: formatQ(item.ingresos),
        col3: '',
        col4: ''
      })),

      // BANCOS - INGRESOS
      {
        tipo: 'normal',
        nivel: 3,
        col1: 'BANCOS',
        col2: '',
        col3: formatQ(d.total_ingresos_bancos),
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
        col2: formatQ(item.ingresos),
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
        col2: formatQ(item.ingresos),
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
        col4: formatQ(d.total_general_egresos)
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
        col3: formatQ(d.total_egresos_caja),
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
        col2: formatQ(item.egresos),
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
        col2: formatQ(item.egresos),
        col3: '',
        col4: ''
      })),

      // BANCOS - EGRESOS
      {
        tipo: 'normal',
        nivel: 3,
        col1: 'BANCOS',
        col2: '',
        col3: formatQ(d.total_egresos_bancos),
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
        col2: formatQ(item.egresos),
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
        col2: formatQ(item.egresos),
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
        col4: formatQ(d.total_saldo_final)
      },
      {
        tipo: 'normal',
        nivel: 2,
        col1: 'SALDO FINAL EN CAJA GENERAL',
        col2: '',
        col3: formatQ(d.total_saldo_final_caja),
        col4: ''
      },
      {
        tipo: 'normal',
        nivel: 2,
        col1: 'SALDO FINAL EN BANCO',
        col2: '',
        col3: formatQ(d.total_saldo_final_bancos),
        col4: ''
      },

      // SUMAS IGUALES
      {
        tipo: 'heading',
        nivel: 1,
        col1: 'SUMAS IGUALES',
        col2: '',
        col3: formatQ(d.total_saldo_final),
        col4: formatQ(d.total_saldo_final)
      }
    ];

    return aplicarNumeracion(rows);
  });

    const limpiar = () => {
      selectedPeriodo.value = '';
      selectedMes.value = '';
      meses.value = [];
      reporteData.value = null;
    };

    const mostrarTabla = async () => {
      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/in_eg/reporteGeneralAG',
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

    const generarPDF = async () => {
    try {
      const response = await axios.post(
        'http://127.0.0.1:8000/in_eg/reporteGeneralAG',
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
        addPageIfNeeded();
      };

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

      // Encabezado PDF
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
      doc.text(`PROYECTO AGRÍCOLA HOGAR SANTA LUISA`, 20, 50);
      doc.text(`LUGAR:`, 130, 50);
      doc.text(`QUETZALTENANGO`, 155, 50);
      doc.text(`GUATEMALA`, 20, 60);
      doc.text(`FECHA:`, 130, 60);
      doc.text(fechaHoy, 160, 60);

      yOffset = 75;

      // 👇👇 AQUÍ SOLO UNA VEZ tableData
      const tableData = [];

      // SALDO INICIAL
      tableData.push(['SALDO INICIAL', '', '', formatQ(data.saldo_inicial)]);
      tableData.push(['SALDO INICIAL EN CAJA GENERAL', '', formatQ(data.saldo_inicial_caja), '']);
      tableData.push(['SALDO INICIAL EN BANCO', '', formatQ(data.saldo_inicial_bancos), '']);

      // Dentro de la función generarPDF, modifica la sección donde construyes tableData:

      // INGRESOS / ACTIVOS
      tableData.push(['INGRESOS', '', '', formatQ(data.total_general_ingresos)]);
      tableData.push(['ACTIVO', '', '', '']);

      tableData.push(['CAJA GENERAL', '', formatQ(data.total_ingresos_caja), '']);
      tableData.push(['CORRIENTE', '', '', '']);
      const caja_corriente = getItems(data, data.data_caja, 'activos', 'corriente', 'ingresos');
      caja_corriente.forEach((it) => tableData.push([it.cuenta, formatQ(it.ingresos), '', '']));
      tableData.push(['NO CORRIENTE', '', '', '']);
      const caja_no = getItems(data, data.data_caja, 'activos', 'no_corriente', 'ingresos');
      caja_no.forEach((it) => tableData.push([it.cuenta, formatQ(it.ingresos), '', '']));

      tableData.push(['BANCOS', '', formatQ(data.total_ingresos_bancos), '']);
      tableData.push(['CORRIENTE', '', '', '']);
      const bancos_corriente = getItems(data, data.data_bancos, 'activos', 'corriente', 'ingresos');
      bancos_corriente.forEach((it) => tableData.push([it.cuenta, formatQ(it.ingresos), '', '']));
      tableData.push(['NO CORRIENTE', '', '', '']);
      const bancos_no = getItems(data, data.data_bancos, 'activos', 'no_corriente', 'ingresos');
      bancos_no.forEach((it) => tableData.push([it.cuenta, formatQ(it.ingresos), '', '']));

      // EGRESOS / PASIVOS
      tableData.push(['EGRESOS', '', '', formatQ(data.total_general_egresos)]);
      tableData.push(['PASIVO', '', '', '']);

      tableData.push(['CAJA GENERAL', '', formatQ(data.total_egresos_caja), '']);
      tableData.push(['CORRIENTE', '', '', '']);
      const caja_corriente_e = getItems(data, data.data_caja, 'pasivos', 'corriente', 'egresos');
      caja_corriente_e.forEach((it) => tableData.push([it.cuenta, formatQ(it.egresos), '', '']));
      tableData.push(['NO CORRIENTE', '', '', '']);
      const caja_no_e = getItems(data, data.data_caja, 'pasivos', 'no_corriente', 'egresos');
      caja_no_e.forEach((it) => tableData.push([it.cuenta, formatQ(it.egresos), '', '']));

      tableData.push(['BANCOS', '', formatQ(data.total_egresos_bancos), '']);
      tableData.push(['CORRIENTE', '', '', '']);
      const bancos_corriente_e = getItems(data, data.data_bancos, 'pasivos', 'corriente', 'egresos');
      bancos_corriente_e.forEach((it) => tableData.push([it.cuenta, formatQ(it.egresos), '', '']));
      tableData.push(['NO CORRIENTE', '', '', '']);
      const bancos_no_e = getItems(data, data.data_bancos, 'pasivos', 'no_corriente', 'egresos');
      bancos_no_e.forEach((it) => tableData.push([it.cuenta, formatQ(it.egresos), '', '']));

      // SALDO FINAL
      tableData.push(['SALDO FINAL', '', '', formatQ(data.total_saldo_final)]);
      tableData.push(['SALDO FINAL EN CAJA GENERAL', '', formatQ(data.total_saldo_final_caja), '']);
      tableData.push(['SALDO FINAL EN BANCO', '', formatQ(data.total_saldo_final_bancos), '']);
      tableData.push(['SUMAS IGUALES', '', formatQ(data.total_saldo_final), formatQ(data.total_saldo_final)]);

      const tableHeaders = ['Descripción', 'Detalle', 'Saldo suma', 'Suma'];

      addTable(tableHeaders, tableData);

      const blob = doc.output('blob');
      saveAs(blob, 'reporte_balance_agricola.pdf');
    } catch (error) {
      console.error('Error al generar el PDF:', error);
    }
  };


    return {
      selectedPeriodo,
      selectedMes,
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
      irDetalleCuenta
    };
  }
};
</script>
