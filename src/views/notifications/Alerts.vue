<template>

      <!-- Encabezado -->
      <div class="module-header">
        <div>
          <h2 class="module-title">Gestión de usuarios</h2>
          <p class="module-subtitle">
            Crea, actualiza y administra los usuarios del sistema.
          </p>
        </div>
      </div>

      <!-- Primera división -->
      <div class="division-container">
        <!-- Fila 1: usuarios registrados + usuario -->
        <div class="division-inline">
          <!-- Select de usuarios -->
          <div class="field-group">
            <label class="field-label">Usuarios registrados</label>
            <select
              v-model="selectedProject"
              @change="cargarDatosProyecto"
              class="field-control"
            >
              <option
                v-for="project in projects"
                :key="project.id"
                :value="project"
              >
                {{ project.usuarios }}
              </option>
            </select>
            <small v-if="fieldErrors.selectedProject" class="error-text">{{ fieldErrors.selectedProject }}</small>
          </div>

          <!-- Usuario -->
          <div class="field-group">
            <label class="field-label">Usuario</label>
            <input
              type="text"
              v-model="usuarios"
              class="field-control"
              placeholder="Ingrese el nombre de usuario"
            />
            <small v-if="fieldErrors.usuarios" class="error-text">{{ fieldErrors.usuarios }}</small>
          </div>
        </div>

        <!-- Fila 2: contraseña + estado -->
        <div class="division-inline">
          <!-- Contraseña -->
          <div class="field-group">
            <label class="field-label">Contraseña</label>
            <div class="field-control field-control--with-button">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="contrasenias"
                class="field-control-inner"
                placeholder="Ingrese la contraseña"
              />
              <small v-if="fieldErrors.contrasenias" class="error-text">{{ fieldErrors.contrasenias }}</small>
              <button
                type="button"
                class="btn-inline"
                @click="togglePasswordVisibility"
              >
                {{ showPassword ? 'Ocultar' : 'Mostrar' }}
              </button>
            </div>
          </div>

          <!-- Estado -->
          <div class="field-group">
            <label class="field-label">Estado</label>
            <input
              type="text"
              v-model="estado"
              :disabled="!estadoenabled"
              class="field-control"
              placeholder="Activo / Inactivo"
            />
            <small v-if="fieldErrors.estado" class="error-text">{{ fieldErrors.estado }}</small>
          </div>
        </div>
      </div>

      <!-- ** MENSAJE DE ADVERTENCIA Y BOTONES ** ========================================================================================== -->
      <div class="bottom-actions-bar">
        
        <div class="messages-area">
          <!-- <transition-group name="lista-errores" tag="div" class="errores-stack">
            <div v-for="err in erroresLista" :key="err.id" class="alert-inline-error">
              <span class="alert-icon">⚠️</span>
              <span>{{ err.texto }}</span>
            </div>
          </transition-group> -->
          
          <p v-if="successMessage" class="text-success" style="margin: 0;">{{ successMessage }}</p>
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
    </div>

  <!-- ******* MODAL DE DATOS ENVIADOS CORRECTAMENTE ******* -->
  <div v-if="mostrarModalExitoFormulario" class="modal-overlay">
    <div class="modal-content egreso-card" style="max-width: 450px; text-align: center;">
      <div style="margin-bottom: 1.5rem;">
        <div style="font-size: 3rem; color: #28a745; margin-bottom: 1rem;">✓</div>
        <h3 style="color: #14491b; margin-bottom: 0.5rem;">¡Operación Exitosa!</h3>
        <p style="color: #6c757d;">El usuario se ha guardado/actualizado correctamente en el sistema.</p>
      </div>
      
      <div class="form-actions" style="justify-content: center;">
        <button class="btn-primary" @click="cerrarModalExitoFormulario" style="min-width: 120px;">
          Aceptar
        </button>
      </div>
    </div>
  </div>

</template>


<script>
import axios from 'axios';
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router'; // para redirección de rutas
import { manejarErrorRuta } from '../../../utils/manejarErrores.js';
import '../../styles/css/Login.css';
import '../../styles/css/GlobalAlertsModals.css';

export default {
  name: 'Badges',
  setup() {
    const router = useRouter();
    const usuarios = ref('');
    const contrasenias = ref('');
    const estado = ref('');
    const selectedProject = ref(null);
    const projects = ref([]);
    const errorMessage = ref('');
    const successMessage = ref('');
    const showPassword = ref(false);

    const estadoenabled = computed(() => !!selectedProject.value);

    const mostrarModalExitoFormulario = ref(false);
    // Objeto para guardar el error específico de cada campo
    const fieldErrors = reactive({
      selectedProject: '',
      usuarios: '',
      contrasenias: '',
      estado: ''
    });

    const cerrarModalExitoFormulario = () => {
        mostrarModalExitoFormulario.value = false;
        limpiar(); // Llamamos a tu función limpiar() que ya resetea todos los campos
    };

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

    // Función que asigna el error y lo borra a los 5 segundos
    const mostrarErrorCampo = (campo, mensaje) => {
      fieldErrors[campo] = mensaje;
      setTimeout(() => {
        fieldErrors[campo] = '';
      }, 5000);
    };

    // ==========================================
    // DETECTOR DE TECLADO (ENTER PARA MODALES)
    // ==========================================
    const manejarEnter = (event) => {
      if (event.key === 'Enter') {
        // Previene que el Enter haga cosas raras (como recargar la página si estuviera en un <form>)
        event.preventDefault();

        // Evaluamos qué modal está abierto actualmente:
        if (mostrarModalExitoFormulario.value) {
          cerrarModalExitoFormulario(); // Aceptar éxito de guardado normal
        } 
      }
    };

    const cargarProyectos = () => {
      axios
        .get('http://127.0.0.1:8000/logins/getLogins')
        .then((response) => {
          projects.value = response.data;
        })
        .catch((err) => {
          console.error('Error al cargar lista de usuarios:', err);
          manejarErrorRuta(err, router);
        });
    };

    const cargarDatosProyecto = () => {
      if (!selectedProject.value) return;

      axios
        .get(
          `http://127.0.0.1:8000/logins/getProjectName/${selectedProject.value.usuarios}`
        )
        .then((response) => {
          const proyecto = response.data;
          usuarios.value = proyecto.usuarios;
          contrasenias.value = proyecto.contrasenias;
          estado.value = proyecto.estado.toString();
        })
        .catch((err) => {
          console.error('Error al obtener cuenta del usuario:', err);
          manejarErrorRuta(err, router);
        });
    };

    const insertar = () => {
      let tieneErrores = false;

      // Validaciones básicas de campos vacíos
      if (!usuarios.value) { mostrarErrorCampo('usuarios', 'Falta por llenar datos'); tieneErrores = true; }
      if (!contrasenias.value) { mostrarErrorCampo('contrasenias', 'Falta por llenar datos'); tieneErrores = true; }

      if (tieneErrores) return;

      const datos = {
        usuarios: usuarios.value,
        contrasenias: contrasenias.value,
        estado: estado.value
      };

      axios
        .post('http://127.0.0.1:8000/logins/create', datos)
        .then(() => {
          mostrarModalExitoFormulario.value = true;
          cargarProyectos();
        })
        .catch((err) => {
          console.error('ERROR CREACIÓN:', err?.response?.data || err.message);
          manejarErrorRuta(err, router);
        });
    };

    const actualizar = () => {
      let tieneErrores = false;

      if (!selectedProject.value) {
        mostrarErrorCampo('selectedProject', 'Por favor, selecciona un usuario para actualizar.');
        tieneErrores = true;
      }
      if (!usuarios.value) { mostrarErrorCampo('usuarios', 'Falta por llenar datos'); tieneErrores = true; }
      if (!contrasenias.value) { mostrarErrorCampo('contrasenias', 'Falta por llenar datos'); tieneErrores = true; }
      if (!estado.value) { mostrarErrorCampo('estado', 'Falta por llenar datos'); tieneErrores = true; }

      if (tieneErrores) return;

      const datos = {
        usuarios: usuarios.value.trim(),
        contrasenias: contrasenias.value.trim(),
        estado: estado.value.trim()
      };

      axios
        .put(
          `http://127.0.0.1:8000/logins/update/${selectedProject.value.usuarios}`,
          datos
        )
        .then(() => {
          mostrarModalExitoFormulario.value = true;
          cargarProyectos();
        })
        .catch((err) => {
          console.error('ERROR ACTUALIZACIÓN:', err?.response?.data || err.message);
          manejarErrorRuta(err, router);
        });
    };

    const limpiar = () => {
      usuarios.value = '';
      contrasenias.value = '';
      estado.value = '';
      selectedProject.value = null;
      errorMessage.value = '';
      successMessage.value = '';
      showPassword.value = false;
    };

    cargarProyectos();

    onMounted(() => {
      // Encendemos el detector de teclado
      window.addEventListener('keydown', manejarEnter);
    });

    onUnmounted(() => {
      // Apagamos el detector de teclado al salir de la pantalla
      window.removeEventListener('keydown', manejarEnter);
    });

    return {
      usuarios,
      contrasenias,
      estado,
      selectedProject,
      projects,
      insertar,
      actualizar,
      limpiar,
      cargarDatosProyecto,
      errorMessage,
      successMessage,
      estadoenabled,
      togglePasswordVisibility,
      showPassword,
      /////////
      fieldErrors,
      cerrarModalExitoFormulario,
      mostrarModalExitoFormulario
    };
  }
};
</script>
