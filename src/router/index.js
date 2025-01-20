import { createRouter, createWebHistory } from "vue-router";

// Importa los componentes
import FormularioTrabajador from "@/components/FormularioTrabajador.vue";
import Login from "@/components/TrabajadorLogin.vue";

// Define las rutas para la aplicación
const routes = [
    // Ruta para la página de login
    { path: "/", component: Login },

    // Ruta para el formulario de trabajadores, que requiere autenticación
    { path: "/trabajadores", component: FormularioTrabajador, meta: { requiresAuth: true } },
];

// Crea la instancia del router utilizando el historial HTML5
const router = createRouter({
    history: createWebHistory(), // Usa el historial HTML5 para navegación limpia
    routes, // Rutas de la aplicación
});

// Definir la lógica de navegación antes de cada cambio de ruta
router.beforeEach((to, from, next) => {
    // Verifica si la ruta a la que se intenta acceder requiere autenticación
    if (to.matched.some(record => record.meta.requiresAuth)) {
        const token = localStorage.getItem('token'); // Recupera el token de autenticación desde el almacenamiento local

        // Si no existe el token, redirige al login
        if (!token) {
            next('/'); // Redirige al login si no se encuentra el token
        } else {
            next(); // Permite la navegación a la ruta protegida
        }
    } else {
        next(); // Si la ruta no requiere autenticación, permite la navegación
    }
});

export default router; // Exporta el router para ser utilizado en la aplicación
