import React, { useState } from "react";
import { createEvent } from "../services/api";
import "../styles/AddEventForm.css";

const AddEventForm = () => {
  const [event, setEvent] = useState({
    title: "",
    description: "",
    location: "",
    event_type: "",
    start_time: "",
    end_time: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setEvent({ ...event, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérifiez si le token est présent dans le localStorage
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Veuillez d'abord vous connecter.");
      return;
    }

    try {
      // Appeler la fonction createEvent en lui passant les données et le token
      const res = await createEvent(event, token);

      // Afficher le message de succès
      setMessage(`Événement "${res.data.title}" ajouté avec succès !`);
      setTimeout(() => setMessage(""), 3000);
      // Réinitialiser le formulaire
      setEvent({
        title: "",
        description: "",
        location: "",
        event_type: "",
        start_time: "",
        end_time: "",
      });
    } catch (err) {
      console.error(err);
      setMessage("Erreur lors de l’ajout de l’événement.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <form className="add-event-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-col">
          <input
            type="text"
            name="title"
            value={event.title}
            onChange={handleChange}
            placeholder="Titre"
            required
          />
          <textarea
            name="description"
            value={event.description}
            onChange={handleChange}
            placeholder="Description"
            required
          />
        </div>

        <div className="form-col">
          <input
            type="text"
            name="location"
            value={event.location}
            onChange={handleChange}
            placeholder="Lieu"
            required
          />
          <input
            type="text"
            name="event_type"
            value={event.event_type}
            onChange={handleChange}
            placeholder="Type d'événement"
            required
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-col">
          <input
            type="datetime-local"
            name="start_time"
            value={event.start_time}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-col">
          <input
            type="datetime-local"
            name="end_time"
            value={event.end_time}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <button type="submit">Ajouter</button>
      {/* {message && <p>{message}</p>} */}
      {message && <div className="success-message">{message}</div>}
    </form>
  );
};

export default AddEventForm;
