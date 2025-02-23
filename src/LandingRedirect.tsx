import { useEffect } from "react";

const LandingRedirect = () => {
  useEffect(() => {
    if (!window.location.pathname.startsWith("/landing_page")) {
      window.location.href = "/landing_page/index.html";
    }
  }, []);

  return null;
};

export default LandingRedirect;
