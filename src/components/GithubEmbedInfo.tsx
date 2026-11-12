import React, { useState } from 'react';
import { Github, Copy, Check, ExternalLink, ShieldCheck, Cpu, Download, FileCode, Terminal } from 'lucide-react';
import { sounds } from '../utils/sound';

export const GithubEmbedInfo: React.FC = () => {
  const [copiedIframe, setCopiedIframe] = useState<boolean>(false);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  const embedCode = `<iframe 
  src="${window.location.origin}" 
  width="100%" 
  height="820" 
  style="border: none; border-radius: 16px; overflow: hidden; max-width: 100%; box-shadow: 0 10px 25px rgba(0,0,0,0.3);"
  title="Ajedrez Interactivo - Escuela, Valores y Juegos"
  allow="autoplay"
></iframe>`;

  const singleFileHtmlTemplate = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Tutorial Interactivo de Ajedrez: Valores, Movimientos y Sumas</title>
  <style>
    :root { --bg: #090d16; --card: #131b2e; --text: #f1f5f9; --accent: #f59e0b; --light: #ece9d8; --dark: #769656; }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
    body { background: var(--bg); color: var(--text); padding: 20px; line-height: 1.5; }
    .container { max-width: 1000px; margin: 0 auto; }
    header { text-align: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #1e293b; }
    h1 { color: #f8fafc; font-size: 26px; }
    .subtitle { color: #94a3b8; font-size: 14px; margin-top: 4px; }
    .tabs { display: flex; gap: 8px; justify-content: center; margin-bottom: 20px; flex-wrap: wrap; }
    .tab-btn { padding: 8px 16px; border-radius: 8px; border: 1px solid #334155; background: #1e293b; color: #cbd5e1; cursor: pointer; font-weight: bold; font-size: 13px; }
    .tab-btn.active { background: var(--accent); color: #0f172a; border-color: var(--accent); }
    .section-card { background: var(--card); border: 1px solid #1e293b; border-radius: 16px; padding: 24px; margin-bottom: 24px; }
    .board-container { display: flex; justify-content: center; margin: 16px 0; }
    .board { width: 360px; height: 360px; display: grid; grid-template-columns: repeat(8, 1fr); grid-template-rows: repeat(8, 1fr); border: 4px solid #334155; border-radius: 8px; overflow: hidden; }
    .sq { display: flex; align-items: center; justify-content: center; font-size: 26px; cursor: pointer; user-select: none; position: relative; }
    .sq.light { background: var(--light); color: #1e293b; }
    .sq.dark { background: var(--dark); color: #f8fafc; }
    .sq.valid { box-shadow: inset 0 0 0 4px #0284c7; }
    .sq.target { box-shadow: inset 0 0 0 4px #ef4444; }
    .controls { display: flex; gap: 10px; justify-content: center; margin-top: 14px; flex-wrap: wrap; }
    .btn { padding: 8px 16px; background: var(--accent); color: #0f172a; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px; }
    .btn-secondary { background: #334155; color: #f8fafc; }
    .piece-selector { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; margin-bottom: 16px; }
    .p-btn { padding: 6px 12px; background: #1e293b; border: 1px solid #334155; color: #e2e8f0; border-radius: 8px; cursor: pointer; }
    .p-btn.active { background: #d97706; color: white; border-color: #f59e0b; }
    .feedback { text-align: center; margin-top: 12px; font-weight: bold; font-size: 14px; min-height: 22px; }
    .success { color: #34d399; }
    .error { color: #f87171; }
    .stat-row { display: flex; justify-content: space-around; margin: 16px 0; background: #0b1120; padding: 12px; border-radius: 10px; font-size: 13px; }
    .card-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; max-width: 480px; margin: 0 auto; }
    .card { height: 80px; background: #1e293b; border: 1px solid #334155; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; cursor: pointer; }
    .card.revealed { background: #334155; border-color: var(--accent); }
    .card.matched { background: #064e3b; border-color: #10b981; opacity: 0.8; }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>Ajedrez Interactivo: Tutorial de Valores y Movimientos</h1>
      <p class="subtitle">HTML + CSS + JavaScript autónomo y listo para GitHub Pages / LMS</p>
    </header>

    <div class="tabs">
      <button class="tab-btn active" onclick="switchTab('tutorial')">1. Valores y Movimientos</button>
      <button class="tab-btn" onclick="switchTab('sums')">2. Suma de Piezas en Tablero</button>
      <button class="tab-btn" onclick="switchTab('memory')">3. Memoria de Piezas</button>
    </div>

    <!-- SECCION 1: TUTORIAL INTERACTIVO -->
    <div id="tab-tutorial" class="section-card">
      <div class="piece-selector" id="piece-selector"></div>
      <div id="piece-info" style="text-align: center; margin-bottom: 12px;"></div>
      <div class="board-container">
        <div id="tutorial-board" class="board"></div>
      </div>
      <div class="controls">
        <button class="btn btn-secondary" onclick="resetTutorialPiece()">Reiniciar Posición</button>
      </div>
      <div class="feedback" id="tutorial-feedback">Haz clic en las casillas marcadas con borde azul para mover la pieza.</div>
    </div>

    <!-- SECCION 2: SUMA DE PIEZAS EN TABLERO -->
    <div id="tab-sums" class="section-card" style="display: none;">
      <h3 style="text-align:center; margin-bottom:8px;">Calcula el Valor Total del Tablero</h3>
      <p style="text-align:center; color:#94a3b8; font-size:13px; margin-bottom:12px;">
        Peón = 1 · Caballo = 3 · Alfil = 3 · Torre = 5 · Dama = 9 (El Rey no suma puntos)
      </p>
      <div class="board-container">
        <div id="sums-board" class="board"></div>
      </div>
      <div class="stat-row">
        <div>Total Blancas: <input id="w-sum-input" type="number" style="width:70px; padding:4px; font-weight:bold; border-radius:6px;"/></div>
        <div>Total Negras: <input id="b-sum-input" type="number" style="width:70px; padding:4px; font-weight:bold; border-radius:6px;"/></div>
      </div>
      <div class="controls">
        <button class="btn" onclick="checkBoardSum()">Comprobar Suma</button>
        <button class="btn btn-secondary" onclick="generateNewSumBoard()">Nuevo Tablero</button>
      </div>
      <div class="feedback" id="sums-feedback"></div>
    </div>

    <!-- SECCION 3: MEMORIA -->
    <div id="tab-memory" class="section-card" style="display: none;">
      <h3 style="text-align:center; margin-bottom:8px;">Juego de Memoria: Piezas y Valores</h3>
      <p style="text-align:center; color:#94a3b8; font-size:13px; margin-bottom:16px;">
        Encuentra las parejas de cartas correspondientes a cada pieza.
      </p>
      <div class="card-grid" id="memory-grid"></div>
      <div class="controls" style="margin-top:16px;">
        <button class="btn btn-secondary" onclick="initMemoryGame()">Reiniciar Memory</button>
      </div>
      <div class="feedback" id="memory-feedback"></div>
    </div>
  </div>

  <script>
    // Sintetizador de audio con Web Audio API (cero dependencias externas)
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    function playBeep(freq, type='sine', dur=0.1) {
      if (!ctx) return;
      try {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = type; o.frequency.value = freq;
        g.gain.setValueAtTime(0.15, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
        o.connect(g); g.connect(ctx.destination);
        o.start(); o.stop(ctx.currentTime + dur);
      } catch(e) {}
    }

    const PIECES = {
      pawn: { name: 'Peón', symbol: '♙', val: 1, desc: 'Avanza 1 casilla (2 en su 1er paso) y captura en diagonal.' },
      knight: { name: 'Caballo', symbol: '♘', val: 3, desc: 'Salta en forma de "L" (2 casillas rectas + 1 al costado).' },
      bishop: { name: 'Alfil', symbol: '♗', val: 3, desc: 'Se mueve en diagonal sin límite por casillas de su color.' },
      rook: { name: 'Torre', symbol: '♖', val: 5, desc: 'Avanza en vertical y horizontal (+) sin límite de distancia.' },
      queen: { name: 'Dama', symbol: '♕', val: 9, desc: 'Combina el poder de la Torre y el Alfil en cualquier dirección.' },
      king: { name: 'Rey', symbol: '♔', val: 99, desc: '1 casilla en cualquier dirección. ¡Su captura finaliza la partida!' }
    };

    let currentPiece = 'knight';
    let piecePos = { r: 4, c: 3 };

    function switchTab(t) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.section-card').forEach(s => s.style.display = 'none');
      document.getElementById('tab-' + t).style.display = 'block';
      event.target.classList.add('active');
      if (t === 'sums') generateNewSumBoard();
      if (t === 'memory') initMemoryGame();
    }

    // Inicializar Tutorial
    function initTutorial() {
      const sel = document.getElementById('piece-selector');
      sel.innerHTML = '';
      Object.keys(PIECES).forEach(k => {
        const b = document.createElement('button');
        b.className = 'p-btn' + (k === currentPiece ? ' active' : '');
        b.innerHTML = PIECES[k].symbol + ' ' + PIECES[k].name + ' (' + (PIECES[k].val === 99 ? '∞' : PIECES[k].val + ' pts') + ')';
        b.onclick = () => { currentPiece = k; piecePos = {r: 4, c: 3}; initTutorial(); renderTutorialBoard(); };
        sel.appendChild(b);
      });
      document.getElementById('piece-info').innerHTML = '<strong>' + PIECES[currentPiece].name + ' (Valor: ' + (PIECES[currentPiece].val === 99 ? 'Invaluable ∞' : PIECES[currentPiece].val + ' puntos') + ')</strong>: ' + PIECES[currentPiece].desc;
      renderTutorialBoard();
    }

    function renderTutorialBoard() {
      const b = document.getElementById('tutorial-board');
      b.innerHTML = '';
      const valid = getValidMoves(currentPiece, piecePos);
      for(let r=0; r<8; r++) {
        for(let c=0; c<8; c++) {
          const sq = document.createElement('div');
          sq.className = 'sq ' + ((r+c)%2===0 ? 'light' : 'dark');
          const isValid = valid.some(m => m.r === r && m.c === c);
          if (isValid) sq.classList.add('valid');
          if (piecePos.r === r && piecePos.c === c) {
            sq.innerText = PIECES[currentPiece].symbol;
          }
          sq.onclick = () => {
            if (isValid) {
              piecePos = { r, c };
              playBeep(440, 'triangle');
              renderTutorialBoard();
            }
          };
          b.appendChild(sq);
        }
      }
    }

    function getValidMoves(type, pos) {
      const moves = [];
      const isInside = (r, c) => r>=0 && r<8 && c>=0 && c<8;
      if (type === 'knight') {
        const d = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
        d.forEach(([dr, dc]) => { if (isInside(pos.r+dr, pos.c+dc)) moves.push({r: pos.r+dr, c: pos.c+dc}); });
      } else if (type === 'rook' || type === 'bishop' || type === 'queen') {
        const dirs = [];
        if (type === 'rook' || type === 'queen') dirs.push([-1,0],[1,0],[0,-1],[0,1]);
        if (type === 'bishop' || type === 'queen') dirs.push([-1,-1],[-1,1],[1,-1],[1,1]);
        dirs.forEach(([dr, dc]) => {
          let s = 1;
          while(isInside(pos.r + dr*s, pos.c + dc*s)) {
            moves.push({ r: pos.r + dr*s, c: pos.c + dc*s });
            s++;
          }
        });
      } else if (type === 'pawn') {
        if (isInside(pos.r-1, pos.c)) moves.push({r: pos.r-1, c: pos.c});
        if (pos.r === 6) moves.push({r: pos.r-2, c: pos.c});
      } else if (type === 'king') {
        for(let dr=-1; dr<=1; dr++) for(let dc=-1; dc<=1; dc++) if(dr||dc) if (isInside(pos.r+dr, pos.c+dc)) moves.push({r:pos.r+dr, c:pos.c+dc});
      }
      return moves;
    }

    function resetTutorialPiece() { piecePos = { r: 4, c: 3 }; renderTutorialBoard(); }

    // SECCION 2: Suma de Piezas en Tablero
    let currentBoardState = { pieces: [], whiteSum: 0, blackSum: 0 };
    function generateNewSumBoard() {
      const b = document.getElementById('sums-board');
      b.innerHTML = '';
      document.getElementById('w-sum-input').value = '';
      document.getElementById('b-sum-input').value = '';
      document.getElementById('sums-feedback').innerHTML = '';

      const pool = ['pawn', 'knight', 'bishop', 'rook', 'queen'];
      const syms = { pawn: ['♙','♟'], knight: ['♘','♞'], bishop: ['♗','♝'], rook: ['♖','♜'], queen: ['♕','♛'] };
      const pieces = [];
      let wSum = 0, bSum = 0;
      const count = Math.floor(Math.random()*4) + 5; // 5 a 8 piezas
      const occ = new Set();

      for(let i=0; i<count; i++) {
        let r, c, k;
        do { r = Math.floor(Math.random()*8); c = Math.floor(Math.random()*8); k = r+','+c; } while(occ.has(k));
        occ.add(k);
        const t = pool[Math.floor(Math.random()*pool.length)];
        const color = Math.random() > 0.5 ? 'white' : 'black';
        const val = PIECES[t].val;
        if (color === 'white') wSum += val; else bSum += val;
        pieces.push({ r, c, t, color, char: syms[t][color==='white'?0:1], val });
      }
      currentBoardState = { pieces, whiteSum: wSum, blackSum: bSum };

      for(let r=0; r<8; r++) {
        for(let c=0; c<8; c++) {
          const sq = document.createElement('div');
          sq.className = 'sq ' + ((r+c)%2===0 ? 'light' : 'dark');
          const p = pieces.find(x => x.r === r && x.c === c);
          if (p) sq.innerText = p.char;
          b.appendChild(sq);
        }
      }
    }

    function checkBoardSum() {
      const wVal = parseInt(document.getElementById('w-sum-input').value, 10);
      const bVal = parseInt(document.getElementById('b-sum-input').value, 10);
      const fb = document.getElementById('sums-feedback');

      if (isNaN(wVal) || isNaN(bVal)) {
        fb.className = 'feedback error';
        fb.innerText = 'Introduce ambos números para comprobar.';
        return;
      }
      const okW = wVal === currentBoardState.whiteSum;
      const okB = bVal === currentBoardState.blackSum;

      if (okW && okB) {
        fb.className = 'feedback success';
        fb.innerText = '¡Correcto! Blancas = ' + wVal + ' pts, Negras = ' + bVal + ' pts.';
        playBeep(600, 'sine', 0.2);
      } else {
        fb.className = 'feedback error';
        fb.innerText = 'Incorrecto. Blancas sumaban ' + currentBoardState.whiteSum + ' pts y Negras ' + currentBoardState.blackSum + ' pts.';
        playBeep(200, 'sawtooth', 0.2);
      }
    }

    // SECCION 3: Memory
    const memoSymbols = ['♙','♘','♗','♖','♕','♔'];
    let memoCards = [], flipped = [], matched = 0;
    function initMemoryGame() {
      const g = document.getElementById('memory-grid');
      g.innerHTML = '';
      flipped = []; matched = 0;
      document.getElementById('memory-feedback').innerText = '';
      const pool = [...memoSymbols, ...memoSymbols].sort(() => Math.random() - 0.5);
      memoCards = pool.map((sym, id) => ({ id, sym, matched: false }));

      memoCards.forEach((c, idx) => {
        const el = document.createElement('div');
        el.className = 'card';
        el.innerText = '?';
        el.onclick = () => onCardClick(idx, el);
        g.appendChild(el);
      });
    }

    function onCardClick(idx, el) {
      if (flipped.length === 2 || el.classList.contains('revealed') || el.classList.contains('matched')) return;
      el.classList.add('revealed');
      el.innerText = memoCards[idx].sym;
      flipped.push({ idx, el });
      playBeep(500, 'sine', 0.05);

      if (flipped.length === 2) {
        const [a, b] = flipped;
        if (memoCards[a.idx].sym === memoCards[b.idx].sym) {
          playBeep(700, 'sine', 0.15);
          setTimeout(() => {
            a.el.classList.add('matched');
            b.el.classList.add('matched');
            flipped = [];
            matched += 2;
            if (matched === memoCards.length) {
              document.getElementById('memory-feedback').className = 'feedback success';
              document.getElementById('memory-feedback').innerText = '¡Felicidades! Has completado el juego de memoria.';
            }
          }, 300);
        } else {
          setTimeout(() => {
            a.el.classList.remove('revealed'); a.el.innerText = '?';
            b.el.classList.remove('revealed'); b.el.innerText = '?';
            flipped = [];
          }, 800);
        }
      }
    }

    // Arrancar tutorial
    initTutorial();
  </script>
</body>
</html>`;

  const handleCopyIframe = () => {
    navigator.clipboard.writeText(embedCode);
    sounds.playClick();
    setCopiedIframe(true);
    setTimeout(() => setCopiedIframe(false), 2500);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(singleFileHtmlTemplate);
    sounds.playClick();
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleDownloadStandaloneHtml = () => {
    sounds.playClick();
    const blob = new Blob([singleFileHtmlTemplate], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ajedrez_tutorial_interactivo.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Github className="w-6 h-6 text-amber-400" />
            Integración GitHub, Descarga Standalone y Código HTML+CSS+JS
          </h2>
          <p className="text-sm text-slate-400">
            Esta aplicación está diseñada para ser 100% operativa desde GitHub Pages, cualquier web escolar o incrustada en iframes sin servidores externos.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-emerald-400 text-xs font-semibold shrink-0">
          <ShieldCheck className="w-4 h-4" />
          100% Autónomo (Cero dependencias)
        </div>
      </div>

      {/* 3 Main Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Descargar archivo HTML único */}
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Download className="w-4 h-4 text-amber-400" />
              Archivo Único Todo-en-Uno (.html)
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              Descarga un archivo HTML autónomo con todo el CSS, JavaScript, Web Audio y lógica de ajedrez incrustada. Ábrelo haciendo doble clic o súbelo directamente a GitHub.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleDownloadStandaloneHtml}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow"
            >
              <Download className="w-4 h-4" />
              Descargar ajedrez_tutorial.html
            </button>
          </div>
        </div>

        {/* Card 2: Embed en web escolar o blog */}
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              Código Iframe para Incrustar
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              Inserta toda la plataforma interactiva en cualquier página web, Moodle, Google Sites o campus virtual copiando este fragmento:
            </p>
          </div>

          <div className="relative pt-2">
            <button
              onClick={handleCopyIframe}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {copiedIframe ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedIframe ? '¡Código Iframe Copiado!' : 'Copiar Código Iframe'}
            </button>
          </div>
        </div>

        {/* Card 3: Despliegue en GitHub Pages */}
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-amber-400" />
              Publicar en GitHub Pages
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mt-1">
              Despliega la versión completa compilando con Vite con rutas relativas preconfiguradas:
            </p>
          </div>

          <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[11px] text-amber-300">
            npm run build
          </div>
        </div>
      </div>

      {/* Code Viewer Section */}
      <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-amber-400" />
            Código Fuente Standalone (HTML + CSS + JavaScript Puro)
          </h3>
          <button
            onClick={handleCopyScript}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedScript ? '¡Código Copiado!' : 'Copiar Todo el Código'}
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Este código incluye el tutorial completo de valores y movimientos con tablero dinámico, el módulo de sumas de piezas en tablero (blancas y negras) y el memory de piezas.
        </p>

        <div className="relative">
          <pre className="p-4 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs text-amber-300/90 overflow-x-auto max-h-64 scrollbar-thin">
            {singleFileHtmlTemplate}
          </pre>
        </div>
      </div>
    </div>
  );
};
