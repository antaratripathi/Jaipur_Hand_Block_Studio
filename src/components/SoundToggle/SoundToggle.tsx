import styles from './SoundToggle.module.css';

interface Props {
  on: boolean;
  onToggle: () => void;
}

export default function SoundToggle({ on, onToggle }: Props) {
  return (
    <button type="button" className={styles.toggle} aria-pressed={on} onClick={onToggle} aria-label="Sound effects">
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
        <path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor" />
        {on ? (
          <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        ) : (
          <path d="M16.5 9.5l5 5M21.5 9.5l-5 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        )}
      </svg>
      <span className={styles.label}>{on ? 'Sound on' : 'Sound off'}</span>
    </button>
  );
}
