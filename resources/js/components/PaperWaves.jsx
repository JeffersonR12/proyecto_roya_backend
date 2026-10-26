import { motion, useReducedMotion } from 'framer-motion';
import { useId } from 'react';

function edge(offset) {
    const x = (value) => value + offset;
    return `M${x(910)} 0
        C ${x(828)} 68 ${x(996)} 142 ${x(874)} 222
        C ${x(758)} 302 ${x(1018)} 386 ${x(862)} 470
        C ${x(728)} 552 ${x(1006)} 638 ${x(850)} 722
        C ${x(722)} 800 ${x(982)} 878 ${x(876)} 944
        C ${x(840)} 972 ${x(894)} 988 ${x(886)} 1000`;
}

function reverseEdge(offset) {
    const x = (value) => value + offset;
    return `L ${x(886)} 1000
        C ${x(894)} 988 ${x(840)} 972 ${x(876)} 944
        C ${x(982)} 878 ${x(722)} 800 ${x(850)} 722
        C ${x(1006)} 638 ${x(728)} 552 ${x(862)} 470
        C ${x(1018)} 386 ${x(758)} 302 ${x(874)} 222
        C ${x(996)} 142 ${x(828)} 68 ${x(910)} 0 Z`;
}

function fillLeft(offset) {
    return `${edge(offset)} L 0 1000 L 0 0 Z`;
}

function ribbon(from, to) {
    return `${edge(from)} ${reverseEdge(to)}`;
}

function hwave(d) {
    return `M0 ${20 + d} C 80 ${6 + d} 160 ${42 + d} 260 ${16 + d} C 360 ${-2 + d} 440 ${40 + d} 520 ${14 + d}`;
}

const LIPS = [
    { from: 0, to: 18, fill: '#163F2C', amp: 4 },
    { from: 18, to: 38, fill: '#C9C4B8', amp: 7 },
];

const H_LAYERS = [
    { d: 0, fill: '#0B3C26' },
    { d: 12, fill: '#163F2C' },
    { d: 24, fill: '#D5D2C8' },
    { d: 36, fill: '#F4EFE6' },
];

export default function PaperWaves({ shift = { x: 0, y: 0 } }) {
    const rawId = useId().replace(/:/g, '');
    const reduceMotion = useReducedMotion();
    const greenId = `${rawId}-green`;

    return (
        <>
            <div className="intro-wave-stack intro-wave-stack-y" aria-hidden="true">
                <svg className="intro-wave-svg" viewBox="0 0 1400 1000" preserveAspectRatio="none" overflow="visible">
                    <defs>
                        <linearGradient id={greenId} x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#0B3C26" />
                            <stop offset="48%" stopColor="#14532D" />
                            <stop offset="100%" stopColor="#072418" />
                        </linearGradient>
                    </defs>
                    <path d={fillLeft(0)} fill={`url(#${greenId})`} />
                    {LIPS.map((layer, index) => (
                        <motion.path
                            key={layer.fill}
                            d={ribbon(layer.from, layer.to)}
                            fill={layer.fill}
                            animate={
                                reduceMotion
                                    ? { x: shift.x * 0.02 }
                                    : { x: [shift.x * 0.02, layer.amp + shift.x * 0.02, shift.x * 0.02] }
                            }
                            transition={
                                reduceMotion
                                    ? { duration: 0 }
                                    : { duration: 7 + index * 0.5, repeat: Infinity, ease: 'easeInOut' }
                            }
                        />
                    ))}
                </svg>
            </div>
            <div className="intro-wave-stack intro-wave-stack-x" aria-hidden="true">
                {H_LAYERS.map((layer, index) => (
                    <motion.svg
                        key={layer.fill}
                        className="intro-wave-layer"
                        viewBox="0 0 520 90"
                        preserveAspectRatio="none"
                        animate={reduceMotion ? { y: 0 } : { y: [0, 3 + index, 0] }}
                        transition={
                            reduceMotion
                                ? { duration: 0 }
                                : { duration: 5.6 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }
                        }
                    >
                        <path d={`${hwave(layer.d)} L 520 90 L 0 90 Z`} fill={layer.fill} />
                    </motion.svg>
                ))}
            </div>
        </>
    );
}
