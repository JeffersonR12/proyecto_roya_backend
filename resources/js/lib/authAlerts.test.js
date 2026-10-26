import { describe, expect, it } from 'vitest';
import { alertFromAxiosError, firstAuthMessage, validateLogin, validateRegister } from './authAlerts.js';

describe('alertas de autenticacion', () => {
    it('prioriza el error generico de credenciales', () => {
        expect(
            firstAuthMessage({
                email: ['El correo es obligatorio.'],
                credentials: ['Las credenciales no son validas.'],
            }),
        ).toBe('Las credenciales no son validas.');
    });

    it('convierte 429 en alerta de espera', () => {
        const alert = alertFromAxiosError({
            response: {
                status: 429,
                data: { message: 'Demasiados intentos. Espera un momento e intentalo de nuevo.' },
            },
        });

        expect(alert.type).toBe('warning');
        expect(alert.message).toContain('Demasiados intentos');
    });

    it('exige Gmail en login', () => {
        expect(validateLogin({ email: 'usuario@hotmail.com', password: 'password' }).message).toContain(
            'usuario@gmail.com',
        );
    });

    it('avisa si el login esta incompleto', () => {
        expect(validateLogin({ email: '', password: '' }).type).toBe('warning');
    });

    it('rechaza registro con contraseñas distintas', () => {
        const alert = validateRegister({
            name: 'Ana',
            email: 'ana@gmail.com',
            phone: '987654321',
            password: 'password1',
            password_confirmation: 'password2',
            terms: true,
        });

        expect(alert.message).toBe('Las contraseñas no coinciden.');
    });

    it('exige aceptar terminos en registro', () => {
        const alert = validateRegister({
            name: 'Ana',
            email: 'ana@gmail.com',
            phone: '+51987654321',
            password: 'password1',
            password_confirmation: 'password1',
            terms: false,
        });

        expect(alert.type).toBe('warning');
        expect(alert.message).toContain('terminos');
    });

    it('exige celular peruano +51 9xxxxxxxx', () => {
        const alert = validateRegister({
            name: 'Ana',
            email: 'ana@gmail.com',
            phone: '123456789',
            password: 'password1',
            password_confirmation: 'password1',
            terms: true,
        });

        expect(alert.message).toContain('+51');
    });

    it('acepta celular nacional que empieza con 9', () => {
        expect(
            validateRegister({
                name: 'Ana',
                email: 'ana@gmail.com',
                phone: '987654321',
                password: 'password1',
                password_confirmation: 'password1',
                terms: true,
            }),
        ).toBeNull();
    });
});
