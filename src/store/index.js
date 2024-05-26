import { createStore } from 'vuex';

const store = createStore({
  state: {
    sidebarUnfoldable: false,
    sidebarVisible: true,
    selectedProject: localStorage.getItem('selectedProject') || '',
    projectToken: localStorage.getItem('projectToken') || null,
  },
  mutations: {
    toggleSidebar(state) {
      state.sidebarVisible = !state.sidebarVisible;
    },
    toggleUnfoldable(state) {
      state.sidebarUnfoldable = !state.sidebarUnfoldable;
    },
    updateSidebarVisible(state, { value }) {
      state.sidebarVisible = value;
    },
    updateSelectedProject(state, project) {
      state.selectedProject = project;
      localStorage.setItem('selectedProject', project);
    },
    updateProjectToken(state, token) {
      state.projectToken = token;
      localStorage.setItem('projectToken', token);
    },
  },
  actions: {
    updateSelectedProject({ commit }, project) {
      commit('updateSelectedProject', project);
    },
    updateProjectToken({ commit }, token) {
      commit('updateProjectToken', token);
    },
  },
});

export default store;
