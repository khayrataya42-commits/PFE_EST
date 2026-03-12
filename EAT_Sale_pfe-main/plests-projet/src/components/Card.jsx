// import React from "react";
// import "../styles/Card.css";

// const Card = ({ title, description }) => {
//   return (
//     <div className="card">
//       {/* Première partie : Titre et sélection */}
//       <div className="card-header">
//         <h3>{title}</h3>
//         <select className="options-select">
//           <option value="">Sélectionner une option</option>
//           <option value="option1">Option 1</option>
//           <option value="option2">Option 2</option>
//           <option value="option3">Option 3</option>
//         </select>
//       </div>

//       {/* Deuxième partie : Bouton ou icône */}
//       <div className="card-body">
//         <button className="icon-button">🔧</button> {/* Bouton avec icône */}
//       </div>

//       {/* Troisième partie : Description */}
//       <div className="card-footer">
//         <p>{description}</p>
//       </div>
//     </div>
//   );
// };

// export default Card;

import React from "react";
import "../styles/Card.css";

const Card = ({ title, description, link, icon }) => {
  return (
    <div className="card">
      {/* Première partie : Titre et sélection */}
      <div className="card-header">
        <h3>{title}</h3>
        <select className="options-select">
          <option value="">Sélectionner une option</option>
          <option value="option1">Option 1</option>
          <option value="option2">Option 2</option>
          <option value="option3">Option 3</option>
        </select>
      </div>

      {/* Deuxième partie : Bouton ou icône */}
      <div className="card-body">
        <a href={link} target="_blank" rel="noopener noreferrer">
          {/* Affichage de l'icône Font Awesome */}
          <i className={icon}></i>
        </a>
      </div>

      {/* Troisième partie : Description */}
      <div className="card-footer">
        <p>{description}</p>
      </div>
    </div>
  );
};

export default Card;
