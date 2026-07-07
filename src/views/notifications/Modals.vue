<template>
  <div class="page-wrapper">
    <div class="page-card">
     <!-- Encabezado -->
      <div class="module-header">
        <div>
          <h2 class="module-title">Gestión de bancos</h2>
          <p class="module-subtitle">
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
            <small v-if="fieldErrors.selectedBancos" class="error-text">{{ fieldErrors.selectedBancos }}</small>
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
            <small v-if="fieldErrors.banco" class="error-text">{{ fieldErrors.banco }}</small>
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
          <small v-if="fieldErrors.estado" class="error-text">{{ fieldErrors.estado }}</small>
        </div>
      </div>

      <!-- Botones -->
      <div class="form-actions">
        <button class="btn btn-primary" @click="insertar">
          Guardar
        </button>
        <button class="btn btn-secondary" @click="actualizar">
          Actualizar
        </button>
        <button class="btn btn-ghost" @click="limpiar">
          Limpiar
        </button>
      </div>

  <!-- **MODAL DE CREACIÓN/ACTUALIZACIÓN CORRECTA** ================================================================================================================================ -->
  <div v-if="mostrarModalExitoFormulario" class="modal-overlay">
    <div class="modal-content deposito-card" style="max-width: 450px; text-align: center;">
      <div style="margin-bottom: 1.5rem;">
        <div style="font-size: 3rem; color: #28a745; margin-bottom: 1rem;">✓</div>
        <h3 style="color: #14491b; margin-bottom: 0.5rem;">¡Operación Exitosa!</h3>
        <p style="color: #6c757d;">Los datos del banco se han guardado/actualizado correctamente.</p>
      </div>
      <div class="form-actions" style="justify-content: center;">
        <button class="btn-primary" @click="cerrarModalExitoFormulario" style="min-width: 120px;">
          Aceptar
        </button>
      </div>
    </div>
  </div>

    </div><!-- /page-card -->
  </div><!-- /page-wrapper -->
</template>

<script>
import axios from 'axios';
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import '../../styles/css/Bancos.css';
import '../../styles/css/GlobalAlertsModals.css';
import { manejarErrorRuta } from '../../../utils/manejarErrores.js';

export default {
  name: 'Modals',
  setup() {
    const router = useRouter();
    const mostrarModalExitoFormulario = ref(false);
    const banco = ref('');
    const estado = ref(null);
    const selectedBancos = ref('');
    const bancos = reactive([]);
    const errorMessage = ref('');
    const successMessage = ref('');
    const isDisabled = ref(true);

    const fieldErrors = reactive({
      selectedBancos: '',
      banco: '',
      estado: ''
    });

    const mostrarErrorCampo = (campo, mensaje) => {
      fieldErrors[campo] = mensaje;
      setTimeout(() => {
        fieldErrors[campo] = '';
      }, 5000);
    };

    onMounted(() => {
      window.addEventListener('keydown', manejarEnter);
    });

    onUnmounted(() => {
      // Apagamos el detector de teclado al salir de la pantalla
      window.removeEventListener('keydown', manejarEnter);
    });

    const manejarEnter = (event) => {
      if (event.key === 'Enter') {
        // En esta pantalla SOLO existe este modal de éxito
        if (mostrarModalExitoFormulario.value) {
          event.preventDefault();
          cerrarModalExitoFormulario(); 
        }
      }
    };

    const cerrarModalExitoFormulario = () => {
        mostrarModalExitoFormulario.value = false;
        limpiar(); 
    };

    const cargarBancos = () => {
      axios
        .get('http://127.0.0.1:8000/bancos/get')
        .then((response) => {
          bancos.splice(0, bancos.length, ...response.data);
        })
        .catch((e) => {
          console.error("Error al cargar bancos:", e);
          manejarErrorRuta(e, router);
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
        .catch((e) => {
          console.error("Error al cargar datos del banco seleccionado:", e);
          manejarErrorRuta(e, router);
        });
    };

    const insertar = () => {
      // 1. Validación
      if (!banco.value) {
        mostrarErrorCampo('banco', 'Por favor, ingrese el nombre del banco.');
        return;
      }

      // 2. Preparar datos
      const datos = { banco: banco.value };
      if (estado.value !== null && estado.value !== '') {
        datos.estado = estado.value;
      }

      // 3. Petición Axios
      axios
        .post('http://127.0.0.1:8000/bancos/create', datos)
        .then(() => {
          mostrarModalExitoFormulario.value = true; // <-- MODAL
          cargarBancos();
        })
        .catch((e) => {
          console.error("Error al guardar banco:", e);
          manejarErrorRuta(e, router);
        });
    };

    const actualizar = () => {
      // 1. Validaciones
      let tieneErrores = false;

      if (!selectedBancos.value) {
        mostrarErrorCampo('selectedBancos', 'Por favor, selecciona un banco para actualizar.');
        tieneErrores = true;
      }

      if (!banco.value) {
        mostrarErrorCampo('banco', 'El nombre no puede estar vacío.');
        tieneErrores = true;
      }

      if (tieneErrores) return;

      // 2. Preparar datos
      const datos = { banco: banco.value.trim() };
      if (estado.value !== null && estado.value !== '') {
        datos.estado = estado.value;
      }

      // 3. Petición Axios
      axios
        .put(`http://127.0.0.1:8000/bancos/updatebyname/${selectedBancos.value}`, datos)
        .then(() => {
          mostrarModalExitoFormulario.value = true; // <-- MODAL
          cargarBancos();
        })
        .catch((e) => {
          console.error("Error al actualizar banco:", e);
          manejarErrorRuta(e, router);
        });
    };

    const limpiar = () => {
      banco.value = '';
      estado.value = null;
      selectedBancos.value = '';
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
      isDisabled,
      /////////////
      fieldErrors,
      cerrarModalExitoFormulario,
      mostrarModalExitoFormulario  
    };
  }
};
</script>
