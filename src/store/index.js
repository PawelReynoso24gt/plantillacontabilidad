import { createStore } from 'vuex';

const store = createStore({
  state: {
    sidebarUnfoldable: false,
    sidebarVisible: true,
    selectedProject: localStorage.getItem('selectedProject') || '',
    projectToken: localStorage.getItem('projectToken') || null,
    token: localStorage.getItem('token') || '', // Estado para el token de autenticación
    idRol: localStorage.getItem('idRol') ? Number(localStorage.getItem('idRol')) : null,
    usuarioActual: localStorage.getItem('usuarioActual') || '',
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
    clearSelectedProject(state) {
      state.selectedProject = '';
      localStorage.removeItem('selectedProject');
    },
    clearProjectToken(state) {
      state.projectToken = null;
      localStorage.removeItem('projectToken');
    },
    setIdRol(state, idRol) {
      state.idRol = idRol;
      localStorage.setItem('idRol', idRol);
    },
    setUsuarioActual(state, usuario) {
      state.usuarioActual = usuario;
      localStorage.setItem('usuarioActual', usuario);
    },
    clearIdRol(state) {
      state.idRol = null;
      localStorage.removeItem('idRol');
    },
    clearUsuarioActual(state) {
      state.usuarioActual = '';
      localStorage.removeItem('usuarioActual');
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
    updateIdRol({ commit }, idRol) {
      commit('setIdRol', idRol);
    },
    updateUsuarioActual({ commit }, usuario) {
      commit('setUsuarioActual', usuario);
    },
    logout({ commit }) {
      commit('clearToken');
      commit('clearSelectedProject');
      commit('clearProjectToken');
      commit('clearIdRol');
      commit('clearUsuarioActual');
      localStorage.clear();
      sessionStorage.clear();
    },
  },
  getters: {
    isAuthenticated: state => !!state.token, // Getter para verificar si el usuario está autenticado
    esAdmin: state => state.idRol === 1, // Getter para verificar si el usuario autenticado es administrador (id_rol 1)
  },
});

export default store;
