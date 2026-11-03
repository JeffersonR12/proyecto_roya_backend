import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const PHOTO = { src: '/imagenes/roya-amarilla-franjas.jpg', width: 1100, height: 1951 };
// Igual que `background-position: 50% 40%` en .auth-photo-frame.
const ALIGN = { x: 0.5, y: 0.4 };
// Franja de pústulas sobre la hoja grande: donde la lupa descansa al abrir.
const REST = { x: 0.55, y: 0.42 };
const ZOOM = 2.4;
const STEP = 24;

function coverGeometry(w, h) {
    const scale = Math.max(w / PHOTO.width, h / PHOTO.height);
    const dw = PHOTO.width * scale;
    const dh = PHOTO.height * scale;
    return { w, h, dw, dh, ox: (w - dw) * ALIGN.x, oy: (h - dh) * ALIGN.y, lens: w < 520 ? 104 : 144 };
}

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export default function FieldLens() {
    const reduceMotion = useReducedMotion();
    const frameRef = useRef(null);
    const geo = useRef(null);
    const [size, setSize] = useState(null);

    const targetX = useMotionValue(0);
    const targetY = useMotionValue(0);
    const springX = useSpring(targetX, { stiffness: 420, damping: 36, mass: 0.6 });
    const springY = useSpring(targetY, { stiffness: 420, damping: 36, mass: 0.6 });
    const x = reduceMotion ? targetX : springX;
    const y = reduceMotion ? targetY : springY;

    const lensX = useTransform(x, (cx) => cx - (geo.current?.lens ?? 0) / 2);
    const lensY = useTransform(y, (cy) => cy - (geo.current?.lens ?? 0) / 2);
    const backgroundPosition = useTransform([x, y], ([cx, cy]) => {
        const g = geo.current;
        if (!g) {
            return '0px 0px';
        }
        const px = (cx - g.ox) * ZOOM - g.lens / 2;
        const py = (cy - g.oy) * ZOOM - g.lens / 2;
        return `${-px}px ${-py}px`;
    });

    const moveTo = (cx, cy) => {
        const g = geo.current;
        if (!g) {
            return;
        }
        const half = g.lens / 2;
        targetX.set(clamp(cx, half, g.w - half));
        targetY.set(clamp(cy, half, g.h - half));
    };

    useEffect(() => {
        const frame = frameRef.current;
        if (!frame) {
            return undefined;
        }
        let first = true;
        const measure = () => {
            const box = frame.getBoundingClientRect();
            if (!box.width || !box.height) {
                return;
            }
            geo.current = coverGeometry(box.width, box.height);
            setSize({ w: box.width, h: box.height });
            const g = geo.current;
            const restX = g.ox + REST.x * g.dw;
            const restY = g.oy + REST.y * g.dh;
            if (first && !reduceMotion) {
                // Entrada: la lupa barre la hoja desde abajo y se detiene sobre la franja de pústulas.
                targetX.jump(clamp(restX - g.w * 0.28, g.lens / 2, g.w - g.lens / 2));
                targetY.jump(clamp(restY + g.h * 0.3, g.lens / 2, g.h - g.lens / 2));
                springX.jump(targetX.get());
                springY.jump(targetY.get());
                animate(targetX, clamp(restX, g.lens / 2, g.w - g.lens / 2), { duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] });
                animate(targetY, clamp(restY, g.lens / 2, g.h - g.lens / 2), { duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] });
            } else {
                moveTo(restX, restY);
            }
            first = false;
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(frame);
        return () => observer.disconnect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [reduceMotion]);

    const pointAt = (event) => {
        const box = frameRef.current.getBoundingClientRect();
        moveTo(event.clientX - box.left, event.clientY - box.top);
    };

    const onKeyDown = (event) => {
        const delta = { ArrowLeft: [-STEP, 0], ArrowRight: [STEP, 0], ArrowUp: [0, -STEP], ArrowDown: [0, STEP] }[event.key];
        if (!delta) {
            return;
        }
        event.preventDefault();
        moveTo(targetX.get() + delta[0], targetY.get() + delta[1]);
    };

    const g = geo.current;

    return (
        <figure className="auth-photo">
            <motion.div
                ref={frameRef}
                className="auth-photo-frame"
                style={{ backgroundImage: `url(${PHOTO.src})` }}
                role="group"
                tabIndex={0}
                aria-label="Foto de hojas con roya amarilla y una lupa que se mueve con el puntero o las flechas"
                aria-describedby="auth-photo-caption"
                onPointerMove={(event) => event.pointerType === 'mouse' && pointAt(event)}
                onPointerDown={pointAt}
                onKeyDown={onKeyDown}
                initial={reduceMotion ? false : { opacity: 0, scale: 1.03 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
                {size && g ? (
                    <motion.div
                        className="auth-lens"
                        aria-hidden="true"
                        style={{
                            x: lensX,
                            y: lensY,
                            '--lens-size': `${g.lens}px`,
                            backgroundImage: `url(${PHOTO.src})`,
                            backgroundSize: `${g.dw * ZOOM}px ${g.dh * ZOOM}px`,
                            backgroundPosition,
                        }}
                    />
                ) : null}
            </motion.div>
            <figcaption id="auth-photo-caption">
                Roya amarilla: pústulas naranjas en franjas a lo largo de las nervaduras de la hoja.
            </figcaption>
        </figure>
    );
}
