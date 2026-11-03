import { useRef } from 'react';
import type { Message } from '../../lib/types';
import { FONTS_BY_ID, messageFontPx } from '../../lib/fonts';
import { LINE_HEIGHT } from '../../lib/compositor';
import styles from './MessageTool.module.css';

interface Props {
  message: Message;
  paperWidth: number;
  /** Off while a block is in hand, so presses go through to the paper. */
  enabled: boolean;
  onMove: (x: number, y: number) => void;
}

const clamp = (n: number) => Math.min(0.98, Math.max(0.02, n));

/** An invisible, same-size twin of the canvas text that you can grab and move. */
export default function DraggableMessage({ message, paperWidth, enabled, onMove }: Props) {
  const drag = useRef<{ id: number; dx: number; dy: number } | null>(null);
  if (!message.text.trim()) return null;

  const toCard = (el: HTMLElement, clientX: number, clientY: number) => {
    const rect = el.parentElement!.getBoundingClientRect();
    return [(clientX - rect.left) / rect.width, (clientY - rect.top) / rect.height] as const;
  };

  return (
    <div
      className={`${styles.handle} ${enabled ? '' : styles.passive}`}
      style={{
        left: `${message.x * 100}%`,
        top: `${message.y * 100}%`,
        fontFamily: FONTS_BY_ID[message.fontId]?.family,
        fontSize: messageFontPx(message.text, message.fontId, message.size, paperWidth),
        lineHeight: LINE_HEIGHT,
      }}
      tabIndex={enabled ? 0 : -1}
      role="button"
      aria-label="Message. Drag, or use arrow keys, to move it."
      onPointerDown={(e) => {
        if (!enabled) return;
        e.stopPropagation();
        const [x, y] = toCard(e.currentTarget, e.clientX, e.clientY);
        drag.current = { id: e.pointerId, dx: message.x - x, dy: message.y - y };
        e.currentTarget.setPointerCapture(e.pointerId);
      }}
      onPointerMove={(e) => {
        if (drag.current?.id !== e.pointerId) return;
        const [x, y] = toCard(e.currentTarget, e.clientX, e.clientY);
        onMove(clamp(x + drag.current.dx), clamp(y + drag.current.dy));
      }}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      onKeyDown={(e) => {
        const step = e.shiftKey ? 0.05 : 0.01;
        const moves: Record<string, [number, number]> = {
          ArrowLeft: [-step, 0],
          ArrowRight: [step, 0],
          ArrowUp: [0, -step],
          ArrowDown: [0, step],
        };
        const mv = moves[e.key];
        if (!mv) return;
        e.preventDefault();
        onMove(clamp(message.x + mv[0]), clamp(message.y + mv[1]));
      }}
    >
      {message.text}
    </div>
  );
}
