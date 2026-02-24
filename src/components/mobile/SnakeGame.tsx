import { useState, useEffect, useCallback, useRef } from 'react';
import { usePhoneInput } from './PhoneContext';
import { ScreenLayout } from './ScreenLayout';

/* ── Constants ── */

const COLS = 22;
const ROWS = 20;
const CELL = 10;
const OPPOSITE: Record<string, string> = {
  up: 'down', down: 'up', left: 'right', right: 'left',
};

/* ── Types ── */

type Pos = { x: number; y: number };
type Dir = 'up' | 'down' | 'left' | 'right';
type Phase = 'idle' | 'playing' | 'dead';

/* ── Helpers ── */

function randomFood(snake: Pos[]): Pos {
  const free: Pos[] = [];
  for (let x = 0; x < COLS; x++)
    for (let y = 0; y < ROWS; y++)
      if (!snake.some(s => s.x === x && s.y === y))
        free.push({ x, y });
  return free[Math.floor(Math.random() * free.length)] ?? { x: 2, y: 2 };
}

function makeInitialSnake(): Pos[] {
  return [{ x: 11, y: 10 }, { x: 10, y: 10 }, { x: 9, y: 10 }];
}

function tickMs(score: number): number {
  return Math.max(80, 160 - Math.floor(score / 40) * 10);
}

/* ── Canvas renderer ── */

function drawCanvas(
  ctx: CanvasRenderingContext2D,
  snake: Pos[],
  food: Pos,
  dir: Dir,
  frame: number,
  colors: { bg: string; fg: string; dim: string; hl: string },
) {
  const { bg, fg, dim, hl } = colors;
  const W = COLS * CELL;
  const H = ROWS * CELL;

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = dim;
  for (let x = 0; x < COLS; x++)
    for (let y = 0; y < ROWS; y++)
      ctx.fillRect(x * CELL + 4, y * CELL + 4, 1, 1);

  if ((frame % 8) < 5) {
    ctx.fillStyle = hl;
    ctx.fillRect(food.x * CELL + 2, food.y * CELL + 2, CELL - 4, CELL - 4);
  }

  snake.forEach((seg, i) => {
    ctx.globalAlpha = Math.max(0.25, 1 - i * 0.03);
    ctx.fillStyle = fg;

    if (i === 0) {
      ctx.globalAlpha = 1;
      ctx.fillRect(seg.x * CELL, seg.y * CELL, CELL - 1, CELL - 1);
      ctx.fillStyle = bg;
      const eyePositions: Record<Dir, [number, number, number, number][]> = {
        right: [[6, 1, 2, 2], [6, 5, 2, 2]],
        left:  [[1, 1, 2, 2], [1, 5, 2, 2]],
        up:    [[1, 1, 2, 2], [5, 1, 2, 2]],
        down:  [[1, 6, 2, 2], [5, 6, 2, 2]],
      };
      for (const [ox, oy, w, h] of eyePositions[dir]) {
        ctx.fillRect(seg.x * CELL + ox, seg.y * CELL + oy, w, h);
      }
    } else {
      ctx.fillRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 3, CELL - 3);
    }
  });

  ctx.globalAlpha = 1;
}

/* ── Component ── */

export function SnakeScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const snakeRef   = useRef<Pos[]>(makeInitialSnake());
  const foodRef    = useRef<Pos>(randomFood(snakeRef.current));
  const dirRef     = useRef<Dir>('right');
  const nextDirRef = useRef<Dir>('right');
  const scoreRef   = useRef(0);
  const highRef    = useRef(0);
  const frameRef   = useRef(0);
  const phaseRef   = useRef<Phase>('idle');
  const loopRef    = useRef(0);

  const [phase,        setPhase]        = useState<Phase>('idle');
  const [displayScore, setDisplayScore] = useState(0);
  const [displayHigh,  setDisplayHigh]  = useState(0);

  const getColors = useCallback(() => {
    const el = canvasRef.current?.parentElement;
    if (!el) return { bg: '#0a1a0a', fg: '#00ff41', dim: '#1a5a1a', hl: '#00ff41' };
    const cs = getComputedStyle(el);
    const v = (k: string, fb: string) => cs.getPropertyValue(k).trim() || fb;
    return {
      bg:  v('--phone-bg',        '#0a1a0a'),
      fg:  v('--phone-text',      '#00ff41'),
      dim: v('--phone-dim',       '#1a5a1a'),
      hl:  v('--phone-highlight', '#00ff41'),
    };
  }, []);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawCanvas(ctx, snakeRef.current, foodRef.current, dirRef.current, frameRef.current, getColors());
  }, [getColors]);

  const resetGame = useCallback(() => {
    snakeRef.current   = makeInitialSnake();
    foodRef.current    = randomFood(snakeRef.current);
    dirRef.current     = 'right';
    nextDirRef.current = 'right';
    scoreRef.current   = 0;
    frameRef.current   = 0;
    setDisplayScore(0);
  }, []);

  const tick = useCallback((): boolean => {
    frameRef.current++;
    dirRef.current = nextDirRef.current;

    const head = snakeRef.current[0];
    const nx   = head.x + (dirRef.current === 'right' ? 1 : dirRef.current === 'left' ? -1 : 0);
    const ny   = head.y + (dirRef.current === 'down'  ? 1 : dirRef.current === 'up'   ? -1 : 0);

    if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS
        || snakeRef.current.some((s, i) => i < snakeRef.current.length - 1 && s.x === nx && s.y === ny)) {
      if (scoreRef.current > highRef.current) {
        highRef.current = scoreRef.current;
        setDisplayHigh(highRef.current);
      }
      phaseRef.current = 'dead';
      setPhase('dead');
      return false;
    }

    const ate = nx === foodRef.current.x && ny === foodRef.current.y;
    snakeRef.current = [{ x: nx, y: ny }, ...snakeRef.current.slice(0, ate ? undefined : -1)];

    if (ate) {
      scoreRef.current += 10;
      foodRef.current = randomFood(snakeRef.current);
      setDisplayScore(scoreRef.current);
    }

    return true;
  }, []);

  /* requestAnimationFrame game loop */
  useEffect(() => {
    if (phase !== 'playing') {
      redraw();
      return;
    }

    let accumulator = 0;
    let lastTime = performance.now();
    let running = true;

    const loop = (now: number) => {
      if (!running) return;
      const dt = now - lastTime;
      lastTime = now;
      accumulator += dt;

      const interval = tickMs(scoreRef.current);

      while (accumulator >= interval) {
        accumulator -= interval;
        if (!tick()) {
          redraw();
          return;
        }
      }

      redraw();
      loopRef.current = requestAnimationFrame(loop);
    };

    loopRef.current = requestAnimationFrame(loop);

    return () => {
      running = false;
      cancelAnimationFrame(loopRef.current);
    };
  }, [phase, redraw, tick]);

  useEffect(() => { redraw(); }, [redraw]);

  const startGame = useCallback((initialDir?: Dir) => {
    resetGame();
    if (initialDir) {
      dirRef.current = initialDir;
      nextDirRef.current = initialDir;
    }
    phaseRef.current = 'playing';
    setPhase('playing');
  }, [resetGame]);

  usePhoneInput(useCallback((type: string) => {
    const isDir = type === 'up' || type === 'down' || type === 'left' || type === 'right';

    if (type === 'ok' || (isDir && phaseRef.current !== 'playing')) {
      if (phaseRef.current === 'idle' || phaseRef.current === 'dead') {
        startGame(isDir ? type as Dir : undefined);
      }
      return;
    }

    if (phaseRef.current !== 'playing') return;

    if (isDir && type !== OPPOSITE[dirRef.current]) {
      nextDirRef.current = type as Dir;
    }
  }, [startGame]));

  return (
    <ScreenLayout title="▓ SNAKE ▓" softLeft="Back" softRight={phase !== 'playing' ? 'OK=Play' : ''}>
      <div className="flex flex-col items-center pt-1 gap-1">

        <div className="w-full flex justify-between text-[11px] px-1">
          <span style={{ color: 'var(--phone-dim)' }}>SCORE</span>
          <span>{String(displayScore).padStart(4, '0')}</span>
          <span style={{ color: 'var(--phone-dim)' }}>BEST</span>
          <span>{String(displayHigh).padStart(4, '0')}</span>
        </div>

        <div style={{ border: '1px solid var(--phone-dim)' }}>
          <canvas
            ref={canvasRef}
            width={COLS * CELL}
            height={ROWS * CELL}
            style={{ display: 'block', imageRendering: 'pixelated' }}
          />
        </div>

        {phase === 'idle' && (
          <div className="mt-2 text-center leading-snug">
            <div className="text-[14px] font-bold animate-pulse">► PRESSIONE OK ◄</div>
            <div className="text-[11px] mt-1" style={{ color: 'var(--phone-dim)' }}>
              ou qualquer seta para jogar
            </div>
          </div>
        )}

        {phase === 'dead' && (
          <div className="mt-2 text-center leading-snug">
            <div className="text-[14px] font-bold">▓ GAME OVER ▓</div>
            <div className="text-[12px] mt-1 animate-pulse">
              OK ou seta para reiniciar
            </div>
          </div>
        )}

      </div>
    </ScreenLayout>
  );
}
