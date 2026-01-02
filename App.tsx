import React, { useState } from 'react';
import { AnimalForm } from './components/AnimalForm';
import { AnimalCard } from './components/AnimalCard';
import { analyzeName, generateAnimalImage } from './services/geminiService';
import { AppState, GenerationResult } from './types';

export default function App() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <main className="w-full max-w-2xl z-10 flex flex-col items-center">
        
        {appState === AppState.IDLE && (
          <AnimalForm onSubmit={handleGenerate} isLoading={false} />
        )}

        {(appState === AppState.ANALYZING || appState === AppState.GENERATING_IMAGE) && (
          <div className="flex flex-col items-center animate-pulse">
             <div className="w-24 h-24 mb-6 relative">
                <div className="absolute inset-0 bg-emerald-500/30 rounded-full animate-ping"></div>
                <div className="absolute inset-2 bg-emerald-500/50 rounded-full animate-pulse"></div>
                <svg className="absolute inset-0 w-full h-full text-emerald-200 p-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                    <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
                </svg>
             </div>
             <p className="text-xl text-emerald-200 font-light tracking-widest uppercase">{getStatusMessage()}</p>
          </div>
        )}

        {appState === AppState.SUCCESS && result && (
          <AnimalCard result={result} onReset={handleReset} userName={name} />
        )}

        {appState === AppState.ERROR && (
          <div className="bg-red-500/10 border border-red-500/50 p-6 rounded-xl text-center max-w-md">
            <h3 className="text-red-400 font-bold text-lg mb-2">Chyba</h3>
            <p className="text-red-200 mb-4">{error}</p>
            <button 
              onClick={handleReset}
              className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg transition-colors"
            >
              Zkusit znovu
            </button>
          </div>
        )}
      </main>
    </div>
  );
}