<template>
  <div class="login-page min-vh-100 d-flex align-items-center justify-content-center">
    <CContainer>
      <CRow class="justify-content-center">
        <CCol :md="10" :lg="8">
          <CCardGroup class="login-card-group shadow-lg">
            <!-- Lado del logo / bienvenida -->
            <CCard class="login-card-brand d-none d-md-flex flex-column align-items-center justify-content-center">
              <!-- Cambia la ruta del logo según tu proyecto -->
              <img
                src="../../assets/brand/logoComp.png"
                alt="Logo"
                class="login-logo mb-4"
              />
            </CCard>

            <!-- Lado del formulario -->
            <CCard class="login-card-form p-4">
              <CCardBody>
                <CForm @submit.prevent="login">
                  <div class="text-center mb-4 d-md-none">
                    <!-- Logo visible también en pantallas pequeñas -->
                    <img
                       src="../../assets/brand/logoComp.png"
                      alt="Logo"
                      class="login-logo mb-3"
                    />
                  </div>

                  <h1 class="login-title mb-2">Inicia sesión</h1>
                  <p class="login-subtitle mb-4">
                    Usa tu usuario, contraseña y selecciona el proyecto.
                  </p>

                  <CInputGroup class="mb-3">
                    <CInputGroupText class="input-icon">
                      <font-awesome-icon :icon="['fas', 'user']" />
                    </CInputGroupText>
                    <CFormInput
                      v-model="usuarios"
                      placeholder="Usuario"
                      autocomplete="usuarios"
                      class="login-input"
                    />
                  </CInputGroup>

                  <CInputGroup class="mb-3">
                    <CInputGroupText class="input-icon">
                      <font-awesome-icon :icon="['fas', 'lock']" />
                    </CInputGroupText>
                    <CFormInput
                      :type="showPassword ? 'text' : 'password'"
                      v-model="contrasenias"
                      placeholder="Contraseña"
                      autocomplete="contrasenias"
                      class="login-input"
                    />
                    <CInputGroupText
                      class="input-icon input-icon-clickable"
                      @click="togglePasswordVisibility"
                    >
                      <font-awesome-icon :icon="['fas', showPassword ? 'eye-slash' : 'eye']" />
                    </CInputGroupText>
                  </CInputGroup>

                  <CInputGroup class="mb-4">
                    <CInputGroupText class="input-icon">
                      <font-awesome-icon :icon="['fas', 'project-diagram']" />
                    </CInputGroupText>
                    <select
                      v-model="tipoProyecto"
                      class="form-select login-input"
                    >
                      <option :value="null" disabled>Seleccionar tipo de proyecto</option>
                      <option value="agricola">Proyecto Agrícola</option>
                      <option value="capilla">Proyecto Capilla</option>
                    </select>
                  </CInputGroup>

                  <p v-if="error" class="text-danger mb-3">
                    {{ error }}
                  </p>

                  <CRow class="align-items-center">
                    <CCol :xs="6">
                      <CButton type="submit" color="primary" class="px-4 login-btn">
                        Login
                      </CButton>
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
// importa tu css global de login
import '../../styles/css/LoginPrincipal.css';

export default {
  name: 'Login',
  setup() {
    const usuarios = ref('');
    const contrasenias = ref('');
    const tipoProyecto = ref(null);
    const showPassword = ref(false);
    const error = ref('');
    const router = useRouter();
    const store = useStore();

    const togglePasswordVisibility = () => {
      showPassword.value = !showPassword.value;
    };

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
          localStorage.setItem('tipoProyecto', tipoProyecto.value);
          const projectToken = tipoProyecto.value === 'agricola' ? '1' : '2';

          store.dispatch(
            'updateSelectedProject',
            tipoProyecto.value === 'agricola' ? 'Proyecto Agrícola' : 'Proyecto Capilla'
          );
          store.dispatch('updateProjectToken', projectToken);

          if (tipoProyecto.value === 'agricola') {
            router.push('/theme/colors');
          } else if (tipoProyecto.value === 'capilla') {
            router.push('/honey123');
          }
        } else {
          console.error('Error de inicio de sesión: Datos de autenticación no válidos');
          error.value = 'Datos de autenticación no válidos';
        }
      } catch (err) {
        console.error('Error de inicio de sesión:', err);
        if (err.response && err.response.status === 403) {
          error.value = 'Este usuario no está habilitado';
        } else {
          error.value = 'Error de inicio de sesión. Por favor, inténtelo de nuevo.';
        }
      }
    };

    return {
      usuarios,
      contrasenias,
      tipoProyecto,
      showPassword,
      error,
      togglePasswordVisibility,
      login,
    };
  },
};
</script>