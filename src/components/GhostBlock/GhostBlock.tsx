import type { StampDef } from '../../lib/types';
import StampFace from '../StampFace/StampFace';
import styles from './GhostBlock.module.css';

interface Props {
  def: StampDef;
  x: number;
  y: number;
  size: number;
  rotation: number;
  color: string;
  pressing: boolean;
  /** Block has no ink: shown as a faint outline, with a shake when pressed. */
  dry: boolean;
  shake: number;
}

/** The block hovering over the paper, face down: you see its carved design in ink through the wood. */
export default function GhostBlock({ def, x, y, size, rotation, color, pressing, dry, shake }: Props) {
  return (
    <div
      className={`${styles.ghost} ${pressing ? styles.pressing : ''} ${dry ? styles.dry : ''}`}
      style={{ left: x, top: y, width: size, height: size, transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}
      aria-hidden
    >
      <div className={`${styles.body} ${shake ? (shake % 2 ? styles.shakeA : styles.shakeB) : ''}`}>
        <StampFace def={def} fill={color} className={styles.face} />
      </div>
    </div>
  );
}
