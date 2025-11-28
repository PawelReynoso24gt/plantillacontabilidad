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

      <!-- Identificación -->
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

      <!-- Datos del pago -->
      <div class="division-container" v-if="mostrarDivisionCuatro">
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
          <input type="text" v-model="numero_documento" class="field-control" />
        </div>

        <div class="field-group">
          <label class="field-label">Fecha emisión</label>
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
        <button class="btn-primary" @click="enviarDatos">Guardar</button>
        <button class="btn-secondary" @click="limpiar">Limpiar</button>
      </div>
   
 
</template>

<script>
import axios from 'axios';
import { ref, reactive, onMounted, watch } from 'vue';
import '../../styles/css/AnticipoComprasA.css'

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
