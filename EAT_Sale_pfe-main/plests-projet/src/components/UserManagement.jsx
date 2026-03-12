import React, { useState, useEffect } from "react";
import {
  get_users_admin,
  deleted_users_admin,
  add_users_admin,
} from "../services/api";
import "../styles/UserManagement.css";

const UserManagement = () => {
  const [userType, setUserType] = useState("Teacher");
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [profilePicture, setProfilePicture] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "Teacher",
    student_number: "",
    department: "",
    temporary_password: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showTableSection, setShowTableSection] = useState(false);
  const [addSuccessMessage, setAddSuccessMessage] = useState("");
  const [addErrorMessage, setAddErrorMessage] = useState("");
  const [deleteSuccessMessage, setDeleteSuccessMessage] = useState("");
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("");
  const [loading, setLoading] = useState(false); // Ajouté
  const [error, setError] = useState(false); // Ajouté

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true); // Commence le chargement
      setError(false); // Réinitialise l’erreur
      try {
        const token = localStorage.getItem("token");
        const response = await get_users_admin(token);
        const users = response.data;

        const enseignants = users.filter((u) => u.role === "Teacher");
        const etudiants = users.filter((u) => u.role === "student");

        setTeachers(enseignants);
        setStudents(etudiants);
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs :", error);
        setError(true);
      } finally {
        setLoading(false); // Arrête le chargement dans tous les cas
      }
    };

    fetchUsers();
  }, []);

  const handleFileChange = (e) => {
    setProfilePicture(e.target.files[0]);
  };

  const handleAdd = async () => {
    setAddSuccessMessage("");
    setAddErrorMessage("");

    if (!formData.username || !formData.email || !(formData.role || userType)) {
      setAddErrorMessage("Veuillez remplir tous les champs obligatoires.");
      setTimeout(() => setAddErrorMessage(""), 3000);
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const processUserAddition = async (base64Image = "") => {
        const data = {
          ...formData,
          role: formData.role || userType,
          profile_picture: base64Image,
          status: "inactive",
        };

        const response = await add_users_admin(data, token);

        if (data.role === "Teacher") {
          setTeachers((prev) => [...prev, data]);
        } else {
          setStudents((prev) => [...prev, data]);
        }

        setFormData({
          username: "",
          email: "",
          role: "",
          student_number: "",
          department: "",
          // temporary_password: "",
          temporary_password: response.temporary_password || "",
        });
        setProfilePicture(null);

        setAddSuccessMessage(
          `Utilisateur ajouté avec succès ! Mot de passe temporaire : ${response.temporary_password}`
        );
        setTimeout(() => setAddSuccessMessage(""), 3000);
      };

      if (profilePicture) {
        const reader = new FileReader();
        reader.onloadend = () => processUserAddition(reader.result);
        reader.readAsDataURL(profilePicture);
      } else {
        await processUserAddition();
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout :", error);
      setAddErrorMessage("Une erreur est survenue lors de l'ajout.");
      setTimeout(() => setAddErrorMessage(""), 3000);
    }
  };

  const handleDelete = async (index) => {
    setDeleteSuccessMessage("");
    setDeleteErrorMessage("");

    try {
      const token = localStorage.getItem("token");
      const userList = userType === "Teacher" ? teachers : students;
      const userToDelete = userList[index];

      await deleted_users_admin(userToDelete.user_id, token);

      const updatedList = [...userList];
      updatedList.splice(index, 1);

      if (userType === "Teacher") {
        setTeachers(updatedList);
      } else {
        setStudents(updatedList);
      }

      setDeleteSuccessMessage("Utilisateur supprimé avec succès !");
      setTimeout(() => setDeleteSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      setDeleteErrorMessage("Une erreur est survenue lors de la suppression.");
      setTimeout(() => setDeleteErrorMessage(""), 3000);
    }
  };

  const displayedUsers = userType === "Teacher" ? teachers : students;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="user-management">
      {!showTableSection ? (
        <>
          <div className="add-user-form">
            <h3>Ajouter un utilisateur</h3>
            {addSuccessMessage && (
              <div className="success-message">{addSuccessMessage}</div>
            )}
            {addErrorMessage && (
              <div className="error-message">{addErrorMessage}</div>
            )}

            <div className="user-div">
              <div className="user-div-parte1">
                <input
                  type="text"
                  name="username"
                  autoComplete="off"
                  placeholder="Nom d'utilisateur"
                  value={formData.username}
                  onChange={handleChange}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="Teacher">Teacher</option>
                  <option value="student">Student</option>
                </select>
                <input
                  type="text"
                  name="student_number"
                  placeholder="Numéro d'étudiant"
                  value={formData.student_number}
                  onChange={handleChange}
                />
              </div>
              <div className="user-div-parte2">
                <input
                  type="text"
                  name="department"
                  placeholder="Département"
                  value={formData.department}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="temporary_password"
                  placeholder="Mot de passe temporaire"
                  autoComplete="new-password" // très efficace pour éviter l'autofill du navigateur
                  value={formData.temporary_password}
                  onChange={handleChange}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </div>

              <button onClick={handleAdd}>Ajouter</button>
            </div>
            <button onClick={() => setShowTableSection(true)}>Afficher</button>
          </div>
        </>
      ) : (
        <>
          <button
            className="back-btn"
            onClick={() => setShowTableSection(false)}
          >
            <i className="fas fa-arrow-left"></i> Retour
          </button>

          <div className="user-type-buttons">
            <button onClick={() => setUserType("Teacher")}>
              Afficher enseignants
            </button>
            <button onClick={() => setUserType("student")}>
              Afficher étudiants
            </button>
          </div>
          {deleteSuccessMessage && (
            <div className="success-message">{deleteSuccessMessage}</div>
          )}
          {deleteErrorMessage && (
            <div className="error-message">{deleteErrorMessage}</div>
          )}
          <div className="table-container">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Département</th>
                  <th>Action</th>
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
                      utilisateurs...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="error-message"
                      style={{ textAlign: "center" }}
                    >
                      Erreur lors du chargement des utilisateurs.
                    </td>
                  </tr>
                ) : (
                  displayedUsers.map((user, index) => (
                    <tr key={index}>
                      <td>{user.username}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.department}</td>
                      <td>
                        <button onClick={() => handleDelete(index)}>
                          <i className="fas fa-trash-alt"></i> Supprimer
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default UserManagement;
