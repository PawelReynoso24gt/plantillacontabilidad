<template>
  <div class="dep-wrapper">
    <div class="dep-card">
      <!-- Encabezado -->
      <div class="dep-header">
        <div>
          <h2 class="dep-title">Retiros de bancos - Capilla</h2>
          <p class="dep-subtitle">
            Registra los retiros realizados desde una cuenta bancaria hacia caja.
          </p>
        </div>
      </div>

      <!-- Sección: banco + número documento + fecha -->
      <div class="division-container division-inline">
        <div class="field-group">
          <label class="field-label">Banco / Cuenta bancaria</label>
          <select v-model="cuentaBName" @change="cargarBancosNoCuenta" class="field-control">
            <option disabled value="">Seleccione banco y cuenta</option>
            <option v-for="cuentaN in cuentas_bancarias" :key="cuentaN.cuenta_bancaria"
              :value="cuentaN.cuenta_bancaria">
              {{ cuentaN.banco_y_cuenta }}
            </option>
          </select>
          <small v-if="fieldErrors.cuentaBName" class="error-text">{{ fieldErrors.cuentaBName }}</small>
        </div>

        <div class="field-group">
          <label class="field-label">Número de documento</label>
          <input type="text" v-model="numero_documento" class="field-control"
            placeholder="Número de cheque / boleta / referencia" />
            <small v-if="fieldErrors.numero_documento" class="error-text">{{ fieldErrors.numero_documento }}</small>
        </div>

        <div class="field-group">
          <label class="field-label">Fecha</label>
          <input type="date" v-model="fecha" class="field-control" />
          <small v-if="fieldErrors.fecha" class="error-text">{{ fieldErrors.fecha }}</small>
        </div>
      </div>

      <!-- Sección: monto + observaciones -->
      <div class="division-container division-block">
        <p class="division-title">Monto a retirar</p>

        <div class="field-group">
          <label class="field-label">Valor a retirar</label>
          <input type="text" v-model="monto" class="field-control" placeholder="0.00" />
          <small v-if="fieldErrors.monto" class="error-text">{{ fieldErrors.monto }}</small>
        </div>

        <div class="field-group full-width">
          <label class="field-label">Observaciones</label>
          <input type="text" v-model="descripcion" class="field-control" placeholder="Detalle del retiro (opcional)" />
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

        <!-- Botones -->
        <div class="form-actions">
          <button class="btn-primary" @click="insertar">
            Guardar
          </button>
          <button class="btn-secondary" @click="limpiar">
            Limpiar
          </button>
        </div>
      </div>
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
</template>

<script>
import axios from 'axios';
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router'; // para redirección de rutas
import { manejarErrorRuta } from '../../../utils/manejarErrores.js';
import '../../styles/css/DepYRetiroCajaC.css'
import '../../styles/css/GlobalAlertsModals.css';

export default {
  name: 'Accordion',
  setup() {
    const router = useRouter();
    const cuentaBName = ref('');
    const cuentas_bancarias = reactive([]);
    const cuenta_bancaria = ref('');
    const fecha = ref('');
    const descripcion = ref('');
    const monto = ref('');
    const numero_documento = ref('');
    const error = ref(''); // Estado para errores
    const successMessage = ref(''); // Estado para mensajes de éxito
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
    const cargarBancosNoCuenta = () => {
      axios.get('http://127.0.0.1:8000/cuentasB/getConcatenada')
        .then((response) => {
          cuentas_bancarias.splice(0, cuentas_bancarias.length, ...response.data);
          //console.log(response.data); 
        })
        .catch((err) => {
          console.error(err);
          error.value = 'Hubo un problema al cargar las cuentas de bancos';
          manejarErrorRuta(err, router);
        });
    };

    const insertar = () => {
      let tieneErrores = false; 

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

      const datos = {
        fecha: fecha.value,
        descripcion: descripcion.value,
        monto: monto.value,
        cuenta_bancaria: cuentaBName.value,
        numero_documento: numero_documento.value,
      };

      axios.post('http://127.0.0.1:8000/in_eg/createTrasRetBanCA', datos)
        .then(response => {
          mostrarModalExitoFormulario.value = true;
          //  console.log(response.data);
        })
        .catch(err => {
            console.error(err); 
            error.value = "Error al guardar la transacción. Verifique datos antes de enviar o conexión con el servidor.";
            manejarErrorRuta(error, router);
        }); 
    };

    const limpiar = () => {
      cuentaBName.value = '';
      numero_documento.value = '';
      fecha.value = '';
      monto.value = '';
      descripcion.value = '';
      successMessage.value = ''; // Limpiar el mensaje de éxito
    };

    onMounted(() => {
      cargarBancosNoCuenta();
      // Encendemos el detector de teclado
      window.addEventListener('keydown', manejarEnter);
    });

    onUnmounted(() => {
      // Apagamos el detector de teclado al salir de la pantalla
      window.removeEventListener('keydown', manejarEnter);
    });

    return {
      cuentaBName,
      cuentas_bancarias,
      cuenta_bancaria,
      fecha,
      descripcion,
      monto,
      numero_documento,
      cargarBancosNoCuenta,
      insertar,
      limpiar,
      error,
      successMessage,
      // ------------------
      fieldErrors, 
      modalErrors,
      mostrarModalExitoFormulario,
      cerrarModalExitoFormulario,
      mostrarModalError,
      mensajeError,
      cerrarModalError
    }
  },
}
</script>
