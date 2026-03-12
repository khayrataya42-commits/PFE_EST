import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import keycloak from "./keycloak";
import { setAdminToken } from "./services/adminApi";

keycloak
  .init({
    onLoad: "check-sso",
    checkLoginIframe: false,
    pkceMethod: "S256",
  })
  .then((authenticated) => {
    if (authenticated) {
      setAdminToken(keycloak.token);
      localStorage.setItem("token", keycloak.token);
    }

    ReactDOM.createRoot(document.getElementById("root")).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  })
  .catch((error) => {
    console.error("Erreur Keycloak :", error);

    ReactDOM.createRoot(document.getElementById("root")).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  });