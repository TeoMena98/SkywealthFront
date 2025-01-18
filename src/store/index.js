import Vue from "vue";
import Vuex from "vuex";
import apiClient from "../axios";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    token: localStorage.getItem("token") || "",
    user: null,
  },
  mutations: {
    setToken(state, token) {
      state.token = token;
      localStorage.setItem("token", token);
    },
    setUser(state, user) {
      state.user = user;
    },
    logout(state) {
      state.token = "";
      state.user = null;
      localStorage.removeItem("token");
    },
  },
  actions: {
    async login({ commit }, credentials) {
      const response = await apiClient.post("/login", credentials);
      commit("setToken", response.data.access_token);
      return response;
    },
    async fetchUser({ commit }) {
      const response = await apiClient.get("/me");
      commit("setUser", response.data);
    },
    logout({ commit }) {
      commit("logout");
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.token,
    getUser: (state) => state.user,
  },
});
