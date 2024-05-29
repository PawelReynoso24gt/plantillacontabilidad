import { createStore } from 'vuex';

const store = createStore({
  state: {
    sidebarUnfoldable: false,
    sidebarVisible: true,
    selectedProject: localStorage.getItem('selectedProject') || '',
    projectToken: localStorage.getItem('projectToken') || null,
    token: localStorage.getItem('token') || '', // Estado para el token de autenticación
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
    setToken(state, token) {
      state.token = token;
      localStorage.setItem('token', token);
    },
    clearToken(state) {
      state.token = '';
      localStorage.removeItem('token');
    },
  },
  actions: {
    updateSelectedProject({ commit }, project) {
      commit('updateSelectedProject', project);
    },
    updateProjectToken({ commit }, token) {
      commit('updateProjectToken', token);
    },
    login({ commit }, token) {
      commit('setToken', token);
    },
    logout({ commit }) {
      commit('clearToken');
    },
  },
  getters: {
    isAuthenticated: state => !!state.token, // Getter para verificar si el usuario está autenticado
  },
});

export default store;
