<template>
  <div>
    <label>LIBRO DIARIO</label>
    <!-- Primera división -->
    <div class="division-container">
      <div class="numero-fecha-container">
        <div class="fecha-inputs">
          <label>Fecha Inicial</label>
          <input type="date" v-model="fechaInicial">
        </div>
        <div class="fecha-inputs">
          <label>Fecha Final</label>
          <input type="date" v-model="fechaFinal">
        </div>
      </div>
    </div>
    <!-- Espacio entre la división 3 y el botón -->
    <div style="margin-top: 20px;"></div>

    <!-- Botón Generar PDF -->
    <button @click="generarPDF">Generar PDF</button>
  </div>
</template>

<script>
import { ref } from 'vue'
import jsPDF from 'jspdf'
import axios from 'axios'
import 'jspdf-autotable'

export default {
  name: 'Accordion',
  setup() {
    const fechaInicial = ref('')
    const fechaFinal = ref('')
    const nombreEncabezado = ref('PROYECTO AGRÍCOLA')
    const direccionProyecto = ref('8va calle 5-21 zona 10, Quetzaltenango')

    const formatNumber = (value) => {
      if (typeof value === 'number') {
        return value.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      }
      return value;
    };

    const generarPDF = async () => {
      try {
        const response = await axios.post('http://127.0.0.1:8000/in_eg/libroDiario', {
          fechaInicial: fechaInicial.value,
          fechaFinal: fechaFinal.value
        });
        const ingresosEgresos = response.data;

        const doc = new jsPDF('landscape');

        // Agregar encabezado al PDF
        doc.setFontSize(16);
        doc.text(nombreEncabezado.value, 148.5, 27, { align: 'center' });
        doc.rect(60, 17, 170, 15); // Dibujar el cuadro alrededor del nombre del proyecto

        doc.setFontSize(12);
        doc.text(`Dirección del Proyecto: ${direccionProyecto.value}`, 20, 40);

        const textoAdicional = 'REPORTE: LIBRO DIARIO';
        doc.setFontSize(10);
        doc.text(textoAdicional, 20, 50);

        const especificacionFechas = `ESPECIFICACIÓN: Desde: ${fechaInicial.value}, Hasta: ${fechaFinal.value}`;
        doc.text(especificacionFechas, 20, 60);

        // Obtener las columnas
        const columnas = [
          { title: 'Conteo', dataKey: 'nomenclatura' },
          { title: 'Número de Documento', dataKey: 'numero_documento' },
          { title: 'Fecha', dataKey: 'fecha' },
          { title: 'Cuenta', dataKey: 'cuenta' },
          { title: 'Descripción', dataKey: 'descripcion' },
          { title: 'Acredita', dataKey: 'acredita' },
          { title: 'Debita', dataKey: 'debita' },
          { title: 'Saldo', dataKey: 'total' }
        ];

        // Construir la tabla
        const filas = ingresosEgresos.map((ingresoEgreso) => {
          const total = ingresoEgreso.total ? `Q. ${formatNumber(parseFloat(ingresoEgreso.total))}` : '';

          if (ingresoEgreso.cuenta === 'Saldo inicial' || ingresoEgreso.cuenta === 'Suma total') {
            return {
              nomenclatura: ingresoEgreso.nomenclatura,
              fecha: ingresoEgreso.fecha || '',
              cuenta: ingresoEgreso.cuenta,
              descripcion: ingresoEgreso.descripcion,
              acredita: '',
              debita: '',
              total: { content: total, styles: { fontStyle: 'bold' } },
              numero_documento: ingresoEgreso.numero_documento || '-'
            };
          } else {
            return {
              nomenclatura: ingresoEgreso.nomenclatura,
              fecha: ingresoEgreso.fecha,
              cuenta: ingresoEgreso.cuenta,
              descripcion: ingresoEgreso.descripcion,
              acredita: ingresoEgreso.acredita ? `Q. ${formatNumber(parseFloat(ingresoEgreso.acredita))}` : '',
              debita: ingresoEgreso.debita ? `Q. ${formatNumber(parseFloat(ingresoEgreso.debita))}` : '',
              total: total,
              numero_documento: ingresoEgreso.numero_documento || '-'
            };
          }
        });

        doc.autoTable({
          columns: columnas,
          body: filas,
          startY: 80,
          theme: 'grid',
          styles: {
            cellPadding: 3,
            fontSize: 8,
            halign: 'left',
            valign: 'middle'
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: [255, 255, 255]
          },
          columnStyles: {
            nomenclatura: { minCellWidth: 20, overflow: 'visible', halign: 'left', },
            numero_documento: { minCellWidth: 30, overflow: 'visible', halign: 'left', },
            fecha: { minCellWidth: 20, overflow: 'visible', halign: 'left', },
            cuenta: { minCellWidth: 40, overflow: 'linebreak', halign: 'left', },
            descripcion: { minCellWidth: 40, overflow: 'linebreak', halign: 'left', },
            acredita: { minCellWidth: 20, halign: 'right' },
            debita: { minCellWidth: 20, halign: 'right' },
            total: { minCellWidth: 20, halign: 'right' }
          }
        });

        // Guardar el PDF
        const handle = await window.showSaveFilePicker({
          suggestedName: 'libro_diario_agricola.pdf',
          types: [{
            description: 'PDF Files',
            accept: { 'application/pdf': ['.pdf'] }
          }]
        });

        const writable = await handle.createWritable();
        await writable.write(doc.output('blob'));
        await writable.close();
      } catch (error) {
        console.error('Error al generar el PDF:', error);
      }
    };

    return {
      fechaInicial,
      fechaFinal,
      nombreEncabezado,
      direccionProyecto,
      generarPDF
    }
  },
}
</script>


<style scoped>
/* Estilos para el contenedor principal */
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

/* Estilos para las divisiones */
.division-container {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  margin-top: 10px;
  border-color: rgb(19, 19, 75);
}

/* Estilos para las etiquetas */
label {
  display: block;
  margin-bottom: 5px;
}

/* Estilos para los campos de entrada */
input[type="text"],
input[type="date"],
select {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
}

/* Estilos para el botón */
button {
  padding: 10px 20px;
  background-color: #14491b;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #475f27;
}

/* Estilos para los campos de entrada de número y select */
.numero-fecha-container {
  display: flex;
}

.numero-inputs,
.fecha-inputs {
  flex: 1;
  margin-right: 10px;
}

.numero-inputs label,
.fecha-inputs label {
  display: block;
}

/* Estilos para los campos de entrada de número */
.numero-input {
  display: flex;
}

.numero-input input[type="text"] {
  margin-right: 10px;
}

/* Estilos para los campos de entrada de fecha */
.fecha-container {
  flex: 1;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 5px;
}

.fecha-container label {
  display: block;
}

.fecha-container select {
  width: calc(100% - 10px);
  border: none;
  outline: none;
}

/* Estilos para los contenedores de entrada */
.input-container {
  display: flex;
  align-items: center;
}

.input-container label {
  width: 150px; /* Ancho fijo para las etiquetas */
  margin-right: 10px;
}

.input-container select,
.input-container input {
  flex: 1;
}
</style>
