import React from 'react';
import { GenerationResult } from '../types';

interface AnimalCardProps {
  result: GenerationResult;
  onReset: () => void;
  userName: string;
}

export const AnimalCard: React.FC<AnimalCardProps> = ({ result, onReset, userName }) => {
  return (
    <div className="w-full max-w-lg mx-auto bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 animate-[fadeIn_0.5s_ease-out]">
      <div className="relative aspect-square w-full bg-slate-900 group">
        <img 
          src={result.imageUrl} 
          alt={result.animal} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h2 className="text-4xl font-bold text-white mb-1 drop-shadow-md">{result.animal}</h2>
          <p className="text-emerald-300 font-medium tracking-wide uppercase text-sm">Totemové zvíře pro {userName}</p>
        </div>
      </div>
      
      <div className="p-8">
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
  );
};