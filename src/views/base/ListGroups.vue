<template>
    <!-- Formulario -->
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

        <div class="nombre-inputs">
          <div class="numero-input">
            <label>Responsable de Capilla</label>
            <input type="text" v-model="responsable" />
          </div>
          <div class="numero-input">
            <label>Hermana Sirviente</label>
            <input type="text" v-model="hermanaSirviente" />
          </div>
          <div class="numero-input">
            <label>Economa Provincial</label>
            <input type="text" v-model="economaProvincial" />
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
            :class="{'fila-resaltada': fila.tipo === 'heading'}"
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
        <div class="firma-nombre">{{ reporteData.responsable || responsable }}</div>
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
      No hay datos para mostrar. Selecciona período y mes, llena
      responsables y presiona "Vista previa".
    </div>

</template>

<script>
import axios from 'axios';
import { ref, computed } from 'vue';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import '../../styles/css/InformeInEgr.css'

export default {
  name: 'ReporteCapillaFinal',
  setup() {
    // Form fields
    const responsable = ref('');
    const hermanaSirviente = ref('');
    const economaProvincial = ref('');
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

    const mostrarTabla = async () => {
      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/in_eg/reporteFinalCA',
          {
            tipo: selectedPeriodo.value.toLowerCase(),
            mes: selectedMes.value.toLowerCase(),
            responsable: responsable.value,
            sirviente: hermanaSirviente.value,
            economa: economaProvincial.value
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
      responsable.value = '';
      hermanaSirviente.value = '';
      economaProvincial.value = '';
      meses.value = [];
      reporteData.value = null;
    };

    // Generar PDF (tu lógica original con firmas)
    const generarPDF = async () => {
      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/in_eg/reporteFinalCA',
          {
            tipo: selectedPeriodo.value.toLowerCase(),
            mes: selectedMes.value.toLowerCase(),
            responsable: responsable.value,
            sirviente: hermanaSirviente.value,
            economa: economaProvincial.value
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

