<template>
  <div class="dashboard-wrapper">
      <!-- Encabezado con logo y título -->
      <div class="project-header">
        <img
          src="@/assets/brand/logoComp.png"
          alt="Logo Hogar Santa Luisa de Marillac"
          class="project-logo"
        />
        <div class="project-title-block">
          <h1 class="project-title">PROYECTO AGRÍCOLA</h1>
          <p class="project-subtitle">
            Hogar de Ancianas "Santa Luisa de Marillac"
          </p>
          <div class="project-divider"></div>
        </div>
      </div>
      </div>

      <!-- Contenido principal: imágenes -->
      <div class="project-content">
        <div class="project-main-image-wrapper">
          <img
            src="@/assets/brand/hogar12.jpg"
            alt="Entrada del Hogar"
            class="project-main-image"
          />
        </div>
        <div class="project-side-content">
          <img
            src="@/assets/brand/hogar123.jpg"
            alt="Residentes del hogar"
            class="project-side-image"
          />
          <div class="project-text-box">
            <p>
              Proyecto enfocado en el acompañamiento y sostenimiento agrícola
              del Hogar, buscando apoyar el bienestar integral de las
              residentes.
            </p>
          </div>
        </div>
      </div>

      <!-- Pie de página -->
      <div class="project-footer">
    
      </div>
    
 
</template>

<script>
import WidgetsStatsA from './../widgets/WidgetsStatsTypeA.vue'
import WidgetsStatsD from './../widgets/WidgetsStatsTypeD.vue'


import '../../styles/css/dashboard.css'

export default {
  name: 'Dashboard',
  components: {
    WidgetsStatsA,
    WidgetsStatsD,
  },
  setup() {
    return {}
  },
}
</script>


