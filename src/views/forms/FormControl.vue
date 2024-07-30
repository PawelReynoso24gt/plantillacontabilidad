<template>
  <div>
    <label>TRASLADOS INTERNOS DE CAJA</label>
    <!-- Primera división -->
    <div class="division-container">
      <div class="numero-fecha-container">
        <div class="numero-inputs">
          <label>Cuenta bancaria:</label>
            <select v-model="cuentaBName" @change="cargarBancosNoCuenta">
              <option v-for="cuentaN in cuentas_bancarias" :value="cuentaN.cuenta_bancaria">{{ cuentaN.banco_y_cuenta }}</option> ``
            </select>
          <label>Numero de documento:</label>
              <input type="text" v-model="numero_documento">  
        </div>     
        <div class="fecha-inputs">
            <label>Fecha</label>
            <input type="date" v-model="fecha">
        </div>
      </div>
    </div>
    
    <!-- Segunda división -->
    <div class="division-container">
      <label>MONTO A RETIRAR DE CAJA</label>
      <label>Valor a retirar:</label>
      <input type="text" v-model="monto">
      <label>Observaciones</label>
      <input type="text" v-model="descripcion">
    </div>
    
    <!-- Espacio entre la división 3 y el botón -->
    <div style="margin-top: 20px;"></div>

    <!-- Botón Agregar -->
    <button @click="enviarDatos">Guardar</button>
    <button @click="limpiar" style="margin-left: 10px;">Limpiar</button>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, reactive, onMounted} from 'vue';

export default {
  name: 'Accordion',
  setup() {
    const fecha = ref('');
    const descripcion = ref('');
    const monto = ref('');
    const numero_documento = ref('');
    const cuentas_bancarias = reactive([]);
    const cuentaBName = ref('');

    const cargarBancosNoCuenta = () => {
      axios.get('http://127.0.0.1:8000/cuentasB/getConcatenada')
        .then((response) => {
          cuentas_bancarias.splice(0, cuentas_bancarias.length, ...response.data);
          console.log(response.data); 
        })
        .catch((error) => {
          console.error(error);
        });
    };

    


    const enviarDatos = () => {
     axios.post('http://127.0.0.1:8000/in_eg/createTrasDepCajaAG', {
      cuenta_bancaria: cuentaBName.value,
      fecha: fecha.value,
      descripcion: descripcion.value,
      monto: monto.value,
      numero_documento: numero_documento.value,
    })
     .then(response => {
      console.log(response.data); 
    })
    .catch(error => {
      console.error(error);
    });

    }

    const limpiar = () => {
      fecha.value = '';
      descripcion.value = '';
      monto.value = '';
     cuentas_bancarias.value = '';
     numero_documento.value = '';
     cuentaBName.value = '';
    }

    onMounted(() => {
  cargarBancosNoCuenta();
});

    return {
      limpiar,
      enviarDatos,
      cargarBancosNoCuenta,
      cuentaBName,
      cuentas_bancarias,
      fecha,
      monto,
      descripcion,
      numero_documento
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
