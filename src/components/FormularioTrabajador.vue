<template>
    <div>
        <!-- Botón de Logout alineado a la derecha -->
        <div class="logout-container text-end mb-3">
            <button @click="logout" class="btn btn-danger">Logout</button>
        </div>

        <div class="logout-container text-start mb-3">
            <h2>Bienvenido, {{ usuario_nombre }}</h2>
        </div>

        <h1>Lista de Trabajadores</h1>
        <table class="table table-striped table-hover">
            <thead class="thead-dark">
                <tr>
                    <th>Nombre</th>
                    <th>Apellidos</th>
                    <th>DNI</th>
                    <th v-if="isAdminOrManager">Email</th>
                    <th>Fecha de Nacimiento</th>
                    <th>Puesto</th>
                    <th v-if="isAdminOrManager">Acciones</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(trabajador, index) in trabajadores" :key="trabajador.id">
                    <td>{{ trabajador.nombre }}</td>
                    <td>{{ trabajador.apellidos }}</td>
                    <td>{{ trabajador.dni }}</td>
                    <td v-if="isAdminOrManager">{{ trabajador.usuario_email }}</td>
                    <td>{{ trabajador.fecha_nacimiento }}</td>
                    <td>{{ trabajador.puesto_nombre }}</td>
                    <td v-if="isAdminOrManager">
                        <button @click="editarTrabajador(index)" class="btn btn-primary btn-sm">Editar</button>
                    </td>
                </tr>
            </tbody>
        </table>

        <!-- Formulario para crear o editar trabajador (Solo Gerente o Administrador) -->
        <div v-if="isAdminOrManager" class="crear-trabajador container">
            <h2 class="text-center">{{ isEditing ? "Editar Trabajador" : "Crear Trabajador" }}</h2>

            <form @submit.prevent="submitForm" class="bg-light p-4 rounded shadow-sm">
                <!-- Campos del formulario -->
                <div class="mb-3">
                    <label for="nombre" class="form-label">Nombre:</label>
                    <input type="text" id="nombre" v-model="formData.nombre" class="form-control" required />
                </div>
                <div class="mb-3">
                    <label for="apellidos" class="form-label">Apellidos:</label>
                    <input type="text" id="apellidos" v-model="formData.apellidos" class="form-control" required />
                </div>
                <div class="mb-3">
                    <label for="dni" class="form-label">DNI:</label>
                    <input type="text" id="dni" v-model="formData.dni" class="form-control" required />
                </div>
                <div class="mb-3">
                    <label for="fecha_nacimiento" class="form-label">Fecha de Nacimiento:</label>
                    <input type="date" id="fecha_nacimiento" v-model="formData.fecha_nacimiento" class="form-control"
                        required />
                </div>
                <div class="mb-3">
                    <label for="puesto_laboral" class="form-label">Puestos Laborales:</label>
                    <select id="puesto_laboral" v-model="formData.puesto_laboral" class="form-select" required>
                        <option disabled value="">Seleccione un puesto</option>
                        <option v-for="puesto in listaPuestosLaborales" :key="puesto.codigo" :value="puesto.id">
                            {{ puesto.nombre }}
                        </option>
                    </select>
                </div>
                <button type="submit" class="btn btn-success w-100 mt-3">{{ isEditing ? "Actualizar" : "Crear"
                    }}</button>
                <button @click="cancelar" type="button" class="btn btn-secondary w-100 mt-2">Cancelar</button>
            </form>
        </div>
    </div>
</template>

<script>
import axios from "../axios";
import Swal from "sweetalert2";

export default {
    data() {
        return {
            trabajadores: [],
            formData: {
                nombre: "",
                apellidos: "",
                dni: "",
                fecha_nacimiento: "",
                puesto_laboral: "",
            },
            listaPuestosLaborales: [],
            isEditing: false,
            editIndex: null,
            currentUser: {
                puesto_nombre: "", // Este valor se asignará con el puesto del usuario actual
            },

            usuario_nombre: localStorage.getItem('usuario_nombre')
        };
    },
    computed: {
        isAdminOrManager() {
            return ["Gerente", "Administrador"].includes(this.currentUser.puesto_nombre);
        },
    },
    created() {
        this.fetchTrabajadores();
        this.fetchPuestosLaborales();
        this.currentUser.puesto_nombre = localStorage.getItem('puesto_nombre'); // Cambiar según los datos del usuario autenticado
    },
    methods: {
        async fetchTrabajadores() {
            try {
                const response = await axios.get("/trabajadoresLista");
                this.trabajadores = response.data.data;
            } catch (error) {
                console.error("Error al obtener los trabajadores:", error);
            }
        },


        async fetchPuestosLaborales() {
            try {
                const response = await axios.get("/positions");
                this.listaPuestosLaborales = response.data.data;
            } catch (error) {
                console.error("Error al obtener los puestos laborales:", error);
            }
        },
        editarTrabajador(index) {
            this.isEditing = true;
            this.editIndex = index;
            const trabajador = this.trabajadores[index];
            this.formData = { ...trabajador };
        },
        cancelar() {
            this.isEditing = false;
            this.editIndex = null;
            this.formData = {
                nombre: "",
                apellidos: "",
                dni: "",
                fecha_nacimiento: "",
                puesto_laboral: "",
            };
        },
        logout() {
            Swal.fire({
                icon: "warning",
                title: "Cerrar sesión",
                text: "¿Estás seguro de que deseas cerrar sesión?",
                showCancelButton: true,
                confirmButtonText: "Sí",
                cancelButtonText: "No",
            }).then((result) => {
                if (result.isConfirmed) {
                    this.$router.push("/");
                }
            });
        },
    },
};
</script>
