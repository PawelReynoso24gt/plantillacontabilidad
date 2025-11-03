<template>
  <div>
    <div class="division-container">
      <div class="nombre-fecha-container">
        <div class="id-inputs">
          <label>Período de informe</label>
          <select v-model="selectedPeriodo" @change="actualizarMeses">
            <option v-for="periodo in periodos" :key="periodo" :value="periodo">{{ periodo }}</option>
          </select>
          <label>Mes</label>
          <select v-model="selectedMes">
            <option v-for="mes in meses" :key="mes" :value="mes">{{ mes }}</option>
          </select>
        </div>
        <div class="nombre-inputs">
          <label>Responsable de Capilla</label>
          <div class="numero-input">
            <input type="text" v-model="responsable">
          </div>
        </div>
        <div class="nombre-inputs">
          <label>Hermana Sirviente</label>
          <div class="numero-input">
            <input type="text" v-model="hermanaSirviente">
          </div>
        </div>
        <div class="nombre-inputs">
          <label>Economa provincial</label>
          <div class="numero-input">
            <input type="text" v-model="economaProvincial">
          </div>
        </div>
      </div>
    </div>

    <div style="margin-top: 20px;"></div>

    <button @click="generarPDF">Generar PDF</button>
    <button @click="limpiar" style="margin-left: 10px;">Limpiar</button>
  </div>
</template>

<script>
import axios from 'axios';
import { ref } from 'vue';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';

export default {
  name: 'ReporteAG',
  setup() {
    const responsable = ref('');
    const hermanaSirviente = ref('');
    const economaProvincial = ref('');
    const selectedPeriodo = ref('');
    const selectedMes = ref('');
    const periodos = ['Mensual', 'Trimestral', 'Semestral', 'Anual'];
    const meses = ref([]);

    const actualizarMeses = () => {
      switch (selectedPeriodo.value) {
        case 'Mensual':
          meses.value = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
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
      }
    };

    const limpiar = () => {
      selectedPeriodo.value = '';
      selectedMes.value = '';
      responsable.value = '';
      hermanaSirviente.value = '';
      economaProvincial.value = '';
    };

    const generarPDF = async () => {
      try {
        const response = await axios.post('http://127.0.0.1:8000/in_eg/reporteFinalCA', {
          tipo: selectedPeriodo.value.toLowerCase(),
          mes: selectedMes.value.toLowerCase(),
          responsable: responsable.value,
          sirviente: hermanaSirviente.value,
          economa: economaProvincial.value
        });
        const data = response.data;

        const doc = new jsPDF();
        let yOffset = 20; // Start position for text
        const pageHeight = doc.internal.pageSize.height; // Height of a page
        const pageMargin = 20; // Margin from the edge of the page

        const addPageIfNeeded = () => {
          if (yOffset > pageHeight - pageMargin) { // Check if there's enough space left
            doc.addPage();
            yOffset = 20; // Reset yOffset to top of the page
          }
        };

        const addText = (text, x, y) => {
          addPageIfNeeded();
          doc.text(text, x, yOffset);
          yOffset += 10; // Line height
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
          yOffset = doc.autoTable.previous.finalY + 10; // Update yOffset after table
        };

        // Obtener año actual
        const currentYear = new Date().getFullYear();

        // Obtener mes actual
        const currentMonth = new Date().toLocaleDateString('es-ES', { month: 'long' });

        // Determinar título del informe
        let periodoTexto;
        if (selectedPeriodo.value === 'Mensual') {
          periodoTexto = `RESUMEN DE ${selectedMes.value.toUpperCase()}`;
        } else if (selectedPeriodo.value === 'Trimestral') {
          const trimestre = {
            'Enero': 'PRIMER TRIMESTRE',
            'Abril': 'SEGUNDO TRIMESTRE',
            'Julio': 'TERCER TRIMESTRE',
            'Octubre': 'CUARTO TRIMESTRE'
          };
          periodoTexto = `RESUMEN ${trimestre[selectedMes.value] || ''}`;
        } else if (selectedPeriodo.value === 'Semestral') {
          periodoTexto = selectedMes.value === 'Enero' ? 'RESUMEN PRIMER SEMESTRE' : 'RESUMEN SEGUNDO SEMESTRE';
        } else if (selectedPeriodo.value === 'Anual') {
          periodoTexto = 'RESUMEN ANUAL';
        }

        // Agregar encabezado al PDF
        doc.setFontSize(16);
        doc.text(`REPORTE FINAL ${selectedPeriodo.value.toUpperCase()} ${currentYear}`, 105, 27, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.line(60, 32, 150, 32); // Línea horizontal

        doc.setFontSize(12);
        yOffset = 40;
        doc.text(`INFORME CORRESPONDIENTE AL`, 20, 40);
        doc.text(periodoTexto, 91, 40);
        doc.text(`DE`, 165, 40);
        doc.text(`${currentYear}`, 175, 40);
        doc.text(`PROYECTO CAPILLA HOGAR SANTA LUISA`, 20, 50);
        doc.text(`LUGAR:`, 130, 50);
        doc.text(`QUETZALTENANGO`, 155, 50);
        doc.text(`GUATEMALA`, 20, 60);
        doc.text(`FECHA:`, 130, 60);
        doc.text(new Date().toLocaleDateString('es-ES'), 160, 60);
        
        // Añadir espacio antes de la tabla
        yOffset = 75; // Ajusta la posición Y después del encabezado

        // Crear los datos para la tabla
        const tableData = [
          ['SALDO INICIAL', '', '', 'Q ' + data.saldo_inicial.toFixed(2)],
          ['SALDO INICIAL EN CAJA GENERAL', '', 'Q ' + data.saldo_inicial_caja.toFixed(2), ''],
          ['SALDO INICIAL EN BANCO', '', 'Q ' + data.saldo_inicial_bancos.toFixed(2), ''],
          ['INGRESOS', '', '', 'Q ' + data.total_general_ingresos.toFixed(2)],
          ['CAJA GENERAL', '', 'Q ' + data.total_ingresos_caja.toFixed(2), ''],
          ...data.data_caja.filter(item => item.ingresos && parseFloat(item.ingresos) > 0).map(ingreso => [
            ingreso.cuenta, 'Q ' + ingreso.ingresos, '', ''
          ]),
          ['BANCO', '', 'Q ' + data.total_ingresos_bancos.toFixed(2), ''],
          ...data.data_bancos.filter(item => item.ingresos && parseFloat(item.ingresos) > 0).map(ingreso => [
            ingreso.cuenta, 'Q ' + ingreso.ingresos, '', ''
          ]),
          ['EGRESOS', '', '', 'Q ' + data.total_general_egresos.toFixed(2)],
          ['CAJA GENERAL', '', 'Q ' + data.total_egresos_caja.toFixed(2), ''],
          ...data.data_caja.filter(item => item.egresos && parseFloat(item.egresos) > 0).map(egreso => [
            egreso.cuenta, 'Q ' + egreso.egresos, '', ''
          ]),
          ['BANCO', '', 'Q ' + data.total_egresos_bancos.toFixed(2), ''],
          ...data.data_bancos.filter(item => item.egresos && parseFloat(item.egresos) > 0).map(egreso => [
            egreso.cuenta, 'Q ' + egreso.egresos, '', ''
          ]),
          ['SALDO FINAL', '', '', 'Q ' + data.total_saldo_final.toFixed(2)],
          ['SALDO FINAL EN CAJA GENERAL', '', 'Q ' + data.total_saldo_final_caja.toFixed(2), ''],
          ['SALDO FINAL EN BANCO', '', 'Q ' + data.total_saldo_final_bancos.toFixed(2), ''],
          ['SUMAS IGUALES', '', 'Q ' + data.total_saldo_final.toFixed(2), 'Q ' + data.total_saldo_final.toFixed(2)]
        ];

        // Encabezado de la Tabla
        const tableHeaders = ['Descripción', 'Detalle', 'Saldo suma', 'Suma'];

        addTable(tableHeaders, tableData);

        // Datos Finales
        yOffset += 5; // Añadir un espacio antes de los datos finales
        doc.setFontSize(10);

        // Comprobar si hay suficiente espacio para los datos finales
        const espacioNecesario = 60; // Aproximadamente la cantidad de espacio necesario para los datos finales
        if (yOffset + espacioNecesario > pageHeight - pageMargin) {
          doc.addPage();
          yOffset = 20;
        }

        doc.text('Hecho por:', 20, yOffset);
        doc.text('Revisado por:', 140, yOffset);
        yOffset += 15; // Ajustar la posición vertical
        doc.text('(f)_____________________________', 20, yOffset);
        doc.text('(f)_____________________________', 120, yOffset);
        yOffset += 5; // Ajustar la posición vertical
        doc.text(data.responsable, 25, yOffset);
        doc.text('Responsable de Capilla', 30, yOffset + 5); // Añadir "Responsable"
        doc.text('Vo.Bo. ' + data.sirviente, 130, yOffset);
        doc.text('Hermana Sirviente', 135, yOffset + 5); // Añadir "sirviente"
        yOffset += 40; // Añadir espacio antes de economa
        doc.text('(f)__________________________________', 65, yOffset);
        yOffset += 4; // Ajustar la posición vertical
        doc.text(data.economa, 75, yOffset);
        doc.text('Economa Provincial', 85, yOffset + 5);

        // Guardar el PDF
        const blob = doc.output('blob');
        saveAs(blob, 'informe_final_capilla.pdf');


      } catch (error) {
        console.error('Error al generar el PDF:', error);
      }
    };

    return {
      responsable,
      hermanaSirviente,
      economaProvincial,
      selectedPeriodo,
      selectedMes,
      periodos,
      meses,
      limpiar,
      actualizarMeses,
      generarPDF
    };
  },
};
</script>

<style scoped>
.division-container {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  margin-top: 10px;
}

label {
  display: block;
  margin-bottom: 5px;
}

input[type="text"],
select {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}

.id-inputs {
  display: flex;
  gap: 10px;
}

.nombre-inputs {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.numero-input {
  flex: 1;
}
</style>
