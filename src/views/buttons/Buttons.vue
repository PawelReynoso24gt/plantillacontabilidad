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

  <!-- Ingresos: registrados + pendientes por cobrar, en un solo panel -->
  <div class="listado-registros">
    <div class="listado-header">
      <h3 class="listado-title">Ingresos</h3>
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
      <div class="listado-tabs">
        <button
          :class="['listado-tab', { active: tabIngresos === 'todos' }]"
          @click="tabIngresos = 'todos'"
        >
          Todos los registros
        </button>
        <button
          :class="['listado-tab', { active: tabIngresos === 'pendientes' }]"
          @click="tabIngresos = 'pendientes'"
        >
          Pendientes por Cobrar
        </button>
      </div>

      <template v-if="tabIngresos === 'todos'">
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

      <template v-else>
        <p v-if="mensajeVacio" class="text-danger" style="margin-top: 10px;">{{ mensajeVacio }}</p>

        <p v-else-if="pendientes.length === 0" class="listado-empty">
          No hay pendientes por cobrar.
        </p>

        <div v-if="pendientes.length > 0" style="overflow-x: auto;">
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
                <td><button class="btn-link" @click="abrirConfirmSaldar(item)">Saldar</button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </template>
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

  <!-- ******* MODAL CONFIRMAR SALDAR ******* -->
  <div v-if="mostrarConfirmSaldar" class="confirm-modal-overlay">
    <div class="confirm-modal-box">
      <div class="confirm-modal-header">
        <span class="confirm-modal-icon">💰</span>
        <h3>Saldar registro</h3>
      </div>
      <div class="confirm-modal-body">
        <p>¿Deseas continuar para registrar un abono a este pendiente?</p>
        <div class="confirm-modal-summary">
          <div class="modal-id-row">
            <label>Fecha: </label>
            <span>{{ itemASaldar?.fecha }}</span>
          </div>
          <div class="modal-id-row">
            <label>Nombre: </label>
            <span>{{ itemASaldar?.nombre }}</span>
          </div>
          <div class="modal-id-row">
            <label>Saldo pendiente: </label>
            <span>Q {{ itemASaldar?.saldo_pendiente }}</span>
          </div>
        </div>
      </div>
      <div class="confirm-modal-actions">
        <button class="btn-secondary" @click="cerrarConfirmSaldar">Cancelar</button>
        <button class="btn-primary" @click="confirmarIrASaldar">Continuar</button>
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
        </div>
      </div>

      <div class="division-container">
        <div class="field-group">
          <label class="field-label">DPI/NIT/CF</label>
          <input type="text" v-model="formSaldar.identificacion" class="field-control">
        </div>
        <div class="field-group">
          <label class="field-label">Nombre/CF</label>
          <input type="text" v-model="formSaldar.nombre" class="field-control">
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
        </div>
        <div class="field-group">
          <label class="field-label">Monto a Pagar (Q)</label>
          <input type="text" v-model="formSaldar.monto" class="field-control" placeholder="0.00">
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
        </div>
        
        <div class="field-group">
          <label class="field-label">Cuenta Bancaria</label>
          <select v-model="formSaldar.cuenta_bancaria" class="field-control">
            <option v-for="cuentaN in cuentas_bancarias" :value="cuentaN.cuenta_bancaria">
              {{ cuentaN.banco_y_cuenta }}
            </option> 
          </select>
        </div>
        
        <div class="field-group">
          <label class="field-label">No. Documento</label>
          <input type="text" v-model="formSaldar.numero_documento" class="field-control">
        </div>
        
        <div class="field-group">
          <label class="field-label">Fecha Emisión</label>
          <input type="date" v-model="formSaldar.fecha_emision" class="field-control">
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
</template>

<script>
import axios from 'axios';
import { ref, reactive, onMounted, watch } from 'vue';
import '../../styles/css/IngresosAgricola.css'
import '../../styles/css/ListadoRegistrosA.css'

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

    // Registros de ingresos (listado paginado + eliminar)
    const registros = ref([]);
    const paginaActual = ref(1);
    const totalPaginas = ref(1);
    const cargandoRegistros = ref(false);
    const mostrarRegistros = ref(true);
    const tabIngresos = ref('todos');
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
          'http://127.0.0.1:8000/in_eg/getListaIngresosAG',
          { params: { page, per_page: 5 } }
        );
        registros.value = data.data || [];
        paginaActual.value = data.current_page || 1;
        totalPaginas.value = data.last_page || 1;
      } catch (e) {
        console.error('Error cargando ingresos:', e?.response?.data || e.message);
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
        success.value = 'Registro eliminado correctamente';
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

    // ** CONFIRMAR ANTES DE SALDAR **
    const mostrarConfirmSaldar = ref(false);
    const itemASaldar = ref(null);

    const abrirConfirmSaldar = (item) => {
      itemASaldar.value = item;
      mostrarConfirmSaldar.value = true;
    };

    const cerrarConfirmSaldar = () => {
      mostrarConfirmSaldar.value = false;
      itemASaldar.value = null;
    };

    const confirmarIrASaldar = () => {
      const item = itemASaldar.value;
      mostrarConfirmSaldar.value = false;
      itemASaldar.value = null;
      if (item) abrirModalSaldado(item);
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
        cargarPendientes(); // Recargar la tabla al cerrar el éxito
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

    // ** ENVIAR SALDADO **
    const enviarSaldado = () => {
        if (!formSaldar.monto || !formSaldar.fecha) {
            alert("Por favor ingrese monto y fecha.");
            return;
        }

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
                console.error(err);
                alert("Error al registrar el pago.");
            });
    };

    onMounted(() => {
      cargarCuentas();
      cargarBancosNoCuenta();
      cargarPendientes();
      cargarRegistros();
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
        //  console.log(response.data);
          success.value = 'Datos enviados correctamente'; // Mensaje de éxito
           cargarPendientes();
           cargarRegistros();
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
      mostrarModalSaldado,
      formSaldar,
      abrirModalSaldado,
      cerrarModal,
      enviarSaldado,
      mostrarModalExito,
      datosExito,
      cerrarModalExito,
      // ----------------
      registros,
      paginaActual,
      totalPaginas,
      cargandoRegistros,
      mostrarRegistros,
      tabIngresos,
      mostrarConfirmEliminar,
      registroAEliminar,
      eliminando,
      errorEliminar,
      formatMonto,
      cargarRegistros,
      abrirConfirmEliminar,
      cerrarConfirmEliminar,
      confirmarEliminar,
      mostrarConfirmSaldar,
      itemASaldar,
      abrirConfirmSaldar,
      cerrarConfirmSaldar,
      confirmarIrASaldar,
    };
  },
}
</script>

