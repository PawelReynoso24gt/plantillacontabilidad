<template>
    <label class="titulo-reporte">LIBRO DE BANCOS - CAPILLA</label>

    <!-- Filtros de fecha -->
      <div class="numero-fecha-container">
        <div class="fecha-inputs">
          <label>Fecha Inicial</label>
          <input type="date" v-model="fechaInicial" />
        </div>
        <div class="fecha-inputs">
          <label>Fecha Final</label>
          <input type="date" v-model="fechaFinal" />
        </div>
      </div>
  

    <!-- Selección de cuenta bancaria -->
      <div class="numero-fecha-container">
        <div class="numero-inputs">
          <label>Cuenta bancaria:</label>
          <select v-model="cuentaBName">
            <option
              v-for="cuentaN in cuentas_bancarias"
              :key="cuentaN.cuenta_bancaria"
              :value="cuentaN.cuenta_bancaria"
            >
              {{ cuentaN.banco_y_cuenta }}
            </option>
          </select>
        </div>
      </div>
   
    <!-- Espacio -->
    <div style="margin-top: 20px;"></div>

    <!-- Botones -->
    <button @click="generarPDF">Generar PDF</button>
    <button @click="mostrarTabla" class="espacio">Mostrar Tabla</button>

    <!-- Encabezado tipo PDF / vista previa -->
    <div v-if="ingresosEgresos.length" class="encabezado-container">
      <div class="encabezado-box">
        <div class="encabezado-titulo">{{ nombreEncabezado }}</div>
        <div class="encabezado-direccion">
          Dirección del Proyecto: {{ direccionProyecto }}
        </div>
      </div>

      <div class="encabezado-detalles">
        <div><strong>REPORTE:</strong> LIBRO BANCOS</div>
        <div>
          <strong>ESPECIFICACIÓN:</strong>
          Desde: {{ fechaInicial }}, Hasta: {{ fechaFinal }}
        </div>
        <div>
          <strong>CUENTA BANCARIA:</strong>
          {{
            cuentaBancariaSeleccionada
              ? cuentaBancariaSeleccionada.banco_y_cuenta ||
                cuentaBancariaSeleccionada.nombre_cuenta
              : ''
          }}
        </div>
      </div>
    </div>

    <!-- Tabla de resultados -->
    <div v-if="ingresosEgresos.length" class="tabla-wrapper">
      <table class="tabla-libro">
        <thead>
          <tr>
            <th>Conteo</th>
            <th>Fecha</th>
            <th>Cuenta</th>
            <th>Descripción</th>
            <th class="right">Acredita</th>
            <th class="right">Debita</th>
            <th class="right">Saldo</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(fila, idx) in tablaFormateada"
            :key="idx"
            :class="{
              'fila-resaltada':
                fila.cuenta === 'Saldo inicial' ||
                fila.cuenta === 'Suma total Banco'
            }"
          >
            <!-- Filas especiales -->
            <template
              v-if="
                fila.cuenta === 'Saldo inicial' ||
                fila.cuenta === 'Suma total Banco'
              "
            >
              <td>{{ fila.nomenclatura }}</td>
              <td>{{ fila.fecha || '' }}</td>
              <td class="bold-text">{{ fila.cuenta }}</td>
              <td class="descripcion-col bold-text">
                {{ fila.descripcion }}
              </td>
              <td class="right bold-text"></td>
              <td class="right bold-text"></td>
              <td class="right bold-text">{{ fila.total }}</td>
            </template>

            <!-- Filas normales -->
            <template v-else>
              <td>{{ fila.nomenclatura }}</td>
              <td>{{ fila.fecha }}</td>
              <td>{{ fila.cuenta }}</td>
              <td class="descripcion-col">{{ fila.descripcion }}</td>
              <td class="right">{{ fila.acredita }}</td>
              <td class="right">{{ fila.debita }}</td>
              <td class="right">{{ fila.total }}</td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mensaje cuando no hay datos aún -->
    <div v-else class="sin-datos">
      No hay datos para mostrar. Selecciona rango de fechas y cuenta bancaria y
      presiona "Mostrar Tabla".
    </div>

</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import jsPDF from 'jspdf';
import axios from 'axios';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';

export default {
  name: 'LibroBancosCapilla',
  setup() {
    const fechaInicial = ref('');
    const fechaFinal = ref('');
    const nombreEncabezado = ref('PROYECTO CAPILLA');
    const direccionProyecto = ref('Dirección del Proyecto');

    const cuentas_bancarias = reactive([]);
    const cuentaBName = ref('');

    const ingresosEgresos = ref([]);

    const cargarBancosNoCuenta = () => {
      axios
        .get('http://127.0.0.1:8000/cuentasB/getConcatenada')
        .then((response) => {
          cuentas_bancarias.splice(
            0,
            cuentas_bancarias.length,
            ...response.data
          );
        })
        .catch((error) => {
          console.error(error);
        });
    };

    onMounted(() => {
      cargarBancosNoCuenta();
    });

    const cuentaBancariaSeleccionada = computed(() => {
      return cuentas_bancarias.find(
        (cuenta) => cuenta.cuenta_bancaria === cuentaBName.value
      );
    });

    const formatNumber = (value) => {
      if (value === null || value === undefined || value === '') return '';
      const num = parseFloat(value);
      if (isNaN(num)) return '';
      return (
        'Q. ' +
        num.toLocaleString('es-GT', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
      );
    };

    const tablaFormateada = computed(() => {
      return ingresosEgresos.value.map((item) => {
        const esEspecial =
          item.cuenta === 'Saldo inicial' ||
          item.cuenta === 'Suma total Banco';

        return {
          nomenclatura: item.nomenclatura,
          fecha: item.fecha || '',
          cuenta: item.cuenta,
          descripcion: item.descripcion,
          acredita: esEspecial
            ? ''
            : item.acredita
            ? formatNumber(item.acredita)
            : '',
          debita: esEspecial
            ? ''
            : item.debita
            ? formatNumber(item.debita)
            : '',
          total: item.total ? formatNumber(item.total) : ''
        };
      });
    });

    const mostrarTabla = async () => {
      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/in_eg/fechaBancoCA',
          {
            fechaInicial: fechaInicial.value,
            fechaFinal: fechaFinal.value,
            banco_y_cuenta: cuentaBName.value
          }
        );
        ingresosEgresos.value = response.data || [];
      } catch (error) {
        console.error('Error al mostrar la tabla:', error);
        ingresosEgresos.value = [];
      }
    };

    const generarPDF = async () => {
      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/in_eg/fechaBancoCA',
          {
            fechaInicial: fechaInicial.value,
            fechaFinal: fechaFinal.value,
            banco_y_cuenta: cuentaBName.value
          }
        );
        const data = response.data;

        const doc = new jsPDF('landscape');

        // Encabezado PDF
        doc.setFontSize(16);
        doc.text(nombreEncabezado.value, 148.5, 27, { align: 'center' });
        doc.rect(60, 17, 170, 15);

        doc.setFontSize(12);
        doc.text(
          `Dirección del Proyecto: ${direccionProyecto.value}`,
          20,
          40
        );

        const textoAdicional = 'REPORTE: LIBRO BANCOS';
        doc.setFontSize(10);
        doc.text(textoAdicional, 20, 50);

        const especificacionFechas = `ESPECIFICACIÓN: Desde: ${fechaInicial.value}, Hasta: ${fechaFinal.value}`;
        doc.text(especificacionFechas, 20, 60);

        const cuentaBancariaTexto = `CUENTA BANCARIA: ${
          cuentaBancariaSeleccionada.value?.nombre_cuenta ||
          cuentaBancariaSeleccionada.value?.banco_y_cuenta ||
          ''
        }`;
        doc.text(cuentaBancariaTexto, 20, 70);

        const columnas = [
          { title: 'Conteo', dataKey: 'nomenclatura' },
          { title: 'Fecha', dataKey: 'fecha' },
          { title: 'Cuenta', dataKey: 'cuenta' },
          { title: 'Descripción', dataKey: 'descripcion' },
          { title: 'Acredita', dataKey: 'acredita' },
          { title: 'Debita', dataKey: 'debita' },
          { title: 'Saldo', dataKey: 'total' }
        ];

        const filas = data.map((row) => {
          const total = row.total ? formatNumber(row.total) : '';

          if (
            row.cuenta === 'Saldo inicial' ||
            row.cuenta === 'Suma total Banco'
          ) {
            return {
              nomenclatura: row.nomenclatura,
              fecha: row.fecha || '',
              cuenta: row.cuenta,
              descripcion: row.descripcion,
              acredita: '',
              debita: '',
              total: {
                content: total,
                styles: { fontStyle: 'bold' }
              },
              borderBottom: {
                width: 4,
                color: [0, 0, 0],
                double: true
              }
            };
          }

          return {
            nomenclatura: row.nomenclatura,
            fecha: row.fecha,
            cuenta: row.cuenta,
            descripcion: row.descripcion,
            acredita: row.acredita ? formatNumber(row.acredita) : '',
            debita: row.debita ? formatNumber(row.debita) : '',
            total: total
          };
        });

        doc.autoTable({
          columns,
          body: filas,
          startY: 75,
          theme: 'grid',
          styles: {
            cellPadding: 2.5,
            fontSize: 7,
            halign: 'center',
            valign: 'middle',
            overflow: 'linebreak'
          },
          headStyles: {
            fillColor: [41, 128, 185],
            textColor: [255, 255, 255]
          },
          columnStyles: {
            nomenclatura: {
              minCellWidth: 20,
              overflow: 'visible',
              halign: 'left'
            },
            fecha: {
              minCellWidth: 20,
              overflow: 'visible',
              halign: 'left'
            },
            cuenta: {
              minCellWidth: 40,
              overflow: 'linebreak',
              halign: 'left'
            },
            descripcion: {
              minCellWidth: 40,
              overflow: 'linebreak',
              halign: 'left'
            },
            acredita: { minCellWidth: 20, halign: 'right' },
            debita: { minCellWidth: 20, halign: 'right' },
            total: { minCellWidth: 20, halign: 'right' }
          },
          tableWidth: 'auto',
          margin: { left: 10, right: 10 }
        });

        const blob = doc.output('blob');
        saveAs(blob, 'libro_bancos_capilla.pdf');
      } catch (error) {
        console.error('Error al generar el PDF:', error);
      }
    };

    return {
      fechaInicial,
      fechaFinal,
      cuentaBName,
      nombreEncabezado,
      direccionProyecto,
      cuentas_bancarias,
      cuentaBancariaSeleccionada,
      ingresosEgresos,
      tablaFormateada,
      mostrarTabla,
      generarPDF
    };
  }
};
</script>

<style scoped>
.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
  border-radius: 8px;
  background-color: #fdfdfd;
  border: 1px solid #ccc;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.05);
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    'Helvetica Neue', Arial, sans-serif;
}

.titulo-reporte {
  font-size: 1.2rem;
  font-weight: 600;
  color: #111;
  margin-bottom: 0.5rem;
  display: inline-block;
}

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

.fecha-inputs,
.numero-inputs {
  flex: 1;
  min-width: 200px;
}

.fecha-inputs label,
.numero-inputs label {
  font-size: 0.8rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  display: block;
}

input[type='text'],
input[type='date'],
select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #bbb;
  border-radius: 5px;
  box-sizing: border-box;
  font-size: 0.9rem;
  background-color: #fff;
}

button {
  padding: 10px 16px;
  background-color: #14491b;
  color: #fff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  line-height: 1.2;
}

button:hover {
  background-color: #475f27;
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
  text-align: center;
  word-break: break-word;
}

.tabla-libro tbody td.descripcion-col {
  text-align: left;
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

.sin-datos {
  margin-top: 30px;
  font-size: 0.9rem;
  color: #555;
  text-align: center;
  font-style: italic;
}
</style>
