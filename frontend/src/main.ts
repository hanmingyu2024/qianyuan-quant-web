import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App';
import router from './router';
import './styles/theme.css';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.mount('#app'); 