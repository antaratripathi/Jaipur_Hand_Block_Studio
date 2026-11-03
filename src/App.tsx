import Title from './components/Title/Title';
import PrintTable from './components/PrintTable/PrintTable';
import styles from './App.module.css';

export default function App() {
  return (
    <div className={styles.app}>
      <Title />
      <PrintTable />
    </div>
  );
}
