import { useCallback, useState } from 'react';
import type { Message } from '../lib/types';
import { HAND_FONTS } from '../lib/fonts';
import { INKS } from '../lib/inks';

const INITIAL: Message = {
  text: '',
  fontId: HAND_FONTS[0].id,
  color: INKS[0].hex,
  x: 0.08,
  y: 0.76,
  size: 0.046,
};

export function useMessage() {
  const [message, setMessage] = useState<Message>(INITIAL);
  const update = useCallback((patch: Partial<Message>) => setMessage((m) => ({ ...m, ...patch })), []);
  const reset = useCallback(() => setMessage((m) => ({ ...INITIAL, fontId: m.fontId, color: m.color })), []);
  return { message, update, reset };
}
