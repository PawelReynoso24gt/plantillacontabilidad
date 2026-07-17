<template>
  <div class="thanks-page">
    <div class="thanks-decor thanks-decor--left" aria-hidden="true"></div>
    <div class="thanks-decor thanks-decor--right" aria-hidden="true"></div>

    <div class="thanks-header">
      <h1 class="thanks-title">Desarrollado por:</h1>

      <div class="thanks-icon-badge">
        <CIcon icon="cil-code" size="lg" />
      </div>

    </div>

    <div class="developers-list">
      <div
        class="developer-card"
        v-for="(developer, index) in developers"
        :key="index"
      >
        <div class="photo">
          <img
            :src="developer.photo"
            :style="{ objectPosition: developer.photoPosition || 'center' }"
            alt="Foto del Desarrollador"
          />
        </div>

        <div class="description">
          <h3 class="dev-name">
            {{ developer.name }}
          </h3>

          <p class="dev-description">
            {{ developer.description }}
          </p>

          <!-- Aviso de inactividad -->
          <p v-if="developer.inactive" class="inactive-label">
            Actualmente inactiva
          </p>
        </div>

        <div class="dev-badge">
          <CIcon icon="cil-code" />
        </div>
      </div>
    </div>

    <div class="thanks-banner">
      <div class="thanks-banner-icon">
        <CIcon icon="cil-star" />
      </div>
      <p class="thanks-banner-text">
        Desarrollado por ingenieros de la Universidad Mesoamericana
        Quetzaltenango, para el hogar de ancianas Santa Luisa de Marillac.
      </p>
    </div>
  </div>
</template>

<script>
import '../../styles/css/Desarrolladores.css'
import angelyPhoto from '../../assets/images/avatars/AngelyDeveloper.jpeg'
import pabloPhoto from '../../assets/images/avatars/photoPablo.jpg'
import pawelPhoto from '../../assets/images/avatars/PawelDeveloper.jpeg'

export default {
  name: 'Agradecimientos',
  data() {
    return {
      developers: [
        {
          name: 'Ing. Angely Esmeralda Vennayappillil Cortéz',
          photo: angelyPhoto,
          photoPosition: 'center 15%',
          description:
            'Nacida en Quetzaltenango, Guatemala, el 10 de noviembre de 2004. Egresada del Colegio IEA campus “Los Altos”, donde obtuvo el título de Bachiller en Ciencias Exactas con Orientación en Computación. Actualmente egresada de la carrera de Ingeniería en Sistemas, Informática y Ciencias de la Computación en la Universidad Mesoamericana, sede Quetzaltenango.',
          inactive: false
        },
        {
          name: 'Ing. Pablo Daniel Vásquez Monzón',
          photo: pabloPhoto,
          description:
            'Nacido en San Pedro Sacatepéquez, San Marcos, Guatemala, el 16 de diciembre de 2003. Egresado de Universidad Mesoamericana en la carrera de Ingeniería en Sistemas, Informática y Ciencias de la computación. Egresado del Colegio Pre Universitario Galileo en Bachiller en Computación con Orientación Científica.',
          inactive: false
        },
        {
          name: 'Ing. Pawel Alessandro Reynoso Marquez',
          photo: pawelPhoto,
          description:
            'Nacido en Santa Cruz del Quiché, Quiché, Guatemala, el 24 de julio de 2002. Actualmente egresado de la carrera de Ingeniería en Sistemas, Informática y Ciencias de la Computación en la Universidad Mesoamericana, sede Quetzaltenango, en 2025. Además, obtuvo el título de Perito Contador con Especialidad en Computación en el Colegio Evangélico Metodista "UTATLÁN" de Santa Cruz del Quiché en 2020.',
          inactive: false
        }
      ]
    }
  }
}
</script>
