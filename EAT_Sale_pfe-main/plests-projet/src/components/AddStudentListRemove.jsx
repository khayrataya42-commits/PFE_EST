import React, { useEffect, useState } from "react";
import {
  get_students_admin,
  get_students_semestre_admin,
  add_student_admin,
  deleted_student_admin,
} from "../services/api";
import "../styles/AddStudentListRemove.css";

const SEMESTERS = ["S1", "S2", "S3", "S4", "S5", "S6"];

const AddStudentListRemove = () => {
  const [studentsNoSemester, setStudentsNoSemester] = useState([]);
  const [studentsWithSemester, setStudentsWithSemester] = useState([]);
  const [semesterSelections, setSemesterSelections] = useState({});
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false); // To manage loading state
  const [successMessageAdd, setSuccessMessageAdd] = useState(""); // Success message for adding semester
  const [successMessageDelete, setSuccessMessageDelete] = useState(""); // Success message for deleting semester

  useEffect(() => {
    const authToken = localStorage.getItem("token");
    setToken(authToken);
    fetchStudents(authToken);
  }, []);

  const fetchStudents = async (token) => {
    setLoading(true); // Show loading state
    try {
      const [allStudentsRes, studentsWithSemesterRes] = await Promise.all([
        get_students_admin(token),
        get_students_semestre_admin(token),
      ]);

      const withSemesterIds = new Set(
        studentsWithSemesterRes.data.map((s) => s.student_id)
      );
      const noSemester = allStudentsRes.data.filter(
        (s) => !withSemesterIds.has(s.user_id)
      );

      setStudentsNoSemester(noSemester);
      setStudentsWithSemester(studentsWithSemesterRes.data);
    } catch (error) {
      console.error("Erreur lors du chargement des données", error);
    } finally {
      setLoading(false); // Hide loading state when done
    }
  };

  const handleAddSemester = async (studentId) => {
    const selectedSemester = semesterSelections[studentId];
    if (!selectedSemester) return;

    setLoading(true); // Show loading state

    try {
      await add_student_admin(
        { student_id: studentId, semester: selectedSemester },
        token
      );

      // Wait for 2 seconds before refreshing the list
      setTimeout(() => {
        fetchStudents(token);
        setSuccessMessageAdd("Semestre ajouté avec succès !"); // Set success message
        setLoading(false); // Hide loading state
        setTimeout(() => setSuccessMessageAdd(""), 3000); // Clear success message after 3 seconds
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de l'ajout du semestre", error);
      setLoading(false); // Hide loading state in case of error
    }
  };

  const handleDeleteSemester = async (studentId, semester) => {
    setLoading(true); // Show loading state

    try {
      await deleted_student_admin(studentId, semester, token);

      // Wait for 2 seconds before refreshing the list
      setTimeout(() => {
        fetchStudents(token);
        setSuccessMessageDelete("Semestre supprimé avec succès !"); // Set success message
        setLoading(false); // Hide loading state
        setTimeout(() => setSuccessMessageDelete(""), 3000); // Clear success message after 3 seconds
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de la suppression du semestre", error);
      setLoading(false); // Hide loading state in case of error
    }
  };

  const handleSemesterChange = (studentId, semester) => {
    setSemesterSelections({ ...semesterSelections, [studentId]: semester });
  };

  return (
    <div className="add-remove-student">
      <h2>Ajouter un semestre à un étudiant</h2>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nom Étudiant</th>
              <th>Département</th>
              <th>Semestre</th>
              <th>Ajouter</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="loading-message">
                  <i className="fas fa-spinner fa-spin"></i> Chargement...
                </td>
              </tr>
            ) : (
              studentsNoSemester.map((student) => (
                <tr key={student.user_id}>
                  <td>{student.username}</td>
                  <td>{student.department || "Non défini"}</td>
                  <td>
                    <select
                      value={semesterSelections[student.user_id] || ""}
                      onChange={(e) =>
                        handleSemesterChange(student.user_id, e.target.value)
                      }
                    >
                      <option value="">-- Sélectionnez --</option>
                      {SEMESTERS.map((sem) => (
                        <option key={sem} value={sem}>
                          {sem}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn-10"
                      onClick={() => handleAddSemester(student.user_id)}
                    >
                      <i className="fas fa-plus-circle"></i> Ajouter
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {successMessageAdd && (
        <div className="success-message">{successMessageAdd}</div>
      )}

      <h2>Liste des étudiants avec semestres</h2>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Nom Étudiant</th>
              <th>Département</th>
              <th>Semestre</th>
              <th>Supprimer</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="loading-message">
                  <i className="fas fa-spinner fa-spin"></i> Chargement...
                </td>
              </tr>
            ) : (
              studentsWithSemester.map((student, index) => (
                <tr key={`${student.student_id}-${index}`}>
                  <td>{student.username}</td>
                  <td>{student.department || "Non défini"}</td>
                  <td>{student.semester}</td>
                  <td>
                    <button
                      className="btn-10"
                      onClick={() =>
                        handleDeleteSemester(
                          student.student_id,
                          student.semester
                        )
                      }
                    >
                      <i className="fas fa-trash-alt"></i> Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {successMessageDelete && (
        <div className="success-message">{successMessageDelete}</div>
      )}
    </div>
  );
};

export default AddStudentListRemove;
