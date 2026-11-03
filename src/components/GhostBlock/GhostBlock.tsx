import type { StampDef } from '../../lib/types';
import type { BlockInk } from '../../hooks/useInk';
import WoodBlock from '../WoodBlock/WoodBlock';
import styles from './GhostBlock.module.css';

interface Props {
  def: StampDef;
  ink?: BlockInk;
  x: number;
  y: number;
  size: number;
  rotation: number;
  pressing: boolean;
  /** Bumped when a dry block is pressed, to give it a little shake. */
  shake: number;
}

/** The block in hand, following the cursor or finger. */
export default function GhostBlock({ def, ink, x, y, size, rotation, pressing, shake }: Props) {
  return (
    <div
      className={`${styles.ghost} ${pressing ? styles.pressing : ''}`}
      style={{ left: x, top: y, width: size, height: size, transform: `translate(-50%, -50%) rotate(${rotation}deg)` }}
      aria-hidden
    >
      <div className={`${styles.body} ${shake ? (shake % 2 ? styles.shakeA : styles.shakeB) : ''}`}>
        <WoodBlock def={def} ink={ink} className={styles.wood} />
      </div>
    </div>
  );
}
