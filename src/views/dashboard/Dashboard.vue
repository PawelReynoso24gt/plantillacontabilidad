<template>
  <div>
    <div style="display: flex; justify-content: center; align-items: center; height: 30vh;">
      <img src="@/assets/brand/logoComp.png" class="large-image"/>
    </div>
    <div style="display: flex; flex-direction: column; justify-content: center; align-items: center;">
      <div style="text-align: center; color: black; font-size: 50px; margin-bottom: 20px;">
        PROYECTO AGRÍCOLA SAN JOSE
      </div>
      <div style="display: flex; justify-content: center; align-items: center; gap: 20px;">
        <img src="@/assets/brand/hogar12.jpg" class="small-image"/>
        <img src="@/assets/brand/hogar123.jpg" class="small-image"/>
      </div>
    </div>
  </div>
</template>

<style>
.large-image {
  width: 500px; /* O el tamaño deseado */
  height: auto; /* Mantener la proporción original */
}

.small-image {
  width: 600px; /* Tamaño de las imágenes */
  height: auto; /* Mantener la proporción original */
}
</style>

<script>
import MainChart from './MainChart'
import WidgetsStatsA from './../widgets/WidgetsStatsTypeA.vue'
import WidgetsStatsD from './../widgets/WidgetsStatsTypeD.vue'

export default {
  name: 'Dashboard',
  components: {
    MainChart,
    WidgetsStatsA,
    WidgetsStatsD,
  },
  setup() {
    return {}
  },
}
</script>
