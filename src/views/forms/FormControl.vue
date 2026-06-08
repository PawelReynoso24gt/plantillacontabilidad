<template>
  <!-- Encabezado -->
  <div class="deposito-header">
    <div>
      <h2 class="deposito-title">Traslados internos de caja</h2>
      <p class="deposito-subtitle">
        Registre el depósito desde caja hacia la cuenta bancaria seleccionada.
      </p>
    </div>
  </div>

  <!-- Primera división: cuenta bancaria + documento + fecha -->
  <div class="division-container division-inline">
    <div class="field-group">
      <label class="field-label">Cuenta bancaria</label>
      <select v-model="cuentaBName" @change="cargarBancosNoCuenta" class="field-control">
        <option disabled value="">Seleccione una cuenta bancaria</option>
        <option v-for="cuentaN in cuentas_bancarias" :key="cuentaN.cuenta_bancaria" :value="cuentaN.cuenta_bancaria">
          {{ cuentaN.banco_y_cuenta }}
        </option>
      </select>
    </div>

    <div class="field-group">
      <label class="field-label">Número de documento</label>
      <input type="text" v-model="numero_documento" class="field-control" />
    </div>

    <div class="field-group">
      <label class="field-label">Fecha</label>
      <input type="date" v-model="fecha" class="field-control" />
    </div>
  </div>

  <!-- Segunda división: monto y observaciones -->
  <div class="division-container">
    <h3 class="division-title">Monto a retirar de caja</h3>

    <div class="field-group">
      <label class="field-label">Valor a retirar</label>
      <input type="text" v-model="monto" class="field-control" placeholder="0.00" />
    </div>

    <div class="field-group full-width">
      <label class="field-label">Observaciones</label>
      <input type="text" v-model="descripcion" class="field-control" />
    </div>
  </div>
<!-- ¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡ -->
  <div class="bottom-actions-bar">
      <div class="messages-area">
        <transition-group name="lista-errores" tag="div" class="errores-stack">
          <div v-for="err in erroresLista" :key="err.id" class="alert-inline-error">
            <span class="alert-icon">⚠️</span>
            <span>{{ err.texto }}</span>
          </div>
        </transition-group>
        
        <p v-if="success" class="text-success" style="margin: 0;">{{ success }}</p>
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
    <!-- ¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡ -->
  </div>
</template>

<script>
import axios from 'axios';
import { ref, reactive, onMounted } from 'vue';
import '../../styles/css/DepositoCajaA.css'

export default {
  name: 'Accordion',
  setup() {
    const fecha = ref('');
    const descripcion = ref('');
    const monto = ref('');
    const numero_documento = ref('');
    const cuentas_bancarias = reactive([]);
    const cuentaBName = ref('');
    const successMessage = ref(''); // Estado para mensajes de éxito
    const erroresLista = ref([]); // ===================================================================================================================================
    const mostrarModalExitoFormulario = ref(false);
    const mostrarModalError = ref(false);
    const mensajeError = ref('');

    const agregarError = (mensaje) => {
        const id = Date.now() + Math.random();
        erroresLista.value.push({ id, texto: mensaje });
        setTimeout(() => {
            erroresLista.value = erroresLista.value.filter(e => e.id !== id);
        }, 5000); 
    };

    const cerrarModalExitoFormulario = () => {
        mostrarModalExitoFormulario.value = false;
        limpiar(); 
    };

    const cerrarModalError = () => {
        mostrarModalError.value = false;
        mensajeError.value = '';
    }; // ===================================================================================================================================

    const cargarBancosNoCuenta = () => {
      axios.get('http://127.0.0.1:8000/cuentasB/getConcatenada')
        .then((response) => {
          cuentas_bancarias.splice(0, cuentas_bancarias.length, ...response.data);
          console.log(response.data);
        })
        .catch((err) => { // ===================================================================================================================================
          console.error(err);
          agregarError('Advertencia: No se pudieron cargar las cuentas bancarias.');
        });// ===================================================================================================================================
    };

    const enviarDatos = () => {
      successMessage.value = ''; // Resetea el mensaje de éxito antes de enviar datos

      if (!fecha.value || !descripcion.value || !monto.value || !numero_documento.value || !cuentaBName.value) {
        agregarError('Por favor, complete todos los campos.'); // ===================================================================================================================================
        return;
      }

      axios.post('http://127.0.0.1:8000/in_eg/createTrasDepCajaAG', {
        cuenta_bancaria: cuentaBName.value,
        fecha: fecha.value,
        descripcion: descripcion.value,
        monto: monto.value,
        numero_documento: numero_documento.value,
      })
        .then(response => { // ===================================================================================================================================
        // AQUI ACTIVAMOS EL MODAL
          mostrarModalExitoFormulario.value = true;
          console.log(response.data); 
        })
        .catch(err => {
            console.error(err);
            // REEMPLAZAMOS EL alert()
            mensajeError.value = "Error al registrar el pago. Verifique datos antes de enviar o conexión con el servidor.";
            mostrarModalError.value = true;
        }); // ===================================================================================================================================
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
      successMessage, // ===================================================================================================================================
      // -----------------
      erroresLista,
      mostrarModalExitoFormulario,
      cerrarModalExitoFormulario,
      mostrarModalError,
      mensajeError,
      cerrarModalError // ===================================================================================================================================
    }
  },
}
</script>
