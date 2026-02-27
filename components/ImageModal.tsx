"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

interface ImageModalProps {
    src: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function ImageModal({ src, isOpen, onClose }: ImageModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-6 transition-all duration-300 animate-in fade-in"
            onClick={onClose}
        >
            <div
                className="relative max-w-4xl max-h-[90vh] w-full flex items-center justify-center animate-in zoom-in duration-300 pointer-events-none"
            >
                {/* Close Button - More accessible on mobile */}
                <button
                    className="absolute -top-12 right-0 sm:-top-4 sm:-right-4 text-white bg-blue-600 hover:bg-blue-700 p-2.5 rounded-full transition-all shadow-2xl z-[100000] pointer-events-auto border-2 border-white/50 active:scale-90"
                    onClick={onClose}
                    aria-label="Close"
                >
                    <svg className="w-6 h-6 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                <div className="bg-white dark:bg-gray-800 p-1 sm:p-2 rounded-xl sm:rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] pointer-events-auto overflow-hidden">
                    <div className="relative max-h-[80vh] w-full flex items-center justify-center">
                        <Image
                            src={src}
                            alt="Full size"
                            width={1200}
                            height={1200}
                            className="max-w-full max-h-[80vh] w-auto h-auto object-contain rounded-lg sm:rounded-xl"
                            unoptimized
                        />
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
