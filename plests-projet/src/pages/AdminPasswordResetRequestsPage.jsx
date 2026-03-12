import React, { useEffect, useState } from "react";
import {
  getPasswordResetRequests,
  approvePasswordResetRequest,
  rejectPasswordResetRequest,
} from "../services/api";

function AdminPasswordResetRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRequests = async () => {
    try {
      setError("");
      const data = await getPasswordResetRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des demandes.");
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (requestId) => {
    try {
      setError("");
      setMessage("");
      const result = await approvePasswordResetRequest(requestId);
      setMessage(
        `Demande acceptée. Mot de passe temporaire: ${result.temporary_password}`
      );
      await loadRequests();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'acceptation.");
    }
  };

  const handleReject = async (requestId) => {
    try {
      setError("");
      setMessage("");
      await rejectPasswordResetRequest(requestId);
      setMessage("Demande refusée avec succès.");
      await loadRequests();
    } catch (err) {
      console.error(err);
      setError("Erreur lors du refus.");
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Demandes de réinitialisation du mot de passe</h2>

      <button
        onClick={loadRequests}
        style={{
          marginBottom: "20px",
          padding: "10px 16px",
          backgroundColor: "#d9534f",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Recharger la liste
      </button>

      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {requests.length === 0 ? (
        <p>Aucune demande trouvée.</p>
      ) : (
        <table
          border="1"
          cellPadding="10"
          cellSpacing="0"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>Email</th>
              <th>Code Apogée</th>
              <th>Date naissance</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((item) => (
              <tr key={item.id}>
                <td>{item.academic_email}</td>
                <td>{item.apogee_code}</td>
                <td>{item.birth_date}</td>
                <td>{item.status}</td>
                <td>
                  {item.status === "pending" ? (
                    <>
                      <button
                        onClick={() => handleApprove(item.id)}
                        style={{
                          marginRight: "10px",
                          padding: "8px 12px",
                          backgroundColor: "green",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
                          cursor: "pointer",
                        }}
                      >
                        Accepter
                      </button>

                      <button
                        onClick={() => handleReject(item.id)}
                        style={{
                          padding: "8px 12px",
                          backgroundColor: "red",
                          color: "white",
                          border: "none",
                          borderRadius: "5px",
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

export default AdminPasswordResetRequestsPage;