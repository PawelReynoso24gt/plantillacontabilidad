<template>
  <div>
    <!-- Primera división -->
    <div class="division-container">
      <div class="nombre-fecha-container">
        <div class="id-inputs">
          <label>Cuentas</label>
          <select v-model="selectedProject" @change="cargarDatosProyecto">
            <option v-for="project in projects" :value="project.cuenta" :key="project.id_cuentas">{{ project.cuenta }}</option>
          </select>
        </div>
        <div class="nombre-inputs">
          <label>Cuentas</label>
          <div class="numero-input">
            <input type="text" v-model="cuenta">
          </div>
        </div>
        <div class="fecha-inputs">
          <label>Estado</label>
          <input type="text" v-model="estado" :disabled="!isEstadoEnabled">
        </div>
        <div class="fecha-inputs">
          <label>Código</label>
          <input type="text" v-model="codigo">
        </div>
        <div class="id-inputs">
          <label>Clasificación</label>
          <select v-model="selectedClasificacion">
            <option v-for="clasificacion in clasificaciones" :value="clasificacion.tipo" :key="clasificacion.id_clasificacion">{{ clasificacion.tipo }}</option>
          </select>
        </div>
        <div class="id-inputs">
          <label>Proyecto</label>
          <select v-model="selectedTipoProyecto">
            <option v-for="proyecto in proyectos" :value="proyecto.nombre" :key="proyecto.id_proyectos">{{ proyecto.nombre }}</option>
          </select>
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

