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
        <div class="project-eyebrow-icon">
          <CIcon icon="cil-home" size="xl" />
        </div>
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
          <div class="project-text-icon">
            <CIcon icon="cil-home" />
          </div>
          <p>
            Proyecto enfocado en el acompañamiento y sostenimiento del Hogar,
            buscando apoyar el bienestar integral de las residentes.
          </p>
        </div>
      </div>
    </div>

    <!-- Tarjetas de valores -->
    <div class="project-features">
      <div class="feature-card">
        <div class="feature-card-header">
          <div class="feature-icon">
            <CIcon icon="cil-leaf" size="lg" />
          </div>
          <h3>Sostenimiento</h3>
        </div>
        <p>Generación de recursos para el funcionamiento del Hogar.</p>
      </div>

      <div class="feature-card">
        <div class="feature-card-header">
          <div class="feature-icon">
            <CIcon icon="cil-heart" size="lg" />
          </div>
          <h3>Acompañamiento</h3>
        </div>
        <p>Apoyo constante al bienestar de las residentes.</p>
      </div>

      <div class="feature-card">
        <div class="feature-card-header">
          <div class="feature-icon">
            <CIcon icon="cil-home" size="lg" />
          </div>
          <h3>Compromiso</h3>
        </div>
        <p>Trabajo con amor y responsabilidad por una mejor calidad de vida.</p>
      </div>
    </div>

    <!-- Franja de créditos -->
    <div class="project-banner">
      <div class="project-banner-icon">
        <CIcon icon="cil-school" />
      </div>
      <p>Hecho por: Estudiantes de la Universidad Mesoamericana 2024</p>
    </div>
  </div>
</template>

<script>
import '../../styles/css/DashboardC.css'

export default {
  name: 'DashboardCapilla',
}
</script>
