<template>
  <div class="page-wrapper">
    <div class="page-card">
      <!-- Encabezado -->
      <div class="module-header">
        <div>
          <h2 class="module-title">Retiros de bancos - Capilla</h2>
          <p class="module-subtitle">
            Registra los retiros realizados desde una cuenta bancaria hacia caja.
          </p>
        </div>
      </div>

      <!-- Sección: banco + número documento + fecha -->
      <div class="section-container section-container--inline">
        <div class="field-group">
          <label class="field-label">Banco / Cuenta bancaria</label>
          <select v-model="cuentaBName" @change="cargarBancosNoCuenta" class="field-control">
            <option disabled value="">Seleccione banco y cuenta</option>
            <option v-for="cuentaN in cuentas_bancarias" :key="cuentaN.cuenta_bancaria"
              :value="cuentaN.cuenta_bancaria">
              {{ cuentaN.banco_y_cuenta }}
            </option>
          </select>
        </div>

        <div class="field-group">
          <label class="field-label">Número de documento</label>
          <input type="text" v-model="numero_documento" class="field-control"
            placeholder="Número de cheque / boleta / referencia" />
        </div>

        <div class="field-group">
          <label class="field-label">Fecha</label>
          <input type="date" v-model="fecha" class="field-control" />
        </div>
      </div>

      <!-- Sección: monto + observaciones -->
      <div class="section-container section-container--block">
        <p class="section-title">Monto a retirar</p>

        <div class="field-group">
          <label class="field-label">Valor a retirar</label>
          <input type="text" v-model="monto" class="field-control" placeholder="0.00" />
        </div>

        <div class="field-group field-group--full">
          <label class="field-label">Observaciones</label>
          <input type="text" v-model="descripcion" class="field-control" placeholder="Detalle del retiro (opcional)" />
        </div>
      </div>

      <!-- Mensajes -->
      <div class="messages-container">
        <p v-if="error" class="text-danger">{{ error }}</p>
        <p v-if="successMessage" class="text-success">{{ successMessage }}</p>
      </div>

      <!-- Botones -->
      <div class="form-actions">
        <button class="btn btn-primary" @click="insertar">
          Guardar
        </button>
        <button class="btn btn-secondary" @click="limpiar">
          Limpiar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, reactive, onMounted } from 'vue';
import '@/styles/global.css';

export default {
  name: 'Accordion',
  setup() {
    const cuentaBName = ref('');
    const cuentas_bancarias = reactive([]);
    const cuenta_bancaria = ref('');
    const fecha = ref('');
    const descripcion = ref('');
    const monto = ref('');
    const numero_documento = ref('');
    const error = ref(''); // Estado para errores
    const successMessage = ref(''); // Estado para mensajes de éxito

    const cargarBancosNoCuenta = () => {
      axios.get('http://127.0.0.1:8000/cuentasB/getConcatenada')
        .then((response) => {
          cuentas_bancarias.splice(0, cuentas_bancarias.length, ...response.data);
          //console.log(response.data); 
        })
        .catch((error) => {
          console.error(error);
        });
    };

    const insertar = () => {
      error.value = ''; // Resetea el mensaje de error antes de enviar datos
      successMessage.value = ''; // Resetea el mensaje de éxito antes de enviar datos

      if (!fecha.value || !descripcion.value || !monto.value || !numero_documento.value || !cuentaBName.value) {
        error.value = 'Por favor, complete todos los campos.';
        return;
      }

      const datos = {
        fecha: fecha.value,
        descripcion: descripcion.value,
        monto: monto.value,
        cuenta_bancaria: cuentaBName.value,
        numero_documento: numero_documento.value,
      };

      axios.post('http://127.0.0.1:8000/in_eg/createTrasRetBanCA', datos)
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
      cuentaBName.value = '';
      numero_documento.value = '';
      fecha.value = '';
      monto.value = '';
      descripcion.value = '';
      error.value = ''; // Limpiar el mensaje de error
      successMessage.value = ''; // Limpiar el mensaje de éxito
    };

    onMounted(() => {
      cargarBancosNoCuenta();
    });

    return {
      cuentaBName,
      cuentas_bancarias,
      cuenta_bancaria,
      fecha,
      descripcion,
      monto,
      numero_documento,
      cargarBancosNoCuenta,
      insertar,
      limpiar,
      error,
      successMessage
    }
  },
}
</script>
