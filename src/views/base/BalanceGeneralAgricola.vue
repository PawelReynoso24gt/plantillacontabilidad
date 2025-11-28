<template>

    <div>
        <h1>Balance General - Agricola</h1>
    </div>
    <!-- Filtros / encabezado del form -->
    <div class="nombre-fecha-container">
        <div class="id-inputs">
            <div class="select-group">
                <label>Período de informe</label>
                <select v-model="selectedPeriodo" @change="actualizarMeses">
                    <option v-for="periodo in periodos" :key="periodo" :value="periodo">
                        {{ periodo }}
                    </option>
                </select>
            </div>

            <div class="select-group">
                <label>Mes</label>
                <select v-model="selectedMes">
                    <option v-for="mes in meses" :key="mes" :value="mes">
                        {{ mes }}
                    </option>
                </select>
            </div>
        </div>

        <!-- removed contador/responsables inputs as requested -->
        
    </div>


    <!-- Botones -->
    <div style="margin-top: 20px;"></div>
    <button @click="generarPDF">Generar PDF</button>
    <button @click="mostrarTabla" class="espacio">Vista previa</button>
    <button @click="limpiar" class="espacio">Limpiar</button>

    <!-- Vista previa del informe (solo si ya hay datos) -->
    <div v-if="reporteData" class="encabezado-container">
        <div class="encabezado-box">
            <div class="encabezado-titulo">
                REPORTE FINAL {{ selectedPeriodo.toUpperCase() }}
                {{ currentYear }}
            </div>
        </div>

        <div class="encabezado-detalles">
            <div>
                <strong>INFORME CORRESPONDIENTE AL:</strong>
                {{ periodoTexto }}
            </div>
            <div><strong>AÑO:</strong> {{ currentYear }}</div>
            <div><strong>PROYECTO:</strong> PROYECTO AGRÍCOLA HOGAR SANTA LUISA</div>
            <div><strong>LUGAR:</strong> QUETZALTENANGO, GUATEMALA</div>
            <div>
                <strong>FECHA:</strong> {{ fechaHoy }}
            </div>
        </div>
    </div>

    <!-- Tabla principal (preview en pantalla) -->
    <div v-if="reporteData" class="tabla-wrapper">
        <table class="tabla-libro">
            <thead>
                <tr>
                    <th>Descripción</th>
                    <th>Detalle</th>
                    <th class="right">Saldo suma</th>
                    <th class="right">Suma</th>
                </tr>
            </thead>

            <tbody>
                <tr v-for="(fila, idx) in tablaPreview" :key="idx">
                    <td class="bold-text" v-if="fila.tipo === 'heading'">
                        {{ fila.col1 }}
                    </td>
                    <td v-if="fila.tipo === 'heading'"></td>
                    <td v-if="fila.tipo === 'heading'" class="right bold-text">
                        {{ fila.col3 || '' }}
                    </td>
                    <td v-if="fila.tipo === 'heading'" class="right bold-text">
                        {{ fila.col4 || '' }}
                    </td>

                    <!-- filas normales -->
                    <template v-else>
                        <td>{{ fila.col1 }}</td>
                        <td>{{ fila.col2 }}</td>
                        <td class="right">{{ fila.col3 }}</td>
                        <td class="right">{{ fila.col4 }}</td>
                    </template>
                </tr>
            </tbody>
        </table>
    </div>

    <!-- firmas removed per request -->

    <!-- Mensaje cuando aún no se ha pedido nada -->
    <div v-else class="sin-datos">
        No hay datos para mostrar. Selecciona período y mes y presiona "Vista previa".
    </div>

</template>

<script>
import axios from 'axios';
import { ref, computed } from 'vue';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';

export default {
    name: 'ReporteAG',
    setup() {
    // removed contador/responsables refs per request
        const selectedPeriodo = ref('');
        const selectedMes = ref('');
        const periodos = ['Mensual', 'Trimestral', 'Semestral', 'Anual'];
        const meses = ref([]);


        const reporteData = ref(null);

        const formatQ = (n) => {
            if (n === null || n === undefined || n === '') return '';
            const num = parseFloat(n);
            if (isNaN(num)) return '';
            return (
                'Q ' +
                num.toLocaleString('es-GT', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })
            );
        };

        const now = new Date();
        const currentYear = now.getFullYear();
        const fechaHoy = now.toLocaleDateString('es-ES');

        const periodoTexto = computed(() => {
            if (selectedPeriodo.value === 'Mensual') {
                return `RESUMEN DE ${selectedMes.value?.toUpperCase?.() || ''}`;
            } else if (selectedPeriodo.value === 'Trimestral') {
                const trimestre = {
                    Enero: 'PRIMER TRIMESTRE',
                    Abril: 'SEGUNDO TRIMESTRE',
                    Julio: 'TERCER TRIMESTRE',
                    Octubre: 'CUARTO TRIMESTRE'
                };
                return `RESUMEN ${trimestre[selectedMes.value] || ''}`;
            } else if (selectedPeriodo.value === 'Semestral') {
                return selectedMes.value === 'Enero'
                    ? 'RESUMEN PRIMER SEMESTRE'
                    : 'RESUMEN SEGUNDO SEMESTRE';
            } else if (selectedPeriodo.value === 'Anual') {
                return 'RESUMEN ANUAL';
            }
            return '';
        });

        const actualizarMeses = () => {
            switch (selectedPeriodo.value) {
                case 'Mensual':
                    meses.value = [
                        'Enero',
                        'Febrero',
                        'Marzo',
                        'Abril',
                        'Mayo',
                        'Junio',
                        'Julio',
                        'Agosto',
                        'Septiembre',
                        'Octubre',
                        'Noviembre',
                        'Diciembre'
                    ];
                    break;
                case 'Trimestral':
                    meses.value = ['Enero', 'Abril', 'Julio', 'Octubre'];
                    break;
                case 'Semestral':
                    meses.value = ['Enero', 'Julio'];
                    break;
                case 'Anual':
                    meses.value = ['Enero'];
                    selectedMes.value = 'Enero';
                    break;
                default:
                    meses.value = [];
            }
        };

        // helper: parse numbers robustly (accepts '1,234.56' and 'Q 1,234.56')
        const parseNumberString = (v) => {
            if (v === null || v === undefined || v === '') return 0;
            if (typeof v === 'number') return v;
            const s = String(v).replace(/[^0-9\.-]+/g, '');
            const n = parseFloat(s);
            return isNaN(n) ? 0 : n;
        };

        // getItems: prefer nested container[cat][sub] arrays; otherwise filter flatArray by flags
        const getItems = (container, flatArray, cat, sub, field) => {
            try {
                if (container && container[cat] && container[cat][sub] && Array.isArray(container[cat][sub])) {
                    return container[cat][sub].filter((it) => parseNumberString(it[field]) > 0);
                }

                if (Array.isArray(flatArray)) {
                    return flatArray.filter((it) => {
                        const tipo = it.tipoCuenta ?? it.tipo_cuenta ?? it.tipo ?? null; // 1=ACTIVO,0=PASIVO
                        const corriente = it.corriente ?? it.es_corriente ?? null; // 1=CORRIENTE,0=NO
                        const tipoMatch = cat === 'activos' ? tipo == 1 : tipo == 0;
                        const subMatch = sub === 'corriente' ? corriente == 1 : corriente == 0;
                        return tipoMatch && subMatch && parseNumberString(it[field]) > 0;
                    });
                }

                return [];
            } catch (e) {
                return [];
            }
        };

        const tablaPreview = computed(() => {
            if (!reporteData.value) return [];
            const d = reporteData.value;

            const rows = [];

            // Saldo inicial
            rows.push({ tipo: 'heading', col1: 'SALDO INICIAL', col2: '', col3: '', col4: formatQ(d.saldo_inicial) });
            rows.push({ tipo: 'normal', col1: 'SALDO INICIAL EN CAJA GENERAL', col2: '', col3: formatQ(d.saldo_inicial_caja), col4: '' });
            rows.push({ tipo: 'normal', col1: 'SALDO INICIAL EN BANCO', col2: '', col3: formatQ(d.saldo_inicial_bancos), col4: '' });

            // INGRESOS
            rows.push({ tipo: 'heading', col1: 'INGRESOS', col2: '', col3: '', col4: formatQ(d.total_general_ingresos) });
            rows.push({ tipo: 'heading', col1: 'ACTIVO', col2: '', col3: '', col4: '' });

            // CAJA GENERAL
            rows.push({ tipo: 'heading', col1: 'CAJA GENERAL', col2: '', col3: formatQ(d.total_ingresos_caja), col4: '' });

            const caja_corriente = getItems(d, d.data_caja, 'activos', 'corriente', 'ingresos');
            caja_corriente.forEach((it) => rows.push({ tipo: 'normal', col1: it.cuenta, col2: formatQ(it.ingresos), col3: '', col4: '' }));

            rows.push({ tipo: 'heading', col1: 'NO CORRIENTE', col2: '', col3: '', col4: '' });
            const caja_no = getItems(d, d.data_caja, 'activos', 'no_corriente', 'ingresos');
            caja_no.forEach((it) => rows.push({ tipo: 'normal', col1: it.cuenta, col2: formatQ(it.ingresos), col3: '', col4: '' }));

            // BANCOS
            rows.push({ tipo: 'heading', col1: 'BANCOS', col2: '', col3: formatQ(d.total_ingresos_bancos), col4: '' });
            const bancos_corriente = getItems(d, d.data_bancos, 'activos', 'corriente', 'ingresos');
            bancos_corriente.forEach((it) => rows.push({ tipo: 'normal', col1: it.cuenta, col2: formatQ(it.ingresos), col3: '', col4: '' }));
            rows.push({ tipo: 'heading', col1: 'NO CORRIENTE', col2: '', col3: '', col4: '' });
            const bancos_no = getItems(d, d.data_bancos, 'activos', 'no_corriente', 'ingresos');
            bancos_no.forEach((it) => rows.push({ tipo: 'normal', col1: it.cuenta, col2: formatQ(it.ingresos), col3: '', col4: '' }));

            // EGRESOS
            rows.push({ tipo: 'heading', col1: 'EGRESOS', col2: '', col3: '', col4: formatQ(d.total_general_egresos) });
            rows.push({ tipo: 'heading', col1: 'PASIVO', col2: '', col3: '', col4: '' });

            // CAJA GENERAL (egresos)
            rows.push({ tipo: 'heading', col1: 'CAJA GENERAL', col2: '', col3: formatQ(d.total_egresos_caja), col4: '' });
            const caja_corriente_e = getItems(d, d.data_caja, 'pasivos', 'corriente', 'egresos');
            caja_corriente_e.forEach((it) => rows.push({ tipo: 'normal', col1: it.cuenta, col2: formatQ(it.egresos), col3: '', col4: '' }));
            rows.push({ tipo: 'heading', col1: 'NO CORRIENTE', col2: '', col3: '', col4: '' });
            const caja_no_e = getItems(d, d.data_caja, 'pasivos', 'no_corriente', 'egresos');
            caja_no_e.forEach((it) => rows.push({ tipo: 'normal', col1: it.cuenta, col2: formatQ(it.egresos), col3: '', col4: '' }));

            // BANCOS (egresos)
            rows.push({ tipo: 'heading', col1: 'BANCOS', col2: '', col3: formatQ(d.total_egresos_bancos), col4: '' });
            const bancos_corriente_e = getItems(d, d.data_bancos, 'pasivos', 'corriente', 'egresos');
            bancos_corriente_e.forEach((it) => rows.push({ tipo: 'normal', col1: it.cuenta, col2: formatQ(it.egresos), col3: '', col4: '' }));
            rows.push({ tipo: 'heading', col1: 'NO CORRIENTE', col2: '', col3: '', col4: '' });
            const bancos_no_e = getItems(d, d.data_bancos, 'pasivos', 'no_corriente', 'egresos');
            bancos_no_e.forEach((it) => rows.push({ tipo: 'normal', col1: it.cuenta, col2: formatQ(it.egresos), col3: '', col4: '' }));

            // Saldo final
            rows.push({ tipo: 'heading', col1: 'SALDO FINAL', col2: '', col3: '', col4: formatQ(d.total_saldo_final) });
            rows.push({ tipo: 'normal', col1: 'SALDO FINAL EN CAJA GENERAL', col2: '', col3: formatQ(d.total_saldo_final_caja), col4: '' });
            rows.push({ tipo: 'normal', col1: 'SALDO FINAL EN BANCO', col2: '', col3: formatQ(d.total_saldo_final_bancos), col4: '' });
            rows.push({ tipo: 'heading', col1: 'SUMAS IGUALES', col2: '', col3: formatQ(d.total_saldo_final), col4: formatQ(d.total_saldo_final) });

            return rows;
        });

        const limpiar = () => {
            selectedPeriodo.value = '';
            selectedMes.value = '';
            meses.value = [];
            reporteData.value = null;
        };

        const mostrarTabla = async () => {
            try {
                const response = await axios.post(
                    'http://127.0.0.1:8000/in_eg/reporteGeneralAG',
                    {
                        tipo: selectedPeriodo.value.toLowerCase(),
                        mes: selectedMes.value.toLowerCase()
                    }
                );

                reporteData.value = response.data || null;
            } catch (error) {
                console.error('Error al obtener datos del reporte:', error);
                reporteData.value = null;
            }
        };

        const generarPDF = async () => {
            try {
                const response = await axios.post(
                    'http://127.0.0.1:8000/in_eg/reporteGeneralAG',
                    {
                        tipo: selectedPeriodo.value.toLowerCase(),
                        mes: selectedMes.value.toLowerCase()
                    }
                );
                const data = response.data;

                const doc = new jsPDF();
                let yOffset = 20;
                const pageHeight = doc.internal.pageSize.height;
                const pageMargin = 20;

                const addPageIfNeeded = () => {
                    if (yOffset > pageHeight - pageMargin) {
                        doc.addPage();
                        yOffset = 20;
                    }
                };

                const addTable = (head, body) => {
                    doc.autoTable({
                        head: [head],
                        body: body,
                        startY: yOffset,
                        theme: 'grid',
                        styles: {
                            cellPadding: 2.5,
                            fontSize: 8,
                            halign: 'center',
                            valign: 'middle',
                            overflow: 'linebreak'
                        },
                        headStyles: {
                            fillColor: [41, 128, 185],
                            textColor: [255, 255, 255]
                        }
                    });
                    yOffset = doc.autoTable.previous.finalY + 10;
                };

                let periodoTextoPDF = '';
                if (selectedPeriodo.value === 'Mensual') {
                    periodoTextoPDF = `RESUMEN DE ${selectedMes.value.toUpperCase()}`;
                } else if (selectedPeriodo.value === 'Trimestral') {
                    const trimestre = {
                        Enero: 'PRIMER TRIMESTRE',
                        Abril: 'SEGUNDO TRIMESTRE',
                        Julio: 'TERCER TRIMESTRE',
                        Octubre: 'CUARTO TRIMESTRE'
                    };
                    periodoTextoPDF = `RESUMEN ${trimestre[selectedMes.value] || ''
                        }`;
                } else if (selectedPeriodo.value === 'Semestral') {
                    periodoTextoPDF =
                        selectedMes.value === 'Enero'
                            ? 'RESUMEN PRIMER SEMESTRE'
                            : 'RESUMEN SEGUNDO SEMESTRE';
                } else if (selectedPeriodo.value === 'Anual') {
                    periodoTextoPDF = 'RESUMEN ANUAL';
                }

                // Encabezado PDF
                doc.setFontSize(16);
                doc.text(
                    `REPORTE FINAL ${selectedPeriodo.value.toUpperCase()} ${currentYear}`,
                    105,
                    27,
                    { align: 'center' }
                );
                doc.setLineWidth(0.5);
                doc.line(60, 32, 150, 32);

                doc.setFontSize(12);
                yOffset = 40;
                doc.text(`INFORME CORRESPONDIENTE AL`, 20, 40);
                doc.text(periodoTextoPDF, 91, 40);
                doc.text(`DE`, 165, 40);
                doc.text(`${currentYear}`, 175, 40);
                doc.text(
                    `PROYECTO AGRÍCOLA HOGAR SANTA LUISA`,
                    20,
                    50
                );
                doc.text(`LUGAR:`, 130, 50);
                doc.text(`QUETZALTENANGO`, 155, 50);
                doc.text(`GUATEMALA`, 20, 60);
                doc.text(`FECHA:`, 130, 60);
                doc.text(fechaHoy, 160, 60);

                yOffset = 75;

                const tableData = [];

                // SALDO INICIAL
                tableData.push(['SALDO INICIAL', '', '', formatQ(data.saldo_inicial)]);
                tableData.push(['SALDO INICIAL EN CAJA GENERAL', '', formatQ(data.saldo_inicial_caja), '']);
                tableData.push(['SALDO INICIAL EN BANCO', '', formatQ(data.saldo_inicial_bancos), '']);

                // INGRESOS / ACTIVOS
                tableData.push(['INGRESOS', '', '', formatQ(data.total_general_ingresos)]);
                tableData.push(['ACTIVO', '', '', '']);

                tableData.push(['CAJA GENERAL', '', formatQ(data.total_ingresos_caja), '']);
                const caja_corriente = getItems(data, data.data_caja, 'activos', 'corriente', 'ingresos');
                caja_corriente.forEach((it) => tableData.push([it.cuenta, formatQ(it.ingresos), '', '']));
                tableData.push(['NO CORRIENTE', '', '', '']);
                const caja_no = getItems(data, data.data_caja, 'activos', 'no_corriente', 'ingresos');
                caja_no.forEach((it) => tableData.push([it.cuenta, formatQ(it.ingresos), '', '']));

                tableData.push(['BANCOS', '', formatQ(data.total_ingresos_bancos), '']);
                const bancos_corriente = getItems(data, data.data_bancos, 'activos', 'corriente', 'ingresos');
                bancos_corriente.forEach((it) => tableData.push([it.cuenta, formatQ(it.ingresos), '', '']));
                tableData.push(['NO CORRIENTE', '', '', '']);
                const bancos_no = getItems(data, data.data_bancos, 'activos', 'no_corriente', 'ingresos');
                bancos_no.forEach((it) => tableData.push([it.cuenta, formatQ(it.ingresos), '', '']));

                // EGRESOS / PASIVOS
                tableData.push(['EGRESOS', '', '', formatQ(data.total_general_egresos)]);
                tableData.push(['PASIVO', '', '', '']);

                tableData.push(['CAJA GENERAL', '', formatQ(data.total_egresos_caja), '']);
                const caja_corriente_e = getItems(data, data.data_caja, 'pasivos', 'corriente', 'egresos');
                caja_corriente_e.forEach((it) => tableData.push([it.cuenta, formatQ(it.egresos), '', '']));
                tableData.push(['NO CORRIENTE', '', '', '']);
                const caja_no_e = getItems(data, data.data_caja, 'pasivos', 'no_corriente', 'egresos');
                caja_no_e.forEach((it) => tableData.push([it.cuenta, formatQ(it.egresos), '', '']));

                tableData.push(['BANCOS', '', formatQ(data.total_egresos_bancos), '']);
                const bancos_corriente_e = getItems(data, data.data_bancos, 'pasivos', 'corriente', 'egresos');
                bancos_corriente_e.forEach((it) => tableData.push([it.cuenta, formatQ(it.egresos), '', '']));
                tableData.push(['NO CORRIENTE', '', '', '']);
                const bancos_no_e = getItems(data, data.data_bancos, 'pasivos', 'no_corriente', 'egresos');
                bancos_no_e.forEach((it) => tableData.push([it.cuenta, formatQ(it.egresos), '', '']));

                // SALDO FINAL
                tableData.push(['SALDO FINAL', '', '', formatQ(data.total_saldo_final)]);
                tableData.push(['SALDO FINAL EN CAJA GENERAL', '', formatQ(data.total_saldo_final_caja), '']);
                tableData.push(['SALDO FINAL EN BANCO', '', formatQ(data.total_saldo_final_bancos), '']);
                tableData.push(['SUMAS IGUALES', '', formatQ(data.total_saldo_final), formatQ(data.total_saldo_final)]);

                // Encabezado columnas
                const tableHeaders = [
                    'Descripción',
                    'Detalle',
                    'Saldo suma',
                    'Suma'
                ];

                addTable(tableHeaders, tableData);

                // firmas removed for this report

                const blob = doc.output('blob');
                saveAs(blob, 'reporte_final_agrícola.pdf');
            } catch (error) {
                console.error('Error al generar el PDF:', error);
            }
        };

        return {
            selectedPeriodo,
            selectedMes,
            periodos,
            meses,
            reporteData,
            currentYear,
            fechaHoy,
            periodoTexto,
            tablaPreview,
            actualizarMeses,
            limpiar,
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

.division-container {
    border: 1px solid rgb(19, 19, 75);
    border-radius: 6px;
    padding: 12px 16px;
    margin-top: 10px;
    background-color: #fff;
}

.nombre-fecha-container {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    width: 100%;
}

.id-inputs {
    flex: 1;
    min-width: 260px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.select-group {
    flex: 1 1 120px;
    min-width: 140px;
}

.nombre-inputs {
    flex: 2;
    min-width: 300px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.numero-input {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 200px;
}

label {
    font-size: 0.8rem;
    font-weight: 500;
    color: #333;
    margin-bottom: 4px;
    display: block;
}

input[type='text'],
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

/* Encabezado visual */
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
    min-width: 600px;
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

.tabla-libro tbody td.bold-text {
    font-weight: 600;
}

.right {
    text-align: right !important;
}

/* Firmas */
.firmas-wrapper {
    margin-top: 30px;
    display: flex;
    flex-wrap: wrap;
    gap: 24px;
    justify-content: space-evenly;
    text-align: center;
    font-size: 0.8rem;
    color: #000;
}

.firma-col {
    min-width: 200px;
}

.firma-line {
    margin-bottom: 8px;
    font-size: 0.8rem;
    color: #000;
}

.firma-nombre {
    font-weight: 600;
}

.firma-cargo {
    font-size: 0.7rem;
    color: #333;
}

.sin-datos {
    margin-top: 30px;
    font-size: 0.9rem;
    color: #555;
    text-align: center;
    font-style: italic;
}
</style>