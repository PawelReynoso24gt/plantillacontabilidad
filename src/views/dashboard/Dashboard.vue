<template>
 <div style="display: flex; justify-content: center; align-items: center; height: 20vh;">
    <img src="@/assets/brand/logoComp.png" class="large-image"/>
  </div>
  <div></div>
</template>

<style>
.large-image {
  width: 400px; /* O el tamaño deseado */
  height: auto; /* Mantener la proporción original */
}

</style>
<script>
import avatar1 from '@/assets/images/avatars/1.jpg'
import avatar2 from '@/assets/images/avatars/2.jpg'
import avatar3 from '@/assets/images/avatars/3.jpg'
import avatar4 from '@/assets/images/avatars/4.jpg'
import avatar5 from '@/assets/images/avatars/5.jpg'
import avatar6 from '@/assets/images/avatars/6.jpg'
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
    return {

    }
  },
}
</script>

