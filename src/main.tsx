import React from "react";
import ReactDOM from "react-dom/client";
import Sheet from "./components/Sheet";
import { onObrReady } from "./obr";

// Monta dentro do OBR quando o SDK estiver pronto…
onObrReady(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <Sheet />
    </React.StrictMode>
  );
});

// …e também monta fora do OBR (dev local no navegador)
if (typeof window !== "undefined") {
  (window as any).OBR || ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <Sheet />
    </React.StrictMode>
  );
}
