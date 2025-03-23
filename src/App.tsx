import { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Home from "./components/Home";

const App = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleNavigation = () => setCurrentPath(window.location.pathname);
    window.addEventListener("popstate", handleNavigation);
    return () => window.removeEventListener("popstate", handleNavigation);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
  };

  // Simple path-based rendering
  switch (currentPath) {
    case "/login":
      return <Login navigate={navigate} />;
    case "/signup":
      return <Signup navigate={navigate} />;
    case "/home":
      return <Home navigate={navigate} />;
    case "/":
      return <LandingPage navigate={navigate} />;
    default:
      return <div>404 - Page not found</div>;
  }
};

export default App;
