import axios from 'axios';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.headers.common['Accept'] = 'application/json';

const csrfToken = document.head.querySelector('meta[name="csrf-token"]');

// Si existe la cookie XSRF-TOKEN, axios la envia sola (X-XSRF-TOKEN) y siempre
// esta al dia. El token del <meta> puede venir de la copia offline de la pagina
// y Laravel rechaza la peticion (419) si X-CSRF-TOKEN no coincide.
const hasXsrfCookie = document.cookie.split('; ').some((cookie) => cookie.startsWith('XSRF-TOKEN='));

if (csrfToken && !hasXsrfCookie) {
    window.axios.defaults.headers.common['X-CSRF-TOKEN'] = csrfToken.content;
}
