<template>
     <!-- Encabezado -->
      <div class="anticipo-header">
        <div>
          <h2 class="anticipo-title">Anticipo sobre compras</h2>
          <p class="anticipo-subtitle">
            Registro de anticipos pagados para compras agrícolas.
          </p>
        </div>
      </div>

      <!-- Egreso para -->
      <div class="division-container division-inline">
        <div class="field-group">
          <label class="field-label">Egreso para</label>
          <select v-model="tipo" class="field-control">
            <option disabled value="">Seleccione</option>
            <option value="caja">Caja</option>
            <option value="bancos">Bancos</option>
          </select>
        </div>
      </div>

      <!-- Fecha -->
      <div class="division-container division-inline">
        <div class="field-group">
          <label class="field-label">Fecha</label>
          <input type="date" v-model="fecha" class="field-control" />
        </div>
      </div>

      <!-- Identificación / nombre / observaciones -->
      <div class="division-container">
        <div class="field-group">
          <label class="field-label">DPI/NIT/CF</label>
          <input type="text" v-model="identificacion" class="field-control" />
        </div>

        <div class="field-group">
          <label class="field-label">Nombre/CF</label>
          <input type="text" v-model="nombre" class="field-control" />
        </div>

        <div class="field-group full-width">
          <label class="field-label">Observaciones del comprobante</label>
          <input type="text" v-model="descripcion" class="field-control" />
        </div>
      </div>

      <!-- Monto -->
      <div class="division-container division-inline">
        <div class="field-group">
          <label class="field-label">Monto</label>
          <input type="text" v-model="monto" class="field-control" />
        </div>
      </div>

      <!-- Datos del pago (solo cuando es bancos) -->
      <div class="division-container division-block" v-if="mostrarDivisionCuatro">
        <h3 class="division-title">Datos del pago</h3>

        <div class="field-group">
          <label class="field-label">Documento</label>
          <select v-model="documento" class="field-control">
            <option disabled value="">Seleccione</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Depósitos">Depósitos</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>

        <div class="field-group">
          <label class="field-label">Cuenta bancaria</label>
          <select v-model.number="idCuentaBancaria" class="field-control">
            <option disabled value="">Seleccione una cuenta</option>
            <option
              v-for="c in cuentas_bancarias"
              :key="c.id"
              :value="c.id"
            >
              {{ c.label }}
            </option>
          </select>
        </div>

        <div class="field-group">
          <label class="field-label">No. Documento</label>
          <input
            type="text"
            v-model="numero_documento"
            class="field-control"
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

      <!-- Botones principales -->
      <div class="form-actions">
        <button class="btn-primary" @click="enviarDatos">Guardar</button>
        <button class="btn-secondary" @click="limpiar">Limpiar</button>
        <button class="btn-ghost" @click="toggleMostrarTabla">
          {{ showTabla ? 'Ocultar tabla' : 'Mostrar tabla' }}
        </button>
      </div>

      <!-- Tabla de anticipos (colapsable) -->
      <div v-if="showTabla" class="tabla-anticipos">
        <div class="tabla-header">
          <h3 class="tabla-title">Anticipos registrados</h3>
          <span v-if="loading" class="tabla-badge">Cargando...</span>
        </div>

        <p v-if="!loading && anticipoRows.length === 0" class="tabla-empty">
          No hay registros.
        </p>

        <table
          v-if="!loading && anticipoRows.length"
          class="table-anticipo"
        >
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Nomenclatura</th>
              <th>Nombre</th>
              <th>Cuenta</th>
              <th>Tipo</th>
              <th class="right">Monto</th>
              <th class="right">Monto faltante</th>
              <th class="center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, idx) in anticipoRows" :key="idx">
              <td>{{ r.fecha }}</td>
              <td>{{ r.nomenclatura }}</td>
              <td>{{ r.nombre }}</td>
              <td>{{ r.id_cuentas }}</td>
              <td>{{ r.tipo }}</td>
              <td class="right">{{ formatMonto(r.monto) }}</td>
              <td class="right">{{ formatMonto(r.monto_faltante) }}</td>
              <td class="center">
                <button class="btn-link" @click="openSaldarModal(r)">
                  Saldar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal para saldar -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-box">
          <h3>Saldar registro</h3>

          <div class="modal-id-row">
            <label>ID cuenta:</label>
            <span>
              {{
                modalData.id_ingresos_egresos !== null &&
                modalData.id_ingresos_egresos !== undefined
                  ? modalData.id_ingresos_egresos
                  : '-'
              }}
            </span>
          </div>

          <div class="modal-form">
            <div class="input-container">
              <label>Nomenclatura</label>
              <input type="text" v-model="modalData.nomenclatura" />
            </div>
            <div class="input-container">
              <label>Cuenta</label>
              <input type="text" v-model="modalData.id_cuentas" />
            </div>
            <div class="input-container">
              <label>Fecha</label>
              <input type="date" v-model="modalData.fecha" />
            </div>
            <div class="input-container">
              <label>DPI/NIT/CF</label>
              <input type="text" v-model="modalData.identificacion" />
            </div>
            <div class="input-container">
              <label>Nombre</label>
              <input type="text" v-model="modalData.nombre" />
            </div>
            <div class="input-container">
              <label>Observaciones</label>
              <input type="text" v-model="modalData.descripcion" />
            </div>
            <div class="input-container">
              <label>Monto</label>
              <input type="text" v-model="modalData.monto" />
            </div>
            <div class="input-container">
              <label>Monto a abonar</label>
              <input
                type="text"
                v-model="modalData.monto_abono"
                placeholder="0.00"
              />
            </div>
            <div class="input-container">
              <label>Tipo</label>
              <select v-model="modalData.tipo">
                <option value="caja">caja</option>
                <option value="bancos">bancos</option>
              </select>
            </div>

            <template v-if="modalData.tipo === 'bancos'">
              <div class="input-container">
                <label>Documento</label>
                <select v-model="modalData.documento">
                  <option value="Transferencia">Transferencia</option>
                  <option value="Depósitos">Depósitos</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div class="input-container">
                <label>Cuenta bancaria</label>
                <select v-model.number="modalData.idCuentaBancaria">
                  <option
                    v-for="c in cuentas_bancarias"
                    :key="c.id"
                    :value="c.id"
                  >
                    {{ c.label }}
                  </option>
                </select>
              </div>
              <div class="input-container">
                <label>No. Documento</label>
                <input
                  type="text"
                  v-model="modalData.numero_documento"
                />
              </div>
              <div class="input-container">
                <label>Fecha emisión</label>
                <input
                  type="date"
                  v-model="modalData.fecha_emision"
                />
              </div>
            </template>
          </div>

          <div class="modal-actions">
            <button class="btn-primary" @click="saldarRegistroConfirm">
              Confirmar
            </button>
            <button class="btn-secondary" @click="closeModal">
              Cancelar
            </button>
          </div>
        </div>
      </div>
   <!-- anticipo-card -->

</template>

<script>
import axios from 'axios';
import { ref, reactive, onMounted, watch } from 'vue';
import '../../styles/css/AnticipoComprasA.css';

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
    const cuentas_bancarias = ref([]);
    const error = ref('');
    const successMessage = ref('');
    const idCuentaBancaria = ref(null);

    // Tabla de anticipos
    const anticipoRows = ref([]);
    const loading = ref(false);
    const showTabla = ref(false);

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
      error.value = '';
      successMessage.value = '';
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
        .catch((e) =>
          console.error('for-select:', e?.response?.data || e.message)
        );
    };

    watch(tipo, controlarVisibilidadDivisionCuatro);
    controlarVisibilidadDivisionCuatro();

    const cargarCuentas = () => {
      axios
        .get('http://127.0.0.1:8000/in_eg/getAllCuentasEgresoAG')
        .then((response) => {
          cuentas.splice(0, cuentas.length, ...response.data);
          //console.log(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    };

    const cargarBancosNoCuenta = () => {
      axios
        .get('http://127.0.0.1:8000/cuentasB/getConcatenada')
        .then((response) => {
          cuentas_bancarias.splice(0, cuentas_bancarias.length, ...response.data);
          //console.log(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    };

    const cargarBancos = () => {
      axios
        .get('http://127.0.0.1:8000/in_eg/getByNombreB')
        .then((response) => {
          cuentas_bancarias.splice(0, cuentas_bancarias.length, ...response.data);
          console.log(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    };

    const enviarDatos = () => {
      error.value = '';
      successMessage.value = '';

      if (
        !fecha.value ||
        !identificacion.value ||
        !nombre.value ||
        !descripcion.value ||
        !monto.value ||
        (tipo.value === 'bancos' &&
          (!documento.value ||
            !idCuentaBancaria.value ||
            !numero_documento.value ||
            !fecha_emision.value))
      ) {
        error.value = 'Por favor, complete todos los campos.';
        return;
      }

      if (tipo.value === 'caja') {
        const payloadCaja = {
          fecha: fecha.value,
          identificacion: identificacion.value,
          nombre: nombre.value,
          descripcion: descripcion.value,
          monto: monto.value,
          tipo: 'caja',
          cuenta: 'Anticipo de compras y gastos'
        };
        axios
          .post(
            'http://127.0.0.1:8000/in_eg/createAnticipoCompraAG',
            payloadCaja
          )
          .then(() => {
            successMessage.value = 'Datos enviados correctamente';
          })
          .catch(() => {
            error.value =
              'Error al enviar datos. Por favor, inténtelo de nuevo.';
          });
      } else {
        const payloadBancos = {
          fecha: fecha.value,
          identificacion: identificacion.value,
          nombre: nombre.value,
          descripcion: descripcion.value,
          monto: monto.value,
          tipo: 'bancos',
          cuenta: 'Anticipo de compras y gastos',
          documento: documento.value,
          numero_documento: numero_documento.value,
          fecha_emision: fecha_emision.value,
          id_cuentas_bancarias: idCuentaBancaria.value
        };

       /* console.log(
          'id_cuentas_bancarias:',
          idCuentaBancaria.value,
          typeof idCuentaBancaria.value
        );*/

        if (!Number.isInteger(idCuentaBancaria.value)) {
          error.value = 'Debes seleccionar una cuenta bancaria válida.';
          return;
        }

        axios
          .post(
            'http://127.0.0.1:8000/in_eg/createAnticipoCompraAG',
            payloadBancos
          )
          .then(() => {
            successMessage.value = 'Datos enviados correctamente';
          })
          .catch((e) => {
            console.error('Error axios:', e?.response?.data || e.message);
            error.value = 'Error al enviar datos.';
          });
      }
    };

    const fetchTablaAnticipoAG = async () => {
      loading.value = true;
      try {
        const { data } = await axios.get(
          'http://localhost:8000/in_eg/tablaVistaAnticipoAG'
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
                'http://localhost:8000/saldar_anticipos/getMontoFaltanteAG',
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
      const montoAbono = parseFloat(
        String(modalData.monto_abono).replace(/,/g, '')
      );
      const montoTotal =
        parseFloat(String(modalData.monto).replace(/,/g, '')) || 0;

      if (Number.isNaN(montoAbono) || montoAbono <= 0) {
        error.value = 'Ingrese un monto a abonar válido mayor que 0.';
        return;
      }
      if (montoAbono > montoTotal) {
        error.value = 'El monto a abonar no puede ser mayor al monto total.';
        return;
      }

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

      error.value = '';
      try {
        const url =
          'http://localhost:8000/saldar_anticipos/saldarAnticipoAG';
        await axios.post(url, payload);
        successMessage.value = 'Registro saldado correctamente.';
        fetchTablaAnticipoAG();
        setTimeout(() => {
          successMessage.value = '';
        }, 3000);
        showModal.value = false;
      } catch (e) {
        console.error(
          'Error al saldar:',
          e?.response?.data || e.message || e
        );
        error.value =
          e?.response?.data?.message || 'Error al saldar el anticipo.';
      }
    };

    onMounted(() => {
      cargarCuentasSelect();
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
      saldarRegistroConfirm
    };
  }
};
</script>
