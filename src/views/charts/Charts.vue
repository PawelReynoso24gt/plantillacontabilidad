<template>
  <div>
    <label>LIBRO DE CAJA</label>
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

    <!-- Botón Agregar -->
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
    const activeKey = ref(1)
    const flushActiveKey = ref(1)
    const fechaInicial = ref('')
    const fechaFinal = ref('')

    const agregarDivision = () => {
      // Lógica para agregar una nueva división
    }

    const nombreEncabezado = ref('PROYECTO AGRÍCOLA')

    const generarPDF = async () => {
  try {
    const response = await axios.get('http://127.0.0.1:8000/in_eg/getWithCuenta')
    const ingresosEgresos = response.data
    
    const doc = new jsPDF()
    const textoEncabezado = nombreEncabezado.value

    // Agregar encabezado al PDF
    doc.text(textoEncabezado, 20, 20)

    const textoAdicional = 'REPORTE: LIBRO CAJA'
    doc.setFontSize(10)
    doc.text(textoAdicional, 20, 30)

    const especificacionFechas = `ESPECIFICACIÓN: Desde ${fechaInicial.value}, Hasta: ${fechaFinal.value}`
    doc.text(especificacionFechas, 20, 40)

    // Obtener las columnas
    const columnas = [
      'ID',
      'Nomenclatura',
      'Fecha',
      'Identificación',
      'Nombre',
      'Descripción',
      'Monto',
      'Tipo',
      'Cuenta'
    ]
    
    // Construir la tabla
    const filas = ingresosEgresos.map(ingresoEgreso => [
      ingresoEgreso.id_ingresos_egresos,
      ingresoEgreso.nomenclatura,
      ingresoEgreso.fecha,
      ingresoEgreso.identificacion,
      ingresoEgreso.nombre,
      ingresoEgreso.descripcion,
      ingresoEgreso.monto,
      ingresoEgreso.tipo,
      ingresoEgreso.cuenta
    ])

    doc.autoTable({
      head: [columnas],
      body: filas,
      startY: 50,
      theme: 'grid'
    })

    const rutaArchivo = "C:\\Users\\angel\\Escritorio\\Libros\\libro_de_caja_" + ".pdf"
    // Guardar el PDF
    doc.save(rutaArchivo)
  } catch (error) {
    console.error('Error al generar el PDF:', error)
  }
}

   
    return {
      activeKey,
      flushActiveKey,
      fechaInicial,
      fechaFinal,
      nombreEncabezado,
      generarPDF,
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