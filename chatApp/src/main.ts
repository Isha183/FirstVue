import './assets/main.css';
import 'primeicons/primeicons.css';
import ToastPlugin from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-bootstrap.css';
import Notifications from '@kyvg/vue3-notification';
import { createApp } from 'vue';
import { createPinia } from 'pinia';

import axios from 'axios';
axios.defaults.baseURL = import.meta.env.VITE_API_URL;

import App from './App.vue';
import router from './router';

const app = createApp(App);

app.use(createPinia());
app.use(ToastPlugin);
app.use(router);
app.use(Notifications);

app.mount('#app');
