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
          </div>
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
import { ref, computed } from 'vue';
import '../../styles/css/Login.css';

export default {
  name: 'Badges',
  setup() {
    const usuarios = ref('');
    const contrasenias = ref('');
    const estado = ref('');
    const selectedProject = ref(null);
    const projects = ref([]);
    const errorMessage = ref('');
    const successMessage = ref('');
    const showPassword = ref(false);

    const estadoenabled = computed(() => !!selectedProject.value);

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

    const cargarProyectos = () => {
      axios
        .get('http://127.0.0.1:8000/logins/getLogins')
        .then((response) => {
          projects.value = response.data;
        })
        .catch(() => {
          errorMessage.value = 'Error al cargar usuarios.';
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
        .catch(() => {
          errorMessage.value = 'Error al cargar datos del usuario.';
        });
    };

    const insertar = () => {
      errorMessage.value = '';
      successMessage.value = '';

      if (!usuarios.value || !contrasenias.value) {
        errorMessage.value = 'Por favor, completa todos los campos.';
        return;
      }

      const datos = {
        usuarios: usuarios.value,
        contrasenias: contrasenias.value,
        estado: estado.value
      };

      axios
        .post('http://127.0.0.1:8000/logins/create', datos)
        .then(() => {
          successMessage.value = 'Datos guardados correctamente.';
          cargarProyectos();
        })
        .catch(() => {
          errorMessage.value = 'Error al guardar los datos.';
        });
    };

    const actualizar = () => {
      errorMessage.value = '';
      successMessage.value = '';

      if (!selectedProject.value) {
        errorMessage.value = 'Por favor, selecciona un usuario.';
        return;
      }

      const datos = {};

      if (usuarios.value.trim() !== '') {
        datos.usuarios = usuarios.value;
      }

      if (contrasenias.value.trim() !== '') {
        datos.contrasenias = contrasenias.value;
      }

      if (estado.value.trim() !== '') {
        datos.estado = estado.value;
      }

      if (Object.keys(datos).length === 0) {
        errorMessage.value = 'No hay campos para actualizar.';
        return;
      }

      axios
        .put(
          `http://127.0.0.1:8000/logins/update/${selectedProject.value.usuarios}`,
          datos
        )
        .then(() => {
          successMessage.value = 'Datos actualizados correctamente.';
          cargarProyectos();
        })
        .catch(() => {
          errorMessage.value = 'Error al actualizar los datos.';
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
      showPassword
    };
  }
};
</script>
