import React, { useState } from "react";
import { uploadFile } from "../services/api"; // Importation de la fonction d'upload
import "../styles/FileUploader.css";

const FileUploader = ({ courseId }) => {
  // Assure-toi que le courseId est passé en prop
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  // Fonction pour gérer le changement du fichier sélectionné
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  // Fonction pour soumettre le fichier
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      alert("Please select a file.");
      return;
    }

    // Vérifier si le token existe dans localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Please log in first.");
      return;
    }

    if (!courseId) {
      alert("Course ID is required.");
      return;
    }

    setLoading(true);
    setError(null);
    setMessage("");

    try {
      // Appeler la fonction uploadFile pour envoyer le fichier
      await uploadFile(file, token, courseId); // Ajouter le courseId ici
      setMessage("Fichier télécharger avec succès!");
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error(error);
      setError("Une erreur lors de téléchargement du fichier.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="file-uploader">
      <h2>Liste des fichiers</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit" disabled={loading}>
          {loading ? "Uploading..." : "Téléchager un fichier"}
        </button>
      </form>
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default FileUploader;
