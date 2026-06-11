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
          <small v-if="fieldErrors.tipo" class="error-text">{{ fieldErrors.tipo }}</small>
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
          <small v-if="fieldErrors.fecha" class="error-text">{{ fieldErrors.fecha }}</small>
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
          <small v-if="fieldErrors.identificacion" class="error-text">{{ fieldErrors.identificacion }}</small>
        </div>
        <div class="field-group">
          <label class="field-label">Nombre / CF</label>
          <input
            type="text"
            v-model="nombre"
            class="field-control"
          />
          <small v-if="fieldErrors.nombre" class="error-text">{{ fieldErrors.nombre }}</small>
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
          <small v-if="fieldErrors.cuentaCMB" class="error-text">{{ fieldErrors.cuentaCMB }}</small>
        </div>
        <div class="field-group">
          <label class="field-label">Monto</label>
          <input
            type="text"
            v-model="monto"
            class="field-control"
            placeholder="0.00"
          />
          <small v-if="fieldErrors.monto" class="error-text">{{ fieldErrors.monto }}</small>
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
          <small v-if="fieldErrors.documento" class="error-text">{{ fieldErrors.documento }}</small>
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
          <small v-if="fieldErrors.cuentaBName" class="error-text">{{ fieldErrors.cuentaBName }}</small>
        </div>

        <div class="field-group">
          <label class="field-label">No. documento</label>
          <input
            type="text"
            v-model="numero_documento"
            class="field-control"
          />
          <small v-if="fieldErrors.numero_documento" class="error-text">{{ fieldErrors.numero_documento }}</small>
        </div>

        <div class="field-group">
          <label class="field-label">Fecha de emisión</label>
          <input
            type="date"
            v-model="fecha_emision"
            class="field-control"
          />
        </div>
        <small v-if="fieldErrors.fecha_emision" class="error-text">{{ fieldErrors.fecha_emision }}</small>
      </div>
<!-- ¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡ -->
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
        <!-- ¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡ -->
      </div>

  <!-- pendientes -->
  <div class="division-container" style="margin-top: 40px; padding: 1.5rem;">
    <h3 class="division-title">Cuentas Pendientes por Cobrar (Proyecto Agrícola)</h3>
    
    <p v-if="mensajeVacio" class="text-danger" style="margin-top: 10px;">{{ mensajeVacio }}</p>

    <div v-if="pendientes.length > 0" style="margin-top: 20px;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h4 style="margin: 0; color: #292b57;">Deudas Pendientes Encontradas ({{ pendientes.length }})</h4>
        <button @click="cargarPendientes" class="btn-secondary" style="padding: 0.3rem 0.8rem; font-size: 0.85rem;">
          Actualizar
        </button>
      </div>
      
      <div style="overflow-x: auto;">
        <table class="pendientes-table">
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
              <td>Q {{ item.saldo_pendiente }}</td>
              <td>
                <span v-if="parseFloat(item.monto_debe) > 0" class="saldo-debe">DEBE</span>
                <span v-else class="saldo-haber">HABER</span>
              </td>
              <td><button @click="abrirModalSaldado(item)">Saldar</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>

<!-- ******* MODAL DE SALDADO ******* -->
  <div v-if="mostrarModalSaldado" class="modal-overlay">
    <div class="modal-content ingreso-card" style="max-width: 700px;">
      <div class="ingreso-header">
        <div>
          <h3 class="ingreso-title">Saldar Deuda Pendiente</h3>
          <p class="ingreso-subtitle">
            Complete los datos del pago para registrar el abono.
          </p>
        </div>
      </div>
      
      <div class="division-container" style="margin-top: 0; background: transparent;">
        <div class="field-group">
          <label class="field-label">ID Deuda</label>
          <input type="text" :value="formSaldar.deuda_original_id" class="field-control" disabled>
        </div>
        <div class="field-group">
          <label class="field-label">Cuenta Contable</label>
          <input type="text" :value="formSaldar.nombre_cuenta_visual" class="field-control" disabled>
        </div>
      </div>

      <!-- Formulario dentro del Modal -->
      <div class="division-container">
        <div class="field-group">
          <label class="field-label">Fecha de Pago</label>
          <input type="date" v-model="formSaldar.fecha" class="field-control">
          <small v-if="modalErrors.fecha" class="error-text">{{ modalErrors.fecha }}</small>
        </div>
      </div>

      <div class="division-container">
        <div class="field-group">
          <label class="field-label">DPI/NIT/CF</label>
          <input type="text" v-model="formSaldar.identificacion" class="field-control">
          <small v-if="modalErrors.identificacion" class="error-text">{{ modalErrors.identificacion }}</small>
        </div>
        <div class="field-group">
          <label class="field-label">Nombre/CF</label>
          <input type="text" v-model="formSaldar.nombre" class="field-control">
          <small v-if="modalErrors.nombre" class="error-text">{{ modalErrors.nombre }}</small>
        </div>
        <div class="field-group full-width">
          <label class="field-label">Observaciones</label>
          <input type="text" v-model="formSaldar.descripcion" class="field-control">
        </div>
      </div>

      <div class="division-container division-inline">
        <div class="field-group">
          <label class="field-label">Medio de Pago</label>
          <select v-model="formSaldar.tipo" class="field-control"> 
            <option value="caja">Caja</option>
            <option value="bancos">Bancos</option>  
          </select>
          <small v-if="modalErrors.tipo" class="error-text">{{ modalErrors.tipo }}</small>
        </div>
        <div class="field-group">
          <label class="field-label">Monto a Pagar (Q)</label>
          <input type="text" v-model="formSaldar.monto" class="field-control" placeholder="0.00">
          <small v-if="modalErrors.monto" class="error-text">{{ modalErrors.monto }}</small>
        </div>
      </div>

      <!-- Sección Bancaria Condicional -->
      <div class="division-container division-block" v-if="formSaldar.tipo === 'bancos'">
        <h3 class="division-title">Datos del pago</h3>
        
        <div class="field-group">
          <label class="field-label">Documento</label>
          <select v-model="formSaldar.documento" class="field-control">
            <option value="Transferencia">Transferencia</option> 
            <option value="Depósitos">Depósitos</option>
            <option value="Cheque">Cheque</option> 
          </select>
          <small v-if="modalErrors.documento" class="error-text">{{ modalErrors.documento }}</small>
        </div>
        
        <div class="field-group">
          <label class="field-label">Cuenta Bancaria</label>
          <select v-model="formSaldar.cuenta_bancaria" class="field-control">
            <option v-for="cuentaN in cuentas_bancarias" :value="cuentaN.cuenta_bancaria">
              {{ cuentaN.banco_y_cuenta }}
            </option> 
          </select>
          <small v-if="modalErrors.cuenta_bancaria" class="error-text">{{ modalErrors.cuenta_bancaria }}</small>
        </div>
        
        <div class="field-group">
          <label class="field-label">No. Documento</label>
          <input type="text" v-model="formSaldar.numero_documento" class="field-control">
          <small v-if="modalErrors.numero_documento" class="error-text">{{ modalErrors.numero_documento }}</small>
        </div>
        
        <div class="field-group">
          <label class="field-label">Fecha Emisión</label>
          <input type="date" v-model="formSaldar.fecha_emision" class="field-control">
          <small v-if="modalErrors.fecha_emision" class="error-text">{{ modalErrors.fecha_emision }}</small>
        </div>
      </div>

      <!-- Botones del Modal -->
      <div class="form-actions" style="margin-top: 1.5rem;">
        <button class="btn-secondary" @click="cerrarModal">Cancelar</button>
        <button class="btn-primary" @click="enviarSaldado">Confirmar Pago</button>
      </div>
    </div>
  </div>

<!-- ******* MODAL DE ÉXITO ******* -->
  <div v-if="mostrarModalExito" class="modal-overlay">
    <div class="modal-content ingreso-card" style="max-width: 450px; text-align: center;">
      <div style="margin-bottom: 1.5rem;">
        <div style="font-size: 3rem; color: #28a745; margin-bottom: 1rem;">✓</div>
        <h3 style="color: #14491b; margin-bottom: 0.5rem;">¡Pago Exitoso!</h3>
        <p style="color: #6c757d;">{{ datosExito.mensaje || 'El abono se ha registrado correctamente.' }}</p>
      </div>
      
      <div class="division-container" style="background-color: #f9f9f9; margin-bottom: 1.5rem;">
        <div style="text-align: center; width: 100%;">
          <p style="margin: 0; color: #666; font-size: 0.9rem;">Saldo Pendiente Restante</p>
          <h2 style="margin: 0.5rem 0; color: #292b57; font-size: 1.8rem;">Q {{ datosExito.saldo }}</h2>
        </div>
      </div>

      <div class="form-actions" style="justify-content: center;">
        <button class="btn-primary" @click="cerrarModalExito" style="min-width: 120px;">
          Aceptar
        </button>
      </div>
    </div>
  </div>
<!-- ¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡ -->
  <!-- **MODAL DE INGRESO CORRECTO** -->
  <div v-if="mostrarModalExitoFormulario" class="modal-overlay">
    <div class="modal-content ingreso-card" style="max-width: 450px; text-align: center;">
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
    <div class="modal-content ingreso-card" style="max-width: 450px; text-align: center;">
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
  <!-- ¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡¡ -->
</template>

<script>
import axios from 'axios';
import { ref, reactive, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router'; // para redirección de rutas
import { manejarErrorRuta } from '../../../utils/manejarErrores.js';
import '../../styles/css/IngresosAgricola.css'

export default {
  name: 'Accordion',
  setup() {
    const router = useRouter();
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
    const error = ref(''); // ======================================================================
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
    });// ===================================================================================================================================
    const successMessage = ref(''); // Estado para mensajes de éxito
    const PROYECTO_ID = '1';       // Agrícola
    const CLASIFICACION_ID = '1'; // Ingresos (Cuentas por Cobrar)
    const pendientes = reactive([]);
    const mensajeVacio = ref('');
    const mostrarModalSaldado = ref(false);
    const formSaldar = reactive({
        deuda_original_id: '',
        cuenta: '', // Nombre de la cuenta (para el backend)
        nombre_cuenta_visual: '', // Solo para mostrar
        fecha: '',
        identificacion: '',
        nombre: '',
        descripcion: '',
        monto: '',
        tipo: 'caja',
        // Bancarios
        documento: '',
        numero_documento: '',
        fecha_emision: '',
        cuenta_bancaria: '',
        // Datos fijos del proyecto/clasificación (vienen del reporte)
        id_proyectos: '',
        id_clasificacion: ''
    });
    const mostrarModalExito = ref(false);
    const datosExito = reactive({
        mensaje: '',
        saldo: ''
    });

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
      successMessage.value = ''; // Limpiar el mensaje de éxito
    };
// ==================================================================================================================
    // Función que asigna el error y lo borra a los 5 segundos
    const mostrarErrorCampo = (campo, mensaje) => {
      fieldErrors[campo] = mensaje;
      setTimeout(() => {
        fieldErrors[campo] = '';
      }, 5000);
    };

    // Función para manejar los errores del modal y borrarlos a los 5s
    const mostrarErrorModal = (campo, mensaje) => {
      modalErrors[campo] = mensaje;
      setTimeout(() => {
        modalErrors[campo] = '';
      }, 5000);
    };

    // ==========================================
    // DETECTOR DE TECLADO (ENTER PARA MODALES)
    // ==========================================
    const manejarEnter = (event) => {
      if (event.key === 'Enter') {
        // Previene que el Enter haga cosas raras (como recargar la página si estuviera en un <form>)
        event.preventDefault();

        // Evaluamos qué modal está abierto actualmente:
        if (mostrarModalSaldado.value) {
          enviarSaldado(); // Confirmar Pago
        } 
        else if (mostrarModalExito.value) {
          cerrarModalExito(); // Aceptar éxito de saldado
        } 
        else if (mostrarModalExitoFormulario.value) {
          cerrarModalExitoFormulario(); // Aceptar éxito de guardado normal
        } 
        else if (mostrarModalError.value) {
          cerrarModalError(); // Cerrar error
        }
      }
    };// ==================================================================================================================

    const controlarVisibilidadDivisionCuatro = () => {
      mostrarDivisionCuatro.value = tipo.value === 'bancos';
    };

    // ** ABRIR MODAL **
    const abrirModalSaldado = (item) => {
        // Prellenar datos básicos
        formSaldar.deuda_original_id = item.id_ingresos_egresos;
        formSaldar.cuenta = item.cuentas.cuenta; // Nombre exacto para buscarla
        formSaldar.nombre_cuenta_visual = item.cuentas.cuenta;
        
        // >> CORRECCIÓN DE FECHA (ZONA HORARIA LOCAL) <<
        const hoy = new Date();
        // Obtenemos el año, mes y día locales. 
        const año = hoy.getFullYear();
        const mes = String(hoy.getMonth() + 1).padStart(2, '0');
        const dia = String(hoy.getDate()).padStart(2, '0');
        
        // Formateamos manualmente a YYYY-MM-DD
        formSaldar.fecha = `${año}-${mes}-${dia}`;
        formSaldar.identificacion = ''; 
        formSaldar.descripcion = '';
        formSaldar.nombre = '';
        formSaldar.tipo = 'caja'; 
        formSaldar.documento = '';
        formSaldar.numero_documento = '';
        formSaldar.fecha_emision = '';
        formSaldar.cuenta_bancaria = '';
        // El monto sugerido es el saldo pendiente
        formSaldar.monto = '';

        // Heredar los IDs de proyecto y clasificación del filtro actual
        formSaldar.id_proyectos = PROYECTO_ID; // O usa la variable PROYECTO_ID
        formSaldar.id_clasificacion = CLASIFICACION_ID; // O usa CLASIFICACION_ID

        mostrarModalSaldado.value = true;
    };

    // ** CERRAR MODAL **
    const cerrarModal = () => {
        mostrarModalSaldado.value = false;
        limpiar();
        cargarPendientes();
        // Limpiar formulario saldado si es necesario
    };

    const cerrarModalExito = () => {
        mostrarModalExito.value = false;
        limpiar();
        //cargarPendientes(); // Recargar la tabla al cerrar el éxito
    };

    // Función para cargar los pendientes desde la API
    const cargarPendientes = () => {
        pendientes.splice(0, pendientes.length); // Limpiar lista
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
            manejarErrorRuta(err, router);
        });
    };

    watch(tipo, controlarVisibilidadDivisionCuatro);
// ===================================================================================================================================
    const cerrarModalExitoFormulario = () => {
        mostrarModalExitoFormulario.value = false;
        limpiar(); 
    };

    const cerrarModalError = () => {
        mostrarModalError.value = false;
        mensajeError.value = '';
    };// ===================================================================================================================================

    // ** ENVIAR SALDADO **
    const enviarSaldado = () => {
        let tieneErrores = false;

        // 1. Validaciones de campos básicos
        if (!formSaldar.fecha) { mostrarErrorModal('fecha', 'Falta por llenar datos'); tieneErrores = true; }
        if (!formSaldar.identificacion) { mostrarErrorModal('identificacion', 'Falta por llenar datos'); tieneErrores = true; }
        if (!formSaldar.nombre) { mostrarErrorModal('nombre', 'Falta por llenar datos'); tieneErrores = true; }
        if (!formSaldar.tipo) { mostrarErrorModal('tipo', 'Falta por llenar datos'); tieneErrores = true; }

        // Validación del monto (Vacío y formato numérico)
        if (!formSaldar.monto) { 
            mostrarErrorModal('monto', 'Falta por llenar datos'); 
            tieneErrores = true; 
        } else if (isNaN(formSaldar.monto)) {
            mostrarErrorModal('monto', 'Formato incorrecto (solo números)');
            tieneErrores = true;
        }

        // 2. Validaciones si el tipo es 'bancos'
        if (formSaldar.tipo === 'bancos') {
            if (!formSaldar.documento) { mostrarErrorModal('documento', 'Falta por llenar datos'); tieneErrores = true; }
            if (!formSaldar.cuenta_bancaria) { mostrarErrorModal('cuenta_bancaria', 'Falta por llenar datos'); tieneErrores = true; }
            if (!formSaldar.numero_documento) { mostrarErrorModal('numero_documento', 'Falta por llenar datos'); tieneErrores = true; }
            if (!formSaldar.fecha_emision) { mostrarErrorModal('fecha_emision', 'Falta por llenar datos'); tieneErrores = true; }
        }

        // Detener la ejecución si hay al menos un error
        if (tieneErrores) return;

        // Preparar payload
        const payload = {
            deuda_original_id: formSaldar.deuda_original_id,
            fecha: formSaldar.fecha,
            monto: formSaldar.monto,
            identificacion: formSaldar.identificacion,
            nombre: formSaldar.nombre,
            descripcion: formSaldar.descripcion,
            tipo: formSaldar.tipo,
            cuenta: formSaldar.cuenta,
            id_proyectos: formSaldar.id_proyectos,
            id_clasificacion: formSaldar.id_clasificacion,
            // Bancarios (se envían si aplica)
            documento: formSaldar.documento,
            numero_documento: formSaldar.numero_documento,
            fecha_emision: formSaldar.fecha_emision,
            cuenta_bancaria: formSaldar.cuenta_bancaria,
        };

        axios.post('http://127.0.0.1:8000/in_eg/saldar_pendiente', payload)
            .then(response => {
                //alert("Pago registrado con éxito. Nuevo saldo: Q" + response.data.saldo_restante);
                cerrarModal();
                // PREPARAMOS Y ABRIMOS EL MODAL DE ÉXITO
                datosExito.mensaje = response.data.message;
                // Formatear el saldo para que se vea bonito (Q 100.00)
                datosExito.saldo = parseFloat(response.data.saldo_restante).toFixed(2);
                mostrarModalExito.value = true;
                limpiar();
                cargarPendientes(); // Recargar la tabla para ver cambios
            })
            .catch(err => {
                console.error(err); // ===================================================================================================================================
                error.value = "Error al guardar el ingreso. Verifique datos antes de enviar o conexión con el servidor.";
                manejarErrorRuta(error, router);// ===================================================================================================================================
            });
    };

    onMounted(() => {
      cargarCuentas();
      cargarBancosNoCuenta();
      cargarPendientes();
      // Encendemos el detector de teclado
      window.addEventListener('keydown', manejarEnter);
    });

    const cargarCuentas = () => {
      axios.get('http://127.0.0.1:8000/in_eg/getAllCuentasIngresoAG')
        .then(response => {
          cuentas.splice(0, cuentas.length, ...response.data);
        })
        .catch((err) => { // ==================================================================================================================
          console.error(err);
          error.value = 'Hubo un problema al cargar las cuentas contables';
          manejarErrorRuta(err, router)
        });
    };

    const cargarBancosNoCuenta = () => {
      axios.get('http://127.0.0.1:8000/cuentasB/getConcatenada')
        .then(response => {
          cuentas_bancarias.splice(0, cuentas_bancarias.length, ...response.data);
        })
        .catch((err) => { // ==================================================================================================================
          console.error(err);
          error.value = 'Hubo un problema al cargar las cuentas de bancos';
          manejarErrorRuta(err, router); // ===================================================================================================================================
        });
    };

    const enviarDatos = () => {
    
      let tieneErrores = false;

      // 1. Validaciones de campos vacíos
      if (!tipo.value) { mostrarErrorCampo('tipo', 'Falta por llenar datos'); tieneErrores = true; }
      if (!fecha.value) { mostrarErrorCampo('fecha', 'Falta por llenar datos'); tieneErrores = true; }
      if (!identificacion.value) { mostrarErrorCampo('identificacion', 'Falta por llenar datos'); tieneErrores = true; }
      if (!nombre.value) { mostrarErrorCampo('nombre', 'Falta por llenar datos'); tieneErrores = true; }
      // if (!descripcion.value) { mostrarErrorCampo('descripcion', 'Falta por llenar datos'); tieneErrores = true; }
      if (!cuentaCMB.value) { mostrarErrorCampo('cuentaCMB', 'Falta por llenar datos'); tieneErrores = true; }

      // 2. Validación de Monto (Vacío y Formato)
      if (!monto.value) {
        mostrarErrorCampo('monto', 'Falta por llenar datos');
        tieneErrores = true;
      } else if (isNaN(monto.value)) {
        // Validación de formato: Si no es un número
        mostrarErrorCampo('monto', 'Formato incorrecto (solo números)');
        tieneErrores = true;
      }

      // 3. Validaciones si el tipo es 'bancos'
      if (tipo.value === 'bancos') {
        if (!documento.value) { mostrarErrorCampo('documento', 'Falta por llenar datos'); tieneErrores = true; }
        if (!cuentaBName.value) { mostrarErrorCampo('cuentaBName', 'Falta por llenar datos'); tieneErrores = true; }
        if (!numero_documento.value) { mostrarErrorCampo('numero_documento', 'Falta por llenar datos'); tieneErrores = true; }
        if (!fecha_emision.value) { mostrarErrorCampo('fecha_emision', 'Falta por llenar datos'); tieneErrores = true; }
      }

      // Si se encontró al menos un error, detenemos el envío
      if (tieneErrores) return; 

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
        // AQUI ACTIVAMOS EL MODAL // ===================================================================================================================================
            mostrarModalExitoFormulario.value = true;
            console.log(response.data);  // ===================================================================================================================================
        })
        .catch(error => {
          console.error(error);
          mensajeError.value = "Error al guardar el ingreso. Verifique datos antes de enviar o conexión con el servidor.";
          mostrarModalError.value = true; // ===================================================================================================================================
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
      successMessage, // Agregado para el mensaje de éxito
      controlarVisibilidadDivisionCuatro,
      // nuevas variables
      pendientes,
      cargarPendientes,
      mensajeVacio,
      // ----------------
      mostrarModalSaldado,
      formSaldar,
      abrirModalSaldado,
      cerrarModal,
      enviarSaldado,
      mostrarModalExito,
      datosExito,
      cerrarModalExito,
      // ---------------- // ===================================================================================================================================
      fieldErrors,
      modalErrors,
      error,
      mostrarModalExitoFormulario,
      cerrarModalExitoFormulario,
      mostrarModalError,
      mensajeError,
      cerrarModalError // ===================================================================================================================================
    };
  },
}
</script>

