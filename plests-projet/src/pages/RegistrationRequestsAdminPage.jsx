import { useEffect, useState } from "react";
import {
  getRegistrationRequests,
  approveRegistrationRequest,
  rejectRegistrationRequest,
} from "../services/api";

export default function AdminRegistrationRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const loadRequests = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const data = await getRegistrationRequests();
      console.log("Demandes reçues :", data);
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des demandes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (id) => {
    try {
      await approveRegistrationRequest(id, token);
      setMessage("Demande acceptée avec succès.");
      loadRequests();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'acceptation.");
    }
  };

  const handleReject = async (id) => {
    try {
      await rejectRegistrationRequest(id, token);
      setMessage("Demande rejetée avec succès.");
      loadRequests();
    } catch (err) {
      console.error(err);
      setError("Erreur lors du rejet.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Demandes d'inscription</h2>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={loadRequests}
          style={{
            padding: "10px 20px",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Recharger la liste
        </button>
      </div>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading && <p>Chargement...</p>}

      {!loading && requests.length === 0 && (
        <p>Aucune demande d'inscription trouvée.</p>
      )}

      {!loading && requests.length > 0 && (
        <table
          border="1"
          cellPadding="10"
          style={{ borderCollapse: "collapse", width: "100%" }}
        >
          <thead>
            <tr>
              <th>Prénom</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Date naissance</th>
              <th>Code Apogée</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((item) => (
              <tr key={item.id}>
                <td>{item.first_name}</td>
                <td>{item.last_name}</td>
                <td>{item.academic_email}</td>
                <td>{item.birth_date}</td>
                <td>{item.apogee_code}</td>
                <td>{item.status}</td>
                <td>
                  {item.status === "pending" ? (
                    <>
                      <button
                        onClick={() => handleApprove(item.id)}
                        style={{
                          background: "green",
                          color: "white",
                          border: "none",
                          padding: "8px 12px",
                          marginRight: "10px",
                          cursor: "pointer",
                        }}
                      >
                        Accepter
                      </button>

                      <button
                        onClick={() => handleReject(item.id)}
                        style={{
                          background: "red",
                          color: "white",
                          border: "none",
                          padding: "8px 12px",
                          cursor: "pointer",
                        }}
                      >
                        Refuser
                      </button>
                    </>
                  ) : (
                    <span>Aucune action</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}