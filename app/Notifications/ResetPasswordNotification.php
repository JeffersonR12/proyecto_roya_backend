<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * Correo de restablecimiento en espanol. Se envia de forma sincrona para no
 * depender de un worker de colas en el entorno local (XAMPP).
 */
class ResetPasswordNotification extends ResetPassword
{
    protected function buildMailMessage($url): MailMessage
    {
        $minutes = config('auth.passwords.'.config('auth.defaults.passwords').'.expire');

        return (new MailMessage)
            ->subject('Restablecer tu contraseña de '.config('app.name'))
            ->greeting('Hola')
            ->line('Recibimos una solicitud para restablecer la contraseña de tu cuenta.')
            ->action('Restablecer contraseña', $url)
            ->line("Este enlace vence en {$minutes} minutos y solo puede usarse una vez.")
            ->line('Si no solicitaste el cambio, ignora este correo: tu contraseña actual sigue vigente.')
            ->salutation('Equipo '.config('app.name'));
    }
}
