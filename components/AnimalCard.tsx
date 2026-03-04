import React, { useEffect, useRef, useState } from 'react';
import { GenerationResult } from '../types';

interface AnimalCardProps {
  result: GenerationResult;
  onReset: () => void;
  userName: string;
}

export const AnimalCard: React.FC<AnimalCardProps> = ({ result, onReset, userName }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    // Handler for Mouse (Desktop)
    const handleMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation (max 10 degrees)
      const rotateX = ((y - centerY) / centerY) * -10;
      const rotateY = ((x - centerX) / centerX) * 10;

      setRotation({ x: rotateX, y: rotateY });
    };

    const handleMouseLeave = () => {
      setRotation({ x: 0, y: 0 });
    };

    // Handler for Gyroscope (Mobile)
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (!e.beta || !e.gamma) return;
      
      // Beta is front-back tilt (-180 to 180)
      // Gamma is left-right tilt (-90 to 90)
      
      // We clamp the values to avoid extreme flipping
      const rotateX = Math.max(-15, Math.min(15, e.beta - 45)) * -1; // -45 assumes user holds phone at 45deg angle
      const rotateY = Math.max(-15, Math.min(15, e.gamma));

      setRotation({ x: rotateX, y: rotateY });
    };

    // Add listeners
    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);
    
    // Check if device orientation is supported
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  return (
    <div className="perspective-1000 w-full max-w-lg mx-auto" style={{ perspective: '1000px' }}>
      <div 
        ref={cardRef}
        className="bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 animate-[fadeIn_0.5s_ease-out] transition-transform duration-100 ease-out transform-gpu"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          boxShadow: `${-rotation.y * 2}px ${rotation.x * 2}px 30px rgba(0,0,0,0.5)`
        }}
      >
        <div className="relative aspect-square w-full bg-slate-900 group">
          {/* Shine effect overlay */}
          <div 
            className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay opacity-30 bg-gradient-to-tr from-transparent via-white to-transparent"
            style={{
              transform: `translate(${rotation.y * 2}%, ${rotation.x * 2}%)`,
              opacity: (Math.abs(rotation.x) + Math.abs(rotation.y)) / 30 // More shine when tilted
            }}
          />
          
          <img 
            src={result.imageUrl} 
            alt={result.animal} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60 z-10"></div>
          <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
            <h2 className="text-4xl font-bold text-white mb-1 drop-shadow-md">{result.animal}</h2>
            <p className="text-emerald-300 font-medium tracking-wide uppercase text-sm">Totemové zvíře pro {userName}</p>
          </div>
        </div>
        
        <div className="p-8 bg-slate-800 relative z-10">
          <div className="prose prose-invert">
            <p className="text-lg text-slate-300 leading-relaxed italic">
              "{result.reason}"
            </p>
          </div>
          
          <button
            onClick={onReset}
            className="mt-8 w-full py-3 px-6 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors duration-200 font-medium"
          >
            Zkusit jiné jméno
          </button>
        </div>
      </div>
    </div>
  );
};