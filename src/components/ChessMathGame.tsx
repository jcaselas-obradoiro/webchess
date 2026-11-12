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
  Scale,
  Calculator,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Eye,
  HelpCircle,
  LayoutGrid,
  Coins
} from 'lucide-react';

interface ChessMathGameProps {
  setId: PieceSetId;
  boardTheme?: BoardThemeId;
}

type MathMode = 'board_sum' | 'equation_sum' | 'balance' | 'builder';

interface BoardPiecePosition {
  id: string;
  row: number;
  col: number;
  type: PieceType;
  color: PieceColor;
}

interface BoardSumChallenge {
  id: string;
  pieces: BoardPiecePosition[];
  whiteTotal: number;
  blackTotal: number;
  whiteBreakdown: string[];
  blackBreakdown: string[];
  difficulty: 'easy' | 'normal' | 'hard';
}

interface SumChallenge {
  id: string;
  items: { type: PieceType; count: number; sign: '+' | '-' }[];
  expectedTotal: number;
  explanation: string;
  options: number[];
}

interface BalanceChallenge {
  id: string;
  whitePieces: { type: PieceType; count: number }[];
  blackPieces: { type: PieceType; count: number }[];
  whiteTotal: number;
  blackTotal: number;
  question: string;
  correctAnswer: 'white' | 'black' | 'equal';
  explanation: string;
}

export const ChessMathGame: React.FC<ChessMathGameProps> = ({ setId, boardTheme = 'emerald' }) => {
  const [mode, setMode] = useState<MathMode>('board_sum');
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('easy');
  const [streak, setStreak] = useState<number>(0);
  const [bestStreak, setBestStreak] = useState<number>(0);
  const [answeredState, setAnsweredState] = useState<'idle' | 'correct' | 'partial' | 'wrong'>('idle');
  const [feedbackMsg, setFeedbackMsg] = useState<string>('');
  const [showValueOverlay, setShowValueOverlay] = useState<boolean>(false);

  // Board Sum State (Primary requested feature)
  const [currentBoardSum, setCurrentBoardSum] = useState<BoardSumChallenge | null>(null);
  const [inputWhite, setInputWhite] = useState<string>('');
  const [inputBlack, setInputBlack] = useState<string>('');

  // Mode 2: Equation Sum State
  const [currentSum, setCurrentSum] = useState<SumChallenge | null>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  // Mode 3: Balance Challenge State
  const [currentBalance, setCurrentBalance] = useState<BalanceChallenge | null>(null);
  const [balanceAnswer, setBalanceAnswer] = useState<'white' | 'black' | 'equal' | null>(null);

  // Mode 4: Builder Challenge State
  const [targetSum, setTargetSum] = useState<number>(8);
  const [selectedBuilderPieces, setSelectedBuilderPieces] = useState<PieceType[]>([]);

  const seed = useId();
  const theme = BOARD_THEMES[boardTheme];

  // Generator for Board Configurations
  const generateBoardSumChallenge = useCallback((): BoardSumChallenge => {
    const occupied = new Set<string>();
    const pieces: BoardPiecePosition[] = [];

    const getFreeSquare = (): { row: number; col: number } => {
      let r = 0;
      let c = 0;
      let key = '';
      do {
        r = Math.floor(Math.random() * 8);
        c = Math.floor(Math.random() * 8);
        key = `${r}-${c}`;
      } while (occupied.has(key));
      occupied.add(key);
      return { row: r, col: c };
    };

    // Pieces pool according to difficulty
    let pieceTypes: PieceType[] = [];
    let countPerSide = 2;

    if (difficulty === 'easy') {
      pieceTypes = ['pawn', 'pawn', 'knight', 'bishop'];
      countPerSide = Math.floor(Math.random() * 2) + 2; // 2 to 3 pieces per side
    } else if (difficulty === 'normal') {
      pieceTypes = ['pawn', 'knight', 'bishop', 'rook'];
      countPerSide = Math.floor(Math.random() * 2) + 3; // 3 to 4 pieces per side
    } else {
      pieceTypes = ['pawn', 'knight', 'bishop', 'rook', 'queen'];
      countPerSide = Math.floor(Math.random() * 3) + 4; // 4 to 6 pieces per side
    }

    // Add white pieces
    for (let i = 0; i < countPerSide; i++) {
      const type = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
      const sq = getFreeSquare();
      pieces.push({
        id: `w-${i}-${Date.now()}`,
        row: sq.row,
        col: sq.col,
        type,
        color: 'white'
      });
    }

    // Add black pieces
    for (let i = 0; i < countPerSide; i++) {
      const type = pieceTypes[Math.floor(Math.random() * pieceTypes.length)];
      const sq = getFreeSquare();
      pieces.push({
        id: `b-${i}-${Date.now()}`,
        row: sq.row,
        col: sq.col,
        type,
        color: 'black'
      });
    }

    // Tally sums
    let wSum = 0;
    const wMap: Record<PieceType, number> = { pawn: 0, knight: 0, bishop: 0, rook: 0, queen: 0, king: 0 };
    let bSum = 0;
    const bMap: Record<PieceType, number> = { pawn: 0, knight: 0, bishop: 0, rook: 0, queen: 0, king: 0 };

    pieces.forEach((p) => {
      const val = PIECES_DATA[p.type].value;
      if (p.color === 'white') {
        wSum += val;
        wMap[p.type]++;
      } else {
        bSum += val;
        bMap[p.type]++;
      }
    });

    const formatBreakdown = (map: Record<PieceType, number>) => {
      const parts: string[] = [];
      (Object.keys(map) as PieceType[]).forEach((type) => {
        const qty = map[type];
        if (qty > 0) {
          const info = PIECES_DATA[type];
          const name = qty > 1 ? info.pluralName : info.name;
          parts.push(`${qty} ${name} (${qty}×${info.value})`);
        }
      });
      return parts;
    };

    return {
      id: `board-sum-${seed}-${Date.now()}`,
      pieces,
      whiteTotal: wSum,
      blackTotal: bSum,
      whiteBreakdown: formatBreakdown(wMap),
      blackBreakdown: formatBreakdown(bMap),
      difficulty
    };
  }, [difficulty, seed]);

  // Generator for Equation Sum Challenges
  const generateSumChallenge = useCallback((): SumChallenge => {
    const piecePool: PieceType[] = ['pawn', 'knight', 'bishop', 'rook', 'queen'];
    const numItems = Math.random() > 0.4 ? 3 : 2;
    const items: { type: PieceType; count: number; sign: '+' | '-' }[] = [];
    let total = 0;

    for (let i = 0; i < numItems; i++) {
      const p = piecePool[Math.floor(Math.random() * piecePool.length)];
      const count = Math.random() > 0.6 ? 2 : 1;
      const pieceVal = PIECES_DATA[p].value;
      items.push({ type: p, count, sign: '+' });
      total += count * pieceVal;
    }

    const parts = items.map((it) => {
      const val = PIECES_DATA[it.type].value;
      return `${it.count} ${it.count > 1 ? PIECES_DATA[it.type].pluralName : PIECES_DATA[it.type].name} (${it.count}×${val})`;
    });
    const mathSteps = items.map((it) => `${it.count * PIECES_DATA[it.type].value}`).join(' + ');
    const explanation = `${parts.join(' + ')} = ${mathSteps} = ${total} puntos.`;

    const opts = new Set<number>([total]);
    while (opts.size < 4) {
      const delta = (Math.floor(Math.random() * 7) + 1) * (Math.random() > 0.5 ? 1 : -1);
      const val = Math.max(1, total + delta);
      opts.add(val);
    }
    const shuffledOpts = Array.from(opts).sort(() => Math.random() - 0.5);

    return {
      id: `sum-${seed}-${Date.now()}`,
      items,
      expectedTotal: total,
      explanation,
      options: shuffledOpts
    };
  }, [seed]);

  // Generator for Balance Challenges
  const generateBalanceChallenge = useCallback((): BalanceChallenge => {
    const piecePool: PieceType[] = ['pawn', 'knight', 'bishop', 'rook', 'queen'];
    const getRandomPieces = () => {
      const count = Math.floor(Math.random() * 3) + 1;
      const list: { type: PieceType; count: number }[] = [];
      for (let i = 0; i < count; i++) {
        const p = piecePool[Math.floor(Math.random() * piecePool.length)];
        const qty = Math.random() > 0.7 ? 2 : 1;
        list.push({ type: p, count: qty });
      }
      return list;
    };

    const whiteList = getRandomPieces();
    const blackList = getRandomPieces();
    const whiteVal = whiteList.reduce((acc, it) => acc + it.count * PIECES_DATA[it.type].value, 0);
    const blackVal = blackList.reduce((acc, it) => acc + it.count * PIECES_DATA[it.type].value, 0);

    let correct: 'white' | 'black' | 'equal' = 'equal';
    if (whiteVal > blackVal) correct = 'white';
    if (blackVal > whiteVal) correct = 'black';

    const explanation = `Blancas: ${whiteVal} puntos vs Negras: ${blackVal} puntos. ${
      correct === 'equal'
        ? '¡Ambos bandos tienen exactamente el mismo valor!'
        : `Las ${correct === 'white' ? 'Blancas' : 'Negras'} tienen ventaja de ${Math.abs(whiteVal - blackVal)} punto(s).`
    }`;

    return {
      id: `bal-${seed}-${Date.now()}`,
      whitePieces: whiteList,
      blackPieces: blackList,
      whiteTotal: whiteVal,
      blackTotal: blackVal,
      question: '¿Qué bando tiene más valor de material en esta balanza?',
      correctAnswer: correct,
      explanation
    };
  }, [seed]);

  // Reset challenge for active mode
  const nextChallenge = useCallback(() => {
    setAnsweredState('idle');
    setInputWhite('');
    setInputBlack('');
    setSelectedOption(null);
    setBalanceAnswer(null);
    setFeedbackMsg('');
    setShowValueOverlay(false);

    if (mode === 'board_sum') {
      setCurrentBoardSum(generateBoardSumChallenge());
    } else if (mode === 'equation_sum') {
      setCurrentSum(generateSumChallenge());
    } else if (mode === 'balance') {
      setCurrentBalance(generateBalanceChallenge());
    } else {
      const targets = [6, 7, 8, 9, 10, 11, 12, 14, 15];
      setTargetSum(targets[Math.floor(Math.random() * targets.length)]);
      setSelectedBuilderPieces([]);
    }
  }, [mode, generateBoardSumChallenge, generateSumChallenge, generateBalanceChallenge]);

  useEffect(() => {
    nextChallenge();
  }, [nextChallenge]);

  // Handle Board Sum Verification
  const handleVerifyBoardSum = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentBoardSum || answeredState !== 'idle') return;

    const wNum = parseInt(inputWhite.trim(), 10);
    const bNum = parseInt(inputBlack.trim(), 10);

    if (isNaN(wNum) || isNaN(bNum)) {
      sounds.playClick();
      setFeedbackMsg('Por favor, introduce un número válido tanto para las Blancas como para las Negras.');
      return;
    }

    const whiteCorrect = wNum === currentBoardSum.whiteTotal;
    const blackCorrect = bNum === currentBoardSum.blackTotal;

    if (whiteCorrect && blackCorrect) {
      sounds.playWin();
      setAnsweredState('correct');
      setStreak((s) => {
        const next = s + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });
      setFeedbackMsg(
        `¡Precisión perfecta! Blancas = ${currentBoardSum.whiteTotal} puntos y Negras = ${currentBoardSum.blackTotal} puntos.`
      );
      confetti({ particleCount: 75, spread: 65, origin: { y: 0.6 } });
    } else if (whiteCorrect || blackCorrect) {
      sounds.playWrong();
      setAnsweredState('partial');
      setStreak(0);
      setFeedbackMsg(
        whiteCorrect
          ? `¡Has acertado las Blancas (${currentBoardSum.whiteTotal} pts)! Pero las Negras suman ${currentBoardSum.blackTotal} pts (tú pusiste ${bNum}).`
          : `¡Has acertado las Negras (${currentBoardSum.blackTotal} pts)! Pero las Blancas suman ${currentBoardSum.whiteTotal} pts (tú pusiste ${wNum}).`
      );
    } else {
      sounds.playWrong();
      setAnsweredState('wrong');
      setStreak(0);
      setFeedbackMsg(
        `Ninguno de los dos cálculos fue exacto. Las Blancas suman ${currentBoardSum.whiteTotal} puntos y las Negras suman ${currentBoardSum.blackTotal} puntos.`
      );
    }
  };

  // Handle Mode 2 Equation Option
  const handleSelectSumOption = (opt: number) => {
    if (answeredState !== 'idle' || !currentSum) return;
    setSelectedOption(opt);

    if (opt === currentSum.expectedTotal) {
      sounds.playMatch();
      setAnsweredState('correct');
      setStreak((s) => {
        const next = s + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });
      setFeedbackMsg(`¡Excelente! ${currentSum.explanation}`);
      if ((streak + 1) % 5 === 0) {
        confetti({ particleCount: 50, spread: 60 });
      }
    } else {
      sounds.playWrong();
      setAnsweredState('wrong');
      setStreak(0);
      setFeedbackMsg(`¡Casi! ${currentSum.explanation}`);
    }
  };

  // Handle Mode 3 Balance Selection
  const handleSelectBalanceAnswer = (choice: 'white' | 'black' | 'equal') => {
    if (answeredState !== 'idle' || !currentBalance) return;
    setBalanceAnswer(choice);

    if (choice === currentBalance.correctAnswer) {
      sounds.playMatch();
      setAnsweredState('correct');
      setStreak((s) => {
        const next = s + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });
      setFeedbackMsg(`¡Correcto! ${currentBalance.explanation}`);
      if ((streak + 1) % 5 === 0) {
        confetti({ particleCount: 50, spread: 60 });
      }
    } else {
      sounds.playWrong();
      setAnsweredState('wrong');
      setStreak(0);
      setFeedbackMsg(`Incorrecto. ${currentBalance.explanation}`);
    }
  };

  // Mode 4 Builder controls
  const handleAddBuilderPiece = (p: PieceType) => {
    if (answeredState === 'correct') return;
    sounds.playClick();
    setSelectedBuilderPieces((prev) => [...prev, p]);
  };

  const handleRemoveBuilderPiece = (index: number) => {
    if (answeredState === 'correct') return;
    sounds.playClick();
    setSelectedBuilderPieces((prev) => prev.filter((_, i) => i !== index));
  };

  const currentBuilderTotal = useMemo(() => {
    return selectedBuilderPieces.reduce((sum, p) => sum + PIECES_DATA[p].value, 0);
  }, [selectedBuilderPieces]);

  const handleVerifyBuilder = () => {
    if (currentBuilderTotal === targetSum) {
      sounds.playMatch();
      setAnsweredState('correct');
      setStreak((s) => {
        const next = s + 1;
        if (next > bestStreak) setBestStreak(next);
        return next;
      });
      setFeedbackMsg(`¡Magnífico! Has formado exactamente ${targetSum} puntos.`);
      if ((streak + 1) % 5 === 0) {
        confetti({ particleCount: 60, spread: 70 });
      }
    } else {
      sounds.playWrong();
      setAnsweredState('wrong');
      setFeedbackMsg(
        currentBuilderTotal > targetSum
          ? `Te has pasado: tienes ${currentBuilderTotal} puntos y el objetivo es ${targetSum}. Quita alguna pieza.`
          : `Te faltan puntos: tienes ${currentBuilderTotal} de los ${targetSum} requeridos. ¡Añade más piezas!`
      );
    }
  };

  const colNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  return (
    <div className="space-y-6">
      {/* Header card with modes and streaks */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Calculator className="w-6 h-6 text-amber-400" />
              Módulo de Entrenamiento: Suma de Piezas
            </h2>
            <p className="text-sm text-slate-400">
              Calcula el valor numérico total de las piezas en el tablero y pon a prueba tu agilidad de cálculo material.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-950/80 px-4 py-2 rounded-xl border border-slate-800">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Racha Actual</span>
              <span className="text-lg font-extrabold text-amber-400 font-mono tabular-nums">
                🔥 {streak}
              </span>
            </div>
            <div className="w-[1px] h-8 bg-slate-800" />
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Mejor Racha</span>
              <span className="text-lg font-extrabold text-emerald-400 font-mono tabular-nums">
                🏆 {bestStreak}
              </span>
            </div>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setMode('board_sum');
                setStreak(0);
              }}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
                mode === 'board_sum'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              1. Suma de Tablero (Blancas y Negras)
            </button>
            <button
              onClick={() => {
                setMode('equation_sum');
                setStreak(0);
              }}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
                mode === 'equation_sum'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Coins className="w-4 h-4" />
              2. Suma Rápida (Ecuaciones)
            </button>
            <button
              onClick={() => {
                setMode('balance');
                setStreak(0);
              }}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
                mode === 'balance'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Scale className="w-4 h-4" />
              3. Balanza de Material
            </button>
            <button
              onClick={() => {
                setMode('builder');
                setStreak(0);
              }}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-2 transition-all ${
                mode === 'builder'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              4. Taller de Canjes
            </button>
          </div>

          {/* Difficulty selector (when in board sum) */}
          {mode === 'board_sum' && (
            <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <span className="text-[11px] font-bold text-slate-400 px-2">Piezas:</span>
              <button
                onClick={() => {
                  setDifficulty('easy');
                  sounds.playClick();
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  difficulty === 'easy' ? 'bg-slate-200 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pocas (4-6)
              </button>
              <button
                onClick={() => {
                  setDifficulty('normal');
                  sounds.playClick();
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  difficulty === 'normal' ? 'bg-slate-200 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Medio (6-8)
              </button>
              <button
                onClick={() => {
                  setDifficulty('hard');
                  sounds.playClick();
                }}
                className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                  difficulty === 'hard' ? 'bg-slate-200 text-slate-900 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Muchas (8-12)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODE 1: Dedicated Board Sum Trainer (Primary Request) */}
      {mode === 'board_sum' && currentBoardSum && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: 8x8 Board showing pieces (7 cols) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                  Configuración de Tablero
                </span>
                <span className="text-xs text-slate-500">·</span>
                <span className="text-xs text-amber-400 font-medium">
                  {currentBoardSum.pieces.length} piezas en total
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowValueOverlay(!showValueOverlay)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                    showValueOverlay
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                  title="Mostrar el valor de cada pieza sobre el tablero"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{showValueOverlay ? 'Ocultar Pistas' : 'Ver Pistas (+)'}</span>
                </button>

                <button
                  onClick={nextChallenge}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Nuevo Tablero</span>
                </button>
              </div>
            </div>

            {/* 8x8 Board Container */}
            <div
              className="relative mx-auto max-w-[480px] aspect-square rounded-xl overflow-hidden shadow-2xl border-4"
              style={{ borderColor: theme.border }}
            >
              <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
                {Array.from({ length: 8 }).map((_, r) =>
                  Array.from({ length: 8 }).map((_, c) => {
                    const isLight = (r + c) % 2 === 0;
                    const piece = currentBoardSum.pieces.find((p) => p.row === r && p.col === c);

                    return (
                      <div
                        key={`${r}-${c}`}
                        className="relative w-full h-full flex items-center justify-center p-0 select-none"
                        style={{
                          backgroundColor: isLight ? theme.light : theme.dark
                        }}
                      >
                        {/* Coordinates notations */}
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
                          <div className="relative z-10 animate-in zoom-in-75 duration-200">
                            <ChessPieceIcon
                              type={piece.type}
                              color={piece.color}
                              setId={setId}
                              size={46}
                              className="drop-shadow-md"
                            />
                            {/* Value badge hint overlay */}
                            {showValueOverlay && (
                              <span
                                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center shadow ${
                                  piece.color === 'white'
                                    ? 'bg-amber-400 text-slate-950 ring-1 ring-white'
                                    : 'bg-indigo-600 text-white ring-1 ring-slate-900'
                                }`}
                              >
                                {PIECES_DATA[piece.type].value}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
              <span>Peón = 1 · Caballo = 3 · Alfil = 3 · Torre = 5 · Dama = 9</span>
              <span className="text-amber-400 font-semibold">Suma mentalmente cada bando</span>
            </div>
          </div>

          {/* Right: Answer Submission Deck & Instant Feedback (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <form onSubmit={handleVerifyBoardSum} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                Calcula el Valor Total
              </span>
              <h3 className="text-lg font-bold text-slate-100">
                ¿Cuántos puntos suman las piezas de cada bando?
              </h3>

              {/* White Calculation Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="white-input" className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-100 inline-block shadow-sm" />
                    Valor Total Piezas Blancas:
                  </label>
                  {answeredState !== 'idle' && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        parseInt(inputWhite, 10) === currentBoardSum.whiteTotal
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {currentBoardSum.whiteTotal} pts reales
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="white-input"
                    type="number"
                    min="0"
                    placeholder="Puntos blancas..."
                    value={inputWhite}
                    onChange={(e) => setInputWhite(e.target.value)}
                    disabled={answeredState === 'correct'}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-lg font-bold text-slate-100 focus:outline-none focus:border-amber-400 font-mono tabular-nums"
                  />
                  <div className="flex gap-1">
                    {[1, 3, 5, 9].map((val) => (
                      <button
                        key={`w-btn-${val}`}
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setInputWhite((prev) => String((parseInt(prev, 10) || 0) + val));
                        }}
                        className="px-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700"
                        title={`Sumar +${val}`}
                      >
                        +{val}
                      </button>
                    ))}
                  </div>
                </div>

                {answeredState !== 'idle' && (
                  <div className="text-[11px] text-slate-400 pt-1">
                    Desglose: {currentBoardSum.whiteBreakdown.join(' + ')}
                  </div>
                )}
              </div>

              {/* Black Calculation Box */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="black-input" className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full bg-slate-900 border border-slate-400 inline-block shadow-sm" />
                    Valor Total Piezas Negras:
                  </label>
                  {answeredState !== 'idle' && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        parseInt(inputBlack, 10) === currentBoardSum.blackTotal
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {currentBoardSum.blackTotal} pts reales
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="black-input"
                    type="number"
                    min="0"
                    placeholder="Puntos negras..."
                    value={inputBlack}
                    onChange={(e) => setInputBlack(e.target.value)}
                    disabled={answeredState === 'correct'}
                    className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-lg font-bold text-slate-100 focus:outline-none focus:border-amber-400 font-mono tabular-nums"
                  />
                  <div className="flex gap-1">
                    {[1, 3, 5, 9].map((val) => (
                      <button
                        key={`b-btn-${val}`}
                        type="button"
                        onClick={() => {
                          sounds.playClick();
                          setInputBlack((prev) => String((parseInt(prev, 10) || 0) + val));
                        }}
                        className="px-2 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg border border-slate-700"
                        title={`Sumar +${val}`}
                      >
                        +{val}
                      </button>
                    ))}
                  </div>
                </div>

                {answeredState !== 'idle' && (
                  <div className="text-[11px] text-slate-400 pt-1">
                    Desglose: {currentBoardSum.blackBreakdown.join(' + ')}
                  </div>
                )}
              </div>

              {/* Submit / Next Action buttons */}
              {answeredState === 'idle' ? (
                <button
                  type="submit"
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Comprobar Suma del Tablero
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextChallenge}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  Siguiente Tablero
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {/* Instant Feedback Banner */}
              {answeredState !== 'idle' && (
                <div
                  className={`p-4 rounded-xl border flex items-start gap-3 animate-in fade-in zoom-in-95 duration-200 ${
                    answeredState === 'correct'
                      ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                      : answeredState === 'partial'
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                      : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                  }`}
                >
                  {answeredState === 'correct' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : answeredState === 'partial' ? (
                    <HelpCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs leading-relaxed">
                    <p className="font-bold">{feedbackMsg}</p>
                    <p className="text-slate-300 mt-1">
                      Diferencia material:{' '}
                      {currentBoardSum.whiteTotal === currentBoardSum.blackTotal ? (
                        <span>Igualdad exacta (0 puntos)</span>
                      ) : currentBoardSum.whiteTotal > currentBoardSum.blackTotal ? (
                        <span className="text-emerald-300 font-bold">
                          +{currentBoardSum.whiteTotal - currentBoardSum.blackTotal} puntos de ventaja para las Blancas
                        </span>
                      ) : (
                        <span className="text-indigo-300 font-bold">
                          +{currentBoardSum.blackTotal - currentBoardSum.whiteTotal} puntos de ventaja para las Negras
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* MODE 2: Equation Sum Challenges */}
      {mode === 'equation_sum' && currentSum && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 max-w-2xl mx-auto">
            <div className="text-center sm:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Desafío de Cálculo Rápido
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-slate-100 mt-0.5">
                ¿Cuánto suman estas piezas en total?
              </h3>
            </div>
            <button
              onClick={nextChallenge}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors shrink-0"
              title="Generar otra suma"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Otro Reto</span>
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 py-8 px-4 bg-slate-950/70 border border-slate-800/80 rounded-2xl">
            {currentSum.items.map((item, idx) => {
              const info = PIECES_DATA[item.type];
              return (
                <React.Fragment key={idx}>
                  {idx > 0 && <span className="text-2xl font-black text-amber-500">+</span>}
                  <div className="flex flex-col items-center bg-slate-900/90 border border-slate-800 p-4 rounded-2xl shadow-md min-w-[100px]">
                    <div className="w-14 h-14 flex items-center justify-center">
                      <ChessPieceIcon type={item.type} color="white" setId={setId} size={54} />
                    </div>
                    <span className="text-sm font-extrabold text-slate-100 mt-2">
                      {item.count > 1 ? `${item.count}× ${info.pluralName}` : info.name}
                    </span>
                    <span className="text-xs text-amber-400 font-semibold tabular-nums mt-0.5">
                      {info.value} {info.value === 1 ? 'pto' : 'pts'} c/u
                    </span>
                  </div>
                </React.Fragment>
              );
            })}
            <span className="text-2xl font-black text-slate-400">=</span>
            <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-amber-500/60 bg-amber-500/10 flex items-center justify-center text-2xl font-extrabold text-amber-300">
              ?
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
            {currentSum.options.map((opt) => {
              const isSelected = selectedOption === opt;
              const isCorrect = opt === currentSum.expectedTotal;

              let btnStyle = 'bg-slate-800/90 border-slate-700 text-slate-100 hover:bg-slate-700 hover:border-slate-500';
              if (answeredState !== 'idle') {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30';
                } else if (isSelected && !isCorrect) {
                  btnStyle = 'bg-rose-600 border-rose-400 text-white';
                } else {
                  btnStyle = 'bg-slate-900/50 border-slate-800 text-slate-600 opacity-50';
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleSelectSumOption(opt)}
                  disabled={answeredState !== 'idle'}
                  className={`py-4 px-3 rounded-2xl border-2 text-xl font-black tabular-nums transition-all ${btnStyle}`}
                >
                  {opt} puntos
                </button>
              );
            })}
          </div>

          {answeredState !== 'idle' && (
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-200 ${
                answeredState === 'correct'
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {answeredState === 'correct' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                )}
                <p className="text-sm font-medium">{feedbackMsg}</p>
              </div>

              <button
                onClick={nextChallenge}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 transition-colors shrink-0 shadow-md"
              >
                Siguiente Suma
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: Balance Challenge */}
      {mode === 'balance' && currentBalance && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Balanza de Material
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-100 mt-1">
              {currentBalance.question}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch max-w-3xl mx-auto">
            <div
              className={`p-6 rounded-2xl border-2 transition-all ${
                balanceAnswer === 'white'
                  ? currentBalance.correctAnswer === 'white'
                    ? 'border-emerald-500 bg-emerald-950/30'
                    : 'border-rose-500 bg-rose-950/30'
                  : 'border-slate-700 bg-slate-950/60'
              }`}
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <span className="font-extrabold text-slate-100 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-100 inline-block" />
                  Bando Blanco
                </span>
                {answeredState !== 'idle' && (
                  <span className="text-base font-black text-amber-400 tabular-nums">
                    {currentBalance.whiteTotal} pts
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 justify-center py-4 min-h-[90px]">
                {currentBalance.whitePieces.map((p, idx) => (
                  <div key={idx} className="flex flex-col items-center p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <ChessPieceIcon type={p.type} color="white" setId={setId} size={42} />
                    <span className="text-[11px] font-bold text-slate-300 mt-1">
                      {p.count > 1 ? `${p.count}×` : ''} {PIECES_DATA[p.type].name}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSelectBalanceAnswer('white')}
                disabled={answeredState !== 'idle'}
                className="w-full mt-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl border border-slate-600 transition-colors"
              >
                ¡Ganan las Blancas!
              </button>
            </div>

            <div
              className={`p-6 rounded-2xl border-2 transition-all ${
                balanceAnswer === 'black'
                  ? currentBalance.correctAnswer === 'black'
                    ? 'border-emerald-500 bg-emerald-950/30'
                    : 'border-rose-500 bg-rose-950/30'
                  : 'border-slate-700 bg-slate-950/60'
              }`}
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
                <span className="font-extrabold text-slate-100 flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-900 border border-slate-400 inline-block" />
                  Bando Negro
                </span>
                {answeredState !== 'idle' && (
                  <span className="text-base font-black text-amber-400 tabular-nums">
                    {currentBalance.blackTotal} pts
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2 justify-center py-4 min-h-[90px]">
                {currentBalance.blackPieces.map((p, idx) => (
                  <div key={idx} className="flex flex-col items-center p-2 rounded-xl bg-slate-900 border border-slate-800">
                    <ChessPieceIcon type={p.type} color="black" setId={setId} size={42} />
                    <span className="text-[11px] font-bold text-slate-300 mt-1">
                      {p.count > 1 ? `${p.count}×` : ''} {PIECES_DATA[p.type].name}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleSelectBalanceAnswer('black')}
                disabled={answeredState !== 'idle'}
                className="w-full mt-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs rounded-xl border border-slate-600 transition-colors"
              >
                ¡Ganan las Negras!
              </button>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={() => handleSelectBalanceAnswer('equal')}
              disabled={answeredState !== 'idle'}
              className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-bold transition-colors"
            >
              ⚖️ Tienen exactamente el mismo valor (Empate de material)
            </button>
          </div>

          {answeredState !== 'idle' && (
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-200 ${
                answeredState === 'correct'
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {answeredState === 'correct' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                )}
                <p className="text-sm font-medium">{feedbackMsg}</p>
              </div>

              <button
                onClick={nextChallenge}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 transition-colors shrink-0 shadow-md"
              >
                Siguiente Balanza
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* MODE 4: Builder Challenge */}
      {mode === 'builder' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="text-center max-w-xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Taller de Canjes Numéricos
            </span>
            <h3 className="text-xl sm:text-2xl font-extrabold text-slate-100 mt-1">
              Forma exactamente <span className="text-amber-400">{targetSum} puntos</span> combinando piezas
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Haz clic en las piezas de abajo para añadirlas a tu bolsa. Haz clic en una pieza añadida para quitarla.
            </p>
          </div>

          <div className="bg-slate-950/70 border-2 border-slate-800 rounded-2xl p-6 text-center max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs uppercase font-bold text-slate-400">Piezas seleccionadas</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-300">Total acumulado:</span>
                <span
                  className={`text-xl font-extrabold tabular-nums font-mono ${
                    currentBuilderTotal === targetSum
                      ? 'text-emerald-400'
                      : currentBuilderTotal > targetSum
                      ? 'text-rose-400'
                      : 'text-amber-400'
                  }`}
                >
                  {currentBuilderTotal} / {targetSum} pts
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center min-h-[90px] items-center p-3 bg-slate-900/60 rounded-xl border border-slate-800">
              {selectedBuilderPieces.length === 0 ? (
                <span className="text-xs text-slate-500 italic">
                  Tu canasta está vacía. Añade piezas desde el selector inferior.
                </span>
              ) : (
                selectedBuilderPieces.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleRemoveBuilderPiece(idx)}
                    title="Haz clic para quitar esta pieza"
                    className="group relative flex flex-col items-center p-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-rose-500 hover:bg-rose-950/40 transition-colors"
                  >
                    <ChessPieceIcon type={p} color="white" setId={setId} size={40} />
                    <span className="text-[10px] text-amber-400 font-bold tabular-nums">
                      +{PIECES_DATA[p].value}
                    </span>
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      ×
                    </span>
                  </button>
                ))
              )}
            </div>

            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                onClick={() => setSelectedBuilderPieces([])}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-colors"
              >
                Vaciar
              </button>
              <button
                onClick={handleVerifyBuilder}
                disabled={selectedBuilderPieces.length === 0}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-colors"
              >
                Comprobar si suma {targetSum} pts
              </button>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <span className="text-xs font-bold text-slate-400 block mb-2 text-center">
              Haz clic para añadir piezas al canje:
            </span>
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {(['pawn', 'knight', 'bishop', 'rook', 'queen'] as PieceType[]).map((pType) => {
                const info = PIECES_DATA[pType];
                return (
                  <button
                    key={pType}
                    onClick={() => handleAddBuilderPiece(pType)}
                    className="flex flex-col items-center p-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-500 transition-all text-center"
                  >
                    <ChessPieceIcon type={pType} color="white" setId={setId} size={38} />
                    <span className="text-xs font-bold text-slate-200 mt-1">{info.name}</span>
                    <span className="text-xs text-amber-400 font-semibold tabular-nums">
                      {info.value} {info.value === 1 ? 'pto' : 'pts'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {answeredState !== 'idle' && (
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in zoom-in-95 duration-200 max-w-2xl mx-auto ${
                answeredState === 'correct'
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {answeredState === 'correct' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                )}
                <p className="text-sm font-medium">{feedbackMsg}</p>
              </div>

              {answeredState === 'correct' && (
                <button
                  onClick={nextChallenge}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 transition-colors shrink-0 shadow-md"
                >
                  Nuevo Objetivo
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
