import { createRoot } from 'react-dom/client';
import '../styles.css';
import '../carousel/carousel.css';
import './post.css';
import { Post } from './Post';

createRoot(document.getElementById('root')!).render(<Post />);
