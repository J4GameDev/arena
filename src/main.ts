import './style.css';

// Placeholder shell. The real entry point wires up view/ once there is a
// simulation to present — see CLAUDE.md for the sim/view split.
const app = document.querySelector<HTMLDivElement>('#app')!;
app.innerHTML = `
  <main class="shell">
    <h1>Arena</h1>
    <p>Scaffolding only. No game here yet.</p>
  </main>
`;
