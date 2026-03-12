import React from "react";
import Layout from "../components/Layout";
import "../styles/CoNavigationPage.css"; // Import du fichier CSS

function CoNavigationPage() {
  return (
    <Layout>
      <div className="co-navigation-content">
        <h1 className="co-nav-title">Co-navigation</h1>
        <p className="co-nav-description">
          Bienvenue dans la co-navigation. Vous pouvez explorer cette page avec
          notre équipe.
        </p>

        <div className="co-nav-options">
          <button className="co-nav-button">Commencer la co-navigation</button>
          <p className="co-nav-instruction">
            Nous vous guiderons à travers cette page étape par étape.
          </p>
        </div>
      </div>
    </Layout>
  );
}

export default CoNavigationPage;
