<template>
      <!-- Encabezado -->
      <div class="estado-header">
        <h2 class="estado-title">Gestión de cuentas bancarias</h2>
        <p class="estado-subtitle">
          Administra las cuentas bancarias registradas y actualiza su información.
        </p>
      </div>

      <!-- Formulario principal -->
      <div class="nombre-fecha-container">
        <!-- Fila 1 -->
        <div class="row-inline">
          <div class="field-group">
            <label class="field-label">Cuentas registradas</label>
            <select
              v-model="selectedProject"
              @change="cargarDatosCuenta"
              class="field-control"
            >
              <option disabled value="">Seleccione una cuenta</option>
              <option
                v-for="project in projects"
                :key="project.id_cuentas_bancarias"
                :value="project.numero_cuenta"
              >
                {{ project.numero_cuenta }}
              </option>
            </select>
          </div>

          <div class="field-group">
            <label class="field-label">Número de cuenta</label>
            <input
              type="text"
              v-model="numero_cuenta"
              class="field-control"
              placeholder="Ej. 123456789"
            />
          </div>
        </div>

        <!-- Fila 2 -->
        <div class="row-inline">
          <div class="field-group">
            <label class="field-label">Estado</label>
            <input
              type="text"
              v-model="estado"
              :disabled="isDisabled"
              class="field-control"
              placeholder="1 = Activo, 0 = Inactivo"
            />
          </div>

          <div class="field-group">
            <label class="field-label">Banco asignado</label>
            <select
              v-model="banco"
              class="field-control"
            >
              <option disabled value="">Seleccione un banco</option>
              <option
                v-for="bn in bancos"
                :key="bn.id"
                :value="bn.banco"
              >
                {{ bn.banco }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Mensajes -->
      <div class="messages-container">
        <p v-if="errorMessage" class="text-danger">{{ errorMessage }}</p>
        <p v-if="successMessage" class="text-success">{{ successMessage }}</p>
      </div>

      <!-- Botones -->
      <div class="form-actions">
        <button class="btn-primary" @click="insertar">Guardar</button>
        <button class="btn-secondary" @click="actualizar">Actualizar</button>
        <button class="btn-ghost" @click="limpiar">Limpiar</button>
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

