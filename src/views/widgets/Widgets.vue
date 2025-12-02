<template>
  <div class="thanks-page">
    <h1 class="thanks-title">Agradecimientos a los Desarrolladores</h1>

    <div class="developers-list">
      <div
        class="developer-card"
        v-for="(developer, index) in developers"
        :key="index"
      >
        <div class="photo">
          <img :src="developer.photo" alt="Foto del Desarrollador" />
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
      </div>
    </div>
  </div>
</template>

<script>
import '../../styles/css/Desarrolladores.css'

export default {
  name: 'Agradecimientos',
  data() {
    return {
      developers: [
        {
          name: 'Ing. Angely Esmeralda Vennayappillil Cortéz',
          photo: 'src/assets/images/avatars/photoAngy.jpg',
          description:
            'Nacida en Quetzaltenango, Guatemala, el 10 de noviembre de 2004. Egresada del Colegio IEA campus “Los Altos”, donde obtuvo el título de Bachiller en Ciencias Exactas con Orientación en Computación. Actualmente egresada de la carrera de Ingeniería en Sistemas, Informática y Ciencias de la Computación en la Universidad Mesoamericana, sede Quetzaltenango.',
          inactive: false
        },
        {
          name: 'Ing. Alejandra González Monterrosa',
          photo: 'src/assets/images/avatars/photoAle.jpg',
          description: 'Nacida en San Felipe, Retalhuleu, egresada del Colegio Mixto D’antoni de Bachillerato en ciencias y letras con orientación en computación, Actualmente egresada de la carrera de Ingeniería en Sistemas, Informática y Ciencias de la Computación en la Universidad Mesoamericana, sede Quetzaltenango.',
          inactive: true   
        },
        {
          name: 'Ing. Pablo Daniel Vásquez Monzón',
          photo: 'src/assets/images/avatars/photoPablo.jpg',
          description:
            'Nacido en San Pedro Sacatepéquez, San Marcos, Guatemala, el 16 de diciembre de 2003. Egresado de Universidad Mesoamericana en la carrera de Ingeniería en Sistemas, Informática y Ciencias de la computación. Egresado del Colegio Pre Universitario Galileo en Bachiller en Computación con Orientación Científica.',
          inactive: false
        },
        {
          name: 'Ing. Pawel Alessandro Reynoso Marquez',
          photo: 'src/assets/images/avatars/photoPawel.jpg',
          description:
            'Nacido en Santa Cruz del Quiché, Quiché, Guatemala, el 24 de julio de 2002. Actualmente egresado de la carrera de Ingeniería en Sistemas, Informática y Ciencias de la Computación en la Universidad Mesoamericana, sede Quetzaltenango, en 2025. Además, obtuvo el título de Perito Contador con Especialidad en Computación en el Colegio Evangélico Metodista "UTATLÁN" de Santa Cruz del Quiché en 2020.',
          inactive: false
        }
      ]
    }
  }
}
</script>


