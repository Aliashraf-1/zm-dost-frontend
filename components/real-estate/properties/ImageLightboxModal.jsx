"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import ModalPortal from "@/components/common/ModalPortal";
import { getImageUrl } from "@/lib/imageHelper";

export default function ImageLightboxModal({
  isOpen,
  onClose,
  photos = [],
  initialIndex = 0,
  title = "Property Photo",
}) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, photos.length]);

  if (!isOpen || !photos || photos.length === 0) return null;

  const handlePrev = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleNext = (e) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % photos.length);
  };

  return (
    <ModalPortal>
      <div
        className="fixed inset-0 z-[9999] flex flex-col justify-between bg-black/95 p-3 sm:p-5 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      >
        {/* Top bar */}
        <div
          className="flex items-center justify-between z-10 w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="min-w-0 pr-4">
            <h3 className="truncate text-sm sm:text-base font-semibold text-white">
              {title}
            </h3>
            {photos.length > 1 && (
              <p className="text-xs text-white/70">
                {currentIndex + 1} of {photos.length}
              </p>
            )}
          </div>

          <button
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20 active:scale-95"
            aria-label="Close fullscreen view"
          >
            <X size={22} />
          </button>
        </div>

        {/* Center image container */}
        <div
          className="relative flex-1 flex items-center justify-center w-full my-2 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative h-full w-full max-h-[82vh] max-w-5xl flex items-center justify-center">
            <Image
              src={getImageUrl(photos[currentIndex])}
              alt={`Photo ${currentIndex + 1}`}
              fill
              className="object-contain select-none"
              sizes="(max-width: 768px) 100vw, 85vw"
              priority
              unoptimized
            />
          </div>

          {/* Navigation Controls */}
          {photos.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/90 active:scale-95"
                aria-label="Previous photo"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-black/60 text-white shadow-lg backdrop-blur-sm transition hover:bg-black/90 active:scale-95"
                aria-label="Next photo"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}
        </div>

        {/* Bottom thumbnail strip if multiple photos */}
        {photos.length > 1 ? (
          <div
            className="flex items-center justify-center gap-2 overflow-x-auto py-1 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`relative h-12 w-16 shrink-0 overflow-hidden rounded-md border-2 transition ${
                  currentIndex === index
                    ? "border-indigo-500 scale-105"
                    : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <Image
                  src={getImageUrl(photo)}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </button>
            ))}
          </div>
        ) : (
          <div className="h-4" />
        )}
      </div>
    </ModalPortal>
  );
}
