import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/api";
import "../styles/LoginForm.css";
import { jwtDecode } from "jwt-decode";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await login(email, password);

      if (response?.access_token) {
        const decoded = jwtDecode(response.access_token);

        const emailValue = decoded.email || email || "";
        const emailPrefix = emailValue.includes("@")
          ? emailValue.split("@")[0]
          : emailValue || "Utilisateur";

        const userInfo = {
          id: decoded.sub || "",
          username: emailPrefix,
          firstname: decoded.given_name || "",
          lastname: decoded.family_name || "",
          email: emailValue,
          roles: decoded.realm_access?.roles || [],
        };

        let selectedRole = "";

        if (userInfo.roles.includes("Teacher")) {
          selectedRole = "Teacher";
        } else if (
          userInfo.roles.includes("Student") ||
          userInfo.roles.includes("student")
        ) {
          selectedRole = "Student";
        } else if (
          userInfo.roles.includes("Admin") ||
          userInfo.roles.includes("Administrator") ||
          userInfo.roles.includes("admin")
        ) {
          selectedRole = "Admin";
        }

        localStorage.setItem("token", response.access_token);

        if (response.refresh_token) {
          localStorage.setItem("refresh_token", response.refresh_token);
        }

        localStorage.setItem("user", JSON.stringify(userInfo));
        localStorage.setItem("role", selectedRole);
        localStorage.setItem("username", emailPrefix);

        navigate("/accueil");
      } else {
        setError("Token manquant dans la réponse.");
      }
    } catch (err) {
      console.error("Erreur login :", err);

      const backendMessage =
        err?.response?.data?.error_description ||
        err?.response?.data?.detail ||
        "Échec de la connexion ! Vérifiez email/mot de passe.";

      setError(backendMessage);
    }
  };

  return (
    <form className="login-form" onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email académique"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />

      <button type="submit">Se connecter</button>

      {error && <p className="error-message">{error}</p>}

      <Link to="/forgot-password" className="forgot-password">
        Oublier votre mot de passe ?
      </Link>
    </form>
  );
}

export default LoginForm;