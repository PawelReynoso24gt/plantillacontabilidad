<template>
  <div class="error-wrapper">
    <div class="error-card">
      
      <div class="error-icon-container">
        <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      </div>

      <h1 class="error-code">504</h1>
      <h2 class="error-title">Tiempo de Espera Agotado</h2>
      <p class="error-message">
        El servidor tardó demasiado en responder a tu solicitud. Esto puede deberse a una conexión lenta o a una sobrecarga temporal en el sistema.
      </p>

      <button @click="regresar" class="btn-primary">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        Regresar a la página anterior
      </button>

    </div>
  </div>
</template>

<script setup>
  import { useRouter } from 'vue-router';

  const router = useRouter();

  const regresar = () => {
    router.go(-1); // Esto hace exactamente lo mismo: volver 1 paso atrás
  };
</script>

<style scoped>
/* =========================================
   RESET BÁSICO (Aplicado solo a este componente)
========================================= */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* =========================================
   CONTENEDORES PRINCIPALES
========================================= */
.error-wrapper {
  background-color: #f7f7f7;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2.5rem 1.5rem;
}

.error-card {
  background-color: #ffffff;
  border-radius: 18px;
  padding: 3.5rem 2.5rem;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  text-align: center;
  animation: slideUp 0.5s ease-out;
  position: relative;
  overflow: hidden;
}

/* Borde superior decorativo dorado */
.error-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 6px;
  background: linear-gradient(90deg, #a0834e, #bd9f69);
}

/* =========================================
   TEXTOS E ICONOS
========================================= */
.error-icon-container {
  color: #292b57;
  margin-bottom: 1.5rem;
  animation: float 3s ease-in-out infinite;
}

.error-code {
  font-size: 6rem;
  font-weight: 800;
  color: #292b57; /* azul oscuro */
  line-height: 1;
  margin-bottom: 0.5rem;
  letter-spacing: -2px;
}

.error-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #292b57;
  margin-bottom: 1rem;
}

.error-message {
  font-size: 0.95rem;
  color: #6c757d;
  margin-bottom: 2rem;
  line-height: 1.6;
}

/* =========================================
   BOTONES
========================================= */
.btn-primary {
  background: #a0834e;
  color: #ffffff;
  border-radius: 999px;
  padding: 0.6rem 1.8rem;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease, box-shadow 0.2s ease, transform 0.1s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-decoration: none;
}

.btn-primary:hover {
  background: #bd9f69;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.25);
  transform: translateY(-1px);
}

/* =========================================
   ANIMACIONES
========================================= */
@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(30px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
}

/* =========================================
   RESPONSIVO
========================================= */
@media (max-width: 768px) {
  .error-card {
    padding: 2.5rem 1.5rem;
  }
  .error-code {
    font-size: 5rem;
  }
  .error-title {
    font-size: 1.25rem;
  }
}
</style>