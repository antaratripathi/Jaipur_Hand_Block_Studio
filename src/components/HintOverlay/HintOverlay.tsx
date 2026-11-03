import styles from './HintOverlay.module.css';

const STEPS = ['Pick up a block', 'Ink it', 'Press it'];

interface Props {
  /** Index of the step the user is on now. */
  step: number;
  onDismiss: () => void;
}

/** First-visit hint. It follows along as each step is done. */
export default function HintOverlay({ step, onDismiss }: Props) {
  return (
    <div className={styles.hint} role="note" aria-label="How to print">
      <ol className={styles.steps}>
        {STEPS.map((label, i) => (
          <li key={label} className={i === step ? styles.current : i < step ? styles.done : ''} aria-current={i === step ? 'step' : undefined}>
            <span className={styles.num} aria-hidden>{i < step ? '✓' : i + 1}</span>
            {label}
          </li>
        ))}
      </ol>
      <button type="button" className={styles.dismiss} onClick={onDismiss}>Got it</button>
    </div>
  );
}
