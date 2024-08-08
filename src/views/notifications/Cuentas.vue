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
<<<<<<< HEAD
          estado.value = proyecto.estado.toString();
          codigo.value = proyecto.codigo;
          selectedClasificacion.value = proyecto.id_clasificacion;
          selectedTipoProyecto.value = proyecto.id_proyectos;
          isDisabled.value = false;
=======
          estado.value = proyecto.estado ? proyecto.estado.toString() : '';
          codigo.value = proyecto.codigo;
          selectedClasificacion.value = proyecto.clasificacion;
          selectedTipoProyecto.value = proyecto.proyecto;
          isEstadoEnabled.value = true;
>>>>>>> 599049b80dea2198531f8d3457788fe25d492947
        })
        .catch(() => {
          errorMessage.value = 'Error al cargar los datos del proyecto.';
        });
    };

<<<<<<< HEAD
    const cargarDatosClasificacion = () => {
      if (!selectedClasificacion.value) return;
      axios.get(`http://127.0.0.1:8000/clasificacion/getTipo/${selectedClasificacion.value}`)
        .then(response => {
          const clasificacion = response.data;
          tipo.value = clasificacion.tipo;
        })
        .catch(() => {
          errorMessage.value = 'Error al cargar los datos de clasificación.';
        });
    };

=======
>>>>>>> 599049b80dea2198531f8d3457788fe25d492947
    const insertar = () => {
      errorMessage.value = '';
      successMessage.value = '';

<<<<<<< HEAD
      if (!cuenta.value.trim() || !codigo.value.trim() || !selectedClasificacion.value || !selectedTipoProyecto.value) {
=======
      if (!cuenta.value || !codigo.value || !selectedClasificacion.value || !selectedTipoProyecto.value) {
>>>>>>> 599049b80dea2198531f8d3457788fe25d492947
        errorMessage.value = 'Por favor, completa todos los campos.';
        return;
      }

      const datos = {
<<<<<<< HEAD
        cuenta: cuenta.value.trim(),
        codigo: codigo.value.trim(),
        id_clasificacion: selectedClasificacion.value,
        id_proyectos: selectedTipoProyecto.value
=======
        cuenta: cuenta.value,
        codigo: codigo.value,
        clasificacion: selectedClasificacion.value,
        proyecto: selectedTipoProyecto.value
>>>>>>> 599049b80dea2198531f8d3457788fe25d492947
      };

      axios.post('http://127.0.0.1:8000/cuentas/create', datos)
        .then(response => {
          successMessage.value = 'Cuenta guardada correctamente.';
          //limpiar();
          cargarProyectos();
          limpiar();
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
        datos.cuenta = cuenta.value.trim();
      }

<<<<<<< HEAD
      if (estado.value.trim() !== '') {  // Verifica que el estado no está vacío
        datos.estado = String(estado.value).trim();
=======
      if (estado.value.trim() !== '') {
        datos.estado = estado.value;
>>>>>>> 599049b80dea2198531f8d3457788fe25d492947
      }

      if (codigo.value.trim() !== '') {
        datos.codigo = codigo.value.trim();
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
          limpiar();
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

<style scoped>
/* Estilos para el contenedor principal */
.container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
}

/* Estilos para las divisiones */
.division-container {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  margin-top: 10px;
}

/* Estilos para las etiquetas */
label {
  display: block;
  margin-bottom: 5px;
}

/* Estilos para los campos de entrada */
input[type="text"],
input[type="date"],
select {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  box-sizing: border-box;
}

/* Estilos para el botón */
button {
  padding: 10px 20px;
  background-color: #14491b;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #475f27;
}

/* Estilos para los campos de entrada de número y select */
.numero-fecha-container {
  display: flex;
}

.numero-inputs,
.fecha-inputs {
  flex: 1;
  margin-right: 10px;
}

.numero-inputs label,
.fecha-inputs label {
  display: block;
}

/* Estilos para los campos de entrada de número */
.numero-input {
  display: flex;
}

.numero-input input[type="text"] {
  margin-right: 10px;
}

/* Estilos para los campos de entrada de fecha */
.fecha-container {
  flex: 1;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 5px;
}

.fecha-container label {
  display: block;
}

.fecha-container select {
  width: calc(100% - 10px);
  border: none;
  outline: none;
}

/* Estilos para los contenedores de entrada */
.input-container {
  display: flex;
  align-items: center;
}

.input-container label {
  width: 150px; /* Ancho fijo para las etiquetas */
  margin-right: 10px;
}

.input-container select,
.input-container input {
  flex: 1;
}

/* Estilos para los mensajes de éxito y error */
.text-success {
  color: green;
}

.text-danger {
  color: red;
}
</style>
