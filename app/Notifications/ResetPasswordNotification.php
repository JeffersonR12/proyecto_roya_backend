<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public function __construct(public string $token) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = url('/reset-password/'.$this->token.'?email='.urlencode($notifiable->email));

        return (new MailMessage)
            ->subject('Restablecer contraseña de Roya')
            ->greeting('Hola '.$notifiable->name)
            ->line('Recibimos una solicitud para restablecer tu contraseña.')
            ->action('Elegir una contraseña nueva', $url)
            ->line('Si no fuiste tu, ignora este mensaje.')
            ->salutation('Equipo Roya');
    }
}
