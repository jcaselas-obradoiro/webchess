import React, { useState, useEffect, useCallback, useId, useMemo } from 'react';
import confetti from 'canvas-confetti';
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
import {
  RotateCcw,
  Trophy,
  Timer,
  Eye,
  Sparkles,
  Grid,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export type MemorySubTab = 'cards' | 'board_position';
export type CardMemoryMode = 'values' | 'pieces' | 'movements';

interface MemoryCard {
  id: string;
  pieceType: PieceType;
  cardRole: 'piece' | 'matchTarget';
  label: string;
  subLabel?: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface PieceOnBoard {
  id: string;
  row: number;
  col: number;
  type: PieceType;
  color: PieceColor;
}

interface ChessMemoryGameProps {
  setId: PieceSetId;
  boardTheme?: BoardThemeId;
}

export const ChessMemoryGame: React.FC<ChessMemoryGameProps> = ({ setId, boardTheme = 'emerald' }) => {
  const [activeTab, setActiveTab] = useState<MemorySubTab>('board_position');

  // --- SUB-TAB 1: BOARD POSITION MEMORY (Recordar Posición de Piezas) ---
  const [boardDifficulty, setBoardDifficulty] = useState<'easy' | 'normal' | 'hard'>('easy');
  const [phase, setPhase] = useState<'memorize' | 'recall' | 'result'>('memorize');
  const [targetPieces, setTargetPieces] = useState<PieceOnBoard[]>([]);
  const [userPlacedPieces, setUserPlacedPieces] = useState<PieceOnBoard[]>([]);
  const [selectedInventoryPiece, setSelectedInventoryPiece] = useState<PieceOnBoard | null>(null);
  const [countdown, setCountdown] = useState<number>(5);
  const [accuracyScore, setAccuracyScore] = useState<number>(0);

  // --- SUB-TAB 2: CARD MATCHING MEMORY ---
  const [cardMode, setCardMode] = useState<CardMemoryMode>('values');
  const [cardDifficulty, setCardDifficulty] = useState<'easy' | 'normal' | 'hard'>('easy');
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [cardSeconds, setCardSeconds] = useState<number>(0);
  const [isCardPlaying, setIsCardPlaying] = useState<boolean>(false);
  const [isCardGameOver, setIsCardGameOver] = useState<boolean>(false);
  const [isCardLocked, setIsCardLocked] = useState<boolean>(false);

  const theme = BOARD_THEMES[boardTheme];
  const seed = useId();

  // === BOARD POSITION MEMORY LOGIC ===
  const startNewBoardMemoryRound = useCallback(() => {
    sounds.playClick();
    setUserPlacedPieces([]);
    setSelectedInventoryPiece(null);

    const count = boardDifficulty === 'easy' ? 3 : boardDifficulty === 'normal' ? 5 : 7;
    const pieceTypesPool: PieceType[] = ['pawn', 'knight', 'bishop', 'rook', 'queen'];
    const colors: PieceColor[] = ['white', 'black'];

    const occupied = new Set<string>();
    const pieces: PieceOnBoard[] = [];

    for (let i = 0; i < count; i++) {
      let r = 0;
      let c = 0;
      let key = '';
      do {
        r = Math.floor(Math.random() * 8);
        c = Math.floor(Math.random() * 8);
        key = `${r}-${c}`;
      } while (occupied.has(key));
      occupied.add(key);

      const type = pieceTypesPool[Math.floor(Math.random() * pieceTypesPool.length)];
      const color = colors[Math.floor(Math.random() * colors.length)];

      pieces.push({
        id: `tgt-${i}-${Date.now()}`,
        row: r,
        col: c,
        type,
        color
      });
    }

    setTargetPieces(pieces);
    setPhase('memorize');
    const memoTime = boardDifficulty === 'easy' ? 6 : boardDifficulty === 'normal' ? 7 : 9;
    setCountdown(memoTime);
  }, [boardDifficulty]);

  // Memorize timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (phase === 'memorize') {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            sounds.playClick();
            setPhase('recall');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [phase]);

  // Inventory available for recall
  const inventoryPieces = useMemo(() => {
    return targetPieces.map((p) => {
      const isAlreadyPlaced = userPlacedPieces.some((u) => u.id === p.id);
      return { piece: p, placed: isAlreadyPlaced };
    });
  }, [targetPieces, userPlacedPieces]);

  // Handle placing piece on square
  const handleBoardSquareClick = (r: number, c: number) => {
    if (phase !== 'recall') return;

    // If square already has a placed piece, remove it
    const existingIdx = userPlacedPieces.findIndex((u) => u.row === r && u.col === c);
    if (existingIdx !== -1) {
      sounds.playClick();
      setUserPlacedPieces((prev) => prev.filter((_, idx) => idx !== existingIdx));
      return;
    }

    // Place selected piece
    if (selectedInventoryPiece) {
      sounds.playMove();
      setUserPlacedPieces((prev) => [
        ...prev.filter((p) => p.id !== selectedInventoryPiece.id),
        { ...selectedInventoryPiece, row: r, col: c }
      ]);
      setSelectedInventoryPiece(null);
    }
  };

  const handleVerifyRecall = () => {
    if (phase !== 'recall') return;

    let correctCount = 0;
    targetPieces.forEach((target) => {
      const placed = userPlacedPieces.find((u) => u.id === target.id);
      if (placed && placed.row === target.row && placed.col === target.col) {
        correctCount++;
      }
    });

    const scorePct = Math.round((correctCount / targetPieces.length) * 100);
    setAccuracyScore(scorePct);
    setPhase('result');

    if (scorePct === 100) {
      sounds.playWin();
      confetti({ particleCount: 80, spread: 70 });
    } else if (scorePct >= 50) {
      sounds.playMatch();
    } else {
      sounds.playWrong();
    }
  };

  useEffect(() => {
    if (activeTab === 'board_position') {
      startNewBoardMemoryRound();
    }
  }, [activeTab, boardDifficulty, startNewBoardMemoryRound]);

  // === CARD MATCHING MEMORY LOGIC ===
  const totalPairs = cardDifficulty === 'easy' ? 6 : cardDifficulty === 'normal' ? 8 : 12;

  const initCardGame = useCallback(() => {
    setIsCardGameOver(false);
    setFlippedIndices([]);
    setMatchedPairs(0);
    setMoves(0);
    setCardSeconds(0);
    setIsCardPlaying(false);
    setIsCardLocked(false);

    const availablePieces: PieceType[] = ['pawn', 'knight', 'bishop', 'rook', 'queen', 'king'];
    const poolPieces: PieceType[] = [];
    while (poolPieces.length < totalPairs) {
      for (const p of availablePieces) {
        if (poolPieces.length < totalPairs) {
          poolPieces.push(p);
        }
      }
    }

    const newCards: MemoryCard[] = [];
    poolPieces.forEach((pType, i) => {
      const info = PIECES_DATA[pType];
      newCards.push({
        id: `card-${seed}-${pType}-a-${i}`,
        pieceType: pType,
        cardRole: 'piece',
        label: info.name,
        isFlipped: false,
        isMatched: false
      });

      if (cardMode === 'pieces') {
        newCards.push({
          id: `card-${seed}-${pType}-b-${i}`,
          pieceType: pType,
          cardRole: 'matchTarget',
          label: info.name,
          isFlipped: false,
          isMatched: false
        });
      } else if (cardMode === 'values') {
        newCards.push({
          id: `card-${seed}-${pType}-val-${i}`,
          pieceType: pType,
          cardRole: 'matchTarget',
          label: info.value === 99 ? '∞ Invaluable' : `${info.value} ${info.value === 1 ? 'Punto' : 'Puntos'}`,
          subLabel: info.name,
          isFlipped: false,
          isMatched: false
        });
      } else {
        const shortMove: Record<PieceType, string> = {
          pawn: '1 paso adelante / Come en diagonal',
          knight: 'Salta en forma de "L"',
          bishop: 'Diagonales de su color',
          rook: 'Horizontal y vertical (+)',
          queen: 'Cualquier dirección libre',
          king: '1 paso en cualquier dirección'
        };

        newCards.push({
          id: `card-${seed}-${pType}-mov-${i}`,
          pieceType: pType,
          cardRole: 'matchTarget',
          label: shortMove[pType],
          subLabel: info.name,
          isFlipped: false,
          isMatched: false
        });
      }
    });

    for (let i = newCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
    }

    setCards(newCards);
  }, [cardMode, cardDifficulty, totalPairs, seed]);

  useEffect(() => {
    if (activeTab === 'cards') {
      initCardGame();
    }
  }, [activeTab, initCardGame]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isCardPlaying && !isCardGameOver && activeTab === 'cards') {
      timer = setInterval(() => {
        setCardSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isCardPlaying, isCardGameOver, activeTab]);

  const handleCardClick = (index: number) => {
    if (isCardLocked || isCardGameOver) return;
    const card = cards[index];
    if (card.isFlipped || card.isMatched) return;

    if (!isCardPlaying) setIsCardPlaying(true);
    sounds.playClick();

    const updatedCards = [...cards];
    updatedCards[index].isFlipped = true;
    setCards(updatedCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setIsCardLocked(true);

      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = updatedCards[firstIdx];
      const secondCard = updatedCards[secondIdx];
      const isMatch = firstCard.pieceType === secondCard.pieceType;

      if (isMatch) {
        setTimeout(() => {
          sounds.playMatch();
          const matchedList = [...updatedCards];
          matchedList[firstIdx].isMatched = true;
          matchedList[secondIdx].isMatched = true;
          setCards(matchedList);
          setFlippedIndices([]);
          setIsCardLocked(false);

          const newMatchedCount = matchedPairs + 1;
          setMatchedPairs(newMatchedCount);

          if (newMatchedCount >= totalPairs) {
            setIsCardGameOver(true);
            setIsCardPlaying(false);
            sounds.playWin();
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
          }
        }, 500);
      } else {
        setTimeout(() => {
          sounds.playWrong();
          const resetList = [...updatedCards];
          resetList[firstIdx].isFlipped = false;
          resetList[secondIdx].isFlipped = false;
          setCards(resetList);
          setFlippedIndices([]);
          setIsCardLocked(false);
        }, 1100);
      }
    }
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const colNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  return (
    <div className="space-y-6">
      {/* Top Header Card & Tab Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Eye className="w-6 h-6 text-amber-400" />
              Módulo de Memoria de Ajedrez
            </h2>
            <p className="text-sm text-slate-400">
              Desarrolla tu memoria visual recordando la posición exacta de las piezas o emparejando sus valores.
            </p>
          </div>

          {/* Sub-tab switcher */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setActiveTab('board_position');
                sounds.playClick();
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'board_position'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              1. Recordar Posición de Piezas
            </button>
            <button
              onClick={() => {
                setActiveTab('cards');
                sounds.playClick();
              }}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === 'cards'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              2. Memory de Cartas y Valores
            </button>
          </div>
        </div>

        {/* SUB-TAB 1 HEADER CONTROLS (BOARD MEMORY) */}
        {activeTab === 'board_position' && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">Dificultad de Memorización:</span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => {
                    setBoardDifficulty('easy');
                    sounds.playClick();
                  }}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    boardDifficulty === 'easy' ? 'bg-slate-200 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Fácil (3 piezas)
                </button>
                <button
                  onClick={() => {
                    setBoardDifficulty('normal');
                    sounds.playClick();
                  }}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    boardDifficulty === 'normal' ? 'bg-slate-200 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Medio (5 piezas)
                </button>
                <button
                  onClick={() => {
                    setBoardDifficulty('hard');
                    sounds.playClick();
                  }}
                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                    boardDifficulty === 'hard' ? 'bg-slate-200 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Maestro (7 piezas)
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={startNewBoardMemoryRound}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reiniciar Ejercicio
              </button>
            </div>
          </div>
        )}

        {/* SUB-TAB 2 HEADER CONTROLS (CARDS MEMORY) */}
        {activeTab === 'cards' && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Tipo de Emparejamiento:</span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setCardMode('values')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    cardMode === 'values' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pieza y Valor
                </button>
                <button
                  onClick={() => setCardMode('pieces')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    cardMode === 'pieces' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pieza con Pieza
                </button>
                <button
                  onClick={() => setCardMode('movements')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    cardMode === 'movements' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Pieza y Movimiento
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-semibold">Cartas:</span>
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setCardDifficulty('easy')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                    cardDifficulty === 'easy' ? 'bg-slate-200 text-slate-900 shadow' : 'text-slate-400'
                  }`}
                >
                  12
                </button>
                <button
                  onClick={() => setCardDifficulty('normal')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                    cardDifficulty === 'normal' ? 'bg-slate-200 text-slate-900 shadow' : 'text-slate-400'
                  }`}
                >
                  16
                </button>
                <button
                  onClick={() => setCardDifficulty('hard')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                    cardDifficulty === 'hard' ? 'bg-slate-200 text-slate-900 shadow' : 'text-slate-400'
                  }`}
                >
                  24
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- CONTENT FOR TAB 1: BOARD POSITION MEMORY --- */}
      {activeTab === 'board_position' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: 8x8 Board (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3 text-xs">
              <div>
                {phase === 'memorize' ? (
                  <span className="text-amber-400 font-bold flex items-center gap-2">
                    <Timer className="w-4 h-4 animate-spin" />
                    ¡Fase de Memorización! Observa el tablero ({countdown}s restantes)
                  </span>
                ) : phase === 'recall' ? (
                  <span className="text-sky-400 font-bold flex items-center gap-1.5">
                    <Grid className="w-4 h-4" />
                    Fase de Reconstrucción: Coloca las piezas en sus casillas
                  </span>
                ) : (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Resultado de Memoria: {accuracyScore}% de precisión
                  </span>
                )}
              </div>

              {phase === 'memorize' && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    setPhase('recall');
                  }}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors shadow"
                >
                  ¡Ya lo memoricé!
                </button>
              )}
            </div>

            {/* Countdown bar during memorize */}
            {phase === 'memorize' && (
              <div className="w-full bg-slate-800 h-1.5 rounded-full mb-3 overflow-hidden">
                <div
                  className="bg-amber-400 h-full transition-all duration-1000 ease-linear"
                  style={{
                    width: `${(countdown / (boardDifficulty === 'easy' ? 6 : boardDifficulty === 'normal' ? 7 : 9)) * 100}%`
                  }}
                />
              </div>
            )}

            {/* 8x8 Board */}
            <div
              className="relative mx-auto max-w-[480px] aspect-square rounded-xl overflow-hidden shadow-2xl border-4"
              style={{ borderColor: theme.border }}
            >
              <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                {Array.from({ length: 8 }).map((_, r) =>
                  Array.from({ length: 8 }).map((_, c) => {
                    const isLight = (r + c) % 2 === 0;

                    // Which piece to display in this square?
                    let displayPiece: PieceOnBoard | undefined;
                    let isTargetSquare = false;
                    let isCorrectRecall = false;

                    if (phase === 'memorize') {
                      displayPiece = targetPieces.find((p) => p.row === r && p.col === c);
                    } else if (phase === 'recall') {
                      displayPiece = userPlacedPieces.find((p) => p.row === r && p.col === c);
                    } else {
                      // 'result' phase: show user placed pieces, and highlight correct vs target
                      displayPiece = userPlacedPieces.find((p) => p.row === r && p.col === c);
                      const targetOnThisSquare = targetPieces.find((p) => p.row === r && p.col === c);
                      isTargetSquare = !!targetOnThisSquare;
                      if (displayPiece && targetOnThisSquare && displayPiece.id === targetOnThisSquare.id) {
                        isCorrectRecall = true;
                      }
                    }

                    return (
                      <button
                        key={`${r}-${c}`}
                        onClick={() => handleBoardSquareClick(r, c)}
                        disabled={phase !== 'recall'}
                        className="relative w-full h-full flex items-center justify-center p-0 focus:outline-none transition-colors"
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

                        {/* Displayed Piece */}
                        {displayPiece && (
                          <div className="relative z-10 animate-in zoom-in-75 duration-150">
                            <ChessPieceIcon
                              type={displayPiece.type}
                              color={displayPiece.color}
                              setId={setId}
                              size={46}
                              className="drop-shadow-md"
                            />
                          </div>
                        )}

                        {/* In Result Phase: show green highlight if matched, or phantom target if missed */}
                        {phase === 'result' && isCorrectRecall && (
                          <div className="absolute inset-0 bg-emerald-500/30 border-2 border-emerald-400 z-20 pointer-events-none flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-300 drop-shadow" />
                          </div>
                        )}

                        {phase === 'result' && isTargetSquare && !isCorrectRecall && (
                          <div className="absolute inset-0 bg-rose-500/20 border-2 border-dashed border-rose-400 z-20 pointer-events-none flex items-center justify-center">
                            <span className="text-[10px] font-bold text-rose-200 bg-rose-950/80 px-1 rounded">
                              ¡Aquí!
                            </span>
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
                {phase === 'memorize' && 'Observa las casillas y colores con atención.'}
                {phase === 'recall' && 'Haz clic en una pieza de la lista y luego en la casilla donde crees que estaba.'}
                {phase === 'result' && 'Las casillas verdes son aciertos exactos; las rojas indican la posición original.'}
              </span>
            </div>
          </div>

          {/* Right: Reconstruction Palette & Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  {phase === 'memorize' ? 'Piezas a Memorizar' : 'Bandeja de Reconstrucción'}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {userPlacedPieces.length} / {targetPieces.length} colocadas
                </span>
              </div>

              {/* Inventory pieces to place */}
              <div className="space-y-2">
                <span className="text-xs text-slate-300 block">
                  {phase === 'memorize'
                    ? 'Memoriza en qué casilla está cada una:'
                    : 'Haz clic en una pieza y luego en el tablero para colocarla:'}
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {inventoryPieces.map(({ piece, placed }) => {
                    const isSelected = selectedInventoryPiece?.id === piece.id;
                    const info = PIECES_DATA[piece.type];

                    return (
                      <button
                        key={piece.id}
                        type="button"
                        onClick={() => {
                          if (phase === 'recall' && !placed) {
                            sounds.playClick();
                            setSelectedInventoryPiece(piece);
                          }
                        }}
                        disabled={phase !== 'recall' || placed}
                        className={`p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                          placed
                            ? 'bg-slate-950/40 border-slate-800 opacity-40 cursor-default'
                            : isSelected
                            ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/40'
                            : 'bg-slate-800 hover:bg-slate-700/80 border-slate-700'
                        }`}
                      >
                        <ChessPieceIcon type={piece.type} color={piece.color} setId={setId} size={40} />
                        <span className="text-xs font-bold text-slate-200 mt-1">
                          {piece.color === 'white' ? 'Blanco' : 'Negro'}
                        </span>
                        <span className="text-[10px] text-slate-400">{info.name}</span>
                        {phase === 'memorize' && (
                          <span className="text-[10px] font-bold text-amber-400 mt-0.5">
                            en {colNames[piece.col]}
                            {8 - piece.row}
                          </span>
                        )}
                        {placed && phase === 'recall' && (
                          <span className="text-[10px] font-bold text-emerald-400 mt-0.5">✓ En tablero</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              {phase === 'recall' && (
                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleVerifyRecall}
                    disabled={userPlacedPieces.length === 0}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Comprobar Posición Recordada
                  </button>

                  <button
                    onClick={() => setUserPlacedPieces([])}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl border border-slate-700"
                  >
                    Limpiar tablero
                  </button>
                </div>
              )}

              {phase === 'result' && (
                <div className="pt-2 space-y-3">
                  <div
                    className={`p-4 rounded-xl border text-center ${
                      accuracyScore === 100
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                        : accuracyScore >= 50
                        ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                        : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                    }`}
                  >
                    <div className="text-2xl font-black mb-1">{accuracyScore}% de Precisión</div>
                    <p className="text-xs">
                      {accuracyScore === 100
                        ? '¡Memoria fotográfica impecable! Has recordado todas las casillas.'
                        : accuracyScore >= 50
                        ? '¡Buen intento! Revisa en el tablero las casillas que no coincidieron.'
                        : 'Sigue practicando para afilar tu retención visual del tablero.'}
                    </p>
                  </div>

                  <button
                    onClick={startNewBoardMemoryRound}
                    className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    Siguiente Desafío de Memoria
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- CONTENT FOR TAB 2: CARDS MEMORY --- */}
      {activeTab === 'cards' && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <span className="text-xs text-slate-400 flex items-center gap-1.5">
                <Timer className="w-3.5 h-3.5 text-amber-400" /> Tiempo
              </span>
              <span className="text-base font-bold text-slate-100 font-mono tabular-nums">
                {formatTime(cardSeconds)}
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <span className="text-xs text-slate-400">Intentos</span>
              <span className="text-base font-bold text-amber-400 font-mono tabular-nums">
                {moves}
              </span>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between">
              <span className="text-xs text-slate-400">Parejas</span>
              <span className="text-base font-bold text-emerald-400 font-mono tabular-nums">
                {matchedPairs} / {totalPairs}
              </span>
            </div>
          </div>

          <div
            className={`grid gap-3 md:gap-4 ${
              cardDifficulty === 'easy'
                ? 'grid-cols-3 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-6'
                : cardDifficulty === 'normal'
                ? 'grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4'
                : 'grid-cols-4 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-6'
            }`}
          >
            {cards.map((card, index) => {
              const isRevealed = card.isFlipped || card.isMatched;

              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(index)}
                  disabled={isRevealed || isCardLocked}
                  className={`relative h-28 sm:h-36 rounded-2xl p-2 transition-all duration-300 transform select-none focus:outline-none ${
                    card.isMatched
                      ? 'bg-emerald-950/40 border-2 border-emerald-500/60 opacity-80 scale-95'
                      : isRevealed
                      ? 'bg-slate-800 border-2 border-amber-500 shadow-xl scale-100'
                      : 'bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 hover:border-slate-500 hover:scale-[1.02] shadow-md cursor-pointer'
                  }`}
                >
                  {isRevealed ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-1 animate-in zoom-in-75 duration-200">
                      {card.cardRole === 'piece' ? (
                        <>
                          <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center">
                            <ChessPieceIcon
                              type={card.pieceType}
                              color="white"
                              setId={setId}
                              size={48}
                            />
                          </div>
                          <span className="text-xs font-bold text-slate-200 mt-1 truncate max-w-full">
                            {card.label}
                          </span>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full px-1">
                          {cardMode === 'values' ? (
                            <>
                              <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 tabular-nums">
                                {card.label.includes('∞') ? '∞' : card.label.split(' ')[0]}
                              </span>
                              <span className="text-xs font-bold text-amber-200 uppercase tracking-wider mt-0.5">
                                {card.label.includes('∞') ? 'Invaluable' : 'Puntos'}
                              </span>
                              {card.subLabel && (
                                <span className="text-[10px] text-slate-400 mt-1">
                                  ({card.subLabel})
                                </span>
                              )}
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 text-amber-400 mb-1" />
                              <p className="text-[11px] sm:text-xs text-slate-200 font-medium leading-tight">
                                {card.label}
                              </p>
                              {card.subLabel && (
                                <span className="text-[10px] text-amber-400 font-bold mt-1">
                                  {card.subLabel}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {card.isMatched && (
                        <div className="absolute top-1 right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black">
                          ✓
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center rounded-xl bg-slate-900/80 border border-slate-700/50">
                      <div className="w-8 h-8 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400">
                        <span className="text-base font-serif">♟</span>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold mt-1.5">
                        Ajedrez
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {isCardGameOver && (
            <div className="bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-900 border-2 border-amber-500 rounded-3xl p-6 sm:p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 mb-4">
                <Trophy className="w-8 h-8" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-100 mb-1">
                ¡Enhorabuena, Memoria Completada!
              </h3>
              <p className="text-slate-300 text-sm max-w-md mx-auto mb-6">
                Has dominado los pares de piezas y sus valores en {moves} intentos y {formatTime(cardSeconds)}.
              </p>
              <button
                onClick={initCardGame}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 inline-flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Jugar otra ronda
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
