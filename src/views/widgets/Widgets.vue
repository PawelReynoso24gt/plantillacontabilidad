<template>
  <div class="thanks-page">
    <h1>Agradecimientos a los Desarrolladores</h1>
    <div class="developers-list">
      <div class="developer" v-for="(developer, index) in developers" :key="index">
        <div class="photo">
          <img :src="developer.photo" alt="Foto del Desarrollador" />
        </div>
        <div class="description">
          <h3>{{ developer.name }}</h3>
          <p>{{ developer.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Agradecimientos',
  data() {
    return {
      developers: [
        {
          name: 'Angely Esmeralda Thomas Cortéz',
          photo: 'src/assets/images/avatars/photoAngy.jpg',
          description: 'Nacida en Quetzaltenango, egresada del colegio IEA campus "Los Altos" de bachillerato en ciencias exactas con orientación en computación, actualmente cursando 8vo. Semestre de Ingeniería en Sistemas en Universidad Mesoamericana.'
        },
        {
          name: 'Alejandra González Monterrosa',
          photo: 'src/assets/images/avatars/photoAle.jpg',
          description: 'Nacida en San Felipe, Retalhuleu, egresada del Colegio Mixto D’antoni de Bachillerato en ciencias y letras con orientación en computación, actualmente cursando 8vo. Semestre de Ingeniería en Sistemas en Universidad Mesoamericana.'
        },
        {
          name: 'Pablo Daniel Vásquez Monzón',
          photo: 'src/assets/images/avatars/photoPablo.jpg',
          description: 'Nacido en San Pedro Sacatepéquez, San Marcos, egresado del Colegio Pre-Universitario Galileo en bachillerato en computación con orientación científica, actualmente cursando 8vo. Semestre de Ingeniería en Sistemas en Universidad Mesoamericana.'
        },
        {
          name: 'Pawel Alessandro Reynoso Marquez',
          photo: 'src/assets/images/avatars/photoPawel.jpg',
          description: 'Nacido en Santa Cruz del Quiché, Quiché, egresado del Colegio Evangélico Metodista "UTATLÁN" en perito contador con especialidad en computación, actualmente cursando 8vo. Semestre de Ingeniería en Sistemas en Universidad Mesoamericana.'
        }
      ]
    }
  }
}
</script>

<style scoped>
.thanks-page {
  text-align: center;
  padding: 20px;
}

.developers-list {
  display: flex;
  flex-wrap: nowrap;
  justify-content: center;
  gap: 20px;
  overflow-x: auto;
}

.developer {
  border: 1px solid #ccc;
  padding: 20px;
  width: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.photo img {
  max-width: 100%;
  height: auto;
  border-radius: 50%;
}

.description {
  text-align: center;
  margin-top: 20px;
  line-height: 1.25;
}
</style>