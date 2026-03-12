import React from "react";
import Layout from "../components/Layout";
import CourseUploadTables from "../components/CourseUploadTable";
import "../styles/UploadPage.css";

const UploadPage = () => {
  return (
    <Layout>
      <div className="upload-file-content">
        <div>
          <h2 className="upload-file-title">télécharger un fichiers</h2>
          <p className="upload-file-description">
            Bienvenue dans la co-navigation. Vous pouvez explorer cette page
            avec notre équipe.
          </p>
        </div>
        <div>
          <CourseUploadTables />
        </div>
      </div>
    </Layout>
  );
};

export default UploadPage;
