<template>
  <div>
    <AppSidebar :navConfig="navConfig" />
    <div class="wrapper d-flex flex-column min-vh-100">
      <AppHeader />
      <div class="body flex-grow-1">
        <CContainer class="px-4" lg>
          <router-view />
        </CContainer>
      </div>
      <AppFooter />
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { CContainer } from '@coreui/vue';
import AppFooter from '@/components/AppFooter.vue';
import AppHeader from '@/components/AppHeader.vue';
import AppSidebar from '@/components/AppSidebar.vue';
import useNavAgricola from '../_nav';
import useNavCapilla from '../_nav2';

export default {
  name: 'DefaultLayout',
  components: {
    AppFooter,
    AppHeader,
    AppSidebar,
    CContainer,
  },
  setup() {
    const store = useStore();
    const navConfig = computed(() => {
      return store.state.selectedProject === 'Proyecto Agrícola'
        ? useNavAgricola()
        : useNavCapilla();
    });

    return { navConfig };
  },
};
</script>
