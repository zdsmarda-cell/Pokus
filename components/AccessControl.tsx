import React, { useState, useEffect, useRef } from 'react';
import { AccessLog } from '../types';

// Simulovaná databáze uživatelů (v reálu by byla na serveru)
const MOCK_USER_DB: Record<string, string> = {
  '%B123456789^DOE/JOHN': 'John Doe', // Příklad formátu ISO Track 1
  ';123456789=': 'Jane Smith',         // Příklad formátu ISO Track 2
  '123456': 'Test User'                // Jednoduchý kód
};

export const AccessControl: React.FC = () => {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [lastCard, setLastCard] = useState<string>('');
  const [inputBuffer, setInputBuffer] = useState<string>('');
  const [status, setStatus] = useState<'IDLE' | 'GRANTED' | 'DENIED'>('IDLE');
  
  // Ref pro skrytý input, aby zachytával "stisky kláves" ze čtečky
  const hiddenInputRef = useRef<HTMLInputElement>(null);

  // Funkce pro udržení focusu na inputu (aby čtečka psala tam)
  const keepFocus = () => {
    if (hiddenInputRef.current) {
      hiddenInputRef.current.focus();
    }
  };

  useEffect(() => {
    // Focus při načtení
    keepFocus();
    
    // Interval pro kontrolu focusu (kdyby uživatel kliknul jinam)
    const interval = setInterval(keepFocus, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCardRead = (cardData: string) => {
    // Vyčistíme data (čtečky často posílají CR/LF na konci)
    const cleanData = cardData.trim();
    setLastCard(cleanData);

    // 1. Ověření v databázi
    // V reálné čtečce musíme často parsovat string, protože obsahuje spoustu metadat.
    // Zde pro jednoduchost hledáme přesnou shodu nebo substring.
    
    let foundUser = MOCK_USER_DB[cleanData];
    
    // Fallback: Zkusíme najít, jestli DB klíč není obsažen v načtených datech
    if (!foundUser) {
        const foundKey = Object.keys(MOCK_USER_DB).find(key => cleanData.includes(key));
        if (foundKey) foundUser = MOCK_USER_DB[foundKey];
    }

    const accessGranted = !!foundUser;

    // 2. Logování
    const newLog: AccessLog = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      cardId: cleanData,
      userName: foundUser || 'Neznámý',
      granted: accessGranted
    };

    setLogs(prev => [newLog, ...prev].slice(0, 10)); // Držíme posledních 10
    setStatus(accessGranted ? 'GRANTED' : 'DENIED');

    // 3. Reset statusu po 3 sekundách
    setTimeout(() => setStatus('IDLE'), 3000);

    // 4. Pokud Povoleno -> Zde by se volalo WebSerial API pro otevření turniketu
    if (accessGranted) {
        console.log("OPENING HARDWARE GATE...");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Čtečka odeslala Enter = konec načítání
      handleCardRead(inputBuffer);
      setInputBuffer('');
    } else {
      // Přidáme znak do bufferu
      setInputBuffer(prev => prev + e.key);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4" onClick={keepFocus}>
      {/* Hidden input trap */}
      <input
        ref={hiddenInputRef}
        type="text"
        value={inputBuffer}
        onChange={() => {}} // React vyžaduje onChange, ale řešíme to v onKeyDown
        onKeyDown={handleKeyDown}
        className="opacity-0 absolute top-0 left-0 w-0 h-0"
        autoFocus
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Levá část - Status Turniketu */}
        <div className={`
          aspect-square rounded-3xl flex flex-col items-center justify-center border-4 shadow-2xl transition-all duration-300
          ${status === 'IDLE' ? 'bg-slate-800 border-slate-600' : ''}
          ${status === 'GRANTED' ? 'bg-emerald-900 border-emerald-500 shadow-emerald-500/50 scale-105' : ''}
          ${status === 'DENIED' ? 'bg-red-900 border-red-500 shadow-red-500/50 shake' : ''}
        `}>
          {status === 'IDLE' && (
            <>
              <svg className="w-24 h-24 text-slate-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              <p className="mt-4 text-slate-400 font-medium animate-pulse">Přiložte kartu</p>
            </>
          )}

          {status === 'GRANTED' && (
            <>
              <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
              </div>
              <h2 className="text-3xl font-bold text-white">Vítejte</h2>
              <p className="text-emerald-300 text-lg mt-2">{logs[0]?.userName}</p>
            </>
          )}

          {status === 'DENIED' && (
            <>
              <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mb-4">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
              </div>
              <h2 className="text-3xl font-bold text-white">Chyba</h2>
              <p className="text-red-300 text-lg mt-2">Neznámá karta</p>
            </>
          )}
        </div>

        {/* Pravá část - Logy */}
        <div className="bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-700 p-6 overflow-hidden flex flex-col h-full">
          <h3 className="text-white font-bold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            Historie vstupů
          </h3>
          
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {logs.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-10">Zatím žádné záznamy</p>
            )}
            {logs.map(log => (
              <div key={log.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                <div className={`w-2 h-2 rounded-full ${log.granted ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{log.userName || 'Neznámý'}</p>
                  <p className="text-slate-500 text-xs truncate font-mono">{log.cardId.substring(0, 15)}...</p>
                </div>
                <div className="text-slate-400 text-xs">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit', second:'2-digit' })}
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-500">
              Debug: Poslední RAW data: <span className="font-mono text-slate-300">{lastCard || '-'}</span>
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-8 text-center max-w-lg mx-auto">
        <p className="text-sm text-slate-400 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
          ℹ️ Pro testování bez fyzické čtečky prostě napište na klávesnici <code>123456</code> a stiskněte <strong>Enter</strong>.
        </p>
      </div>
    </div>
  );
};