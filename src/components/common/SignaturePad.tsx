import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export interface SignatureHandle {
  clear: () => void;
  toDataURL: () => string;
  isEmpty: () => boolean;
}

export const SignaturePad = forwardRef<SignatureHandle, { className?: string }>(function SignaturePad({ className }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [empty, setEmpty] = useState(true);

  useEffect(() => {
    const c = canvasRef.current!;
    const dpr = window.devicePixelRatio || 1;
    const rect = c.getBoundingClientRect();
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    const ctx = c.getContext("2d")!;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0F172A";
  }, []);

  const pos = (e: React.PointerEvent) => {
    const c = canvasRef.current!;
    const rect = c.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  useImperativeHandle(ref, () => ({
    clear: () => {
      const c = canvasRef.current!;
      const ctx = c.getContext("2d")!;
      ctx.clearRect(0, 0, c.width, c.height);
      setEmpty(true);
    },
    toDataURL: () => canvasRef.current!.toDataURL("image/png"),
    isEmpty: () => empty,
  }));

  return (
    <canvas
      ref={canvasRef}
      className={"w-full h-40 bg-white rounded-lg border-2 border-dashed border-border touch-none " + (className ?? "")}
      onPointerDown={(e) => {
        drawing.current = true;
        const { x, y } = pos(e);
        const ctx = canvasRef.current!.getContext("2d")!;
        ctx.beginPath(); ctx.moveTo(x, y);
        (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (!drawing.current) return;
        const { x, y } = pos(e);
        const ctx = canvasRef.current!.getContext("2d")!;
        ctx.lineTo(x, y); ctx.stroke();
        if (empty) setEmpty(false);
      }}
      onPointerUp={() => { drawing.current = false; }}
      onPointerLeave={() => { drawing.current = false; }}
    />
  );
});