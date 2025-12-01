<template>
  <!-- <div class="container"> -->
  <div>
    <label class="titulo-reporte">GENERADOR DE PARTIDAS CONTABLES</label>

    <!-- Sección de Filtros (Estilo Libro Diario) -->
    <div class="division-container">
      <div class="numero-fecha-container">
        <div class="fecha-inputs">
          <label>ID Ingreso/Egreso:</label>
          <input 
            type="number" 
            v-model="idBuscado" 
            placeholder="Ingrese el ID"
            @keypress="handleKeyPress"
          >
        </div>
      </div>
    </div>

    <!-- Espacio entre filtros y botones -->
    <div style="margin-top: 20px;"></div>

    <!-- Botones (Estilo verde del Libro Diario) -->
    <button @click="generarPartida" :disabled="loading">
      {{ loading ? 'Buscando...' : 'Generar Partida' }}
    </button>
    <button @click="generarPDF" :disabled="!partidaContable" class="espacio">
      Generar PDF
    </button>

    <!-- Mensajes de Estado -->
    <div v-if="error" class="mensaje-error">{{ error }}</div>
    <div v-if="mostrarNoEncontrado" class="mensaje-alerta">
      No se encontró ningún registro con el ID {{ idBuscado }}
    </div>

    <!-- VISTA DE LA PARTIDA -->
    <div v-if="partidaContable">
      
      <!-- Encabezado tipo PDF / vista previa -->
      <div class="encabezado-container">
        <div class="encabezado-box">
          <div class="encabezado-titulo">{{ partidaContable.proyecto }}</div>
          <div class="encabezado-direccion">
            Sistema Contable - Partida Generada
          </div>
        </div>

        <div class="encabezado-detalles">
          <div><strong>PARTIDA No.:</strong> {{ partidaContable.nomenclatura }}</div>
          <div><strong>FECHA:</strong> {{ partidaContable.fecha }}</div>
          <div><strong>TIPO:</strong> {{ partidaContable.tipo_clasificacion }}</div>
          <div style="margin-top: 5px;"><strong>DESCRIPCIÓN:</strong> {{ partidaContable.descripcion }}</div>
        </div>
      </div>

      <!-- Tabla de resultados -->
      <div class="tabla-wrapper">
        <table class="tabla-libro">
          <thead>
            <tr>
              <th>Código</th>
              <th>Cuenta</th>
              <th>Descripción</th>
              <th class="right">Débito (Q)</th>
              <th class="right">Crédito (Q)</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(movimiento, index) in partidaContable.movimientos" :key="index">
              <td style="text-align: center;">{{ movimiento.codigo }}</td>
              <td>{{ movimiento.cuenta }}</td>
              <td class="descripcion-col">{{ movimiento.descripcion || '-' }}</td>
              <td class="right debito">
                {{ movimiento.debito ? formatNumber(movimiento.debito) : '0.00' }}
              </td>
              <td class="right credito">
                {{ movimiento.credito ? formatNumber(movimiento.credito) : '0.00' }}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <!-- Totales -->
            <tr class="fila-resaltada">
              <td colspan="3" class="bold-text right">TOTALES</td>
              <td class="right bold-text">Q {{ partidaContable.totales.total_debito }}</td>
              <td class="right bold-text">Q {{ partidaContable.totales.total_credito }}</td>
            </tr>
            <!-- Diferencia -->
            <tr class="fila-resaltada" :class="{ 'balance-correcto': partidaContable.totales.balanceada }">
              <td colspan="3" class="bold-text right">DIFERENCIA</td>
              <td colspan="2" class="right bold-text" :class="partidaContable.totales.balanceada ? 'texto-verde' : 'texto-rojo'">
                Q {{ partidaContable.totales.diferencia }}
                <span>{{ partidaContable.totales.balanceada ? '✅' : '❌' }}</span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Resumen Simple (Tarjetas adaptadas al diseño limpio) -->
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
  </div>
</template>

<script>
import axios from 'axios';
import { ref, computed } from 'vue';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';

export default {
  name: 'GenerarPartidaSimple',
  setup() {
    // --- ESTADO ---
    const idBuscado = ref('');
    const partidaContable = ref(null);
    const loading = ref(false);
    const error = ref('');
    const mostrarNoEncontrado = ref(false);

    // --- COMPUTADOS ---
    const fechaActual = computed(() => new Date().toLocaleDateString('es-GT'));

    // --- UTILIDADES ---
    const formatNumber = (value) => {
      if (value === null || value === undefined) return '0.00';
      const num = parseFloat(value);
      return isNaN(num) ? '0.00' : num.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    // --- LÓGICA DE API ---
    const generarPartida = async () => {
      if (!idBuscado.value) {
        error.value = 'Por favor ingrese un ID válido.';
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
        }
      } finally {
        loading.value = false;
      }
    };

    const handleKeyPress = (event) => {
      if (event.key === 'Enter') generarPartida();
    };

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
        doc.text('Sistema Contable - Partida Generada', 105, 30, { align: 'center' });

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

      } catch (err) {
        console.error("Error PDF:", err);
        alert("Hubo un error al generar el PDF.");
      }
    };

    return {
      idBuscado, partidaContable, loading, error, mostrarNoEncontrado,
      fechaActual, formatNumber, generarPartida, generarPDF, handleKeyPress
    };
  }
}
</script>

<style scoped>
/* ESTILOS COPIADOS Y ADAPTADOS DE TU CÓDIGO "LIBRO DIARIO" 
*/
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  border-radius: 8px;
  background-color: #fdfdfd;
  border: 1px solid #ccc;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.titulo-reporte {
  font-size: 1.2rem;
  font-weight: 600;
  color: #111;
  margin-bottom: 0.5rem;
  display: inline-block;
}

/* Filtros y Inputs */
.division-container {
  border: 1px solid rgb(19, 19, 75);
  border-radius: 6px;
  padding: 12px 16px;
  margin-top: 10px;
  background-color: #fff;
}

.numero-fecha-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.fecha-inputs {
  flex: 1;
  min-width: 200px;
}

.fecha-inputs label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  display: block;
}

input[type='text'],
input[type='date'],
input[type='number'],
select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #bbb;
  border-radius: 5px;
  box-sizing: border-box;
  font-size: 0.9rem;
  background-color: #fff;
}

/* Botones */
button {
  padding: 10px 16px;
  background-color: #14491b; /* Verde oscuro del diseño original */
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.2;
}

button:hover:not(:disabled) {
  background-color: #475f27;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.espacio {
  margin-left: 10px;
}

/* Encabezado visual tipo PDF */
.encabezado-container {
  margin-top: 30px;
  border: 1px solid #133;
  border-radius: 6px;
  background-color: #fff;
  padding: 16px;
}

.encabezado-box {
  border: 2px solid #133;
  border-radius: 4px;
  padding: 10px;
  text-align: center;
  max-width: 480px;
  margin: 0 auto 16px auto;
}

.encabezado-titulo {
  font-size: 1rem;
  font-weight: 600;
  color: #000;
}

.encabezado-direccion {
  font-size: 0.8rem;
  color: #333;
  margin-top: 4px;
}

.encabezado-detalles {
  font-size: 0.8rem;
  color: #000;
  line-height: 1.4;
  text-align: center;
  /* Grid para que se vea ordenado como en la partida */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 8px;
}

/* Tabla */
.tabla-wrapper {
  width: 100%;
  overflow-x: auto;
  margin-top: 20px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #fff;
}

.tabla-libro {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
  font-size: 0.8rem;
}

.tabla-libro thead th {
  background-color: rgb(41, 128, 185);
  color: #fff;
  text-align: center;
  padding: 8px;
  font-weight: 600;
  border: 1px solid #999;
  white-space: nowrap;
}

.tabla-libro tbody td {
  border: 1px solid #ccc;
  padding: 6px 8px;
  vertical-align: middle;
  text-align: left;
  word-break: break-word;
}

.tabla-libro tbody td.descripcion-col {
  text-align: left;
  color: #555;
  font-style: italic;
}

.right {
  text-align: right !important;
}

.fila-resaltada {
  background-color: #f3f6fa;
  font-weight: 600;
}

.bold-text {
  font-weight: 600;
}

/* Mensajes de error / alerta */
.mensaje-error {
  color: #721c24;
  background-color: #f8d7da;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  border: 1px solid #f5c6cb;
}

.mensaje-alerta {
  color: #856404;
  background-color: #fff3cd;
  padding: 10px;
  border-radius: 4px;
  margin: 10px 0;
  border: 1px solid #ffeeba;
}

/* Estilos específicos para Partida (Colores de números) */
.debito {
  color: #c0392b; /* Rojo suave */
  font-family: monospace;
}
.credito {
  color: #27ae60; /* Verde suave */
  font-family: monospace;
}

.texto-verde { color: #27ae60; }
.texto-rojo { color: #c0392b; }

.balance-correcto {
  background-color: #e8f5e8 !important; /* Fondo verde muy claro */
}

/* Resumen final simple */
.resumen-container {
  display: flex;
  gap: 20px;
  margin-top: 15px;
  padding: 10px;
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 4px;
  font-size: 0.9rem;
}
.resumen-item .label {
  color: #666;
  margin-right: 5px;
}
</style>