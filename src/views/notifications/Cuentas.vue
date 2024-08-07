<template>
  <div>
    <!-- Primera división -->
    <div class="division-container">
      <div class="nombre-fecha-container">
        <div class="id-inputs">
          <label>Cuentas</label>
          <select v-model="selectedProject" @change="cargarDatosProyecto">
            <option v-for="project in projects" :value="project.cuenta" :key="project.cuenta">{{ project.cuenta }}</option>
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
          <input type="text" v-model="estado" :disabled="isDisabled">
        </div>
        <div class="fecha-inputs">
          <label>Código</label>
          <input type="text" v-model="codigo">
        </div>
        <div class="id-inputs">
          <label>Clasificación</label>
          <select v-model="selectedClasificacion" @change="cargarDatosClasificacion">
            <option v-for="clasificacion in clasificaciones" :value="clasificacion.id" :key="clasificacion.id">{{ clasificacion.tipo }}</option>
          </select>
        </div>
        <div class="id-inputs">
          <label>Proyecto</label>
          <select v-model="selectedTipoProyecto">
            <option v-for="tipo in tiposProyecto" :value="tipo.id" :key="tipo.id">{{ tipo.nombre }}</option>
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
import { ref, reactive, onMounted } from 'vue';

export default {
  name: 'Cuentas',
  setup() {
    const cuenta = ref('');
    const estado = ref('');
    const codigo = ref('');
    const tipo = ref('');
    const selectedProject = ref('');
    const selectedClasificacion = ref('');
    const selectedTipoProyecto = ref('');
    const projects = reactive([]);
    const clasificaciones = reactive([]);
    const tiposProyecto = reactive([]);
    const errorMessage = ref(''); // Estado para errores
    const successMessage = ref(''); // Estado para mensajes de éxito
    const isDisabled = ref(true);

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
      axios.get('http://localhost:8000/clasificacion/get')
        .then(response => {
          clasificaciones.splice(0, clasificaciones.length, ...response.data);
        })
        .catch(() => {
          errorMessage.value = 'Error al cargar las clasificaciones.';
        });
    };

    const cargarDatosTiposProyecto = () => {
      axios.get('http://127.0.0.1:8000/proyectos/get')
        .then(response => {
          tiposProyecto.splice(0, tiposProyecto.length, ...response.data);
        })
        .catch(() => {
          errorMessage.value = 'Error al cargar los tipos de proyecto.';
        });
    };

    const cargarDatosProyecto = () => {
      if (!selectedProject.value) return;

      axios.get(`http://127.0.0.1:8000/cuentas/getCuentaName/${selectedProject.value}`)
        .then(response => {
          const proyecto = response.data;
          cuenta.value = proyecto.cuenta;
          estado.value = proyecto.estado;
          codigo.value = proyecto.codigo;
          selectedClasificacion.value = proyecto.id_clasificacion;
          selectedTipoProyecto.value = proyecto.id_proyectos;
          isDisabled.value = false;

        })
        .catch(() => {
          errorMessage.value = 'Error al cargar los datos del proyecto.';
        });
    };

    const cargarDatosClasificacion = () => {
      if (!selectedClasificacion.value) return;
      axios.get(`http://localhost:8000/clasificacion/getTipo/${selectedClasificacion.value}`)
        .then(response => {
          const clasificacion = response.data;
          tipo.value = clasificacion.tipo;
        })
        .catch(() => {
          errorMessage.value = 'Error al cargar los datos de clasificación.';
        });
    };

    const insertar = () => {
      errorMessage.value = ''; // Limpiar errores previos
      successMessage.value = ''; // Limpiar mensajes de éxito previos

      if (!cuenta.value || !estado.value || !codigo.value || !selectedClasificacion.value || !selectedTipoProyecto.value) {
        errorMessage.value = 'Por favor, completa todos los campos.';
        return;
      }

      const datos = {
        cuenta: cuenta.value,
        estado: estado.value, 
        codigo: codigo.value,
        id_clasificacion: selectedClasificacion.value,
        id_proyectos: selectedTipoProyecto.value
      };

      axios.post('http://127.0.0.1:8000/cuentas/create', datos)
        .then(() => {
          successMessage.value = 'Cuenta guardada correctamente.';
          cargarProyectos();
        })
        .catch(() => {
          errorMessage.value = 'Error al guardar la cuenta.';
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

      if (estado.value.trim() !== '') {  // Verifica que el estado no está vacío
       datos.estado = estado.value.trim();
        }

      if (codigo.value.trim() !== '') {
        datos.codigo = codigo.value;
      }

      if (selectedClasificacion.value) {
        datos.id_clasificacion = selectedClasificacion.value;
      }

      if (selectedTipoProyecto.value) {
        datos.id_proyectos = selectedTipoProyecto.value;
      }

      if (Object.keys(datos).length === 0) {
        errorMessage.value = 'No hay campos para actualizar.';
        return;
      }

      console.log('Datos a actualizar:', datos);

      axios.put(`http://127.0.0.1:8000/cuentas/update/${selectedProject.value}`, datos)
        .then(() => {
          successMessage.value = 'Cuenta actualizada correctamente.';
          cargarProyectos();
        })
        .catch(() => {
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
      tipo.value = '';
      errorMessage.value = ''; // Limpiar mensaje de error
      successMessage.value = ''; // Limpiar mensaje de éxito
      isDisabled.value = true; 
    };

    onMounted(() => {
      cargarProyectos();
      cargarClasificaciones();
      cargarDatosTiposProyecto();
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
      tiposProyecto,
      insertar,
      actualizar,
      limpiar,
      cargarDatosProyecto,
      tipo,
      cargarDatosClasificacion,
      cargarDatosTiposProyecto,
      errorMessage,
      successMessage,
      isDisabled 
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
