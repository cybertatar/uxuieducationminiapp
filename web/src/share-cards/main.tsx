import { createRoot } from 'react-dom/client';
import '../styles.css';
import '../carousel/carousel.css';
import './share-cards.css';
import { ShareCards } from './ShareCards';

createRoot(document.getElementById('root')!).render(<ShareCards />);
