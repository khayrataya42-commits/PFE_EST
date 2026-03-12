import React, { useEffect, useState } from "react";
import {
  getRegistrationRequests,
  approveRegistrationRequest,
  rejectRegistrationRequest,
  getPasswordResetRequests,
  approvePasswordResetRequest,
  rejectPasswordResetRequest,
} from "../services/api";

function AdminDemandesPage() {
  const [registrationRequests, setRegistrationRequests] = useState([]);
  const [passwordResetRequests, setPasswordResetRequests] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadAllRequests = async () => {
    try {
      setError("");
      setMessage("");

      const regData = await getRegistrationRequests();
      const resetData = await getPasswordResetRequests();

      setRegistrationRequests(Array.isArray(regData) ? regData : []);
      setPasswordResetRequests(Array.isArray(resetData) ? resetData : []);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des demandes.");
    }
  };

  useEffect(() => {
    loadAllRequests();
  }, []);

  const handleApproveRegistration = async (requestId) => {
    try {
      setError("");
      setMessage("");
      await approveRegistrationRequest(requestId);
      setMessage("Demande d'inscription acceptée avec succès.");
      await loadAllRequests();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'acceptation de la demande d'inscription.");
    }
  };

  const handleRejectRegistration = async (requestId) => {
    try {
      setError("");
      setMessage("");
      await rejectRegistrationRequest(requestId);
      setMessage("Demande d'inscription refusée avec succès.");
      await loadAllRequests();
    } catch (err) {
      console.error(err);
      setError("Erreur lors du refus de la demande d'inscription.");
    }
  };

  const handleApproveReset = async (requestId) => {
    try {
      setError("");
      setMessage("");
      const result = await approvePasswordResetRequest(requestId);
      setMessage(
        `Demande de réinitialisation acceptée. Mot de passe temporaire: ${result.temporary_password}`
      );
      await loadAllRequests();
    } catch (err) {
      console.error(err);
      setError("Erreur lors de l'acceptation de la demande de réinitialisation.");
    }
  };

  const handleRejectReset = async (requestId) => {
    try {
      setError("");
      setMessage("");
      await rejectPasswordResetRequest(requestId);
      setMessage("Demande de réinitialisation refusée avec succès.");
      await loadAllRequests();
    } catch (err) {
      console.error(err);
      setError("Erreur lors du refus de la demande de réinitialisation.");
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        height: "100vh",
        overflow: "hidden",
        boxSizing: "border-box",
      }}
    >
      <h1 style={{ marginBottom: "15px" }}>Gestion des demandes</h1>

      <button
        onClick={loadAllRequests}
        style={{
          marginBottom: "15px",
          padding: "10px 16px",
          backgroundColor: "#d9534f",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          width: "100%",
        }}
      >
        Recharger la liste
      </button>

      {message && <p style={{ color: "green", marginBottom: "10px" }}>{message}</p>}
      {error && <p style={{ color: "red", marginBottom: "10px" }}>{error}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          height: "calc(100vh - 180px)",
        }}
      >
        {/* Demandes d'inscription */}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "15px",
            overflow: "hidden",
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2 style={{ marginBottom: "10px" }}>Demandes d'inscription</h2>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {registrationRequests.length === 0 ? (
              <p>Aucune demande d'inscription trouvée.</p>
            ) : (
              <table
                border="1"
                cellPadding="10"
                cellSpacing="0"
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <thead style={{ position: "sticky", top: 0, background: "#f8f8f8" }}>
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
                  {registrationRequests.map((item) => (
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
                              onClick={() => handleApproveRegistration(item.id)}
                              style={{
                                marginRight: "8px",
                                marginBottom: "5px",
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
                              onClick={() => handleRejectRegistration(item.id)}
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
        </div>

        {/* Demandes reset password */}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "15px",
            overflow: "hidden",
            backgroundColor: "#fff",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h2 style={{ marginBottom: "10px" }}>
            Demandes de réinitialisation du mot de passe
          </h2>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {passwordResetRequests.length === 0 ? (
              <p>Aucune demande de réinitialisation trouvée.</p>
            ) : (
              <table
                border="1"
                cellPadding="10"
                cellSpacing="0"
                style={{ width: "100%", borderCollapse: "collapse" }}
              >
                <thead style={{ position: "sticky", top: 0, background: "#f8f8f8" }}>
                  <tr>
                    <th>Email</th>
                    <th>Code Apogée</th>
                    <th>Date naissance</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {passwordResetRequests.map((item) => (
                    <tr key={item.id}>
                      <td>{item.academic_email}</td>
                      <td>{item.apogee_code}</td>
                      <td>{item.birth_date}</td>
                      <td>{item.status}</td>
                      <td>
                        {item.status === "pending" ? (
                          <>
                            <button
                              onClick={() => handleApproveReset(item.id)}
                              style={{
                                marginRight: "8px",
                                marginBottom: "5px",
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
                              onClick={() => handleRejectReset(item.id)}
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
        </div>
      </div>
    </div>
  );
}

export default AdminDemandesPage;