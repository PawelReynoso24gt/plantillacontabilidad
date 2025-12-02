<template> 
      <!-- Encabezado -->
      <div class="ingreso-header">
        <div>
          <h2 class="ingreso-title">Registro de ingresos - Capilla</h2>
          <p class="ingreso-subtitle">
            Registra ingresos a caja o bancos, incluyendo cuentas por cobrar.
          </p>
        </div>
      </div>

      <!-- Sección: ingreso para + fecha + cuenta por cobrar -->
      <div class="division-container division-inline">
        <div class="field-group">
          <label class="field-label">Ingreso para</label>
          <select v-model="tipo" class="field-control">
            <option disabled value="">Seleccione destino</option>
            <option value="caja">Caja</option>
            <option value="bancos">Bancos</option>
          </select>
        </div>

        <div class="field-group">
          <label class="field-label">Fecha</label>
          <input
            type="date"
            v-model="fecha"
            class="field-control"
          />
        </div>

        <div class="field-group checkbox-group">
          <label class="field-label" for="es_pendiente">
            ¿Es una cuenta por cobrar?
          </label>
          <input
            id="es_pendiente"
            type="checkbox"
            v-model="es_pendiente"
            class="form-check-input"
          />
        </div>
      </div>

      <!-- Sección: datos del beneficiario / comprobante -->
      <div class="division-container division-block">
        <div class="field-group">
          <label class="field-label">DPI / NIT / CF</label>
          <input
            type="text"
            v-model="identificacion"
            class="field-control"
            placeholder="Ingrese DPI, NIT o CF"
          />
        </div>

        <div class="field-group">
          <label class="field-label">Nombre / CF</label>
          <input
            type="text"
            v-model="nombre"
            class="field-control"
            placeholder="Nombre del donante / CF"
          />
        </div>

        <div class="field-group full-width">
          <label class="field-label">Observaciones de comprobante</label>
          <input
            type="text"
            v-model="descripcion"
            class="field-control"
            placeholder="Descripción u observaciones del ingreso"
          />
        </div>
      </div>

      <!-- Sección: cuenta + monto -->
      <div class="division-container division-inline">
        <div class="field-group">
          <label class="field-label">Cuenta</label>
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

      <!-- Sección: datos del pago (solo bancos) -->
      <div
        class="division-container division-block"
        v-if="mostrarDivisionCuatro"
      >
        <p class="division-title">Datos del cobro</p>

        <div class="field-group">
          <label class="field-label">Documento</label>
          <select
            v-model="documento"
            class="field-control"
          >
            <option disabled value="">Seleccione documento</option>
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
            <option disabled value="">Seleccione cuenta</option>
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
            placeholder="Número de recibo / referencia"
          />
        </div>

        <div class="field-group">
          <label class="field-label">Fecha emisión</label>
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
        <p v-if="successMessage" class="text-success">{{ successMessage }}</p>
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
    const otroValor = ref('opcion1');
    const mostrarDivisionCuatro = ref(true);
    const fecha = ref('');
    const identificacion = ref('');
    const descripcion = ref('');
    const nombre = ref('');
    const monto = ref('');
    const cuenta_bancaria = ref('');
    const cuenta = ref('');
    const documento = ref('');
    const numero_documento = ref('');
    const fecha_emision = ref('');
    const tipo = ref('');
    const cuentaCMB = ref('');
    const bancos_b = ref('');
    const cuentas = reactive([]);
    const cuentaBName = ref('');
    const cuentas_bancarias = reactive([]);
    const es_pendiente = ref(false);
    const error = ref(''); // Estado para errores
    const successMessage = ref(''); // Estado para mensajes de éxito

    const limpiar = () => {
      fecha.value = '';
      identificacion.value = '';
      descripcion.value = '';
      nombre.value = '';
      monto.value = '';
      cuenta_bancaria.value = '';
      cuenta.value = '';
      documento.value = '';
      numero_documento.value = '';
      fecha_emision.value = '';
      tipo.value = '';
      cuentaCMB.value = '';
      bancos_b.value = '';
      cuentas.value = [];
      cuentaBName.value = '';
      cuentas_bancarias.value = [];
      es_pendiente.value = false;
      error.value = ''; // Limpiar el mensaje de error
      successMessage.value = ''; // Limpiar el mensaje de éxito
    };

    const agregarDivision = () => {
      // Lógica para agregar una nueva división
    };

    const seleccionar = () => {
      mostrarDivisionCuatro.value = tipo.value === 'bancos'; // Muestra la división 4 solo si se selecciona la opción de bancos
      if (tipo.value === 'caja') {
        mostrarDivisionCuatro.value = false; // Oculta la división 4 si se selecciona la opción de caja
      }
      limpiar(); // Limpia los campos cuando se selecciona un tipo
    };

    const controlarVisibilidadDivisionCuatro = () => {
      mostrarDivisionCuatro.value = tipo.value === 'bancos';
    };

    watch(tipo, controlarVisibilidadDivisionCuatro);

    controlarVisibilidadDivisionCuatro();

    const cargarCuentas = () => {
      axios.get('http://127.0.0.1:8000/in_eg/getAllCuentasIngresoCA')
        .then((response) => {
          cuentas.splice(0, cuentas.length, ...response.data);
          console.log(response.data); 
        })
        .catch((error) => {
          console.error(error);
          error.value = 'Error al cargar cuentas.';
        });
    };

    const cargarBancosNoCuenta = () => {
      axios.get('http://127.0.0.1:8000/cuentasB/getConcatenada')
        .then((response) => {
          cuentas_bancarias.splice(0, cuentas_bancarias.length, ...response.data);
          console.log(response.data); 
        })
        .catch((error) => {
          console.error(error);
          error.value = 'Error al cargar bancos sin cuenta.';
        });
    };

    const cargarBancos = () => {
      axios.get('http://127.0.0.1:8000/in_eg/getByNombreB')
        .then((response) => {
          cuentas_bancarias.splice(0, cuentas_bancarias.length, ...response.data);
          console.log(response.data); 
        })
        .catch((error) => {
          console.error(error);
          error.value = 'Error al cargar bancos.';
        });
    };

    const enviarDatos = () => {
      error.value = ''; // Resetea el mensaje de error antes de enviar datos
      successMessage.value = ''; // Resetea el mensaje de éxito antes de enviar datos

      if (!fecha.value || !identificacion.value || !nombre.value || !descripcion.value || !monto.value || !cuentaCMB.value || (tipo.value === 'bancos' && (!documento.value || !cuentaBName.value || !numero_documento.value || !fecha_emision.value))) {
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
        cuenta_bancaria: bancos_b.value,
        documento: documento.value,
        numero_documento: numero_documento.value,
        fecha_emision: fecha_emision.value,
        cuenta_bancaria: cuentaBName.value,
        flujo_contable: 'INGRESOS', // <-- ¡Valor fijo requerido por el backend!
        es_pendiente: valorEsPendiente, // <-- Valor del checkbox (0 o 1)
      };

      if (tipo.value === 'caja') { 
        axios.post('http://127.0.0.1:8000/in_eg/createALLINEGCajaCA', data)
        .then(response => {
          successMessage.value = 'Datos enviados correctamente';
          console.log(response.data); 
        })
        .catch(error => {
          console.error(error);
          error.value = 'Error al enviar datos. Por favor, inténtelo de nuevo.';
        });
      } else {
        axios.post('http://127.0.0.1:8000/in_eg/createALLINCA', data)
          .then(response => {
            successMessage.value = 'Datos enviados correctamente';
            console.log(response.data); 
          })
          .catch(error => {
            console.error(error);
            error.value = 'Error al enviar datos. Por favor, inténtelo de nuevo.';
          });
      }
    };

    onMounted(() => {
      cargarCuentas();
      cargarBancos();
      cargarBancosNoCuenta();
    });

    return {
      limpiar,
      agregarDivision,
      otroValor,
      mostrarDivisionCuatro,
      fecha,
      identificacion,
      nombre,
      descripcion,
      monto,
      tipo,
      cuenta_bancaria,
      cuenta,
      cuentas,
      cuentas_bancarias,
      documento,
      numero_documento,
      fecha_emision,
      cuentaCMB,
      cuentaBName,
      bancos_b,
      es_pendiente,
      seleccionar,
      enviarDatos,
      cargarCuentas,
      cargarBancos,
      cargarBancosNoCuenta,
      error, // Retornar el estado de error
      successMessage // Retornar el estado de éxito
    }
  },
}
</script>
