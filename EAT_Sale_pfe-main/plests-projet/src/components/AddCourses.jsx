import React, { useState, useEffect } from "react";
import { add_cours_admin } from "../services/api";
import "../styles/AddCourses.css";

const AddCourses = ({ teachers }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    course_semester: "",
    teacher_id: "",
  });
  console.log(teachers);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const storedRole = localStorage.getItem("role");

    if (storedUser) {
      setUser(storedUser);
    } else {
      console.warn("Aucune donnée utilisateur trouvée dans localStorage.");
    }

    if (storedRole) {
      setRole(storedRole);
    } else if (storedUser?.roles?.[0]) {
      setRole(storedUser.roles[0]);
    } else {
      console.warn("Aucun rôle trouvé.");
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setErrorMessage("");
    setSuccessMessage("");

    // console.log("📥 Reçu token:", token);
    try {
      await add_cours_admin(formData, token);
      setSuccessMessage("Cours ajouté avec succès");
      setTimeout(() => setSuccessMessage(""), 3000); // ✅ success message disparaît après 3s
      setFormData({
        title: "",
        description: "",
        category: "",
        course_semester: "",
        teacher_id: "",
      });
    } catch (error) {
      console.error("Erreur API:", error);
      setErrorMessage("Erreur lors de l'ajout du cours : " + error.message);
      setTimeout(() => setErrorMessage(""), 3000); // ✅ error message disparaît après 3s
    }
  };

  return (
    <div className="add-course-form">
      <h3>Ajouter un cours</h3>
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      <form onSubmit={handleAddCourse}>
        <div className="div-form">
          <input
            type="text"
            name="title"
            placeholder="Titre"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="category"
            placeholder="Catégorie"
            value={formData.category}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="course_semester"
            placeholder="Semestre"
            value={formData.course_semester}
            onChange={handleChange}
            required
          />

          <select
            name="teacher_id"
            value={formData.teacher_id}
            onChange={handleChange}
            required
          >
            <option value="">Sélectionner un professeur</option>
            {teachers.map((teacher) => (
              <option key={teacher.user_id} value={teacher.user_id}>
                {teacher.username}
              </option>
            ))}
          </select>
        </div>
        <button type="submit">Ajouter</button>
      </form>
    </div>
  );
};

export default AddCourses;
