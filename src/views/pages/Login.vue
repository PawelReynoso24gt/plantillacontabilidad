<template>
  <div class="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
    <CContainer>
      <CRow class="justify-content-center">
        <CCol :md="8">
          <CCardGroup>
            <CCard class="p-4">
              <CCardBody>
                <CForm @submit.prevent="login">
                  <h1>Login</h1>
                  <p class="text-body-secondary">Inicia sesión con tu usuario!</p>
                  <CInputGroup class="mb-3">
                    <CInputGroupText>
                      <CIcon icon="cil-user" />
                    </CInputGroupText>
                    <!-- Asegúrate de que el slot está dentro de CFormInput -->
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
                    <!-- Asegúrate de que el slot está dentro de CFormInput -->
                    <CFormInput
                      v-model="contrasenias"
                      type="password"
                      placeholder="Contraseña"
                      autocomplete="contrasenias"
                    />
                  </CInputGroup>
                  <!-- Agregar combobox para seleccionar tipo de proyecto -->
                  <CInputGroup class="mb-4">
                    <CInputGroupText>
                      <CIcon icon="cil-project" />
                    </CInputGroupText>
                    <select v-model="tipoProyecto" class="form-select">
                      <option :value="null" disabled>Seleccionar tipo de proyecto</option>
                      <option value="Proyecto Agrícola">Proyecto Agrícola</option>
                      <option value="Proyecto Capilla">Proyecto Capilla</option>
                    </select>
                  </CInputGroup>
                  <CRow>
                    <CCol :xs="6">
                      <CButton type="submit" color="primary" class="px-4"> Login </CButton>
                    </CCol>
                    <CCol :xs="6" class="text-right">
                      <CButton color="link" class="px-0">
                        ¿Olvidaste tu contraseña?
                      </CButton>
                    </CCol>
                  </CRow>
                </CForm>
              </CCardBody>
            </CCard>
            <CCard class="text-white bg-primary py-5" style="width: 44%">
              <CCardBody class="text-center">
                <div>
                  <h2>Registrarse</h2>
                  <p>
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit,
                    sed do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua.
                  </p>
                  <CButton color="light" variant="outline" class="mt-3">
                    ¡Regístrate ahora!
                  </CButton>
                </div>
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
import axios from 'axios';

export default {
  name: 'Login',
  setup() {
    const usuarios = ref('');
    const contrasenias = ref('');
    const tipoProyecto = ref(null); // Variable para almacenar el tipo de proyecto seleccionado

    const router = useRouter();

    const login = async () => {
      try {
        console.log('Usuario:', usuarios.value);
        console.log('Contraseña:', contrasenias.value);
        console.log('Tipo de proyecto:', tipoProyecto.value); // Agrega esta línea para ver el tipo de proyecto seleccionado
        const response = await axios.post('http://127.0.0.1:8000/logins/authenticate', {
          usuarios: usuarios.value,
          contrasenias: contrasenias.value,
          tipoProyecto: tipoProyecto.value, // Envía el tipo de proyecto al servidor
        }); 
        if (response.status === 200) {
          console.log('Autenticación exitosa');
          localStorage.setItem('tipoUsuario', response.data.tipoUsuario);
          localStorage.setItem('token', response.data.token);
          // Redirigir al dashboard
          router.push('/dashboard');
        } else {
          console.error('Error de inicio de sesión: Datos de autenticación no válidos');
        }
      } catch (error) {
        console.error('Error de inicio de sesión:', error);
      }
    };

    // Opciones para el combobox de tipo de proyecto
    const opcionesTipoProyecto = [
      { value: 'agricola', text: 'Proyecto Agrícola' },
      { value: 'capilla', text: 'Proyecto Capilla' },
    ];

    return { usuarios, contrasenias, tipoProyecto, login, opcionesTipoProyecto };
  }
};
</script>
