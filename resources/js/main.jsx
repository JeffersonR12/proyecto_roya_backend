import './bootstrap';
import '../css/app.css';
import { createRoot } from 'react-dom/client';
import RoyaGuard from './RoyaGuard.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';

const root = document.getElementById('app');
const config = window.RoyaGuard ?? { page: 'login', analyses: [], urls: {}, authUser: null };

function Root() {
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
            initialAnalyses={config.analyses ?? []}
            urls={config.urls}
            user={config.authUser}
        />
    );
}

createRoot(root).render(<Root />);
