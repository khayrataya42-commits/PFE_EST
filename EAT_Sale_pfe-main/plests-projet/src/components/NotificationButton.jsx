import React, { useEffect, useState } from "react";
import { getStudentNotifs, markAsRead } from "../services/api";
import "../styles/NotificationButton.css";

const NotificationButton = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Vous devez d'abord vous connecter.");
        setLoading(false);
        return;
      }

      try {
        const data = await getStudentNotifs(token);
        const safeData = Array.isArray(data) ? data : [];
        setNotifications(safeData);
      } catch (err) {
        console.error("Erreur lors du chargement des notifications :", err);
        setError("Erreur lors de la récupération des notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifs();
  }, []);

  const handleRead = async (notifId) => {
    const token = localStorage.getItem("token");
    if (!notifId || !token) return;

    try {
      await markAsRead(notifId, token);
      setNotifications((prev) =>
        prev.filter((n) => (n.notification_id || n.id) !== notifId)
      );
    } catch (err) {
      console.error("Erreur lors du marquage comme lu :", err);
    }
  };

  const simulateRelativeTime = () => {
    const minutes = Math.floor(Math.random() * 10) + 1;
    return `il y a ${minutes} minute${minutes > 1 ? "s" : ""}`;
  };

  if (loading) {
    return (
      <div className="notification-popup">
        <p className="loading-message">
          <i className="fas fa-spinner fa-spin"></i> Chargement...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notification-popup">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="notification-popup">
      {notifications.length === 0 ? (
        <div className="info-message">
          <strong>Pas de nouvelles notifications</strong>
          <p>Vous n'avez pas encore reçu de notifications.</p>
        </div>
      ) : (
        notifications.map((notif, index) => {
          const notifId = notif.notification_id || notif.id || index;
          const notifMessage = notif.message || "Notification sans contenu";

          return (
            <div
              key={notifId}
              className="notification-item"
              style={{ cursor: "pointer" }}
            >
              <div className="notif_into_1">
                <span>{notifMessage}</span>
                <br />
                <small className="notif-time">{simulateRelativeTime()}</small>
              </div>

              <div className="notif_into_2">
                <button
                  className="mark-as-read-btn"
                  onClick={() => handleRead(notifId)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default NotificationButton;