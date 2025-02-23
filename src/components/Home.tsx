import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import LogWorkoutSection from "./LogWorkoutSection";
import DashboardSection from "./DashboardSection";
import PurchaseSection from "./PurchaseSection";
import GamesSection from "./GamesSection";
import StoreSection from "./StoreSection";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState<
    "log" | "dashboard" | "games" | "products" | "store"
  >("log");

  return (
    <div className="home-container">
      <aside className="sidebar">
        <nav>
          <ul>
            <li onClick={() => setCurrentSection("log")}>📝 Log Workout</li>
            <li onClick={() => setCurrentSection("dashboard")}>📊 Dashboard</li>
            <li onClick={() => setCurrentSection("games")}>🎮 Games</li>
            <li onClick={() => setCurrentSection("products")}>🛍️ Coupons</li>
            <li onClick={() => setCurrentSection("store")}>🏪 Store</li>
            <li onClick={() => navigate("/login")}>🔒 Sign Out</li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        {currentSection === "log" && <LogWorkoutSection />}
        {currentSection === "dashboard" && <DashboardSection />}
        {currentSection === "games" && <GamesSection />}
        {currentSection === "products" && <PurchaseSection />}
        {currentSection === "store" && <StoreSection />}
      </main>
    </div>
  );
};

export default Home;
