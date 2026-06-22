<template>
  <div class="page-wrapper">
    <div class="page-card">

      <!-- Encabezado -->
      <div class="module-header">
        <div>
          <h2 class="module-title">Registro de Egreso Agrícola</h2>
          <p class="module-subtitle">
            Complete la información del egreso y los datos del comprobante.
          </p>
        </div>
      </div>

      <!-- Tipo de egreso y cuenta por pagar -->
      <div class="section-container section-container--inline">
        <div class="field-group">
          <label class="field-label">Egreso para</label>
          <select v-model="tipo" class="field-control">
            <option disabled value="">Seleccione una opción</option>
            <option value="caja">Caja</option>
            <option value="bancos">Bancos</option>
          </select>
        </div>

        <div class="field-group checkbox-group">
          <label for="es_pendiente" class="field-label">
            ¿Es una Cuenta por Pagar?
          </label>
          <input type="checkbox" v-model="es_pendiente" id="es_pendiente" class="form-check-input" />
        </div>
      </div>

      <!-- Fecha -->
      <div class="section-container">
        <div class="field-group">
          <label class="field-label">Fecha</label>
          <input type="date" v-model="fecha" class="field-control" />
        </div>
      </div>

      <!-- Datos del proveedor / beneficiario -->
      <div class="section-container">
        <div class="field-group">
          <label class="field-label">DPI / NIT / CF</label>
          <input type="text" v-model="identificacion" class="field-control" />
        </div>
        <div class="field-group">
          <label class="field-label">Nombre / CF</label>
          <input type="text" v-model="nombre" class="field-control" />
        </div>
        <div class="field-group field-group--full">
          <label class="field-label">Observaciones de comprobante</label>
          <input type="text" v-model="descripcion" class="field-control" />
        </div>
      </div>

      <!-- Cuenta y monto -->
      <div class="section-container section-container--inline">
        <div class="field-group">
          <label class="field-label">Cuenta contable</label>
          <select v-model="cuentaCMB" @change="cargarCuentas" class="field-control">
            <option disabled value="">Seleccione una cuenta</option>
            <option v-for="cuentab in cuentas" :key="cuentab.cuenta" :value="cuentab.cuenta">
              {{ cuentab.cuenta }}
            </option>
          </select>
        </div>
        <div class="field-group">
          <label class="field-label">Monto</label>
          <input type="text" v-model="monto" class="field-control" placeholder="0.00" />
        </div>
      </div>

      <!-- Datos del pago (solo si es bancos) -->
      <div class="section-container section-container--block" v-if="mostrarDivisionCuatro">
        <h3 class="section-title">Datos del pago</h3>

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
          <select v-model="cuentaBName" @change="cargarBancosNoCuenta" class="field-control">
            <option disabled value="">Seleccione una cuenta bancaria</option>
            <option v-for="cuentaN in cuentas_bancarias" :key="cuentaN.cuenta_bancaria"
              :value="cuentaN.cuenta_bancaria">
              {{ cuentaN.banco_y_cuenta }}
            </option>
          </select>
        </div>

        <div class="field-group">
          <label class="field-label">No. documento</label>
          <input type="text" v-model="numero_documento" class="field-control" />
        </div>

        <div class="field-group">
          <label class="field-label">Fecha de emisión</label>
          <input type="date" v-model="fecha_emision" class="field-control" />
        </div>
      </div>

      <!-- Mensajes -->
      <div class="messages-container">
        <p v-if="error" class="text-danger">{{ error }}</p>
        <p v-if="successMessage" class="text-success">{{ successMessage }}</p>
      </div>

      <!-- Botones -->
      <div class="form-actions">
        <button class="btn btn-primary" @click="enviarDatos">Guardar</button>
        <button class="btn btn-secondary" @click="limpiar">Limpiar</button>
      </div>

      <!-- Cuentas Pendientes -->
      <div class="section-container section-container--block mt-4">
        <h3 class="section-title">Cuentas Pendientes por Pagar</h3>

        <p v-if="mensajeVacio" class="text-danger mt-1">{{ mensajeVacio }}</p>

        <div v-if="pendientes.length > 0" class="table-wrapper mt-2">
          <table class="data-table">
            <thead>
              <tr>
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
                <td>{{ item.fecha }}</td>
                <td>{{ item.nomenclatura }}</td>
                <td>{{ item.nombre }}</td>
                <td>{{ item.cuentas.cuenta }}</td>
                <td>{{ item.tipo }}</td>
                <td class="cell-right">Q {{ item.saldo_pendiente }}</td>
                <td>
                  <span v-if="parseFloat(item.monto_debe) > 0" class="badge-debe">DEBE</span>
                  <span v-else class="badge-haber">HABER</span>
                </td>
                <td>
                  <button @click="abrirModalSaldado(item)">Saldar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div><!-- /page-card -->
  </div><!-- /page-wrapper -->

  <!-- ******* MODAL DE SALDADO ******* -->
  <div v-if="mostrarModalSaldado" class="modal-overlay">
    <div class="modal-box">

      <div class="module-header">
        <div>
          <h3 class="module-title">Saldar Deuda Pendiente</h3>
          <p class="module-subtitle">
            Complete los datos del pago para registrar el abono.
          </p>
        </div>
      </div>

      <!-- ID y cuenta (solo lectura) -->
      <div class="section-container">
        <div class="field-group">
          <label class="field-label">ID Deuda</label>
          <input type="text" :value="formSaldar.deuda_original_id" class="field-control" disabled />
        </div>
        <div class="field-group">
          <label class="field-label">Cuenta Contable</label>
          <input type="text" :value="formSaldar.nombre_cuenta_visual" class="field-control" disabled />
        </div>
      </div>

      <!-- Fecha de pago -->
      <div class="section-container">
        <div class="field-group">
          <label class="field-label">Fecha de Pago</label>
          <input type="date" v-model="formSaldar.fecha" class="field-control" />
        </div>
      </div>

      <!-- Datos del beneficiario -->
      <div class="section-container">
        <div class="field-group">
          <label class="field-label">DPI / NIT / CF</label>
          <input type="text" v-model="formSaldar.identificacion" class="field-control" />
        </div>
        <div class="field-group">
          <label class="field-label">Nombre / CF</label>
          <input type="text" v-model="formSaldar.nombre" class="field-control" />
        </div>
        <div class="field-group field-group--full">
          <label class="field-label">Observaciones</label>
          <input type="text" v-model="formSaldar.descripcion" class="field-control" />
        </div>
      </div>

      <!-- Medio de pago y monto -->
      <div class="section-container section-container--inline">
        <div class="field-group">
          <label class="field-label">Medio de Pago</label>
          <select v-model="formSaldar.tipo" class="field-control">
            <option value="caja">Caja</option>
            <option value="bancos">Bancos</option>
          </select>
        </div>
        <div class="field-group">
          <label class="field-label">Monto a Pagar (Q)</label>
          <input type="text" v-model="formSaldar.monto" class="field-control" placeholder="0.00" />
        </div>
      </div>

      <!-- Sección bancaria condicional -->
      <div class="section-container section-container--block" v-if="formSaldar.tipo === 'bancos'">
        <h3 class="section-title">Datos del pago</h3>

        <div class="field-group">
          <label class="field-label">Documento</label>
          <select v-model="formSaldar.documento" class="field-control">
            <option value="Transferencia">Transferencia</option>
            <option value="Depósitos">Depósitos</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>

        <div class="field-group">
          <label class="field-label">Cuenta Bancaria</label>
          <select v-model="formSaldar.cuenta_bancaria" class="field-control">
            <option v-for="cuentaN in cuentas_bancarias" :key="cuentaN.cuenta_bancaria"
              :value="cuentaN.cuenta_bancaria">
              {{ cuentaN.banco_y_cuenta }}
            </option>
          </select>
        </div>

        <div class="field-group">
          <label class="field-label">No. Documento</label>
          <input type="text" v-model="formSaldar.numero_documento" class="field-control" />
        </div>

        <div class="field-group">
          <label class="field-label">Fecha Emisión</label>
          <input type="date" v-model="formSaldar.fecha_emision" class="field-control" />
        </div>
      </div>

      <!-- Botones del modal -->
      <div class="form-actions">
        <button class="btn btn-secondary" @click="cerrarModal">Cancelar</button>
        <button class="btn btn-primary" @click="enviarSaldado">Confirmar Pago</button>
      </div>

    </div><!-- /modal-box -->
  </div>

  <!-- ******* MODAL DE ÉXITO ******* -->
  <div v-if="mostrarModalExito" class="modal-overlay">
    <div class="modal-box modal-box--sm">

      <div style="margin-bottom: 1.5rem;">
        <div style="font-size: 3rem; color: var(--color-success); margin-bottom: 1rem;">✓</div>
        <h3 style="color: var(--color-dark-alt); margin-bottom: 0.5rem;">¡Pago Exitoso!</h3>
        <p class="text-muted">{{ datosExito.mensaje || 'El abono se ha registrado correctamente.' }}</p>
      </div>

      <div class="section-container" style="justify-content: center; margin-bottom: 1.5rem;">
        <div style="text-align: center; width: 100%;">
          <p class="text-muted">Saldo Pendiente Restante</p>
          <h2 style="margin: 0.5rem 0; color: var(--color-dark); font-size: 1.8rem;">
            Q {{ datosExito.saldo }}
          </h2>
        </div>
      </div>

      <div class="form-actions" style="justify-content: center;">
        <button class="btn btn-primary" @click="cerrarModalExito" style="min-width: 120px;">
          Aceptar
        </button>
      </div>

    </div><!-- /modal-box--sm -->
  </div>

</template>


<script>
import axios from 'axios';
import { ref, reactive, onMounted, watch } from 'vue';
import '@/styles/global.css'

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
    const error = ref('');
    const successMessage = ref('');
    const PROYECTO_ID = '1';
    const CLASIFICACION_ID = '2';
    const pendientes = reactive([]);
    const mensajeVacio = ref('');
    const mostrarModalSaldado = ref(false);
    const formSaldar = reactive({
      deuda_original_id: '',
      cuenta: '',
      nombre_cuenta_visual: '',
      fecha: '',
      identificacion: '',
      nombre: '',
      descripcion: '',
      monto: '',
      tipo: 'caja',
      documento: '',
      numero_documento: '',
      fecha_emision: '',
      cuenta_bancaria: '',
      id_proyectos: '',
      id_clasificacion: ''
    });
    const mostrarModalExito = ref(false);
    const datosExito = reactive({
      mensaje: '',
      saldo: ''
    });

    const limpiar = () => {
      tipo.value = '';
      fecha.value = '';
      identificacion.value = '';
      nombre.value = '';
      descripcion.value = '';
      cuentaCMB.value = '';
      monto.value = '';
      documento.value = '';
      cuentaBName.value = '';
      numero_documento.value = '';
      fecha_emision.value = '';
      es_pendiente.value = false;
      error.value = '';
      successMessage.value = '';
    };

    const controlarVisibilidadDivisionCuatro = () => {
      mostrarDivisionCuatro.value = tipo.value === 'bancos';
    }

    const abrirModalSaldado = (item) => {
      formSaldar.deuda_original_id = item.id_ingresos_egresos;
      formSaldar.cuenta = item.cuentas.cuenta;
      formSaldar.nombre_cuenta_visual = item.cuentas.cuenta;
      const hoy = new Date();
      const año = hoy.getFullYear();
      const mes = String(hoy.getMonth() + 1).padStart(2, '0');
      const dia = String(hoy.getDate()).padStart(2, '0');
      formSaldar.fecha = `${año}-${mes}-${dia}`;
      formSaldar.identificacion = '';
      formSaldar.descripcion = '';
      formSaldar.nombre = '';
      formSaldar.tipo = 'caja';
      formSaldar.documento = '';
      formSaldar.numero_documento = '';
      formSaldar.fecha_emision = '';
      formSaldar.cuenta_bancaria = '';
      formSaldar.monto = '';
      formSaldar.id_proyectos = PROYECTO_ID;
      formSaldar.id_clasificacion = CLASIFICACION_ID;
      mostrarModalSaldado.value = true;
    };

    const cerrarModal = () => {
      mostrarModalSaldado.value = false;
      limpiar();
      cargarPendientes();
    };

    const cerrarModalExito = () => {
      mostrarModalExito.value = false;
      limpiar();
      cargarPendientes();
    };

    watch(tipo, controlarVisibilidadDivisionCuatro);
    controlarVisibilidadDivisionCuatro();

    const cargarCuentas = () => {
      axios.get('http://127.0.0.1:8000/in_eg/getAllCuentasEgresoAG')
        .then((response) => { cuentas.splice(0, cuentas.length, ...response.data); })
        .catch((error) => { console.error(error); });
    };

    const cargarBancosNoCuenta = () => {
      axios.get('http://127.0.0.1:8000/cuentasB/getConcatenada')
        .then((response) => { cuentas_bancarias.splice(0, cuentas_bancarias.length, ...response.data); })
        .catch((error) => { console.error(error); });
    };

    const cargarBancos = () => {
      axios.get('http://127.0.0.1:8000/in_eg/getByNombreB')
        .then((response) => { cuentas_bancarias.splice(0, cuentas_bancarias.length, ...response.data); })
        .catch((error) => { console.error(error); });
    };

    const enviarDatos = () => {
      error.value = '';
      successMessage.value = '';

      if (!fecha.value || !identificacion.value || !nombre.value || !descripcion.value || !monto.value || !cuentaCMB.value || (tipo.value === 'bancos' && (!documento.value || !cuentaBName.value || !numero_documento.value || !fecha_emision.value))) {
        error.value = 'Por favor, complete todos los campos.';
        return;
      }

      const valorEsPendiente = es_pendiente.value ? 1 : 0;

      if (tipo.value === 'caja') {
        axios.post('http://127.0.0.1:8000/in_eg/createALLINEGCajaAG', {
          fecha: fecha.value, identificacion: identificacion.value, nombre: nombre.value,
          descripcion: descripcion.value, monto: monto.value, tipo: tipo.value,
          cuenta: cuentaCMB.value, flujo_contable: 'EGRESOS', es_pendiente: valorEsPendiente,
        })
          .then(response => { successMessage.value = 'Datos enviados correctamente'; cargarPendientes(); })
          .catch(error => { console.error(error); error.value = 'Error al enviar datos. Por favor, inténtelo de nuevo.'; });
      } else {
        axios.post('http://127.0.0.1:8000/in_eg/AG', {
          fecha: fecha.value, identificacion: identificacion.value, nombre: nombre.value,
          descripcion: descripcion.value, monto: monto.value, tipo: tipo.value,
          cuenta: cuentaCMB.value, documento: documento.value, numero_documento: numero_documento.value,
          fecha_emision: fecha_emision.value, cuenta_bancaria: cuentaBName.value,
          flujo_contable: 'EGRESOS', es_pendiente: valorEsPendiente,
        })
          .then(response => { successMessage.value = 'Datos enviados correctamente'; cargarPendientes(); })
          .catch(error => { console.error(error); error.value = 'Error al enviar datos. Por favor, inténtelo de nuevo.'; });
      }
    };

    const cargarPendientes = () => {
      pendientes.splice(0, pendientes.length);
      error.value = '';
      mensajeVacio.value = '';
      axios.get('http://127.0.0.1:8000/in_eg/get/transacciones_pendientes', {
        params: { id_proyectos: PROYECTO_ID, id_clasificacion: CLASIFICACION_ID }
      })
        .then(response => { pendientes.splice(0, pendientes.length, ...response.data); })
        .catch(err => {
          if (err.response && err.response.status === 404) {
            mensajeVacio.value = err.response.data.message;
          } else {
            error.value = 'Error al consultar datos. Revise la conexión al backend.';
          }
        });
    };

    const enviarSaldado = () => {
      if (!formSaldar.monto || !formSaldar.fecha) {
        alert("Por favor ingrese monto y fecha.");
        return;
      }
      axios.post('http://127.0.0.1:8000/in_eg/saldar_pendiente', {
        deuda_original_id: formSaldar.deuda_original_id,
        fecha: formSaldar.fecha, monto: formSaldar.monto,
        identificacion: formSaldar.identificacion, nombre: formSaldar.nombre,
        descripcion: formSaldar.descripcion, tipo: formSaldar.tipo,
        cuenta: formSaldar.cuenta, id_proyectos: formSaldar.id_proyectos,
        id_clasificacion: formSaldar.id_clasificacion,
        documento: formSaldar.documento, numero_documento: formSaldar.numero_documento,
        fecha_emision: formSaldar.fecha_emision, cuenta_bancaria: formSaldar.cuenta_bancaria,
      })
        .then(response => {
          cerrarModal();
          datosExito.mensaje = response.data.message;
          datosExito.saldo = parseFloat(response.data.saldo_restante).toFixed(2);
          mostrarModalExito.value = true;
          limpiar();
          cargarPendientes();
        })
        .catch(err => { console.error(err); alert("Error al registrar el pago."); });
    };

    onMounted(() => {
      cargarCuentas();
      cargarBancos();
      cargarBancosNoCuenta();
      cargarPendientes();
    });

    return {
      otroValor, mostrarDivisionCuatro, fecha, identificacion, nombre, descripcion,
      monto, tipo, cuenta_bancaria, cuenta, cuentas, cuentas_bancarias, documento,
      numero_documento, fecha_emision, cuentaCMB, cuentaBName, bancos_b, es_pendiente,
      error, successMessage, pendientes, cargarPendientes, mensajeVacio,
      mostrarModalSaldado, formSaldar, abrirModalSaldado, cerrarModal, enviarSaldado,
      mostrarModalExito, datosExito, cerrarModalExito, enviarDatos, cargarCuentas,
      cargarBancos, controlarVisibilidadDivisionCuatro, cargarBancosNoCuenta, limpiar
    }
  },
}
</script>