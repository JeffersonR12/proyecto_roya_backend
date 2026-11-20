# 6. Integración y análisis de calidad con SonarQube

## 6.1 Configuración

**Plataforma.** Se utilizó un servidor **SonarQube Community Build 26.10.0** instalado localmente como contenedor Docker (imagen `sonarqube:community`, contenedor `sonarqube`, puerto 9000). Los datos, extensiones y logs se guardan en volúmenes persistentes (`sonarqube_data`, `sonarqube_extensions`, `sonarqube_logs`). Se eligió la instalación local porque el código fuente y los resultados del análisis no salen del equipo de desarrollo y porque no se depende de servicios externos, lo que es coherente con la arquitectura *offline-first* del proyecto.

El análisis se ejecuta con el escáner oficial `@sonar/scan` (npm). Este escáner descarga su propio entorno Java 17, así que no depende del Java 8 instalado en el equipo.

**Proyecto.** Es un proyecto local con clave `proyecto-roya-backend`, la Quality Gate predeterminada **"Sonar way"**, código nuevo definido como **"Previous version"** y un token de análisis exclusivo del proyecto. Las métricas e *issues* se exportaron con la API REST del servidor (`/api/measures/component`, `/api/issues/search`, `/api/qualitygates/project_status`) usando un *User Token*, para conservar la línea base de cada fase.

**Archivo `sonar-project.properties`:**

```properties
sonar.host.url=http://localhost:9000
sonar.projectKey=proyecto-roya-backend
sonar.projectName=RiwiScan - Proyecto Roya Backend
sonar.projectVersion=2.0
sonar.sourceEncoding=UTF-8

sonar.sources=app,routes,config,database,resources,scripts,public/sw.js
sonar.exclusions=vendor/**,node_modules/**,storage/**,public/build/**,public/onnx/**,public/models/**,bootstrap/cache/**,coverage/**,cypress/**,**/*.test.js

sonar.tests=tests,resources/js,cypress
sonar.test.inclusions=tests/**/*.php,resources/js/**/*.test.js,cypress/e2e/**/*.cy.js,cypress/support/**/*.js
sonar.test.exclusions=cypress/videos/**,cypress/screenshots/**,cypress/reports/**,cypress/fixtures/**

sonar.python.version=3.10
sonar.coverage.exclusions=scripts/**,database/**,config/**,routes/**,resources/views/**

sonar.php.coverage.reportPaths=coverage/clover.xml
sonar.php.tests.reportPath=coverage/junit.xml
sonar.javascript.lcov.reportPaths=coverage/js/lcov.info
```

**Alcance del análisis:**

| Elemento | Incluido como | Justificación |
|---|---|---|
| `app/` (controladores, servicios, middleware, modelos) | Código fuente, con cobertura | Núcleo del backend Laravel |
| `resources/js/` (PWA React, motor ONNX, cola de sincronización) | Código fuente, con cobertura | Núcleo del nodo Edge |
| `public/sw.js` | Código fuente | Service Worker propio (modo offline) |
| `routes/`, `config/`, `database/`, `resources/views/` | Código fuente, sin cobertura | Archivos declarativos: se revisan para detectar *issues*, pero no tienen lógica que probar |
| `scripts/` (Python) | Código fuente, sin cobertura | Herramientas de entrenamiento y exportación de la CNN; se ejecutan fuera de línea |
| `tests/`, `*.test.js`, `cypress/` | Código de pruebas | PHPUnit, Vitest y Cypress |
| `vendor/`, `node_modules/`, `public/build`, `public/onnx`, `public/models` | Excluidos | Dependencias de terceros y artefactos generados o binarios |

Los componentes de interfaz (`.jsx`) **no se excluyeron de la cobertura**. Excluirlos habría elevado el porcentaje global de forma artificial. Su validación se explica en la sección 6.6.

**Cobertura.** SonarQube no ejecuta las pruebas, solo importa los reportes que ya existen:
- **PHP:** PHPUnit 11 con el *driver* **PCOV 1.0.12** (PHP 8.4 NTS x64) genera `coverage/clover.xml` y `coverage/junit.xml`.
- **JavaScript:** Vitest 3.2 con **@vitest/coverage-v8** genera `coverage/js/lcov.info`.

## 6.2 Ejecución

```powershell
Set-Location C:\xampp\htdocs\proyecto_roya_backend-main

# 0. Servidor SonarQube (Docker Desktop iniciado)
docker start sonarqube
Invoke-RestMethod http://localhost:9000/api/system/status      # esperar status = UP

# 1. Cobertura PHP
php vendor\bin\phpunit --coverage-clover coverage/clover.xml --log-junit coverage/junit.xml

# 2. Cobertura JavaScript
npm run test:js:coverage

# 3. Análisis (el token se pasa por variable de entorno, no queda en archivos)
$env:SONAR_TOKEN = "<token de análisis del proyecto>"
npx @sonar/scan
# Salida esperada: ANALYSIS SUCCESSFUL ... EXECUTION SUCCESS

# 4. Exportación de resultados para el informe (User Token)
$h = @{ Authorization = "Bearer <user token>" }
Invoke-RestMethod "http://localhost:9000/api/measures/component?component=proyecto-roya-backend&metricKeys=alert_status,bugs,vulnerabilities,code_smells,coverage,duplicated_lines_density,security_hotspots,reliability_rating,security_rating,sqale_rating,sqale_index,ncloc,lines_to_cover,uncovered_lines" -Headers $h
```

## 6.3 Fase 1: diagnóstico inicial (primer análisis, 10/11/2026)

### 6.3.1 Métricas

| Métrica | Resultado | Qué significa para RiwiScan |
|---|---|---|
| **Quality Gate** | **Passed (OK)** | La puerta "Sonar way" evalúa solo el **código nuevo**: cobertura ≥ 80 %, duplicación ≤ 3 % y 0 *issues* nuevos. En el primer análisis el período de código nuevo estaba vacío (cobertura nueva 0,0 % sobre 0 líneas, 0 *issues* nuevos), así que la puerta aprobó **por ausencia de código nuevo**, no por la calidad del código existente. Por eso la interpretación se basa en el código global (*Overall Code*). |
| **Bugs** (Reliability) | **1**, calificación **C** | Un error que puede producir un comportamiento incorrecto en ejecución: una promesa sin controlar en el Service Worker. Una sola incidencia de severidad media basta para bajar la confiabilidad a C. |
| **Vulnerabilities** (Security) | **1**, calificación **C** | Uso de un generador pseudoaleatorio en el script de entrenamiento. Requiere revisión de contexto (ver 6.3.2). |
| **Security Hotspots** | **0** | No hay código sensible pendiente de revisión manual. |
| **Code Smells** (Maintainability) | **2**, calificación **A**, deuda técnica **15 min** | Deuda de mantenimiento muy baja para unas 11 422 líneas de código. |
| **Coverage** | **35,6 %** (5942 líneas a cubrir, 4001 sin cubrir) | Proporción de líneas que ejecutan las pruebas automáticas. La cifra global oculta una distribución muy desigual por capas (ver 6.3.3). |
| **Duplicated Lines** | **1,6 %** | Duplicación baja, por debajo del umbral de 3 % de la Quality Gate. |
| Tamaño | **11 422** líneas de código (ncloc) | PHP, JavaScript/JSX y Python |

### 6.3.2 Issues detectados

| # | Archivo y línea | Regla | Tipo | Severidad | Descripción |
|---|---|---|---|---|---|
| 1 | `public/sw.js:66` | javascript:S9383 | **Bug** | Major (Reliability: media) | La promesa `caches.open(...).then(cache.put)` no se esperaba ni se controlaba con `.catch`. |
| 2 | `scripts/train_export_cnn.py:120` | python:S2245 | **Vulnerability** | Major (Security: media) | Uso de `random.Random(seed)`, un generador pseudoaleatorio no criptográfico. |
| 3 | `resources/js/components/Scanner.jsx:322` | javascript:S9379 | Code Smell | Major (Reliability: media) | El atributo `autoFocus` puede perjudicar la accesibilidad. |
| 4 | `cypress/e2e/E2E-07_control_acceso_rol.cy.js:26` | javascript:S2699 | Code Smell | **Blocker** | El caso de prueba no tiene una aserción que Sonar reconozca. |

### 6.3.3 Cobertura por capa (medida con los reportes locales)

| Capa | Cobertura | Lectura |
|---|---|---|
| PHP `app/` (backend completo) | 85,4 % | Buena. El único hueco relevante era `Api/ConsultaController.php` (0 %). |
| PHP `app/Services/` (sincronización, alertas, evidencias) | 95,7 % | Muy alta en la lógica de negocio crítica |
| JS `resources/js/lib/` (lógica Edge) | 74,1 % | Aceptable, pero `onnxEngine.js` (motor de inferencia) y `diagnosticosDb.js` (IndexedDB) estaban en **0 %** |
| JS componentes `.jsx` (interfaz) | 0 % (3373 líneas) | Sin pruebas unitarias de componentes. Es la causa principal del 35,6 % global. |

## 6.4 Fase 2: mejoras implementadas (segunda pasada)

### 6.4.1 Corrección de los issues

| # | Issue | Corrección aplicada | Justificación |
|---|---|---|---|
| 1 | Bug S9383, `public/sw.js` | El manejador *cache-first* se reescribió con funciones `async` (`cacheFirstResponse`, `saveInCache`). La escritura en caché se registra con `event.waitUntil(...)` y los errores de almacenamiento se capturan. | Además de cumplir la regla, corrige un riesgo real: sin `waitUntil` el navegador puede terminar el Service Worker antes de guardar el modelo ONNX (~6 MB), y entonces el escáner no funcionaría sin conexión en campo. También elimina las promesas anidadas (S9381). |
| 2 | Vulnerability S2245, `train_export_cnn.py` | Se revisó y se documentó en el código la justificación del uso, con un comentario y `# NOSONAR`. **No se reemplazó el generador.** En el segundo análisis el issue **sigue abierto** (línea 122): SonarQube no aplicó la supresión `NOSONAR` a esta regla de seguridad. | El generador solo baraja el *split* train/val/test con una semilla fija para que los experimentos sean reproducibles. No protege ningún secreto. Un generador criptográfico (`secrets`) no admite semilla y rompería la reproducibilidad del entrenamiento. Es un falso positivo por contexto, y la vía correcta para cerrarlo es marcarlo como *False Positive* en SonarQube con la justificación (ver 6.5, pregunta 4), no cambiar el código. |
| 3 | S9379, `Scanner.jsx` | Se reemplazó `autoFocus` por un `useRef` y un `useEffect` que llevan el foco al campo solo cuando el usuario pulsa "Nuevo lote". | El foco ya no cambia al cargar la vista (lo que molesta a los lectores de pantalla). Solo se mueve como respuesta a una acción explícita del usuario. |
| 4 | Blocker S2699, `E2E-07` | Se agregó una aserción `expect` sobre la API: el técnico supera el middleware `EnsureRole` (no recibe 403) y llega al controlador (404 para un UUID inexistente). | La prueba ahora verifica la autorización del técnico en el backend, no solo en la interfaz. |

### 6.4.2 Defectos funcionales corregidos (detectados con Cypress, sección 5)

| Defecto | Corrección en `resources/js/lib/onnxEngine.js` | Verificación |
|---|---|---|
| **DEF-01**: en modo desarrollo, ONNX Runtime buscaba su WASM en el servidor de Vite y la CNN nunca se ejecutaba | Nueva función `wasmBaseUrl()`: `wasmPaths` usa una URL absoluta al origen de la página (`new URL('/onnx/', location.origin)`) | Prueba unitaria de regresión. **E2E-06 ejecutado con `npm run dev`: aprobado.** El registro sincronizado (`diagnosticos.id = 9`) tiene `modelo_version = roya-mobilenetv3-small-v1`, sin el sufijo `+sin-pesos`. |
| **DEF-02**: un fallo del runtime se trataba como "falta el modelo" y se guardaba un resultado uniforme como válido | `isModelMissing()` descarta los errores de carga del runtime (`no available backend`, `dynamically imported module`, `WebAssembly`); esos errores se propagan y el escáner muestra "No pudimos revisar la foto". El respaldo por modelo ausente queda registrado con `console.warn`. | Prueba unitaria de regresión con el mensaje de error real que se capturó en el diagnóstico |

### 6.4.3 Aumento de la cobertura

Se escribieron **36 pruebas nuevas** (7 PHPUnit y 29 Vitest) dirigidas a la lógica de negocio sin cubrir:

| Archivo de prueba | Pruebas | Qué valida |
|---|---|---|
| `tests/Feature/ConsultaApiTest.php` | 7 | Catálogo activo y ordenado; parcelas y alertas aisladas por tenant y por rol; filtro `no_leidas`; un agricultor no puede marcar alertas ajenas (404) |
| `resources/js/lib/onnxEngine.test.js` | 14 | Tensor NCHW con normalización ImageNet, caché y reintento de la sesión, inferencia, umbral de 75 %, respaldo por modelo ausente, propagación de errores, latencia, DEF-01 y DEF-02 (ONNX Runtime simulado con `vi.mock`) |
| `resources/js/lib/diagnosticosDb.test.js` | 8 | IndexedDB (`fake-indexeddb`): validaciones, idempotencia por `uuid_local`, orden, cola de pendientes, actualización y estado de sincronización |
| `resources/js/lib/roles.test.js` | 3 | Rol por defecto de mínimo privilegio; solo técnico y administrador acceden a HITL |
| `resources/js/lib/pwa.test.js` | 4 | El Service Worker se registra solo en producción y su fallo no rompe la app |

**Resultados** (todas las suites en verde: PHPUnit 70/70, Vitest 135/135, Cypress 12/12):

| Capa | Fase 1 | Fase 2 | Variación |
|---|---|---|---|
| PHP `app/` | 85,4 % | **90,9 %** | +5,5 pp |
| PHP `app/Services/` | 95,7 % | **95,7 %** | ya era alta (sin cambios) |
| JS `resources/js/lib/` | 74,1 % | **87,1 %** | +13,0 pp |
| `onnxEngine.js` (motor de inferencia) | 0 % | **99,2 %** | +99,2 pp |
| `diagnosticosDb.js` (persistencia Edge) | 0 % | **93,8 %** | +93,8 pp |
| JS componentes `.jsx` | 0 % | 0 % | — (cubiertos con E2E, ver 6.6) |

**Segundo análisis de SonarQube (10/11/2026):**

| Métrica | Fase 1 | Fase 2 | Resultado |
|---|---|---|---|
| Quality Gate | Passed (sin código nuevo que evaluar) | **Failed**: cobertura del código nuevo 62,9 % < 80 % | Ver 6.5, pregunta 1 |
| Issues abiertos | 4 | **1** | −75 % |
| Bugs / Reliability | 1 / C | **0 / A** | Corregido |
| Vulnerabilities / Security | 1 / C | 1 / C | Falso positivo justificado (S2245) |
| Code Smells / Maintainability | 2 / A | **0 / A** | Corregido |
| Deuda técnica | 15 min | **0 min** | Eliminada |
| Coverage global | 35,6 % (1941 de 5942 líneas cubiertas) | **40,7 %** (2217 de 5930) | +5,1 pp; 276 líneas más cubiertas |
| Duplicated Lines | 1,6 % | 1,6 % | Sin cambios; 0,0 % en el código nuevo |
| Código nuevo | — | 629 líneas nuevas, 28 a cubrir; 0 issues nuevos | Las correcciones no introdujeron problemas |

## 6.5 Interpretación

**1. ¿Qué resultado obtuvo el proyecto en el Quality Gate?**
Los dos análisis dieron resultados opuestos, y ninguno debe leerse de forma literal.

- **Fase 1, Passed.** La puerta aprobó porque el período de código nuevo estaba vacío: "Sonar way" solo evalúa el código nuevo, y en un primer análisis no lo hay. Ese resultado no certificaba la calidad global; las calificaciones de *Overall Code* (confiabilidad C y seguridad C) mostraban problemas reales.
- **Fase 2, Failed.** Las correcciones sí constituyen código nuevo (629 líneas, 28 de ellas ejecutables y por tanto "a cubrir"). De las tres condiciones, dos se cumplen: **0 issues nuevos** y **0,0 % de duplicación**. Falla solo la tercera: **la cobertura del código nuevo es 62,9 % frente al 80 % exigido.** Las líneas nuevas cubiertas corresponden a `onnxEngine.js` (DEF-01 y DEF-02, con pruebas de regresión). Las que no están cubiertas pertenecen a `Scanner.jsx` (manejo del foco) y `public/sw.js` (Service Worker), dos componentes que no tienen pruebas unitarias: el primero se valida con Cypress (E2E-06) y el segundo se ejecuta en el contexto del navegador.

La guía de la práctica indica que no se exige una Quality Gate aprobada, sino interpretar por qué pasa o falla. En este caso el "Failed" no indica que la calidad empeoró: todas las métricas globales mejoraron o se mantuvieron. Indica que la puerta aplica sobre los archivos modificados el mismo umbral del 80 % que el proyecto todavía no alcanza en la capa de interfaz. La acción para que apruebe es concreta: pruebas de componentes para `Scanner.jsx` y una prueba del Service Worker (6.5, pregunta 6).

**2. ¿Qué problemas fueron identificados?**
En la Fase 1 SonarQube identificó **4 issues**: 1 bug (promesa no controlada en el Service Worker), 1 vulnerabilidad (generador pseudoaleatorio en el entrenamiento), 1 problema de accesibilidad (`autoFocus`) y 1 prueba sin aserción reconocible. Además, la cobertura global era de 35,6 %. Después de la segunda pasada **queda 1 issue** (−75 %): la vulnerabilidad S2245, que es un falso positivo justificado. Confiabilidad pasó de C a A y la deuda técnica de 15 min a 0. El análisis se complementó con los dos defectos funcionales que detectó Cypress (DEF-01 y DEF-02), que SonarQube no puede ver porque dependen de la configuración en tiempo de ejecución. Las dos herramientas se complementan: Sonar encuentra problemas estáticos y Cypress encuentra problemas de integración.

**3. ¿Qué componentes presentan mayores observaciones?**
La capa Edge del frontend. El único bug está en `public/sw.js`, que es el componente que permite trabajar sin conexión. Los componentes de interfaz (`Scanner.jsx`, `RoyaGuard.jsx`) concentran las 3373 líneas sin pruebas unitarias. Y el motor de inferencia `onnxEngine.js`, el núcleo funcional del sistema, no tenía ninguna prueba unitaria; justamente ahí estaban DEF-01 y DEF-02. El backend PHP tenía muy pocas observaciones (cobertura de 85,4 %, 0 issues).

**4. ¿Qué vulnerabilidades fueron detectadas?**
Una: `python:S2245`, en `scripts/train_export_cnn.py:120`, por el uso de `random.Random`. Tras revisar el contexto, se clasificó como **falso positivo**: el generador solo reparte las imágenes del dataset entre entrenamiento, validación y prueba con una semilla fija para que el experimento sea reproducible. No genera tokens, contraseñas ni secretos. Sustituirlo por un generador criptográfico habría sido una "corrección" contraproducente, porque impediría reproducir el entrenamiento. Se documentó la decisión en el código, pero SonarQube no aplicó la supresión `# NOSONAR` a esta regla de seguridad. Por eso el issue sigue abierto en la Fase 2 y la calificación de seguridad se mantiene en C. El cierre auditable es marcarlo en SonarQube como **False Positive** con la justificación (Issues → S2245 → *Change status*). Así la decisión queda registrada con autor y fecha, y la calificación de seguridad sube a A sin modificar un código que es correcto. No se detectaron vulnerabilidades en la autenticación, la API ni el manejo de sesiones, y no hubo *Security Hotspots*.

**5. ¿Cuál es el nivel de cobertura de código obtenido?**
Es de 35,6 % global en la Fase 1 y **40,7 % en la Fase 2**: 276 líneas más cubiertas y 62,9 % en el código nuevo. La cifra global debe leerse por capas. La lógica que decide el diagnóstico y protege los datos está muy cubierta: servicios PHP 95,7 %, backend 90,9 %, lógica Edge 87,1 %, motor de inferencia 99,2 %. La interfaz React (unas 3400 líneas) está en 0 % de cobertura unitaria y es la que reduce el promedio.

**6. ¿Qué mejoras deberían implementarse para elevar la calidad?**
Las mejoras de la Fase 2 ya se aplicaron (sección 6.4). Las acciones pendientes, por prioridad:

| Prioridad | Acción | Efecto esperado |
|---|---|---|
| 0 | Marcar S2245 como *False Positive* en SonarQube con la justificación documentada | Seguridad pasa de C a A; queda registrada la decisión de revisión |
| 1 | Medir la cobertura de las pruebas E2E: instrumentar el build con `vite-plugin-istanbul` y `@cypress/code-coverage`, y fusionar el resultado con el `lcov` de Vitest | La cobertura de la interfaz que hoy validan los 12 casos E2E pasaría a figurar en SonarQube |
| 2 | Pruebas de componentes con React Testing Library para `Scanner`, `Login` y `HitlPage` | Cobertura unitaria de la interfaz y acercamiento al 80 % que exige la Quality Gate en código nuevo |
| 3 | Eliminar el código muerto: `app.jsx`, `app.js`, `Header.jsx`, `Dashboard.jsx`, `scan.blade.php`, `welcome.blade.php`, y la ruta `POST /analysis` con la tabla `analyses`, ya sustituida por `diagnosticos` | Menos líneas sin cubrir y menos superficie de mantenimiento |
| 4 | Dividir `Scanner.jsx` (517 líneas) en selector de lote, visor de cámara y tarjeta de resultado, y extraer de `RoyaGuard.jsx` un hook `useSync` | Menor complejidad cognitiva; componentes más fáciles de probar |
| 5 | Unificar el rol del usuario en `rol_id` (eliminar la columna de texto `users.role`) | Una sola fuente de verdad para el control de acceso |
| 6 | Mostrar las cuentas de demostración de `Login.jsx` solo cuando `APP_ENV=local` | No exponer credenciales de prueba en producción |
| 7 | Integrar el análisis en GitHub Actions (PHPUnit, Vitest y `sonar-scanner` en cada *pull request*) | La Quality Gate actúa como control preventivo sobre el código nuevo |

## 6.6 Conclusión: cobertura por capas

La segunda pasada **redujo los issues de 4 a 1 (−75 %)**, llevó la confiabilidad de C a A, eliminó la deuda técnica (de 15 min a 0) y subió la cobertura global de **35,6 % a 40,7 %** sin introducir ningún issue nuevo. El issue restante es un falso positivo justificado.

La cobertura global se mantiene por debajo del umbral de 80 % porque **dos tercios de las líneas que Sonar puede cubrir pertenecen a componentes React** que no tienen pruebas unitarias. Se decidió **no excluirlos** de la medición. Hacerlo habría mostrado una cifra alta pero engañosa, contraria al propósito de la métrica.

La estrategia se defiende por capas, según el riesgo que representa cada una para el problema de la roya amarilla:

1. **Lógica que decide el diagnóstico y protege los datos (pruebas unitarias e integración).** Incluye el motor de inferencia (99,2 %), la persistencia offline (93,8 %), la cola de sincronización (92,5 %), los servicios de sincronización, alertas y evidencias del backend (95,7 %) y la API completa (90,9 %). Un error aquí produciría diagnósticos incorrectos, pérdida de capturas hechas sin conexión o fugas de datos entre comunidades. Por eso es donde se concentró el esfuerzo de pruebas.
2. **Interfaz (pruebas E2E).** Los 12 casos de Cypress recorren en un navegador real los flujos que usa el agricultor o el técnico: acceso, registro, recuperación, navegación, escaneo con inferencia local y control de acceso por rol. Esta capa se valida por su comportamiento observable, aunque esa ejecución todavía no se mide como cobertura de líneas (es la mejora de prioridad 1).

La evidencia de que la estrategia funciona es que las dos capas se complementaron. Cypress detectó DEF-01, un defecto que SonarQube y las pruebas unitarias no podían ver. Después, las pruebas unitarias nuevas fijaron la corrección como regresión verificable (`onnxEngine.js` pasó de 0 % a 99,2 %). Así, la calidad del componente más crítico del sistema queda demostrada con pruebas en las tres capas.

Por la misma razón, el Quality Gate fallido de la Fase 2 (62,9 % de cobertura en el código nuevo) es coherente con esta estrategia: las líneas nuevas de lógica están cubiertas, y las que faltan son de interfaz y del Service Worker. La puerta señala con precisión el siguiente paso (pruebas de componentes y medición de la cobertura E2E), en lugar de ocultarlo.

## 6.7 Evidencias

| N.º | Captura | Dónde |
|---|---|---|
| S0 | Servidor activo | `docker ps` (contenedor `sonarqube` en el puerto 9000) e `Invoke-RestMethod http://localhost:9000/api/system/status` con `UP` |
| S1 | PCOV cargado | `php -m | Select-String pcov` |
| S2 | Generación de cobertura | Salida de PHPUnit (`OK (70 tests, 266 assertions)`) y de `npm run test:js:coverage` (135 pruebas) |
| S3 | Análisis exitoso | `npx @sonar/scan` terminando en `ANALYSIS SUCCESSFUL` y `EXECUTION SUCCESS` (Fase 1 y Fase 2) |
| S4 | Panel general, Fase 1 y Fase 2 | `http://localhost:9000/dashboard?id=proyecto-roya-backend`, pestaña **Overall Code** |
| S5 | Quality Gate | Overview, pestaña **New Code** (condiciones evaluadas) |
| S6 | Issues, Fase 1 | Pestaña **Issues** con los 4 issues (archivo, regla y severidad) |
| S7 | Issues, Fase 2 | Pestaña **Issues** después de las correcciones |
| S8 | Cobertura por archivo | **Measures → Coverage**, árbol de `app/Services` y `resources/js/lib` (`onnxEngine.js` 99,2 %) |
| S9 | Evolución | **Activity**: gráfico de cobertura e *issues* entre los dos análisis |
| S10 | Exportación de resultados | `coverage/sonar-issues.json`, `sonar-measures.json` y `sonar-qg.json` (Fase 1), y sus equivalentes `*-fase2.json` (Fase 2) |
| S12 | Quality Gate de la Fase 2 | Summary → **New Code**: "Failed", 62,9 % de cobertura < 80 %, 0 issues nuevos, 0,0 % de duplicación |
| S13 | Advertencias del análisis | Banner "The last analysis has warnings" → *See details* (capturar y describir el contenido) |
| S11 | Verificación de DEF-01 | Cypress E2E-06 aprobado en modo `npm run dev`, y la fila de `diagnosticos` con `modelo_version` sin `+sin-pesos` |
