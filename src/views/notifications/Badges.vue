<template>
  <div>
    <!-- Primera división -->
    <div class="division-container">
      <div class="nombre-fecha-container">
        <div class="id-inputs">
          <label>Proyecto</label>
          <select v-model="selectedProject" @change="cargarDatosProyecto">
            <option v-for="project in projects" :value="project.nombre">{{ project.nombre }}</option>
          </select>
        </div>
        <div class="nombre-inputs">
          <label>Nombre Proyecto</label>
          <div class="numero-input">
            <input type="text" v-model="nombre">
          </div>
        </div>
        <div class="fecha-inputs">
          <label>Estado</label>
          <input type="text" v-model="estado">
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
import '../../styles/css/badges.css'; 

export default {
  name: 'Badges',
  setup() {
    const nombre = ref('');
    const estado = ref('');
    const selectedProject = ref('');
    const projects = reactive([]);
    const errorMessage = ref(''); // Estado para errores
    const successMessage = ref(''); // Estado para mensajes de éxito

    const cargarProyectos = () => {
      axios.get('http://127.0.0.1:8000/proyectos/get')
        .then((response) => {
          projects.splice(0, projects.length, ...response.data);
        })
        .catch(() => {
          errorMessage.value = 'Error al cargar proyectos.';
        });
    };

    const cargarDatosProyecto = () => {
      if (!selectedProject.value) return;
      axios.get(`http://127.0.0.1:8000/proyectos/getProjectName/${selectedProject.value}`)
        .then(response => {
          const proyecto = response.data;
          nombre.value = proyecto.nombre;
          estado.value = proyecto.estado.toString();
        })
        .catch(() => {
          errorMessage.value = 'Error al cargar datos del proyecto.';
        });
    };

    const insertar = () => {
      errorMessage.value = ''; // Limpiar errores previos
      successMessage.value = ''; // Limpiar mensajes de éxito previos

      if (!nombre.value || !estado.value) {
        errorMessage.value = 'Por favor, completa todos los campos.';
        return;
      }

      const datos = {
        nombre: nombre.value,
        estado: estado.value,
      };

      axios.post('http://127.0.0.1:8000/proyectos/create', datos)
        .then(() => {
          successMessage.value = 'Datos guardados correctamente.';
          cargarProyectos();
        })
        .catch(() => {
          errorMessage.value = 'Error al guardar los datos.';
        });
    };

    const actualizar = () => {
      errorMessage.value = ''; // Limpiar errores previos
      successMessage.value = ''; // Limpiar mensajes de éxito previos

      if (!selectedProject.value) {
        errorMessage.value = 'Por favor, selecciona un proyecto.';
        return;
      }

      const datos = {};

      if (nombre.value.trim() !== '') {
        datos.nombre = nombre.value;
      }

      if (estado.value.trim() !== '') {
        datos.estado = estado.value;
      }

      if (Object.keys(datos).length === 0) {
        errorMessage.value = 'No hay campos para actualizar.';
        return;
      }

      axios.put(`http://127.0.0.1:8000/proyectos/update/${selectedProject.value}`, datos)
        .then(() => {
          successMessage.value = 'Datos actualizados correctamente.';
          cargarProyectos();
        })
        .catch(() => {
          errorMessage.value = 'Error al actualizar los datos.';
        });
    };

    const limpiar = () => {
      nombre.value = '';
      estado.value = '';
      selectedProject.value = '';
      errorMessage.value = ''; // Limpiar mensaje de error
      successMessage.value = ''; // Limpiar mensaje de éxito
    };

    cargarProyectos();

    return {
      nombre,
      estado,
      selectedProject,
      projects,
      insertar,
      actualizar,
      limpiar,
      cargarDatosProyecto,
      errorMessage,
      successMessage
    };
  },
};
</script>

