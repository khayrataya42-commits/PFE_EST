import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import "../styles/AccueilPage.css";

const AccueilPage = () => {
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");

    let storedUser = null;
    try {
      const rawUser = localStorage.getItem("user");
      storedUser = rawUser ? JSON.parse(rawUser) : null;
    } catch (error) {
      console.error("Erreur lecture user depuis localStorage :", error);
      storedUser = null;
    }

    if (storedUser) {
      setUser(storedUser);
    } else {
      console.warn("Aucune donnée utilisateur trouvée dans localStorage.");
    }

    if (storedRole) {
      setRole(storedRole);
    } else if (storedUser && storedUser.roles && storedUser.roles[0]) {
      setRole(storedUser.roles[0]);
    } else {
      console.warn("Aucun rôle trouvé.");
    }
  }, []);

  const displayName =
    user?.firstname ||
    user?.first_name ||
    user?.username ||
    "Utilisateur";

  if (!user) {
    return (
      <Layout>
        <div className="main-content-titre">
          <h1>Chargement...</h1>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="main-content-titre">
        <h1>Bienvenue sur votre page d'accueil {displayName}</h1>
      </div>

      <div className="main-content-carte">
        {role === "student" && (
          <>
            <Card
              title="Mes Cours"
              description="Voici vos cours en ligne."
              link="/fichiers-reçus"
              icon="fas fa-book"
            />
            <Card
              title="Mes Événements"
              description="Consultez vos événements."
              link="/event-reçus"
              icon="fas fa-calendar-check"
            />
            <Card
              title="Chat Messager"
              description="Accédez au chat."
              link="/assistance/chat-messager"
              icon="fas fa-comment-dots"
            />
          </>
        )}

        {role === "Teacher" && (
          <>
            <Card
              title="Mes Cours à Enseigner"
              description="Voici vos cours à enseigner."
              link="/upload"
              icon="fas fa-chalkboard-teacher"
            />
            <Card
              title="Télécharger un fichier"
              description="Gérez les cours."
              link="/upload"
              icon="fas fa-upload"
            />
            <Card
              title="Mes Événements"
              description="Gérez les événements."
              link="/calendrier"
              icon="fas fa-calendar-alt"
            />
            <Card
              title="Chat Messager"
              description="Accédez au chat."
              link="/assistance/chat-messager"
              icon="fas fa-comment-dots"
            />
          </>
        )}

        {role === "admin" && (
          <>
            <Card
              title="Gestion des Étudiants"
              description="Gérez les informations des étudiants."
              link="/gestion"
              icon="fas fa-users"
            />
            <Card
              title="Gestion des Enseignants"
              description="Gérez les informations des enseignants."
              link="/gestion"
              icon="fas fa-chalkboard-teacher"
            />
            <Card
              title="Gestion Enrollment"
              description="Gérez les enrollments des étudiants."
              link="/enrollment"
              icon="fas fa-user-cog"
            />
            <Card
              title="Gestion Cours"
              description="Gérez les cours."
              link="/courses"
              icon="fas fa-book-open"
            />
            <Card
              title="Gestion des demandes"
              description="Gérez les demandes d'inscription et de réinitialisation."
              link="/admin/demandes"
              icon="fas fa-tasks"
            />
            <Card
              title="Chat Messager"
              description="Accédez au chat."
              link="/assistance/chat-messager"
              icon="fas fa-comment-dots"
            />
          </>
        )}

        {!role && (
          <>
            <Card
              title="Bienvenue"
              description="Veuillez vous connecter pour voir le contenu."
              link="/login"
              icon="fas fa-user"
            />
          </>
        )}
      </div>
    </Layout>
  );
};

export default AccueilPage;