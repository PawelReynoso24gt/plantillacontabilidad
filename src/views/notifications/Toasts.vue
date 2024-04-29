<template>
  <b-container fluid>
    <form>
      <div class="col-md-12 mb-3">
        <label for="tipo">Tipo</label>
        <input
          required
          type="text"
          class="form-control"
          id="tipo"
          v-model.trim="$v.form.tipo.$model"
          :state="!$v.form.tipo.$error"
          placeholder="tipo..."
        >
      </div>
    </form>
    <div>
      <button class="btn btn-primary" type="button" @click="onSave">Guardar</button>
      <button class="btn btn-danger" type="button" @click="closeModal('save')">Cancelar</button>
    </div>
    <b-row>
      <b-col md="12">
        <iq-card>
          <template v-slot:headerAction>
            <button class="btn btn-primary" @click="mostrarModal1">AGREGAR NUEVO TIPO</button>
          </template>
          <template v-slot:body>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <th>Tipo</th>
              </thead>
              <tbody>
                <tr v-for="datos in datosPosts" :key="datos.id">
                  <td v-text="datos.tipo"></td>
                </tr>
              </tbody>
            </table>
          </template>
        </iq-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import axios from 'axios'
import { apiUrl, laravelUrl } from '../../config/constant'
import useVuelidate from '@vuelidate/core'
import { required } from '@vuelidate/validators'

export default {
  name: 'Clasificacion',
  setup() {
    return { $v: useVuelidate() }
  },
  data() {
    return {
      form: {
        id: 0,
        tipo: ''
      },
      datosPosts: [],
    }
  },
  methods: {
    mostrarModal1() {
      // Aquí podrías mostrar un modal personalizado utilizando CSS o alguna otra librería de tu elección
    },
    closeModal(action) {
      // Aquí puedes definir la lógica para cerrar el modal o realizar alguna acción específica
    },
    onSave() {
      axios.post(laravelUrl + '/clasificacion/create', {
          tipo: this.form.tipo
        })
        .then(response => {
          this.getDatos()
          // Aquí podrías cerrar el modal si es necesario
        })
        .catch(error => {
          console.error('Error!', error)
        })
    },
    getDatos() {
      axios.get(laravelUrl + '/clasificacion/get')
        .then(response => {
          this.datosPosts = response.data
        })
        .catch(error => {
          console.error('Error al obtener los datos', error)
        })
    }
  },
  validations() {
    return {
      form: {
        tipo: { required }
      }
    }
  },
  mounted() {
    this.getDatos()
  },
}
</script>
