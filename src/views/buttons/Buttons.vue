<template>
  <div>
    <!-- Primera división -->
    <div class="division-container">
      <div class="fecha-inputs">
        <label>Ingreso para:</label>
        <select v-model="tipo">
          <option value="caja">caja</option>
          <option value="bancos">bancos</option>
        </select>
      </div>
    </div>
    <div class="division-container">
        <div class="numero-fecha-container">
            <div class="checkbox-line-container">
                <label for="es_pendiente">¿Es una Cuenta por Cobrar?</label>
                <input type="checkbox" v-model="es_pendiente" id="es_pendiente" class="form-check-input">
            </div>
        </div>
    </div>
    <!-- Segunda división -->
    <div class="division-container">
      <div class="numero-fecha-container">
        <div class="fecha-inputs">
          <label>Fecha</label>
          <input type="date" v-model="fecha">
        </div>
      </div>
    </div>

    <!-- Tercera división -->
    <div class="division-container">
      <label>DPI/NIT/CF</label>
      <input type="text" v-model="identificacion">
      <label>Nombre/CF</label>
      <input type="text" v-model="nombre">
      <label>Observaciones de comprobante</label>
      <input type="text" v-model="descripcion">
    </div>

    <!-- Cuarta división -->
    <div class="division-container">
      <div class="numero-fecha-container">
        <div class="numero-inputs">
          <label>Cuenta</label>
          <select v-model="cuentaCMB" @change="cargarCuentas">
            <option v-for="cuentab in cuentas" :key="cuentab.cuenta" :value="cuentab.cuenta">{{ cuentab.cuenta }}</option>
          </select>
        </div>
        <div class="fecha-inputs">
          <label>Monto</label>
          <input type="text" v-model="monto">
        </div>
      </div>
    </div>

    <!-- Datos del Pago -->
    <div class="division-container" v-if="mostrarDivisionCuatro">
      <label>DATOS DEL PAGO</label>
      <div class="input-container">
        <label>Documento:</label>
        <select v-model="documento">
          <option value="Transferencia">Transferencia</option>
          <option value="Depósitos">Depósitos</option>
          <option value="Cheque">Cheque</option>
        </select>
      </div>
      <div class="input-container">
        <label>Cuenta Bancaria:</label>
        <select v-model="cuentaBName" @change="cargarBancosNoCuenta">
          <option v-for="cuentaN in cuentas_bancarias" :key="cuentaN.cuenta_bancaria" :value="cuentaN.cuenta_bancaria">{{ cuentaN.banco_y_cuenta }}</option>
        </select>
      </div>
      <div class="input-container">
        <label>No. Documento:</label>
        <input type="text" v-model="numero_documento">
      </div>
      <div class="input-container">
        <label>Fecha emisión:</label>
        <input type="date" v-model="fecha_emision">
      </div>
    </div>

    <!-- Espacio entre la división 3 y el botón -->
    <div style="margin-top: 20px;"></div>

    <!-- Mensaje de error -->
    <p v-if="error" class="text-danger">{{ error }}</p>
    
    <!-- Mensaje de éxito -->
    <p v-if="success" class="text-success">{{ success }}</p>

    <!-- Botones -->
    <button @click="enviarDatos">Guardar</button>
    <button @click="limpiar" style="margin-left: 10px;">Limpiar</button>
  </div>

  <!-- pendientes -->
  <div>
    <h3 style="margin-top: 30px;">Cuentas Pendientes por Cobrar (Proyecto Agrícola)</h3>
    
    <p v-if="mensajeVacio" class="text-danger" style="margin-top: 10px;">{{ mensajeVacio }}</p>

    <div v-if="pendientes.length > 0" style="margin-top: 20px;">
        <h4>Deudas Pendientes Encontradas ({{ pendientes.length }})</h4>
        <table class="pendientes-table">
            <thead>
                <tr>
                    <!-- <th>ID</th> -->
                    <th>Fecha</th>
                    <th>Nomenclatura</th>
                    <th>Nombre</th>
                    <th>Cuenta Contable</th>
                    <th>Tipo</th>
                    <th>Monto Deuda (Q)</th>
                    <th>Tipo de Saldo</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="item in pendientes" :key="item.id_ingresos_egresos">
                    <!-- <td>{{ item.id_ingresos_egresos }}</td> -->
                    <td>{{ item.fecha }}</td>
                    <td>{{ item.nomenclatura }}</td>
                    <td>{{ item.nombre }}</td>
                    <td>{{ item.cuentas.cuenta }}</td>
                    <td>{{ item.tipo }}</td>
                    <td>Q {{ item.monto_haber > 0 ? item.monto_haber : item.monto_debe }}</td>
                    <td>
                        <span v-if="item.monto_debe > 0" class="saldo-debe">DEBE</span>
                        <span v-else class="saldo-haber">HABER</span>
                    </td>
                    <td><button>Saldar</button></td>
                </tr>
            </tbody>
        </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ref, reactive, onMounted, watch } from 'vue';
import '../../styles/css/EgresosIngresosC.css'

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
    // ** NUEVAS VARIABLES PARA EL REPORTE **
    const PROYECTO_ID = '1';       // Agrícola
    const CLASIFICACION_ID = '1'; // Ingresos (Cuentas por Cobrar)
    const pendientes = reactive([]);
    const mensajeVacio = ref('');

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


    // Función para cargar los pendientes desde la API
    const cargarPendientes = () => {
        pendientes.splice(0, pendientes.length); // Limpiar lista
        error.value = '';
        mensajeVacio.value = '';

        // Usar Query Parameters para la petición GET
        const params = {
            id_proyectos: PROYECTO_ID,
            id_clasificacion: CLASIFICACION_ID,
        };

        axios.get('http://127.0.0.1:8000/in_eg/get/transacciones_pendientes', { params })
            .then(response => {
                // Almacenar los datos en la lista reactiva
                pendientes.splice(0, pendientes.length, ...response.data);
            })
            .catch(err => {
                console.error("Error al cargar pendientes:", err);
                // Si el error es 404 (No hay datos), mostramos el mensaje del backend
                if (err.response && err.response.status === 404) {
                    mensajeVacio.value = err.response.data.message;
                } else {
                    error.value = 'Error al consultar datos. Revise la conexión al backend.';
                }
            });
    };

    watch(tipo, controlarVisibilidadDivisionCuatro);

    onMounted(() => {
      cargarCuentas();
      cargarBancosNoCuenta();
      cargarPendientes();
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
      controlarVisibilidadDivisionCuatro,
      // nuevas variables
      pendientes,
      cargarPendientes,
      mensajeVacio,
      // ----------------
    };
  },
}
</script>

