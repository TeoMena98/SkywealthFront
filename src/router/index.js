import Vue from "vue";
import Router from "vue-router";

import FormularioTrabajador from "@/components/FormularioTrabajador.vue";

import Login from "@/components/TrabajadorLogin.vue";

Vue.use(Router);

export default new Router({
    mode: "history",
    routes: [
        { path: "/", component: Login },
        { path: "/trabajadores", component: FormularioTrabajador },
    ],
});
