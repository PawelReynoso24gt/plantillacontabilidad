<template>
      <!-- Encabezado -->
      <div class="ingreso-header">
        <div>
          <h2 class="ingreso-title">Registro de Ingreso Agrícola</h2>
          <p class="ingreso-subtitle">
            Complete la información del ingreso y los datos del comprobante.
          </p>
        </div>
      </div>

      <!-- Ingreso para + Cuenta por cobrar -->
      <div class="division-container division-inline">
        <div class="field-group">
          <label class="field-label">Ingreso para</label>
          <select v-model="tipo" class="field-control">
            <option disabled value="">Seleccione una opción</option>
            <option value="caja">Caja</option>
            <option value="bancos">Bancos</option>
          </select>
        </div>

        <div class="field-group checkbox-group">
          <label for="es_pendiente" class="field-label">
            ¿Es una Cuenta por Cobrar?
          </label>
          <input
            type="checkbox"
            v-model="es_pendiente"
            id="es_pendiente"
            class="form-check-input"
          />
        </div>
      </div>

      <!-- Fecha -->
      <div class="division-container">
        <div class="field-group">
          <label class="field-label">Fecha</label>
          <input
            type="date"
            v-model="fecha"
            class="field-control"
          />
        </div>
      </div>

      <!-- Datos del contribuyente -->
      <div class="division-container">
        <div class="field-group">
          <label class="field-label">DPI / NIT / CF</label>
          <input
            type="text"
            v-model="identificacion"
            class="field-control"
          />
        </div>
        <div class="field-group">
          <label class="field-label">Nombre / CF</label>
          <input
            type="text"
            v-model="nombre"
            class="field-control"
          />
        </div>
        <div class="field-group full-width">
          <label class="field-label">Observaciones de comprobante</label>
          <input
            type="text"
            v-model="descripcion"
            class="field-control"
          />
        </div>
      </div>

      <!-- Cuenta y monto -->
      <div class="division-container division-inline">
        <div class="field-group">
          <label class="field-label">Cuenta contable</label>
          <select
            v-model="cuentaCMB"
            @change="cargarCuentas"
            class="field-control"
          >
            <option disabled value="">Seleccione una cuenta</option>
            <option
              v-for="cuentab in cuentas"
              :key="cuentab.cuenta"
              :value="cuentab.cuenta"
            >
              {{ cuentab.cuenta }}
            </option>
          </select>
        </div>
        <div class="field-group">
          <label class="field-label">Monto</label>
          <input
            type="text"
            v-model="monto"
            class="field-control"
            placeholder="0.00"
          />
        </div>
      </div>

      <!-- Datos del pago (solo si es bancos) -->
      <div class="division-container division-block" v-if="mostrarDivisionCuatro">
        <h3 class="division-title">Datos del pago</h3>

        <div class="field-group">
          <label class="field-label">Documento</label>
          <select v-model="documento" class="field-control">
            <option disabled value="">Seleccione el tipo de documento</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Depósitos">Depósitos</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>

        <div class="field-group">
          <label class="field-label">Cuenta bancaria</label>
          <select
            v-model="cuentaBName"
            @change="cargarBancosNoCuenta"
            class="field-control"
          >
            <option disabled value="">Seleccione una cuenta bancaria</option>
            <option
              v-for="cuentaN in cuentas_bancarias"
              :key="cuentaN.cuenta_bancaria"
              :value="cuentaN.cuenta_bancaria"
            >
              {{ cuentaN.banco_y_cuenta }}
            </option>
          </select>
        </div>

        <div class="field-group">
          <label class="field-label">No. documento</label>
          <input
            type="text"
            v-model="numero_documento"
            class="field-control"
          />
        </div>

        <div class="field-group">
          <label class="field-label">Fecha de emisión</label>
          <input
            type="date"
            v-model="fecha_emision"
            class="field-control"
          />
        </div>
      </div>

      <!-- Mensajes -->
      <div class="messages-container">
        <p v-if="error" class="text-danger">{{ error }}</p>
        <p v-if="success" class="text-success">{{ success }}</p>
      </div>

      <!-- Botones -->
      <div class="form-actions">
        <button class="btn-primary" @click="enviarDatos">
          Guardar
        </button>
        <button class="btn-secondary" @click="limpiar">
          Limpiar
        </button>
      </div>


</template>

<script>
import axios from 'axios';
import { ref, reactive, onMounted, watch } from 'vue';
import '../../styles/css/IngresosAgricola.css'

export default {
  name: 'Accordion',
  setup() {
    const fecha = ref('');
    const identificacion = ref('');
    const descripcion = ref('');
    const nombre = ref('');
    const monto = ref('');
    const tipo = ref('');
    const cuentaCMB = ref('');
    const documento = ref('');
    const numero_documento = ref('');
    const fecha_emision = ref('');
    const cuentaBName = ref('');
    const cuentas = reactive([]);
    const cuentas_bancarias = reactive([]);
    const mostrarDivisionCuatro = ref(false);
    const es_pendiente = ref(false);
    const error = ref('');
    const success = ref(''); // Mensaje de éxito

    const limpiar = () => {
      fecha.value = '';
      identificacion.value = '';
      descripcion.value = '';
      nombre.value = '';
      monto.value = '';
      cuentaCMB.value = '';
      documento.value = '';
      numero_documento.value = '';
      fecha_emision.value = '';
      tipo.value = '';
      cuentaBName.value = '';
      es_pendiente.value = false;
      error.value = ''; // Limpiar el mensaje de error
      success.value = ''; // Limpiar el mensaje de éxito
    };

    const controlarVisibilidadDivisionCuatro = () => {
      mostrarDivisionCuatro.value = tipo.value === 'bancos';
    };

    watch(tipo, controlarVisibilidadDivisionCuatro);

    onMounted(() => {
      cargarCuentas();
      cargarBancosNoCuenta();
    });

    const cargarCuentas = () => {
      axios.get('http://127.0.0.1:8000/in_eg/getAllCuentasIngresoAG')
        .then(response => {
          cuentas.splice(0, cuentas.length, ...response.data);
        })
        .catch(error => {
          console.error(error);
        });
    };

    const cargarBancosNoCuenta = () => {
      axios.get('http://127.0.0.1:8000/cuentasB/getConcatenada')
        .then(response => {
          cuentas_bancarias.splice(0, cuentas_bancarias.length, ...response.data);
        })
        .catch(error => {
          console.error(error);
        });
    };

    const enviarDatos = () => {
      error.value = ''; // Limpiar el mensaje de error antes de enviar los datos
      success.value = ''; // Limpiar el mensaje de éxito antes de enviar los datos

      // Validación
      if (!fecha.value || !identificacion.value || !nombre.value || !descripcion.value || !monto.value || !cuentaCMB.value ||
        (tipo.value === 'bancos' && (!documento.value || !cuentaBName.value || !numero_documento.value || !fecha_emision.value))) {
        error.value = 'Por favor, complete todos los campos.';
        return;
      }

      // Definimos el valor del checkbox como 1 o 0
      const valorEsPendiente = es_pendiente.value ? 1 : 0;

      const data = {
        fecha: fecha.value,
        identificacion: identificacion.value,
        nombre: nombre.value,
        descripcion: descripcion.value,
        monto: monto.value,
        tipo: tipo.value,
        cuenta: cuentaCMB.value,
        documento: documento.value,
        numero_documento: numero_documento.value,
        fecha_emision: fecha_emision.value,
        cuenta_bancaria: cuentaBName.value,
        flujo_contable: 'INGRESOS', // <-- ¡Valor fijo requerido por el backend!
        es_pendiente: valorEsPendiente, // <-- Valor del checkbox (0 o 1)
      };

      const url = tipo.value === 'caja'
        ? 'http://127.0.0.1:8000/in_eg/createALLINEGCajaAG'
        : 'http://127.0.0.1:8000/in_eg/createALLINAG';

      axios.post(url, data)
        .then(response => {
          console.log(response.data);
          success.value = 'Datos enviados correctamente'; // Mensaje de éxito
        })
        .catch(error => {
          console.error(error);
          error.value = 'Error al enviar datos. Por favor, inténtelo de nuevo.';
        });
    };

    return {
      limpiar,
      mostrarDivisionCuatro,
      fecha,
      identificacion,
      nombre,
      descripcion,
      monto,
      tipo,
      cuentaCMB,
      documento,
      numero_documento,
      fecha_emision,
      cuentaBName,
      cuentas,
      cuentas_bancarias,
      es_pendiente,
      cargarCuentas,
      cargarBancosNoCuenta,
      enviarDatos,
      error,
      success, // Agregado para el mensaje de éxito
      controlarVisibilidadDivisionCuatro
    };
  },
}
</script>

