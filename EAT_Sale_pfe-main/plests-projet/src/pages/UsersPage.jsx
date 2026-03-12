import { useEffect, useState } from "react";
import { getUsers, createUser, deleteUser, setAdminToken } from "../services/adminApi";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    password: "",
    roles: "Student",
  });

  const loadUsers = async () => {
    try {
      setError("");
      const token = localStorage.getItem("token");
      if (token) {
        setAdminToken(token);
      }

      const data = await getUsers();
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      const backendMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Erreur lors du chargement des utilisateurs";

      setError(
        typeof backendMessage === "string"
          ? backendMessage
          : JSON.stringify(backendMessage)
      );
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      if (token) {
        setAdminToken(token);
      }

      const payload = {
        username: formData.username,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        password: formData.password,
        roles: [formData.roles],
      };

      await createUser(payload);

      setSuccess("Utilisateur créé avec succès");

      setFormData({
        username: "",
        email: "",
        first_name: "",
        last_name: "",
        password: "",
        roles: "Student",
      });

      await loadUsers();
    } catch (err) {
      console.error(err);
      const backendMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Erreur lors de la création de l'utilisateur";

      setError(
        typeof backendMessage === "string"
          ? backendMessage
          : JSON.stringify(backendMessage)
      );
    }
  };

  const handleDeleteUser = async (userId, username) => {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer l'utilisateur ${username} ?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");
      if (token) {
        setAdminToken(token);
      }

      await deleteUser(userId);
      setSuccess("Utilisateur supprimé avec succès");
      await loadUsers();
    } catch (err) {
      console.error(err);
      const backendMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Erreur lors de la suppression de l'utilisateur";

      setError(
        typeof backendMessage === "string"
          ? backendMessage
          : JSON.stringify(backendMessage)
      );
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Gestion des utilisateurs</h2>

      {error && <p style={{ color: "red", marginBottom: "12px" }}>{error}</p>}
      {success && <p style={{ color: "green", marginBottom: "12px" }}>{success}</p>}

      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          gap: "10px",
        }}
      >
        <button
          type="button"
          onClick={loadUsers}
          style={{
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            padding: "10px 16px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Recharger la liste
        </button>
      </div>

      <h3>Liste des utilisateurs</h3>

      {users.length === 0 ? (
        <p>Aucun utilisateur trouvé</p>
      ) : (
        <table
          border="1"
          cellPadding="10"
          style={{
            borderCollapse: "collapse",
            width: "100%",
            marginBottom: "30px",
            backgroundColor: "white",
          }}
        >
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Prénom</th>
              <th>Nom</th>
              <th>Rôles</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr key={user.id || user.username || index}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.first_name}</td>
                <td>{user.last_name}</td>
                <td>
                  {Array.isArray(user.roles)
                    ? user.roles.join(", ")
                    : user.roles || "Aucun rôle"}
                </td>
                <td>
                  <button
                    onClick={() => handleDeleteUser(user.id, user.username)}
                    style={{
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div
        style={{
          padding: "20px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          background: "#f9f9f9",
          maxWidth: "500px",
        }}
      >
        <h3>Créer un utilisateur</h3>

        <form onSubmit={handleCreateUser}>
          <div style={{ marginBottom: "10px" }}>
            <label>Username</label>
            <br />
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Email</label>
            <br />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Prénom</label>
            <br />
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Nom</label>
            <br />
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label>Mot de passe</label>
            <br />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label>Rôle</label>
            <br />
            <select
              name="roles"
              value={formData.roles}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }}
            >
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              padding: "10px 16px",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Créer utilisateur
          </button>
        </form>
      </div>
    </div>
  );
}