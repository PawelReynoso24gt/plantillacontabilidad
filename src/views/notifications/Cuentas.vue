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
        <div class="tipo_cuenta">
          <label for="tipo_cuenta">Tipo Cuenta</label>
          <div class="tipo-cuenta-select">
            <select id="tipo_cuenta" v-model="tipo_cuenta">
              <option disabled value="">-- Selecciona --</option>
              <option value="ACTIVO">ACTIVO</option>
              <option value="PASIVO">PASIVO</option>
            </select>
          </div>
        </div>
        <div class="corriente">
          <label for="corriente">Corriente</label>
          <div class="corriente-select">
            <select id="corriente" v-model="corriente">
              <option disabled value="">-- Selecciona --</option>
              <option value="CORRIENTE">CORRIENTE</option>
              <option value="NO CORRIENTE">NO CORRIENTE</option>
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
import { ref, reactive, onMounted, watch } from 'vue';
import '../../styles/css/Cuentas.css'

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
    const tipo_cuenta = ref('');
    const corriente = ref('');

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
          estado.value = proyecto.estado ? proyecto.estado.toString() : '';
          codigo.value = proyecto.codigo;
          selectedClasificacion.value = proyecto.clasificacion;
          selectedTipoProyecto.value = proyecto.proyecto;
          isEstadoEnabled.value = true;
          tipo_cuenta.value = proyecto.tipo_cuenta === 1 ? 'ACTIVO' : proyecto.tipo_cuenta === 0 ? 'PASIVO' : '';
          corriente.value = proyecto.corriente === 1 ? 'CORRIENTE' : proyecto .corriente === 0 ? 'NO CORRIENTE' : '';
        })
        .catch(() => {
          errorMessage.value = 'Error al cargar los datos del proyecto.';
        });
    };

    const insertar = () => {
      errorMessage.value = '';
      successMessage.value = '';

      if (!cuenta.value || !codigo.value || !selectedClasificacion.value || !selectedTipoProyecto.value || !tipo_cuenta.value || !corriente.value) {
        errorMessage.value = 'Por favor, completa todos los campos.';
        return;
      }

      // map select labels to numeric flags expected by backend
      const tipo_cuentaFlag = tipo_cuenta.value === 'ACTIVO' ? 1 : tipo_cuenta.value === 'PASIVO' ? 0 : null;
      const corrienteFlag = corriente.value === 'CORRIENTE' ? 1 : corriente.value === 'NO CORRIENTE' ? 0 : null;

      const datos = {
        cuenta: cuenta.value,
        codigo: codigo.value,
        clasificacion: selectedClasificacion.value,
        proyecto: selectedTipoProyecto.value
      };

      if (tipo_cuentaFlag !== null) datos.tipo_cuenta = tipo_cuentaFlag;
      if (corrienteFlag !== null) datos.corriente = corrienteFlag;

      axios.post('http://127.0.0.1:8000/cuentas/create', datos)
        .then(response => {
          successMessage.value = 'Cuenta guardada correctamente.';
          //limpiar();
          cargarProyectos();
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
        datos.cuenta = cuenta.value;
      }

      if (estado.value.trim() !== '') {
        datos.estado = estado.value;
      }

      if (codigo.value.trim() !== '') {
        datos.codigo = codigo.value;
      }

      if (selectedClasificacion.value) {
        datos.clasificacion = selectedClasificacion.value;
      }

      if (selectedTipoProyecto.value) {
        datos.proyecto = selectedTipoProyecto.value;
      }

      const tipo_cuentaFlag = tipo_cuenta.value === 'ACTIVO' ? 1 : tipo_cuenta.value === 'PASIVO' ? 0 : null;
      if (tipo_cuentaFlag !== null) {
        datos.tipo_cuenta = tipo_cuentaFlag;
      }

      const corrienteFlag = corriente.value === 'CORRIENTE' ? 1 : corriente.value === 'NO CORRIENTE' ? 0 : null;
      if (corrienteFlag !== null) {
        datos.corriente = corrienteFlag;
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
      tipo_cuenta.value = '';
      corriente.value = '';
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
      isEstadoEnabled,
      tipo_cuenta,
      corriente
    };
  },
};
</script>

