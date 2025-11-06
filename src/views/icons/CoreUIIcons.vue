<template>

    <label class="titulo-reporte">LIBRO DE CAJA</label>

    <!-- Filtros de fecha -->
    <div class="division-container">
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
    </div>

    <!-- Botones -->
    <div style="margin-top: 20px;"></div>
    <button @click="generarPDF">Generar PDF</button>
    <button @click="mostrarTabla" class="espacio">Vista previa</button>

    <!-- Encabezado tipo PDF -->
    <div v-if="ingresosEgresos.length" class="encabezado-container">
      <div class="encabezado-box">
        <div class="encabezado-titulo">{{ nombreEncabezado }}</div>
        <div class="encabezado-direccion">
          Dirección del Proyecto: {{ direccionProyecto }}
        </div>
      </div>

      <div class="encabezado-detalles">
        <div><strong>REPORTE:</strong> LIBRO CAJA</div>
        <div>
          <strong>ESPECIFICACIÓN:</strong>
          Desde: {{ fechaInicial }}, Hasta: {{ fechaFinal }}
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
                fila.cuenta === 'Suma total Caja'
            }"
          >
            <!-- Si es fila resaltada, combinamos celdas -->
            <template
              v-if="
                fila.cuenta === 'Saldo inicial' ||
                fila.cuenta === 'Suma total Caja'
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

            <!-- Fila normal -->
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
      No hay datos para mostrar. Selecciona un rango de fechas y presiona
      "Vista previa".
    </div>
  
</template>

<script>
import { ref, computed } from 'vue';
import jsPDF from 'jspdf';
import axios from 'axios';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import '../../styles/css/LibroCajaA.css'

export default {
  name: 'LibroCaja',
  setup() {
    const fechaInicial = ref('');
    const fechaFinal = ref('');

    const nombreEncabezado = ref('PROYECTO AGRÍCOLA');
    const direccionProyecto = ref('8va calle 5-21 zona 10, Quetzaltenango');

    // esto guardará lo que regrese el backend
    const ingresosEgresos = ref([]);

    // -------- utilidades --------
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

    // adaptamos los datos como en el PDF
    const tablaFormateada = computed(() => {
      return ingresosEgresos.value.map((item) => {
        const esEspecial =
          item.cuenta === 'Saldo inicial' ||
          item.cuenta === 'Suma total Caja';

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

    // -------- construir PDF (igual que ya lo tenías) --------
    const buildPDF = async () => {
      const response = await axios.post(
        'http://127.0.0.1:8000/in_eg/fecha',
        {
          fechaInicial: fechaInicial.value,
          fechaFinal: fechaFinal.value
        }
      );

      const data = response.data;

      const doc = new jsPDF({ orientation: 'landscape' });

      // Encabezado
      doc.setFontSize(16);
      doc.text(nombreEncabezado.value, 148.5, 27, { align: 'center' });
      doc.rect(60, 17, 170, 15);

      doc.setFontSize(12);
      doc.text(
        `Dirección del Proyecto: ${direccionProyecto.value}`,
        20,
        40
      );

      doc.setFontSize(10);
      doc.text('REPORTE: LIBRO CAJA', 20, 50);

      const especificacionFechas = `ESPECIFICACIÓN: Desde: ${fechaInicial.value}, Hasta: ${fechaFinal.value}`;
      doc.text(especificacionFechas, 20, 60);

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
          row.cuenta === 'Suma total Caja'
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
        startY: 65,
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
          nomenclatura: { minCellWidth: 30, halign: 'left', overflow: 'visible' },
          fecha: { minCellWidth: 30, halign: 'left', overflow: 'visible' },
          descripcion: {
            minCellWidth: 50,
            halign: 'left',
            overflow: 'linebreak'
          },
          cuenta: {
            minCellWidth: 50,
            halign: 'left',
            overflow: 'linebreak'
          },
          acredita: { minCellWidth: 30, halign: 'right' },
          debita: { minCellWidth: 30, halign: 'right' },
          total: { minCellWidth: 40, halign: 'right' }
        },
        tableWidth: 'auto',
        margin: { left: 10, right: 10 }
      });

      return doc;
    };

    const generarPDF = async () => {
      try {
        const doc = await buildPDF();
        const blob = doc.output('blob');
        saveAs(blob, 'libro_caja_agrícola.pdf');
      } catch (error) {
        console.error('Error al generar el PDF:', error);
      }
    };

    const mostrarTabla = async () => {
      try {
        const response = await axios.post(
          'http://127.0.0.1:8000/in_eg/fecha',
          {
            fechaInicial: fechaInicial.value,
            fechaFinal: fechaFinal.value
          }
        );

        ingresosEgresos.value = response.data || [];
      } catch (error) {
        console.error('Error al mostrar la tabla:', error);
        ingresosEgresos.value = [];
      }
    };

    return {
      fechaInicial,
      fechaFinal,
      nombreEncabezado,
      direccionProyecto,
      ingresosEgresos,
      tablaFormateada,
      generarPDF,
      mostrarTabla
    };
  }
};
</script>

