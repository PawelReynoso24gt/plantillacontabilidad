<template>
      <!-- Encabezado -->
      <div class="estado-header">
        <div>
          <h2 class="estado-title">Gestión de cuentas contables</h2>
          <p class="estado-subtitle">
            Crea, actualiza y administra las cuentas usadas en los reportes contables.
          </p>
        </div>
      </div>

      <!-- Formulario principal -->
      <div class="nombre-fecha-container">
        <!-- Fila 1: selección de cuenta + nombre de cuenta -->
        <div class="row-inline">
          <!-- Select de cuentas -->
          <div class="field-group">
            <label class="field-label">Cuentas registradas</label>
            <select
              v-model="selectedProject"
              @change="cargarDatosProyecto"
              class="field-control"
            >
              <option disabled value="">Seleccione una cuenta</option>
              <option
                v-for="project in projects"
                :key="project.id_cuentas"
                :value="project.cuenta"
              >
                {{ project.cuenta }}
              </option>
            </select>
          </div>

          <!-- Nombre de la cuenta -->
          <div class="field-group">
            <label class="field-label">Nombre de la cuenta</label>
            <input
              type="text"
              v-model="cuenta"
              class="field-control"
              placeholder="Ingrese el nombre de la cuenta"
            />
          </div>
        </div>

        <!-- Fila 2: estado + código -->
        <div class="row-inline">
          <!-- Estado -->
          <div class="field-group">
            <label class="field-label">Estado</label>
            <input
              type="text"
              v-model="estado"
              :disabled="!isEstadoEnabled"
              class="field-control"
              placeholder="1 = Activo, 0 = Inactivo"
            />
          </div>

          <!-- Código -->
          <div class="field-group">
            <label class="field-label">Código contable</label>
            <input
              type="text"
              v-model="codigo"
              class="field-control"
              placeholder="Ej. 1.1.1"
            />
          </div>
        </div>

        <!-- Fila 3: clasificación + proyecto -->
        <div class="row-inline">
          <!-- Clasificación -->
          <div class="field-group">
            <label class="field-label">Clasificación</label>
            <select
              v-model="selectedClasificacion"
              class="field-control"
            >
              <option disabled value="">Seleccione una clasificación</option>
              <option
                v-for="clasificacion in clasificaciones"
                :key="clasificacion.id_clasificacion"
                :value="clasificacion.tipo"
              >
                {{ clasificacion.tipo }}
              </option>
            </select>
          </div>

          <!-- Proyecto -->
          <div class="field-group">
            <label class="field-label">Proyecto</label>
            <select
              v-model="selectedTipoProyecto"
              class="field-control"
            >
              <option disabled value="">Seleccione un proyecto</option>
              <option
                v-for="proyecto in proyectos"
                :key="proyecto.id_proyectos"
                :value="proyecto.nombre"
              >
                {{ proyecto.nombre }}
              </option>
            </select>
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
import { ref, reactive, onMounted, watch } from 'vue';
import '../../styles/css/Cuentas.css'

export default {
  name: 'Cuentas',
  setup() {
    const cuenta = ref('');
    const estado = ref('');
    const codigo = ref('');
    const selectedClasificacion = ref('');
    const selectedTipoProyecto = ref('');
    const selectedProject = ref('');
    const projects = reactive([]);
    const clasificaciones = reactive([]);
    const proyectos = reactive([]);
    const errorMessage = ref('');
    const successMessage = ref('');
    const isEstadoEnabled = ref(false);

    const cargarProyectos = () => {
      axios.get('http://127.0.0.1:8000/cuentas/get')
        .then(response => {
          projects.splice(0, projects.length, ...response.data);
        })
        .catch(() => {
          errorMessage.value = 'Error al cargar las cuentas.';
        });
    };

    const cargarClasificaciones = () => {
      axios.get('http://127.0.0.1:8000/clasificacion/get')
        .then(response => {
          clasificaciones.splice(0, clasificaciones.length, ...response.data);
        })
        .catch(() => {
          errorMessage.value = 'Error al cargar las clasificaciones.';
        });
    };

    const cargarProyectosTipos = () => {
      axios.get('http://127.0.0.1:8000/proyectos/get')
        .then(response => {
          proyectos.splice(0, proyectos.length, ...response.data);
        })
        .catch(() => {
          errorMessage.value = 'Error al cargar los tipos de proyectos.';
        });
    };

    const cargarDatosProyecto = () => {
      if (!selectedProject.value) return;
      axios.get(`http://127.0.0.1:8000/cuentas/getCrud/${selectedProject.value}`)
        .then(response => {
          const proyecto = response.data[0];
          cuenta.value = proyecto.cuenta;
          estado.value = proyecto.estado ? proyecto.estado.toString() : '';
          codigo.value = proyecto.codigo;
          selectedClasificacion.value = proyecto.clasificacion;
          selectedTipoProyecto.value = proyecto.proyecto;
          isEstadoEnabled.value = true;
        })
        .catch(() => {
          errorMessage.value = 'Error al cargar los datos del proyecto.';
        });
    };

    const insertar = () => {
      errorMessage.value = '';
      successMessage.value = '';

      if (!cuenta.value || !codigo.value || !selectedClasificacion.value || !selectedTipoProyecto.value) {
        errorMessage.value = 'Por favor, completa todos los campos.';
        return;
      }

      const datos = {
        cuenta: cuenta.value,
        codigo: codigo.value,
        clasificacion: selectedClasificacion.value,
        proyecto: selectedTipoProyecto.value
      };

      axios.post('http://127.0.0.1:8000/cuentas/create', datos)
        .then(response => {
          successMessage.value = 'Cuenta guardada correctamente.';
          //limpiar();
          cargarProyectos();
        })
        .catch(error => {
          if (error.response && error.response.data) {
            errorMessage.value = 'Error al guardar la cuenta: ' + JSON.stringify(error.response.data.errors);
          } else {
            errorMessage.value = 'Error al guardar la cuenta.';
          }
        });
    };

    const actualizar = () => {
      if (!selectedProject.value) {
        errorMessage.value = 'Por favor, selecciona una cuenta.';
        return;
      }

      const datos = {};

      if (cuenta.value.trim() !== '') {
        datos.cuenta = cuenta.value;
      }

      if (estado.value.trim() !== '') {
        datos.estado = estado.value;
      }

      if (codigo.value.trim() !== '') {
        datos.codigo = codigo.value;
      }

      if (selectedClasificacion.value) {
        datos.clasificacion = selectedClasificacion.value;
      }

      if (selectedTipoProyecto.value) {
        datos.proyecto = selectedTipoProyecto.value;
      }

      if (Object.keys(datos).length === 0) {
        errorMessage.value = 'No hay campos para actualizar.';
        return;
      }

      axios.put(`http://127.0.0.1:8000/cuentas/update/${selectedProject.value}`, datos)
        .then(response => {
          successMessage.value = 'Cuenta actualizada correctamente.';
          //limpiar();
          cargarProyectos();
        })
        .catch(error => {
          errorMessage.value = 'Error al actualizar la cuenta.';
        });
    };

    const limpiar = () => {
      cuenta.value = '';
      estado.value = '';
      codigo.value = '';
      selectedClasificacion.value = '';
      selectedTipoProyecto.value = '';
      selectedProject.value = '';
      errorMessage.value = '';
      successMessage.value = '';
      isEstadoEnabled.value = false;
    };

    onMounted(() => {
      cargarProyectos();
      cargarClasificaciones();
      cargarProyectosTipos();
    });

    watch(selectedProject, () => {
      isEstadoEnabled.value = !!selectedProject.value;
    });

    return {
      cuenta,
      estado,
      codigo,
      selectedClasificacion,
      selectedTipoProyecto,
      selectedProject,
      projects,
      clasificaciones,
      proyectos,
      insertar,
      actualizar,
      limpiar,
      cargarDatosProyecto,
      errorMessage,
      successMessage,
      isEstadoEnabled
    };
  },
};
</script>

