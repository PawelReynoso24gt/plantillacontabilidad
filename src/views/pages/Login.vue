<template>
  <div class="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
    <CContainer>
      <CRow class="justify-content-center">
        <CCol :md="8">
          <CCardGroup>
            <CCard class="p-4">
              <CCardBody>
                <CForm @submit.prevent="login">
                  <h1>BIENVENIDOS!</h1>
                  <p class="text-body-secondary">Inicia sesión con tu usuario!</p>
                  <CInputGroup class="mb-3">
                    <CInputGroupText>
                      <CIcon icon="cil-user" />
                    </CInputGroupText>
                    <CFormInput
                      v-model="usuarios"
                      placeholder="Usuario"
                      autocomplete="usuarios"
                    />
                  </CInputGroup>
                  <CInputGroup class="mb-3">
                    <CInputGroupText>
                      <CIcon icon="cil-lock-locked" />
                    </CInputGroupText>
                    <CFormInput
                      v-model="contrasenias"
                      type="password"
                      placeholder="Contraseña"
                      autocomplete="contrasenias"
                    />
                  </CInputGroup>
                  <CInputGroup class="mb-4">
                    <CInputGroupText>
                      <CIcon icon="cil-project" />
                    </CInputGroupText>
                    <select v-model="tipoProyecto" class="form-select">
                      <option :value="null" disabled>Seleccionar tipo de proyecto</option>
                      <option value="agricola">Proyecto Agrícola</option>
                      <option value="capilla">Proyecto Capilla</option>
                    </select>
                  </CInputGroup>
                  <p v-if="error" class="text-danger">{{ error }}</p>
                  <CRow>
                    <CCol :xs="6">
                      <CButton type="submit" color="primary" class="px-4">Login</CButton>
                    </CCol>
                  </CRow>
                </CForm>
              </CCardBody>
            </CCard>
          </CCardGroup>
        </CCol>
      </CRow>
    </CContainer>
  </div>
</template>

<script>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import axios from 'axios';

export default {
  name: 'Login',
  setup() {
    const usuarios = ref('');
    const contrasenias = ref('');
    const tipoProyecto = ref(null);
    const error = ref('');
    const router = useRouter();
    const store = useStore();

    const login = async () => {
      if (!tipoProyecto.value) {
        error.value = 'Por favor, selecciona un tipo de proyecto';
        return;
      }

      try {
        error.value = '';
        console.log('Usuario:', usuarios.value);
        console.log('Contraseña:', contrasenias.value);
        console.log('Tipo de proyecto:', tipoProyecto.value);
        const response = await axios.post('http://127.0.0.1:8000/logins/authenticate', {
          usuarios: usuarios.value,
          contrasenias: contrasenias.value,
          tipoProyecto: tipoProyecto.value,
        });
        if (response.status === 200) {
          console.log('Autenticación exitosa');
          localStorage.setItem('token', response.data.token);
          const projectToken = tipoProyecto.value === 'agricola' ? '1' : '2';
          store.dispatch('updateSelectedProject', tipoProyecto.value === 'agricola' ? 'Proyecto Agrícola' : 'Proyecto Capilla');
          store.dispatch('updateProjectToken', projectToken);

          if (tipoProyecto.value === 'agricola') {
            router.push('/theme/colors');
          } else if (tipoProyecto.value === 'capilla') {
            router.push('/dashboard');
          }
        } else {         
          console.error('Error de inicio de sesión: Datos de autenticación no válidos');
        }
      } catch (error) {
        console.error('Error de inicio de sesión:', error);
        this.error.value = 'Error de inicio de sesión: Datos de autenticación no válidos';
      }
    };

    return { usuarios, contrasenias, tipoProyecto, error, login };
  },
};
</script>
