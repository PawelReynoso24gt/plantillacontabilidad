<template>
  <div class="page-wrapper">
    <div class="page-card">

      <!-- Encabezado -->
      <div class="module-header">
        <div>
          <h2 class="module-title">Anticipo sobre compras - Capilla</h2>
          <p class="module-subtitle">
            Registro de anticipos pagados para compras del proyecto capilla.
          </p>
        </div>
      </div>

      <!-- Egreso para -->
      <div class="section-container section-container--inline">
        <div class="field-group">
          <label class="field-label">Egreso para</label>
          <select v-model="tipo" class="field-control">
            <option disabled value="">Seleccione</option>
            <option value="caja">Caja</option>
            <option value="bancos">Bancos</option>
          </select>
          <small v-if="fieldErrors.tipo" class="error-text">{{ fieldErrors.tipo }}</small>
      </div>
      </div>

      <!-- Fecha -->
      <div class="section-container section-container--inline">
        <div class="field-group">
          <label class="field-label">Fecha</label>
          <input type="date" v-model="fecha" class="field-control" />
          <small v-if="fieldErrors.fecha" class="error-text">{{ fieldErrors.fecha }}</small>
      </div>
      </div>

      <!-- DPI / Nombre / Observaciones -->
      <div class="section-container">
        <div class="field-group">
          <label class="field-label">DPI / NIT / CF</label>
          <input type="text" v-model="identificacion" class="field-control" />
          <small v-if="fieldErrors.identificacion" class="error-text">{{ fieldErrors.identificacion }}</small>
      </div>
        <div class="field-group">
          <label class="field-label">Nombre / CF</label>
          <input type="text" v-model="nombre" class="field-control" />
          <small v-if="fieldErrors.nombre" class="error-text">{{ fieldErrors.nombre }}</small>
      </div>
        <div class="field-group field-group--full">
          <label class="field-label">Observaciones del comprobante</label>
          <input type="text" v-model="descripcion" class="field-control" />
        </div>
      </div>

      <!-- Monto -->
      <div class="section-container section-container--inline">
        <div class="field-group">
          <label class="field-label">Monto</label>
          <input type="text" v-model="monto" class="field-control" placeholder="0.00"/>
          <small v-if="fieldErrors.monto" class="error-text">{{ fieldErrors.monto }}</small>
      </div>
      </div>

      <!-- Datos del pago (solo bancos) -->
      <div class="section-container section-container--block" v-if="mostrarDivisionCuatro">
        <h3 class="section-title">Datos del pago</h3>

        <div class="field-group">
          <label class="field-label">Documento</label>
          <select v-model="documento" class="field-control">
            <option disabled value="">Seleccione</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Depósitos">Depósitos</option>
            <option value="Cheque">Cheque</option>
          </select>
          <small v-if="fieldErrors.documento" class="error-text">{{ fieldErrors.documento }}</small>
      </div>

        <div class="field-group">
          <label class="field-label">Cuenta bancaria</label>
          <select v-model.number="idCuentaBancaria" class="field-control">
            <option disabled value="">Seleccione una cuenta</option>
            <option v-for="c in cuentas_bancarias" :key="c.id" :value="c.id">
              {{ c.label }}
            </option>
          </select>
          <small v-if="fieldErrors.idCuentaBancaria" class="error-text">{{ fieldErrors.idCuentaBancaria }}</small>
      </div>

        <div class="field-group">
          <label class="field-label">No. documento</label>
          <input type="text" v-model="numero_documento" class="field-control" />
          <small v-if="fieldErrors.numero_documento" class="error-text">{{ fieldErrors.numero_documento }}</small>
      </div>

        <div class="field-group">
          <label class="field-label">Fecha emisión</label>
          <input type="date" v-model="fecha_emision" class="field-control" />
          <small v-if="fieldErrors.fecha_emision" class="error-text">{{ fieldErrors.fecha_emision }}</small>
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

      <!-- Botones principales -->
      <div class="form-actions">
        <button class="btn btn-primary" @click="enviarDatos">Guardar</button>
        <button class="btn btn-secondary" @click="limpiar">Limpiar</button>
        <button class="btn btn-ghost" @click="toggleMostrarTabla">
          {{ showTabla ? 'Ocultar tabla' : 'Mostrar tabla' }}
        </button>
      </div>
    </div>

      <!-- Tabla de anticipos (colapsable) -->
      <div v-if="showTabla" class="section-container section-container--block mt-3">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <h3 class="section-title" style="margin: 0;">Anticipos registrados</h3>
          <span v-if="loading" class="badge badge--warning">Cargando...</span>
        </div>

        <p v-if="!loading && anticipoRows.length === 0" class="table-empty">
          No hay registros.
        </p>

        <div v-if="!loading && anticipoRows.length" class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Nomenclatura</th>
                <th>Nombre</th>
                <th>Cuenta</th>
                <th>Tipo</th>
                <th class="cell-right">Monto</th>
                <th class="cell-right">Monto faltante</th>
                <th class="cell-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(r, idx) in anticipoRows" :key="idx">
                <td>{{ r.fecha }}</td>
                <td>{{ r.nomenclatura }}</td>
                <td>{{ r.nombre }}</td>
                <td>{{ r.id_cuentas }}</td>
                <td>{{ r.tipo }}</td>
                <td class="cell-right">{{ formatMonto(r.monto) }}</td>
                <td class="cell-right">{{ formatMonto(r.monto_faltante) }}</td>
                <td class="cell-center">
                  <button class="btn-link" @click="openSaldarModal(r)">Saldar</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div><!-- /page-card -->
  </div><!-- /page-wrapper -->

  <!-- Modal para saldar -->
  <div v-if="showModal" class="modal-overlay">
    <div class="modal-box">

      <div class="module-header">
        <div>
          <h3 class="module-title">Saldar registro</h3>
        </div>
      </div>

      <!-- ID -->
      <div class="section-container">
        <div class="field-group">
          <label class="field-label">ID cuenta</label>
          <input
            type="text"
            :value="modalData.id_ingresos_egresos !== null && modalData.id_ingresos_egresos !== undefined ? modalData.id_ingresos_egresos : '-'"
            class="field-control"
            disabled
          />
        </div>
      </div>

        <div class="modal-form">
          <div class="input-container">
            <label>Nomenclatura</label>
            <div style="width: 100%;">
              <input type="text" v-model="modalData.nomenclatura" style="width: 100%;" />
              <small v-if="modalErrors.nomenclatura" class="error-text">{{ modalErrors.nomenclatura }}</small>
            </div>
          </div>
          <div class="input-container">
            <label>Cuenta</label>
              <div style="width: 100%;">
                <input type="text" v-model="modalData.id_cuentas" style="width: 100%;" />
                <small v-if="modalErrors.id_cuentas" class="error-text">{{ modalErrors.id_cuentas }}</small>
              </div> 
          </div>
          <div class="input-container">
            <label>Fecha</label>
              <div style="width: 100%;">
                <input type="date" v-model="modalData.fecha" style="width: 100%;" />
                <small v-if="modalErrors.fecha" class="error-text">{{ modalErrors.fecha }}</small>
              </div>
          </div>
          <div class="input-container">
            <label>DPI/NIT/CF</label>
              <div style="width: 100%;">
                <input type="text" v-model="modalData.identificacion" style="width: 100%;" />
                <small v-if="modalErrors.identificacion" class="error-text">{{ modalErrors.identificacion }}</small>
              </div>
          </div>
          <div class="input-container">
            <label>Nombre</label>
              <div style="width: 100%;">
                <input type="text" v-model="modalData.nombre" style="width: 100%;" />
                <small v-if="modalErrors.nombre" class="error-text">{{ modalErrors.nombre }}</small>
              </div>
          </div>
          <div class="input-container">
            <label>Observaciones</label>
            <div style="width: 100%;">
                <input type="text" v-model="modalData.descripcion" style="width: 100%;" />
              </div>
          </div>
          <div class="input-container">
            <label>Monto</label>
            <div style="width: 100%;">
              <input type="text" v-model="modalData.monto" style="width: 100%;" />
                <small v-if="modalErrors.monto" class="error-text">{{ modalErrors.monto }}</small>
              </div>
          </div>
          <div class="input-container">
            <label>Monto a abonar</label>
            <div style="width: 100%;">
                <input
                  type="text"
                  v-model="modalData.monto_abono"
                  placeholder="0.00"
                />
                <small v-if="modalErrors.monto_abono" class="error-text">{{ modalErrors.monto_abono }}</small>
              </div>
          </div>
          <div class="input-container">
            <label>Tipo</label>
            <div style="width: 100%;">
                <select v-model="modalData.tipo" style="width: 100%;">
                  <option value="caja">caja</option>
                  <option value="bancos">bancos</option>
                </select>
                <small v-if="modalErrors.tipo" class="error-text">{{ modalErrors.tipo }}</small>
              </div>
          </div>

          <template v-if="modalData.tipo === 'bancos'">
            <div class="input-container">
              <label>Documento</label>
              <div style="width: 100%;">
                  <select v-model="modalData.documento" style="width: 100%;">
                    <option value="Transferencia">Transferencia</option>
                    <option value="Depósitos">Depósitos</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                  <small v-if="modalErrors.documento" class="error-text">{{ modalErrors.documento }}</small>
                </div>
            </div>
            <div class="input-container">
              <label>Cuenta bancaria</label>
              <div style="width: 100%;">
                  <select v-model.number="modalData.idCuentaBancaria" style="width: 100%;">
                    <option
                      v-for="c in cuentas_bancarias"
                      :key="c.id"
                      :value="c.id"
                    >
                      {{ c.label }}
                    </option>
                  </select>
                  <small v-if="modalErrors.idCuentaBancaria" class="error-text">{{ modalErrors.idCuentaBancaria }}</small>
                </div>
            </div>
            <div class="input-container">
              <label>No. documento</label>
                <div style="width: 100%;">
                  <input
                    type="text"
                    v-model="modalData.numero_documento"
                    style="width: 100%;"
                  />
                  <small v-if="modalErrors.numero_documento" class="error-text">{{ modalErrors.numero_documento }}</small>
                </div>
            </div>
            <div class="input-container">
              <label>Fecha emisión</label>
              <div style="width: 100%;">
                  <input
                    type="date"
                    v-model="modalData.fecha_emision"
                    style="width: 100%;"
                  />
                  <small v-if="modalErrors.fecha_emision" class="error-text">{{ modalErrors.fecha_emision }}</small>
                </div>
            </div>
          </template>
        </div>

        <div class="field-group">
          <label class="field-label">Fecha emisión</label>
          <input type="date" v-model="modalData.fecha_emision" class="field-control" />
        </div>

        <!-- Botones del modal -->
        <div class="form-actions">
          <button class="btn btn-secondary" @click="closeModal">Cancelar</button>
          <button class="btn btn-primary" @click="saldarRegistroConfirm">Confirmar</button>
        </div>

    </div><!-- /modal-box -->
  </div>


    <!-- **MODAL DE INGRESO CORRECTO** ================================================================================================================================ -->
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
  <!-- ******* MODAL DE ÉXITO ******* -->
  <div v-if="mostrarModalExito" class="modal-overlay">
    <div class="modal-content egreso-card" style="max-width: 450px; text-align: center;">
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
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router'; // para redirección de rutas
import { manejarErrorRuta } from '../../../utils/manejarErrores.js';
import '@/styles/global.css'
import '../../styles/css/GlobalAlertsModals.css';

export default {
  name: 'Accordion',
  setup() {
    const router = useRouter();
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
    const cuentas_bancarias = ref([]);
    const error = ref('');
    const mostrarModalExitoFormulario = ref(false);
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
      fecha_emision: '',
      nomenclatura: '',
      id_cuentas: '',
      monto_abono: '',
      idCuentaBancaria: ''
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
      fecha_emision: '',
      nomenclatura: '',
      id_cuentas: '',
      monto_abono: '',
      idCuentaBancaria: ''
    });
    const successMessage = ref('');
    const idCuentaBancaria = ref(null);
    const anticipoRows = ref([]);
    const loading = ref(false);
    const showTabla = ref(true);
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
      successMessage.value = '';
      idCuentaBancaria.value = '';
    };


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

    const cerrarModalExito = () => {
      mostrarModalExito.value = false;
      limpiar();
    };

    // ==========================================
    // DETECTOR DE TECLADO (ENTER PARA MODALES)
    // ==========================================
    const manejarEnter = (event) => {
      if (event.key === 'Enter') {
        // Previene que el Enter haga cosas raras (como recargar la página si estuviera en un <form>)
        event.preventDefault();

        // Evaluamos qué modal está abierto actualmente:
        if (mostrarModalExito.value) {
          cerrarModalExito(); // Aceptar éxito de saldado
        } 
        else if (mostrarModalExitoFormulario.value) {
          cerrarModalExitoFormulario(); // Aceptar éxito de guardado normal
        }
      }
    };

    const cerrarModalExitoFormulario = () => {
        mostrarModalExitoFormulario.value = false;
        limpiar(); 
    };

    const controlarVisibilidadDivisionCuatro = () => {
      mostrarDivisionCuatro.value = tipo.value === 'bancos';
    };

    const cargarCuentasSelect = () => {
      axios
        .get('http://127.0.0.1:8000/cuentasB/for-select')
        .then(({ data }) => {
          cuentas_bancarias.value = data;
          if (!idCuentaBancaria.value && data.length) {
            idCuentaBancaria.value = Number(data[0].id);
          }
        })
        .catch((err) => {
          console.error('for-select:', err?.response?.data || err.message);
          error.value = 'Hubo un problema al cargar las cuentas de bancos';
          manejarErrorRuta(err, router);
        });
    };

    watch(tipo, controlarVisibilidadDivisionCuatro);
    controlarVisibilidadDivisionCuatro();

    const cargarCuentas = () => {
      axios
        .get('http://127.0.0.1:8000/in_eg/getAllCuentasEgresoCA')
        .then((response) => {
          cuentas.splice(0, cuentas.length, ...response.data);
        })
        .catch((error) => {
          console.error(error);
          error.value = 'Hubo un problema al cargar las cuentas contables';
          manejarErrorRuta(error, router);
        });
    };

    const cargarBancosNoCuenta = () => {
      axios
        .get('http://127.0.0.1:8000/cuentasB/getConcatenada')
        .then((response) => {
          cuentas_bancarias.splice(0, cuentas_bancarias.length, ...response.data);
        })
        .catch((error) => {
          console.error(error);
          error.value = 'Hubo un problema al cargar las cuentas de bancos';
          manejarErrorRuta(error, router);
        });
    };

    const cargarBancos = () => {
      axios
        .get('http://127.0.0.1:8000/in_eg/getByNombreB')
        .then((response) => {
          cuentas_bancarias.splice(0, cuentas_bancarias.length, ...response.data);
        })
        .catch((error) => {
          console.error(error);
          error.value = 'Hubo un problema al cargar los bancos';
          manejarErrorRuta(error, router);
        });
    };

    const enviarDatos = () => {
      let tieneErrores = false;

      // 1. Validaciones de campos vacíos principales
      if (!tipo.value) { mostrarErrorCampo('tipo', 'Falta por llenar datos'); tieneErrores = true; }
      if (!fecha.value) { mostrarErrorCampo('fecha', 'Falta por llenar datos'); tieneErrores = true; }
      if (!identificacion.value) { mostrarErrorCampo('identificacion', 'Falta por llenar datos'); tieneErrores = true; }
      if (!nombre.value) { mostrarErrorCampo('nombre', 'Falta por llenar datos'); tieneErrores = true; }
      if (!descripcion.value) { mostrarErrorCampo('descripcion', 'Falta por llenar datos'); tieneErrores = true; }

      // 2. Validación de Monto (Vacío y Formato Numérico)
      if (!monto.value) {
        mostrarErrorCampo('monto', 'Falta por llenar datos');
        tieneErrores = true;
      } else if (isNaN(monto.value)) {
        mostrarErrorCampo('monto', 'Formato incorrecto (solo números)');
        tieneErrores = true;
      }

      // 3. Validaciones adicionales si el tipo es 'bancos'
      if (tipo.value === 'bancos') {
        if (!documento.value) { mostrarErrorCampo('documento', 'Falta por llenar datos'); tieneErrores = true; }
        
        // Validación estricta para idCuentaBancaria (vacío o no entero)
        if (!idCuentaBancaria.value) { 
          mostrarErrorCampo('idCuentaBancaria', 'Falta por llenar datos'); 
          tieneErrores = true; 
        } else if (!Number.isInteger(idCuentaBancaria.value)) {
          mostrarErrorCampo('idCuentaBancaria', 'Debes seleccionar una cuenta bancaria válida.');
          tieneErrores = true;
        }

        if (!numero_documento.value) { mostrarErrorCampo('numero_documento', 'Falta por llenar datos'); tieneErrores = true; }
        if (!fecha_emision.value) { mostrarErrorCampo('fecha_emision', 'Falta por llenar datos'); tieneErrores = true; }
      }

      // Si se detectó algún error en las validaciones, detenemos la ejecución
      if (tieneErrores) return;

      // 4. Armar UN SOLO objeto de datos (Payload)
      const data = {
        fecha: fecha.value,
        identificacion: identificacion.value,
        nombre: nombre.value,
        descripcion: descripcion.value,
        monto: monto.value,
        tipo: tipo.value, // Envía 'caja' o 'bancos' dinámicamente
        cuenta: 'Anticipo de compras y gastos', // Valor fijo
        // Datos bancarios (el backend los ignorará automáticamente si es 'caja')
        documento: documento.value,
        numero_documento: numero_documento.value,
        fecha_emision: fecha_emision.value,
        id_cuentas_bancarias: idCuentaBancaria.value
      };

      //console.log('ENVIANDO ANTICIPO CAPILLA:', data);

      // 5. Hacer la petición Axios a la ruta de CAPILLA (CA)
      axios.post('http://127.0.0.1:8000/in_eg/createAnticipoCompraCA', data)
        .then(response => {
          //console.log('ÉXITO:', response.data);
          mostrarModalExitoFormulario.value = true; // Mostramos el modal de éxito
          showTabla.value = true;
          fetchTablaAnticipoAG();
        })
        .catch(error => {
          console.error("ERROR al guardar anticipo:", error?.response?.data || error.message);
          manejarErrorRuta(error, router);
        });
    };

    const fetchTablaAnticipoAG = async () => {
      loading.value = true;
      try {
        const { data } = await axios.get(
          'http://localhost:8000/in_eg/tablaVistaAnticipoCA'
        );
        anticipoRows.value = Array.isArray(data) ? data : [];

        await Promise.all(
          anticipoRows.value.map(async (r) => {
            try {
              const id = r.id_ingresos_egresos || r.id_ingresos_egreso || null;
              if (id === null || id === undefined) {
                r.monto_faltante = 0;
                return;
              }
              const resp = await axios.post(
                'http://localhost:8000/saldar_anticipos/getMontoFaltanteCA',
                { id_ingresos_egresos: id }
              );
              r.monto_faltante = resp?.data?.monto_faltante ?? 0;
            } catch (err) {
              console.error(
                'Error obteniendo monto faltante para',
                r.id_ingresos_egresos,
                err?.response?.data || err.message || err
              );
              r.monto_faltante = 0;
            }
          })
        );
      } catch (e) {
        console.error(
          'Error cargando tablaVistaAnticipoAG:',
          e?.response?.data || e.message
        );
        manejarErrorRuta(e, router);
        anticipoRows.value = [];
      } finally {
        loading.value = false;
      }
    };

    const formatMonto = (m) => {
      const n = Number(m);
      if (Number.isNaN(n)) return m;
      return n.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    };

    const toggleMostrarTabla = () => {
      showTabla.value = !showTabla.value;
      if (showTabla.value && anticipoRows.value.length === 0) {
        fetchTablaAnticipoAG();
      }
    };

    // Modal
    const showModal = ref(false);
    const modalData = reactive({
      fecha: '',
      identificacion: '',
      nombre: '',
      descripcion: '',
      monto: '',
      monto_abono: '',
      tipo: '',
      documento: '',
      numero_documento: '',
      fecha_emision: '',
      idCuentaBancaria: null,
      id_cuentas: '',
      id_ingresos_egresos: null,
      nomenclatura: ''
    });

    const openSaldarModal = (row) => {
      modalData.nomenclatura = row.nomenclatura || row.nomen || row.nom || '';
      modalData.id_cuentas = row.id_cuentas || '';
      modalData.id_ingresos_egresos = row.id_ingresos_egresos || null;

      modalData.fecha = '';
      modalData.identificacion = '';
      modalData.nombre = '';
      modalData.descripcion = '';
      modalData.monto = row.monto != null ? String(row.monto) : '';
      modalData.monto_abono = '';

      const rawTipo = (row.tipo || row.type || '').toString();
      modalData.tipo = rawTipo === 'banco' ? 'bancos' : rawTipo || '';

      modalData.documento = '';
      modalData.numero_documento = '';
      modalData.fecha_emision = '';
      modalData.idCuentaBancaria = null;

      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
    };

    const saldarRegistroConfirm = async () => {
      let tieneErrores = false;

      // 1. Limpieza de montos y parseo seguro
      const montoAbono = parseFloat(String(modalData.monto_abono || '').replace(/,/g, ''));
      const montoTotal = parseFloat(String(modalData.monto || '').replace(/,/g, '')) || 0;

      // 2. Validaciones generales de campos vacíos
      if (!modalData.nomenclatura) { mostrarErrorModal('nomenclatura', 'Falta por llenar datos'); tieneErrores = true; }
      if (!modalData.id_cuentas) { mostrarErrorModal('id_cuentas', 'Falta por llenar datos'); tieneErrores = true; }
      if (!modalData.fecha) { mostrarErrorModal('fecha', 'Falta por llenar datos'); tieneErrores = true; }
      if (!modalData.identificacion) { mostrarErrorModal('identificacion', 'Falta por llenar datos'); tieneErrores = true; }
      if (!modalData.nombre) { mostrarErrorModal('nombre', 'Falta por llenar datos'); tieneErrores = true; }
      if (!modalData.tipo) { mostrarErrorModal('tipo', 'Falta por llenar datos'); tieneErrores = true; }

      // 3. Validaciones Lógicas de Montos
      if (Number.isNaN(montoAbono) || montoAbono <= 0) {
        mostrarErrorModal('monto_abono', 'Ingrese un monto mayor a 0');
        tieneErrores = true;
      } else if (montoAbono > montoTotal) {
        mostrarErrorModal('monto_abono', 'No puede ser mayor al total');
        tieneErrores = true;
      }

      // 4. Validaciones bancarias condicionales
      if (modalData.tipo === 'bancos') {
        if (!modalData.documento) { mostrarErrorModal('documento', 'Falta por llenar datos'); tieneErrores = true; }
        
        if (!modalData.idCuentaBancaria) { 
            mostrarErrorModal('idCuentaBancaria', 'Falta por llenar datos'); 
            tieneErrores = true; 
        } else if (!Number.isInteger(modalData.idCuentaBancaria)) {
            mostrarErrorModal('idCuentaBancaria', 'Cuenta inválida'); 
            tieneErrores = true; 
        }

        if (!modalData.numero_documento) { mostrarErrorModal('numero_documento', 'Falta por llenar datos'); tieneErrores = true; }
        if (!modalData.fecha_emision) { mostrarErrorModal('fecha_emision', 'Falta por llenar datos'); tieneErrores = true; }
      }

      // Detenemos la ejecución si se activó algún error en pantalla
      if (tieneErrores) return;

      // 5. Armado de Payload
      const payload = {
        fecha:
          modalData.fecha || new Date().toISOString().slice(0, 10),
        identificacion: modalData.identificacion || '',
        nombre: modalData.nombre || '',
        descripcion: modalData.descripcion || '',
        monto: montoAbono,
        tipo: modalData.tipo || '',
        cuenta: modalData.id_cuentas || '',
        id_ingresos_egresos: modalData.id_ingresos_egresos || null,
        fecha_pago:
          modalData.fecha_emision ||
          modalData.fecha ||
          new Date().toISOString().slice(0, 10),
        monto_pago: montoAbono
      };

      if ((modalData.tipo || '').toString() === 'bancos') {
        payload.documento = modalData.documento || '';
        payload.numero_documento = modalData.numero_documento || '';
        payload.fecha_emision = modalData.fecha_emision || '';
        payload.id_cuentas_bancarias = modalData.idCuentaBancaria || null;
      }

      try {
        const url =
          'http://localhost:8000/saldar_anticipos/saldarAnticipoCA';
        await axios.post(url, payload);
        
        showModal.value = false; // Cerramos el modal actual
        mostrarModalExitoFormulario.value = true; // Abrimos modal de éxito
        
        fetchTablaAnticipoAG(); // Recargamos tabla
      } catch (e) {
        console.error(
          'Error al saldar:',
          e?.response?.data || e.message || e
        );
        error.value =
          e?.response?.data?.message || 'Error al saldar el anticipo.';
        manejarErrorRuta(e, router);
        mensajeError.value = e?.response?.data?.message || 'Error al saldar el anticipo. Verifique su conexión.';
      }
    };

    onMounted(() => {
      cargarCuentasSelect();
      fetchTablaAnticipoAG();
      window.addEventListener('keydown', manejarEnter);
    });

    onUnmounted(() => {
      // Apagamos el detector de teclado al salir de la pantalla
      window.removeEventListener('keydown', manejarEnter);
    });

    return {
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
      error,
      successMessage,
      idCuentaBancaria,
      enviarDatos,
      cargarCuentas,
      cargarBancos,
      controlarVisibilidadDivisionCuatro,
      cargarBancosNoCuenta,
      limpiar,
      anticipoRows,
      loading,
      fetchTablaAnticipoAG,
      formatMonto,
      showTabla,
      toggleMostrarTabla,
      showModal,
      modalData,
      openSaldarModal,
      closeModal,
      saldarRegistroConfirm,
      datosExito,
      fieldErrors,
      modalErrors,
      mostrarModalExitoFormulario,
      mostrarModalExito,
      cerrarModalExitoFormulario,
      mensajeError
    };
  }
};
</script>
