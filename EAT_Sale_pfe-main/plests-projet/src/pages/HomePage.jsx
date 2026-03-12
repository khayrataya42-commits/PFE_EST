import React from "react";
import Layout from "../components/Layout";
import "../styles/HomePage.css";

function HomePage() {
  return (
    <Layout>
      <div className="home-content">
        <h1 className="home-header">Bienvenue à l'EST Salé</h1>
        <p className="home-description">
          Connectez-vous pour accéder aux fonctionnalités.
        </p>
      </div>
    </Layout>
  );
}

export default HomePage;
