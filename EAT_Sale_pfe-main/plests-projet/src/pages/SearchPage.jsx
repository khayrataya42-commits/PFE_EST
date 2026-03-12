import React, { useState, useEffect } from "react";
import Layout from "../components/Layout"; // Import du composant Layout
import "../styles/SearchPage.css"; // Assurez-vous que ce fichier CSS existe

const SearchPage = () => {
  const [role, setRole] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  useEffect(() => {
    const userRole = localStorage.getItem("role"); // Récupérer le rôle stocké
    setRole(userRole);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    // Effectuer la recherche (ici tu peux intégrer une vraie recherche)
    setResults([`Résultat pour: ${query}`, "Autre résultat..."]);
  };

  return (
    <Layout>
      <div className="search-page">
        <div className="main-content-titre">
          <h1>Recherche</h1>
          <p>Entrez votre requête ci-dessous pour commencer la recherche.</p>
        </div>

        {/* Zone de Recherche */}
        <form onSubmit={handleSearch} className="search-form">
          <input
            type="text"
            placeholder="Que recherchez-vous ?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">
            Rechercher
          </button>
        </form>

        {/* Résultats de recherche */}
        <div className="search-results">
          <h3>Résultats de recherche :</h3>
          {results.length > 0 ? (
            results.map((result, index) => <p key={index}>{result}</p>)
          ) : (
            <p>Aucun résultat trouvé.</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SearchPage;
