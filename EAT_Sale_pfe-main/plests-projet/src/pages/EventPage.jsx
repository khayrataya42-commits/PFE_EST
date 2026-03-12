// EventPage.jsx
import React, { useEffect, useState } from "react";
import EventList from "../components/EventList";
import Layout from "../components/Layout";
import "../styles/EventPage.css";

const EventPage = () => {
  const userRole = (localStorage.getItem("role") || "").toLowerCase();
  console.log("🎓 Rôle récupéré depuis le localStorage :", userRole);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?._id || user?.id; // selon le nom dans ton backend

  console.log("🆔 ID utilisateur :", userId);
  return (
    <Layout>
      <div className="event-page-container">
        <h2>Événements du département</h2>
        <EventList userRole={userRole} userId={userId} />
      </div>
    </Layout>
  );
};

export default EventPage;
