"use client";

import { useState } from "react";
import Image from "next/image";
import ImageModal from "./ImageModal";

interface EventBannerProps {
    src: string | null;
    alt: string;
}

export default function EventBanner({ src, alt }: EventBannerProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!src) return null;

    return (
        <>
            <div
                className="relative w-full h-64 md:h-96 rounded-3xl overflow-hidden mb-8 cursor-pointer group shadow-lg"
                onClick={() => setIsOpen(true)}
            >
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    unoptimized
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-md p-3 rounded-full border border-white/30">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                    </div>
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
