import './style.css';
import { start } from './view/app.ts';

const app = document.querySelector<HTMLDivElement>('#app');
if (app === null) throw new Error('Missing #app element');

start(app);
