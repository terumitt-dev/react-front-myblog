// app/src/App.tsx
import { BrowserRouter } from "react-router-dom";
import Router from "@/router/Router";
import { ErrorBoundary } from "@/components/utils/ErrorBoundary";

function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Router />
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
