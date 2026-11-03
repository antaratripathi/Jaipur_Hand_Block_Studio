import { useCallback, useEffect, useState } from 'react';
import { setSoundEnabled } from '../lib/sound';
import { storage } from '../lib/storage';

const KEY = 'stamp:sound';

export function useSound() {
  const [on, setOn] = useState(() => storage.get(KEY) === 'on');
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
