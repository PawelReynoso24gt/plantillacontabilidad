<template>
  <div>
    <label>TRASLADOS INTERNOS DE BANCOS</label>
    <!-- Primera división -->
    <div class="division-container">
      <div class="numero-fecha-container">
        <div class="numero-inputs">
          <label>Cuenta bancaria:</label>
          <select v-model="cuentaBName" @change="cargarBancosNoCuenta">
            <option v-for="cuentaN in cuentas_bancarias" :value="cuentaN.cuenta_bancaria">{{ cuentaN.banco_y_cuenta }}</option>
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
      <label>MONTO A RETIRAR DE BANCOS</label>
      <label>Valor a retirar:</label>
      <input type="text" v-model="monto">
      <label>Observaciones</label>
      <input type="text" v-model="descripcion">
    </div>

    <!-- Espacio entre la división 3 y el botón -->
    <div style="margin-top: 20px;"></div>

    <!-- Mensaje de error -->
    <p v-if="error" class="text-danger">{{ error }}</p>

    <!-- Mensaje de éxito -->
    <p v-if="successMessage" class="text-success">{{ successMessage }}</p>

    <!-- Botón Agregar -->
    <button @click="enviarDatos">Guardar</button>
    <button @click="limpiar" style="margin-left: 10px;">Limpiar</button>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, reactive, onMounted } from 'vue';
import '../../styles/css/RetirosBancosA.css'

export default {
  name: 'Accordion',
  setup() {
    const fecha = ref('');
    const descripcion = ref('');
    const monto = ref('');
    const numero_documento = ref('');
    const cuentas_bancarias = reactive([]);
    const cuentaBName = ref('');
    const error = ref(''); // Estado para errores
    const successMessage = ref(''); // Estado para mensajes de éxito

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
      error.value = ''; // Resetea el mensaje de error antes de enviar datos
      successMessage.value = ''; // Resetea el mensaje de éxito antes de enviar datos

      if (!fecha.value || !descripcion.value || !monto.value || !numero_documento.value || !cuentaBName.value) {
        error.value = 'Por favor, complete todos los campos.';
        return;
      }

      axios.post('http://127.0.0.1:8000/in_eg/createTrasRetBanAG', {
        cuenta_bancaria: cuentaBName.value,
        fecha: fecha.value,
        descripcion: descripcion.value,
        monto: monto.value,
        numero_documento: numero_documento.value,
      })
      .then(response => {
        successMessage.value = 'Datos enviados correctamente';
        console.log(response.data); 
      })
      .catch(error => {
        console.error(error);
        error.value = 'Error al enviar datos. Por favor, inténtelo de nuevo.';
      });
    };

    const limpiar = () => {
      fecha.value = '';
      descripcion.value = '';
      monto.value = '';
      numero_documento.value = '';
      cuentaBName.value = '';
      error.value = ''; // Limpiar el mensaje de error
      successMessage.value = ''; // Limpiar el mensaje de éxito
    };

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
      numero_documento,
      error,
      successMessage
    }
  },
}
</script>

