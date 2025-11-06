<template>
  <div>
    <!-- Primera división -->
    <div class="division-container">
      <div class="nombre-fecha-container">
        <div class="id-inputs">
          <label>Bancos</label>
          <select v-model="selectedBancos" @change="cargarDatosBanco">
            <option v-for="bank in bancos" :value="bank.banco">{{ bank.banco }}</option>
          </select>
        </div>
        <div class="nombre-inputs">
          <label>Nombre Banco</label>
          <div class="numero-input">
            <input type="text" v-model="banco">
          </div>
        </div>
        <div class="fecha-inputs">
          <label>Estado</label>
          <input type="number" v-model="estado" :disabled="isDisabled">
        </div>
      </div>
    </div>

    <!-- Mensaje de error -->
    <p v-if="errorMessage" class="text-danger">{{ errorMessage }}</p>
    
    <!-- Mensaje de éxito -->
    <p v-if="successMessage" class="text-success">{{ successMessage }}</p>

    <!-- Espacio entre la división 3 y el botón -->
    <div style="margin-top: 20px;"></div>

    <!-- Botones -->
    <button @click="insertar">Guardar</button>
    <button @click="actualizar" style="margin-left: 10px;">Actualizar</button>
    <button @click="limpiar" style="margin-left: 10px;">Limpiar</button>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, reactive } from 'vue';
import '../../styles/css/Bancos.css'

export default {
  name: 'Modals',
  setup() {
    const banco = ref('');
    const estado = ref(null); // Inicializado como null
    const selectedBancos = ref('');
    const bancos = reactive([]);
    const errorMessage = ref('');
    const successMessage = ref('');
    const isDisabled = ref(true);

    const cargarBancos = () => {
      axios.get('http://127.0.0.1:8000/bancos/get')
        .then((response) => {
          bancos.splice(0, bancos.length, ...response.data);
        })
        .catch(() => {
          errorMessage.value = 'Error al cargar bancos.';
        });
    };

    const cargarDatosBanco = () => {
      if (!selectedBancos.value) return;
      axios.get(`http://127.0.0.1:8000/bancos/getBancoName/${selectedBancos.value}`)
        .then(response => {
          const bancoData = response.data;
          banco.value = bancoData.banco;
          estado.value = bancoData.estado;
          isDisabled.value = false;
        })
        .catch(() => {
          errorMessage.value = 'Error al cargar datos del banco.';
        });
    };

    const insertar = () => {
      errorMessage.value = '';
      successMessage.value = '';

      if (!banco.value) {
        errorMessage.value = 'Por favor, completa el campo del nombre del banco.';
        return;
      }

      const datos = { banco: banco.value };

      if (estado.value !== null) {
        datos.estado = estado.value;
      }

      axios.post('http://127.0.0.1:8000/bancos/create', datos)
        .then(() => {
          successMessage.value = 'Banco guardado correctamente.';
          cargarBancos();
        })
        .catch(() => {
          errorMessage.value = 'Error al guardar el banco.';
        });
    };

    const actualizar = () => {
      errorMessage.value = '';
      successMessage.value = '';

      if (!selectedBancos.value) {
        errorMessage.value = 'Por favor, selecciona un banco.';
        return;
      }

      const datos = {};

      if (banco.value.trim() !== '') {
        datos.banco = banco.value.trim();
      }

      if (estado.value !== null) {
        datos.estado = estado.value;
      }

      if (Object.keys(datos).length === 0) {
        errorMessage.value = 'No hay campos para actualizar.';
        return;
      }

      axios.put(`http://127.0.0.1:8000/bancos/updatebyname/${selectedBancos.value}`, datos)
        .then(() => {
          successMessage.value = 'Banco actualizado correctamente.';
          cargarBancos();
        })
        .catch(() => {
          errorMessage.value = 'Error al actualizar el banco.';
        });
    };

    const limpiar = () => {
      banco.value = '';
      estado.value = null;
      selectedBancos.value = '';
      errorMessage.value = '';
      successMessage.value = '';
      isDisabled.value = true;
    };

    cargarBancos();

    return {
      banco,
      estado,
      selectedBancos,
      bancos,
      insertar,
      actualizar,
      limpiar,
      cargarDatosBanco,
      errorMessage,
      successMessage,
      isDisabled
    };
  },
};
</script>

