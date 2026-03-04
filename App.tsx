import React, { useState } from 'react';
import { AnimalForm } from './components/AnimalForm';
import { AnimalCard } from './components/AnimalCard';
import { LogisticsMode } from './components/LogisticsMode';
import { AccessControl } from './components/AccessControl';
import { analyzeName, generateAnimalImage } from './services/geminiService';
import { AppState, GenerationResult, AppMode } from './types';

export default function App() {
  const [mode, setMode] = useState<AppMode>('TOTEM');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [name, setName] = useState('');
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (submittedName: string) => {
    try {
      setError(null);
      setName(submittedName);
      setAppState(AppState.ANALYZING);

      // Step 1: Analyze Name
      const analysis = await analyzeName(submittedName);
      
      setAppState(AppState.GENERATING_IMAGE);

      // Step 2: Generate Image
      const imageUrl = await generateAnimalImage(analysis.visual_prompt);

      setResult({
        ...analysis,
        imageUrl,
      });
      setAppState(AppState.SUCCESS);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Nepodařilo se vygenerovat zvíře. Zkuste to prosím znovu.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setResult(null);
    setName('');
    setError(null);
  };

  const getStatusMessage = () => {
    switch (appState) {
      case AppState.ANALYZING:
        return "Analyzuji auru jména...";
      case AppState.GENERATING_IMAGE:
        return "Maluji tvé totemové zvíře...";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex flex-col items-center p-4 relative overflow-y-auto">
      
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none fixed"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none fixed"></div>

      {/* Mode Switcher */}
      <div className="z-20 mb-8 bg-slate-800/50 p-1.5 rounded-xl flex gap-1 backdrop-blur-sm border border-slate-700/50">
        <button
          onClick={() => setMode('TOTEM')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'TOTEM' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          Totem
        </button>
        <button
          onClick={() => setMode('LOGISTICS')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'LOGISTICS' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          Logistika
        </button>
        <button
          onClick={() => setMode('SECURITY')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'SECURITY' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }`}
        >
          Turniket
        </button>
      </div>

      <div className="z-10 w-full">
        {mode === 'TOTEM' && (
          <>
            {appState === AppState.IDLE && <AnimalForm onSubmit={handleGenerate} isLoading={false} />}
            
            {(appState === AppState.ANALYZING || appState === AppState.GENERATING_IMAGE) && (
               <div className="w-full max-w-md mx-auto bg-slate-800/80 backdrop-blur-md rounded-2xl p-12 text-center border border-slate-700 shadow-2xl animate-[fadeIn_0.5s_ease-out]">
                 <div className="relative w-24 h-24 mx-auto mb-8">
                   <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
                   <div className="absolute inset-0 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin"></div>
                   <div className="absolute inset-0 flex items-center justify-center">
                     <span className="text-2xl animate-pulse">✨</span>
                   </div>
                 </div>
                 <h2 className="text-xl font-bold text-white mb-2">{getStatusMessage()}</h2>
                 <p className="text-slate-400 text-sm">Prosím o strpení, komunikuji s vesmírem...</p>
               </div>
            )}
            
            {appState === AppState.SUCCESS && result && (
              <AnimalCard result={result} onReset={handleReset} userName={name} />
            )}
            
            {appState === AppState.ERROR && (
              <div className="w-full max-w-md mx-auto bg-slate-800/80 backdrop-blur-md rounded-2xl p-8 text-center border border-red-500/30 shadow-2xl">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Chyba spojení</h3>
                <p className="text-slate-300 mb-6">{error}</p>
                <button 
                  onClick={handleReset}
                  className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                >
                  Zkusit znovu
                </button>
              </div>
            )}
          </>
        )}

        {mode === 'LOGISTICS' && <LogisticsMode />}
        
        {mode === 'SECURITY' && <AccessControl />}
      </div>
    </div>
  );
}