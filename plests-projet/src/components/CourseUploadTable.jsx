// import React, { useState, useEffect } from "react";
// import FileUploader from "../components/FileUploader";
// import FileList from "../components/FileList";
// import "../styles/CourseUploadTable.css"; // Ajoute un style simple
// import { getCourses_teacher } from "../services/api"; // Assure-toi que l'API est correctement configurée

// const CourseUploadTable = () => {
//   const [courses, setCourses] = useState([]);
//   const [error, setError] = useState(null);
//   const userRole = (localStorage.getItem("role") || "").toLowerCase();
//   console.log("🎓 Rôle récupéré depuis le localStorage :", userRole);

//   // Appel à l'API pour récupérer les cours du professeur
//   useEffect(() => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       const fetchCourses = async () => {
//         try {
//           const response = await getCourses_teacher(token); // Passer le token ici
//           setCourses(response.data); // Assurer que la réponse contient bien les cours
//         } catch (err) {
//           setError("Erreur lors de la récupération des cours.");
//           console.error(err);
//         }
//       };
//       fetchCourses(); // Appeler la fonction pour récupérer les cours
//     }
//   }, []); // Le useEffect se déclenche au montage du composant

//   if (error) {
//     return <div>{error}</div>;
//   }

//   const [view, setView] = useState("table"); // 'table' | 'upload' | 'list'
//   const [activeUploadCourseId, setActiveUploadCourseId] = useState(null);
//   const [showFileList, setShowFileList] = useState(false); // Nouvel état pour afficher ou masquer la liste des fichiers

//   const toggleUploader = (courseId) => {
//     if (view === "upload" && activeUploadCourseId === courseId) {
//       // Annuler l’upload
//       setView("table");
//       setActiveUploadCourseId(null);
//     } else {
//       // Activer l’upload
//       setActiveUploadCourseId(courseId);
//       setView("upload");
//     }
//   };

//   const handleToggleFileList = () => {
//     if (view === "list") {
//       setView("table");
//     } else {
//       setView("list");
//     }
//   };

//   if (view === "upload") {
//     return (
//       <div>
//         <button class="back-button" onClick={() => setView("table")}>
//           {" "}
//           <i class="fas fa-arrow-left"></i> Retour
//         </button>
//         <FileUploader courseId={activeUploadCourseId} />
//       </div>
//     );
//   }

//   if (view === "list") {
//     return (
//       <div>
//         <button class="back-button" onClick={() => setView("table")}>
//           <i class="fas fa-arrow-left"></i> Retour
//         </button>
//         <FileList userRole="Teacher" />
//       </div>
//     );
//   }

//   return (
//     <div className="course-table-container">
//       <h2>Tableau des cours et fichiers</h2>
//       <div className="course-table-wrapper">
//         <table className="course-table">
//           <thead>
//             <tr>
//               <th>Nom du cours</th>
//               <th>Description</th>
//               <th>Ajouter fichier</th>
//             </tr>
//           </thead>
//           <tbody>
//             {courses.map((course) => (
//               <tr key={course.course_id}>
//                 <td>{course.title}</td>
//                 <td>{course.description}</td>
//                 <td>
//                   <button
//                     className="upload-toggle-btn"
//                     onClick={() => toggleUploader(course.course_id)}
//                   >
//                     {view === "upload" &&
//                     activeUploadCourseId === course.course_id
//                       ? "Annuler"
//                       : "Ajouter un fichier"}
//                   </button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Déplacer le bouton "Voir les fichiers" sous le tableau */}
//       <div className="file-list-toggle">
//         <button onClick={handleToggleFileList}>
//           {view === "list" ? "Masquer les fichiers" : "Voir les fichiers"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default CourseUploadTable;

import React, { useState, useEffect } from "react";
import FileUploader from "../components/FileUploader";
import FileList from "../components/FileList";
import "../styles/CourseUploadTable.css";
import { getCourses_teacher } from "../services/api";

const CourseUploadTable = () => {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // 👈 Nouveau

  const userRole = (localStorage.getItem("role") || "").toLowerCase();
  const storedUser = JSON.parse(localStorage.getItem("user"));
  console.log(storedUser.username);
  const [view, setView] = useState("table");
  const [activeUploadCourseId, setActiveUploadCourseId] = useState(null);
  const [showFileList, setShowFileList] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const fetchCourses = async () => {
        try {
          const response = await getCourses_teacher(token);
          setCourses(response.data);
        } catch (err) {
          setError("Erreur lors de la récupération des cours.");
          console.error(err);
        } finally {
          setLoading(false); // 👈 Met fin au chargement dans tous les cas
        }
      };
      fetchCourses();
    }
  }, []);

  const toggleUploader = (courseId) => {
    if (view === "upload" && activeUploadCourseId === courseId) {
      setView("table");
      setActiveUploadCourseId(null);
    } else {
      setActiveUploadCourseId(courseId);
      setView("upload");
    }
  };

  const handleToggleFileList = () => {
    setView(view === "list" ? "table" : "list");
  };

  if (view === "upload") {
    return (
      <div>
        <button className="back-button" onClick={() => setView("table")}>
          <i className="fas fa-arrow-left"></i> Retour
        </button>
        <FileUploader courseId={activeUploadCourseId} />
      </div>
    );
  }

  if (view === "list") {
    return (
      <div>
        <button className="back-button" onClick={() => setView("table")}>
          <i className="fas fa-arrow-left"></i> Retour
        </button>
        <FileList userRole="Teacher" />
      </div>
    );
  }

  return (
    <div className="course-table-container">
      <h2>Tableau des cours et fichiers</h2>
      <div className="course-table-wrapper">
        <table className="course-table">
          <thead>
            <tr>
              <th>Nom du cours</th>
              <th>Description</th>
              <th>Professeur</th>
              <th>Ajouter fichier</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="loading-message">
                  <i className="fas fa-spinner fa-spin"></i> Chargement...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="4" className="error-message">
                  {error}
                </td>
              </tr>
            ) : courses.length === 0 ? (
              <tr>
                <td colSpan="4">Aucun cours trouvé.</td>
              </tr>
            ) : (
              courses.map((course) => (
                <tr key={course.course_id}>
                  <td>{course.title}</td>
                  <td>{course.description}</td>
                  <td>{storedUser.username || "Inconnu"}</td>
                  <td>
                    <button
                      className="btn-10"
                      onClick={() => toggleUploader(course.course_id)}
                    >
                      {" "}
                      <i className="fas fa-plus-circle"></i>
                      {view === "upload" &&
                      activeUploadCourseId === course.course_id
                        ? "Annuler"
                        : "Ajouter un fichier"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="file-list-toggle">
        <button onClick={handleToggleFileList}>
          {view === "list" ? "Masquer les fichiers" : "Voir les fichiers"}
        </button>
      </div>
    </div>
  );
};

export default CourseUploadTable;
