import { useEffect, useState } from "react";
import { getUsers } from "../services/adminApi";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    getUsers()
      .then((data) => {
        setUsers(Array.isArray(data) ? data : [data]);
      })
      .catch((err) => {
        console.error(err);
        setError("Erreur lors du chargement des utilisateurs");
      });
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Liste des utilisateurs</h2>

      {error && <p>{error}</p>}

      {!error && users.length === 0 && <p>Aucun utilisateur</p>}

      {!error && users.length > 0 && (
        <ul>
          {users.map((user) => (
            <li key={user.id}>
              <strong>{user.username}</strong> - {user.email} -{" "}
              {(user.roles || []).join(", ")}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}