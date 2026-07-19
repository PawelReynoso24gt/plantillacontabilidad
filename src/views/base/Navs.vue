<template>
  <div class="page-wrapper">
    <div class="page-card">

      <!-- Encabezado -->
      <div class="module-header">
        <div>
          <h2 class="module-title">Gestión de cuentas bancarias</h2>
          <p class="module-subtitle">
            Administra las cuentas bancarias registradas y actualiza su información.
          </p>
        </div>
      </div>

      <!-- Formulario -->
      <div class="section-container section-container--block">
        <div class="field-row">
          <div class="field-group">
            <label class="field-label">Cuentas registradas</label>
            <select v-model="selectedProject" @change="cargarDatosCuenta" class="field-control">
              <option disabled value="">Seleccione una cuenta</option>
              <option
                v-for="project in projects"
                :key="project.id_cuentas_bancarias"
                :value="project.numero_cuenta"
              >
                {{ project.numero_cuenta }}
              </option>
            </select>
            <small v-if="fieldErrors.selectedProject" class="error-text">{{ fieldErrors.selectedProject }}</small>
          </div>

          <div class="field-group">
            <label class="field-label">Número de cuenta</label>
            <input type="text" v-model="numero_cuenta" class="field-control" placeholder="Ej. 123456789" />
            <small v-if="fieldErrors.numero_cuenta" class="error-text">{{ fieldErrors.numero_cuenta }}</small>
          </div>

          <div class="field-group">
            <label class="field-label">Estado</label>
            <input type="text" v-model="estado" :disabled="isDisabled" class="field-control" placeholder="1 = Activo, 0 = Inactivo" />
            <small v-if="fieldErrors.estado" class="error-text">{{ fieldErrors.estado }}</small>
          </div>

          <div class="field-group">
            <label class="field-label">Banco asignado</label>
            <select v-model="banco" class="field-control">
              <option disabled value="">Seleccione un banco</option>
              <option v-for="bn in bancos" :key="bn.id" :value="bn.banco">
                {{ bn.banco }}
              </option>
            </select>
            <small v-if="fieldErrors.bancos" class="error-text">{{ fieldErrors.bancos }}</small>
          </div>
        </div>
      </div>

      <!-- Botones -->
      <div class="form-actions">
        <button class="btn btn-ghost" @click="limpiar">Limpiar</button>
        <button class="btn btn-secondary" @click="actualizar">Actualizar</button>
        <button class="btn btn-primary" @click="insertar">Guardar</button>
      </div>
  <!-- **MODAL DE CREACIÓN/ACTUALIZACIÓN CORRECTA** ================================================================================================================================ -->
  <div v-if="mostrarModalExitoFormulario" class="modal-overlay">
    <div class="modal-content deposito-card" style="max-width: 450px; text-align: center;">
      <div style="margin-bottom: 1.5rem;">
        <div style="font-size: 3rem; color: #28a745; margin-bottom: 1rem;">✓</div>
        <h3 style="color: #14491b; margin-bottom: 0.5rem;">¡Operación Exitosa!</h3>
        <p style="color: #6c757d;">Los datos de la cuenta bancaria se han guardado/actualizado correctamente.</p>
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
import '@/styles/global.css';
import '../../styles/css/GlobalAlertsModals.css';
import { manejarErrorRuta } from '../../../utils/manejarErrores.js';

export default {
  name: 'Cuentas',
  setup() {
    const router = useRouter();
    const mostrarModalExitoFormulario = ref(false);
    const numero_cuenta = ref('');
    const estado = ref('');
    const banco = ref('');
    const selectedProject = ref('');
    const projects = reactive([]);
    const bancos = reactive([]);
    const isDisabled = ref(true); // Estado para controlar el atributo disabled

    const fieldErrors = reactive({
      numero_cuenta: '',
      bancos: '',
      estado: ''
    });

    const mostrarErrorCampo = (campo, mensaje) => {
      fieldErrors[campo] = mensaje;
      setTimeout(() => {
        fieldErrors[campo] = '';
      }, 5000);
    };

    onMounted(() => {
      cargarCuentas();
      cargarBancos(); 
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

    const cargarCuentas = () => {
      axios.get('http://127.0.0.1:8000/cuentasB/get')
        .then((response) => {
          projects.splice(0, projects.length, ...response.data);
        })
        .catch((e) => {
          console.error("Error al cargar las cuentas bancarias:", e);
          manejarErrorRuta(e, router);
        });
    };

    const cargarBancos = () => {
      axios.get('http://127.0.0.1:8000/bancos/get')
        .then((response) => {
          bancos.splice(0, bancos.length, ...response.data);
        })
        .catch((e) => {
          console.error("Error al cargar bancos:", e);
          manejarErrorRuta(e, router);
        });
    };

    const cargarDatosCuenta = () => {
      if (!selectedProject.value) return;
      axios.get(`http://127.0.0.1:8000/cuentasB/cuentas_bancarias/${selectedProject.value}`)
        .then(response => {
          const proyecto = response.data;
          numero_cuenta.value = proyecto.numero_cuenta;
          estado.value = proyecto.estado.toString(); 
          banco.value = proyecto.banco; 
          isDisabled.value = false; 
        })
        .catch((e) => {
          console.error("Error al cargar los datos de la cuenta:", e);
          manejarErrorRuta(e, router);
        });
    };

    const insertar = () => {
      let tieneErrores = false;

      // 1. Validaciones para cuenta
      if (!numero_cuenta.value) { 
        mostrarErrorCampo('numero_cuenta', 'Falta por llenar datos'); 
        tieneErrores = true; 
      } else if (!/^\d+$/.test(numero_cuenta.value)) {
        // Validamos que sean ÚNICAMENTE números
        mostrarErrorCampo('numero_cuenta', 'Solo se permiten números'); 
        tieneErrores = true; 
      }

      // 2. Validación para banco
      if (!banco.value) { 
        mostrarErrorCampo('bancos', 'Falta por llenar datos'); 
        tieneErrores = true; 
      }

      if (tieneErrores) return;

      const datos = {
        numero_cuenta: numero_cuenta.value,
        banco: banco.value,
        estado: estado.value.trim() !== '' ? estado.value.trim() : '1', 
      };

      axios.post('http://127.0.0.1:8000/cuentasB/create', datos)
        .then(() => {
          mostrarModalExitoFormulario.value = true;
          cargarCuentas();
        })
        .catch((e) => {
          console.error("Error al guardar la cuenta bancaria:", e);
          manejarErrorRuta(e, router);
        });
    };

    const actualizar = () => {
      let tieneErrores = false;

      if (!selectedProject.value) {
        mostrarErrorCampo('selectedProject', 'Por favor, selecciona una cuenta.');
        tieneErrores = true;
      }
      // Validaciones para cuenta en actualización
      if (!numero_cuenta.value) {
        mostrarErrorCampo('numero_cuenta', 'El número de cuenta no puede estar vacío.');
        tieneErrores = true;
      } else if (!/^\d+$/.test(numero_cuenta.value)) {
        mostrarErrorCampo('numero_cuenta', 'Solo se permiten números');
        tieneErrores = true;
      }

      if (!banco.value) {
        mostrarErrorCampo('bancos', 'Debe asignar un banco.');
        tieneErrores = true;
      }

      if (tieneErrores) return;

      const datos = {};

      if (numero_cuenta.value.trim() !== '') {
        datos.numero_cuenta = numero_cuenta.value;
      }

      if (typeof estado.value === 'string' && estado.value.trim() !== '') {
        datos.estado = estado.value.trim();
      }

      if (banco.value.trim() !== '') {
        datos.banco = banco.value;
      }

      axios.put(`http://127.0.0.1:8000/cuentasB/update/${selectedProject.value}`, datos)
        .then(() => {
          mostrarModalExitoFormulario.value = true;
          cargarCuentas();
        })
        .catch((e) => {
          console.error("Error al actualizar la cuenta bancaria:", e);
          manejarErrorRuta(e, router);
        });
    };

    const limpiar = () => {
      numero_cuenta.value = '';
      estado.value = '';
      banco.value = '';
      selectedProject.value = '';
      isDisabled.value = true; // Deshabilitar el campo Estado
    };

    return {
      numero_cuenta,
      estado,
      banco,
      selectedProject,
      projects,
      bancos,
      insertar,
      actualizar,
      limpiar,
      cargarDatosCuenta,
      isDisabled,
      /////////////
      fieldErrors,
      cerrarModalExitoFormulario,
      mostrarModalExitoFormulario  
    };
  },
};
</script>

