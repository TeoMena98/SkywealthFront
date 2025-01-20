<template>
    <div>
        <!-- Botón de Logout alineado a la derecha -->
        <div class="logout-container text-end mb-3">
            <button @click="logout" class="btn btn-danger">Logout</button>
        </div>

        <!-- Mensaje de bienvenida -->
        <div class="logout-container text-start mb-3">
            <h2>Bienvenido, {{ usuarioNombre }}</h2>
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
            <h2 class="text-center">{{ isEditing ? 'Editar Trabajador' : 'Crear Trabajador' }}</h2>

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
                    <input type="file" id="foto" @change="handleFileUpload" ref="fotoInput" class="form-control" />
                </div>

                <!-- Campos dinámicos para puestos laborales -->
                <div v-for="(puesto, index) in formData.puesto_laboral" :key="index" class="mb-3">
                    <label :for="'puesto_laboral_' + index" class="form-label">Puestos Laborales {{ index + 1
                        }}:</label>
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
                    <button @click="agregarSelectPuesto" type="button" class="btn btn-info w-100">Agregar Nuevo
                        Puesto</button>
                </div>

                <!-- Botones de acción -->
                <button type="submit" class="btn btn-success w-100 mt-3">
                    {{ isEditing ? 'Actualizar' : 'Crear' }}
                </button>
                <button @click="cancelar" type="button" class="btn btn-secondary w-100 mt-2">Cancelar</button>
            </form>
        </div>
    </div>
</template>

<script>
import { ref, reactive, computed, onMounted } from 'vue';
import axios from '../axios';
import Swal from 'sweetalert2';

export default {
    setup() {
        const trabajadores = ref([]);
        const listaPuestosLaborales = ref([]);
        const isEditing = ref(false);
        const editIndex = ref(null);
        const usuarioNombre = ref(localStorage.getItem('usuario_nombre'));
        const currentUser = reactive({
            puesto_nombre: localStorage.getItem('puesto_nombre'),
        });

        const formData = reactive({
            nombre: '',
            apellidos: '',
            dni: '',
            fecha_nacimiento: '',
            puesto_laboral: [''],
            foto: null,
        });

        const isAdminOrManager = computed(() => {
            return ['Gerente', 'Administrador'].includes(currentUser.puesto_nombre);
        });

        const fetchTrabajadores = async () => {
            try {
                const { data } = await axios.get('/trabajadoresLista');
                const trabajadoresData = data?.data;

                if (trabajadoresData) {
                    trabajadores.value = Object.entries(trabajadoresData).reduce((acc, [key, trabajador]) => {
                        acc[key] = {
                            ...trabajador,
                            puesto_laboral: Array.isArray(trabajador.puestosId)
                                ? trabajador.puestosId
                                : [trabajador.puestosId],
                        };
                        return acc;
                    }, {});
                } else {
                    console.warn('Estructura de datos inesperada:', trabajadoresData);
                    trabajadores.value = {};
                }
            } catch (error) {
                console.error('Error al obtener los trabajadores:', error);
            }
        };




        const fetchPuestosLaborales = async () => {
            try {
                const response = await axios.get('/positions');
                listaPuestosLaborales.value = response.data.data;
            } catch (error) {
                console.error('Error al obtener los puestos laborales:', error);
            }
        };

        const agregarSelectPuesto = () => {
            formData.puesto_laboral.push('');
        };

        const editarTrabajador = (index) => {
            isEditing.value = true;
            editIndex.value = index;
            Object.assign(formData, trabajadores.value[index]);
        };

        const cancelar = () => {
            isEditing.value = false;
            editIndex.value = null;
            Object.assign(formData, {
                nombre: '',
                apellidos: '',
                dni: '',
                fecha_nacimiento: '',
                puesto_laboral: [''],
                foto: null,
            });
        };

        const logout = () => {
            Swal.fire({
                icon: 'warning',
                title: 'Cerrar sesión',
                text: '¿Estás seguro de que deseas cerrar sesión?',
                showCancelButton: true,
                confirmButtonText: 'Sí',
                cancelButtonText: 'No',
            }).then((result) => {
                if (result.isConfirmed) {
                    // Eliminar el token del localStorage
                    localStorage.removeItem('token');
                    localStorage.removeItem('puesto_nombre');
                    localStorage.removeItem('usuario_nombre');

                    // Opcional: Llamada al backend para revocar el token
                    axios.post('/logout', {}, { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } })
                        .then(response => {
                            // Si la respuesta es exitosa, redirige a la página de login
                            console.log(response.data); // Puedes manejar la respuesta si lo deseas
                            window.location.href = '/';  // Redirigir al login
                        })
                        .catch(error => {
                            console.error("Error al cerrar sesión: ", error);
                            window.location.href = '/';  // Aun así redirigir si hay un error
                        });
                }
            });
        };

        const handleFileUpload = (event) => {
            formData.foto = event.target.files[0];
        };

        const submitForm = async () => {
            // Validación de formulario
            if (!formData.nombre || !formData.apellidos || !formData.dni || !formData.fecha_nacimiento) {
                Swal.fire({
                    icon: 'error',
                    title: 'Campos obligatorios',
                    text: 'Por favor, completa todos los campos requeridos.',
                });
                return;
            }

            try {
                const url = isEditing.value
                    ? `/trabajadores/${trabajadores.value[editIndex.value].id}`
                    : '/trabajadores';
                const method = 'post';

                const payload = new FormData();
                Object.entries(formData).forEach(([key, value]) => {
                    if (Array.isArray(value)) {
                        value.forEach((item) => payload.append(`${key}[]`, item));
                    } else {
                        payload.append(key, value);
                    }
                });

                await axios[method](url, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                Swal.fire({
                    icon: 'success',
                    title: isEditing.value ? 'Trabajador actualizado' : 'Trabajador creado',
                    timer: 1500,
                    showConfirmButton: false,
                });

                fetchTrabajadores();
                cancelar();
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Hubo un problema al guardar los datos. Por favor, inténtalo de nuevo.',
                });
            }
        };

        onMounted(() => {
            fetchTrabajadores();
            fetchPuestosLaborales();
        });

        return {
            trabajadores,
            listaPuestosLaborales,
            isEditing,
            usuarioNombre,
            formData,
            isAdminOrManager,
            agregarSelectPuesto,
            editarTrabajador,
            cancelar,
            logout,
            handleFileUpload,
            submitForm,
        };
    },
};
</script>