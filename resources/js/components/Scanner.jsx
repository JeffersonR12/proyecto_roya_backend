import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { saveDiagnostico } from '../lib/diagnosticosDb.js';
import { createDiagnosticoLocal, toViewModel } from '../lib/inference.js';
import { inferDataUrl } from '../lib/onnxEngine.js';
import { consejoPara, copyFor, resultTone, seguridad, stepFor, TONE_STYLE } from '../lib/fieldFlow.js';
import { TipIcon } from './CaptureGuide.jsx';
import { CameraGlyph, ImageGlyph, PinGlyph } from './Icons.jsx';

const ANALYZE_MIN_MS = 1200;

const TONE_CLASSES = {
    sana: { card: 'is-sana', badge: 'is-sana', bar: 'is-sana' },
    roya: { card: 'is-roya', badge: 'is-roya', bar: 'is-roya' },
    otra: { card: 'is-otra', badge: 'is-otra', bar: 'is-otra' },
    repetir: { card: 'is-repetir', badge: 'is-repetir', bar: 'is-repetir' },
};

const SURE_WIDTH = { alto: '100%', medio: '66%', bajo: '33%' };

async function readGeo() {
    if (!navigator.geolocation) {
        return { latitud: null, longitud: null };
    }

    return new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
            (position) =>
                resolve({
                    latitud: position.coords.latitude,
                    longitud: position.coords.longitude,
                }),
            () => resolve({ latitud: null, longitud: null }),
            { enableHighAccuracy: false, timeout: 4000, maximumAge: 120000 },
        );
    });
}

function compressThumb(dataUrl) {
    return new Promise((resolve) => {
        const image = new Image();
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const max = 480;
            const scale = Math.min(1, max / Math.max(image.width, image.height));
            canvas.width = Math.max(1, Math.round(image.width * scale));
            canvas.height = Math.max(1, Math.round(image.height * scale));
            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
            resolve(canvas.toDataURL('image/jpeg', 0.72));
        };
        image.onerror = () => resolve(dataUrl);
        image.src = dataUrl;
    });
}

const wait = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

function Stepper({ step, labels, onGoStep1 }) {
    return (
        <ol className="field-stepper" aria-label="Pasos">
            {labels.map((label, index) => {
                const n = index + 1;
                const state = n < step ? 'is-done' : n === step ? 'is-current' : '';
                const content = (
                    <>
                        <span className="field-step-bar" aria-hidden="true" />
                        <span className="field-step-label">{label}</span>
                    </>
                );

                return (
                    <li key={label} className={`field-step ${state}`} aria-current={n === step ? 'step' : undefined}>
                        {n === 1 && step > 1 ? (
                            <button type="button" onClick={onGoStep1} className="field-step-btn">
                                {content}
                            </button>
                        ) : (
                            <span className="field-step-btn">{content}</span>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

export default function Scanner({
    onSaved,
    parcelas = [],
    lote = '',
    onLoteChange,
    onCreateLote,
    onOpenHistory,
    onOpenProtocol,
    lang = 'es',
}) {
    const copy = copyFor(lang);
    const reduceMotion = useReducedMotion();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileRef = useRef(null);
    const streamRef = useRef(null);
    const cancelledRef = useRef(false);

    const [loteDecidido, setLoteDecidido] = useState(Boolean(lote));
    const [choosingLote, setChoosingLote] = useState(false);
    const [newLoteOpen, setNewLoteOpen] = useState(false);
    const [newLoteName, setNewLoteName] = useState('');
    const [cameraActive, setCameraActive] = useState(false);
    const [cameraDenied, setCameraDenied] = useState(false);
    const [imageBase64, setImageBase64] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');
    const [failedTries, setFailedTries] = useState(0);
    const [dropActive, setDropActive] = useState(false);

    const step = choosingLote ? 1 : stepFor({ loteDecidido, hasImage: Boolean(imageBase64), hasResult: Boolean(result) });

    useEffect(() => () => stopCamera(), []);

    useEffect(() => {
        if (cameraActive && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [cameraActive, step]);

    const stopCamera = () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setCameraActive(false);
    };

    const pickLote = (nombre) => {
        onLoteChange?.(nombre);
        setLoteDecidido(true);
        setChoosingLote(false);
        setNewLoteOpen(false);
    };

    const createLote = (event) => {
        event.preventDefault();
        const nombre = newLoteName.trim();
        if (!nombre) {
            return;
        }
        onCreateLote?.(nombre);
        setNewLoteName('');
        pickLote(nombre);
    };

    const startCamera = async () => {
        setError('');
        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraDenied(true);
            fileRef.current?.click();
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: 'environment' } },
                audio: false,
            });
            streamRef.current = stream;
            setCameraDenied(false);
            setCameraActive(true);
        } catch {
            setCameraDenied(true);
        }
    };

    const analyze = async (dataUrl) => {
        cancelledRef.current = false;
        setImageBase64(dataUrl);
        setAnalyzing(true);
        setError('');

        try {
            const [prediccion] = await Promise.all([inferDataUrl(dataUrl), wait(reduceMotion ? 0 : ANALYZE_MIN_MS)]);
            if (cancelledRef.current) {
                return;
            }
            const [geo, thumb] = await Promise.all([readGeo(), compressThumb(dataUrl)]);
            const diagnostico = createDiagnosticoLocal({
                prediccion,
                imagen_thumb: thumb,
                parcela_nota: lote,
                latitud: geo.latitud,
                longitud: geo.longitud,
                modelo_version: prediccion.modelo_version,
            });

            await saveDiagnostico(diagnostico);
            if (cancelledRef.current) {
                return;
            }

            const tone = resultTone(prediccion);
            if (tone === 'repetir') {
                setFailedTries((n) => n + 1);
            }
            setResult({
                tone,
                sure: seguridad(prediccion.confianza),
                unavailable: prediccion.runtime === 'placeholder-uniform',
            });
            onSaved?.(toViewModel(diagnostico));
        } catch (err) {
            if (!cancelledRef.current) {
                console.warn('[RiwiScan] análisis falló', err);
                setError(copy.analysisFailed);
                setImageBase64(null);
            }
        } finally {
            setAnalyzing(false);
        }
    };

    const takePhoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;

        if (!video || !canvas || !video.videoWidth) {
            return;
        }

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        navigator.vibrate?.(40);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
        stopCamera();
        void analyze(dataUrl);
    };

    const readImage = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            setError(copy.badFile);
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            stopCamera();
            void analyze(event.target.result);
        };
        reader.readAsDataURL(file);
    };

    const cancelAnalysis = () => {
        cancelledRef.current = true;
        setAnalyzing(false);
        setImageBase64(null);
    };

    const scanAgain = () => {
        setResult(null);
        setImageBase64(null);
        setError('');
        void startCamera();
    };

    const motionProps = reduceMotion
        ? {}
        : {
              initial: { opacity: 0, x: 24 },
              animate: { opacity: 1, x: 0 },
              exit: { opacity: 0, x: -24 },
              transition: { duration: 0.25, ease: 'easeOut' },
          };

    const tone = result ? TONE_CLASSES[result.tone] : null;
    const tipId = consejoPara(Math.max(0, failedTries - 1));

    return (
        <section className="field-scanner" aria-label={copy.photoTitle}>
            <Stepper step={step} labels={copy.steps} onGoStep1={() => setChoosingLote(true)} />

            <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => {
                    readImage(event.target.files[0]);
                    event.target.value = '';
                }}
            />
            <canvas ref={canvasRef} className="hidden"></canvas>

            <AnimatePresence mode="wait" initial={false}>
                {step === 1 ? (
                    <motion.div key="lote" {...motionProps}>
                        <h2 className="field-title">{copy.whereTitle}</h2>
                        {parcelas.length === 0 && !newLoteOpen ? (
                            <p className="mb-3 text-sm text-navy/60">{copy.whereEmpty}</p>
                        ) : null}
                        <div className="grid gap-3 sm:grid-cols-2">
                            {parcelas.map((parcela) => (
                                <button
                                    key={parcela.nombre}
                                    type="button"
                                    onClick={() => pickLote(parcela.nombre)}
                                    className={`field-lote ${parcela.nombre === lote ? 'is-on' : ''}`}
                                >
                                    <span className="field-lote-icon" aria-hidden="true">
                                        <PinGlyph />
                                    </span>
                                    <span className="min-w-0">
                                        <span className="block truncate font-extrabold text-navy">{parcela.nombre}</span>
                                        {parcela.ubicacion ? (
                                            <span className="block truncate text-xs text-navy/55">{parcela.ubicacion}</span>
                                        ) : null}
                                    </span>
                                </button>
                            ))}
                            {newLoteOpen ? (
                                <form onSubmit={createLote} className="field-lote is-new sm:col-span-2">
                                    <input
                                        autoFocus
                                        value={newLoteName}
                                        onChange={(event) => setNewLoteName(event.target.value)}
                                        placeholder={copy.newLotePlaceholder}
                                        aria-label={copy.newLotePlaceholder}
                                        className="min-h-12 min-w-0 flex-1 rounded-full bg-white px-4 text-base text-navy outline-none ring-1 ring-teal/20 focus:ring-2 focus:ring-teal"
                                    />
                                    <button type="submit" className="field-btn-primary !w-auto px-6">
                                        {copy.createLote}
                                    </button>
                                </form>
                            ) : (
                                <button type="button" onClick={() => setNewLoteOpen(true)} className="field-lote is-add">
                                    <span className="field-lote-icon" aria-hidden="true">
                                        +
                                    </span>
                                    <span className="font-extrabold">{copy.newLote}</span>
                                </button>
                            )}
                        </div>
                        <button type="button" onClick={() => pickLote('')} className="field-link mt-4">
                            {copy.skipLote}
                        </button>
                    </motion.div>
                ) : null}

                {step === 2 ? (
                    <motion.div key="foto" {...motionProps}>
                        <div className="field-photo-head">
                            <h2 className="field-title !mb-0">{copy.photoTitle}</h2>
                            <button type="button" onClick={() => setChoosingLote(true)} className="field-lote-chip">
                                <PinGlyph className="h-4 w-4 shrink-0" />
                                <span className="truncate">{lote || copy.noLote}</span>
                                <span className="field-lote-chip-action">{copy.changeLote}</span>
                            </button>
                        </div>

                        <div
                            className={`field-viewer ${dropActive ? 'drop-active' : ''}`}
                            onDragOver={(event) => {
                                event.preventDefault();
                                setDropActive(true);
                            }}
                            onDragLeave={() => setDropActive(false)}
                            onDrop={(event) => {
                                event.preventDefault();
                                setDropActive(false);
                                readImage(event.dataTransfer.files[0]);
                            }}
                        >
                            {cameraActive ? (
                                <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" autoPlay playsInline muted></video>
                            ) : null}
                            {imageBase64 ? (
                                <img src={imageBase64} className="absolute inset-0 h-full w-full object-cover" alt="" />
                            ) : null}

                            {cameraActive || analyzing ? (
                                <div className="field-frame" aria-hidden="true">
                                    <svg viewBox="0 0 100 160" className="h-[78%]">
                                        <path
                                            d="M50 4 C82 40 84 112 50 156 C16 112 18 40 50 4 Z"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeDasharray="6 5"
                                        />
                                    </svg>
                                </div>
                            ) : null}

                            {cameraActive && !analyzing ? (
                                <>
                                    <p className="field-viewer-hint">{copy.frameHint}</p>
                                    <button type="button" onClick={takePhoto} className="field-shutter" aria-label={copy.shutter}>
                                        <span />
                                    </button>
                                </>
                            ) : null}

                            {!cameraActive && !imageBase64 ? (
                                <div className="field-viewer-open">
                                    <svg className="field-viewer-guide" viewBox="0 0 100 160" aria-hidden="true">
                                        <path d="M50 4 C82 40 84 112 50 156 C16 112 18 40 50 4 Z" />
                                        <path d="M50 14 V148" />
                                    </svg>
                                    {cameraDenied ? <p className="field-viewer-note">{copy.cameraBlocked}</p> : null}
                                    <button
                                        type="button"
                                        onClick={cameraDenied ? () => fileRef.current?.click() : startCamera}
                                        className="field-viewer-cta"
                                    >
                                        {cameraDenied ? <ImageGlyph /> : <CameraGlyph />}
                                        {cameraDenied ? copy.upload : copy.openCamera}
                                    </button>
                                    <p className="field-viewer-drop">{copy.dropHint}</p>
                                </div>
                            ) : null}

                            {analyzing ? (
                                <div className="field-analyzing" role="status">
                                    <span className="field-scanline" aria-hidden="true" />
                                    <p className="field-analyzing-text">{copy.analyzing}</p>
                                    <button type="button" onClick={cancelAnalysis} className="field-analyzing-cancel">
                                        {copy.cancel}
                                    </button>
                                </div>
                            ) : null}
                        </div>

                        {error ? (
                            <p className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700" role="alert">
                                {error}
                            </p>
                        ) : null}

                        {!analyzing ? (
                            <button type="button" onClick={() => fileRef.current?.click()} className="field-link mt-3">
                                <ImageGlyph /> {copy.upload}
                            </button>
                        ) : null}
                    </motion.div>
                ) : null}

                {step === 3 && result ? (
                    <motion.div key="resultado" {...motionProps}>
                        <div className={`field-result ${tone.card}`} role="status" aria-live="polite">
                            <div className="flex items-start gap-4">
                                {imageBase64 ? (
                                    <img src={imageBase64} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover sm:h-24 sm:w-24" />
                                ) : null}
                                <div className="min-w-0 flex-1">
                                    <span className={`field-result-badge ${tone.badge}`} aria-hidden="true">
                                        {TONE_STYLE[result.tone].icon}
                                    </span>
                                    <h2 className="field-result-title">{copy.results[result.tone].title}</h2>
                                    <p className="field-result-text">
                                        {result.unavailable ? copy.unavailable : copy.results[result.tone].text}
                                    </p>
                                </div>
                            </div>

                            {result.tone !== 'repetir' ? (
                                <div className="mt-5">
                                    <p className="field-sure-label">{copy.sure[result.sure]}</p>
                                    <div className="field-sure-track">
                                        <motion.div
                                            className={`field-sure-fill ${tone.bar}`}
                                            style={{ width: SURE_WIDTH[result.sure], transformOrigin: 'left center' }}
                                            initial={reduceMotion ? false : { scaleX: 0 }}
                                            animate={{ scaleX: 1 }}
                                            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="field-result-tip">
                                    <TipIcon id={tipId} className="h-6 w-6 shrink-0" />
                                    <p>
                                        <strong>{copy.tryTip}</strong> {copy.tips[tipId]}
                                    </p>
                                </div>
                            )}

                            <motion.p
                                className="field-saved"
                                initial={reduceMotion ? false : { scale: 0.6, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 0.25 }}
                            >
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                                    <path d="M5 12.5 9.5 17 19 7" />
                                </svg>
                                {copy.saved}
                            </motion.p>
                        </div>

                        <div className="mt-4 grid gap-3">
                            {result.tone === 'roya' ? (
                                <button type="button" onClick={onOpenProtocol} className="field-btn-danger">
                                    {copy.whatToDo}
                                </button>
                            ) : null}
                            <button type="button" onClick={scanAgain} className={result.tone === 'roya' ? 'field-btn-secondary' : 'field-btn-primary'}>
                                {result.tone === 'repetir' ? copy.retake : copy.scanAgain}
                            </button>
                            <button type="button" onClick={onOpenHistory} className="field-link justify-center">
                                {copy.history}
                            </button>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>
        </section>
    );
}
