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
}

/** The block hovering over the paper, face down: you see its carved design in ink through the wood. */
export default function GhostBlock({ def, x, y, size, rotation, color, pressing }: Props) {
  return (
    <div
      className={`${styles.ghost} ${pressing ? styles.pressing : ''}`}
      style={{ left: x, top: y, width: size, height: size, transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}
      aria-hidden
    >
      <div className={styles.body}>
        <StampFace def={def} fill={color} className={styles.face} />
      </div>
    </div>
  );
}
