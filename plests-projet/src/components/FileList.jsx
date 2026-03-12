// import React, { useEffect, useState } from "react";
// import { getFile_teacher } from "../services/api";
// import "../styles/FileList.css";

// const FileList = () => {
//   const [files, setFiles] = useState([]);
//   const [error, setError] = useState("");
//   const [isLoading, setIsLoading] = useState(true); // ✅ ajout

//   const token = localStorage.getItem("token");
//   const user = JSON.parse(localStorage.getItem("user"));
//   const user_id = user?.id;

//   useEffect(() => {
//     const fetchFiles = async () => {
//       try {
//         const response = await getFile_teacher(user.id, token);
//         setFiles(response.data); // ✅ fichiers chargés
//       } catch (err) {
//         console.error("Erreur lors du chargement des fichiers :", err);
//         setError("Erreur lors du chargement des fichiers.");
//       } finally {
//         setIsLoading(false); // ✅ on arrête le loading
//       }
//     };

//     fetchFiles();
//   }, []);

//   return (
//     <div className="file-list">
//       <h3>
//         Fichiers disponibles {user.id} - {user.firstname}
//       </h3>

//       {isLoading ? (
//         <p>Chargement des fichiers...</p> // ✅ Affiche un message de chargement
//       ) : error ? (
//         <p>{error}</p>
//       ) : files.length > 0 ? (
//         <ul>
//           {files.map((file, idx) => (
//             <li key={idx}>
//               <a href={`http://localhost:8002/files/${file.file_id}`} download>
//                 {file.file_name}
//               </a>
//             </li>
//           ))}
//         </ul>
//       ) : (
//         <p>Aucun fichier trouvé.</p>
//       )}
//     </div>
//   );
// };

// export default FileList;

// import React, { useState, useEffect } from "react";
// import { getFile_teacher } from "../services/api"; // Appel à l'API pour récupérer la liste des fichiers
// import "../styles/FileList.css";
// import { data } from "react-router-dom";

// const FileList = () => {
//   const [files, setFiles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchFiles = async () => {
//       const token = localStorage.getItem("token");
//       if (!token) {
//         setError("Vous devez d'abord vous connecter.");
//         setLoading(false);
//         return;
//       }

//       try {
//         const response = await getFile_teacher(token); // Vérifiez que cette fonction utilise la bonne URL

//         setFiles(response.data); // Assurez-vous que response.data contient bien la liste
//       } catch (err) {
//         console.error("Erreur lors de la récupération des fichiers :", err);
//         setError("Impossible de charger les fichiers.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFiles();
//   }, []);

//   return (
// <div className="file-list">
//   <h2>Liste des fichiers</h2>
//   {loading ? (
//     <p>Chargement...</p>
//   ) : error ? (
//     <p className="error">{error}</p>
//   ) : files.length > 0 ? (
//     <ul>
//       {files.map((file) => (
//         <li key={file.file_id}>
//           <a
//             href={`/${file.file_url}`}
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             {file.file_name}
//           </a>{" "}
//           <span>{new Date(file.uploaded_at).toLocaleString()}</span>
//         </li>
//       ))}
//     </ul>
//   ) : (
//     <p>Aucun fichier trouvé.</p>
//   )}
// </div>
//   );
// };

// export default FileList;

// import React, { useState, useEffect } from "react";
// import {
//   getFile_teacher,
//   get_files_courses_students,
//   downloadFile,
// } from "../services/api";
// import "../styles/FileList.css";

// const FileList = () => {
//   const [files, setFiles] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const fetchFiles = async () => {
//       const token = localStorage.getItem("token");
//       const role = localStorage.getItem("role");

//       // Essayer de parser l'objet utilisateur
//       let user = null;
//       try {
//         const userString = localStorage.getItem("user");
//         if (userString) {
//           user = JSON.parse(userString);
//         }
//       } catch (e) {
//         console.error("❌ Erreur de parsing JSON utilisateur :", e);
//       }

//       console.log("🔐 Token récupéré :", token);
//       console.log("👤 Utilisateur :", user);
//       console.log("🎓 Rôle utilisateur :", role);

//       if (!token || !role) {
//         setError("Vous devez d'abord vous connecter.");
//         setLoading(false);
//         return;
//       }

//       try {
//         let response;

//         if (role === "Teacher") {
//           console.log("📥 Récupération des fichiers pour l'enseignant...");
//           response = await getFile_teacher(token);
//         } else if (role === "student") {
//           console.log(
//             "📥 Récupération des fichiers pour l'étudiant connecté..."
//           );
//           response = await get_files_courses_students(token);
//         } else {
//           setError("Rôle utilisateur non reconnu.");
//           setLoading(false);
//           return;
//         }

//         console.log("📂 Fichiers récupérés :", response?.data);
//         setFiles(response?.data || []);
//       } catch (err) {
//         console.error("❌ Erreur lors de la récupération des fichiers :", err);
//         setError("Impossible de charger les fichiers.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFiles();
//   }, []);

// const handleDownload = (fileId, fileName) => {
//   console.log(
//     `Téléchargement du fichier avec ID: ${fileId} et Nom: ${fileName}`
//   );
//   const token = localStorage.getItem("token");
//   downloadFile(fileId, fileName, token); // Appel de la fonction de téléchargement
// };

//   // Gestion des informations spécifiques aux enseignants
//   const renderTeacherInfo = () => {
//     const user = JSON.parse(localStorage.getItem("user"));
//     return (
//       <div className="teacher-info">
//         <h3>Professeur : {user?.name}</h3>
//         <p>Département : {user?.department}</p>
//       </div>
//     );
//   };

//   return (
//     <div className="file-list">
//       <h2>Liste des fichiers</h2>
//       {loading ? (
//         <p>Chargement...</p>
//       ) : error ? (
//         <p className="error">{error}</p>
//       ) : files.length > 0 ? (
//         <div>
//           {localStorage.getItem("role") === "Teacher" && renderTeacherInfo()}{" "}
//           {/* Affiche les infos du prof si rôle teacher */}
//           {localStorage.getItem("role") === "student" && (
//             <table className="file-table">
//               <thead>
//                 <tr>
//                   <th>Nom du fichier</th>
//                   <th>Date de téléchargement</th>
//                   <th>Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {files.map((file) => (
//                   <tr key={file.file_id}>
//                     <td>{file.file_name}</td>
//                     <td>
//                       {file.uploaded_at &&
//                         new Date(file.uploaded_at).toLocaleString()}
//                     </td>
//                     <td>
//                       <button
//                         onClick={() =>
//                           handleDownload(file.file_id, file.file_name)
//                         }
//                       >
//                         Télécharger
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           )}
//           {localStorage.getItem("role") === "Teacher" && !files.length && (
//             <p>Aucun fichier disponible pour cet enseignant.</p>
//           )}
//         </div>
//       ) : (
//         <p>Aucun fichier trouvé.</p>
//       )}
//     </div>
//   );
// };

// export default FileList;

import React, { useState, useEffect } from "react";
import {
  getFile_teacher,
  get_files_courses_students,
  downloadFile,
} from "../services/api";
import "../styles/FileList.css";

const FileList = ({ userRole }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFiles = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Vous devez d'abord vous connecter.");
        setLoading(false);
        return;
      }

      try {
        let response;

        // Utilisation du prop userRole
        if (userRole === "Teacher") {
          console.log("📥 Récupération des fichiers pour l'enseignant...");
          response = await getFile_teacher(token);
        } else if (userRole === "student") {
          console.log("📥 Récupération des fichiers pour l'étudiant...");
          response = await get_files_courses_students(token);
        } else {
          setError("Rôle utilisateur non reconnu.");
          setLoading(false);
          return;
        }

        console.log("📂 Fichiers récupérés :", response?.data);
        setFiles(response?.data || []);
      } catch (err) {
        console.error("❌ Erreur lors de la récupération des fichiers :", err);
        setError("Impossible de charger les fichiers.");
      } finally {
        setLoading(false);
      }
    };

    fetchFiles();
  }, [userRole]); // Déclenche une nouvelle récupération des fichiers si le rôle change

  const handleDownload = (fileId, fileName) => {
    console.log(
      `Téléchargement du fichier avec ID: ${fileId} et Nom: ${fileName}`
    );
    const token = localStorage.getItem("token");
    downloadFile(fileId, fileName, token); // Appel de la fonction de téléchargement
  };

  // Gestion des informations spécifiques aux enseignants
  const renderTeacherInfo = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return (
      <div>
        {loading ? (
          <p className="loading-message">
            <i className="fas fa-spinner fa-spin"></i> Chargement...
          </p>
        ) : error ? (
          <p className="error">{error}</p>
        ) : files.length > 0 ? (
          <ul>
            {files.map((file) => (
              <li key={file.file_id}>
                <a
                  href={`/${file.file_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {file.file_name}
                </a>{" "}
                <span>{new Date(file.uploaded_at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p>Aucun fichier trouvé.</p>
        )}
      </div>
    );
  };

  return (
    <div className="file-list">
      <h2>Liste des fichiers</h2>
      {loading ? (
        <p className="loading-message">
          <i className="fas fa-spinner fa-spin"></i> Chargement...
        </p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : files.length > 0 ? (
        <div>
          {userRole === "Teacher" && renderTeacherInfo()}{" "}
          {/* Affiche les infos du prof si rôle teacher */}
          {userRole === "student" && (
            <table className="file-table">
              <thead>
                <tr>
                  <th>Nom du fichier</th>
                  <th>Date de téléchargement</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {files.map((file) => (
                  <tr key={file.file_id}>
                    <td>{file.file_name}</td>
                    <td>
                      {file.uploaded_at &&
                        new Date(file.uploaded_at).toLocaleString()}
                    </td>
                    <td>
                      <button
                        onClick={() =>
                          handleDownload(file.file_id, file.file_name)
                        }
                      >
                        <i class="fas fa-download"></i>Télécharger
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {userRole === "Teacher" && !files.length && (
            <p>Aucun fichier disponible pour cet enseignant.</p>
          )}
        </div>
      ) : (
        <p>Aucun fichier trouvé.</p>
      )}
    </div>
  );
};

export default FileList;
