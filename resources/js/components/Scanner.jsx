import { useEffect, useRef, useState } from 'react';
import { saveDiagnostico } from '../lib/diagnosticosDb.js';
import {
    CLASE_LABELS,
    createDiagnosticoLocal,
    resultadoVista,
    toViewModel,
} from '../lib/inference.js';
import { describeEngineError, inferDataUrl } from '../lib/onnxEngine.js';

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

export default function Scanner({ onSaved }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const [source, setSource] = useState('camera');
    const [cameraActive, setCameraActive] = useState(false);
    const [canCapture, setCanCapture] = useState(false);
    const [imageBase64, setImageBase64] = useState(null);
    const [location, setLocation] = useState('');
    const [feedback, setFeedback] = useState({ message: '', tone: 'muted' });
    const [saving, setSaving] = useState(false);
    const [dropActive, setDropActive] = useState(false);
    const [riskResult, setRiskResult] = useState(null);
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
            showFeedback('Este navegador no permite acceso a la camara. Usa la pestaña de subida.', 'error');
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
            setCameraActive(true);
            setCanCapture(true);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            showFeedback('Apunta a una hoja y toma la fotografia.');
        } catch {
            showFeedback('No se pudo activar la camara. Revisa permisos o usa la pestaña de subida.', 'error');
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
        showPreview(canvas.toDataURL('image/jpeg', 0.82), 'Fotografia capturada. Lista para escanear.');
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

    const scanLocal = async () => {
        if (!imageBase64 || saving) {
            return;
        }

        setSaving(true);
        showFeedback('Inferencia ONNX local (sin FastAPI ni Laravel)...');

        try {
            const prediccion = await inferDataUrl(imageBase64);
            const geo = await readGeo();
            const thumb = await compressThumb(imageBase64);
            const diagnostico = createDiagnosticoLocal({
                prediccion,
                imagen_thumb: thumb,
                parcela_nota: location,
                latitud: geo.latitud,
                longitud: geo.longitud,
                modelo_version: prediccion.modelo_version,
            });

            await saveDiagnostico(diagnostico);

            const vista = resultadoVista(prediccion);
            setRiskResult({
                ...vista,
                confianza: prediccion.confianza,
                severidad: prediccion.severidad,
                clase: prediccion.clase,
                latency_ms: prediccion.latency_ms,
                modelo_version: prediccion.modelo_version,
            });

            if (prediccion.runtime === 'placeholder-uniform') {
                showFeedback(
                    `Sin pesos ONNX: no se afirma clase (no_concluyente, ${prediccion.confianza}%). Coloca public/models/modelo_roya.onnx. Guardado local ${diagnostico.sync_status}.`,
                    'success',
                );
            } else {
                showFeedback(
                    `${CLASE_LABELS[prediccion.clase]} · confianza ${prediccion.confianza}% · ${prediccion.latency_ms} ms · local ${diagnostico.sync_status}`,
                    'success',
                );
            }
            onSaved?.(toViewModel(diagnostico));
        } catch (error) {
            showFeedback(describeEngineError(error), 'error');
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-white/70">
                        <span className="text-4xl text-gold">+</span>
                        <span className="text-sm">Activa la camara o sube una hoja</span>
                    </div>
                ) : null}
                {imageBase64 ? (
                    <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-teal">Captura lista</div>
                ) : null}
                {riskResult ? (
                    <div className="absolute inset-3 z-10 flex items-end sm:items-center sm:justify-center">
                        <div className={`w-full max-w-sm rounded-2xl border p-5 shadow-2xl ${riskResult.classes}`}>
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-xs uppercase tracking-[.2em] opacity-70">Clase (CNN)</p>
                                    <h3 className="mt-1 font-display text-xl font-bold">{riskResult.label}</h3>
                                </div>
                                <button type="button" onClick={() => setRiskResult(null)} className="rounded-lg border border-current/20 px-2 py-1 text-xs opacity-70 hover:opacity-100" aria-label="Cerrar resultado">
                                    Cerrar
                                </button>
                            </div>
                            <div className="mt-5 flex items-end gap-2">
                                <span className="font-display text-5xl font-bold">{riskResult.confianza}%</span>
                                <span className="pb-2 text-sm opacity-70">confianza</span>
                            </div>
                            <p className="mt-2 text-xs opacity-70">
                                Severidad foliar: {riskResult.severidad == null ? 'no calculada (distinta de la confianza)' : `${riskResult.severidad}%`}
                            </p>
                            <p className="mt-4 border-t border-current/20 pt-4 text-sm leading-6">{riskResult.recommendation}</p>
                            <p className="mt-2 text-[11px] opacity-50">
                                {riskResult.modelo_version}
                                {riskResult.latency_ms != null ? ` · ${riskResult.latency_ms} ms` : ''}
                            </p>
                        </div>
                    </div>
                ) : null}
            </div>

            {source === 'camera' ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <button type="button" onClick={startCamera} className="rounded-full bg-teal px-4 py-3 font-semibold text-white transition hover:bg-teal-dark">
                        Activar camara
                    </button>
                    <button
                        type="button"
                        disabled={!canCapture}
                        onClick={takePhoto}
                        className="rounded-full border border-teal/20 px-4 py-3 font-semibold text-navy transition hover:border-teal hover:text-teal disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        Tomar fotografia
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
                        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => readImage(event.target.files[0])} />
                    </label>
                </div>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
                <input
                    type="text"
                    value={location}
                    onChange={(event) => setLocation(event.target.value)}
                    placeholder="Lote, vereda o finca"
                    className="rounded-full border-0 bg-white px-4 py-3 text-sm text-navy outline-none placeholder:text-navy/35 focus:ring-2 focus:ring-teal/30"
                />
                <button
                    type="button"
                    disabled={!imageBase64 || saving}
                    onClick={scanLocal}
                    className="rounded-full bg-gold px-5 py-3 font-extrabold text-navy transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    {saving ? 'Inferiendo…' : 'Escanear en el dispositivo'}
                </button>
            </div>
            <p className={`mt-4 min-h-5 text-sm ${feedbackClass}`} role="status">
                {feedback.message}
            </p>
        </section>
    );
}
