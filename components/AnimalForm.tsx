import React, { useState } from 'react';

interface AnimalFormProps {
  onSubmit: (name: string) => void;
  isLoading: boolean;
}

export const AnimalForm: React.FC<AnimalFormProps> = ({ onSubmit, isLoading }) => {
  const [inputName, setInputName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputName.trim()) {
      onSubmit(inputName.trim());
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
      {/* Header Image */}
      <div className="relative h-48 w-full group">
        <img 
          src="https://images.unsplash.com/photo-1518796745738-41048802f99a?q=80&w=800&auto=format&fit=crop"
          alt="Archa zvířat"
          className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent"></div>
        <div className="absolute bottom-4 left-0 right-0 text-center px-4">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-xs font-medium tracking-wider uppercase mb-2 backdrop-blur-sm">
            Umělá Inteligence
          </span>
        </div>
      </div>

      <div className="p-8 pt-4">
        <h1 className="text-3xl font-bold text-center mb-2 text-transparent bg-clip-text bg-gradient-to-r from-teal-200 to-emerald-400">
          Totemové Zvíře
        </h1>
        <p className="text-center text-slate-300 mb-8 text-sm">
          Zadej své jméno a odhal svou zvířecí duši.
        </p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative group">
            <input
              type="text"
              value={inputName}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="Tvé jméno..."
              disabled={isLoading}
              className="w-full px-6 py-4 bg-slate-800/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-300 group-hover:bg-slate-800/70"
            />
          </div>
          
          <button
            type="submit"
            disabled={!inputName.trim() || isLoading}
            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform shadow-lg
              ${!inputName.trim() || isLoading 
                ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:scale-[1.02] hover:shadow-emerald-500/25 active:scale-[0.98]'
              }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Vyvolávání...
              </span>
            ) : (
              'Odhalit Zvíře'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};