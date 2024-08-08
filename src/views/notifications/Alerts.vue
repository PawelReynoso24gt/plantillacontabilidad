<template>
  <div>
    <!-- Primera división -->
    <div class="division-container">
      <div class="nombre-fecha-container">
        <div class="id-inputs">
          <label>Usuarios</label>
          <select v-model="selectedProject" @change="cargarDatosProyecto">
            <option v-for="project in projects" :key="project.id" :value="project">{{ project.usuarios }}</option>
          </select>
        </div>
        <div class="nombre-inputs">
          <label>Usuario</label>
          <div class="numero-input">
            <input type="text" v-model="usuarios" placeholder="Ingrese el nombre de usuario">
          </div>
        </div>
        <div class="nombre-inputs">
          <label>Contraseñas</label>
          <div class="numero-input">
            <input :type="showPassword ? 'text' : 'password'" v-model="contrasenias" placeholder="Ingrese la contraseña">
            <button @click="togglePasswordVisibility">{{ showPassword ? 'Ocultar' : 'Mostrar' }}</button>
          </div>
        </div>
        <div class="fecha-inputs">
          <label>Estado</label>
          <input type="text" v-model="estado" :disabled="!estadoenabled">
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
import { ref, reactive, computed } from 'vue';

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
      axios.get('http://hogarsantaluisa.test/logins/getLogins')
        .then(response => {
          projects.value = response.data;
        })
        .catch(() => {
          errorMessage.value = 'Error al cargar usuarios.';
        });
    };

    const cargarDatosProyecto = () => {
      if (!selectedProject.value) return;
      axios.get(`http://hogarsantaluisa.test/logins/getProjectName/${selectedProject.value.usuarios}`)
        .then(response => {
          const proyecto = response.data;
          usuarios.value = proyecto.usuarios;
          contrasenias.value = proyecto.contrasenias;
          estado.value = proyecto.estado.toString();
        })
        .catch(() => {
          errorMessage.value = 'Error al cargar datos del usuario.';
        });
    }

    const insertar = () => {
      // Limpiar mensajes antes de intentar guardar
      errorMessage.value = '';
      successMessage.value = '';

      if (!usuarios.value || !contrasenias.value) {
        errorMessage.value = 'Por favor, completa todos los campos.';
        return;
      }

      const datos = {
        usuarios: usuarios.value,
        contrasenias: contrasenias.value,
        estado: estado.value,
      };

      axios.post('http://hogarsantaluisa.test/logins/create', datos)
        .then(() => {
          successMessage.value = 'Datos guardados correctamente.';
          cargarProyectos();
          // Limpiar los campos después de guardar (comentar si no se necesita)
          // limpiar(); 
        })
        .catch(() => {
          errorMessage.value = 'Error al guardar los datos.';
        });
    };

    const actualizar = () => {
      // Limpiar mensajes antes de intentar actualizar
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

      axios.put(`http://hogarsantaluisa.test/logins/update/${selectedProject.value.usuarios}`, datos)
        .then(() => {
          successMessage.value = 'Datos actualizados correctamente.';
          cargarProyectos();
          // Limpiar los campos después de actualizar (comentar si no se necesita)
          // limpiar(); 
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
      // Limpiar mensajes también al limpiar los campos
      errorMessage.value = '';
      successMessage.value = '';
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

/* Estilos para el mensaje de error */
.text-danger {
  color: red;
  font-weight: bold;
}

/* Estilos para el mensaje de éxito */
.text-success {
  color: green;
  font-weight: bold;
}
</style>
