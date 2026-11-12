import React, { useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { PieceType, PieceSetId, BoardThemeId, BOARD_THEMES, PIECES_DATA, ChessPieceIcon } from '../data/pieceSets';
import { sounds } from '../utils/sound';
import { Target, RotateCcw, Star, Trophy, Sparkles } from 'lucide-react';

interface Square {
  row: number;
  col: number;
}

interface KnightMazeTrainerProps {
  setId: PieceSetId;
  boardTheme: BoardThemeId;
}

interface Level {
  id: number;
  piece: PieceType;
  title: string;
  start: Square;
  stars: Square[];
  parMoves: number;
  hint: string;
}

const LEVELS: Level[] = [
  {
    id: 1,
    piece: 'knight',
    title: 'Nivel 1: Primeros Saltos en "L"',
    start: { row: 6, col: 1 }, // b2
    stars: [
      { row: 4, col: 2 }, // c4
      { row: 2, col: 3 }  // d6
    ],
    parMoves: 2,
    hint: 'El caballo salta 2 casillas en una dirección y 1 a un lado.'
  },
  {
    id: 2,
    piece: 'knight',
    title: 'Nivel 2: La Estrella Lejana',
    start: { row: 7, col: 0 }, // a1
    stars: [
      { row: 5, col: 1 }, // b3
      { row: 3, col: 2 }, // c5
      { row: 1, col: 3 }  // d7
    ],
    parMoves: 3,
    hint: 'Planifica cada salto cambiando siempre el color de casilla.'
  },
  {
    id: 3,
    piece: 'bishop',
    title: 'Nivel 3: El Alfil en Diagonal',
    start: { row: 7, col: 2 }, // c1
    stars: [
      { row: 4, col: 5 }, // f4
      { row: 2, col: 3 }, // d6
      { row: 5, col: 0 }  // a3
    ],
    parMoves: 3,
    hint: 'El alfil vuela sin límite por las diagonales de su color.'
  },
  {
    id: 4,
    piece: 'rook',
    title: 'Nivel 4: La Torre en Cruz (+)',
    start: { row: 7, col: 0 }, // a1
    stars: [
      { row: 1, col: 0 }, // a7
      { row: 1, col: 6 }, // g7
      { row: 5, col: 6 }  // g3
    ],
    parMoves: 3,
    hint: 'La torre barre filas y columnas completas.'
  },
  {
    id: 5,
    piece: 'queen',
    title: 'Nivel 5: La Dama Omnipresente',
    start: { row: 7, col: 3 }, // d1
    stars: [
      { row: 4, col: 0 }, // a4
      { row: 2, col: 2 }, // c6
      { row: 2, col: 7 }, // h6
      { row: 6, col: 7 }  // h2
    ],
    parMoves: 4,
    hint: 'Combina el poder de la Torre y el Alfil en un solo turno.'
  }
];

export const KnightMazeTrainer: React.FC<KnightMazeTrainerProps> = ({ setId, boardTheme }) => {
  const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(0);
  const [piecePos, setPiecePos] = useState<Square>(LEVELS[0].start);
  const [remainingStars, setRemainingStars] = useState<Square[]>(LEVELS[0].stars);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [isLevelComplete, setIsLevelComplete] = useState<boolean>(false);

  const level = LEVELS[currentLevelIdx];
  const theme = BOARD_THEMES[boardTheme];

  const initLevel = useCallback((lvlIndex: number) => {
    const lvl = LEVELS[lvlIndex];
    setPiecePos(lvl.start);
    setRemainingStars(lvl.stars);
    setMovesCount(0);
    setIsLevelComplete(false);
  }, []);

  useEffect(() => {
    initLevel(currentLevelIdx);
  }, [currentLevelIdx, initLevel]);

  // Compute valid moves for the active level piece
  const validMoves = useMemo(() => {
    const moves: Square[] = [];
    const { row, col } = piecePos;
    const isInside = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;

    if (level.piece === 'knight') {
      const offsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      offsets.forEach(([dr, dc]) => {
        const nr = row + dr;
        const nc = col + dc;
        if (isInside(nr, nc)) moves.push({ row: nr, col: nc });
      });
    } else if (level.piece === 'bishop' || level.piece === 'rook' || level.piece === 'queen') {
      const directions: [number, number][] = [];
      if (level.piece === 'bishop' || level.piece === 'queen') {
        directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
      }
      if (level.piece === 'rook' || level.piece === 'queen') {
        directions.push([-1, 0], [1, 0], [0, -1], [0, 1]);
      }

      directions.forEach(([dr, dc]) => {
        let step = 1;
        while (true) {
          const nr = row + dr * step;
          const nc = col + dc * step;
          if (!isInside(nr, nc)) break;
          moves.push({ row: nr, col: nc });
          step++;
        }
      });
    }

    return moves;
  }, [piecePos, level.piece]);

  const handleSquareClick = (r: number, c: number) => {
    if (isLevelComplete) return;

    const isValid = validMoves.some((m) => m.row === r && m.col === c);
    if (!isValid) return;

    const newMovesCount = movesCount + 1;
    setMovesCount(newMovesCount);
    setPiecePos({ row: r, col: c });

    // Check star collection
    const collectedStar = remainingStars.find((s) => s.row === r && s.col === c);
    if (collectedStar) {
      sounds.playCapture();
      const updatedStars = remainingStars.filter((s) => !(s.row === r && s.col === c));
      setRemainingStars(updatedStars);

      if (updatedStars.length === 0) {
        setIsLevelComplete(true);
        sounds.playWin();
        confetti({ particleCount: 70, spread: 60 });
      }
    } else {
      sounds.playMove();
    }
  };

  const colNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Target className="w-6 h-6 text-amber-400" />
              Entrenador de Movimientos: Caza de Estrellas
            </h2>
            <p className="text-sm text-slate-400">
              Mueve tu pieza siguiendo las reglas para atrapar todas las estrellas en el menor número de jugadas.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => initLevel(currentLevelIdx)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reiniciar nivel
            </button>
          </div>
        </div>

        {/* Level Selector buttons */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {LEVELS.map((lvl, idx) => (
            <button
              key={lvl.id}
              onClick={() => setCurrentLevelIdx(idx)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                currentLevelIdx === idx
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 border border-slate-700'
              }`}
            >
              <span>{lvl.id}.</span>
              <span>{PIECES_DATA[lvl.piece].name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Board + Level details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: 8x8 Board (7 cols) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-slate-300">{level.title}</span>
            <div className="flex items-center gap-3">
              <span className="text-amber-400 font-mono">
                Estrellas restantes: {remainingStars.length}
              </span>
              <span className="text-slate-400 font-mono">
                Movimientos: {movesCount} (Par: {level.parMoves})
              </span>
            </div>
          </div>

          <div
            className="relative mx-auto max-w-[480px] aspect-square rounded-xl overflow-hidden shadow-2xl border-4"
            style={{ borderColor: theme.border }}
          >
            <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
              {Array.from({ length: 8 }).map((_, r) =>
                Array.from({ length: 8 }).map((_, c) => {
                  const isLight = (r + c) % 2 === 0;
                  const isPieceHere = piecePos.row === r && piecePos.col === c;
                  const hasStar = remainingStars.some((s) => s.row === r && s.col === c);
                  const isValidMove = validMoves.some((m) => m.row === r && m.col === c);

                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleSquareClick(r, c)}
                      className="relative w-full h-full flex items-center justify-center p-0 focus:outline-none transition-colors"
                      style={{
                        backgroundColor: isLight ? theme.light : theme.dark
                      }}
                      aria-label={`Casilla ${colNames[c]}${8 - r}`}
                    >
                      {/* Active Piece */}
                      {isPieceHere && (
                        <div className="relative z-20 scale-110 animate-in zoom-in-50 duration-150">
                          <ChessPieceIcon
                            type={level.piece}
                            color="white"
                            setId={setId}
                            size={48}
                          />
                        </div>
                      )}

                      {/* Target Star */}
                      {hasStar && !isPieceHere && (
                        <div className="relative z-10 flex items-center justify-center animate-bounce">
                          <Star className="w-6 h-6 text-amber-400 fill-amber-400 drop-shadow-md" />
                        </div>
                      )}

                      {/* Valid move indicator */}
                      {isValidMove && !hasStar && (
                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-600/80 shadow-md ring-2 ring-emerald-300/50 pointer-events-none" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Level Complete Card */}
          {isLevelComplete && (
            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-slate-900 border-2 border-emerald-500 text-center animate-in zoom-in-95 duration-200">
              <div className="flex items-center justify-center gap-2 text-emerald-400 font-extrabold text-lg mb-1">
                <Trophy className="w-5 h-5" />
                ¡Nivel Completado!
              </div>
              <p className="text-xs text-slate-300">
                Has recogido todas las estrellas en {movesCount} movimientos.
                {movesCount <= level.parMoves
                  ? ' ¡Puntuación perfecta de gran maestro!'
                  : ' ¡Buen trabajo! Puedes intentar mejorarlo en menos movimientos.'}
              </p>

              {currentLevelIdx < LEVELS.length - 1 && (
                <button
                  onClick={() => setCurrentLevelIdx((prev) => prev + 1)}
                  className="mt-3 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-colors inline-flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Siguiente Desafío ({LEVELS[currentLevelIdx + 1].title})
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Instructions & Tips (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
              Instrucciones de la Pieza
            </span>
            <div className="flex items-center gap-3 pb-3 border-b border-slate-800">
              <div className="w-12 h-12 flex items-center justify-center bg-slate-950 rounded-xl border border-slate-800">
                <ChessPieceIcon type={level.piece} color="white" setId={setId} size={42} />
              </div>
              <div>
                <h4 className="text-lg font-bold text-slate-100">{PIECES_DATA[level.piece].name}</h4>
                <span className="text-xs text-amber-400 font-semibold tabular-nums">
                  Valor: {PIECES_DATA[level.piece].valueLabel}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p className="leading-relaxed bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <strong className="text-slate-100 block mb-1">Pista táctica:</strong>
                {level.hint}
              </p>

              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                <strong className="text-slate-100 block mb-1">Regla de movimiento:</strong>
                {PIECES_DATA[level.piece].movementShort}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
