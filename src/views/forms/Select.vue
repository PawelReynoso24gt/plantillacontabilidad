<template>
  <div class="page-wrapper">
    <div class="page-card">
  <!-- Encabezado -->
  <div class="module-header">
    <div>
      <h2 class="module-title">Traslados internos de bancos</h2>
      <p class="module-subtitle">
        Registre el retiro desde una cuenta bancaria hacia caja.
      </p>
    </div>
  </div>

  <!-- Primera división -->
  <div class="section-container section-container--inline">
    <div class="field-group">
      <label class="field-label">Cuenta bancaria</label>
      <select v-model="cuentaBName" @change="cargarBancosNoCuenta" class="field-control">
        <option disabled value="">Seleccione una cuenta bancaria</option>
        <option v-for="cuentaN in cuentas_bancarias" :key="cuentaN.cuenta_bancaria" :value="cuentaN.cuenta_bancaria">
          {{ cuentaN.banco_y_cuenta }}
        </option>
      </select>
    </div>

    <div class="field-group">
      <label class="field-label">Número de documento</label>
      <input type="text" v-model="numero_documento" class="field-control" />
    </div>

    <div class="field-group">
      <label class="field-label">Fecha</label>
      <input type="date" v-model="fecha" class="field-control" />
    </div>
  </div>

  <!-- Segunda división -->
  <div class="section-container">
    <h3 class="section-title">Monto a retirar de bancos</h3>

    <div class="field-group">
      <label class="field-label">Valor a retirar</label>
      <input type="text" v-model="monto" class="field-control" placeholder="0.00" />
    </div>

    <div class="field-group field-group--full">
      <label class="field-label">Observaciones</label>
      <input type="text" v-model="descripcion" class="field-control" />
    </div>
  </div>

  <!-- Mensajes -->
  <div class="messages-container">
    <p v-if="error" class="text-danger">{{ error }}</p>
    <p v-if="successMessage" class="text-success">{{ successMessage }}</p>
  </div>

  <!-- Botones -->
  <div class="form-actions">
    <button class="btn btn-primary" @click="enviarDatos">Guardar</button>
    <button class="btn btn-secondary" @click="limpiar">Limpiar</button>
  </div>

    </div><!-- /page-card -->
  </div><!-- /page-wrapper -->
</template>

<script>
import axios from 'axios';
import { ref, reactive, onMounted } from 'vue';
import '@/styles/global.css';

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
          //  console.log(response.data); 
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
