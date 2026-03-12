import React from "react";
import Header from "./Header";
import Menu from "./Menu";
import { useLocation } from "react-router-dom"; // 📌 Import pour détecter la page actuelle
import "../styles/Layout.css"; // Fichier CSS global

const Layout = ({ children }) => {
  const role = localStorage.getItem("role"); // Récupérer le rôle utilisateur
  const location = useLocation(); // 📌 Obtenir l'URL actuelle
  console.log(role);
  const isHomePage = location.pathname === "/"; // 📌 Vérifie si on est sur la HomePage

  return (
    <div className="app-layout">
      <div className="header-container">
        <Header />
      </div>

      <div className="chat-container">
        {/* 📌 Affiche le Menu seulement si on n'est pas sur la HomePage */}
        {!isHomePage && (
          <aside className="menu-container">
            <Menu role={role} />
          </aside>
        )}

        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
