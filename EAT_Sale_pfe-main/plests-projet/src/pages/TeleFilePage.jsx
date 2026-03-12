import React from "react";
import FileList from "../components/FileList";
import "../styles/TeleFilePage.css";
import Layout from "../components/Layout";

const TeleFilePage = () => {
  // localStorage
  const userRole = (localStorage.getItem("role") || "").toLowerCase();

  console.log("🎓 Rôle récupéré depuis localStorage :", userRole);

  return (
    <Layout>
      <div className="tele-file-page">
        <h1>Mes fichiers</h1>

        <div className="file-section">
          <FileList userRole={userRole} />
        </div>
      </div>
    </Layout>
  );
};

export default TeleFilePage;