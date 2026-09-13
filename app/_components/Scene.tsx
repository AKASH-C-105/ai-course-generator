"use client";
import React from 'react';

export default function Scene() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-gray-950">
      {/* Animated glowing gradient orbs */}
      <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-[#DD2A7B]/30 rounded-full mix-blend-screen blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute top-[60%] right-[0%] w-[40%] h-[60%] bg-[#515BD4]/30 rounded-full mix-blend-screen blur-[130px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '2s' }} />
      <div className="absolute top-[20%] left-[40%] w-[40%] h-[40%] bg-[#F58529]/20 rounded-full mix-blend-screen blur-[140px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '4s' }} />
      
      {/* Futuristic Grid Overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]" 
        style={{ maskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, #000 40%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 70% 70% at 50% 50%, #000 40%, transparent 100%)' }}
      />
      
      {/* Ambient particles (CSS dots) */}
      <div className="absolute w-2 h-2 bg-white/40 rounded-full top-1/4 left-1/4 blur-[1px] animate-ping" style={{ animationDuration: '4s' }} />
      <div className="absolute w-1.5 h-1.5 bg-white/30 rounded-full top-3/4 left-1/3 blur-[1px] animate-ping" style={{ animationDuration: '5s', animationDelay: '1s' }} />
      <div className="absolute w-2.5 h-2.5 bg-[#DD2A7B]/50 rounded-full top-1/3 right-1/4 blur-[2px] animate-ping" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      
      {/* Fade at bottom to blend with UI */}
      <div className="absolute inset-0 bg-linear-to-b from-transparent via-gray-950/40 to-gray-950 z-10 pointer-events-none" />
    </div>
  );
}
