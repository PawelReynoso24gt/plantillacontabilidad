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
                      :disabled="isSubmitting"
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
                      :disabled="isSubmitting"
                    />
                  </CInputGroup>
                  <CInputGroup class="mb-4">
                    <CInputGroupText>
                      <CIcon icon="cil-project" />
                    </CInputGroupText>
                    <select v-model="tipoProyecto" class="form-select" :disabled="isSubmitting">
                      <option :value="null" disabled>Seleccionar tipo de proyecto</option>
                      <option value="agricola">Proyecto Agrícola</option>
                      <option value="capilla">Proyecto Capilla</option>
                    </select>
                  </CInputGroup>
                  <CRow>
                    <CCol :xs="6">
                      <CButton type="submit" color="primary" class="px-4" :disabled="isSubmitting || submitCountdown > 0">Login</CButton>
                    </CCol>
                  </CRow>
                  <p v-if="errorMessage" class="text-danger mt-3">{{ errorMessage }}</p>
                  <p v-if="submitCountdown > 0" class="text-warning mt-3">
                    Por favor, espera {{ submitCountdown }} segundos antes de intentar nuevamente.
                  </p>
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

export default {
  name: 'Login',
  setup() {
    const usuarios = ref('');
    const contrasenias = ref('');
    const tipoProyecto = ref(null);
    const errorMessage = ref('');
    const isSubmitting = ref(false);
    const submitCountdown = ref(0);
    const router = useRouter();
    const store = useStore();

    const validateAndSanitizeInput = (input) => {
      const sanitizedInput = input.replace(/['"]/g, '');
      if (sanitizedInput.length > 0 && sanitizedInput.length <= 100) {
        return sanitizedInput;
      } else {
        throw new Error('Entrada no válida');
      }
    };

    const login = () => {
      if (isSubmitting.value || submitCountdown.value > 0) {
        return;
      }

      try {
        const safeUsuarios = validateAndSanitizeInput(usuarios.value);
        const safeContrasenias = validateAndSanitizeInput(contrasenias.value);
        const safeTipoProyecto = validateAndSanitizeInput(tipoProyecto.value);

        if (!safeUsuarios || !safeContrasenias || !safeTipoProyecto) {
          errorMessage.value = 'Todos los campos son obligatorios.';
          return;
        }

        if (safeUsuarios !== 'honey' || safeContrasenias !== 'honey1313') {
          errorMessage.value = 'Usuario o contraseña incorrectos.';
          return;
        }

        isSubmitting.value = true;
        errorMessage.value = '';

        // Simular autenticación exitosa
        const projectToken = safeTipoProyecto === 'agricola' ? '1' : '2';
        store.dispatch('updateSelectedProject', safeTipoProyecto === 'agricola' ? 'Proyecto Agrícola' : 'Proyecto Capilla');
        store.dispatch('updateProjectToken', projectToken);

        // Redirigir a la ruta a la que el usuario intentaba acceder o al dashboard por defecto
        const redirectPath = router.currentRoute.value.query.redirect || '/honey123';
        router.push(redirectPath);

      } catch (error) {
        errorMessage.value = error.message || 'Error de inicio de sesión. Por favor, intenta nuevamente.';
      } finally {
        isSubmitting.value = false;
      }
    };

    const startCountdown = () => {
      submitCountdown.value = 60; // 60 segundos de espera
      const interval = setInterval(() => {
        if (submitCountdown.value > 0) {
          submitCountdown.value--;
        } else {
          clearInterval(interval);
        }
      }, 1000);
    };

    return { usuarios, contrasenias, tipoProyecto, login, errorMessage, isSubmitting, submitCountdown, validateAndSanitizeInput };
  },
};
</script>
