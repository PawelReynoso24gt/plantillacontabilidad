<template>
  <div>
    <div class="division-container">
      <div class="fecha-inputs">
            <label>Ingreso para:</label>
            <select v-model="otroValor">   
              <option value="opcion1">Caja</option>
              <option value="opcion2">Bancos</option>  
            </select>
            <button @click="seleccionar">Seleccionar</button>
        </div>
    </div>
    <!-- Primera división -->
    <div class="division-container">
      <div class="numero-fecha-container">
        <div class="numero-inputs">
          <label>Nro.</label>
          <div class="numero-input">
            <input type="text" v-model="numero">
            <input type="text" v-model="numero">
          </div>
        </div>
        <div class="fecha-inputs">
            <label>Fecha</label>
            <input type="date" v-model="fecha">
        </div>
      </div>
    </div>
    
    <!-- Segunda división -->
    <div class="division-container">
      <label>DPI/NIT</label>
      <input type="text" v-model="dpiNit">
      <label>Nombres</label>
      <input type="text" v-model="nombres">
      <label>Observaciones de comprobante</label>
      <input type="text" v-model="apellidos">
    </div>
    
    <!-- Tercera división -->
    <div class="division-container">
      <div class="numero-fecha-container">
        <div class="numero-inputs">
          <label>Nombre</label>
          <select v-model="valor">
            
          </select>
          <label>Valor</label>
          <input type="text" v-model="valor">
        </div>
        <div class="fecha-inputs">
            <label>Forma de ingreso</label>
            <select v-model="otroValor">     
            </select>
        </div>
      </div>
    </div>

    <!-- Cuarta división -->
    <div class="division-container" v-if="mostrarDivisionCuatro">
      <label>DATOS DEL PAGO</label>
      <div class="input-container">
        <label>Documento:</label>
        <select v-model="documento">
            
        </select>
      </div>
      <div class="input-container">
        <label>Forma pago rentas:</label>
        <select v-model="formaPago">
            
        </select>
      </div>
      <div class="input-container">
        <label>Banco:</label>
        <select v-model="banco">
            
        </select>
      </div>
      <div class="input-container">
        <label># Documento:</label>
        <input type="text" v-model="numDocumento">
      </div>
      <div class="input-container">
        <label>Monto:</label>
        <input type="text" v-model="monto">
      </div>
      <div class="input-container">
        <label>Fecha emisión:</label>
        <input type="date" v-model="fechaEmision">
      </div>
      <div class="input-container">
        <label>Referente:</label>
        <input type="text" v-model="referente">
      </div>
      <button @click="agregarDivision" style="margin-right: 10px;">Cancelar</button>
      <button @click="agregarDivision">Aceptar</button>
    </div>

    <!-- Espacio entre la división 3 y el botón -->
    <div style="margin-top: 20px;"></div>

    <!-- Botón Agregar -->
    <button @click="agregarDivision">Guardar</button>
    <button @click="agregarDivision" style="margin-left: 10px;">Limpiar</button>
  </div>
</template>

<script>
import { ref } from 'vue'
export default {
  name: 'Accordion',
  setup() {
    const activeKey = ref(1)
    const flushActiveKey = ref(1)
    const otroValor = ref('opcion1');
    const mostrarDivisionCuatro = ref(true);

    const agregarDivision = () => {
      // Lógica para agregar una nueva división
    }

    const seleccionar = () => {
      mostrarDivisionCuatro.value = otroValor.value === 'opcion2';
    }

    return {
      activeKey,
      flushActiveKey,
      agregarDivision,
      otroValor,
      mostrarDivisionCuatro,
      seleccionar
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
