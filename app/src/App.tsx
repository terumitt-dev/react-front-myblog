// app/src/App.tsx
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider } from "@/context/AuthContext";
import { AppErrorBoundary } from "@/components/utils/ErrorBoundary";
import Router from "@/router/Router";

function App() {
  console.log("🚀 App component rendering...");

  return (
    <AppErrorBoundary
      onError={(error, errorInfo) => {
        console.error("🚨 App level error:", error, errorInfo);
      }}
    >
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}

export default App;
