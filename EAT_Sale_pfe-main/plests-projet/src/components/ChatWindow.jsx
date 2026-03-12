// import React from "react";
// import { useNavigate } from "react-router-dom";
// import "../styles/ChatWindow.css";

// function ChatWindow({ onClose }) {
//   const navigate = useNavigate();

//   return (
//     <div className="chat-window">
//       {/* Section contenant le bouton de fermeture et la section de bienvenue */}
//       <div className="chat-header">
//         {/* Section de bienvenue */}
//         <div className="chat-welcome">
//           <h3>Bienvenue</h3>
//           <p>Nous sommes là pour vous aider</p>
//         </div>
//         {/* Bouton de fermeture */}
//         <button className="close-button" onClick={onClose}>
//           ×
//         </button>
//       </div>

//       {/* Section des options de chat */}
//       <div className="chat-options">
//         {/* Option : Lancer une conversation */}
//         <div className="chat-option">
//           <p>Lancer une conversation</p>
//           <button onClick={() => navigate("/chat")}>
//             Envoyez-nous un message
//           </button>
//         </div>

//         {/* Option : Rechercher un sujet */}
//         <div className="chat-option">
//           <p>Que recherchez-vous ?</p>
//           <button onClick={() => navigate("/search")}>
//             Rechercher un sujet ...
//           </button>
//         </div>

//         {/* Option : Rejoindre la co-navigation */}
//         <div className="chat-option">
//           <p>Parcourez cette page avec nous</p>
//           <button onClick={() => navigate("/co-navigation")}>
//             Rejoindre la co-navigation
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ChatWindow;

import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ChatWindow.css";

function ChatWindow({ onClose }) {
  const navigate = useNavigate();

  return (
    <div className="chat-window">
      {/* Section contenant le bouton de fermeture et la section de bienvenue */}
      <div className="chat-header">
        {/* Section de bienvenue */}
        <div className="chat-welcome">
          <h3>Bienvenue</h3>
          <p>Nous sommes là pour vous aider</p>
        </div>
        {/* Bouton de fermeture */}
        <button className="close-button" onClick={onClose}>
          ×
        </button>
      </div>

      {/* Section des options de chat */}
      <div className="chat-options">
        {/* Option : Lancer une conversation */}
        <div className="chat-option">
          <p>Lancer une conversation</p>
          <button onClick={() => navigate("/assistance/chat-messager")}>
            Envoyez-nous un message
          </button>
        </div>

        {/* Option : Rechercher un sujet */}
        <div className="chat-option">
          <p>Que recherchez-vous ?</p>
          <button onClick={() => navigate("/assistance/chat-search")}>
            Rechercher un sujet ...
          </button>
        </div>

        {/* Option : Rejoindre la co-navigation */}
        <div className="chat-option">
          <p>Parcourez cette page avec nous</p>
          <button onClick={() => navigate("/assistance/chat-co-navigation")}>
            Rejoindre la co-navigation
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatWindow;
