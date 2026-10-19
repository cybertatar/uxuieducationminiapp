import { createRoot } from 'react-dom/client';
import '../styles.css';
import './carousel.css';
import { Carousel } from './Carousel';

createRoot(document.getElementById('root')!).render(<Carousel />);
