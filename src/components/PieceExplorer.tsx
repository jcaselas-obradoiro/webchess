import React, { useState, useMemo, useEffect } from 'react';
import {
  PieceType,
  PieceColor,
  PIECES_DATA,
  PieceSetId,
  BoardThemeId,
  BOARD_THEMES,
  ChessPieceIcon
} from '../data/pieceSets';
import { sounds } from '../utils/sound';
import { RotateCcw, Swords, Sparkles, BookOpen, ChevronRight, HelpCircle } from 'lucide-react';

interface Square {
  row: number; // 0 to 7 (8 down to 1)
  col: number; // 0 to 7 (a to h)
}

interface PieceExplorerProps {
  setId: PieceSetId;
  boardTheme: BoardThemeId;
}

export const PieceExplorer: React.FC<PieceExplorerProps> = ({ setId, boardTheme }) => {
  const [selectedPiece, setSelectedPiece] = useState<PieceType>('knight');
  const [pieceColor, setPieceColor] = useState<PieceColor>('white');
  const [piecePos, setPiecePos] = useState<Square>({ row: 4, col: 3 }); // d4
  const [showEnemies, setShowEnemies] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'movimiento' | 'valor' | 'reglas'>('movimiento');
  const [capturedCount, setCapturedCount] = useState<number>(0);

  const pieceInfo = PIECES_DATA[selectedPiece];
  const theme = BOARD_THEMES[boardTheme];

  // Configured default enemy positions for demonstrating captures
  const enemyPositions: Record<PieceType, Square[]> = {
    pawn: pieceColor === 'white' 
      ? [
          { row: 3, col: 2 }, // diagonal left capture
          { row: 3, col: 4 }, // diagonal right capture
          { row: 3, col: 3 }  // blocking enemy front
        ]
      : [
          { row: 4, col: 2 }, // diagonal capture downwards for black
          { row: 4, col: 4 },
          { row: 4, col: 3 }
        ],
    knight: [
      { row: 2, col: 2 },
      { row: 2, col: 4 },
      { row: 3, col: 3 }
    ],
    bishop: [
      { row: 2, col: 1 },
      { row: 2, col: 5 },
      { row: 6, col: 1 }
    ],
    rook: [
      { row: 4, col: 6 },
      { row: 1, col: 3 },
      { row: 4, col: 1 }
    ],
    queen: [
      { row: 2, col: 1 },
      { row: 4, col: 6 },
      { row: 1, col: 3 },
      { row: 6, col: 5 }
    ],
    king: [
      { row: 3, col: 2 },
      { row: 3, col: 4 },
      { row: 5, col: 3 }
    ]
  };

  const [activeEnemies, setActiveEnemies] = useState<Square[]>(enemyPositions['knight']);

  // Update enemies when piece or color changes
  useEffect(() => {
    setActiveEnemies(showEnemies ? enemyPositions[selectedPiece] : []);
  }, [selectedPiece, pieceColor, showEnemies]);

  // Calculate valid moves based on standard chess rules from current piecePos
  const validMoves = useMemo(() => {
    const moves: { square: Square; isCapture: boolean }[] = [];
    const { row, col } = piecePos;

    const isInside = (r: number, c: number) => r >= 0 && r < 8 && c >= 0 && c < 8;
    const hasEnemy = (r: number, c: number) =>
      activeEnemies.some((e) => e.row === r && e.col === c);

    if (selectedPiece === 'pawn') {
      const dir = pieceColor === 'white' ? -1 : 1;
      const startRow = pieceColor === 'white' ? 6 : 1;

      // Single step forward
      const oneStep = { row: row + dir, col };
      if (isInside(oneStep.row, oneStep.col) && !hasEnemy(oneStep.row, oneStep.col)) {
        moves.push({ square: oneStep, isCapture: false });
        // Initial 2 squares leap
        if (row === startRow) {
          const twoStep = { row: row + 2 * dir, col };
          if (!hasEnemy(twoStep.row, twoStep.col)) {
            moves.push({ square: twoStep, isCapture: false });
          }
        }
      }
      // Pawn diagonal captures
      const diagLeft = { row: row + dir, col: col - 1 };
      const diagRight = { row: row + dir, col: col + 1 };
      if (isInside(diagLeft.row, diagLeft.col) && hasEnemy(diagLeft.row, diagLeft.col)) {
        moves.push({ square: diagLeft, isCapture: true });
      }
      if (isInside(diagRight.row, diagRight.col) && hasEnemy(diagRight.row, diagRight.col)) {
        moves.push({ square: diagRight, isCapture: true });
      }
    } else if (selectedPiece === 'knight') {
      const offsets = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ];
      offsets.forEach(([dr, dc]) => {
        const nr = row + dr;
        const nc = col + dc;
        if (isInside(nr, nc)) {
          moves.push({ square: { row: nr, col: nc }, isCapture: hasEnemy(nr, nc) });
        }
      });
    } else if (selectedPiece === 'bishop' || selectedPiece === 'rook' || selectedPiece === 'queen') {
      const directions: [number, number][] = [];
      if (selectedPiece === 'bishop' || selectedPiece === 'queen') {
        directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
      }
      if (selectedPiece === 'rook' || selectedPiece === 'queen') {
        directions.push([-1, 0], [1, 0], [0, -1], [0, 1]);
      }

      directions.forEach(([dr, dc]) => {
        let step = 1;
        while (true) {
          const nr = row + dr * step;
          const nc = col + dc * step;
          if (!isInside(nr, nc)) break;

          if (hasEnemy(nr, nc)) {
            moves.push({ square: { row: nr, col: nc }, isCapture: true });
            break;
          } else {
            moves.push({ square: { row: nr, col: nc }, isCapture: false });
          }
          step++;
        }
      });
    } else if (selectedPiece === 'king') {
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = row + dr;
          const nc = col + dc;
          if (isInside(nr, nc)) {
            moves.push({ square: { row: nr, col: nc }, isCapture: hasEnemy(nr, nc) });
          }
        }
      }
    }

    return moves;
  }, [selectedPiece, pieceColor, piecePos, activeEnemies]);

  const handlePieceSelect = (type: PieceType) => {
    setSelectedPiece(type);
    sounds.playClick();
    if (type === 'pawn') {
      setPiecePos(pieceColor === 'white' ? { row: 6, col: 3 } : { row: 1, col: 3 });
    } else {
      setPiecePos({ row: 4, col: 3 });
    }
  };

  const handleSquareClick = (r: number, c: number) => {
    const move = validMoves.find((m) => m.square.row === r && m.square.col === c);
    if (move) {
      if (move.isCapture) {
        sounds.playCapture();
        setCapturedCount((prev) => prev + 1);
        // Remove captured enemy from the board
        setActiveEnemies((prev) => prev.filter((e) => !(e.row === r && e.col === c)));
      } else {
        sounds.playMove();
      }
      setPiecePos({ row: r, col: c });
    } else {
      sounds.playClick();
    }
  };

  const resetPosition = () => {
    sounds.playClick();
    setCapturedCount(0);
    setActiveEnemies(enemyPositions[selectedPiece]);
    if (selectedPiece === 'pawn') {
      setPiecePos(pieceColor === 'white' ? { row: 6, col: 3 } : { row: 1, col: 3 });
    } else {
      setPiecePos({ row: 4, col: 3 });
    }
  };

  const colNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

  return (
    <div className="space-y-8">
      {/* Selector of 6 pieces */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 md:p-6 backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-amber-400" />
              Explorador Didáctico de Piezas y Movimientos
            </h2>
            <p className="text-sm text-slate-400">
              Selecciona cualquier pieza para descubrir su valor exacto, reglas y probar sus movimientos interactivos.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700">
            <span>Haz clic en las casillas verdes para mover</span>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 md:gap-3">
          {(Object.keys(PIECES_DATA) as PieceType[]).map((type) => {
            const info = PIECES_DATA[type];
            const isSelected = selectedPiece === type;
            return (
              <button
                key={type}
                onClick={() => handlePieceSelect(type)}
                className={`relative flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 text-amber-200 shadow-md shadow-amber-500/10'
                    : 'bg-slate-800/50 border-slate-700/80 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="w-12 h-12 flex items-center justify-center">
                  <ChessPieceIcon type={type} color="white" setId={setId} size={42} />
                </div>
                <span className="text-sm font-bold mt-1 text-slate-100">{info.name}</span>
                <span className="text-xs font-semibold text-amber-400 tabular-nums">
                  {info.value === 99 ? '∞ Invaluable' : `${info.value} ${info.value === 1 ? 'punto' : 'pts'}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main split: Left Interactive Board, Right Knowledge Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Interactive 8x8 Board (7 cols on desktop) */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Tablero de pruebas
              </span>
              <span className="text-xs text-slate-500">·</span>
              <span className="text-xs text-amber-400 font-medium">
                {pieceInfo.name} en {colNames[piecePos.col]}
                {8 - piecePos.row} ({validMoves.length} casillas disponibles)
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Color switcher */}
              <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                <button
                  onClick={() => {
                    setPieceColor('white');
                    sounds.playClick();
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                    pieceColor === 'white'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Blancas
                </button>
                <button
                  onClick={() => {
                    setPieceColor('black');
                    sounds.playClick();
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                    pieceColor === 'black'
                      ? 'bg-slate-950 text-slate-100 shadow-sm border border-slate-700'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Negras
                </button>
              </div>

              <button
                onClick={() => setShowEnemies(!showEnemies)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border flex items-center gap-1.5 transition-colors ${
                  showEnemies
                    ? 'bg-red-500/20 text-red-300 border-red-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
                title="Activar piezas rivales para ver casillas de captura"
              >
                <Swords className="w-3.5 h-3.5" />
                <span>{showEnemies ? 'Rivales: Sí' : 'Rivales: No'}</span>
              </button>

              <button
                onClick={resetPosition}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1.5 transition-colors"
                title="Reiniciar a la posición inicial"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reiniciar</span>
              </button>
            </div>
          </div>

          {/* 8x8 Board Container */}
          <div className="relative mx-auto max-w-[500px] aspect-square rounded-xl overflow-hidden shadow-2xl border-4" style={{ borderColor: theme.border }}>
            <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
              {Array.from({ length: 8 }).map((_, r) =>
                Array.from({ length: 8 }).map((_, c) => {
                  const isLight = (r + c) % 2 === 0;
                  const isPieceHere = piecePos.row === r && piecePos.col === c;
                  const move = validMoves.find((m) => m.square.row === r && m.square.col === c);
                  const isEnemyHere = activeEnemies.some((e) => e.row === r && e.col === c);

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

                      {/* Active User Piece */}
                      {isPieceHere && (
                        <div className="relative z-20 transform transition-transform animate-in fade-in zoom-in-75 duration-200">
                          <ChessPieceIcon
                            type={selectedPiece}
                            color={pieceColor}
                            setId={setId}
                            size={52}
                            className="drop-shadow-lg scale-110"
                          />
                        </div>
                      )}

                      {/* Enemy Piece to Capture */}
                      {isEnemyHere && !isPieceHere && (
                        <div className="relative z-10 opacity-90">
                          <ChessPieceIcon
                            type="pawn"
                            color={pieceColor === 'white' ? 'black' : 'white'}
                            setId={setId}
                            size={44}
                            className="drop-shadow-md"
                          />
                        </div>
                      )}

                      {/* Move Hint Marker */}
                      {move && !move.isCapture && (
                        <div className="absolute z-10 w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-emerald-600/80 shadow-md ring-2 ring-emerald-300/60 pointer-events-none animate-pulse" />
                      )}

                      {/* Capture Hint Marker */}
                      {move && move.isCapture && (
                        <div className="absolute inset-1 rounded-full border-4 border-red-500 bg-red-500/25 pointer-events-none z-15 animate-ping" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Board Footer Feedback & Tips */}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
                Casilla libre
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border-2 border-red-500 bg-red-500/30 inline-block" />
                Captura posible
              </span>
              {capturedCount > 0 && (
                <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                  ⚔️ {capturedCount} {capturedCount === 1 ? 'captura' : 'capturas'}
                </span>
              )}
            </div>
            <span className="text-amber-400 italic">
              💡 {pieceInfo.mnemonic}
            </span>
          </div>
        </div>

        {/* Right: Knowledge Deck (5 cols on desktop) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Piece Header Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
                  {pieceInfo.englishName}
                </span>
                <h3 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
                  {pieceInfo.name}
                  <span className="text-lg text-slate-400">({pieceInfo.symbolWhite})</span>
                </h3>
                <p className="text-sm text-slate-400 mt-1">{pieceInfo.relativePower}</p>
              </div>

              <div className="text-right">
                <div className="inline-block bg-amber-500/20 border border-amber-500/40 rounded-xl px-3 py-1.5">
                  <span className="text-xs uppercase tracking-wider text-amber-300 block font-semibold">Valor FIDE</span>
                  <span className="text-xl font-extrabold text-amber-200 tabular-nums">
                    {pieceInfo.value === 99 ? '∞' : pieceInfo.value}
                  </span>
                  <span className="text-[11px] text-amber-300/80 block">
                    {pieceInfo.value === 99 ? 'Partida entera' : 'Puntos'}
                  </span>
                </div>
              </div>
            </div>

            {/* Sub-tabs: Movimiento / Valor Matemático / Reglas Especiales */}
            <div className="flex items-center gap-1 mt-6 p-1 bg-slate-950/80 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveTab('movimiento')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'movimiento'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Movimiento
              </button>
              <button
                onClick={() => setActiveTab('valor')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'valor'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Valor y Canjes
              </button>
              <button
                onClick={() => setActiveTab('reglas')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  activeTab === 'reglas'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Reglas Clave
              </button>
            </div>

            {/* Tab 1: Movimiento */}
            {activeTab === 'movimiento' && (
              <div className="mt-5 space-y-4 animate-in fade-in duration-200">
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1.5">
                    <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
                    ¿Cómo se desplaza?
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {pieceInfo.moveDescription}
                  </p>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Regla de Oro para Recordar
                  </h4>
                  <p className="text-sm text-amber-200 font-medium italic">
                    "{pieceInfo.mnemonic}"
                  </p>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-300">
                  <span className="font-bold">Dato curioso:</span> {pieceInfo.funFact}
                </div>
              </div>
            )}

            {/* Tab 2: Valor Matemático & Equivalencias */}
            {activeTab === 'valor' && (
              <div className="mt-5 space-y-4 animate-in fade-in duration-200">
                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    Equivalencias de Material en la Partida
                  </h4>
                  <div className="space-y-2">
                    {pieceInfo.equivalences.map((eq, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 p-2 bg-slate-900 rounded-lg text-xs text-slate-200 border border-slate-800"
                      >
                        <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </span>
                        <span>{eq}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Jerarquía de Valores FIDE
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Peón</span>
                      <span className="font-bold text-amber-400 tabular-nums">1 pt</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Caballo</span>
                      <span className="font-bold text-amber-400 tabular-nums">3 pts</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Alfil</span>
                      <span className="font-bold text-amber-400 tabular-nums">3 pts</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Torre</span>
                      <span className="font-bold text-amber-400 tabular-nums">5 pts</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Dama</span>
                      <span className="font-bold text-amber-400 tabular-nums">9 pts</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800 flex justify-between">
                      <span className="text-slate-400">Rey</span>
                      <span className="font-bold text-amber-400">∞</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Reglas Especiales */}
            {activeTab === 'reglas' && (
              <div className="mt-5 space-y-3 animate-in fade-in duration-200">
                {pieceInfo.specialRules && pieceInfo.specialRules.length > 0 ? (
                  pieceInfo.specialRules.map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-slate-800 text-amber-400 font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="leading-relaxed">{rule}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 p-4">Esta pieza sigue las reglas directas de movimiento.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
