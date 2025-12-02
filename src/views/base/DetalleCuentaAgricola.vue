<template>
  <div>
    <!-- Título principal -->
    <label class="titulo-reporte">
      LIBRO MAYOR
    </label>

    <!-- “Filtros” / info de contexto (solo lectura) -->
    <div class="division-container">
      <div class="numero-fecha-container">
        <div class="fecha-inputs">
          <label>Cuenta</label>
          <input
            type="text"
            :value="`${codigoCuenta} - ${nombreCuenta}`"
            disabled
          />
        </div>
        <div class="fecha-inputs">
          <label>Período</label>
          <input
            type="text"
            :value="`Anual ${year}`"
            disabled
          />
        </div>
      </div>
    </div>

    <!-- Espacio entre filtros y botones -->
    <div style="margin-top: 20px;"></div>

    <!-- Botones -->
    <button @click="generarPDF">Generar PDF</button>
    <button class="espacio" @click="volver">Regresar</button>

    <!-- Encabezado tipo PDF / vista previa -->
    <div v-if="ingresosEgresos.length" class="encabezado-container">
      <div class="encabezado-box">
        <div class="encabezado-titulo">
          {{ nombreEncabezado }}
        </div>
        <div class="encabezado-direccion">
          Dirección del Proyecto: {{ direccionProyecto }}
        </div>
      </div>

      <div class="encabezado-detalles">
        <div><strong>REPORTE:</strong> LIBRO MAYOR</div>
        <div>
          <strong>CUENTA:</strong>
           {{ nombreCuenta }}
        </div>
        <div>
          <strong>PERÍODO:</strong>
          Anual {{ year }}
        </div>
        <div>
          <strong>FECHA REPORTE:</strong>
          {{ fechaHoy }}
        </div>
      </div>
    </div>

    <!-- Tabla de movimientos -->
    <div
      v-if="ingresosEgresos.length"
      class="tabla-wrapper"
    >
      <table class="tabla-libro">
        <thead>
          <tr>
            <th>Conteo</th>
            <th>Número de Documento</th>
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
                fila.cuenta === 'Suma total'
            }"
          >
            <!-- Filas especiales (Saldo inicial / Suma total) -->
            <template
              v-if="fila.cuenta === 'Saldo inicial' || fila.cuenta === 'Suma total'"
            >
              <td>{{ fila.nomenclatura }}</td>
              <td>{{ fila.numero_documento }}</td>
              <td>{{ fila.fecha || '' }}</td>
              <td class="bold-text">{{ fila.cuenta }}</td>
              <td class="descripcion-col bold-text">{{ fila.descripcion }}</td>
              <td class="right bold-text"></td>
              <td class="right bold-text"></td>
              <td class="right bold-text">{{ fila.total }}</td>
            </template>

            <!-- Filas normales -->
            <template v-else>
              <!-- AQUI ESTÁ EL CAMBIO: Link en Nomenclatura -->
              <td
                class="link-cuenta"
                @click="irAPartida(fila.idIngresoEgreso)"
                title="Ver Partida"
              >
                {{ fila.nomenclatura }}
              </td>

              <td>{{ fila.numero_documento }}</td>
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

    <!-- Mensaje cuando no hay datos -->
    <div v-else class="sin-datos">
      No hay datos para mostrar. Esta cuenta no tiene movimientos para el período.
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import '../../styles/css/LibroDiarioA.css'; 

export default {
  name: 'ReporteCuentaAgricolaCuenta',
  setup() {
    const route = useRoute();
    const router = useRouter();

    // Código contable (2.1.1)
    const codigoCuenta = computed(() => route.params.codigo || '');

    // Nombre de la cuenta ("Compra de Cerdos")
    const nombreCuenta = computed(() => route.params.cuenta || '');

    const year = new Date().getFullYear();
    const fechaHoy = new Date().toLocaleDateString('es-ES');

    // Encabezado igual que LibroDiario
    const nombreEncabezado = ref('PROYECTO AGRÍCOLA');
    const direccionProyecto = ref('8va calle 5-21 zona 10, Quetzaltenango');

    const ingresosEgresos = ref([]);
    const loading = ref(false);
    const error = ref(false);

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
          item.cuenta === 'Saldo inicial' || item.cuenta === 'Suma total';

        return {
          idIngresoEgreso: item.id_ingresos_egresos,
          nomenclatura: item.nomenclatura,
          numero_documento: item.numero_documento || '-',
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

    const cargarMovimientos = async () => {
      loading.value = true;
      error.value = false;
      try {
        console.log('Código que se muestra:', codigoCuenta.value);
        console.log('Nombre que se envía al backend:', nombreCuenta.value);

        const resp = await axios.post(
          'http://127.0.0.1:8000/cuentas/libro-diario/por-cuenta',
          {
            cuenta: nombreCuenta.value // aquí va el nombre, igual que en Postman
          }
        );

        ingresosEgresos.value = resp.data || [];
      } catch (e) {
        console.error('Error al cargar movimientos de la cuenta:', e);
        error.value = true;
        ingresosEgresos.value = [];
      } finally {
        loading.value = false;
      }
    };

    // --- NUEVA FUNCIÓN PARA EL LINK ---
    const irAPartida = (idIngresoEgreso) => {
        // Redirige a la ruta 'Partidas' definida en tu router
        router.push({ 
            name: 'Partidas',
            // Opcional: Enviamos el numero de documento como query param
            // por si quieres filtrar al llegar a esa vista.
            query: { id: idIngresoEgreso } 
        });
    };

    const generarPDF = () => {
      const doc = new jsPDF('landscape');

      // Encabezado tipo LibroDiario
      doc.setFontSize(16);
      doc.text(nombreEncabezado.value, 148.5, 27, { align: 'center' });
      doc.rect(60, 17, 170, 15);

      doc.setFontSize(12);
      doc.text(
        `Dirección del Proyecto: ${direccionProyecto.value}`,
        20,
        40
      );

      const textoAdicional = `REPORTE: ESTADO DE MOVIMIENTOS POR CUENTA`;
      doc.setFontSize(10);
      doc.text(textoAdicional, 20, 50);

      const especificacion = `CUENTA: ${codigoCuenta.value} - ${nombreCuenta.value} | PERÍODO: Anual ${year}`;
      doc.text(especificacion, 20, 60);

      const columnas = [
        { title: 'Conteo', dataKey: 'nomenclatura' },
        { title: 'Número de Documento', dataKey: 'numero_documento' },
        { title: 'Fecha', dataKey: 'fecha' },
        { title: 'Cuenta', dataKey: 'cuenta' },
        { title: 'Descripción', dataKey: 'descripcion' },
        { title: 'Acredita', dataKey: 'acredita' },
        { title: 'Debita', dataKey: 'debita' },
        { title: 'Saldo', dataKey: 'total' }
      ];

      const filas = ingresosEgresos.value.map((row) => {
        const total = row.total ? formatNumber(row.total) : '';

        if (
          row.cuenta === 'Saldo inicial' ||
          row.cuenta === 'Suma total'
        ) {
          return {
            nomenclatura: row.nomenclatura,
            numero_documento: row.numero_documento || '-',
            fecha: row.fecha || '',
            cuenta: row.cuenta,
            descripcion: row.descripcion,
            acredita: '',
            debita: '',
            total: { content: total, styles: { fontStyle: 'bold' } }
          };
        }

        return {
          nomenclatura: row.nomenclatura,
          numero_documento: row.numero_documento || '-',
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
        startY: 80,
        theme: 'grid',
        styles: {
          cellPadding: 3,
          fontSize: 8,
          halign: 'left',
          valign: 'middle'
        },
        headStyles: {
          fillColor: [41, 128, 185],
          textColor: [255, 255, 255]
        },
        columnStyles: {
          nomenclatura: { minCellWidth: 20, halign: 'left' },
          numero_documento: { minCellWidth: 30, halign: 'left' },
          fecha: { minCellWidth: 20, halign: 'left' },
          cuenta: { minCellWidth: 40, halign: 'left' },
          descripcion: { minCellWidth: 40, halign: 'left' },
          acredita: { minCellWidth: 20, halign: 'right' },
          debita: { minCellWidth: 20, halign: 'right' },
          total: { minCellWidth: 20, halign: 'right' }
        }
      });

      const blob = doc.output('blob');
      saveAs(blob, `libro_diario_cuenta_${codigoCuenta.value}.pdf`);
    };

    const volver = () => {
      router.back();
    };

    onMounted(() => {
      cargarMovimientos();
    });

    return {
      codigoCuenta,
      nombreCuenta,
      year,
      fechaHoy,
      nombreEncabezado,
      direccionProyecto,
      ingresosEgresos,
      tablaFormateada,
      loading,
      error,
      generarPDF,
      volver,
      irAPartida // Retornamos la nueva función
    };
  }
};
</script>