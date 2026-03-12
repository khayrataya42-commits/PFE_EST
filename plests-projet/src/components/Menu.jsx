import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/Menu.css";
import ChatButton from "./ChatButton";

const Menu = ({ role }) => {
  const [openMenu, setOpenMenu] = useState(null);

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const normalizedRole = (role || "").toLowerCase();

  const isStudent = normalizedRole === "student";
  const isTeacher = normalizedRole === "teacher";
  const isAdmin =
    normalizedRole === "admin" || normalizedRole === "administrator";

  return (
    <div className="menu-container">
      <nav className="menu">
        <ul>

          {/* Accueil */}
          <li>
            <Link to="/accueil">
              <i className="fas fa-home"></i> Accueil
            </Link>
          </li>

          {/* Scolarité */}
          {(isStudent || isTeacher) && (
            <li onClick={() => toggleMenu("scolarite")}>
              <span>
                <i className="fas fa-user-graduate"></i> Scolarité
                <i
                  className={`fas ${
                    openMenu === "scolarite"
                      ? "fa-chevron-down"
                      : "fa-chevron-right"
                  }`}
                ></i>
              </span>

              {openMenu === "scolarite" && (
                <ul>
                  <li>
                    <Link to="/scolarite/inscription">Inscription</Link>
                  </li>
                  <li>
                    <Link to="/scolarite/notes">Mes Notes</Link>
                  </li>
                </ul>
              )}
            </li>
          )}

          {/* Examens */}
          {(isStudent || isTeacher) && (
            <li onClick={() => toggleMenu("examens")}>
              <span>
                <i className="fas fa-file-alt"></i> Examens
                <i
                  className={`fas ${
                    openMenu === "examens"
                      ? "fa-chevron-down"
                      : "fa-chevron-right"
                  }`}
                ></i>
              </span>

              {openMenu === "examens" && (
                <ul>
                  <li>
                    <Link to="/examens/planification">Planification</Link>
                  </li>
                  <li>
                    <Link to="/examens/resultats">Résultats</Link>
                  </li>
                </ul>
              )}
            </li>
          )}

          {/* Outils */}
          {(isStudent || isTeacher) && (
            <li onClick={() => toggleMenu("outils")}>
              <span>
                <i className="fas fa-toolbox"></i> Outils
                <i
                  className={`fas ${
                    openMenu === "outils"
                      ? "fa-chevron-down"
                      : "fa-chevron-right"
                  }`}
                ></i>
              </span>

              {openMenu === "outils" && (
                <ul>
                  <li>
                    <Link to="/outils-pedagogiques">
                      <i className="fas fa-book"></i> Outils Pédagogiques
                    </Link>
                  </li>

                  <li>
                    <Link to="/outils-collaboratifs">
                      <i className="fas fa-users"></i> Outils Collaboratifs
                    </Link>
                  </li>

                  {isTeacher && (
                    <li>
                      <Link to="/upload">
                        <i className="fas fa-upload"></i> Télécharger un fichier
                      </Link>
                    </li>
                  )}
                </ul>
              )}
            </li>
          )}

          {/* Assistance */}
          <li onClick={() => toggleMenu("assistance")}>
            <span>
              <i className="fas fa-life-ring"></i> Assistance
              <i
                className={`fas ${
                  openMenu === "assistance"
                    ? "fa-chevron-down"
                    : "fa-chevron-right"
                }`}
              ></i>
            </span>

            {openMenu === "assistance" && (
              <ul>
                <li>
                  <Link to="/assistance/chat-messager">
                    <i className="fas fa-comment-dots"></i> Chat Messager
                  </Link>
                </li>

                <li>
                  <Link to="/assistance/chat-search">
                    <i className="fas fa-search"></i> Chat Search
                  </Link>
                </li>

                <li>
                  <Link to="/assistance/chat-co-navigation">
                    <i className="fas fa-share-alt"></i> Co-navigation
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Calendrier */}
          {(isStudent || isTeacher || isAdmin) && (
            <li onClick={() => toggleMenu("calendrier")}>
              <span>
                <i className="fas fa-calendar-alt"></i> Calendrier
                <i
                  className={`fas ${
                    openMenu === "calendrier"
                      ? "fa-chevron-down"
                      : "fa-chevron-right"
                  }`}
                ></i>
              </span>

              {openMenu === "calendrier" && (
                <ul>
                  <li>
                    <Link to="/calendrier">
                      <i className="fas fa-calendar-check"></i> Événements
                    </Link>
                  </li>

                  <li>
                    <Link to="/emploi-du-temps">
                      <i className="fas fa-table"></i> Emploi du temps
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          )}

          {/* Teacher */}
          {isTeacher && (
            <>
              <li>
                <Link to="/cours">
                  <i className="fas fa-chalkboard-teacher"></i> Mes Cours
                </Link>
              </li>

              <li>
                <Link to="/corrections">
                  <i className="fas fa-check-circle"></i> Corrections
                </Link>
              </li>
            </>
          )}

          {/* Student */}
          {isStudent && (
            <li onClick={() => toggleMenu("fichiers")}>
              <span>
                <i className="fas fa-file-alt"></i> Mes Fichiers Reçus
                <i
                  className={`fas ${
                    openMenu === "fichiers"
                      ? "fa-chevron-down"
                      : "fa-chevron-right"
                  }`}
                ></i>
              </span>

              {openMenu === "fichiers" && (
                <ul>
                  <li>
                    <Link to="/fichiers-reçus">
                      <i className="fas fa-download"></i> Fichiers reçus
                    </Link>
                  </li>
                </ul>
              )}
            </li>
          )}

          {/* Admin */}
          {isAdmin && (
            <>
              <li>
                <Link to="/enrollment">
                  <i className="fas fa-user-cog"></i> Gestion Enrollment
                </Link>
              </li>

              <li>
                <Link to="/gestion">
                  <i className="fas fa-user-tie"></i> Gestion
                  Enseignants-Étudiants
                </Link>
              </li>

              <li>
                <Link to="/courses">
                  <i className="fas fa-book-open"></i> Gestion Cours
                </Link>
              </li>

              <li>
                <Link to="/admin/demandes">
                  <i className="fas fa-tasks"></i> Gestion des demandes
                </Link>
              </li>
            </>
          )}

        </ul>
      </nav>

      <ChatButton />
    </div>
  );
};

export default Menu;