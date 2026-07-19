<template>
  <div class="page-wrapper">
    <div class="page-card">
      <!-- Encabezado -->
      <div class="module-header">
        <div>
          <h2 class="module-title">Gestión de cuentas contables</h2>
          <p class="module-subtitle">
            Crea, actualiza y administra las cuentas usadas en los reportes contables.
          </p>
        </div>
      </div>

<!-- Formulario principal -->
  <div class="nombre-fecha-container">
    <!-- Fila 1: selección de cuenta + nombre de cuenta -->
    <div class="row-inline">
      <!-- Select de cuentas - MODIFICADO -->
      <div class="field-group">
        <label class="field-label">Cuentas registradas</label>
        <select
          v-model="selectedProject"
          @change="cargarDatosProyecto"
          class="field-control"
        >
          <option disabled :value="null">Seleccione una cuenta</option>
          <option
            v-for="project in projects"
            :key="project.id_cuentas"
            :value="{ nombre: project.cuenta, id: project.id_cuentas }"
          >
            {{ project.cuenta }} ({{ project.codigo }}) - {{ project.proyecto }}
          </option>
        </select>
        <small v-if="fieldErrors.selectedProject" class="error-text">{{ fieldErrors.selectedProject }}</small>
      </div>

      <!-- Nombre de la cuenta -->
      <div class="field-group">
        <label class="field-label">Nombre de la cuenta</label>
        <input
          type="text"
          v-model="cuenta"
          class="field-control"
          placeholder="Ingrese el nombre de la cuenta"
        />
        <small v-if="fieldErrors.cuenta" class="error-text">{{ fieldErrors.cuenta }}</small>
      </div>
    </div>

        <!-- Fila 2: estado + código -->
        <div class="row-inline">
          <!-- Estado -->
          <div class="field-group">
            <label class="field-label">Estado</label>
            <input
              type="text"
              v-model="estado"
              :disabled="!isEstadoEnabled"
              class="field-control"
              placeholder="1 = Activo, 0 = Inactivo"
            />
            <small v-if="fieldErrors.estado" class="error-text">{{ fieldErrors.estado }}</small>
          </div>

          <!-- Código -->
          <div class="field-group">
            <label class="field-label">Código contable</label>
            <input
              type="text"
              v-model="codigo"
              class="field-control"
              placeholder="Ej. 1.1.1"
            />
            <small v-if="fieldErrors.codigo" class="error-text">{{ fieldErrors.codigo }}</small>
          </div>
        </div>

        <!-- Fila 3: clasificación + proyecto -->
        <div class="row-inline">
          <!-- Clasificación -->
          <div class="field-group">
            <label class="field-label">Clasificación</label>
            <select
              v-model="selectedClasificacion"
              class="field-control"
            >
              <option disabled value="">Seleccione una clasificación</option>
              <option
                v-for="clasificacion in clasificaciones"
                :key="clasificacion.id_clasificacion"
                :value="clasificacion.tipo"
              >
                {{ clasificacion.tipo }}
              </option>
            </select>
            <small v-if="fieldErrors.selectedClasificacion" class="error-text">{{ fieldErrors.selectedClasificacion }}</small>
          </div>

          <!-- Proyecto -->
          <div class="field-group">
            <label class="field-label">Proyecto</label>
            <select
              v-model="selectedTipoProyecto"
              class="field-control"
            >
              <option disabled value="">Seleccione un proyecto</option>
              <option
                v-for="proyecto in proyectos"
                :key="proyecto.id_proyectos"
                :value="proyecto.nombre"
              >
                {{ proyecto.nombre }}
              </option>
            </select>
            <small v-if="fieldErrors.selectedTipoProyecto" class="error-text">{{ fieldErrors.selectedTipoProyecto }}</small>
          </div>
        </div>
        <div class="row-inline">
          <div class="tipo_cuenta">
            <label class="field-label">Tipo Cuenta</label>
            <div class="tipo-cuenta-select">
              <select id="tipo_cuenta" v-model="tipo_cuenta" class="field-control">
                <option disabled value="">Seleccione</option>
                <option value="ACTIVO">ACTIVO</option>
                <option value="PASIVO">PASIVO</option>
              </select>
              <small v-if="fieldErrors.tipo_cuenta" class="error-text">{{ fieldErrors.tipo_cuenta }}</small>
            </div>
          </div>
          <div class="corriente">
            <label class="field-label">Corriente</label>
            <div class="corriente-select">
              <select id="corriente" v-model="corriente" class="field-control">
                <option disabled value="">Seleccione</option>
                <option value="CORRIENTE">CORRIENTE</option>
                <option value="NO CORRIENTE">NO CORRIENTE</option>
              </select>
              <small v-if="fieldErrors.corriente" class="error-text">{{ fieldErrors.corriente }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones -->
      <div class="form-actions">
        <button class="btn btn-primary" @click="insertar">
          Guardar
        </button>
        <button class="btn btn-secondary" @click="actualizar">
          Actualizar
        </button>
        <button class="btn btn-ghost" @click="limpiar">
          Limpiar
        </button>
      </div>

    </div><!-- /page-card -->
  </div><!-- /page-wrapper -->  <!-- **MODAL DE CREACIÓN/ACTUALIZACIÓN CORRECTA** ================================================================================================================================ -->
  <div v-if="mostrarModalExitoFormulario" class="modal-overlay">
    <div class="modal-content deposito-card" style="max-width: 450px; text-align: center;">
      <div style="margin-bottom: 1.5rem;">
        <div style="font-size: 3rem; color: #28a745; margin-bottom: 1rem;">✓</div>
        <h3 style="color: #14491b; margin-bottom: 0.5rem;">¡Operación Exitosa!</h3>
        <p style="color: #6c757d;">Los datos de la cuenta se han guardado/actualizado correctamente.</p>
      </div>
      <div class="form-actions" style="justify-content: center;">
        <button class="btn-primary" @click="cerrarModalExitoFormulario" style="min-width: 120px;">
          Aceptar
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import '@/styles/global.css';;
import '../../styles/css/GlobalAlertsModals.css';
import { manejarErrorRuta } from '../../../utils/manejarErrores.js';

export default {
  name: 'Cuentas',
  setup() {
    const router = useRouter();
    const mostrarModalExitoFormulario = ref(false);
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
    
    // Variable para almacenar el id_cuentas seleccionado
    const selectedIdCuentas = ref('');

    const fieldErrors = reactive({
      selectedProject: '',
      cuenta: '',
      estado: '',
      codigo: '',
      selectedClasificacion: '',
      selectedTipoProyecto: '',
      tipo_cuenta: '',
      corriente: ''
    });

    const mostrarErrorCampo = (campo, mensaje) => {
      fieldErrors[campo] = mensaje;
      setTimeout(() => {
        fieldErrors[campo] = '';
      }, 5000);
    };

    onMounted(() => { 
      cargarProyectos();
      cargarClasificaciones();
      cargarProyectosTipos();
      window.addEventListener('keydown', manejarEnter);
    });

    onUnmounted(() => {
      // Apagamos el detector de teclado al salir de la pantalla
      window.removeEventListener('keydown', manejarEnter);
    });

    const manejarEnter = (event) => {
      if (event.key === 'Enter') {
        // En esta pantalla SOLO existe este modal de éxito
        if (mostrarModalExitoFormulario.value) {
          event.preventDefault();
          cerrarModalExitoFormulario(); 
        }
      }
    };

    const cerrarModalExitoFormulario = () => {
        mostrarModalExitoFormulario.value = false;
        limpiar(); 
    };

    const cargarProyectos = () => {
      axios.get('http://127.0.0.1:8000/cuentas/get')
        .then(response => {
          projects.splice(0, projects.length, ...response.data);
        })
        .catch((err) => {
          console.error("Error al cargar cuentas:", err);
          manejarErrorRuta(err, router);
        });
    };

    const cargarClasificaciones = () => {
      axios.get('http://127.0.0.1:8000/clasificacion/get')
        .then(response => {
          clasificaciones.splice(0, clasificaciones.length, ...response.data);
        })
        .catch((err) => {
          console.error("Error al cargar clasificaciones:", err);
          manejarErrorRuta(err, router);
        });
    };

    const cargarProyectosTipos = () => {
      axios.get('http://127.0.0.1:8000/proyectos/get')
        .then(response => {
          proyectos.splice(0, proyectos.length, ...response.data);
        })
        .catch((err) => {
          console.error("Error al cargar tipos de proyectos:", err);
          manejarErrorRuta(err, router);
        });
    };

    const cargarDatosProyecto = () => {
      if (!selectedProject.value) return;
      
      // selectedProject.value ahora será un objeto con nombre e id
      const nombreCuenta = selectedProject.value.nombre;
      const idCuentas = selectedProject.value.id;
      
      // Llamar al endpoint con nombre y id_cuentas
      axios.get(`http://127.0.0.1:8000/cuentas/getCrud/${nombreCuenta}`, {
        params: {
          id_cuentas: idCuentas
        }
      })
      .then(response => {
        // Ahora debería devolver solo un resultado (el específico)
        if (response.data && response.data.length > 0) {
          const proyecto = response.data[0];
          cuenta.value = proyecto.cuenta;
          estado.value = proyecto.estado ? proyecto.estado.toString() : '';
          codigo.value = proyecto.codigo;
          selectedClasificacion.value = proyecto.clasificacion;
          selectedTipoProyecto.value = proyecto.proyecto;
          isEstadoEnabled.value = true;
          tipo_cuenta.value = proyecto.tipo_cuenta === 1 ? 'ACTIVO' : proyecto.tipo_cuenta === 0 ? 'PASIVO' : '';
          corriente.value = proyecto.corriente === 1 ? 'CORRIENTE' : proyecto.corriente === 0 ? 'NO CORRIENTE' : '';
          selectedIdCuentas.value = proyecto.id_cuentas;
        } else {
          errorMessage.value = 'No se encontró la cuenta especificada.';
        }
      })
      .catch(error => {
        console.error('Error al cargar datos específicos:', error);
        manejarErrorRuta(error, router);
      });
    };

    const insertar = () => {
      let tieneErrores = false;

      if (!cuenta.value) { mostrarErrorCampo('cuenta', 'Falta por llenar datos'); tieneErrores = true; }
      if (!codigo.value) { mostrarErrorCampo('codigo', 'Falta por llenar datos'); tieneErrores = true; }
      if (!selectedClasificacion.value) { mostrarErrorCampo('selectedClasificacion', 'Falta por llenar datos'); tieneErrores = true; }
      if (!selectedTipoProyecto.value) { mostrarErrorCampo('selectedTipoProyecto', 'Falta por llenar datos'); tieneErrores = true; }
      if (!tipo_cuenta.value) { mostrarErrorCampo('tipo_cuenta', 'Falta por llenar datos'); tieneErrores = true; }
      if (!corriente.value) { mostrarErrorCampo('corriente', 'Falta por llenar datos'); tieneErrores = true; }

      if (tieneErrores) return;

      const tipo_cuentaFlag = tipo_cuenta.value === 'ACTIVO' ? 1 : tipo_cuenta.value === 'PASIVO' ? 0 : null;
      const corrienteFlag = corriente.value === 'CORRIENTE' ? 1 : corriente.value === 'NO CORRIENTE' ? 0 : null;

      const datos = {
        cuenta: cuenta.value,
        codigo: codigo.value,
        clasificacion: selectedClasificacion.value,
        proyecto: selectedTipoProyecto.value,
        tipo_cuenta: tipo_cuentaFlag,
        corriente: corrienteFlag
      };

      axios.post('http://127.0.0.1:8000/cuentas/create', datos)
        .then(() => {
          mostrarModalExitoFormulario.value = true;
          cargarProyectos();
        })
        .catch(error => {
          console.error('Error al guardar la cuenta:', error);
          manejarErrorRuta(error, router);
        });
    };

    const actualizar = () => {
      let tieneErrores = false;

      if (!selectedProject.value) {
        mostrarErrorCampo('selectedProject', 'Por favor, selecciona una cuenta para actualizar.');
        tieneErrores = true;
      }
      if (!cuenta.value) { mostrarErrorCampo('cuenta', 'Falta por llenar datos'); tieneErrores = true; }
      if (!estado.value) { mostrarErrorCampo('estado', 'Falta por llenar datos'); tieneErrores = true; }
      if (!codigo.value) { mostrarErrorCampo('codigo', 'Falta por llenar datos'); tieneErrores = true; }
      if (!selectedClasificacion.value) { mostrarErrorCampo('selectedClasificacion', 'Falta por llenar datos'); tieneErrores = true; }
      if (!selectedTipoProyecto.value) { mostrarErrorCampo('selectedTipoProyecto', 'Falta por llenar datos'); tieneErrores = true; }
      if (!tipo_cuenta.value) { mostrarErrorCampo('tipo_cuenta', 'Falta por llenar datos'); tieneErrores = true; }
      if (!corriente.value) { mostrarErrorCampo('corriente', 'Falta por llenar datos'); tieneErrores = true; }

      if (tieneErrores) return;

      const tipo_cuentaFlag = tipo_cuenta.value === 'ACTIVO' ? 1 : tipo_cuenta.value === 'PASIVO' ? 0 : null;
      const corrienteFlag = corriente.value === 'CORRIENTE' ? 1 : corriente.value === 'NO CORRIENTE' ? 0 : null;

      const datos = {
        cuenta: cuenta.value,
        estado: estado.value,
        codigo: codigo.value,
        clasificacion: selectedClasificacion.value,
        proyecto: selectedTipoProyecto.value,
        tipo_cuenta: tipo_cuentaFlag,
        corriente: corrienteFlag
      };

      // Actualizar usando el id_cuentas
      axios.put(`http://127.0.0.1:8000/cuentas/updateById/${selectedIdCuentas.value}`, datos)
        .then(() => {
          mostrarModalExitoFormulario.value = true;
          cargarProyectos();
        })
        .catch(error => {
          console.error('Error al actualizar la cuenta:', error);
          manejarErrorRuta(error, router);
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
      selectedIdCuentas.value = '';
    };

    watch(selectedProject, () => {
      isEstadoEnabled.value = !!selectedProject.value;
      if (selectedProject.value) {
        cargarDatosProyecto();
      }
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
      corriente,
      /////////////
      fieldErrors,
      cerrarModalExitoFormulario,
      mostrarModalExitoFormulario  
    };
  },
};
</script>

