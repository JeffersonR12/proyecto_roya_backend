import 'cypress-mochawesome-reporter/register';
import './commands';

// Capturas del área visible (1280x720): la captura de página completa compone varias
// imágenes y en Electron headless puede superar el tiempo límite.
Cypress.Screenshot.defaults({ capture: 'viewport' });
