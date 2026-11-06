<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>RiwiScan</title>
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="theme-color" content="#0f3d24">
    <meta name="mobile-web-app-capable" content="yes">
    <link rel="manifest" href="/manifest.webmanifest">
    <link rel="icon" href="/imagenes/riwiscan-logo.png" type="image/png">
    <script>
        window.RoyaGuard = {
            page: @json($page),
            analyses: @json($analyses),
            authUser: @json($authUser),
            reset: {
                token: @json($resetToken ?? null),
                email: @json($resetEmail ?? null),
            },
            urls: {
                home: '/',
                login: '/login',
                register: '/register',
                forgot: '/forgot-password',
                reset: '/reset-password',
                logout: '/logout',
                store: '/analysis',
                sync: '/api/sync/diagnosticos',
                diagnosticos: '/api/diagnosticos',
            },
        };
    </script>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/main.jsx'])
</head>
<body class="min-h-screen bg-paper font-body text-neutral antialiased">
    <div id="app"></div>
</body>
</html>
