<template>
  <div>
    <!-- Primera división -->
    <div class="division-container">
      <div class="nombre-fecha-container">
        <div class="id-inputs">
          <label>Bancos</label>
          <select v-model="selectedBancos" @change="cargarDatosBanco">
            <option v-for="bank in bancos" :value="bank.banco">{{ bank.banco }}</option>
          </select>
        </div>
        <div class="nombre-inputs">
          <label>Nombre Banco</label>
          <div class="numero-input">
            <input type="text" v-model="banco">
          </div>
        </div>
        <div class="fecha-inputs">
          <label>Estado</label>
          <input type="text" v-model="estado" :disabled="isDisabled">
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

export default {
  name: 'Modals',
  setup() {
    const banco = ref('');
    const estado = ref('');
    const selectedBancos = ref('');
    const bancos = reactive([]);
    const errorMessage = ref(''); // Estado para errores
    const successMessage = ref(''); // Estado para mensajes de éxito
    const isDisabled = ref(true); // Estado para controlar el atributo disabled

    const cargarBancos = () => {
      axios.get('http://127.0.0.1:8000/bancos/get')
        .then((response) => {
          bancos.splice(0, bancos.length, ...response.data);
        })
        .catch(() => {
          errorMessage.value = 'Error al cargar bancos.';
        });
    };

    const cargarDatosBanco = () => {
      if (!selectedBancos.value) return;
      axios.get(`http://127.0.0.1:8000/bancos/getBancoName/${selectedBancos.value}`)
        .then(response => {
          const bancoData = response.data;
          banco.value = bancoData.banco;
          estado.value = bancoData.estado; // Actualizar el estado del banco
          isDisabled.value = false; // Habilitar el campo Estado
        })
        .catch(() => {
          errorMessage.value = 'Error al cargar datos del banco.';
        });
    };

    const insertar = () => {
      errorMessage.value = ''; // Limpiar errores previos
      successMessage.value = ''; // Limpiar mensajes de éxito previos

      if (!banco.value) {
        errorMessage.value = 'Por favor, completa el campo del nombre del banco.';
        return;
      }

      const datos = {
        banco: banco.value,
      };

      if (estado.value.trim() !== '') {
        datos.estado = estado.value.trim();
      }

      axios.post('http://127.0.0.1:8000/bancos/create', datos)
        .then(() => {
          successMessage.value = 'Banco guardado correctamente.';
          cargarBancos();
        })
        .catch(() => {
          errorMessage.value = 'Error al guardar el banco.';
        });
    };

    const actualizar = () => {
      errorMessage.value = ''; // Limpiar errores previos
      successMessage.value = ''; // Limpiar mensajes de éxito previos

      if (!selectedBancos.value) {
        errorMessage.value = 'Por favor, selecciona un banco.';
        return;
      }

      const datos = {};

      if (banco.value.trim() !== '') {
        datos.banco = banco.value;
      }

      if (estado.value.trim() !== '') {
        datos.estado = estado.value.trim();
      }

      if (Object.keys(datos).length === 0) {
        errorMessage.value = 'No hay campos para actualizar.';
        return;
      }

      axios.put(`http://127.0.0.1:8000/bancos/updatebyname/${selectedBancos.value}`, datos)
        .then(() => {
          successMessage.value = 'Banco actualizado correctamente.';
          cargarBancos();
        })
        .catch(() => {
          errorMessage.value = 'Error al actualizar el banco.';
        });
    };

    const limpiar = () => {
      banco.value = '';
      estado.value = '';
      selectedBancos.value = '';
      errorMessage.value = ''; // Limpiar mensaje de error
      successMessage.value = ''; // Limpiar mensaje de éxito
      isDisabled.value = true; // Deshabilitar el campo Estado
    };

    cargarBancos();

    return {
      banco,
      estado,
      selectedBancos,
      bancos,
      insertar,
      actualizar,
      limpiar,
      cargarDatosBanco,
      errorMessage,
      successMessage,
      isDisabled // Incluir la propiedad isDisabled
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
