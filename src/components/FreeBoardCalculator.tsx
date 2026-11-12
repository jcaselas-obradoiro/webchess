import React, { useState, useMemo } from 'react';
import {
  PieceType,
  PieceColor,
  PieceSetId,
  BoardThemeId,
  BOARD_THEMES,
  PIECES_DATA,
  ChessPieceIcon
} from '../data/pieceSets';
import { sounds } from '../utils/sound';
import { Grid, Trash2, RotateCcw, Swords, Plus } from 'lucide-react';

interface PlacedPiece {
  id: string;
  row: number;
  col: number;
  type: PieceType;
  color: PieceColor;
}

interface FreeBoardCalculatorProps {
  setId: PieceSetId;
  boardTheme: BoardThemeId;
}

const INITIAL_BOARD: PlacedPiece[] = [
  // Black pieces (row 0, 1)
  { id: 'br1', row: 0, col: 0, type: 'rook', color: 'black' },
  { id: 'bn1', row: 0, col: 1, type: 'knight', color: 'black' },
  { id: 'bb1', row: 0, col: 2, type: 'bishop', color: 'black' },
  { id: 'bq', row: 0, col: 3, type: 'queen', color: 'black' },
  { id: 'bk', row: 0, col: 4, type: 'king', color: 'black' },
  { id: 'bb2', row: 0, col: 5, type: 'bishop', color: 'black' },
  { id: 'bn2', row: 0, col: 6, type: 'knight', color: 'black' },
  { id: 'br2', row: 0, col: 7, type: 'rook', color: 'black' },
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `bp${i}`,
    row: 1,
    col: i,
    type: 'pawn' as PieceType,
    color: 'black' as PieceColor
  })),

  // White pieces (row 6, 7)
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `wp${i}`,
    row: 6,
    col: i,
    type: 'pawn' as PieceType,
    color: 'white' as PieceColor
  })),
  { id: 'wr1', row: 7, col: 0, type: 'rook', color: 'white' },
  { id: 'wn1', row: 7, col: 1, type: 'knight', color: 'white' },
  { id: 'wb1', row: 7, col: 2, type: 'bishop', color: 'white' },
  { id: 'wq', row: 7, col: 3, type: 'queen', color: 'white' },
  { id: 'wk', row: 7, col: 4, type: 'king', color: 'white' },
  { id: 'wb2', row: 7, col: 5, type: 'bishop', color: 'white' },
  { id: 'wn2', row: 7, col: 6, type: 'knight', color: 'white' },
  { id: 'wr2', row: 7, col: 7, type: 'rook', color: 'white' }
];

export const FreeBoardCalculator: React.FC<FreeBoardCalculatorProps> = ({ setId, boardTheme }) => {
  const [boardPieces, setBoardPieces] = useState<PlacedPiece[]>(INITIAL_BOARD);
  const [selectedToolPiece, setSelectedToolPiece] = useState<{ type: PieceType; color: PieceColor } | null>({
    type: 'queen',
    color: 'white'
  });
  const [eraserMode, setEraserMode] = useState<boolean>(false);
  const [draggedPieceId, setDraggedPieceId] = useState<string | null>(null);

  const theme = BOARD_THEMES[boardTheme];

  // Material calculations (excluding king, since its value is infinite)
  const { whiteTotal, blackTotal, diff } = useMemo(() => {
    let w = 0;
    let b = 0;
    boardPieces.forEach((p) => {
      if (p.type === 'king') return;
      const val = PIECES_DATA[p.type].value;
      if (p.color === 'white') w += val;
      else b += val;
    });
    return { whiteTotal: w, blackTotal: b, diff: w - b };
  }, [boardPieces]);

  const handleSquareClick = (r: number, c: number) => {
    sounds.playClick();
    const existingIdx = boardPieces.findIndex((p) => p.row === r && p.col === c);

    if (eraserMode) {
      if (existingIdx !== -1) {
        sounds.playCapture();
        setBoardPieces((prev) => prev.filter((_, idx) => idx !== existingIdx));
      }
      return;
    }

    if (draggedPieceId) {
      // Move piece to this square
      setBoardPieces((prev) =>
        prev
          .filter((p) => !(p.row === r && p.col === c)) // remove any captured piece
          .map((p) => (p.id === draggedPieceId ? { ...p, row: r, col: c } : p))
      );
      sounds.playMove();
      setDraggedPieceId(null);
      return;
    }

    if (selectedToolPiece) {
      const newPiece: PlacedPiece = {
        id: `custom-${Date.now()}-${Math.random()}`,
        row: r,
        col: c,
        type: selectedToolPiece.type,
        color: selectedToolPiece.color
      };
      setBoardPieces((prev) => [
        ...prev.filter((p) => !(p.row === r && p.col === c)),
        newPiece
      ]);
      sounds.playMove();
    }
  };

  const handlePieceClickOnBoard = (piece: PlacedPiece, e: React.MouseEvent) => {
    e.stopPropagation();
    if (eraserMode) {
      sounds.playCapture();
      setBoardPieces((prev) => prev.filter((p) => p.id !== piece.id));
      return;
    }
    if (draggedPieceId === piece.id) {
      setDraggedPieceId(null);
    } else {
      sounds.playClick();
      setDraggedPieceId(piece.id);
    }
  };

  const loadPreset = (preset: 'initial' | 'endgame' | 'queenVsRooks' | 'empty') => {
    sounds.playClick();
    setDraggedPieceId(null);
    if (preset === 'initial') {
      setBoardPieces(INITIAL_BOARD);
    } else if (preset === 'empty') {
      setBoardPieces([]);
    } else if (preset === 'queenVsRooks') {
      setBoardPieces([
        { id: 'wk', row: 7, col: 4, type: 'king', color: 'white' },
        { id: 'wq', row: 4, col: 3, type: 'queen', color: 'white' },
        { id: 'bk', row: 0, col: 4, type: 'king', color: 'black' },
        { id: 'br1', row: 2, col: 2, type: 'rook', color: 'black' },
        { id: 'br2', row: 2, col: 5, type: 'rook', color: 'black' }
      ]);
    } else if (preset === 'endgame') {
      setBoardPieces([
        { id: 'wk', row: 5, col: 4, type: 'king', color: 'white' },
        { id: 'wp1', row: 4, col: 4, type: 'pawn', color: 'white' },
        { id: 'bk', row: 2, col: 4, type: 'king', color: 'black' }
      ]);
    }
  };

  const colNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  return (
    <div className="space-y-6">
      {/* Top Controller Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Grid className="w-6 h-6 text-amber-400" />
              Tablero Libre y Calculadora Material en Vivo
            </h2>
            <p className="text-sm text-slate-400">
              Coloca cualquier posición en el tablero y observa la evaluación numérica de puntos en tiempo real.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => loadPreset('initial')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Posición Inicial FIDE
            </button>
            <button
              onClick={() => loadPreset('queenVsRooks')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <Swords className="w-3.5 h-3.5" />
              Dama vs 2 Torres
            </button>
            <button
              onClick={() => loadPreset('empty')}
              className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/40 text-rose-300 font-semibold text-xs rounded-xl border border-rose-800/50 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Vaciar Tablero
            </button>
          </div>
        </div>

        {/* Live Material Balance Bar */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-2 font-bold">
              <span className="w-3 h-3 rounded-full bg-slate-100 inline-block" />
              Blancas (Sin contar Rey)
            </span>
            <span className="text-xl font-black text-slate-100 tabular-nums font-mono">
              {whiteTotal} pts
            </span>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-center">
            <span className="text-xs text-slate-400 font-bold">Evaluación Material</span>
            <div className="flex items-center gap-1.5">
              {diff === 0 ? (
                <span className="text-sm font-bold text-amber-400">Igualdad (0)</span>
              ) : diff > 0 ? (
                <span className="text-sm font-bold text-emerald-400">+{diff} Blancas</span>
              ) : (
                <span className="text-sm font-bold text-indigo-400">+{Math.abs(diff)} Negras</span>
              )}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center gap-2 font-bold">
              <span className="w-3 h-3 rounded-full bg-slate-900 border border-slate-400 inline-block" />
              Negras (Sin contar Rey)
            </span>
            <span className="text-xl font-black text-slate-100 tabular-nums font-mono">
              {blackTotal} pts
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Board + Palette Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: 8x8 Board (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl">
          <div
            className="relative mx-auto max-w-[480px] aspect-square rounded-xl overflow-hidden shadow-2xl border-4"
            style={{ borderColor: theme.border }}
          >
            <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
              {Array.from({ length: 8 }).map((_, r) =>
                Array.from({ length: 8 }).map((_, c) => {
                  const isLight = (r + c) % 2 === 0;
                  const piece = boardPieces.find((p) => p.row === r && p.col === c);
                  const isSelectedForMove = piece && piece.id === draggedPieceId;

                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleSquareClick(r, c)}
                      className={`relative w-full h-full flex items-center justify-center p-0 focus:outline-none transition-colors ${
                        isSelectedForMove ? 'ring-4 ring-amber-400 z-20' : ''
                      }`}
                      style={{
                        backgroundColor: isLight ? theme.light : theme.dark
                      }}
                      aria-label={`Casilla ${colNames[c]}${8 - r}`}
                    >
                      {/* Coordinates */}
                      {c === 0 && (
                        <span
                          className="absolute top-0.5 left-1 text-[10px] font-bold select-none"
                          style={{ color: isLight ? theme.dark : theme.light }}
                        >
                          {8 - r}
                        </span>
                      )}
                      {r === 7 && (
                        <span
                          className="absolute bottom-0.5 right-1 text-[10px] font-bold select-none"
                          style={{ color: isLight ? theme.dark : theme.light }}
                        >
                          {colNames[c]}
                        </span>
                      )}

                      {piece && (
                        <div
                          onClick={(e) => handlePieceClickOnBoard(piece, e)}
                          className={`relative z-10 cursor-pointer transform hover:scale-105 transition-transform ${
                            isSelectedForMove ? 'scale-110 drop-shadow-2xl animate-pulse' : ''
                          }`}
                        >
                          <ChessPieceIcon
                            type={piece.type}
                            color={piece.color}
                            setId={setId}
                            size={46}
                          />
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>
              💡 <strong>Instrucción:</strong> Haz clic en una pieza del tablero para seleccionarla y luego haz clic en otra casilla para moverla. O usa la paleta para añadir piezas.
            </span>
          </div>
        </div>

        {/* Right: Piece Palette (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Paleta de Piezas
              </span>
              <button
                onClick={() => {
                  setEraserMode(!eraserMode);
                  if (!eraserMode) setSelectedToolPiece(null);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-colors ${
                  eraserMode
                    ? 'bg-rose-500 text-white border-rose-400 shadow-md'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Modo Borrador
              </button>
            </div>

            {/* White Pieces */}
            <div>
              <span className="text-xs font-bold text-slate-300 block mb-2">Piezas Blancas:</span>
              <div className="grid grid-cols-6 gap-2">
                {(['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'] as PieceType[]).map((pType) => {
                  const isSelected =
                    !eraserMode &&
                    selectedToolPiece?.color === 'white' &&
                    selectedToolPiece?.type === pType;
                  return (
                    <button
                      key={`w-${pType}`}
                      onClick={() => {
                        setEraserMode(false);
                        setSelectedToolPiece({ type: pType, color: 'white' });
                        sounds.playClick();
                      }}
                      className={`p-2 rounded-xl border flex flex-col items-center transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 shadow'
                          : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <ChessPieceIcon type={pType} color="white" setId={setId} size={36} />
                      <span className="text-[10px] font-bold text-slate-300 mt-1">
                        {PIECES_DATA[pType].value === 99 ? '∞' : PIECES_DATA[pType].value}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Black Pieces */}
            <div>
              <span className="text-xs font-bold text-slate-300 block mb-2">Piezas Negras:</span>
              <div className="grid grid-cols-6 gap-2">
                {(['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'] as PieceType[]).map((pType) => {
                  const isSelected =
                    !eraserMode &&
                    selectedToolPiece?.color === 'black' &&
                    selectedToolPiece?.type === pType;
                  return (
                    <button
                      key={`b-${pType}`}
                      onClick={() => {
                        setEraserMode(false);
                        setSelectedToolPiece({ type: pType, color: 'black' });
                        sounds.playClick();
                      }}
                      className={`p-2 rounded-xl border flex flex-col items-center transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 shadow'
                          : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      <ChessPieceIcon type={pType} color="black" setId={setId} size={36} />
                      <span className="text-[10px] font-bold text-slate-300 mt-1">
                        {PIECES_DATA[pType].value === 99 ? '∞' : PIECES_DATA[pType].value}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2">
                <Plus className="w-3.5 h-3.5 text-amber-400" />
                <span>Selecciona una pieza y haz clic en cualquier casilla vacía para colocarla.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
