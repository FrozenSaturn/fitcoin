import { useEffect } from "react";

const LandingRedirect = () => {
  useEffect(() => {
    const basePath = "/fitcoin"; // Match your GitHub Pages repo name
    const targetPath = `${basePath}/landing_page/index.html`;

    if (!window.location.pathname.startsWith(`${basePath}/landing_page`)) {
      window.location.href = targetPath;
    }
  }, []);

  return null;
};

export default LandingRedirect;
