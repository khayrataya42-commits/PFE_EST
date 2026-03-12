// import React, { useState, useEffect } from "react";
// import "../styles/ThemeToggle.css";

// function ThemeToggle() {
//   const [darkMode, setDarkMode] = useState(() => {
//     return localStorage.getItem("theme") === "dark";
//   });

//   useEffect(() => {
//     if (darkMode) {
//       document.body.classList.add("dark-mode");
//       document.body.classList.remove("light-mode");
//       localStorage.setItem("theme", "dark");
//     } else {
//       document.body.classList.add("light-mode");
//       document.body.classList.remove("dark-mode");
//       localStorage.setItem("theme", "light");
//     }
//   }, [darkMode]);

//   return (
//     <button
//       className="theme-toggle-button"
//       onClick={() => setDarkMode(!darkMode)}
//     >
//       <i className={darkMode ? "fas fa-sun" : "fas fa-moon"}></i>{" "}
//       {/* Icône FontAwesome */}
//     </button>
//   );
// }

// export default ThemeToggle;

import React, { useState, useEffect } from "react";
import "../styles/ThemeToggle.css";

function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
      document.body.classList.remove("light-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.add("light-mode");
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <button
      className="theme-toggle-button"
      onClick={() => setDarkMode(!darkMode)}
    >
      <i className={darkMode ? "fas fa-sun" : "fas fa-moon"}></i>{" "}
      {/* Icône FontAwesome */}
    </button>
  );
}

export default ThemeToggle;
