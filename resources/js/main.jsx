import './bootstrap';
import '@fontsource-variable/plus-jakarta-sans/wght.css';
import '../css/app.css';
import { createRoot } from 'react-dom/client';
import RoyaGuard from './RoyaGuard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import UpdateToast from './components/UpdateToast.jsx';
import { forgetAppShell, registerEdgeWorker } from './lib/pwa.js';
import { clearSession, setSession } from './lib/session.js';

void registerEdgeWorker();

const root = document.getElementById('app');
const config = window.RoyaGuard ?? { page: 'login', analyses: [], urls: {}, authUser: null };

// Los datos locales (IndexedDB, localStorage) se abren solo para la cuenta autenticada.
if (config.page === 'app' && config.authUser) {
    setSession(config.authUser);
} else {
    clearSession();
    // Sin sesion no debe quedar la copia offline de la pagina de la cuenta anterior.
    forgetAppShell();
}

function Root() {
    return (
        <>
            <Page />
            <UpdateToast />
        </>
    );
}

function Page() {
    if (config.page === 'login') {
        return <Login urls={config.urls} />;
    }

    if (config.page === 'register') {
        return <Register urls={config.urls} />;
    }

    if (config.page === 'forgot') {
        return <ForgotPassword urls={config.urls} />;
    }

    return (
        <RoyaGuard
            urls={config.urls}
            user={config.authUser}
        />
    );
}

createRoot(root).render(<Root />);
