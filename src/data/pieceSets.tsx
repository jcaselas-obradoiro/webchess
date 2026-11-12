import React from 'react';

export type PieceType = 'pawn' | 'knight' | 'bishop' | 'rook' | 'queen' | 'king';
export type PieceColor = 'white' | 'black';
export type PieceSetId = 'staunton' | 'neo' | 'wood' | 'arcade';
export type BoardThemeId = 'emerald' | 'wood' | 'slate' | 'ocean';

export interface PieceInfo {
  type: PieceType;
  name: string;
  pluralName: string;
  englishName: string;
  value: number; // 99 for king (infinite/invaluable)
  valueLabel: string;
  symbolWhite: string;
  symbolBlack: string;
  relativePower: string;
  moveDescription: string;
  movementShort: string;
  specialRules?: string[];
  mnemonic: string;
  equivalences: string[];
  funFact: string;
}

export const PIECES_DATA: Record<PieceType, PieceInfo> = {
  pawn: {
    type: 'pawn',
    name: 'Peón',
    pluralName: 'Peones',
    englishName: 'Pawn',
    value: 1,
    valueLabel: '1 punto',
    symbolWhite: '♙',
    symbolBlack: '♟',
    relativePower: 'Unidad básica del ejército. Es el alma del ajedrez (Philidor).',
    movementShort: 'Avanza 1 casilla hacia adelante; en su 1er movimiento puede avanzar 2. Captura en diagonal 1 casilla.',
    moveDescription: 'El peón siempre camina de frente pero captura de lado (en diagonal hacia adelante). Nunca puede retroceder.',
    specialRules: [
      'Primer movimiento: puede avanzar 1 o 2 casillas si no hay piezas en el camino.',
      'Captura al paso (en passant): si un peón rival avanza 2 casillas y queda junto al tuyo, puedes capturarlo en el siguiente turno como si sólo hubiese avanzado 1.',
      'Coronación / Promoción: cuando un peón llega a la 8ª fila (la última del rival), se transforma inmediatamente en Dama, Torre, Alfil o Caballo.'
    ],
    mnemonic: 'Camina de frente, come de lado, ¡y sueña con ser Dama al otro lado!',
    equivalences: ['3 Peones = 1 Caballo o Alfil', '5 Peones = 1 Torre', '9 Peones = 1 Dama'],
    funFact: 'En una partida pueden llegar a haber hasta 9 Damas del mismo bando si coronas todos tus peones.'
  },
  knight: {
    type: 'knight',
    name: 'Caballo',
    pluralName: 'Caballos',
    englishName: 'Knight',
    value: 3,
    valueLabel: '3 puntos',
    symbolWhite: '♘',
    symbolBlack: '♞',
    relativePower: 'Pieza menor. Letal en posiciones cerradas y casillas centrales.',
    movementShort: 'Se mueve en forma de "L": 2 casillas en una dirección y 1 perpendicular. ¡Es la única pieza que salta sobre otras!',
    moveDescription: 'El caballo cuenta 2 casillas rectas y 1 hacia un lado (o 1 recta y 2 hacia un lado). Siempre salta y aterriza en una casilla de color diferente a la que inició.',
    specialRules: [
      'Única pieza capaz de saltar sobre sus propios compañeros o sobre piezas enemigas.',
      'Siempre cambia de color de casilla en cada salto (de blanca a negra, o de negra a blanca).',
      'Puede dar "jaques dobles" o "tenedores" atacando al Rey y la Dama al mismo tiempo sin que puedan interponerse.'
    ],
    mnemonic: 'Dos pasos al frente y uno al costado, ¡el caballo salta sobre cualquier obstáculo!',
    equivalences: ['1 Caballo = 3 Peones', '1 Caballo = 1 Alfil (ambas piezas menores)', '2 Caballos ≈ 1 Torre + 1 Peón'],
    funFact: 'En el centro del tablero domina 8 casillas, pero en una esquina solo puede acceder a 2.'
  },
  bishop: {
    type: 'bishop',
    name: 'Alfil',
    pluralName: 'Alfiles',
    englishName: 'Bishop',
    value: 3,
    valueLabel: '3 puntos',
    symbolWhite: '♗',
    symbolBlack: '♝',
    relativePower: 'Pieza menor de largo alcance. Muy fuerte en posiciones abiertas con diagonales despejadas.',
    movementShort: 'Se mueve en diagonal cualquier número de casillas libres, siempre en casillas del mismo color.',
    moveDescription: 'Cada jugador empieza con dos alfiles: uno que sólo viaja por casillas blancas (alfil de casillas claras) y otro por casillas negras (alfil de casillas oscuras). Nunca pueden cambiar de color de casilla.',
    specialRules: [
      'No puede saltar piezas; su camino debe estar libre de obstáculos.',
      'La "pareja de alfiles" en finales de partida suele tener una ventaja estratégica superior a dos caballos.'
    ],
    mnemonic: 'Vuela en diagonal como un rayo, siempre fiel a su color de casilla.',
    equivalences: ['1 Alfil = 3 Peones', '1 Alfil = 1 Caballo', '1 Alfil + 1 Caballo ≈ 1 Torre + 1 Peón'],
    funFact: 'En la antigüedad en persa se llamaba "Al-Fil" (el elefante).'
  },
  rook: {
    type: 'rook',
    name: 'Torre',
    pluralName: 'Torres',
    englishName: 'Rook',
    value: 5,
    valueLabel: '5 puntos',
    symbolWhite: '♖',
    symbolBlack: '♜',
    relativePower: 'Pieza mayor. Domina columnas abiertas y la 7ª fila en el medio juego y finales.',
    movementShort: 'Se mueve horizontal o verticalmente (en cruz +) cualquier número de casillas libres.',
    moveDescription: 'La torre avanza o retrocede en línea recta por filas y columnas. Su fuerza se multiplica cuando se doblan dos torres en la misma columna o cuando alcanzan la 7ª fila rival.',
    specialRules: [
      'Enroque: movimiento conjunto especial con el Rey para protegerlo y activar la torre hacia el centro.',
      'No puede saltar piezas ajenas o propias.'
    ],
    mnemonic: 'Firme como un castillo en cruz (+), avanza en vertical y horizontal con poder.',
    equivalences: ['1 Torre = 5 Peones', '1 Torre ≈ 1 Alfil + 2 Peones', '2 Torres = 10 puntos (> 1 Dama de 9 pts)'],
    funFact: 'Junto con el Rey, una sola Torre es capaz de dar jaque mate en el borde del tablero.'
  },
  queen: {
    type: 'queen',
    name: 'Dama',
    pluralName: 'Damas',
    englishName: 'Queen',
    value: 9,
    valueLabel: '9 puntos',
    symbolWhite: '♕',
    symbolBlack: '♛',
    relativePower: 'La pieza más poderosa del tablero. Combina la fuerza de la Torre y el Alfil.',
    movementShort: 'Se mueve en cualquier dirección (horizontal, vertical o diagonal) cualquier número de casillas libres.',
    moveDescription: 'La Dama controla un inmenso número de casillas (hasta 27 casillas desde el centro). Puede atacar desde lejos y cambiar de flanco rápidamente.',
    specialRules: [
      'No puede saltar piezas (eso sólo lo hace el caballo).',
      'Aunque es la más fuerte, sacarla demasiado pronto al inicio de la partida puede hacerla vulnerable a ataques de piezas menores.'
    ],
    mnemonic: 'Reina soberana: avanza en cruz y en diagonal sin límite de distancia.',
    equivalences: ['1 Dama = 9 Peones', '1 Dama = 3 Piezas menores (ej. 2 Alfiles + 1 Caballo)', '1 Dama ≈ 1 Torre + 1 Caballo + 1 Peón'],
    funFact: 'En el tablero inicial se coloca siempre en la casilla de su propio color (Dama blanca en casilla blanca, Dama negra en casilla negra).'
  },
  king: {
    type: 'king',
    name: 'Rey',
    pluralName: 'Reyes',
    englishName: 'King',
    value: 99, // Infinite / Invaluable
    valueLabel: 'Invaluable (∞)',
    symbolWhite: '♔',
    symbolBlack: '♚',
    relativePower: 'La pieza más importante. Su captura o jaque mate pone fin inmediato a la partida.',
    movementShort: 'Se mueve 1 casilla en cualquier dirección (horizontal, vertical o diagonal).',
    moveDescription: 'El Rey se desplaza con paso lento pero en todas direcciones. Debe ser protegido a toda costa durante la apertura y medio juego, pero se convierte en un atacante activo en el final.',
    specialRules: [
      'Nunca puede colocarse a sí mismo en una casilla atacada por el rival (jaque).',
      'Enroque: puede moverse 2 casillas hacia una torre si ninguna de las dos piezas se ha movido y las casillas intermedias no están amenazadas.',
      'No tiene un valor en puntos estándar porque si cae en jaque mate, se acaba la partida.'
    ],
    mnemonic: 'Paso a paso en cualquier dirección, protégelo siempre porque es el corazón del juego.',
    equivalences: ['No se puede canjear por puntos: perder el Rey es perder la partida.'],
    funFact: 'En los finales de reyes y peones, el Rey activo en el centro suele valer estratégicamente unos 4 puntos.'
  }
};

export const PIECE_SETS = [
  { id: 'staunton', name: 'Clásico Staunton', description: 'El estándar de torneo internacional' },
  { id: 'neo', name: 'Neo Moderno', description: 'Líneas estilizadas y minimalistas' },
  { id: 'wood', name: 'Madera Tradicional', description: 'Tonalidades cálidas de nogal y boj' },
  { id: 'arcade', name: 'Escolar Infantil', description: 'Alegre y amigable con expresiones divertidas' }
] as const;

export const BOARD_THEMES: Record<BoardThemeId, { name: string; light: string; dark: string; border: string; highlight: string; capture: string }> = {
  emerald: {
    name: 'Torneo FIDE',
    light: '#ece9d8',
    dark: '#769656',
    border: '#4b6b36',
    highlight: 'rgba(247, 209, 84, 0.65)',
    capture: 'rgba(239, 68, 68, 0.7)'
  },
  wood: {
    name: 'Nogal Clásico',
    light: '#f0d9b5',
    dark: '#b58863',
    border: '#7c5333',
    highlight: 'rgba(218, 165, 32, 0.65)',
    capture: 'rgba(220, 38, 38, 0.7)'
  },
  slate: {
    name: 'Pizarra Grafito',
    light: '#e2e8f0',
    dark: '#64748b',
    border: '#334155',
    highlight: 'rgba(56, 189, 248, 0.65)',
    capture: 'rgba(244, 63, 94, 0.7)'
  },
  ocean: {
    name: 'Azul Océano',
    light: '#e0f2fe',
    dark: '#0284c7',
    border: '#0369a1',
    highlight: 'rgba(250, 204, 21, 0.65)',
    capture: 'rgba(248, 113, 113, 0.7)'
  }
};

/**
 * High-definition vector graphics piece renderer
 */
export const ChessPieceIcon: React.FC<{
  type: PieceType;
  color: PieceColor;
  setId?: PieceSetId;
  className?: string;
  size?: number;
}> = ({ type, color, setId = 'staunton', className = '', size = 48 }) => {
  const isWhite = color === 'white';

  // Base palette per set
  const getColors = () => {
    switch (setId) {
      case 'wood':
        return {
          fill: isWhite ? '#f5e6d3' : '#5a3d28',
          stroke: isWhite ? '#8c6239' : '#2b1a11',
          accent: isWhite ? '#d4b483' : '#3e2719',
          detail: isWhite ? '#a27b5c' : '#85583b'
        };
      case 'neo':
        return {
          fill: isWhite ? '#ffffff' : '#0f172a',
          stroke: isWhite ? '#38bdf8' : '#64748b',
          accent: isWhite ? '#e0f2fe' : '#1e293b',
          detail: isWhite ? '#0284c7' : '#94a3b8'
        };
      case 'arcade':
        return {
          fill: isWhite ? '#fef08a' : '#818cf8',
          stroke: isWhite ? '#ca8a04' : '#3730a3',
          accent: isWhite ? '#fef9c3' : '#c7d2fe',
          detail: isWhite ? '#a16207' : '#1e1b4b'
        };
      case 'staunton':
      default:
        return {
          fill: isWhite ? '#ffffff' : '#1e293b',
          stroke: isWhite ? '#334155' : '#020617',
          accent: isWhite ? '#f1f5f9' : '#0f172a',
          detail: isWhite ? '#64748b' : '#475569'
        };
    }
  };

  const c = getColors();

  // Custom styling per piece & set
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`select-none transition-transform duration-150 ${className}`}
      aria-label={`${isWhite ? 'Blanca' : 'Negra'} ${PIECES_DATA[type].name}`}
    >
      <defs>
        <filter id={`shadow-${type}-${color}-${setId}`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity={isWhite ? '0.25' : '0.4'} />
        </filter>
        <linearGradient id={`grad-${type}-${color}-${setId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={c.accent} />
          <stop offset="100%" stopColor={c.fill} />
        </linearGradient>
      </defs>

      <g filter={`url(#shadow-${type}-${color}-${setId})`}>
        {/* BASE PEDESTAL */}
        <path
          d="M20 84 Q50 82 80 84 Q82 88 78 90 Q50 92 22 90 Q18 88 20 84 Z"
          fill={c.accent}
          stroke={c.stroke}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M25 80 L75 80 L72 84 L28 84 Z"
          fill={c.fill}
          stroke={c.stroke}
          strokeWidth="3"
        />

        {/* PIECE SPECIFIC BODY */}
        {type === 'pawn' && (
          <g>
            {/* Body */}
            <path
              d="M36 80 Q34 62 42 52 Q35 50 35 44 Q35 38 50 38 Q65 38 65 44 Q65 50 58 52 Q66 62 64 80 Z"
              fill={`url(#grad-${type}-${color}-${setId})`}
              stroke={c.stroke}
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Head Ball */}
            <circle
              cx="50"
              cy="28"
              r="14"
              fill={`url(#grad-${type}-${color}-${setId})`}
              stroke={c.stroke}
              strokeWidth="3.5"
            />
            {/* Cute eyes for arcade set */}
            {setId === 'arcade' && (
              <g>
                <circle cx="45" cy="27" r="2.5" fill={isWhite ? '#1e293b' : '#ffffff'} />
                <circle cx="55" cy="27" r="2.5" fill={isWhite ? '#1e293b' : '#ffffff'} />
                <path d="M47 34 Q50 37 53 34" stroke={isWhite ? '#1e293b' : '#ffffff'} strokeWidth="1.5" fill="none" />
              </g>
            )}
            {/* Collar accent */}
            <ellipse cx="50" cy="40" rx="9" ry="2.5" fill={c.detail} />
          </g>
        )}

        {type === 'knight' && (
          <g>
            {/* Horse Mane and Head */}
            <path
              d="M32 80 C30 65 24 55 24 45 C24 35 32 20 48 18 C52 14 58 14 62 18 C64 12 70 12 72 16 C76 22 74 32 78 38 C80 42 76 46 70 45 C64 44 60 48 64 54 C68 60 68 70 68 80 Z"
              fill={`url(#grad-${type}-${color}-${setId})`}
              stroke={c.stroke}
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Snout and Eye */}
            <path
              d="M32 45 C28 47 26 53 31 55 C36 57 40 52 40 48 Z"
              fill={c.accent}
              stroke={c.stroke}
              strokeWidth="2.5"
            />
            {/* Eye */}
            <circle
              cx="42"
              cy="30"
              r={setId === 'arcade' ? 4 : 2.5}
              fill={setId === 'arcade' ? (isWhite ? '#1e293b' : '#ffffff') : c.detail}
            />
            {setId === 'arcade' && (
              <circle cx="43" cy="29" r="1.2" fill="#ffffff" />
            )}
            {/* Mane ridges */}
            <path
              d="M62 26 C68 32 68 40 70 48"
              stroke={c.stroke}
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}

        {type === 'bishop' && (
          <g>
            {/* Mitre body */}
            <path
              d="M34 80 Q33 60 38 48 C34 38 36 28 50 20 C64 28 66 38 62 48 Q67 60 66 80 Z"
              fill={`url(#grad-${type}-${color}-${setId})`}
              stroke={c.stroke}
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Mitre cross cut */}
            <path
              d="M44 32 L58 44 M52 30 L52 48"
              stroke={c.stroke}
              strokeWidth="3"
              strokeLinecap="round"
            />
            {/* Top pommel */}
            <circle
              cx="50"
              cy="16"
              r="4.5"
              fill={c.detail}
              stroke={c.stroke}
              strokeWidth="2.5"
            />
            {setId === 'arcade' && (
              <g>
                <circle cx="45" cy="40" r="2.5" fill={isWhite ? '#1e293b' : '#ffffff'} />
                <circle cx="55" cy="40" r="2.5" fill={isWhite ? '#1e293b' : '#ffffff'} />
                <path d="M47 46 Q50 49 53 46" stroke={isWhite ? '#1e293b' : '#ffffff'} strokeWidth="1.5" fill="none" />
              </g>
            )}
          </g>
        )}

        {type === 'rook' && (
          <g>
            {/* Tower Body */}
            <path
              d="M32 80 L36 44 L30 40 L30 26 L40 26 L40 33 L47 33 L47 26 L53 26 L53 33 L60 33 L60 26 L70 26 L70 40 L64 44 L68 80 Z"
              fill={`url(#grad-${type}-${color}-${setId})`}
              stroke={c.stroke}
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Battlements & Arrow Slit */}
            <rect
              x="47"
              y="48"
              width="6"
              height="15"
              rx="2"
              fill={c.detail}
              stroke={c.stroke}
              strokeWidth="2"
            />
            {setId === 'arcade' && (
              <g>
                <circle cx="44" cy="38" r="2.5" fill={isWhite ? '#1e293b' : '#ffffff'} />
                <circle cx="56" cy="38" r="2.5" fill={isWhite ? '#1e293b' : '#ffffff'} />
                <line x1="46" y1="42" x2="54" y2="42" stroke={isWhite ? '#1e293b' : '#ffffff'} strokeWidth="2" strokeLinecap="round" />
              </g>
            )}
          </g>
        )}

        {type === 'queen' && (
          <g>
            {/* Queen Crown & Dress */}
            <path
              d="M33 80 Q34 60 40 48 L25 36 L36 40 L50 24 L64 40 L75 36 L60 48 Q66 60 67 80 Z"
              fill={`url(#grad-${type}-${color}-${setId})`}
              stroke={c.stroke}
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Jewels on crown tips */}
            <circle cx="25" cy="35" r="3.5" fill={c.detail} stroke={c.stroke} strokeWidth="2" />
            <circle cx="50" cy="22" r="4" fill={c.detail} stroke={c.stroke} strokeWidth="2" />
            <circle cx="75" cy="35" r="3.5" fill={c.detail} stroke={c.stroke} strokeWidth="2" />
            {setId === 'arcade' ? (
              <g>
                <circle cx="45" cy="46" r="3" fill={isWhite ? '#1e293b' : '#ffffff'} />
                <circle cx="55" cy="46" r="3" fill={isWhite ? '#1e293b' : '#ffffff'} />
                <path d="M46 54 Q50 58 54 54" stroke={isWhite ? '#1e293b' : '#ffffff'} strokeWidth="2" fill="none" />
                <ellipse cx="40" cy="50" rx="3" ry="1.5" fill="#f43f5e" opacity="0.6" />
                <ellipse cx="60" cy="50" rx="3" ry="1.5" fill="#f43f5e" opacity="0.6" />
              </g>
            ) : (
              <circle cx="50" cy="50" r="4" fill={c.detail} />
            )}
          </g>
        )}

        {type === 'king' && (
          <g>
            {/* King Cloak & Body */}
            <path
              d="M32 80 Q33 58 40 46 Q34 42 34 34 Q34 26 50 26 Q66 26 66 34 Q66 42 60 46 Q67 58 68 80 Z"
              fill={`url(#grad-${type}-${color}-${setId})`}
              stroke={c.stroke}
              strokeWidth="3.5"
              strokeLinejoin="round"
            />
            {/* Royal Crown Cross */}
            <path
              d="M50 12 L50 26 M44 17 L56 17"
              stroke={c.stroke}
              strokeWidth="4"
              strokeLinecap="round"
            />
            {setId === 'arcade' ? (
              <g>
                <circle cx="45" cy="38" r="2.8" fill={isWhite ? '#1e293b' : '#ffffff'} />
                <circle cx="55" cy="38" r="2.8" fill={isWhite ? '#1e293b' : '#ffffff'} />
                <path d="M46 44 Q50 42 54 44" stroke={isWhite ? '#1e293b' : '#ffffff'} strokeWidth="2" fill="none" />
                {/* Royal mustache */}
                <path d="M42 46 Q47 50 50 48 Q53 50 58 46" stroke={c.stroke} strokeWidth="2" fill="none" />
              </g>
            ) : (
              <circle cx="50" cy="38" r="4" fill={c.detail} />
            )}
          </g>
        )}
      </g>
    </svg>
  );
};
