import React, { useState, useRef } from 'react';
import { X, Play } from 'lucide-react';

export default function CoolIntroSplash({ onFinish }) {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const videoRef = useRef(null);

  const handleComplete = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onFinish();
    }, 600);
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-black flex items-center justify-center transition-opacity duration-700 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Fullscreen Video Intro Animation */}
      <video
        ref={videoRef}
        src="/intro.mp4"
        autoPlay
        muted
        playsInline
        onEnded={handleComplete}
        className="w-full h-full object-cover sm:object-contain bg-black"
      />

      {/* Skip Intro Button in Bottom Right */}
      <button
        onClick={handleComplete}
        className="absolute bottom-6 right-6 z-50 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-extrabold text-xs px-4 py-2 rounded-xl border border-white/30 transition-all flex items-center space-x-1.5 shadow-lg"
      >
        <span>Skip Intro</span>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
