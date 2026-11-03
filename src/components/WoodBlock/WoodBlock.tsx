import type { StampDef } from '../../lib/types';
import type { BlockInk } from '../../hooks/useInk';
import { woodTextureURL } from '../../lib/woodTexture';
import StampFace from '../StampFace/StampFace';
import styles from './WoodBlock.module.css';

interface Props {
  def: StampDef;
  ink?: BlockInk;
  /** Shifts the shared grain texture so each block looks cut from a different piece. */
  grainOffset?: number;
  className?: string;
  style?: React.CSSProperties;
}

/** A square wooden block seen from above, with its raised carving (inked if it has been dabbed). */
export default function WoodBlock({ def, ink, grainOffset = 0, className, style }: Props) {
  return (
    <span
      className={`${styles.block} ${className ?? ''}`}
      style={{
        backgroundImage: `url(${woodTextureURL()})`,
        backgroundPosition: `${grainOffset * 61}px ${grainOffset * 37}px`,
        ...style,
      }}
      aria-hidden
    >
      <StampFace def={def} fill="var(--color-carving)" className={styles.carving} />
      {ink && (
        <StampFace
          def={def}
          fill={ink.color}
          className={`${styles.carving} ${styles.ink}`}
          style={{ opacity: 0.35 + 0.65 * ink.level }}
        />
      )}
    </span>
  );
}
