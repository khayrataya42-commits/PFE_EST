import React, { useEffect, useState } from "react";
import { get_courses_admin, deleted_cours_admin } from "../services/api";
import "../styles/CourseListRemove.css";

const CourseListRemove = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true); // 🔄 État de chargement
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await get_courses_admin(token);
        setCourses(response.data);
        setLoading(false); // ✅ Fin du chargement
      } catch (error) {
        console.error("Erreur lors du chargement des cours :", error);
        setErrorMessage("Erreur lors du chargement des cours.");
        setLoading(false); // ✅ Fin du chargement même en cas d'erreur
      }
    };

    fetchCourses();
  }, []);

  const handleDelete = async (course_id) => {
    try {
      const token = localStorage.getItem("token");
      await deleted_cours_admin(course_id, token);
      setCourses((prevCourses) =>
        prevCourses.filter((course) => course.course_id !== course_id)
      );
      setSuccessMessage("Cours supprimé avec succès.");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Erreur lors de la suppression du cours :", error);
      setErrorMessage("Erreur lors de la suppression du cours.");
      setTimeout(() => setErrorMessage(""), 3000);
    }
  };

  return (
    <div className="course-list">
      <h3>Liste des cours</h3>

      {successMessage && <p className="success">{successMessage}</p>}
      {errorMessage && <p className="error">{errorMessage}</p>}

      <table>
        <thead>
          <tr>
            <th>Titre</th>
            <th>Catégorie</th>
            <th>Semestre</th>
            <th>Professeur</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                className="loading-message"
                colSpan="5"
                style={{ textAlign: "center" }}
              >
                <i className="fas fa-spinner fa-spin"></i> Chargement des
                cours...
              </td>
            </tr>
          ) : courses.length > 0 ? (
            courses.map((course) => (
              <tr key={course.course_id}>
                <td>{course.title}</td>
                <td>{course.category}</td>
                <td>{course.course_semester}</td>
                <td>{course.teacher?.username || "Inconnu"}</td>
                <td>
                  <button onClick={() => handleDelete(course.course_id)}>
                    <i className="fas fa-trash-alt"></i> Supprimer
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                Aucun cours disponible.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CourseListRemove;
