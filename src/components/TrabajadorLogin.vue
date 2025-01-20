<template>
    <div class="container d-flex justify-content-center align-items-center vh-100">
        <div class="card p-4 shadow" style="max-width: 400px; width: 100%;">
            <h3 class="text-center mb-4">Iniciar sesión</h3>
            <form @submit.prevent="login">
                <div class="mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input type="email" class="form-control" id="email" v-model="email" placeholder="Ingrese su email"
                        required />
                </div>

                <div class="mb-3">
                    <label for="password" class="form-label">Contraseña</label>
                    <input type="password" class="form-control" id="password" v-model="password"
                        placeholder="Ingrese su contraseña" required />
                </div>

                <div class="d-grid gap-2">
                    <button type="submit" class="btn btn-primary">Iniciar sesión</button>
                </div>
            </form>

            <div v-if="errorMessage" class="alert alert-danger mt-3" role="alert">
                {{ errorMessage }}
            </div>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue';
import axios from '../axios';
import { useRouter } from 'vue-router';

export default {
    setup() {
        // Declaración de las propiedades reactivas
        const email = ref('');
        const password = ref('');
        const errorMessage = ref('');

        const router = useRouter();

        // Método de login
        const login = () => {
            axios.post('/login', { email: email.value, password: password.value })
                .then(response => {
                    // Guardamos el token JWT en el almacenamiento local
                    localStorage.setItem('token', response.data.token);
                    localStorage.setItem('puesto_nombre', response.data.puesto_nombre);
                    localStorage.setItem('usuario_nombre', response.data.usuario_nombre);

                    // Redirigir a la página principal o dashboard
                    router.push('/trabajadores');
                })
                .catch(error => {
                    // Mostrar mensaje de error si el login falla
                    if (error.response && error.response.data) {
                        console.log(error.response.data);
                        errorMessage.value = error.response.data.error || 'Error de autenticación';
                    } else {
                        errorMessage.value = 'Error desconocido';
                    }
                });
        };

        // Retornar las propiedades y funciones a la plantilla
        return {
            email,
            password,
            errorMessage,
            login
        };
    }
};
</script>

<style scoped>
.container {
    max-width: 500px;
}
</style>
