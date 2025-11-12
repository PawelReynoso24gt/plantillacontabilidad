<template>
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

    <div class="division-container">
        <div class="numero-fecha-container">
            <div class="checkbox-line-container">
                <label for="es_pendiente">¿Es una Cuenta por Pagar?</label>
                <input type="checkbox" v-model="es_pendiente" id="es_pendiente" class="form-check-input">
            </div>
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
        <div class="numero-inputs">
          <label>Cuenta</label>
          <select v-model="cuentaCMB" @change="cargarCuentas">  
            <option v-for="cuentab in cuentas" :value="cuentab.cuenta">{{ cuentab.cuenta }}</option> 
          </select>
        </div>
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
        <select v-model="cuentaBName" @change="cargarBancosNoCuenta">
              <option v-for="cuentaN in cuentas_bancarias" :value="cuentaN.cuenta_bancaria">{{ cuentaN.banco_y_cuenta }}</option> 
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
    const cuentas_bancarias = reactive([]);
    const es_pendiente = ref(false);
    const error = ref(''); // Estado para errores
    const successMessage = ref(''); // Estado para mensajes de éxito

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

    const agregarDivision = () => {
      // Lógica para agregar una nueva división
    }

    const controlarVisibilidadDivisionCuatro = () => {
      mostrarDivisionCuatro.value = tipo.value === 'bancos';
    }

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
          error.value = 'Error al cargar cuentas. Por favor, inténtelo de nuevo.';
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
          error.value = 'Error al cargar bancos sin cuenta. Por favor, inténtelo de nuevo.';
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
          error.value = 'Error al cargar bancos. Por favor, inténtelo de nuevo.';
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
        axios.post('http://127.0.0.1:8000/in_eg/createALLINEGCajaCA', {
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
        axios.post('http://127.0.0.1:8000/in_eg/createALLEGCA', data)
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

    onMounted(() => {
      cargarCuentas();
      cargarBancos();
      cargarBancosNoCuenta();
    });

    return {
      agregarDivision,
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
  width: 150px; /* Ancho fijo para las etiquetas */
  margin-right: 10px;
}

.input-container select,
.input-container input {
  flex: 1;
}


/* --- Nuevo estilo para el checkbox a la par del label --- */
.checkbox-line-container {
    display: flex; /* Habilita el flexbox */
    align-items: center; /* Centra verticalmente los elementos */
    gap: 10px; /* Espacio entre el label y el checkbox */
    padding: 5px 0; /* Espacio interno vertical */
}

.checkbox-line-container label {
    /* Sobrescribe el display: block forzado por otros estilos */
    display: inline-block; 
    margin-bottom: 0; /* Elimina el margen inferior */
    flex-grow: 1; /* Permite que el label ocupe el espacio antes del checkbox */
}

/* --- Estilo para aumentar el tamaño del checkbox --- */
.checkbox-line-container input[type="checkbox"] {
    /* Sobrescribe los estilos genéricos para input que pusiste */
    width: 20px !important; /* Ajusta el ancho */
    height: 20px !important; /* Ajusta la altura */
    min-width: 20px; /* Asegura que no se haga más pequeño */
    margin: 0; /* Elimina cualquier margen residual */
}
</style>
