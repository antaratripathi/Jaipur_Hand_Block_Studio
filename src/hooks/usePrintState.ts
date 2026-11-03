import { useReducer } from 'react';
import type { Press } from '../lib/types';
import { randomSeed } from '../lib/random';

export interface PrintState {
  presses: Press[];
  paperSeed: number;
  /** Increments on every new sheet, so the paper can animate in. */
  sheetId: number;
}

type Action =
  | { type: 'press'; press: Press }
  | { type: 'undo' }
  | { type: 'wash' }
  | { type: 'newSheet' };

function reducer(state: PrintState, action: Action): PrintState {
  switch (action.type) {
    case 'press':
      return { ...state, presses: [...state.presses, action.press] };
    case 'undo':
      return { ...state, presses: state.presses.slice(0, -1) };
    case 'wash':
      return { ...state, presses: [] };
    case 'newSheet':
      return { presses: [], paperSeed: randomSeed(), sheetId: state.sheetId + 1 };
  }
}

export function usePrintState() {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    presses: [],
    paperSeed: randomSeed(),
    sheetId: 0,
  }));
  return {
    state,
    addPress: (press: Press) => dispatch({ type: 'press', press }),
    undo: () => dispatch({ type: 'undo' }),
    wash: () => dispatch({ type: 'wash' }),
    newSheet: () => dispatch({ type: 'newSheet' }),
  };
}
