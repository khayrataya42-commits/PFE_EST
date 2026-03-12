import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:8080",
  realm: "est-sale",
  clientId: "frontend-client",
});

export default keycloak;