import Title from './components/Title/Title';
import PrintTable from './components/PrintTable/PrintTable';
import SoundToggle from './components/SoundToggle/SoundToggle';
import { useSound } from './hooks/useSound';
import styles from './App.module.css';

export default function App() {
  const sound = useSound();
  return (
    <div className={styles.app}>
      <Title>
        <SoundToggle on={sound.on} onToggle={sound.toggle} />
      </Title>
      <PrintTable />
    </div>
  );
}
