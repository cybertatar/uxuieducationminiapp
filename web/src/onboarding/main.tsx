import { createRoot } from 'react-dom/client';
import '../styles.css';
import './onboarding.css';
import { Onboarding } from './Onboarding';

createRoot(document.getElementById('root')!).render(<Onboarding />);
