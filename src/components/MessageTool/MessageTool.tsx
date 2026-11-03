import type { Message } from '../../lib/types';
import { HAND_FONTS } from '../../lib/fonts';
import { INKS } from '../../lib/inks';
import styles from './MessageTool.module.css';

interface Props {
  message: Message;
  onChange: (patch: Partial<Message>) => void;
}

export default function MessageTool({ message, onChange }: Props) {
  return (
    <section className={styles.tool} aria-label="Write a message">
      <label className={styles.label} htmlFor="message-text">Your message</label>
      <textarea
        id="message-text"
        className={styles.input}
        rows={2}
        maxLength={120}
        placeholder="with love…"
        value={message.text}
        onChange={(e) => onChange({ text: e.target.value })}
      />
      <div className={styles.row} role="group" aria-label="Handwriting">
        {HAND_FONTS.map((f) => (
          <button
            key={f.id}
            type="button"
            className={styles.font}
            style={{ fontFamily: f.family }}
            aria-pressed={message.fontId === f.id}
            aria-label={`${f.name} handwriting`}
            onClick={() => onChange({ fontId: f.id })}
          >
            Aa
          </button>
        ))}
      </div>
      <div className={styles.row} role="group" aria-label="Message ink">
        {INKS.map((ink) => (
          <button
            key={ink.id}
            type="button"
            className={styles.swatch}
            style={{ background: ink.hex }}
            aria-pressed={message.color === ink.hex}
            aria-label={`${ink.name} message ink`}
            onClick={() => onChange({ color: ink.hex })}
          />
        ))}
      </div>
    </section>
  );
}
