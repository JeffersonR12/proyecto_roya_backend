<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

/**
 * Correo de restablecimiento en español. Hereda de ResetPassword para
 * reutilizar el token del broker; solo cambia el texto y la marca.
 */
class RestablecerContrasena extends ResetPassword
{
    public const MARCA = 'RiwiScan';

    public function toMail($notifiable): MailMessage
    {
        $url = url(route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ], false));

        $minutos = (int) config('auth.passwords.'.config('auth.defaults.passwords').'.expire');

        return (new MailMessage)
            ->subject(self::MARCA.' · Restablece tu contraseña')
            ->markdown('emails.restablecer-contrasena', [
                'marca' => self::MARCA,
                'nombre' => $notifiable->name,
                'url' => $url,
                'minutos' => $minutos,
            ]);
    }
}
