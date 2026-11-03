import { useCallback, useEffect, useState } from 'react';
import { setSoundEnabled } from '../lib/sound';
import { storage } from '../lib/storage';

const KEY = 'stamp:sound';

export function useSound() {
  // On by default; only a visitor who turned it off stays muted.
  const [on, setOn] = useState(() => storage.get(KEY) !== 'off');
  useEffect(() => {
    setSoundEnabled(on);
  }, [on]);
  const toggle = useCallback(() => {
    setOn((v) => {
      storage.set(KEY, v ? 'off' : 'on');
      return !v;
    });
  }, []);
  return { on, toggle };
}
