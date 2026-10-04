<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Roya</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <script>
        window.RoyaGuard = {
            page: @json($page),
            listing: @json($listing ?? null),
            authUser: @json($authUser),
            reset: {
                token: @json($resetToken ?? ''),
                email: @json($resetEmail ?? ''),
            },
            urls: {
                home: '/',
                login: '/login',
                register: '/register',
                forgot: '/forgot-password',
                logout: '/logout',
                store: '/analysis',
                list: '/analysis',
                export: '/analysis/export',
                demoLogin: @json(app()->environment('local')),
            },
        };
    </script>
    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/main.jsx'])
</head>
<body class="min-h-screen bg-sky font-body text-navy antialiased">
    <div id="app"></div>
</body>
</html>
