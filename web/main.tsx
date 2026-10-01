import { createRoot } from "react-dom/client";

function App() {
  return (
    <main>
      <h1>Riven</h1>
      <p>Synthetic observation demo</p>
      <p>The frontend is running. Backend connection is not configured yet.</p>
    </main>
  );
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("The HTML root element is missing.");
}

createRoot(rootElement).render(<App />);