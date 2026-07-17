<template>
  <!-- Encabezado -->
  <div class="retiros-header">
    <div>
      <h2 class="retiros-title">Traslados internos de bancos</h2>
      <p class="retiros-subtitle">
        Registre el retiro desde una cuenta bancaria hacia caja.
      </p>
    </div>
  </div>

  <!-- Primera división -->
  <div class="division-container division-inline">
    <div class="field-group">
      <label class="field-label">Cuenta bancaria</label>
      <select v-model="cuentaBName" @change="cargarBancosNoCuenta" class="field-control">
        <option disabled value="">Seleccione una cuenta bancaria</option>
        <option v-for="cuentaN in cuentas_bancarias" :key="cuentaN.cuenta_bancaria" :value="cuentaN.cuenta_bancaria">
          {{ cuentaN.banco_y_cuenta }}
        </option>
      </select>
      <small v-if="fieldErrors.cuentaBName" class="error-text">{{ fieldErrors.cuentaBName }}</small>
    </div>

    <div class="field-group">
      <label class="field-label">Número de documento</label>
      <input type="text" v-model="numero_documento" class="field-control" />
      <small v-if="fieldErrors.numero_documento" class="error-text">{{ fieldErrors.numero_documento }}</small>
    </div>

    <div class="field-group">
      <label class="field-label">Fecha</label>
      <input type="date" v-model="fecha" class="field-control" />
      <small v-if="fieldErrors.fecha" class="error-text">{{ fieldErrors.fecha }}</small>
    </div>
  </div>

  <!-- Segunda división -->
  <div class="division-container">
    <h3 class="division-title">Monto a retirar de bancos</h3>

    <div class="field-group">
      <label class="field-label">Valor a retirar</label>
      <input type="text" v-model="monto" class="field-control" placeholder="0.00" />
      <small v-if="fieldErrors.monto" class="error-text">{{ fieldErrors.monto }}</small>
    </div>

    <div class="field-group full-width">
      <label class="field-label">Observaciones</label>
      <input type="text" v-model="descripcion" class="field-control" />
    </div>
  </div>

      <div class="bottom-actions-bar"> 
        <div class="messages-area">
          <!-- <transition-group name="lista-errores" tag="div" class="errores-stack">
            <div v-for="err in erroresLista" :key="err.id" class="alert-inline-error">
              <span class="alert-icon">⚠️</span>
              <span>{{ err.texto }}</span>
            </div>
          </transition-group> -->
        
        <p v-if="successMessage" class="text-success" style="margin: 0;">{{ successMessage }}</p>
      </div>

      <div class="form-actions">
        <button class="btn-primary" @click="enviarDatos">Guardar</button>
        <button class="btn-secondary" @click="limpiar">Limpiar</button>
      </div>
    </div>

    <!-- **MODAL DE INGRESO CORRECTO** -->
  <div v-if="mostrarModalExitoFormulario" class="modal-overlay">
    <div class="modal-content deposito-card" style="max-width: 450px; text-align: center;">
      <div style="margin-bottom: 1.5rem;">
        <div style="font-size: 3rem; color: #28a745; margin-bottom: 1rem;">✓</div>
        <h3 style="color: #14491b; margin-bottom: 0.5rem;">¡Registro Exitoso!</h3>
        <p style="color: #6c757d;">El ingreso se ha guardado correctamente en el sistema.</p>
      </div>
      <div class="form-actions" style="justify-content: center;">
        <button class="btn-primary" @click="cerrarModalExitoFormulario" style="min-width: 120px;">
          Aceptar
        </button>
      </div>
    </div>
  </div>
  <!-- **MODAL DE ERROR** -->
  <div v-if="mostrarModalError" class="modal-overlay">
    <div class="modal-content deposito-card" style="max-width: 450px; text-align: center;">
      <div style="margin-bottom: 1.5rem;">
        <div style="font-size: 3rem; color: #dc3545; margin-bottom: 1rem;">❌</div>
        <h3 style="color: #721c24; margin-bottom: 0.5rem;">¡Ocurrió un error!</h3>
        <p style="color: #6c757d;">{{ mensajeError }}</p>
      </div>
      <div class="form-actions" style="justify-content: center;">
        <button class="btn-secondary" @click="cerrarModalError" style="min-width: 120px;">
          Cerrar
        </button>
      </div>
    </div>
  </div>

  <!-- Registros de retiros de bancos -->
  <div class="listado-registros">
    <div class="listado-header">
      <h3 class="listado-title">Retiros registrados</h3>
      <div style="display: flex; align-items: center; gap: 0.6rem;">
        <span v-if="cargandoRegistros" class="listado-badge">Cargando...</span>
        <button
          class="btn-toggle-icon"
          :title="mostrarRegistros ? 'Ocultar tabla' : 'Mostrar tabla'"
          :aria-expanded="mostrarRegistros"
          @click="mostrarRegistros = !mostrarRegistros"
        >
          <span class="chevron" :class="{ 'is-open': mostrarRegistros }">▾</span>
        </button>
      </div>
    </div>

    <template v-if="mostrarRegistros">
      <p v-if="!cargandoRegistros && registros.length === 0" class="listado-empty">
        No hay registros.
      </p>

      <div v-if="!cargandoRegistros && registros.length" style="overflow-x: auto;">
        <table class="table-listado">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Nomenclatura</th>
              <th>Nombre</th>
              <th>Cuenta</th>
              <th>Tipo</th>
              <th class="right">Monto</th>
              <th class="center">Acción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in registros" :key="r.id_ingresos_egresos">
              <td>{{ r.fecha }}</td>
              <td>{{ r.nomenclatura }}</td>
              <td>{{ r.nombre }}</td>
              <td>{{ r.cuenta }}</td>
              <td>{{ r.tipo }}</td>
              <td class="right">{{ formatMonto(r.monto) }}</td>
              <td class="center">
                <button class="btn-link" @click="abrirConfirmEliminar(r)">
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div class="listado-pagination">
          <button
            class="btn-secondary"
            :disabled="paginaActual <= 1"
            @click="cargarRegistros(paginaActual - 1)"
          >
            Anterior
          </button>
          <span class="listado-pagination-info">
            Página {{ paginaActual }} de {{ totalPaginas }}
          </span>
          <button
            class="btn-secondary"
            :disabled="paginaActual >= totalPaginas"
            @click="cargarRegistros(paginaActual + 1)"
          >
            Siguiente
          </button>
        </div>
      </div>
    </template>
  </div>

  <!-- ******* MODAL CONFIRMAR ELIMINAR ******* -->
  <div v-if="mostrarConfirmEliminar" class="confirm-modal-overlay">
    <div class="confirm-modal-box">
      <div class="confirm-modal-header confirm-modal-header--danger">
        <span class="confirm-modal-icon">⚠</span>
        <h3>Eliminar registro</h3>
      </div>
      <div class="confirm-modal-body">
        <p>
          ¿Seguro que deseas eliminar este registro? Esta acción no se puede
          deshacer.
        </p>
        <div class="confirm-modal-summary">
          <div class="modal-id-row">
            <label>Fecha: </label>
            <span>{{ registroAEliminar?.fecha }}</span>
          </div>
          <div class="modal-id-row">
            <label>Nombre: </label>
            <span>{{ registroAEliminar?.nombre }}</span>
          </div>
          <div class="modal-id-row">
            <label>Monto: </label>
            <span>{{ formatMonto(registroAEliminar?.monto) }}</span>
          </div>
        </div>
        <p class="modal-warning">
          Un retiro de bancos crea dos movimientos enlazados (Bancos y Caja).
          Eliminar solo este registro puede desbalancear la partida; revisa si
          también debes eliminar el movimiento correspondiente en el otro
          libro.
        </p>
        <p v-if="errorEliminar" class="modal-error">{{ errorEliminar }}</p>
      </div>
      <div class="confirm-modal-actions">
        <button class="btn-secondary" :disabled="eliminando" @click="cerrarConfirmEliminar">
          Cancelar
        </button>
        <button
          class="btn-danger btn-danger-solid"
          :disabled="eliminando"
          @click="confirmarEliminar"
        >
          {{ eliminando ? 'Eliminando...' : 'Eliminar' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router'; // para redirección de rutas
import { manejarErrorRuta } from '../../../utils/manejarErrores.js';
import '../../styles/css/RetirosBancosA.css';
import '../../styles/css/GlobalAlertsModals.css';
import '../../styles/css/ListadoRegistrosA.css'

export default {
  name: 'Accordion',
  setup() {
    const router = useRouter();
    const fecha = ref('');
    const descripcion = ref('');
    const monto = ref('');
    const numero_documento = ref('');
    const cuentas_bancarias = reactive([]);
    const cuentaBName = ref('');
    const successMessage = ref(''); // Estado para mensajes de éxito
    const error = ref(''); // ===================================================================================================================================
    const mostrarModalExitoFormulario = ref(false);
    const mostrarModalError = ref(false);
    const mensajeError = ref('');
    // Objeto para guardar el error específico de cada campo
    const fieldErrors = reactive({
      tipo: '',
      fecha: '',
      identificacion: '',
      nombre: '',
      descripcion: '',
      cuentaCMB: '',
      monto: '',
      documento: '',
      cuentaBName: '',
      numero_documento: '',
      fecha_emision: ''
    });
    // Objeto reactivo exclusivo para los errores del Modal de Saldar
    const modalErrors = reactive({
      fecha: '',
      identificacion: '',
      nombre: '',
      descripcion: '',
      tipo: '',
      monto: '',
      documento: '',
      cuenta_bancaria: '',
      numero_documento: '',
      fecha_emision: ''
    });

    // Función que asigna el error y lo borra a los 5 segundos
    const mostrarErrorCampo = (campo, mensaje) => {
      fieldErrors[campo] = mensaje;
      setTimeout(() => {
        fieldErrors[campo] = '';
      }, 5000);
    };

    // ==========================================
    // DETECTOR DE TECLADO (ENTER PARA MODALES)
    // ==========================================
    const manejarEnter = (event) => {
      if (event.key === 'Enter') {
        // Previene que el Enter haga cosas raras (como recargar la página si estuviera en un <form>)
        event.preventDefault();

        if (mostrarModalExitoFormulario.value) {
          cerrarModalExitoFormulario(); // Aceptar éxito de guardado normal
        } 
        else if (mostrarModalError.value) {
          cerrarModalError(); // Cerrar error
        }
      }
    };

    const cerrarModalExitoFormulario = () => {
        mostrarModalExitoFormulario.value = false;
        limpiar(); 
    };

    const cerrarModalError = () => {
        mostrarModalError.value = false;
        mensajeError.value = '';
    };

    // Registros de retiros (listado paginado + eliminar)
    const registros = ref([]);
    const paginaActual = ref(1);
    const totalPaginas = ref(1);
    const cargandoRegistros = ref(false);
    const mostrarRegistros = ref(true);
    const mostrarConfirmEliminar = ref(false);
    const registroAEliminar = ref(null);
    const eliminando = ref(false);
    const errorEliminar = ref('');

    const formatMonto = (m) => {
      const n = Number(m);
      if (Number.isNaN(n)) return m;
      return n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    };

    const cargarRegistros = async (page = 1) => {
      cargandoRegistros.value = true;
      try {
        const { data } = await axios.get(
          'http://127.0.0.1:8000/in_eg/getListaRetirosBancosAG',
          { params: { page, per_page: 5 } }
        );
        registros.value = data.data || [];
        paginaActual.value = data.current_page || 1;
        totalPaginas.value = data.last_page || 1;
      } catch (e) {
        console.error('Error cargando retiros:', e?.response?.data || e.message);
        registros.value = [];
      } finally {
        cargandoRegistros.value = false;
      }
    };

    const abrirConfirmEliminar = (row) => {
      registroAEliminar.value = row;
      errorEliminar.value = '';
      mostrarConfirmEliminar.value = true;
    };

    const cerrarConfirmEliminar = () => {
      mostrarConfirmEliminar.value = false;
      registroAEliminar.value = null;
      errorEliminar.value = '';
    };

    const confirmarEliminar = async () => {
      if (!registroAEliminar.value) return;
      eliminando.value = true;
      errorEliminar.value = '';
      try {
        await axios.put(
          `http://127.0.0.1:8000/in_eg/desactivarAG/${registroAEliminar.value.id_ingresos_egresos}`
        );
        mostrarConfirmEliminar.value = false;
        registroAEliminar.value = null;
        successMessage.value = 'Registro eliminado correctamente';
        const siguientePagina =
          registros.value.length === 1 && paginaActual.value > 1
            ? paginaActual.value - 1
            : paginaActual.value;
        await cargarRegistros(siguientePagina);
      } catch (e) {
        const status = e?.response?.status;
        if (status === 404) {
          errorEliminar.value = 'El registro ya no existe.';
        } else if (status === 400) {
          errorEliminar.value = 'El registro no pertenece al proyecto Agrícola.';
        } else if (status === 409) {
          errorEliminar.value =
            e?.response?.data?.error || 'No se puede eliminar este registro.';
        } else {
          errorEliminar.value =
            e?.response?.data?.error || 'Error al eliminar el registro.';
        }
      } finally {
        eliminando.value = false;
      }
    };

    const cargarBancosNoCuenta = () => {
      axios.get('http://127.0.0.1:8000/cuentasB/getConcatenada')
        .then((response) => {
          cuentas_bancarias.splice(0, cuentas_bancarias.length, ...response.data);
          //  console.log(response.data); 
        })
        .catch((err) => {
          console.error(err);
          error.value = 'Hubo un problema al cargar las cuentas de bancos';
          manejarErrorRuta(err, router);
        });
    };

    const enviarDatos = () => {
      let tieneErrores = false; // ===================================================================================================================================

      // 1. Validaciones individuales de cada campo
      if (!cuentaBName.value) { mostrarErrorCampo('cuentaBName', 'Falta por llenar datos'); tieneErrores = true; }
      if (!fecha.value) { mostrarErrorCampo('fecha', 'Falta por llenar datos'); tieneErrores = true; }
      if (!numero_documento.value) { mostrarErrorCampo('numero_documento', 'Falta por llenar datos'); tieneErrores = true; }

      // Validación del monto (Vacío y formato numérico, igual que en enviarSaldado)
      if (!monto.value) { 
          mostrarErrorCampo('monto', 'Falta por llenar datos'); 
          tieneErrores = true; 
      } else if (isNaN(monto.value)) {
          mostrarErrorCampo('monto', 'Formato incorrecto (solo números)');
          tieneErrores = true;
      }

      // Detener la ejecución si hay al menos un error
      if (tieneErrores) return;

      // 2. Preparar el payload
      const payload = {
          cuenta_bancaria: cuentaBName.value,
          fecha: fecha.value,
          descripcion: descripcion.value,
          monto: monto.value,
          numero_documento: numero_documento.value,
      };

      axios.post('http://127.0.0.1:8000/in_eg/createTrasRetBanAG', payload)
        .then(response => {
          mostrarModalExitoFormulario.value = true;
          //console.log(response.data);
          cargarRegistros();
        })
        .catch(err => {
            console.error(err); 
            error.value = "Error al guardar la transacción. Verifique datos antes de enviar o conexión con el servidor.";
            manejarErrorRuta(error, router);
        }); 
      };

    const limpiar = () => {
      fecha.value = '';
      descripcion.value = '';
      monto.value = '';
      numero_documento.value = '';
      cuentaBName.value = '';
      successMessage.value = ''; // Limpiar el mensaje de éxito
    };

    onMounted(() => {
      cargarBancosNoCuenta();
      cargarRegistros();
      // Encendemos el detector de teclado
      window.addEventListener('keydown', manejarEnter);
    });

    onUnmounted(() => {
      // Apagamos el detector de teclado al salir de la pantalla
      window.removeEventListener('keydown', manejarEnter);
    });

    return {
      limpiar,
      enviarDatos,
      cargarBancosNoCuenta,
      cuentaBName,
      cuentas_bancarias,
      fecha,
      monto,
      descripcion,
      numero_documento,
      successMessage, 
      // ------------------
      fieldErrors,
      modalErrors,
      error,
      mostrarModalExitoFormulario,
      cerrarModalExitoFormulario,
      mostrarModalError,
      mensajeError,
      cerrarModalError,
      registros,
      paginaActual,
      totalPaginas,
      cargandoRegistros,
      mostrarRegistros,
      mostrarConfirmEliminar,
      registroAEliminar,
      eliminando,
      errorEliminar,
      formatMonto,
      cargarRegistros,
      abrirConfirmEliminar,
      cerrarConfirmEliminar,
      confirmarEliminar
    }
  },
}
</script>
