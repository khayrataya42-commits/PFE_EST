import React, { useState } from "react";
import { createPasswordResetRequest } from "../services/api";

function ForgotPasswordPage() {
  const [formData, setFormData] = useState({
    academic_email: "",
    apogee_code: "",
    birth_date: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await createPasswordResetRequest(formData);
      setMessage("Votre demande a été envoyée à l'administration.");
      setFormData({
        academic_email: "",
        apogee_code: "",
        birth_date: "",
      });
    } catch (err) {
      console.error(err);
      const backendMessage =
        err?.response?.data?.detail ||
        "Erreur lors de l'envoi de la demande.";
      setError(backendMessage);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "500px", margin: "0 auto" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        Mot de passe oublié
      </h2>

      <p style={{ textAlign: "center", marginBottom: "25px" }}>
        Remplissez ce formulaire. Votre demande sera envoyée à
        l’administration.
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <input
          type="email"
          name="academic_email"
          placeholder="Email académique"
          value={formData.academic_email}
          onChange={handleChange}
          required
          style={{ padding: "12px" }}
        />

        <input
          type="text"
          name="apogee_code"
          placeholder="Code Apogée"
          value={formData.apogee_code}
          onChange={handleChange}
          required
          style={{ padding: "12px" }}
        />

        <input
          type="date"
          name="birth_date"
          value={formData.birth_date}
          onChange={handleChange}
          required
          style={{ padding: "12px" }}
        />

        <button
          type="submit"
          style={{
            padding: "12px",
            backgroundColor: "#d9534f",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          Envoyer la demande
        </button>

        {message && (
          <p style={{ color: "green", textAlign: "center" }}>{message}</p>
        )}

        {error && (
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        )}
      </form>
    </div>
  );
}

export default ForgotPasswordPage;