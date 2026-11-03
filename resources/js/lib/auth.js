export const GMAIL_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

export const PERU_MOBILE_REGEX = /^\+519\d{8}$/;

export function isGmailEmail(value) {
    return GMAIL_EMAIL_REGEX.test(String(value || '').trim().toLowerCase());
}

export function formatPeruvianPhoneInput(value) {
    let digits = String(value || '').replace(/\D/g, '');

    if (digits.startsWith('51') && digits.length > 9) {
        digits = digits.slice(2);
    }

    return digits.slice(0, 9);
}

export function toE164Peru(value) {
    const national = formatPeruvianPhoneInput(value);

    return national ? `+51${national}` : '';
}

export function isPeruvianMobile(value) {
    return PERU_MOBILE_REGEX.test(toE164Peru(value));
}
