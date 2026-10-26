import { useEffect, useRef, useState } from 'react';
import { saveDiagnostico } from '../lib/diagnosticosDb.js';
import {
    CLASE_LABELS,
    createDiagnosticoLocal,
    resultadoVista,
    toViewModel,
} from '../lib/inference.js';
import { describeEngineError, inferDataUrl } from '../lib/onnxEngine.js';
import ResultLayers from './ResultLayers.jsx';

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

export default function Scanner({ onSaved, parcelas = [], lote = '', onLoteChange, onGoParcelas, onOpenHistory }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const fileRef = useRef(null);
    const streamRef = useRef(null);
    const cancelledRef = useRef(false);

    const [source, setSource] = useState('camera');
    const [cameraActive, setCameraActive] = useState(false);
    const [canCapture, setCanCapture] = useState(false);
    const [imageBase64, setImageBase64] = useState(null);
    const [location, setLocation] = useState('');
    const [feedback, setFeedback] = useState({ message: '', tone: 'muted' });
    const [saving, setSaving] = useState(false);
    const [dropActive, setDropActive] = useState(false);
    const [riskResult, setRiskResult] = useState(null);
    const [savedOk, setSavedOk] = useState(false);
    const [cameraDenied, setCameraDenied] = useState(false);
    const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine);

    useEffect(() => {
        const on = () => setOnline(true);
        const off = () => setOnline(false);
        window.addEventListener('online', on);
        window.addEventListener('offline', off);

        return () => {
            window.removeEventListener('online', on);
            window.removeEventListener('offline', off);
            stopCamera();
        };
    }, []);

    const stopCamera = () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setCameraActive(false);
        setCanCapture(false);
    };

    const showFeedback = (message, tone = 'muted') => {
        setFeedback({ message, tone });
    };

    const showPreview = (dataUrl, message) => {
        setImageBase64(dataUrl);
        showFeedback(message, 'success');
    };

    const changeSource = (nextSource) => {
        setSource(nextSource);

        if (nextSource === 'upload') {
            stopCamera();
        }
    };

    const startCamera = async () => {
        if (!navigator.mediaDevices?.getUserMedia) {
            setCameraDenied(true);
            showFeedback('Este navegador no permite acceso a la cámara. Usa Subir archivo.', 'error');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: { ideal: 'environment' } },
                audio: false,
            });

            streamRef.current = stream;
            setImageBase64(null);
            setRiskResult(null);
            setSavedOk(false);
            setCameraDenied(false);
            setCameraActive(true);
            setCanCapture(true);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            showFeedback('Apunta a una hoja y toma la fotografía.');
        } catch {
            setCameraDenied(true);
            showFeedback('Permiso de cámara denegado. Sube un archivo para continuar.', 'error');
        }
    };

    const openCanvas = () => {
        if (source === 'upload') {
            fileRef.current?.click();
            return;
        }
        startCamera();
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
        showPreview(canvas.toDataURL('image/jpeg', 0.82), 'Fotografía capturada. Lista para escanear.');
    };

    const readImage = (file) => {
        if (!file || !file.type.startsWith('image/')) {
            showFeedback('Selecciona un archivo de imagen valido (JPG, PNG o WEBP).', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setRiskResult(null);
            showPreview(event.target.result, 'Imagen cargada. Lista para escanear.');
        };
        reader.readAsDataURL(file);
    };

    const resetCapture = () => {
        cancelledRef.current = true;
        setSaving(false);
        setImageBase64(null);
        setRiskResult(null);
        setSavedOk(false);
        showFeedback('Listo para otra captura.');
    };

    const scanLocal = async () => {
        if (!imageBase64 || saving) {
            return;
        }

        cancelledRef.current = false;
        setSaving(true);
        showFeedback('Analizando en el dispositivo…');

        try {
            const prediccion = await inferDataUrl(imageBase64);
            if (cancelledRef.current) {
                return;
            }
            const geo = await readGeo();
            const thumb = await compressThumb(imageBase64);
            const diagnostico = createDiagnosticoLocal({
                prediccion,
                imagen_thumb: thumb,
                parcela_nota: lote || location,
                latitud: geo.latitud,
                longitud: geo.longitud,
                modelo_version: prediccion.modelo_version,
            });

            await saveDiagnostico(diagnostico);
            if (cancelledRef.current) {
                return;
            }

            const vista = resultadoVista(prediccion);
            setRiskResult({
                ...vista,
                confianza: prediccion.confianza,
                severidad: prediccion.severidad,
                clase: prediccion.clase,
                latency_ms: prediccion.latency_ms,
                modelo_version: prediccion.modelo_version,
                sync_status: diagnostico.sync_status,
                runtime: prediccion.runtime,
            });
            setSavedOk(true);

            if (prediccion.runtime === 'placeholder-uniform') {
                showFeedback(
                    'La CNN no corrió: falta public/models/modelo_roya.onnx. Esta foto no se diagnosticó. El no_concluyente no significa que no haya Roya.',
                    'error',
                );
            } else {
                showFeedback(
                    `Guardado · ${diagnostico.sync_status}. ${CLASE_LABELS[prediccion.clase]} · confianza ${prediccion.confianza}%.`,
                    'success',
                );
            }
            onSaved?.(toViewModel(diagnostico));
        } catch (error) {
            if (!cancelledRef.current) {
                showFeedback(describeEngineError(error), 'error');
            }
        } finally {
            setSaving(false);
        }
    };

    const feedbackClass =
        feedback.tone === 'error' ? 'text-rose-500' : feedback.tone === 'success' ? 'text-teal' : 'text-navy/50';

    return (
        <section className="rounded-[1.75rem] bg-sky/60 p-4 sm:p-6" aria-labelledby="scanner-title">
            <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[.18em] text-teal">Unidad de campo · Edge</p>
                    <h2 id="scanner-title" className="mt-1 text-xl font-extrabold text-navy">Nueva inspeccion</h2>
                </div>
                <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${online ? 'bg-teal/15 text-teal' : 'bg-gold/30 text-navy'}`}>
                    {online ? 'En linea (inferencia local)' : 'Sin red · offline'}
                </span>
            </div>

            <div className="mb-4 flex rounded-2xl bg-white p-1" role="tablist" aria-label="Fuente de imagen">
                <button
                    type="button"
                    onClick={() => changeSource('camera')}
                    className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${source === 'camera' ? 'bg-teal text-white' : 'text-navy/45 hover:text-navy'}`}
                >
                    Camara
                </button>
                <button
                    type="button"
                    onClick={() => changeSource('upload')}
                    className={`flex-1 rounded-xl px-3 py-2 text-sm font-semibold transition ${source === 'upload' ? 'bg-teal text-white' : 'text-navy/45 hover:text-navy'}`}
                >
                    Subir archivo
                </button>
            </div>

            <div className="relative aspect-video overflow-hidden rounded-2xl bg-navy">
                <video ref={videoRef} className={`absolute inset-0 h-full w-full object-cover ${cameraActive && !imageBase64 ? '' : 'hidden'}`} autoPlay playsInline></video>
                {imageBase64 ? (
                    <img src={imageBase64} className="absolute inset-0 h-full w-full object-contain bg-navy" alt="Vista previa de la imagen seleccionada" />
                ) : null}
                <canvas ref={canvasRef} className="hidden"></canvas>
                {!cameraActive && !imageBase64 ? (
                    <button
                        type="button"
                        onClick={openCanvas}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-white/70"
                    >
                        <span className="text-4xl text-gold">+</span>
                        <span className="text-sm">{cameraDenied ? 'Permiso de cámara denegado. Sube un archivo.' : 'Activa la cámara o sube una hoja'}</span>
                    </button>
                ) : null}
                {imageBase64 ? (
                    <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-teal">Captura lista</div>
                ) : null}
                {riskResult ? (
                    <div className="absolute inset-3 z-10 flex items-end sm:items-center sm:justify-center">
                        <ResultLayers result={riskResult} onClose={() => setRiskResult(null)} />
                    </div>
                ) : null}
            </div>

            {source === 'camera' ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button type="button" onClick={startCamera} className="min-h-11 rounded-full bg-teal px-4 py-3 font-semibold text-white transition hover:bg-teal-dark">
                        Activar cámara
                    </button>
                    {cameraDenied ? (
                        <button type="button" onClick={() => changeSource('upload')} className="min-h-11 rounded-full bg-sky px-4 py-3 font-semibold text-navy sm:col-span-2">
                            Subir archivo
                        </button>
                    ) : null}
                    <button
                        type="button"
                        disabled={!canCapture}
                        onClick={takePhoto}
                        title={!canCapture ? 'Activa la cámara primero' : undefined}
                        className="min-h-11 rounded-full border border-teal/20 px-4 py-3 font-semibold text-navy transition hover:border-teal hover:text-teal disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {canCapture ? 'Tomar fotografía' : 'Activa la cámara para fotografiar'}
                    </button>
                </div>
            ) : (
                <div className="mt-4">
                    <label
                        className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-teal/25 bg-white px-4 py-5 text-center transition hover:border-teal ${dropActive ? 'drop-active' : ''}`}
                        onDragEnter={(event) => {
                            event.preventDefault();
                            setDropActive(true);
                        }}
                        onDragOver={(event) => {
                            event.preventDefault();
                            setDropActive(true);
                        }}
                        onDragLeave={(event) => {
                            event.preventDefault();
                            setDropActive(false);
                        }}
                        onDrop={(event) => {
                            event.preventDefault();
                            setDropActive(false);
                            readImage(event.dataTransfer.files[0]);
                        }}
                    >
                        <span className="text-sm font-semibold text-navy">Arrastra una imagen aqui</span>
                        <span className="mt-1 text-xs text-navy/45">JPG, PNG o WEBP</span>
                        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => readImage(event.target.files[0])} />
                    </label>
                </div>
            )}

            <div className="mt-4 grid gap-3">
                <div>
                    <label htmlFor="scanner-lote" className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-navy/40">
                        Lote / parcela
                    </label>
                    {parcelas.length > 0 ? (
                        <select
                            id="scanner-lote"
                            value={lote}
                            onChange={(event) => onLoteChange?.(event.target.value)}
                            className="w-full min-h-11 rounded-full border-0 bg-white px-4 py-3 text-sm text-navy outline-none focus:ring-2 focus:ring-teal/30"
                        >
                            <option value="">Elige un lote</option>
                            {parcelas.map((nombre) => (
                                <option key={nombre} value={nombre}>
                                    {nombre}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            id="scanner-lote"
                            type="text"
                            value={location}
                            onChange={(event) => {
                                setLocation(event.target.value);
                                onLoteChange?.(event.target.value);
                            }}
                            placeholder="Lote, vereda o finca"
                            className="w-full min-h-11 rounded-full border-0 bg-white px-4 py-3 text-sm text-navy outline-none placeholder:text-navy/35 focus:ring-2 focus:ring-teal/30"
                        />
                    )}
                    <button type="button" onClick={onGoParcelas} className="mt-1 text-xs font-bold text-teal">
                        {parcelas.length ? 'Gestionar parcelas' : 'Elige un lote · ir a Parcelas'}
                    </button>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        type="button"
                        disabled={!imageBase64 || saving}
                        onClick={scanLocal}
                        className="min-h-11 flex-1 rounded-full bg-gold px-5 py-3 font-extrabold text-navy transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        {saving ? 'Analizando en el dispositivo…' : 'Escanear en el dispositivo'}
                    </button>
                    {saving ? (
                        <button type="button" onClick={resetCapture} className="min-h-11 rounded-full bg-sky px-4 py-3 text-sm font-extrabold text-navy">
                            Cancelar
                        </button>
                    ) : null}
                </div>
            </div>
            <p className={`mt-4 min-h-5 text-sm ${feedbackClass}`} role="status">
                {feedback.message}
            </p>
            {savedOk ? (
                <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={onOpenHistory} className="min-h-11 rounded-full bg-teal px-4 py-2 text-sm font-extrabold text-white">
                        Ver historial
                    </button>
                    <button type="button" onClick={resetCapture} className="min-h-11 rounded-full bg-sky px-4 py-2 text-sm font-extrabold text-navy">
                        Otra captura
                    </button>
                </div>
            ) : null}
        </section>
    );
}
