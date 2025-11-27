<template>
  <CSidebar
    class="slm-sidebar border-end"
    colorScheme="dark"
    position="fixed"
    :unfoldable="sidebarUnfoldable"
    :visible="sidebarVisible"
    @visible-change="(event) => $store.commit({ type: 'updateSidebarVisible', value: event })"
  >
    <CSidebarHeader class="slm-sidebar-header border-bottom">
      <RouterLink custom to="/" v-slot="{ href, navigate }">
        <CSidebarBrand v-bind="$attrs" as="a" :href="href" @click="navigate">
          <img src="@/assets/brand/hogar.jpg" alt="Logo" height="70" />
        </CSidebarBrand>
      </RouterLink>
      <CCloseButton class="d-lg-none" dark @click="$store.commit('toggleSidebar')" />
    </CSidebarHeader>

    <!-- NAV -->
    <AppSidebarNav :navConfig="navConfig" />
  </CSidebar>
</template>

<script>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useStore } from 'vuex';
import AppSidebarNav from './AppSidebarNav';
import useNavAgricola from '../_nav2';
import useNavCapilla from '../_nav';


import '../../src/styles/css/sidebar.css';

export default {
  name: 'AppSidebar',
  components: {
    AppSidebarNav,
    RouterLink,
  },
  setup() {
    const store = useStore();
    const navConfig = computed(() => {
      return store.state.selectedProject === 'Proyecto Agrícola'
        ? useNavAgricola()
        : useNavCapilla();
    });

    return {
      sidebarUnfoldable: computed(() => store.state.sidebarUnfoldable),
      sidebarVisible: computed(() => store.state.sidebarVisible),
      navConfig,
    };
  },
};
</script>
