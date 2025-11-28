<template>
     <!-- Encabezado -->
      <div class="estado-header">
        <div>
          <h2 class="estado-title">Gestión de bancos</h2>
          <p class="estado-subtitle">
            Crea, actualiza y administra los bancos registrados en el sistema.
          </p>
        </div>
      </div>

      <!-- Primera división -->
      <div class="nombre-fecha-container">
        <!-- Select de bancos -->
        <div class="id-inputs">
          <div class="select-group">
            <label class="field-label">Bancos registrados</label>
            <select
              v-model="selectedBancos"
              @change="cargarDatosBanco"
              class="field-control"
            >
              <option disabled value="">Seleccione un banco</option>
              <option
                v-for="bank in bancos"
                :key="bank.banco"
                :value="bank.banco"
              >
                {{ bank.banco }}
              </option>
            </select>
          </div>
        </div>

        <!-- Nombre banco -->
        <div class="nombre-inputs">
          <div class="numero-input">
            <label class="field-label">Nombre del banco</label>
            <input
              type="text"
              v-model="banco"
              class="field-control"
              placeholder="Ingrese el nombre del banco"
            />
          </div>
        </div>

        <!-- Estado -->
        <div class="fecha-inputs">
          <label class="field-label">Estado</label>
          <input
            type="number"
            v-model="estado"
            :disabled="isDisabled"
            class="field-control"
            placeholder="1 = Activo, 0 = Inactivo"
          />
        </div>
      </div>

      <!-- Mensajes -->
      <div class="messages-container">
        <p v-if="errorMessage" class="text-danger">{{ errorMessage }}</p>
        <p v-if="successMessage" class="text-success">{{ successMessage }}</p>
      </div>

      <!-- Botones -->
      <div class="form-actions">
        <button class="btn-primary" @click="insertar">
          Guardar
        </button>
        <button class="btn-secondary" @click="actualizar">
          Actualizar
        </button>
        <button class="btn-ghost" @click="limpiar">
          Limpiar
        </button>
      </div>
    
 
</template>

<script>
import axios from 'axios';
import { ref, reactive } from 'vue';
import '../../styles/css/Bancos.css';

export default {
  name: 'Modals',
  setup() {
    const banco = ref('');
    const estado = ref(null);
    const selectedBancos = ref('');
    const bancos = reactive([]);
    const errorMessage = ref('');
    const successMessage = ref('');
    const isDisabled = ref(true);

    const cargarBancos = () => {
      axios
        .get('http://127.0.0.1:8000/bancos/get')
        .then((response) => {
          bancos.splice(0, bancos.length, ...response.data);
        })
        .catch(() => {
          errorMessage.value = 'Error al cargar bancos.';
        });
    };

    const cargarDatosBanco = () => {
      if (!selectedBancos.value) return;
      axios
        .get(
          `http://127.0.0.1:8000/bancos/getBancoName/${selectedBancos.value}`
        )
        .then((response) => {
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
        errorMessage.value =
          'Por favor, completa el campo del nombre del banco.';
        return;
      }

      const datos = { banco: banco.value };

      if (estado.value !== null) {
        datos.estado = estado.value;
      }

      axios
        .post('http://127.0.0.1:8000/bancos/create', datos)
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

      axios
        .put(
          `http://127.0.0.1:8000/bancos/updatebyname/${selectedBancos.value}`,
          datos
        )
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
  }
};
</script>
