<template>
  <div>
    <!-- Primera división -->
    <div class="division-container">
      <div class="nombre-fecha-container">
        <div class="id-inputs">
          <label>Cuentas Bancarias</label>
          <select v-model="selectedProject" @change="cargarDatosCuenta">
            <option v-for="project in projects" :key="project.id_cuentas_bancarias" :value="project.numero_cuenta">{{ project.numero_cuenta }}</option>
          </select>
        </div>
        <div class="fecha-inputs">
          <label>Numero de Cuenta</label>
          <input type="text" v-model="numero_cuenta">
        </div>
        <div class="fecha-inputs">
          <label>Estado</label>
          <input type="text" v-model="estado">
        </div>
        <div class="fecha-inputs">
          <label>Nombre Banco</label>
          <input type="text" v-model="banco">
        </div>
        <div class="nombre-inputs">
          <label>Bancos a editar</label>
          <div class="numero-input">
            <select v-model="banco">
              <option v-for="banco in bancos" :key="banco.id" :value="banco.banco">{{ banco.banco }}</option>
            </select>
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
import { ref, reactive, onMounted } from 'vue';

export default {
  name: 'Cuentas',
  setup() {
    const cuenta = ref('');
    const estado = ref('');
    const codigo = ref('');
    const id_clasificacion = ref('');
    const id_proyectos = ref('');
    const selectedProject = ref('');
    const numero_cuenta = ref('');
    const projects = reactive([]);
    const banco = ref(''); // Cambio: usar 'banco' en lugar de 'id_bancos'
    const bancos = reactive([]);

    const cargarCuentas = () => {
      axios.get('http://127.0.0.1:8000/cuentasB/get').then((response) => {
        projects.splice(0, projects.length, ...response.data);
      });
    };

    const cargarDatosBanco = () => {
      axios.get('http://127.0.0.1:8000/cuentasB/getWithBancos').then((response) => {
        bancos.splice(0, bancos.length, ...response.data);
      });
    };

    const cargarDatosCuenta = () => {
      if (!selectedProject.value) return;
      axios.post(`http://127.0.0.1:8000/cuentasB/getNumeroCuenta/${selectedProject.value}`)
        .then(response => {
          const proyecto = response.data;
          numero_cuenta.value = proyecto.numero_cuenta; 
          estado.value = proyecto.estado;
          banco.value = proyecto.nombre_banco; // Cambio: asignar el nombre del banco
        })
        .catch(error => {
          console.error(error);
        });
    };

    const insertar = () => {
      const datos = {
        numero_cuenta: numero_cuenta.value,
        estado: estado.value,
        banco: banco.value, 
      };

      axios.post('http://127.0.0.1:8000/cuentasB/create', datos)
        .then(response => {
          console.log(response.data);
          cargarCuentas();
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
      
      if (numero_cuenta.value.trim() !== '') {
        datos.numero_cuenta = numero_cuenta.value;
      }

      if (typeof estado.value === 'string' && estado.value.trim() !== '') {
        datos.estado = estado.value.trim();
      }

      if (banco.value.trim() !== '') {
        datos.nombre_banco = banco.value;
      }

      if (Object.keys(datos).length === 0) {
        console.log('No hay campos para actualizar');
        return;
      }

      axios.put(`http://127.0.0.1:8000/cuentasB/update/${selectedProject.value}`, datos)
        .then(response => {
          console.log(response.data);
          cargarCuentas();
        })
        .catch(error => {
          console.error(error);
        });
    };

    const limpiar = () => {
      numero_cuenta.value = '';
      estado.value = '';
      banco.value = ''; // Cambio: limpiar el nombre del banco
      id_clasificacion.value = '';
      id_proyectos.value = '';
      selectedProject.value = '';
    };

    onMounted(() => {
      cargarCuentas();
      cargarDatosBanco();
    });

    return {
      cuenta,
      estado,
      codigo,
      id_clasificacion,
      id_proyectos,
      selectedProject,
      projects,
      insertar,
      actualizar,
      limpiar,
      cargarDatosCuenta,
      numero_cuenta,
      banco, // Cambio: retornar 'banco' en lugar de 'id_bancos'
      bancos
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
