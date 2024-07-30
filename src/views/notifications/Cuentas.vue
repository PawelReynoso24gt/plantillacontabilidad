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
          <input type="text" v-model="estado">
        </div>
        <div class="fecha-inputs">
          <label>Codigo</label>
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
          <select v-model="selectedTipoProyecto" @change="cargarDatosTiposProyecto">
            <option v-for="tipo in tiposProyecto" :value="tipo.id" :key="tipo.id">{{ tipo.nombre }}</option>
          </select>
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
  name: 'Cuentas',
  setup() {
    const cuenta = ref('');
    const estado = ref('');
    const codigo = ref('');
    const tipo = ref('');
    const id_clasificacion = ref('');
    const id_proyectos = ref('');
    const selectedProject = ref('');
    const selectedClasificacion = ref('');
    const selectedTipoProyecto = ref('');
    const projects = reactive([]);
    const clasificaciones = reactive([]);
    const tiposProyecto = reactive([]);

    const cargarProyectos = () => {
      axios.get('http://127.0.0.1:8000/cuentas/get').then((response) => {
        projects.splice(0, projects.length, ...response.data);
      });
    };

    const cargarClasificaciones = () => {
      axios.get('http://localhost:8000/clasificacion/get').then((response) => {
        clasificaciones.splice(0, clasificaciones.length, ...response.data);
      });
    };

    const cargarDatosTiposProyecto = () => {
      axios.get(`http://127.0.0.1:8000/proyectos/get`).then((response) => {
        tiposProyecto.splice(0, tiposProyecto.length, ...response.data);
      });
    };
    

      const cargarDatosProyecto = () => {
    if (!selectedProject.value) return;

    axios.get(`http://127.0.0.1:8000/cuentas/getCuentaName/${selectedProject.value}`)
      .then(response => {
        const proyecto = response.data;
        console.log('Datos del proyecto:', proyecto); 
        cuenta.value = proyecto.cuenta;
        estado.value = proyecto.estado;
        codigo.value = proyecto.codigo;
        selectedClasificacion.value = proyecto.id_clasificacion;
        selectedTipoProyecto.value = proyecto.id_proyectos; 

      })
      .catch(error => {
        console.error('Error al cargar datos del proyecto:', error);
      });
  };

    const cargarDatosClasificacion = () => {
      if (!selectedClasificacion.value) return;
      axios.get(`http://localhost:8000/clasificacion/getTipo/${selectedClasificacion.value}`)
        .then(response => {
          const clasificacion = response.data;
          tipo.value = clasificacion.tipo;
        })
        .catch(error => {
          console.error(error);
        });
    };

    const insertar = () => {
      const datos = {
        cuenta: cuenta.value,
        estado: estado.value,
        codigo: codigo.value,
        id_clasificacion: id_clasificacion.value,
        id_proyectos: id_proyectos.value
      };

      axios.post('http://127.0.0.1:8000/cuentas/create', datos)
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
        console.log('Por favor, selecciona un proyecto.');
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

      if (id_clasificacion.value.trim() !== '') {
        datos.id_clasificacion = id_clasificacion.value;
      }

      if (id_proyectos.value.trim() !== '') {
        datos.id_proyectos = id_proyectos.value;
      }

      if (Object.keys(datos).length === 0) {
        console.log('No hay campos para actualizar');
        return;
      }

      axios.put(`http://127.0.0.1:8000/cuentas/update/${selectedProject.value}`, datos)
        .then(response => {
          console.log(response.data);
          cargarProyectos();
        })
        .catch(error => {
          console.error(error);
        });
    };

    const limpiar = () => {
      cuenta.value = '';
      estado.value = '';
      codigo.value = '';
      id_clasificacion.value = '';
      id_proyectos.value = '';
      selectedProject.value = '';
      selectedClasificacion.value = '';
      selectedTipoProyecto.value = '';
      tipo.value = '';
    };

    cargarProyectos();
    cargarClasificaciones();
    cargarDatosTiposProyecto();

    return {
      cuenta,
      estado,
      codigo,
      id_clasificacion,
      id_proyectos,
      selectedProject,
      selectedClasificacion,
      selectedTipoProyecto,
      projects,
      clasificaciones,
      tiposProyecto,
      insertar,
      actualizar,
      limpiar,
      cargarDatosProyecto,
      tipo,
      cargarDatosClasificacion,
      cargarDatosTiposProyecto
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
  