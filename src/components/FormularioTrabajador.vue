<template>
    <div>
        <!-- Botón de Logout alineado a la derecha -->
        <div class="logout-container text-end mb-3">
            <button @click="logout" class="btn btn-danger">Logout</button>
        </div>

        <!-- Mensaje de bienvenida -->
        <div class="logout-container text-start mb-3">
            <h2>Bienvenido, {{ usuario_nombre }}</h2>
        </div>

        <!-- Tabla de trabajadores -->
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
                <tr v-for="(trabajador, index) in trabajadores" :key="trabajador.id + '-' + index">
                    <td>{{ trabajador.nombre }}</td>
                    <td>{{ trabajador.apellidos }}</td>
                    <td>{{ trabajador.dni }}</td>
                    <td v-if="isAdminOrManager">{{ trabajador.usuario_email }}</td>
                    <td>{{ trabajador.fecha_nacimiento }}</td>
                    <td>{{ trabajador.puestos }}</td>
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
                    <input type="text" id="dni" v-model="formData.dni" class="form-control" required
                        :disabled="isEditing" />
                </div>
                <div class="mb-3">
                    <label for="fecha_nacimiento" class="form-label">Fecha de Nacimiento:</label>
                    <input type="date" id="fecha_nacimiento" v-model="formData.fecha_nacimiento" class="form-control"
                        required />
                </div>
                <div class="mb-3">
                    <label for="foto" class="form-label">Foto:</label>
                    <input type="file" id="foto" @change="handleFileUpload" class="form-control" />
                </div>

                <!-- Campos dinámicos para puestos laborales -->
                <div v-for="(puesto, index) in formData.puesto_laboral" :key="index" class="mb-3">
                    <label :for="'puesto_laboral_' + index" class="form-label">Puestos Laborales {{ index + 1 }}:</label>
                    <select :id="'puesto_laboral_' + index" v-model="formData.puesto_laboral[index]" class="form-select"
                        required>
                        <option disabled value="">Seleccione un puesto</option>
                        <option v-for="puestoItem in listaPuestosLaborales" :key="puestoItem.id" :value="puestoItem.id">
                            {{ puestoItem.nombre }}
                        </option>
                    </select>
                </div>

                <!-- Botón para agregar un nuevo puesto -->
                <div class="mb-3">
                    <button @click="agregarSelectPuesto" type="button" class="btn btn-info w-100">Agregar Nuevo Puesto</button>
                </div>

                <!-- Botones de acción -->
                <button type="submit" class="btn btn-success w-100 mt-3">{{ isEditing ? "Actualizar" : "Crear" }}</button>
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
            trabajadores: [], // Lista de trabajadores obtenidos del servidor
            formData: {
                nombre: "",
                apellidos: "",
                dni: "",
                fecha_nacimiento: "",
                puesto_laboral: [""],
                foto: null,
            },
            listaPuestosLaborales: [], // Lista de puestos laborales disponibles
            isEditing: false, // Indica si se está editando un trabajador
            editIndex: null, // Índice del trabajador que se está editando
            currentUser: {
                puesto_nombre: "",
            },
            usuario_nombre: localStorage.getItem('usuario_nombre'), // Nombre del usuario actual
        };
    },
    computed: {
        // Verifica si el usuario actual es Administrador o Gerente
        isAdminOrManager() {
            return ["Gerente", "Administrador"].includes(this.currentUser.puesto_nombre);
        },
    },
    created() {
        // Inicialización: obtener datos del servidor y configurar el usuario actual
        this.fetchTrabajadores();
        this.fetchPuestosLaborales();
        this.currentUser.puesto_nombre = localStorage.getItem('puesto_nombre');
    },
    methods: {
        agregarSelectPuesto() {
            this.formData.puesto_laboral.push("");
        },
        async fetchTrabajadores() {
            try {
                const response = await axios.get("/trabajadoresLista");
                if (response.data.data && typeof response.data.data === 'object') {
                    this.trabajadores = Object.values(response.data.data).flat().map(trabajador => ({
                        ...trabajador,
                        puesto_laboral: Array.isArray(trabajador.puesto_laboral) ? trabajador.puesto_laboral : [trabajador.puesto_laboral]
                    }));
                } else {
                    this.trabajadores = [];
                }
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
            this.formData = {
                ...trabajador,
                puesto_laboral: Array.isArray(trabajador.puestosId) ? trabajador.puestosId : [trabajador.puestosId]
            };
        },
        cancelar() {
            this.isEditing = false;
            this.editIndex = null;
            this.formData = {
                nombre: "",
                apellidos: "",
                dni: "",
                fecha_nacimiento: "",
                puesto_laboral: [""],
                foto: null,
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
        handleFileUpload(event) {
            this.formData.foto = event.target.files[0];
        },
        async submitForm() {
            // Validación básica de campos obligatorios
            if (!this.formData.nombre || !this.formData.apellidos || !this.formData.dni || !this.formData.fecha_nacimiento) {
                Swal.fire({
                    icon: "error",
                    title: "Campos obligatorios",
                    text: "Por favor, completa todos los campos requeridos.",
                });
                return;
            }
            if (this.formData.puesto_laboral.length === 0 || this.formData.puesto_laboral.includes("")) {
                Swal.fire({
                    icon: "error",
                    title: "Puestos laborales requeridos",
                    text: "Por favor, selecciona al menos un puesto laboral.",
                });
                return;
            }

            try {
                let formData = new FormData();
                formData.append("nombre", this.formData.nombre);
                formData.append("apellidos", this.formData.apellidos);
                formData.append("dni", this.formData.dni);
                formData.append("fecha_nacimiento", this.formData.fecha_nacimiento);
                this.formData.puesto_laboral.forEach((puesto) => {
                    formData.append(`puesto_laboral[]`, puesto);
                });
                if (this.formData.foto) {
                    formData.append("foto", this.formData.foto);
                }
                const url = this.isEditing ? `/trabajadores/${this.trabajadores[this.editIndex].id}` : "/trabajadores";
                const method = this.isEditing ? "post" : "post";
                await axios[method](url, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                Swal.fire({
                    icon: "success",
                    title: this.isEditing ? "Trabajador actualizado" : "Trabajador creado",
                    showConfirmButton: false,
                    timer: 1500,
                });
                this.fetchTrabajadores();
                this.cancelar();
            } catch (error) {
                console.error("Error al enviar el formulario:", error);
                Swal.fire({
                    icon: "error",
                    title: "Error",
                    text: "Hubo un problema al guardar los datos. Por favor, inténtalo de nuevo.",
                });
            }
        },
    },
};
</script>
