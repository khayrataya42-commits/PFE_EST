// import { useState, useEffect } from "react";
// import Layout from "../components/Layout";
// import { get_teacher_by_department } from "../services/api";
// import "../styles/CoursesPage.css";

// import CourseListRemove from "../components/CourseListRemove";
// import AddCourses from "../components/AddCourses";

// const CoursesPage = () => {
//   const [teachers, setTeachers] = useState([]);
//   const [selectedDept, setSelectedDept] = useState("");
//   const [role, setRole] = useState(null);
//   const [user, setUser] = useState(null);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const storedRole = localStorage.getItem("role");
//     const storedUser = JSON.parse(localStorage.getItem("user"));

//     if (storedUser) {
//       setUser(storedUser);
//       setRole(storedRole || storedUser?.roles?.[0] || null);
//     } else {
//       console.warn("Aucune donnée utilisateur trouvée dans localStorage.");
//     }
//   }, []);

//   const departments = ["Informatique", "Génie Civil", "Génie Électrique"];

//   const handleClick = async (dept) => {
//     const token = localStorage.getItem("token");
//     if (!token) {
//       alert("Veuillez vous connecter.");
//       return;
//     }

//     setSelectedDept(dept);
//     try {
//       const response = await get_teacher_by_department(dept, token);
//       console.log("Réponse de l'API :", response);

//       // Vérifie si response.data est un tableau et met à jour l'état teachers
//       if (Array.isArray(response)) {
//         setTeachers(response); // Mettre directement les professeurs dans l'état
//       } else {
//         console.error(
//           "Les données des professeurs ne sont pas dans le format attendu."
//         );
//       }
//     } catch (error) {
//       console.error("Erreur lors du chargement des professeurs :", error);
//     }
//   };

//   if (!user) return <p>Chargement...</p>;

//   return (
//     <Layout>
//       <div className="courses-page">
//         <h1>
//           Bonjour {user.username}, rôle : {role}
//         </h1>
//         <h2>Gestion des Cours</h2>

//         {/* Section des départements */}
//         <div className="departments">
//           <h3>Sélectionnez un département :</h3>
//           {departments.map((dept) => (
//             <button
//               key={dept}
//               onClick={() => handleClick(dept)}
//               className="dept-button"
//             >
//               {dept}
//             </button>
//           ))}
//         </div>

//         {/* Composants des cours */}
//         <AddCourses teachers={teachers} />
//         <hr />
//         <CourseListRemove />
//       </div>
//     </Layout>
//   );
// };

// export default CoursesPage;

import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { get_teacher_by_department } from "../services/api";
import "../styles/CoursesPage.css";

import CourseListRemove from "../components/CourseListRemove";
import AddCourses from "../components/AddCourses";

const CoursesPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [showCourseList, setShowCourseList] = useState(false); // État pour contrôler l'affichage du composant CourseListRemove

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedUser = JSON.parse(localStorage.getItem("user"));

    if (storedUser) {
      setUser(storedUser);
      setRole(storedRole || storedUser?.roles?.[0] || null);
    } else {
      console.warn("Aucune donnée utilisateur trouvée dans localStorage.");
    }
  }, []);

  const departments = [
    "Génie Informatique",
    "Génie Électrique",
    "Génie Civil",
    "Génie Mécanique",
    "Techniques de Management",
    "Techniques de Commercialisation",
    "Techniques de Développement",
    "Génie des Procédés Industriels",
    "Réseaux et Télécommunications",
  ];
  const handleClick = async (dept) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Veuillez vous connecter.");
      return;
    }

    setSelectedDept(dept);
    try {
      const response = await get_teacher_by_department(dept, token);
      console.log("Réponse de l'API :", response);

      // Vérifie si response.data est un tableau et met à jour l'état teachers
      if (Array.isArray(response)) {
        setTeachers(response); // Mettre directement les professeurs dans l'état
      } else {
        console.error(
          "Les données des professeurs ne sont pas dans le format attendu."
        );
      }
    } catch (error) {
      console.error("Erreur lors du chargement des professeurs :", error);
    }
  };

  const handleShowCourseList = () => {
    setShowCourseList(true); // Lorsque le bouton est cliqué, on affiche la liste des cours
  };

  const handleBackToCourses = () => {
    setShowCourseList(false); // Lorsque le bouton retour est cliqué, on revient à la page précédente
  };

  if (!user) return <p>Chargement...</p>;

  return (
    <Layout>
      {/* Si showCourseList est true, on affiche CourseListRemove */}
      {showCourseList ? (
        <div>
          <button onClick={handleBackToCourses} className="back-btn">
            <i className="fas fa-arrow-left"></i> Retour à la gestion des cours
          </button>
          <CourseListRemove />
        </div>
      ) : (
        <div className="courses-page">
          <h2>Gestion des Cours</h2>

          {/* Section des départements */}
          <div className="departments">
            <h3>Sélectionnez un département :</h3>
            <div className="dept_into">
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => handleClick(dept)}
                  className="dept-button"
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Composants des cours */}
          <AddCourses teachers={teachers} />

          {/* Bouton pour afficher la liste des cours */}
          <button onClick={handleShowCourseList} className="show-courses-btn">
            Afficher la liste des cours
          </button>
        </div>
      )}
    </Layout>
  );
};

export default CoursesPage;
