<template>
  <div>
    <label>Proyecto</label>
    <select v-model="selectedProject" @change="cambiarProyecto">

    </select>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex';

export default {
  data() {
    return {
      projects: [
        { id: 1, name: 'Proyecto Agrícola' },
        { id: 2, name: 'Proyecto Capilla' },
      ],
    };
  },
  computed: {
    ...mapState(['selectedProject']),
  },
  methods: {
    ...mapActions(['updateSelectedProject']),
    cambiarProyecto(event) {
      const projectName = event.target.value;
      console.log('Proyecto seleccionado:', projectName);
      this.updateSelectedProject(projectName);
    },
  },
  watch: {
    selectedProject(newValue) {
      console.log('Nuevo proyecto seleccionado (watch):', newValue);
    }
  },
};
</script>
