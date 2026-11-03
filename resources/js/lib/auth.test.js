import { describe, expect, it } from 'vitest';
import { formatPeruvianPhoneInput, isGmailEmail, isPeruvianMobile, toE164Peru } from './auth.js';

describe('validacion de Gmail', () => {
    it('acepta Gmail ignorando mayusculas y espacios', () => {
        expect(isGmailEmail('agricultor@gmail.com')).toBe(true);
        expect(isGmailEmail('  Agricultor.Uno@GMAIL.com ')).toBe(true);
    });

    it('rechaza otros dominios y valores vacios', () => {
        expect(isGmailEmail('agricultor@hotmail.com')).toBe(false);
        expect(isGmailEmail('agricultor@gmail.com.pe')).toBe(false);
        expect(isGmailEmail('')).toBe(false);
        expect(isGmailEmail(null)).toBe(false);
        expect(isGmailEmail(undefined)).toBe(false);
    });
});

describe('celular peruano', () => {
    it('deja solo 9 digitos nacionales', () => {
        expect(formatPeruvianPhoneInput('987 654 321')).toBe('987654321');
        expect(formatPeruvianPhoneInput('9876543210')).toBe('987654321');
        expect(formatPeruvianPhoneInput(null)).toBe('');
    });

    it('quita el prefijo 51 solo si sobran digitos', () => {
        expect(formatPeruvianPhoneInput('+51 987654321')).toBe('987654321');
        expect(formatPeruvianPhoneInput('51987')).toBe('51987');
    });

    it('convierte a E.164 y no inventa numero si esta vacio', () => {
        expect(toE164Peru('987654321')).toBe('+51987654321');
        expect(toE164Peru('abc')).toBe('');
    });

    it('acepta solo moviles que empiezan con 9', () => {
        expect(isPeruvianMobile('987654321')).toBe(true);
        expect(isPeruvianMobile('+51987654321')).toBe(true);
        expect(isPeruvianMobile('187654321')).toBe(false);
        expect(isPeruvianMobile('98765')).toBe(false);
    });
});
