import React, { useState } from 'react';
import { DeliveryStop, StopStatus } from '../types';
import { optimizeRoute } from '../services/geminiService';

export const LogisticsMode: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [stops, setStops] = useState<DeliveryStop[]>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [view, setView] = useState<'INPUT' | 'ROUTE'>('INPUT');

  const handleOptimize = async () => {
    if (!inputText.trim()) return;
    
    setIsOptimizing(true);
    try {
      // Split by newlines and filter empty
      const rawAddresses = inputText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      const optimizedStops = await optimizeRoute(rawAddresses);
      setStops(optimizedStops);
      setView('ROUTE');
    } catch (error) {
      console.error(error);
      alert('Nepodařilo se optimalizovat trasu. Zkuste to prosím znovu.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const updateStatus = (id: string, newStatus: StopStatus) => {
    setStops(current => 
      current.map(s => s.id === id ? { ...s, status: newStatus } : s)
    );
  };

  const launchNavigation = (address: string) => {
    // Universal URL scheme that works on Android and iOS to open default map app
    const query = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${query}&travelmode=driving`, '_blank');
  };

  if (view === 'INPUT') {
    return (
      <div className="w-full max-w-md mx-auto bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 p-6 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 7m0 13V7m0 0a2 2 0 012-2h.01M9 17v5a2 2 0 002 2h2a2 2 0 002-2m-2-4h.01M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Plánovač trasy
        </h2>
        <p className="text-slate-400 text-sm mb-4">
          Zadejte seznam adres (každou na nový řádek). AI je seřadí pro nejrychlejší průjezd.
        </p>
        <textarea
          className="w-full h-48 bg-slate-900 border border-slate-600 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none mb-4"
          placeholder="Depo, Praha 1&#10;Kákoni 5, Brno&#10;Václavské náměstí 1, Praha"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button
          onClick={handleOptimize}
          disabled={isOptimizing || !inputText.trim()}
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-bold shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
        >
          {isOptimizing ? 'Počítám trasu...' : 'Vypočítat trasu'}
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-20">
      <div className="flex justify-between items-center bg-slate-800/80 p-4 rounded-xl backdrop-blur-md border border-slate-700">
        <h3 className="font-bold text-white">Trasa ({stops.filter(s => s.status === StopStatus.COMPLETED).length}/{stops.length})</h3>
        <button 
          onClick={() => setView('INPUT')}
          className="text-xs text-slate-400 hover:text-white underline"
        >
          Nová trasa
        </button>
      </div>

      <div className="space-y-3">
        {stops.map((stop, index) => (
          <div 
            key={stop.id}
            className={`relative p-5 rounded-2xl border transition-all duration-300 ${
              stop.status === StopStatus.COMPLETED 
                ? 'bg-emerald-900/20 border-emerald-500/30 opacity-70'
                : stop.status === StopStatus.CANCELLED
                  ? 'bg-slate-800/50 border-red-500/30 opacity-50'
                  : 'bg-slate-800 border-slate-600 shadow-lg scale-100'
            }`}
          >
            {/* Connector Line */}
            {index < stops.length - 1 && (
              <div className="absolute left-8 top-16 bottom-[-24px] w-0.5 bg-slate-700 -z-10"></div>
            )}

            <div className="flex gap-4">
              {/* Number Badge */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                stop.status === StopStatus.COMPLETED ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'
              }`}>
                {index + 1}
              </div>

              <div className="flex-1">
                <p className="text-white font-medium text-lg leading-tight mb-1">{stop.address}</p>
                <p className="text-slate-400 text-xs mb-4">{stop.note}</p>

                {stop.status === StopStatus.PENDING && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => launchNavigation(stop.address)}
                      className="col-span-2 bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                      Navigovat
                    </button>
                    <button
                      onClick={() => updateStatus(stop.id, StopStatus.COMPLETED)}
                      className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/50 py-2 rounded-lg font-medium text-sm"
                    >
                      Hotovo
                    </button>
                    <button
                      onClick={() => updateStatus(stop.id, StopStatus.CANCELLED)}
                      className="bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 py-2 rounded-lg font-medium text-sm"
                    >
                      Storno
                    </button>
                  </div>
                )}
                
                {stop.status === StopStatus.COMPLETED && (
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    Doručeno
                  </div>
                )}
                
                {stop.status === StopStatus.CANCELLED && (
                  <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    Zrušeno
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};