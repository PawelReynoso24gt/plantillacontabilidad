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
          <input type="text" v-model="estado" :disabled="isDisabled">
        </div>
        <div class="nombre-inputs">
          <label>Bancos a asignar/editar</label>
          <div class="numero-input">
            <select v-model="banco">
              <option v-for="banco in bancos" :key="banco.id" :value="banco.banco">{{ banco.banco }}</option>
            </select>
          </div>
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
import '../../styles/css/CuentasBancarias.css'

export default {
  name: 'Cuentas',
  setup() {
    const numero_cuenta = ref('');
    const estado = ref('');
    const banco = ref('');
    const selectedProject = ref('');
    const projects = reactive([]);
    const bancos = reactive([]);
    const errorMessage = ref(''); // Estado para errores
    const successMessage = ref(''); // Estado para mensajes de éxito
    const isDisabled = ref(true); // Estado para controlar el atributo disabled

    const cargarCuentas = () => {
      axios.get('http://127.0.0.1:8000/cuentasB/get')
        .then((response) => {
          projects.splice(0, projects.length, ...response.data);
        })
        .catch(() => {
          errorMessage.value = 'Error al cargar las cuentas bancarias.';
        });
    };

    const cargarBancos = () => {
      axios.get('http://127.0.0.1:8000/bancos/get')
        .then((response) => {
          bancos.splice(0, bancos.length, ...response.data);
        })
        .catch(() => {
          errorMessage.value = 'Error al cargar los bancos.';
        });
    };

    const cargarDatosCuenta = () => {
      if (!selectedProject.value) return;
      axios.get(`http://127.0.0.1:8000/cuentasB/cuentas_bancarias/${selectedProject.value}`)
        .then(response => {
          const proyecto = response.data;
          numero_cuenta.value = proyecto.numero_cuenta;
          estado.value = proyecto.estado.toString(); // Aseguramos que estado sea una cadena de texto
          banco.value = proyecto.banco; // Actualizamos el valor del banco seleccionado
          isDisabled.value = false; // Habilitamos el campo Estado
        })
        .catch(() => {
          errorMessage.value = 'Error al cargar los datos de la cuenta.';
        });
    };

    const insertar = () => {
      errorMessage.value = ''; // Limpiar errores previos
      successMessage.value = ''; // Limpiar mensajes de éxito previos

      if (!numero_cuenta.value || !banco.value) {
        errorMessage.value = 'Por favor, completa todos los campos.';
        return;
      }

      const datos = {
        numero_cuenta: numero_cuenta.value,
        banco: banco.value,
        estado: estado.value.trim() !== '' ? estado.value.trim() : '1', // Valor por defecto para estado
      };

      axios.post('http://127.0.0.1:8000/cuentasB/create', datos)
        .then(() => {
          successMessage.value = 'Cuenta bancaria guardada correctamente.';
          cargarCuentas();
        })
        .catch(() => {
          errorMessage.value = 'Error al guardar la cuenta bancaria.';
        });
    };

    const actualizar = () => {
      errorMessage.value = ''; // Limpiar errores previos
      successMessage.value = ''; // Limpiar mensajes de éxito previos

      if (!selectedProject.value) {
        errorMessage.value = 'Por favor, selecciona una cuenta bancaria.';
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
        datos.banco = banco.value;
      }

      if (Object.keys(datos).length === 0) {
        errorMessage.value = 'No hay campos para actualizar.';
        return;
      }

      axios.put(`http://127.0.0.1:8000/cuentasB/update/${selectedProject.value}`, datos)
        .then(() => {
          successMessage.value = 'Cuenta bancaria actualizada correctamente.';
          cargarCuentas();
        })
        .catch(() => {
          errorMessage.value = 'Error al actualizar la cuenta bancaria.';
        });
    };

    const limpiar = () => {
      numero_cuenta.value = '';
      estado.value = '';
      banco.value = '';
      selectedProject.value = '';
      errorMessage.value = ''; // Limpiar mensaje de error
      successMessage.value = ''; // Limpiar mensaje de éxito
      isDisabled.value = true; // Deshabilitar el campo Estado
    };

    onMounted(() => {
      cargarCuentas();
      cargarBancos(); // Cargar los bancos al montar el componente
    });

    return {
      numero_cuenta,
      estado,
      banco,
      selectedProject,
      projects,
      bancos,
      insertar,
      actualizar,
      limpiar,
      cargarDatosCuenta,
      errorMessage,
      successMessage,
      isDisabled // Incluir la propiedad isDisabled
    };
  },
};
</script>

