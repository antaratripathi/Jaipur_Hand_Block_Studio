import { useLayoutEffect, useRef } from 'react';
import type { Message } from '../../lib/types';
import { LINE_HEIGHT, MESSAGE_WIDTH, messageFont } from '../../lib/fonts';
import styles from './MessageField.module.css';

interface Props {
  message: Message;
  paperWidth: number;
  /** Off while a block is in hand, so presses go through to the paper. */
  enabled: boolean;
  onChange: (patch: Partial<Message>) => void;
}

const clamp = (n: number, max: number) => Math.min(max, Math.max(0.02, n));

/** The message, typed straight onto the card. Drag the small handle to move it. */
export default function MessageField({ message, paperWidth, enabled, onChange }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const drag = useRef<{ id: number; dx: number; dy: number } | null>(null);
  const font = messageFont(message.fontId, message.size, paperWidth);

  // Grow with the text.
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = '0px';
    el.style.height = `${el.scrollHeight}px`;
  }, [message.text, font.css, paperWidth]);

  const toCard = (el: HTMLElement, clientX: number, clientY: number) => {
    const rect = el.closest('[data-card]')!.getBoundingClientRect();
    return [(clientX - rect.left) / rect.width, (clientY - rect.top) / rect.height] as const;
  };

  const move = (x: number, y: number) => onChange({ x: clamp(x, 1 - MESSAGE_WIDTH), y: clamp(y, 0.95) });

  return (
    <div
      className={`${styles.field} ${enabled ? '' : styles.passive}`}
      style={{ left: `${message.x * 100}%`, top: `${message.y * 100}%`, width: `${MESSAGE_WIDTH * 100}%` }}
    >
      {message.text.trim() && (
        <button
          type="button"
          className={styles.grip}
          aria-label="Move message. Drag, or use the arrow keys."
          tabIndex={enabled ? 0 : -1}
          onPointerDown={(e) => {
            e.stopPropagation();
            const [x, y] = toCard(e.currentTarget, e.clientX, e.clientY);
            drag.current = { id: e.pointerId, dx: message.x - x, dy: message.y - y };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (drag.current?.id !== e.pointerId) return;
            const [x, y] = toCard(e.currentTarget, e.clientX, e.clientY);
            move(x + drag.current.dx, y + drag.current.dy);
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
            move(message.x + mv[0], message.y + mv[1]);
          }}
        >
          <svg viewBox="0 0 8 14" width="8" height="14" aria-hidden>
            {[2, 7, 12].flatMap((y) => [<circle key={`a${y}`} cx="2" cy={y} r="1.1" />, <circle key={`b${y}`} cx="6" cy={y} r="1.1" />])}
          </svg>
        </button>
      )}
      <textarea
        ref={ref}
        className={styles.input}
        rows={1}
        maxLength={140}
        placeholder="Write a custom message"
        aria-label="Message on the card"
        tabIndex={enabled ? 0 : -1}
        value={message.text}
        spellCheck={false}
        onChange={(e) => onChange({ text: e.target.value })}
        style={{
          fontFamily: font.family,
          fontWeight: font.weight,
          fontSize: font.px,
          lineHeight: LINE_HEIGHT,
          color: message.color,
        }}
      />
    </div>
  );
}
