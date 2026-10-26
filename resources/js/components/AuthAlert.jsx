export default function AuthAlert({ alert }) {
    if (!alert?.message) {
        return null;
    }

    return (
        <div role="alert" aria-live="assertive" className={`auth-alert auth-alert-${alert.type || 'error'}`}>
            {alert.message}
        </div>
    );
}
