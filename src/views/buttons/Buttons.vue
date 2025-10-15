<template>
  <div>
    <!-- Primera división -->
    <div class="division-container">
      <div class="fecha-inputs">
        <label>Ingreso para:</label>
        <select v-model="tipo">
          <option value="caja">caja</option>
          <option value="bancos">bancos</option>
        </select>
      </div>
    </div>

    <!-- Segunda división -->
    <div class="division-container">
      <div class="numero-fecha-container">
        <div class="fecha-inputs">
          <label>Fecha</label>
          <input type="date" v-model="fecha">
        </div>
      </div>
    </div>

    <!-- Tercera división -->
    <div class="division-container">
      <label>DPI/NIT/CF</label>
      <input type="text" v-model="identificacion">
      <label>Nombre/CF</label>
      <input type="text" v-model="nombre">
      <label>Observaciones de comprobante</label>
      <input type="text" v-model="descripcion">
    </div>

    <!-- Cuarta división -->
    <div class="division-container">
      <div class="numero-fecha-container">
        <div class="numero-inputs">
          <label>Cuenta</label>
          <select v-model="cuentaCMB" @change="cargarCuentas">
            <option v-for="cuentab in cuentas" :key="cuentab.cuenta" :value="cuentab.cuenta">{{ cuentab.cuenta }}</option>
          </select>
        </div>
        <div class="fecha-inputs">
          <label>Monto</label>
          <input type="text" v-model="monto">
        </div>
      </div>
    </div>

    <!-- Datos del Pago -->
    <div class="division-container" v-if="mostrarDivisionCuatro">
      <label>DATOS DEL PAGO</label>
      <div class="input-container">
        <label>Documento:</label>
        <select v-model="documento">
          <option value="Transferencia">Transferencia</option>
          <option value="Depósitos">Depósitos</option>
          <option value="Cheque">Cheque</option>
        </select>
      </div>
      <div class="input-container">
        <label>Cuenta Bancaria:</label>
        <select v-model="cuentaBName" @change="cargarBancosNoCuenta">
          <option v-for="cuentaN in cuentas_bancarias" :key="cuentaN.cuenta_bancaria" :value="cuentaN.cuenta_bancaria">{{ cuentaN.banco_y_cuenta }}</option>
        </select>
      </div>
      <div class="input-container">
        <label>No. Documento:</label>
        <input type="text" v-model="numero_documento">
      </div>
      <div class="input-container">
        <label>Fecha emisión:</label>
        <input type="date" v-model="fecha_emision">
      </div>
    </div>

    <!-- Espacio entre la división 3 y el botón -->
    <div style="margin-top: 20px;"></div>

    <!-- Mensaje de error -->
    <p v-if="error" class="text-danger">{{ error }}</p>
    
    <!-- Mensaje de éxito -->
    <p v-if="success" class="text-success">{{ success }}</p>

    <!-- Botones -->
    <button @click="enviarDatos">Guardar</button>
    <button @click="limpiar" style="margin-left: 10px;">Limpiar</button>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, reactive, onMounted, watch } from 'vue';

export default {
  name: 'Accordion',
  setup() {
    const fecha = ref('');
    const identificacion = ref('');
    const descripcion = ref('');
    const nombre = ref('');
    const monto = ref('');
    const tipo = ref('');
    const cuentaCMB = ref('');
    const documento = ref('');
    const numero_documento = ref('');
    const fecha_emision = ref('');
    const cuentaBName = ref('');
    const cuentas = reactive([]);
    const cuentas_bancarias = reactive([]);
    const mostrarDivisionCuatro = ref(false);
    const error = ref('');
    const success = ref(''); // Mensaje de éxito

    const limpiar = () => {
      fecha.value = '';
      identificacion.value = '';
      descripcion.value = '';
      nombre.value = '';
      monto.value = '';
      cuentaCMB.value = '';
      documento.value = '';
      numero_documento.value = '';
      fecha_emision.value = '';
      tipo.value = '';
      cuentaBName.value = '';
      error.value = ''; // Limpiar el mensaje de error
      success.value = ''; // Limpiar el mensaje de éxito
    };

    const controlarVisibilidadDivisionCuatro = () => {
      mostrarDivisionCuatro.value = tipo.value === 'bancos';
    };

    watch(tipo, controlarVisibilidadDivisionCuatro);

    onMounted(() => {
      cargarCuentas();
      cargarBancosNoCuenta();
    });

    const cargarCuentas = () => {
      axios.get('http://hogarsantaluisa.test/in_eg/getAllCuentasIngresoAG')
        .then(response => {
          cuentas.splice(0, cuentas.length, ...response.data);
        })
        .catch(error => {
          console.error(error);
        });
    };

    const cargarBancosNoCuenta = () => {
      axios.get('http://hogarsantaluisa.test/cuentasB/getConcatenada')
        .then(response => {
          cuentas_bancarias.splice(0, cuentas_bancarias.length, ...response.data);
        })
        .catch(error => {
          console.error(error);
        });
    };

    const enviarDatos = () => {
      error.value = ''; // Limpiar el mensaje de error antes de enviar los datos
      success.value = ''; // Limpiar el mensaje de éxito antes de enviar los datos

      // Validación
      if (!fecha.value || !identificacion.value || !nombre.value || !descripcion.value || !monto.value || !cuentaCMB.value ||
        (tipo.value === 'bancos' && (!documento.value || !cuentaBName.value || !numero_documento.value || !fecha_emision.value))) {
        error.value = 'Por favor, complete todos los campos.';
        return;
      }

      const data = {
        fecha: fecha.value,
        identificacion: identificacion.value,
        nombre: nombre.value,
        descripcion: descripcion.value,
        monto: monto.value,
        tipo: tipo.value,
        cuenta: cuentaCMB.value,
        documento: documento.value,
        numero_documento: numero_documento.value,
        fecha_emision: fecha_emision.value,
        cuenta_bancaria: cuentaBName.value,
      };

      const url = tipo.value === 'caja'
        ? 'http://hogarsantaluisa.test/in_eg/createALLINEGCajaAG'
        : 'http://hogarsantaluisa.test/in_eg/createALLINAG';

      axios.post(url, data)
        .then(response => {
          console.log(response.data);
          success.value = 'Datos enviados correctamente'; // Mensaje de éxito
        })
        .catch(error => {
          console.error(error);
          error.value = 'Error al enviar datos. Por favor, inténtelo de nuevo.';
        });
    };

    return {
      limpiar,
      mostrarDivisionCuatro,
      fecha,
      identificacion,
      nombre,
      descripcion,
      monto,
      tipo,
      cuentaCMB,
      documento,
      numero_documento,
      fecha_emision,
      cuentaBName,
      cuentas,
      cuentas_bancarias,
      cargarCuentas,
      cargarBancosNoCuenta,
      enviarDatos,
      error,
      success, // Agregado para el mensaje de éxito
      controlarVisibilidadDivisionCuatro
    };
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

/* Estilo para mensajes de error */
.text-danger {
  color: red;
}

/* Estilo para mensajes de éxito */
.text-success {
  color: green;
}
</style>
