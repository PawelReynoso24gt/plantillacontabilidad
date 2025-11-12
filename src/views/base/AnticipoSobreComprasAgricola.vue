<template>
    <div>
        <h1>Anticipo sobre compras - Agrícola</h1>
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
            axios.post('http://127.0.0.1:8000/in_eg/createAnticipoCompraAG', payloadCaja)
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

            axios.post('http://127.0.0.1:8000/in_eg/createAnticipoCompraAG', payloadBancos)
            .then(() => { successMessage.value = 'Datos enviados correctamente'; })
            .catch((e) => {
                console.error('Error axios:', e?.response?.data || e.message);
                error.value = 'Error al enviar datos.';
            });
        }
        };

        onMounted(() => {
            //cargarCuentas();
            //cargarBancos();
            //cargarBancosNoCuenta();
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
            limpiar
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
</style>
