<template>
  <CSidebar
    class="border-end"
    colorScheme="dark"
    position="fixed"
    :unfoldable="sidebarUnfoldable"
    :visible="sidebarVisible"
    @visible-change="(event) => $store.commit({ type: 'updateSidebarVisible', value: event })"
  >
    <CSidebarHeader class="border-bottom">
      <RouterLink custom to="/" v-slot="{ href, navigate }">
        <CSidebarBrand v-bind="$attrs" as="a" :href="href" @click="navigate">
          <img src="@/assets/brand/hogar.jpg" alt="Logo" height="70" />
        </CSidebarBrand> <!-- Corregido -->
      </RouterLink>
      <CCloseButton class="d-lg-none" dark @click="$store.commit('toggleSidebar')" />
    </CSidebarHeader>
    <AppSidebarNav :navConfig="navConfig" />
    <CSidebarFooter class="border-top d-none d-lg-flex">
      <CSidebarToggler @click="$store.commit('toggleUnfoldable')" />
    </CSidebarFooter>
  </CSidebar>
</template>

<script>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useStore } from 'vuex';
import AppSidebarNav from './AppSidebarNav';
import useNavAgricola from '../_nav2';
import useNavCapilla from '../_nav';

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
