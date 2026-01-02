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
    <div className="w-full max-w-md mx-auto p-8 bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl border border-white/20">
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
  );
};