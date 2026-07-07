<template>
  <div class="page-wrapper">
    <div class="page-card">

      <!-- Encabezado -->
      <div class="module-header">
        <div>
          <h2 class="module-title">Generador de partidas contables</h2>
          <p class="module-subtitle">
            Visualiza y descarga en PDF la partida contable generada desde el sistema.
          </p>
        </div>
      </div>

      <!-- Filtro: ID -->
      <div class="section-container">
        <div class="field-group">
          <label class="field-label">ID Ingreso / Egreso</label>
          <input
            type="number"
            v-model="idBuscado"
            class="field-control"
            placeholder="Ingrese el ID y presione Enter o clic en Buscar"
            @keyup.enter="generarPartida"
          />
          <small v-if="fieldErrors.idBuscado" class="error-text">{{ fieldErrors.idBuscado }}</small>
        </div>
      </div>

      <!-- Botones -->
      <div class="form-actions">
        <button @click="volver" class="btn btn-ghost">Regresar</button>
        <button @click="generarPartida" class="btn btn-secondary" :disabled="loading || !idBuscado">
          {{ loading ? 'Buscando...' : 'Buscar partida' }}
        </button>
        <button @click="generarPDF" class="btn btn-primary" :disabled="!partidaContable">
          Generar PDF
        </button>
      </div>

      <!-- Mensajes de estado -->
      <div class="messages-container">
        <p v-if="error" class="text-danger">{{ error }}</p>
        <p v-if="mostrarNoEncontrado" class="text-danger">
          No se encontró ningún registro con el ID {{ idBuscado }}
        </p>
      </div>

      <!-- Vista de partida -->
      <div v-if="partidaContable">

        <!-- Encabezado visual -->
        <div class="encabezado-container">
          <div class="encabezado-box">
            <div class="encabezado-titulo">{{ partidaContable.proyecto }}</div>
            <div class="encabezado-direccion">{{ direccionProyecto }}</div>
          </div>
          <div class="encabezado-detalles">
            <div><strong>PARTIDA No.:</strong> {{ partidaContable.nomenclatura }}</div>
            <div><strong>FECHA:</strong> {{ partidaContable.fecha }}</div>
            <div><strong>TIPO:</strong> {{ partidaContable.tipo_clasificacion }}</div>
            <div><strong>DESCRIPCIÓN:</strong> {{ partidaContable.descripcion }}</div>
          </div>
        </div>

        <!-- Tabla de movimientos -->
        <div class="table-wrapper mt-3">
          <table class="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Cuenta</th>
                <th>Descripción</th>
                <th class="cell-right">Débito (Q)</th>
                <th class="cell-right">Crédito (Q)</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(movimiento, index) in partidaContable.movimientos" :key="index">
                <td class="cell-center">{{ movimiento.codigo }}</td>
                <td>{{ movimiento.cuenta }}</td>
                <td>{{ movimiento.descripcion || '-' }}</td>
                <td class="cell-right debito">
                  {{ movimiento.debito ? formatNumber(movimiento.debito) : '0.00' }}
                </td>
                <td class="cell-right credito">
                  {{ movimiento.credito ? formatNumber(movimiento.credito) : '0.00' }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="fila-resaltada">
                <td colspan="3" class="text-bold cell-right">TOTALES</td>
                <td class="cell-right text-bold">Q {{ partidaContable.totales.total_debito }}</td>
                <td class="cell-right text-bold">Q {{ partidaContable.totales.total_credito }}</td>
              </tr>
              <tr class="fila-resaltada" :class="{ 'balance-correcto': partidaContable.totales.balanceada }">
                <td colspan="3" class="text-bold cell-right">DIFERENCIA</td>
                <td colspan="2" class="cell-right text-bold" :class="partidaContable.totales.balanceada ? 'texto-verde' : 'texto-rojo'">
                  Q {{ partidaContable.totales.diferencia }}
                  <span>{{ partidaContable.totales.balanceada ? '✅' : '❌' }}</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Resumen -->
        <div class="resumen-container">
          <div class="resumen-item">
            <span class="label">Estado:</span>
            <strong :class="partidaContable.totales.balanceada ? 'texto-verde' : 'texto-rojo'">
              {{ partidaContable.totales.balanceada ? 'BALANCEADA' : 'DESBALANCEADA' }}
            </strong>
          </div>
          <div class="resumen-item">
            <span class="label">Generado el:</span>
            <strong>{{ fechaActual }}</strong>
          </div>
        </div>

      </div>

      <!-- Sin datos -->
      <div v-else class="table-empty mt-3">
        No hay partida para mostrar.<br />
        Ingresa un ID y presiona <strong>Buscar partida</strong>.
      </div>

  <!-- **MODAL DE DESCARGA CORRECTA** ================================================================================================================================ -->
  <div v-if="mostrarModalExitoFormulario" class="modal-overlay">
    <div class="modal-content deposito-card" style="max-width: 450px; text-align: center;">
      <div style="margin-bottom: 1.5rem;">
        <div style="font-size: 3rem; color: #28a745; margin-bottom: 1rem;">✓</div>
        <h3 style="color: #14491b; margin-bottom: 0.5rem;">¡Descarga Exitosa!</h3>
        <p style="color: #6c757d;">El reporte en PDF se ha generado y descargado correctamente.</p>
      </div>
      <div class="form-actions" style="justify-content: center;">
        <button class="btn-primary" @click="cerrarModalExitoFormulario" style="min-width: 120px;">
          Aceptar
        </button>
      </div>
    </div>
  </div>


    </div><!-- /page-card -->
  </div><!-- /page-wrapper -->
</template>

<script>
import axios from 'axios';
import { ref, computed, onMounted, onUnmounted, reactive } from 'vue';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { useRoute, useRouter } from 'vue-router'; 
import '@/styles/global.css';
import '../../styles/css/GlobalAlertsModals.css';
import { manejarErrorRuta } from '../../../utils/manejarErrores.js';

export default {
  name: 'GenerarPartidaSimple',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const mostrarModalExitoFormulario = ref(false);  
    // --- ESTADO ---
    const idBuscado = ref(''); // variable para ingresar el ID
    const partidaContable = ref(null);
    const loading = ref(false);
    const error = ref('');
    const mostrarNoEncontrado = ref(false);

    const fieldErrors = reactive({
      idBuscado: ''
    });

    const mostrarErrorCampo = (campo, mensaje) => {
      fieldErrors[campo] = mensaje;
      setTimeout(() => {
        fieldErrors[campo] = '';
      }, 5000);
    };

    const manejarEnter = (event) => {
      if (event.key === 'Enter') {
        // En esta pantalla SOLO existe este modal de éxito
        if (mostrarModalExitoFormulario.value) {
          event.preventDefault();
          cerrarModalExitoFormulario(); 
        }
      }
    };

    const cerrarModalExitoFormulario = () => {
        mostrarModalExitoFormulario.value = false;
    };

    onMounted(() => {
      window.addEventListener('keydown', manejarEnter);
    });

    onUnmounted(() => {
      // Apagamos el detector de teclado al salir de la pantalla
      window.removeEventListener('keydown', manejarEnter);
    });

    // --- COMPUTADOS ---
    const fechaActual = computed(() => new Date().toLocaleDateString('es-GT'));

    // --- UTILIDADES ---
    const formatNumber = (value) => {
      if (value === null || value === undefined) return '0.00';
      const num = parseFloat(value);
      return isNaN(num) ? '0.00' : num.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const volver = () => {
      router.back();
    };

    // --- LÓGICA DE API ---
    const generarPartida = async () => {
      if (!idBuscado.value) {
        error.value = 'Por favor ingrese un ID válido.';
        mostrarErrorCampo('idBuscado', 'Por favor ingrese el ID a buscar');
        return;
      }

      loading.value = true;
      error.value = '';
      partidaContable.value = null;
      mostrarNoEncontrado.value = false;

      try {
        const response = await axios.get(`http://127.0.0.1:8000/in_eg/partida-contable/${idBuscado.value}`);
        
        if (response.data) {
          partidaContable.value = response.data;
        } else {
          mostrarNoEncontrado.value = true;
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          mostrarNoEncontrado.value = true;
        } else {
          error.value = 'Error de conexión: ' + (err.response?.data?.error || err.message);
          manejarErrorRuta(err, router);
        }
      } finally {
        loading.value = false;
      }
    };

    // --- DIRECCION DE PROYECTO ---
    const direccionProyecto = computed(() => {
      // Si no hay partida cargada, no mostramos nada
      if (!partidaContable.value) return '';

      // Obtenemos el ID del proyecto (Asegúrate que tu API devuelva 'proyecto_id')
      // Si tu API usa otro nombre (ej: id_proyecto), cámbialo aquí.
      const idProyecto = partidaContable.value.proyecto_id; 

      if (idProyecto === 1) {
        return '8va calle 5-21 zona 10, Quetzaltenango';
      } else if (idProyecto === 2) {
        return '15 avenida, entre 3a y 4a calle zona 3, Quetzaltenango';
      } else {
        // Dirección por defecto si el ID es otro
        return 'Sistema Contable - Partida Generada'; 
      }
    });

    const handleKeyPress = (event) => {
      if (event.key === 'Enter') generarPartida();
    };

      onMounted(() => {
      const idFromQuery = route.query.id;
      if (idFromQuery) {
        idBuscado.value = idFromQuery;
        generarPartida(); // llama automáticamente al cargar la página
      }
    });

    // --- LÓGICA DE PDF (INTACTA) ---
    const generarPDF = () => {
      if (!partidaContable.value) return;

      try {
        const doc = new jsPDF('portrait');
        const data = partidaContable.value;

        // 1. Encabezado PDF
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(data.proyecto || 'Proyecto Sin Nombre', 105, 20, { align: 'center' });
        
        // Caja alrededor del título
        doc.setDrawColor(0);
        doc.rect(20, 12, 170, 12); 

        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text(direccionProyecto.value, 105, 30, { align: 'center' });

        // 2. Detalles Informativos
        let yPos = 45;
        doc.setFontSize(9);
        
        const leftMargin = 20;
        const lineHeight = 6;

        doc.text(`PARTIDA No.: ${data.nomenclatura}`, leftMargin, yPos);
        yPos += lineHeight;
        doc.text(`FECHA: ${data.fecha}`, leftMargin, yPos);
        yPos += lineHeight;
        doc.text(`TIPO: ${data.tipo_clasificacion}`, leftMargin, yPos);
        yPos += lineHeight;
        
        // Descripción con ajuste de línea si es muy larga
        const splitDesc = doc.splitTextToSize(`DESCRIPCIÓN: ${data.descripcion}`, 170);
        doc.text(splitDesc, leftMargin, yPos);
        yPos += (splitDesc.length * 5) + 5; 

        // 3. Tabla
        const columns = [
          { title: 'Código', dataKey: 'codigo' },
          { title: 'Cuenta', dataKey: 'cuenta' },
          { title: 'Descripción', dataKey: 'descripcion' },
          { title: 'Débito', dataKey: 'debito' },
          { title: 'Crédito', dataKey: 'credito' }
        ];

        const rows = data.movimientos.map(m => ({
          codigo: m.codigo,
          cuenta: m.cuenta,
          descripcion: m.descripcion || '',
          debito: m.debito ? formatNumber(m.debito) : '0.00',
          credito: m.credito ? formatNumber(m.credito) : '0.00'
        }));

        // Fila de Totales
        rows.push({
          codigo: '',
          cuenta: 'TOTALES',
          descripcion: '',
          debito: `Q ${data.totales.total_debito}`,
          credito: `Q ${data.totales.total_credito}`
        });

        // Fila de Diferencia
        rows.push({
          codigo: '',
          cuenta: 'DIFERENCIA',
          descripcion: data.totales.balanceada ? 'BALANCEADA' : 'DESCUADRADA',
          debito: '',
          credito: `Q ${data.totales.diferencia}`
        });

        doc.autoTable({
          columns: columns,
          body: rows,
          startY: yPos,
          theme: 'grid',
          styles: { fontSize: 8, cellPadding: 3 },
          headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
          columnStyles: {
            codigo: { cellWidth: 20 },
            cuenta: { cellWidth: 50 },
            descripcion: { cellWidth: 50 },
            debito: { cellWidth: 25, halign: 'right' },
            credito: { cellWidth: 25, halign: 'right' }
          },
          didDrawCell: (hookData) => {
            if (hookData.section === 'body' && hookData.row.index >= data.movimientos.length) {
              doc.setFont(undefined, 'bold');
              if (hookData.row.index === data.movimientos.length + 1 && !data.totales.balanceada && hookData.column.dataKey === 'credito') {
                 doc.setTextColor(220, 53, 69);
              }
            }
          }
        });

        const finalY = doc.lastAutoTable.finalY + 10;
        doc.setTextColor(100);
        doc.text(`Generado el: ${fechaActual.value}`, 20, finalY);

        saveAs(doc.output('blob'), `partida_${data.nomenclatura}.pdf`);
        mostrarModalExitoFormulario.value = true;
      } catch (err) {
        console.error("Error PDF:", err);
        //alert("Hubo un error al generar el PDF.");
        manejarErrorRuta(err, router);
      }
    };

    return {
      idBuscado, partidaContable, loading, error, mostrarNoEncontrado,
      fechaActual, formatNumber, generarPartida, generarPDF, handleKeyPress,
      direccionProyecto, volver,
      //////////
      fieldErrors,
      cerrarModalExitoFormulario,
      mostrarModalExitoFormulario
    };
  }
}
</script>