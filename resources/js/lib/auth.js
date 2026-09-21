export const GMAIL_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

export function isGmailEmail(value) {
    return GMAIL_EMAIL_REGEX.test(String(value || '').trim().toLowerCase());
}
