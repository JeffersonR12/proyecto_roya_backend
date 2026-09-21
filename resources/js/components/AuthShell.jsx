export default function AuthShell({ children, compact = false }) {
    return (
        <div className="auth-screen relative">
            <div className="auth-wave auth-wave-a"></div>
            <div className="auth-wave auth-wave-b"></div>
            <div className={`relative z-10 ${compact ? '' : 'w-full'}`}>{children}</div>
        </div>
    );
}
