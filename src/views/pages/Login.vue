<template>
  <div class="login-page min-vh-100 d-flex align-items-center justify-content-center">
    <CContainer>
      <CRow class="justify-content-center">
        <CCol :md="10" :lg="8">
          <CCardGroup class="login-card-group shadow-lg">
            <!-- Lado del logo / bienvenida -->
            <CCard class="login-card-brand d-none d-md-flex flex-column align-items-center justify-content-center">
              <!-- Cambia la ruta del logo según tu proyecto -->
              <img src="../../assets/brand/logoComp.png" alt="Logo" class="login-logo mb-4" />
            </CCard>

            <!-- Lado del formulario -->
            <CCard class="login-card-form p-4">
              <CCardBody>
                <CForm @submit.prevent="login">
                  <div class="text-center mb-4 d-md-none">
                    <!-- Logo visible también en pantallas pequeñas -->
                    <img src="../../assets/brand/logoComp.png" alt="Logo" class="login-logo mb-3" />
                  </div>

                  <h1 class="login-title mb-2">Inicia sesión</h1>
                  <p class="login-subtitle mb-4">
                    Usa tu usuario, contraseña y selecciona el proyecto.
                  </p>

                  <div class="mb-3">
                    <CInputGroup>
                      <CInputGroupText class="input-icon">
                        <font-awesome-icon :icon="['fas', 'user']" />
                      </CInputGroupText>
                      <CFormInput v-model="usuarios" placeholder="Usuario" autocomplete="usuarios" class="login-input" />
                    </CInputGroup>
                    <small v-if="fieldErrors.usuarios" class="error-text">{{ fieldErrors.usuarios }}</small>
                  </div>
                  <div class="mb-3">
                    <CInputGroup>
                      <CInputGroupText class="input-icon">
                        <font-awesome-icon :icon="['fas', 'lock']" />
                      </CInputGroupText>
                      <CFormInput :type="showPassword ? 'text' : 'password'" v-model="contrasenias"
                        placeholder="Contraseña" autocomplete="contrasenias" class="login-input" />
                      <CInputGroupText class="input-icon input-icon-clickable" @click="togglePasswordVisibility">
                        <font-awesome-icon :icon="['fas', showPassword ? 'eye-slash' : 'eye']" />
                      </CInputGroupText>
                    </CInputGroup>
                    <small v-if="fieldErrors.contrasenias" class="error-text">{{ fieldErrors.contrasenias }}</small>
                  </div>
                  <div class="mb-4">
                    <CInputGroup>
                      <CInputGroupText class="input-icon">
                        <font-awesome-icon :icon="['fas', 'project-diagram']" />
                      </CInputGroupText>
                      <select v-model="tipoProyecto" class="form-select login-input">
                        <option :value="null" disabled>Seleccionar tipo de proyecto</option>
                        <option value="agricola">Proyecto Agrícola</option>
                        <option value="capilla">Proyecto Capilla</option>
                      </select>
                    </CInputGroup>
                    <small v-if="fieldErrors.tipoProyecto" class="error-text">{{ fieldErrors.tipoProyecto }}</small>
                  </div>
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
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import axios from 'axios';
import { manejarErrorRuta } from '../../../utils/manejarErrores.js';
// importa tu css global de login
import '../../styles/css/LoginPrincipal.css';
import '../../styles/css/GlobalAlertsModals.css';

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

    // Objeto para guardar el error específico de cada campo
    const fieldErrors = reactive({
      tipoProyecto: '',
      usuarios: '',
      contrasenias: ''
    });

    // Función que asigna el error y lo borra a los 5 segundos
    const mostrarErrorCampo = (campo, mensaje) => {
      fieldErrors[campo] = mensaje;
      setTimeout(() => {
        fieldErrors[campo] = '';
      }, 5000);
    };

    const login = async () => {
      let tieneErrores = false;

      // 1. Validaciones en línea antes de enviar
      if (!usuarios.value) { 
        mostrarErrorCampo('usuarios', 'Ingrese su nombre de usuario'); 
        tieneErrores = true; 
      }
      if (!contrasenias.value) { 
        mostrarErrorCampo('contrasenias', 'Ingrese su contraseña'); 
        tieneErrores = true; 
      }
      if (!tipoProyecto.value) { 
        mostrarErrorCampo('tipoProyecto', 'Seleccione un tipo de proyecto'); 
        tieneErrores = true; 
      }

      if (tieneErrores) return;

      try {
          error.value = '';
          //  console.log('Usuario:', usuarios.value);
          // console.log('Contraseña:', contrasenias.value);
          //console.log('Tipo de proyecto:', tipoProyecto.value);

          const response = await axios.post('http://127.0.0.1:8000/api/authenticate', {
            usuarios: usuarios.value,
            contrasenias: contrasenias.value,
            tipoProyecto: tipoProyecto.value,
          });

          if (response.status === 200) {
            //console.log('Full response:', response.data);
            store.dispatch('login', response.data.token);

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
          }
        } catch (err) {
        console.error('Error de inicio de sesión:', err?.response?.data || err.message);
        
        if (err.response) {
          // Errores del usuario (se quedan en la pantalla de login)
          if (err.response.status === 403) {
            error.value = 'Acceso Denegado: Este usuario no está habilitado en el sistema.';
          } 
          else if (err.response.status === 401 || err.response.status === 404) {
            error.value = 'Credenciales incorrectas. Verifique su usuario y contraseña.';
          } 
          // Errores del servidor (se van a la pantalla de error global)
          else {
            manejarErrorRuta(err, router);
          }
        } else {
          // Error de red (el backend está apagado o no hay internet)
          manejarErrorRuta(err, router);
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
      //////
      fieldErrors
    };
  },
};
</script>