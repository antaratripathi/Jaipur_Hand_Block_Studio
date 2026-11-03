import { useCallback, useState } from 'react';
import { storage } from '../lib/storage';

const KEY = 'stamp:hint-dismissed';

export function useFirstVisit() {
  const [show, setShow] = useState(() => storage.get(KEY) !== '1');
  const dismiss = useCallback(() => {
    storage.set(KEY, '1');
    setShow(false);
  }, []);
  return { show, dismiss };
}
