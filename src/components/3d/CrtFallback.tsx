import { Terminal } from '../Terminal';
import { ScreenOverlay } from './ScreenOverlay';

export function CrtFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full" style={{ maxWidth: '900px' }}>
        {/* CRT monitor frame */}
        <div
          className="rounded-xl p-5 pb-8 shadow-2xl"
          style={{ backgroundColor: '#d4cdb8' }}
        >
          {/* Screen area */}
          <div
            className="rounded-md overflow-hidden"
            style={{ backgroundColor: '#06060d', aspectRatio: '4/3' }}
          >
            <ScreenOverlay>
              <Terminal embedded />
            </ScreenOverlay>
          </div>

          {/* Controls row */}
          <div className="flex items-center justify-end gap-3 mt-3 pr-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: '#00ff44', boxShadow: '0 0 4px #00ff44' }}
            />
            <div
              className="w-5 h-5 rounded-full"
              style={{ backgroundColor: '#b8b0a0', border: '1px solid #a8a090' }}
            />
          </div>
        </div>

        {/* Stand */}
        <div className="mx-auto" style={{ width: '60px', height: '25px', backgroundColor: '#c8c0aa' }} />
        <div
          className="mx-auto rounded-sm"
          style={{ width: '180px', height: '10px', backgroundColor: '#c8c0aa' }}
        />
      </div>
    </div>
  );
}
