"use client";

import { useState } from "react";
import ImageModal from "./ImageModal";

interface ClientImagePreviewProps {
    src: string;
    alt: string;
    className?: string;
}

export default function ClientImagePreview({ src, alt, className }: ClientImagePreviewProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!src) return null;

    return (
        <>
            <div
                className={`relative cursor-pointer group/preview overflow-hidden ${className || ""}`}
                onClick={() => setIsOpen(true)}
            >
                <img src={src} alt={alt} className="w-full h-full object-cover transition-transform group-hover/preview:scale-110" />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                </div>
            </div>
            <ImageModal
                src={src}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />
        </>
    );
}
