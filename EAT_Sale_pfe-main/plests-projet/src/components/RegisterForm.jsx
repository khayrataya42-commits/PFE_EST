import React, { useState } from "react";
import { createRegistrationRequest } from "../services/api";
import "../styles/LoginForm.css";

function RegisterForm() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    academic_email: "",
    birth_date: "",
    apogee_code: "",
    password: "",
    confirm_password: "",
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

    if (formData.password !== formData.confirm_password) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    if (!formData.birth_date) {
      setError("La date de naissance est obligatoire.");
      return;
    }

    try {
      const formattedDate = new Date(formData.birth_date)
        .toISOString()
        .split("T")[0];

      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        academic_email: formData.academic_email.trim(),
        birth_date: formattedDate,
        apogee_code: formData.apogee_code.trim(),
        password: formData.password,
      };

      const result = await createRegistrationRequest(payload);
      console.log("Demande envoyée :", result);

      setMessage(
        "Votre demande a été envoyée avec succès. Elle sera examinée par l’administration."
      );

      setFormData({
        first_name: "",
        last_name: "",
        academic_email: "",
        birth_date: "",
        apogee_code: "",
        password: "",
        confirm_password: "",
      });
    } catch (err) {
      console.error("Erreur inscription :", err?.response?.data || err);

      const backendMessage =
        err?.response?.data?.detail
          ? typeof err.response.data.detail === "string"
            ? err.response.data.detail
            : JSON.stringify(err.response.data.detail)
          : "Erreur lors de l’envoi de la demande d’inscription.";

      setError(backendMessage);
    }
  };

  return (
    <form className="login-form" onSubmit={handleSubmit}>
      <input
        type="text"
        name="first_name"
        placeholder="Prénom"
        value={formData.first_name}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="last_name"
        placeholder="Nom"
        value={formData.last_name}
        onChange={handleChange}
        required
      />

      <input
        type="email"
        name="academic_email"
        placeholder="Email académique"
        value={formData.academic_email}
        onChange={handleChange}
        required
      />

      <input
        type="date"
        name="birth_date"
        value={formData.birth_date}
        onChange={handleChange}
        required
      />

      <input
        type="text"
        name="apogee_code"
        placeholder="Code Apogée"
        value={formData.apogee_code}
        onChange={handleChange}
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Mot de passe"
        value={formData.password}
        onChange={handleChange}
        required
      />

      <input
        type="password"
        name="confirm_password"
        placeholder="Confirmer le mot de passe"
        value={formData.confirm_password}
        onChange={handleChange}
        required
      />

      <button type="submit">Créer un compte</button>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="error-message">{error}</p>}
    </form>
  );
}

export default RegisterForm;