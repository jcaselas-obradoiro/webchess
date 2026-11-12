import { useState } from 'react';
import { PieceSetId, BoardThemeId, PIECE_SETS, BOARD_THEMES } from './data/pieceSets';
import { PieceExplorer } from './components/PieceExplorer';
import { ChessMemoryGame } from './components/ChessMemoryGame';
import { ChessMathGame } from './components/ChessMathGame';
import { KnightMazeTrainer } from './components/KnightMazeTrainer';
import { FreeBoardCalculator } from './components/FreeBoardCalculator';
import { GithubEmbedInfo } from './components/GithubEmbedInfo';
import { sounds } from './utils/sound';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Palette,
  Github
} from 'lucide-react';

export type ActiveTab = 'explorer' | 'memory' | 'math' | 'maze' | 'freeboard' | 'github';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('explorer');
  const [pieceSet, setPieceSet] = useState<PieceSetId>('staunton');
  const [boardTheme, setBoardTheme] = useState<BoardThemeId>('emerald');
  const [isMuted, setIsMuted] = useState<boolean>(sounds.getMuted());

  const handleTabChange = (tab: ActiveTab) => {
    sounds.playClick();
    setActiveTab(tab);
  };

  const toggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) sounds.playClick();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Universal Top Bar Contract: 3 Zones separated by gap-8 */}
      <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Single text element wordmark */}
          <button
            onClick={() => handleTabChange('explorer')}
            className="text-lg md:text-xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2.5 whitespace-nowrap shrink-0 hover:text-amber-400 transition-colors"
          >
            <span className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black flex items-center justify-center text-lg shadow-sm">
              ♞
            </span>
            <span>Ajedrez Interactivo</span>
          </button>

          {/* Zone 2: Clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-400">
            <button
              onClick={() => handleTabChange('explorer')}
              className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'explorer'
                  ? 'text-amber-400 border-amber-400'
                  : 'border-transparent text-slate-300'
              }`}
            >
              Valores y Movimientos
            </button>
            <button
              onClick={() => handleTabChange('memory')}
              className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'memory'
                  ? 'text-amber-400 border-amber-400'
                  : 'border-transparent text-slate-300'
              }`}
            >
              Juego Memory
            </button>
            <button
              onClick={() => handleTabChange('math')}
              className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'math'
                  ? 'text-amber-400 border-amber-400'
                  : 'border-transparent text-slate-300'
              }`}
            >
              Sumas de Piezas
            </button>
            <button
              onClick={() => handleTabChange('maze')}
              className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'maze'
                  ? 'text-amber-400 border-amber-400'
                  : 'border-transparent text-slate-300'
              }`}
            >
              Caza de Estrellas
            </button>
            <button
              onClick={() => handleTabChange('freeboard')}
              className={`hover:text-slate-100 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeTab === 'freeboard'
                  ? 'text-amber-400 border-amber-400'
                  : 'border-transparent text-slate-300'
              }`}
            >
              Tablero Libre
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action + Sound utility */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                isMuted
                  ? 'bg-slate-900 border-slate-700 text-slate-500'
                  : 'bg-slate-800/80 border-slate-700 text-amber-400 hover:bg-slate-800'
              }`}
              title={isMuted ? 'Activar Sonido' : 'Silenciar Sonido'}
              aria-label={isMuted ? 'Activar Sonido' : 'Silenciar Sonido'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{isMuted ? 'Silencio' : 'Sonido'}</span>
            </button>

            <button
              onClick={() => handleTabChange('github')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                activeTab === 'github'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub / Iframe</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex items-center gap-2 px-4 py-2 overflow-x-auto border-t border-slate-900 bg-slate-950/95 scrollbar-none">
          <button
            onClick={() => handleTabChange('explorer')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 ${
              activeTab === 'explorer' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Valores y Movimientos
          </button>
          <button
            onClick={() => handleTabChange('memory')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 ${
              activeTab === 'memory' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Memory
          </button>
          <button
            onClick={() => handleTabChange('math')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 ${
              activeTab === 'math' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Sumas
          </button>
          <button
            onClick={() => handleTabChange('maze')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 ${
              activeTab === 'maze' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Estrellas
          </button>
          <button
            onClick={() => handleTabChange('freeboard')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap shrink-0 ${
              activeTab === 'freeboard' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
            }`}
          >
            Tablero Libre
          </button>
        </div>
      </header>

      {/* Customization Ribbon: Sets de Piezas y Temas de Tablero */}
      <section className="bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs">
          {/* Piece Set Picker */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Set de Piezas:
            </span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {PIECE_SETS.map((set) => (
                <button
                  key={set.id}
                  onClick={() => {
                    setPieceSet(set.id);
                    sounds.playClick();
                  }}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    pieceSet === set.id
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title={set.description}
                >
                  {set.name}
                </button>
              ))}
            </div>
          </div>

          {/* Board Theme Picker */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-400 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-amber-400" />
              Color del Tablero:
            </span>
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {(Object.keys(BOARD_THEMES) as BoardThemeId[]).map((themeKey) => {
                const t = BOARD_THEMES[themeKey];
                return (
                  <button
                    key={themeKey}
                    onClick={() => {
                      setBoardTheme(themeKey);
                      sounds.playClick();
                    }}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                      boardTheme === themeKey
                        ? 'bg-slate-200 text-slate-900 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block border border-slate-500"
                      style={{ backgroundColor: t.dark }}
                    />
                    <span>{t.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'explorer' && (
          <PieceExplorer setId={pieceSet} boardTheme={boardTheme} />
        )}
        {activeTab === 'memory' && (
          <ChessMemoryGame setId={pieceSet} boardTheme={boardTheme} />
        )}
        {activeTab === 'math' && (
          <ChessMathGame setId={pieceSet} boardTheme={boardTheme} />
        )}
        {activeTab === 'maze' && (
          <KnightMazeTrainer setId={pieceSet} boardTheme={boardTheme} />
        )}
        {activeTab === 'freeboard' && (
          <FreeBoardCalculator setId={pieceSet} boardTheme={boardTheme} />
        )}
        {activeTab === 'github' && (
          <GithubEmbedInfo />
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 Ajedrez Interactivo · Diseñado para escuelas, alumnos y aficionados al ajedrez.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Reglamento FIDE</span>
            <span>·</span>
            <span>Matemática Aplicada</span>
            <span>·</span>
            <span>Operativo desde GitHub Pages</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
