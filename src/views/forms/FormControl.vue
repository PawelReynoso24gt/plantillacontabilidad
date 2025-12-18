<template>
      <!-- Encabezado -->
      <div class="deposito-header">
        <div>
          <h2 class="deposito-title">Traslados internos de caja</h2>
          <p class="deposito-subtitle">
            Registre el depósito desde caja hacia la cuenta bancaria seleccionada.
          </p>
        </div>
      </div>

      <!-- Primera división: cuenta bancaria + documento + fecha -->
      <div class="division-container division-inline">
        <div class="field-group">
          <label class="field-label">Cuenta bancaria</label>
          <select
            v-model="cuentaBName"
            @change="cargarBancosNoCuenta"
            class="field-control"
          >
            <option disabled value="">Seleccione una cuenta bancaria</option>
            <option
              v-for="cuentaN in cuentas_bancarias"
              :key="cuentaN.cuenta_bancaria"
              :value="cuentaN.cuenta_bancaria"
            >
              {{ cuentaN.banco_y_cuenta }}
            </option>
          </select>
        </div>

        <div class="field-group">
          <label class="field-label">Número de documento</label>
          <input
            type="text"
            v-model="numero_documento"
            class="field-control"
          />
        </div>

        <div class="field-group">
          <label class="field-label">Fecha</label>
          <input
            type="date"
            v-model="fecha"
            class="field-control"
          />
        </div>
      </div>

      <!-- Segunda división: monto y observaciones -->
      <div class="division-container">
        <h3 class="division-title">Monto a retirar de caja</h3>

        <div class="field-group">
          <label class="field-label">Valor a retirar</label>
          <input
            type="text"
            v-model="monto"
            class="field-control"
            placeholder="0.00"
          />
        </div>

        <div class="field-group full-width">
          <label class="field-label">Observaciones</label>
          <input
            type="text"
            v-model="descripcion"
            class="field-control"
          />
        </div>
      </div>

      <!-- Mensajes -->
      <div class="messages-container">
        <p v-if="error" class="text-danger">{{ error }}</p>
        <p v-if="successMessage" class="text-success">{{ successMessage }}</p>
      </div>

      <!-- Botones -->
      <div class="form-actions">
        <button class="btn-primary" @click="enviarDatos">
          Guardar
        </button>
        <button class="btn-secondary" @click="limpiar">
          Limpiar
        </button>
      </div>
  

</template>

<script>
import axios from 'axios';
import { ref, reactive, onMounted } from 'vue';
import '../../styles/css/DepositoCajaA.css'

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

      axios.post('http://127.0.0.1:8000/in_eg/createTrasDepCajaAG', {
        cuenta_bancaria: cuentaBName.value,
        fecha: fecha.value,
        descripcion: descripcion.value,
        monto: monto.value,
        numero_documento: numero_documento.value,
      })
      .then(response => {
        successMessage.value = 'Datos enviados correctamente';
      //  console.log(response.data); 
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

