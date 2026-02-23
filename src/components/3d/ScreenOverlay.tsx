import { type ReactNode } from 'react';

interface ScreenOverlayProps {
  children: ReactNode;
  scanlineOpacity?: number;
  vignetteIntensity?: number;
}

export function ScreenOverlay({
  children,
  scanlineOpacity = 0.07,
  vignetteIntensity = 0.55,
}: ScreenOverlayProps) {
  return (
    <div className="relative w-full h-full overflow-hidden" style={{ borderRadius: '8px' }}>
      {children}

      {/* Scanlines */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,${scanlineOpacity}) 2px, rgba(0,0,0,${scanlineOpacity}) 4px)`,
        }}
      />

      {/* Vignette — heavier for CRT feel */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${vignetteIntensity}) 100%)`,
        }}
      />

      {/* Glass reflection sheen — diagonal highlight */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background:
            'linear-gradient(125deg, rgba(255,255,255,0.06) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.03) 100%)',
        }}
      />

      {/* Secondary glass sheen — horizontal band */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, transparent 15%, transparent 85%, rgba(255,255,255,0.02) 100%)',
        }}
      />

      {/* Inner shadow for curvature effect */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          borderRadius: '8px',
          boxShadow:
            'inset 0 0 60px rgba(0,0,0,0.4), inset 0 0 120px rgba(0,0,0,0.2), inset 0 2px 4px rgba(255,255,255,0.03)',
        }}
      />

      {/* Subtle color fringing at edges */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          borderRadius: '8px',
          boxShadow:
            'inset 2px 0 8px rgba(255,0,0,0.015), inset -2px 0 8px rgba(0,0,255,0.015)',
        }}
      />
    </div>
  );
}
