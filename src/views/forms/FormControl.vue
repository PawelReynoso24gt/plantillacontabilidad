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

  <!-- Registros de depósitos de caja -->
  <div class="listado-registros">
    <div class="listado-header">
      <h3 class="listado-title">Depósitos registrados</h3>
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
        <p class="modal-warning">
          Un depósito de caja crea dos movimientos enlazados (Caja y Bancos).
          Eliminar solo este registro puede desbalancear la partida; revisa si
          también debes eliminar el movimiento correspondiente en el otro
          libro.
        </p>
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

</template>

<script>
import axios from 'axios';
import { ref, reactive, onMounted } from 'vue';
import '../../styles/css/DepositoCajaA.css'
import '../../styles/css/ListadoRegistrosA.css'

export default {
  name: 'Accordion',
  setup() {
    const fecha = ref('');
    const descripcion = ref('');
    const monto = ref('');
    const numero_documento = ref('');
    const cuentas_bancarias = reactive([]);
    const cuentaBName = ref('');
    const error = ref(''); // Estado para errores
    const successMessage = ref(''); // Estado para mensajes de éxito

    // Registros de depósitos (listado paginado + eliminar)
    const registros = ref([]);
    const paginaActual = ref(1);
    const totalPaginas = ref(1);
    const cargandoRegistros = ref(false);
    const mostrarRegistros = ref(true);
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
          'http://127.0.0.1:8000/in_eg/getListaDepositosCajaAG',
          { params: { page, per_page: 5 } }
        );
        registros.value = data.data || [];
        paginaActual.value = data.current_page || 1;
        totalPaginas.value = data.last_page || 1;
      } catch (e) {
        console.error('Error cargando depósitos:', e?.response?.data || e.message);
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
        successMessage.value = 'Registro eliminado correctamente';
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

    const cargarBancosNoCuenta = () => {
      axios.get('http://127.0.0.1:8000/cuentasB/getConcatenada')
        .then((response) => {
          cuentas_bancarias.splice(0, cuentas_bancarias.length, ...response.data);
          console.log(response.data);
        })
        .catch((error) => {
          console.error(error);
        });
    };

    const enviarDatos = () => {
      error.value = ''; // Resetea el mensaje de error antes de enviar datos
      successMessage.value = ''; // Resetea el mensaje de éxito antes de enviar datos

      if (!fecha.value || !descripcion.value || !monto.value || !numero_documento.value || !cuentaBName.value) {
        error.value = 'Por favor, complete todos los campos.';
        return;
      }

      axios.post('http://127.0.0.1:8000/in_eg/createTrasDepCajaAG', {
        cuenta_bancaria: cuentaBName.value,
        fecha: fecha.value,
        descripcion: descripcion.value,
        monto: monto.value,
        numero_documento: numero_documento.value,
      })
        .then(response => {
          successMessage.value = 'Datos enviados correctamente';
          //  console.log(response.data);
          cargarRegistros();
        })
        .catch(error => {
          console.error(error);
          error.value = 'Error al enviar datos. Por favor, inténtelo de nuevo.';
        });
    };

    const limpiar = () => {
      fecha.value = '';
      descripcion.value = '';
      monto.value = '';
      numero_documento.value = '';
      cuentaBName.value = '';
      error.value = ''; // Limpiar el mensaje de error
      successMessage.value = ''; // Limpiar el mensaje de éxito
    };

    onMounted(() => {
      cargarBancosNoCuenta();
      cargarRegistros();
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
      error,
      successMessage,
      registros,
      paginaActual,
      totalPaginas,
      cargandoRegistros,
      mostrarRegistros,
      mostrarConfirmEliminar,
      registroAEliminar,
      eliminando,
      errorEliminar,
      formatMonto,
      cargarRegistros,
      abrirConfirmEliminar,
      cerrarConfirmEliminar,
      confirmarEliminar
    }
  },
}
</script>
