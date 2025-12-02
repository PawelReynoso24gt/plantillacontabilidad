<template>
  <div class="capilla-container">
    <!-- Encabezado -->
    <div class="project-header">
      <img
        src="@/assets/brand/logoComp.png"
        alt="Logo Hogar Santa Luisa de Marillac"
        class="project-logo"
      />

      <div class="project-title-block">
        <h1 class="project-title">PROYECTO CAPILLA</h1>
        <p class="project-subtitle">
          Hogar de Ancianas "Santa Luisa de Marillac"
        </p>
        <div class="project-divider"></div>
      </div>
    </div>

    <!-- Contenido principal -->
    <div class="project-content">
      <div class="project-main-image-wrapper">
        <img
          src="@/assets/brand/hogar12.jpg"
          class="project-main-image"
        />
      </div>

      <div class="project-side-content">
        <img
          src="@/assets/brand/hogar123.jpg"
          class="project-side-image"
        />

        <div class="project-text-box">
          <p>
            Proyecto enfocado en el acompañamiento y sostenimiento del Hogar,
            buscando apoyar el bienestar integral de las residentes.
          </p>
        </div>
      </div>
    </div>

  </div>
</template>


<script>
import WidgetsStatsA from './../widgets/WidgetsStatsTypeA.vue'
import WidgetsStatsD from './../widgets/WidgetsStatsTypeD.vue'

import '../../styles/css/DashboardC.css'

export default {
  name: 'DashboardAgricola',
  components: {
    WidgetsStatsA,
    WidgetsStatsD,
  },
  setup() {
    return {}
  },
}
</script>
