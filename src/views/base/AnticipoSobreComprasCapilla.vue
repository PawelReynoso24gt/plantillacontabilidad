<template>
    <div>
        <h1>Anticipo sobre compras - Capilla</h1>
    </div>
    <div>
        <div class="division-container">
            <div class="fecha-inputs">
                <label>Egreso para:</label>
                <select v-model="tipo">
                    <option value="caja">caja</option>
                    <option value="bancos">bancos</option>
                </select>
            </div>
        </div>
        <!-- Primera división -->
        <div class="division-container">
            <div class="numero-fecha-container">
                <div class="fecha-inputs">
                    <label>Fecha</label>
                    <input type="date" v-model="fecha">
                </div>
            </div>
        </div>

        <!-- Segunda división -->
        <div class="division-container">
            <label>DPI/NIT/CF</label>
            <input type="text" v-model="identificacion">
            <label>Nombre/CF</label>
            <input type="text" v-model="nombre">
            <label>Observaciones de comprobante</label>
            <input type="text" v-model="descripcion">
        </div>

        <!-- Tercera división -->
        <div class="division-container">
            <div class="numero-fecha-container">
                <div class="fecha-inputs">
                    <label>Monto</label>
                    <input type="text" v-model="monto">
                </div>
            </div>
        </div>

        <!-- Cuarta división -->
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
                <select v-model.number="idCuentaBancaria">
                    <option v-for="c in cuentas_bancarias" :key="c.id" :value="c.id">
                        {{ c.label }}
                    </option>
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
        <p v-if="successMessage" class="text-success">{{ successMessage }}</p>

        <!-- Botón Agregar -->
        <button @click="enviarDatos">Guardar</button>
        <button @click="limpiar" style="margin-left: 10px;">Limpiar</button>

        <!-- Botón para mostrar/ocultar la tabla -->
        <button @click="toggleMostrarTabla" style="margin-left: 10px;">
            {{ showTabla ? 'Ocultar tabla' : 'Mostrar tabla' }}
        </button>

        <!-- Tabla de anticipos (colapsable) -->
        <div v-if="showTabla" class="tabla-anticipos" style="margin-top:20px;">
            <h3>Anticipos registrados</h3>
            <p v-if="loading">Cargando...</p>
            <p v-if="!loading && anticipoRows.length === 0">No hay registros.</p>
            <table v-if="!loading && anticipoRows.length" class="table-anticipo">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Nomenclatura</th>
                        <th>Nombre</th>
                        <th>Cuenta</th>
                        <th>Tipo</th>
                        <th style="text-align:right">Monto</th>
                        <th style="text-align:right">Monto faltante</th>
                        <th style="text-align:center">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(r, idx) in anticipoRows" :key="idx">
                        <td>{{ r.fecha }}</td>
                        <td>{{ r.nomenclatura }}</td>
                        <td>{{ r.nombre }}</td>
                        <td>{{ r.id_cuentas }}</td>
                        <td>{{ r.tipo }}</td>
                        <td style="text-align:right">{{ formatMonto(r.monto) }}</td>
                        <td style="text-align:right">{{ formatMonto(r.monto_faltante) }}</td>
                        <td style="text-align:center">
                            <button @click="openSaldarModal(r)">Saldar</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <!-- Modal para saldar (UI) -->
        <div v-if="showModal" class="modal-overlay">
            <div class="modal-box">
                <h3>Saldar registro</h3>
                <div class="input-container" style="margin-bottom:10px; align-items:center;">
                    <label style="width:auto; margin-right:8px; font-weight:bold;">ID cuenta:</label>
                    <div>{{ modalData.id_ingresos_egresos !== null && modalData.id_ingresos_egresos !== undefined ? modalData.id_ingresos_egresos : '-' }}</div>
                </div>
                <div class="modal-form">
                    <div class="input-container">
                        <label>Nomenclatura</label>
                        <input type="text" v-model="modalData.nomenclatura">
                    </div>
                    <div class="input-container">
                        <label>Cuenta</label>
                        <input type="text" v-model="modalData.id_cuentas">
                    </div>
                    <div class="input-container">
                        <label>Fecha</label>
                        <input type="date" v-model="modalData.fecha">
                    </div>
                    <div class="input-container">
                        <label>DPI/NIT/CF</label>
                        <input type="text" v-model="modalData.identificacion">
                    </div>
                    <div class="input-container">
                        <label>Nombre</label>
                        <input type="text" v-model="modalData.nombre">
                    </div>
                    <div class="input-container">
                        <label>Observaciones</label>
                        <input type="text" v-model="modalData.descripcion">
                    </div>
                    <div class="input-container">
                        <label>Monto</label>
                        <input type="text" v-model="modalData.monto">
                    </div>
                    <div class="input-container">
                        <label>Monto a abonar</label>
                        <input type="text" v-model="modalData.monto_abono" placeholder="0.00">
                    </div>
                    <div class="input-container">
                        <label>Tipo</label>
                        <select v-model="modalData.tipo">
                            <option value="caja">caja</option>
                            <option value="bancos">bancos</option>
                        </select>
                    </div>
                    <div v-if="modalData.tipo === 'bancos'" class="input-container">
                        <label>Documento</label>
                        <select v-model="modalData.documento">
                            <option value="Transferencia">Transferencia</option>
                            <option value="Depósitos">Depósitos</option>
                            <option value="Cheque">Cheque</option>
                        </select>
                    </div>
                    <div v-if="modalData.tipo === 'bancos'" class="input-container">
                        <label>Cuenta Bancaria</label>
                        <select v-model.number="modalData.idCuentaBancaria">
                            <option v-for="c in cuentas_bancarias" :key="c.id" :value="c.id">{{ c.label }}</option>
                        </select>
                    </div>
                    <div v-if="modalData.tipo === 'bancos'" class="input-container">
                        <label>No. Documento</label>
                        <input type="text" v-model="modalData.numero_documento">
                    </div>
                    <div v-if="modalData.tipo === 'bancos'" class="input-container">
                        <label>Fecha emisión</label>
                        <input type="date" v-model="modalData.fecha_emision">
                    </div>
                </div>
                <div class="modal-actions">
                    <button @click="saldarRegistroConfirm">Confirmar</button>
                    <button @click="closeModal" style="margin-left:10px">Cancelar</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import { ref, reactive, onMounted, watch } from 'vue';

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
        const cuentas_bancarias = ref([])
        const error = ref(''); // Estado para errores
        const successMessage = ref(''); // Estado para mensajes de éxito
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
            error.value = ''; // Limpiar el mensaje de error
            successMessage.value = ''; // Limpiar el mensaje de éxito
        };

        const controlarVisibilidadDivisionCuatro = () => {
            mostrarDivisionCuatro.value = tipo.value === 'bancos';
        }

        const cargarCuentasSelect = () => {
            axios.get('http://127.0.0.1:8000/cuentasB/for-select')
                .then(({ data }) => {
                    cuentas_bancarias.value = data;
                    if (!idCuentaBancaria.value && data.length) {
                        idCuentaBancaria.value = Number(data[0].id);
                    }
                })
                .catch(e => console.error('for-select:', e?.response?.data || e.message));
        };


        watch(tipo, controlarVisibilidadDivisionCuatro);

        controlarVisibilidadDivisionCuatro();

        const cargarCuentas = () => {
            axios.get('http://127.0.0.1:8000/in_eg/getAllCuentasEgresoCA')
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
            error.value = '';
            successMessage.value = '';

            if (!fecha.value || !identificacion.value || !nombre.value || !descripcion.value || !monto.value ||
                (tipo.value === 'bancos' && (!documento.value || !idCuentaBancaria.value || !numero_documento.value || !fecha_emision.value))) {
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
                    cuenta: 'Anticipo de compras y gastos',
                };
                axios.post('http://127.0.0.1:8000/in_eg/createAnticipoCompraCA', payloadCaja)
                    .then(() => { successMessage.value = 'Datos enviados correctamente'; })
                    .catch(() => { error.value = 'Error al enviar datos. Por favor, inténtelo de nuevo.'; });
            } else {
                // tipo === 'bancos'
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

                console.log('id_cuentas_bancarias:', idCuentaBancaria.value, typeof idCuentaBancaria.value);

                if (!Number.isInteger(idCuentaBancaria.value)) {
                    error.value = 'Debes seleccionar una cuenta bancaria válida.';
                    return;
                }

                axios.post('http://127.0.0.1:8000/in_eg/createAnticipoCompraCA', payloadBancos)
                    .then(() => { successMessage.value = 'Datos enviados correctamente'; })
                    .catch((e) => {
                        console.error('Error axios:', e?.response?.data || e.message);
                        error.value = 'Error al enviar datos.';
                    });
            }
        };

        const fetchTablaAnticipoAG = async () => {
            loading.value = true;
            try {
                const { data } = await axios.get('http://localhost:8000/in_eg/tablaVistaAnticipoCA');
                console.log('Datos recibidos para tablaVistaAnticipoCA:', data);
                anticipoRows.value = Array.isArray(data) ? data : [];

                // For each row, request monto faltante and attach it to the row object
                await Promise.all(anticipoRows.value.map(async (r) => {
                    try {
                        // Ensure we have an id_ingresos_egresos to query
                        const id = r.id_ingresos_egresos || r.id_ingresos_egreso || null;
                        if (id === null || id === undefined) {
                            r.monto_faltante = 0;
                            return;
                        }
                        console.log('Fetching monto_faltante for id_ingresos_egresos:', id);
                        const resp = await axios.post('http://localhost:8000/saldar_anticipos/getMontoFaltanteCA', { id_ingresos_egresos: id });
                        r.monto_faltante = resp?.data?.monto_faltante ?? 0;
                    } catch (err) {
                        console.error('Error obteniendo monto faltante para', r.id_ingresos_egresos, err?.response?.data || err.message || err);
                        r.monto_faltante = 0;
                    }
                }));
            } catch (e) {
                console.error('Error cargando tablaVistaAnticipoAG:', e?.response?.data || e.message);
                anticipoRows.value = [];
            } finally {
                loading.value = false;
            }
        };

        const formatMonto = (m) => {
            const n = Number(m);
            if (Number.isNaN(n)) return m;
            return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        };

        const toggleMostrarTabla = () => {
            showTabla.value = !showTabla.value;
            // si se abre y aún no hay datos, intentar cargar
            if (showTabla.value && anticipoRows.value.length === 0) {
                fetchTablaAnticipoAG();
            }
        };

        // Modal state and handlers
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
            // Keep only the linkage/context values from the row, let the user
            // enter the rest of the data manually.
            modalData.nomenclatura = row.nomenclatura || row.nomen || row.nom || '';
            modalData.id_cuentas = row.id_cuentas || '';
            // Keep the id so backend knows which ingreso/egreso to link
            modalData.id_ingresos_egresos = row.id_ingresos_egresos || null;

            // Prefill monto from the row so user sees the original amount
            // and can edit the abono. Other fields are cleared for user input.
            modalData.fecha = '';
            modalData.identificacion = '';
            modalData.nombre = '';
            modalData.descripcion = '';
            modalData.monto = row.monto != null ? String(row.monto) : '';
            modalData.monto_abono = '';

            // Default tipo to the row value and keep it locked (not editable)
            const rawTipo = (row.tipo || row.type || '').toString();
            modalData.tipo = rawTipo === 'banco' ? 'bancos' : (rawTipo || '');

            // Clear bank-specific fields so user can input them when needed
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
            // Validar monto_abono
            const montoAbono = parseFloat(String(modalData.monto_abono).replace(/,/g, ''));
            const montoTotal = parseFloat(String(modalData.monto).replace(/,/g, '')) || 0;
            if (Number.isNaN(montoAbono) || montoAbono <= 0) {
                error.value = 'Ingrese un monto a abonar válido mayor que 0.';
                return;
            }
            if (montoAbono > montoTotal) {
                error.value = 'El monto a abonar no puede ser mayor al monto total.';
                return;
            }

            

            // No enviar `id_abono` desde el frontend; el backend gestionará la creación
            // y relación del abono. Construir payload sin `id_abono`.
            // Build payload; include bank-specific fields when tipo === 'bancos'
            const payload = {
                fecha: modalData.fecha || new Date().toISOString().slice(0, 10),
                identificacion: modalData.identificacion || '',
                nombre: modalData.nombre || '',
                descripcion: modalData.descripcion || '',
                monto: montoAbono,
                tipo: modalData.tipo || '',
                cuenta: modalData.id_cuentas || '',
                id_ingresos_egresos: modalData.id_ingresos_egresos || null,
                fecha_pago: modalData.fecha_emision || modalData.fecha || new Date().toISOString().slice(0, 10),
                monto_pago: montoAbono
            };

            if ((modalData.tipo || '').toString() === 'bancos') {
                // Attach bank fields
                payload.documento = modalData.documento || '';
                payload.numero_documento = modalData.numero_documento || '';
                payload.fecha_emision = modalData.fecha_emision || '';
                payload.id_cuentas_bancarias = modalData.idCuentaBancaria || null;
            }

            error.value = '';
            try {
                const url = 'http://localhost:8000/saldar_anticipos/saldarAnticipoCA';
                const resp = await axios.post(url, payload);
                successMessage.value = 'Registro saldado correctamente.';
                // refrescar tabla
                fetchTablaAnticipoAG();
                setTimeout(() => { successMessage.value = ''; }, 3000);
                showModal.value = false;
            } catch (e) {
                console.error('Error al saldar:', e?.response?.data || e.message || e);
                error.value = e?.response?.data?.message || 'Error al saldar el anticipo.';
            }
        };

        onMounted(() => {
            cargarCuentasSelect();
            // no cargamos la tabla automáticamente; se cargará al abrirla
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
        }
    },
}
</script>



<style scoped>
/* Estilos para el contenedor principal */
.container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
}

/* Estilos para las divisiones */
.division-container {
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    margin-top: 10px;
}

/* Estilos para las etiquetas */
label {
    display: block;
    margin-bottom: 5px;
}

/* Estilos para los campos de entrada */
input[type="text"],
input[type="date"],
select {
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    box-sizing: border-box;
}

/* Estilos para el botón */
button {
    padding: 10px 20px;
    background-color: #14491b;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
}

button:hover {
    background-color: #475f27;
}

/* Estilos para los campos de entrada de número y select */
.numero-fecha-container {
    display: flex;
}

.numero-inputs,
.fecha-inputs {
    flex: 1;
    margin-right: 10px;
}

.numero-inputs label,
.fecha-inputs label {
    display: block;
}

/* Estilos para los campos de entrada de número */
.numero-input {
    display: flex;
}

.numero-input input[type="text"] {
    margin-right: 10px;
}

/* Estilos para los campos de entrada de fecha */
.fecha-container {
    flex: 1;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 5px;
}

.fecha-container label {
    display: block;
}

.fecha-container select {
    width: calc(100% - 10px);
    border: none;
    outline: none;
}

/* Estilos para los contenedores de entrada */
.input-container {
    display: flex;
    align-items: center;
}

.input-container label {
    width: 150px;
    /* Ancho fijo para las etiquetas */
    margin-right: 10px;
}

.input-container select,
.input-container input {
    flex: 1;
}

/* Estilo para el mensaje de error */
.text-danger {
    color: red;
    font-weight: bold;
}

/* Estilos para la tabla de anticipos */
.table-anticipo {
    width: 100%;
    border-collapse: collapse;
}

.table-anticipo th,
.table-anticipo td {
    border: 1px solid #ddd;
    padding: 8px;
}

.table-anticipo thead th {
    background-color: #f2f2f2;
    text-align: left;
}

.table-anticipo tbody tr:nth-child(even) {
    background-color: #fafafa
}

.table-anticipo tbody tr:hover {
    background-color: #f1f1f1
}

.tabla-anticipos h3 {
    margin: 0 0 8px 0
}

/* Modal styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal-box {
    background: #fff;
    padding: 20px;
    border-radius: 6px;
    width: 90%;
    max-width: 600px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.modal-box h3 {
    margin-top: 0
}

.modal-form .input-container {
    margin-bottom: 8px
}

.modal-actions {
    margin-top: 12px;
    text-align: right
}
</style>
