import { memo, useCallback, type Dispatch, type SetStateAction } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';

export type Vec3 = [number, number, number];

type Axis = 'x' | 'y' | 'z';

type AxisConfig = {
  key: Axis;
  label: string;
  min: number;
  max: number;
  step: number;
};

const AXES: AxisConfig[] = [
  { key: 'x', label: 'X', min: -2.5, max: 2.5, step: 0.01 },
  { key: 'y', label: 'Y', min: -0.5, max: 3.5, step: 0.01 },
  { key: 'z', label: 'Z', min: -2.5, max: 2.5, step: 0.01 },
];

const ROT_AXES: AxisConfig[] = [
  { key: 'x', label: 'X', min: -180, max: 180, step: 0.01 },
  { key: 'y', label: 'Y', min: -180, max: 180, step: 0.01 },
  { key: 'z', label: 'Z', min: -180, max: 180, step: 0.01 },
];

const LIGHT_POS_AXES: AxisConfig[] = [
  { key: 'x', label: 'X', min: -10, max: 10, step: 0.1 },
  { key: 'y', label: 'Y', min: -10, max: 10, step: 0.1 },
  { key: 'z', label: 'Z', min: -10, max: 10, step: 0.1 },
];

function setAxis(pos: Vec3, axis: Axis, next: number): Vec3 {
  if (!Number.isFinite(next)) return pos;
  if (axis === 'x') return [next, pos[1], pos[2]];
  if (axis === 'y') return [pos[0], next, pos[2]];
  return [pos[0], pos[1], next];
}

function getAxis(pos: Vec3, axis: Axis): number {
  if (axis === 'x') return pos[0];
  if (axis === 'y') return pos[1];
  return pos[2];
}

export type DecalPositionControlsProps = {
  position: Vec3;
  rotationDeg: Vec3;
  onChange: Dispatch<SetStateAction<Vec3>>;
  onRotationChange: Dispatch<SetStateAction<Vec3>>;
  onReset: () => void;
  // Luz
  lightPosition: Vec3;
  lightIntensity: number;
  onLightPositionChange: Dispatch<SetStateAction<Vec3>>;
  onLightIntensityChange: Dispatch<SetStateAction<number>>;
  // Reflexo BTC
  btcRoughness: number;
  btcMetalness: number;
  onBtcRoughnessChange: Dispatch<SetStateAction<number>>;
  onBtcMetalnessChange: Dispatch<SetStateAction<number>>;
};

export const DecalPositionControls = memo(function DecalPositionControls({
  position,
  rotationDeg,
  onChange,
  onRotationChange,
  onReset,
  lightPosition,
  lightIntensity,
  onLightPositionChange,
  onLightIntensityChange,
  btcRoughness,
  btcMetalness,
  onBtcRoughnessChange,
  onBtcMetalnessChange,
}: DecalPositionControlsProps) {
  const handleAxisChange = useCallback(
    (axis: Axis, next: number) => {
      onChange(setAxis(position, axis, next));
    },
    [onChange, position],
  );

  const handleRotationAxisChange = useCallback(
    (axis: Axis, next: number) => {
      onRotationChange(setAxis(rotationDeg, axis, next));
    },
    [onRotationChange, rotationDeg],
  );

  const handleLightPosChange = useCallback(
    (axis: Axis, next: number) => {
      onLightPositionChange(setAxis(lightPosition, axis, next));
    },
    [onLightPositionChange, lightPosition],
  );

  return (
    <Card className="w-[320px] max-h-[90vh] overflow-y-auto bg-black/40 backdrop-blur border-white/10 text-white shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-mono text-white/90">Controles 3D</CardTitle>
          <Button type="button" size="sm" variant="secondary" className="h-8 px-2 text-xs" onClick={onReset}>
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* ── Decal Position ── */}
        <div className="text-xs font-mono text-white/70">📌 Adesivo — Posição</div>
        {AXES.map((axis) => {
          const value = getAxis(position, axis.key);
          return (
            <div key={axis.key} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-mono text-white/80">{axis.label}</div>
                <div className="w-[120px]">
                  <Input
                    inputMode="decimal"
                    type="number"
                    step={axis.step}
                    value={Number.isFinite(value) ? value : 0}
                    onChange={(e) => handleAxisChange(axis.key, Number(e.target.value))}
                    className="h-8 bg-black/30 border-white/10 text-white/90 font-mono text-xs"
                  />
                </div>
              </div>
              <Slider
                min={axis.min}
                max={axis.max}
                step={axis.step}
                value={[value]}
                onValueChange={(v) => handleAxisChange(axis.key, v[0] ?? value)}
              />
            </div>
          );
        })}

        {/* ── Decal Rotation ── */}
        <div className="pt-2 text-xs font-mono text-white/70">🔄 Adesivo — Rotação (°)</div>
        {ROT_AXES.map((axis) => {
          const value = getAxis(rotationDeg, axis.key);
          return (
            <div key={`rot-${axis.key}`} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-mono text-white/80">{axis.label}</div>
                <div className="w-[120px]">
                  <Input
                    inputMode="decimal"
                    type="number"
                    step={axis.step}
                    value={Number.isFinite(value) ? value : 0}
                    onChange={(e) => handleRotationAxisChange(axis.key, Number(e.target.value))}
                    className="h-8 bg-black/30 border-white/10 text-white/90 font-mono text-xs"
                  />
                </div>
              </div>
              <Slider
                min={axis.min}
                max={axis.max}
                step={axis.step}
                value={[value]}
                onValueChange={(v) => handleRotationAxisChange(axis.key, v[0] ?? value)}
              />
            </div>
          );
        })}

        {/* ── Light Controls ── */}
        <div className="pt-3 border-t border-white/10" />
        <div className="text-xs font-mono text-white/70">💡 Luz — Posição</div>
        {LIGHT_POS_AXES.map((axis) => {
          const value = getAxis(lightPosition, axis.key);
          return (
            <div key={`light-${axis.key}`} className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-mono text-white/80">{axis.label}</div>
                <div className="w-[120px]">
                  <Input
                    inputMode="decimal"
                    type="number"
                    step={axis.step}
                    value={Number.isFinite(value) ? value : 0}
                    onChange={(e) => handleLightPosChange(axis.key, Number(e.target.value))}
                    className="h-8 bg-black/30 border-white/10 text-white/90 font-mono text-xs"
                  />
                </div>
              </div>
              <Slider
                min={axis.min}
                max={axis.max}
                step={axis.step}
                value={[value]}
                onValueChange={(v) => handleLightPosChange(axis.key, v[0] ?? value)}
              />
            </div>
          );
        })}

        <div className="text-xs font-mono text-white/70">💡 Luz — Intensidade</div>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-mono text-white/80">Int.</div>
            <div className="w-[120px]">
              <Input
                inputMode="decimal"
                type="number"
                step={0.05}
                value={Number.isFinite(lightIntensity) ? lightIntensity : 0}
                onChange={(e) => onLightIntensityChange(Number(e.target.value))}
                className="h-8 bg-black/30 border-white/10 text-white/90 font-mono text-xs"
              />
            </div>
          </div>
          <Slider
            min={0}
            max={5}
            step={0.05}
            value={[lightIntensity]}
            onValueChange={(v) => onLightIntensityChange(v[0] ?? lightIntensity)}
          />
        </div>

        {/* ── BTC Reflectivity ── */}
        <div className="pt-3 border-t border-white/10" />
        <div className="text-xs font-mono text-white/70">₿ BTC — Reflexo</div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-mono text-white/80">Roughness</div>
            <div className="w-[120px]">
              <Input
                inputMode="decimal"
                type="number"
                step={0.01}
                value={Number.isFinite(btcRoughness) ? btcRoughness : 0}
                onChange={(e) => onBtcRoughnessChange(Number(e.target.value))}
                className="h-8 bg-black/30 border-white/10 text-white/90 font-mono text-xs"
              />
            </div>
          </div>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[btcRoughness]}
            onValueChange={(v) => onBtcRoughnessChange(v[0] ?? btcRoughness)}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-mono text-white/80">Metalness</div>
            <div className="w-[120px]">
              <Input
                inputMode="decimal"
                type="number"
                step={0.01}
                value={Number.isFinite(btcMetalness) ? btcMetalness : 0}
                onChange={(e) => onBtcMetalnessChange(Number(e.target.value))}
                className="h-8 bg-black/30 border-white/10 text-white/90 font-mono text-xs"
              />
            </div>
          </div>
          <Slider
            min={0}
            max={1}
            step={0.01}
            value={[btcMetalness]}
            onValueChange={(v) => onBtcMetalnessChange(v[0] ?? btcMetalness)}
          />
        </div>

        {/* ── Debug info ── */}
        <div className="pt-2 border-t border-white/10" />
        <div className="text-[11px] font-mono text-white/60">
          position: [{position[0].toFixed(2)}, {position[1].toFixed(2)}, {position[2].toFixed(2)}]
        </div>
        <div className="text-[11px] font-mono text-white/60">
          rotation(°): [{rotationDeg[0].toFixed(2)}, {rotationDeg[1].toFixed(2)}, {rotationDeg[2].toFixed(2)}]
        </div>
        <div className="text-[11px] font-mono text-white/60">
          light: [{lightPosition[0].toFixed(1)}, {lightPosition[1].toFixed(1)}, {lightPosition[2].toFixed(1)}] int={lightIntensity.toFixed(2)}
        </div>
        <div className="text-[11px] font-mono text-white/60">
          btc: rough={btcRoughness.toFixed(2)} metal={btcMetalness.toFixed(2)}
        </div>
      </CardContent>
    </Card>
  );
});
