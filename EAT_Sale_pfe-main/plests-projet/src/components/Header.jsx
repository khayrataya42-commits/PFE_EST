import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import estLogo from "../assets/OIP.jpg";
import { getStudentNotifs, get_users } from "../services/api";
import "../styles/Header.css";
import NotificationButton from "./NotificationButton";

function Header() {
  const [user, setUser] = useState(null);
  const [adminData, setAdminData] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Erreur de parsing des données utilisateur :", e);
      }
    }
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const data = await get_users(token);
        console.log("Données utilisateur reçues :", data);
        setAdminData(data);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des données utilisateur :",
          error
        );
        setError("Erreur lors de la récupération des données utilisateur.");
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchNotifs = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await getStudentNotifs(token);
        const safeData = Array.isArray(data) ? data : [];
        setNotifications(safeData);

        const unread = safeData.filter((notif) => !notif.read).length;
        setUnreadCount(unread);
      } catch (error) {
        console.error("Erreur lors du chargement des notifications", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifs();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    setUser(null);
    setAdminData(null);
    setNotifications([]);
    setUnreadCount(0);

    navigate("/login");
  };

  const toggleNotifications = () => {
    setShowNotifications((prev) => !prev);

    if (!showNotifications) {
      setUnreadCount(0);
    }
  };

  const displayName =
    adminData?.username ||
    user?.firstname ||
    user?.first_name ||
    user?.username ||
    "Utilisateur";

  const displayRole =
    adminData?.role || localStorage.getItem("role") || "";

  return (
    <header className="header">
      <div className="left-header">
        <img src={estLogo} alt="EST Salé Logo" />
      </div>

      {user ? (
        <div className="user-info">
          <img
            src={
              adminData?.profile_picture ||
              "https://cdn-icons-png.flaticon.com/512/149/149071.png"
            }
            alt={displayName}
            className="profile-image"
          />

          <div className="user-details">
            <span className="user-name">{displayName}</span>
            <span className="user-role">{displayRole}</span>
          </div>

          <div className="header-actions">
            <button
              className="notification-button"
              onClick={toggleNotifications}
              type="button"
            >
              <i className="fas fa-bell"></i>
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {showNotifications && <NotificationButton />}

            <button
              className="logout-button"
              onClick={handleLogout}
              type="button"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      ) : (
        <div className="login-section">
          <span className="email">ests@um5.ac.ma</span>
          <Link to="/login">
            <button className="button" type="button">
              Se connecter
            </button>
          </Link>
        </div>
      )}
    </header>
  );
}

export default Header;