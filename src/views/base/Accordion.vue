<template>
      <!-- Encabezado -->
      <div class="egreso-header">
        <div>
          <h2 class="egreso-title">Registro de Egreso Agrícola</h2>
          <p class="egreso-subtitle">
            Complete la información del egreso y los datos del comprobante.
          </p>
        </div>
      </div>

      <!-- Tipo de egreso y cuenta por pagar -->
      <div class="division-container division-inline">
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

      <!-- Datos del proveedor / beneficiario -->
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
      <div
        class="division-container division-block"
        v-if="mostrarDivisionCuatro"
      >
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



  <!-- pendientes -->
  <div>
    <h3 style="margin-top: 30px;">Cuentas Pendientes por Pagar (Proyecto Agrícola)</h3>
    
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
                    <td>Q {{ item.saldo_pendiente }}</td>
                    <td>
                        <!-- Usamos los montos originales para determinar el tipo de saldo -->
                        <span v-if="parseFloat(item.monto_debe) > 0" class="saldo-debe">DEBE</span>
                        <span v-else class="saldo-haber">HABER</span>
                    </td>
                    <td><button @click="abrirModalSaldado(item)">Saldar</button></td>
                </tr>
            </tbody>
        </table>
    </div>
  </div>

  <!-- ******* MODAL DE SALDADO ******* -->
  <div v-if="mostrarModalSaldado" class="modal-overlay">
      <div class="modal-content">
          <h3>Saldar Deuda Pendiente</h3>
          <p><strong>ID Deuda:</strong> {{ formSaldar.deuda_original_id }}</p>
          <p><strong>Cuenta Contable:</strong> {{ formSaldar.nombre_cuenta_visual }}</p>
          
          <!-- Formulario dentro del Modal -->
          <div class="division-container">
              <div class="fecha-inputs">
                  <label>Fecha de Pago:</label>
                  <input type="date" v-model="formSaldar.fecha">
              </div>
          </div>

          <div class="division-container">
              <label>DPI/NIT/CF:</label>
              <input type="text" v-model="formSaldar.identificacion">
              <label>Nombre/CF:</label>
              <input type="text" v-model="formSaldar.nombre">
              <label>Observaciones:</label>
              <input type="text" v-model="formSaldar.descripcion">
          </div>

          <div class="division-container">
                <div class="numero-fecha-container">
                  <div class="numero-inputs">
                      <label>Medio de Pago:</label>
                        <select v-model="formSaldar.tipo"> 
                            <option value="caja">Caja</option>
                            <option value="bancos">Bancos</option>  
                        </select>
                  </div>
                  <div class="fecha-inputs">
                      <label>Monto a Pagar (Q):</label>
                      <input type="text" v-model="formSaldar.monto">
                  </div>
              </div>
          </div>

          <!-- Sección Bancaria Condicional (Dentro del Modal) -->
          <div class="division-container" v-if="formSaldar.tipo === 'bancos'">
                <label>DATOS BANCARIOS</label>
                <div class="input-container">
                  <label>Documento:</label>
                  <select v-model="formSaldar.documento">
                    <option value="Transferencia">Transferencia</option> 
                    <option value="Depósitos">Depósitos</option>
                    <option value="Cheque">Cheque</option> 
                  </select>
                </div>
                <div class="input-container">
                  <label>Cuenta Bancaria:</label>
                  <!-- Reutilizamos la lista de cuentas bancarias cargada -->
                  <select v-model="formSaldar.cuenta_bancaria">
                    <option v-for="cuentaN in cuentas_bancarias" :value="cuentaN.cuenta_bancaria">{{ cuentaN.banco_y_cuenta }}</option> 
                  </select>
                </div>
                <div class="input-container">
                  <label>No. Documento:</label>
                  <input type="text" v-model="formSaldar.numero_documento">
                </div>
                <div class="input-container">
                  <label>Fecha Emisión:</label>
                  <input type="date" v-model="formSaldar.fecha_emision">
                </div>
          </div>

          <!-- Botones del Modal -->
          <div class="modal-actions" style="margin-top: 20px; text-align: right;">
              <button @click="cerrarModal" style="background-color: #ccc; color: #333; margin-right: 10px;">Cancelar</button>
              <button @click="enviarSaldado">Confirmar Pago</button>
          </div>
      </div>
  </div>

  <!-- ******* MODAL DE ÉXITO ******* -->
  <div v-if="mostrarModalExito" class="modal-overlay">
      <div class="modal-content" style="max-width: 400px; text-align: center;">
          <h3 style="color: #14491b;">¡Pago Exitoso!</h3>
          
          <div style="margin: 20px 0;">
              <p style="font-size: 1.1em;">El abono se ha registrado correctamente.</p>
              
              <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 10px;">
                  <p style="margin: 0; color: #666;">Saldo Pendiente Restante:</p>
                  <h2 style="margin: 5px 0; color: #cc0000;">Q {{ datosExito.saldo }}</h2>
              </div>
          </div>

          <div class="modal-actions" style="text-align: center;">
              <button @click="cerrarModalExito">Aceptar</button>
          </div>
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
    // ** NUEVAS VARIABLES PARA EL REPORTE **
    const PROYECTO_ID = '1';       // Agrícola
    const CLASIFICACION_ID = '2'; // Egresos (Cuentas por Pagar)
    const pendientes = reactive([]);
    const mensajeVacio = ref('');
    // ** VARIABLES PARA EL MODAL DE SALDADO **
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
      error.value = ''; // Limpiar el mensaje de error
      successMessage.value = ''; // Limpiar el mensaje de éxito
    };

    const controlarVisibilidadDivisionCuatro = () => {
      mostrarDivisionCuatro.value = tipo.value === 'bancos';
    }

    // ** ABRIR MODAL **
    // Se llama al hacer clic en "Saldar" en la tabla
    const abrirModalSaldado = (item) => {
        // Prellenar datos básicos
        formSaldar.deuda_original_id = item.id_ingresos_egresos;
        formSaldar.cuenta = item.cuentas.cuenta; // Nombre exacto para buscarla
        formSaldar.nombre_cuenta_visual = item.cuentas.cuenta;
        
        // >> CORRECCIÓN DE FECHA (ZONA HORARIA LOCAL) <<
        // Creamos un objeto Date con la hora actual del sistema
        const hoy = new Date();
        // Obtenemos el año, mes y día locales. 
        // OJO: getMonth() devuelve 0-11, así que sumamos 1.
        // padStart(2, '0') asegura que tengamos '05' en vez de '5'.
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
        // const saldo = item.monto_haber > 0 ? item.monto_haber : item.monto_debe;
        formSaldar.monto = '';

        // Heredar los IDs de proyecto y clasificación del filtro actual
        // (Asumimos que son los mismos que se usaron para cargar la tabla)
        // OJO: Usa las constantes o variables que definiste: PROYECTO_ID / CLASIFICACION_ID
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

    watch(tipo, controlarVisibilidadDivisionCuatro);

    controlarVisibilidadDivisionCuatro();

    const cargarCuentas = () => {
      axios.get('http://127.0.0.1:8000/in_eg/getAllCuentasEgresoAG')
        .then((response) => {
          cuentas.splice(0, cuentas.length, ...response.data);
          console.log(response.data); 
        })
        .catch((error) => {
          console.error(error);
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

      if (tipo.value === 'caja') { 
        axios.post('http://127.0.0.1:8000/in_eg/createALLINEGCajaAG', {
          fecha: fecha.value,
          identificacion: identificacion.value,
          nombre: nombre.value,
          descripcion: descripcion.value,
          monto: monto.value,
          tipo: tipo.value,
          cuenta: cuentaCMB.value,
          flujo_contable: 'EGRESOS', // <-- ¡Valor fijo requerido por el backend!
          es_pendiente: valorEsPendiente, // <-- Valor del checkbox (0 o 1)
        })
        .then(response => {
          successMessage.value = 'Datos enviados correctamente';
          console.log(response.data); 
        })
        .catch(error => {
          console.error(error);
          error.value = 'Error al enviar datos. Por favor, inténtelo de nuevo.';
        });
      } else {
        // Si no es "caja", enviar los datos como lo estás haciendo actualmente
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
          flujo_contable: 'EGRESOS', // <-- ¡Valor fijo requerido por el backend!
          es_pendiente: valorEsPendiente, // <-- Valor del checkbox (0 o 1)
        };
        axios.post('http://127.0.0.1:8000/in_eg/createALLEGAG', data)
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
      cargarBancos();
      cargarBancosNoCuenta();
      cargarPendientes();
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
      es_pendiente,
      error,
      successMessage,
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
      enviarDatos,
      cargarCuentas,
      cargarBancos,
      controlarVisibilidadDivisionCuatro,
      cargarBancosNoCuenta,
      limpiar
    }
  },
}
</script>
