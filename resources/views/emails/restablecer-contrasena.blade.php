<x-mail::layout>
<x-slot:header>
<x-mail::header :url="config('app.url')">
{{ $marca }}
</x-mail::header>
</x-slot:header>

# Hola, {{ $nombre }}

Recibimos una solicitud para restablecer la contraseña de tu cuenta de {{ $marca }}.

<x-mail::button :url="$url">
Restablecer contraseña
</x-mail::button>

El enlace vence en {{ $minutos }} minutos.

Si no pediste este cambio, ignora este correo: tu contraseña seguirá siendo la misma.

Saludos,<br>
Equipo {{ $marca }}

<x-slot:subcopy>
<x-mail::subcopy>
Si el botón no funciona, copia y pega este enlace en tu navegador:
<span class="break-all">[{{ $url }}]({{ $url }})</span>
</x-mail::subcopy>
</x-slot:subcopy>

<x-slot:footer>
<x-mail::footer>
© {{ date('Y') }} {{ $marca }}. Detección de roya amarilla en trigo.
</x-mail::footer>
</x-slot:footer>
</x-mail::layout>
