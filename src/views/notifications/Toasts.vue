<template>
  <div>
    <!-- Primera división -->
    <div class="division-container">
      <div class="nombre-fecha-container">
        <div class="id-inputs">
          <label>Tipos de cuentas contables</label>
          <select v-model="selectedProject" @change="cargarDatosProyecto">
            <option v-for="project in projects" :value="project.tipo">{{ project.tipo }}</option>
          </select>
        </div>
        <div class="nombre-inputs">
          <label>Tipos</label>
          <div class="numero-input">
            <input type="text" v-model="tipo" placeholder="tipo...">
          </div>
        </div>
      </div>
    </div>

    <!-- Espacio entre la división 3 y el botón -->
    <div style="margin-top: 20px;"></div>

    <!-- Botón Agregar -->
    <button @click="insertar">Guardar</button>
    <button @click="actualizar" style="margin-left: 10px;">Actualizar</button>
    <button @click="limpiar" style="margin-left: 10px;">Limpiar</button>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, reactive } from 'vue';

export default {
  name: 'Badges',
  setup() {
    const tipo = ref('');
    const selectedProject = ref('');
    const projects = reactive([]);
    
    const cargarProyectos = () => {
      axios.get('http://127.0.0.1:8000/clasificacion/get').then((response) => {
        projects.splice(0, projects.length, ...response.data);
      });
    };

    const cargarDatosProyecto = () => {
      if (!selectedProject.value) return;
      axios.get(`http://localhost:8000/clasificacion/getTipo/${selectedProject.value}`)
        .then(response => {
          const proyecto = response.data;
          tipo.value = proyecto.tipo;
        })
        .catch(error => {
          console.error(error);
        });
    };

    const insertar = () => {
      const datos = {
        tipo: tipo.value,
      };

      axios.post('http://127.0.0.1:8000/clasificacion/create', datos)
        .then(response => {
          console.log(response.data);
          cargarProyectos();
        })
        .catch(error => {
          console.error(error);
        });
    };

    const actualizar = () => {
      if (!selectedProject.value) {
        console.log('Por favor, selecciona un tipo de cuenta.');
        return;
      }

      const datos = {};
      
      if (tipo.value.trim() !== '') {
        datos.tipo = tipo.value;
      }

      if (Object.keys(datos).length === 0) {
        console.log('No hay campos para actualizar');
        return;
      }

      axios.put(`http://127.0.0.1:8000/clasificacion/updateTipo/${selectedProject.value}`, datos)
        .then(response => {
          console.log(response.data);
          cargarProyectos();
        })
        .catch(error => {
          console.error(error);
        });
    };

    const limpiar = () => {
      tipo.value = '';
      selectedProject.value = '';
    };

    cargarProyectos();

    return {
      tipo,
      selectedProject,
      projects,
      insertar,
      actualizar,
      limpiar,
      cargarDatosProyecto
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
</style>
