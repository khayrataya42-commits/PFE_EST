import React from "react";
import AddStudentListRemove from "../components/AddStudentListRemove";
import Layout from "../components/Layout";
import "../styles/EnrollmentPage.css";

const EnrollmentPage = () => {
  return (
    <Layout>
      <div className="enrollment-page">
        <h2>Gestion des Étudiants et Inscriptions</h2>
        <div>
          <AddStudentListRemove />
        </div>
      </div>
    </Layout>
  );
};

export default EnrollmentPage;
