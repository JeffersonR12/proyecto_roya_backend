import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { classifySeverity } from '../lib/risk';

const SEVERITY_SAMPLES = [5, 8, 14, 22, 36, 49, 67, 82];

export default function Scanner({ storeUrl, onSaved }) {
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

    useEffect(() => {
        return () => stopCamera();
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
            showFeedback('Selecciona un archivo de imagen valido.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            setRiskResult(null);
            showPreview(event.target.result, 'Imagen cargada. Lista para escanear.');
        };
        reader.readAsDataURL(file);
    };

    const saveAnalysis = async () => {
        if (!imageBase64 || saving) {
            return;
        }

        setSaving(true);
        showFeedback('Ejecutando inferencia local simulada...');

        const severity = SEVERITY_SAMPLES[Math.floor(Math.random() * SEVERITY_SAMPLES.length)];
        setRiskResult({ severity, ...classifySeverity(severity) });

        try {
            const response = await axios.post(storeUrl, {
                disease_detected: 'Roya Amarilla',
                confidence: severity / 100,
                image_base64: imageBase64,
                location: location || null,
            });

            showFeedback(`Resultado guardado: ${severity}% de afectacion.`, 'success');
            onSaved(response.data.analysis);
        } catch {
            showFeedback('No se pudo guardar la inspeccion.', 'error');
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
                    <p className="text-xs font-semibold uppercase tracking-[.18em] text-teal">Unidad de campo</p>
                    <h2 id="scanner-title" className="mt-1 text-xl font-extrabold text-navy">Nueva inspeccion</h2>
                </div>
                <span className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${cameraActive ? 'bg-teal/15 text-teal' : 'bg-white text-navy/45'}`}>
                    {cameraActive ? 'Camara activa' : 'Camara inactiva'}
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
                                    <p className="text-xs uppercase tracking-[.2em] opacity-70">Foco detectado</p>
                                    <h3 className="mt-1 font-display text-xl font-bold">{riskResult.label}</h3>
                                </div>
                                <button type="button" onClick={() => setRiskResult(null)} className="rounded-lg border border-current/20 px-2 py-1 text-xs opacity-70 hover:opacity-100" aria-label="Cerrar resultado">
                                    Cerrar
                                </button>
                            </div>
                            <div className="mt-5 flex items-end gap-2">
                                <span className="font-display text-5xl font-bold">{riskResult.severity}%</span>
                                <span className="pb-2 text-sm opacity-70">afectacion estimada</span>
                            </div>
                            <p className="mt-4 border-t border-current/20 pt-4 text-sm leading-6">{riskResult.recommendation}</p>
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
                    onClick={saveAnalysis}
                    className="rounded-full bg-gold px-5 py-3 font-extrabold text-navy transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Escanear con IA
                </button>
            </div>
            <p className={`mt-4 min-h-5 text-sm ${feedbackClass}`} role="status">
                {feedback.message}
            </p>
        </section>
    );
}
