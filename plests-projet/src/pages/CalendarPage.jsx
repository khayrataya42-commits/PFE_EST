import React, { useEffect, useState } from "react";
import "../styles/CalendarPage.css";

function CalendarPage() {
  const emptyForm = {
    title: "",
    description: "",
    date: "",
    start_time: "",
    end_time: "",
    event_type: "",
    teacher: "",
    target_group: "",
  };

  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const role = localStorage.getItem("role");
  const normalizedRole = (role || "").toLowerCase();

  const isStudent = normalizedRole === "student";
  const isTeacher = normalizedRole === "teacher";
  const isAdmin =
    normalizedRole === "admin" || normalizedRole === "administrator";

  const canManageEvents = isTeacher || isAdmin;

  const loadEvents = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8006/events");
      const data = await res.json();
      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erreur chargement events:", error);
      setEvents([]);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingId) {
        await fetch(`http://127.0.0.1:8006/events/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        await fetch("http://127.0.0.1:8006/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }

      resetForm();
      loadEvents();
    } catch (error) {
      console.error("Erreur ajout/modification event:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://127.0.0.1:8006/events/${id}`, {
        method: "DELETE",
      });
      loadEvents();
    } catch (error) {
      console.error("Erreur suppression event:", error);
    }
  };

  const handleEdit = (event) => {
    setEditingId(event.id);
    setForm({
      title: event.title || "",
      description: event.description || "",
      date: event.date || "",
      start_time: event.start_time || "",
      end_time: event.end_time || "",
      event_type: event.event_type || "",
      teacher: event.teacher || "",
      target_group: event.target_group || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="calendar-page">
      {!isStudent && <h1>Calendrier et Emploi du Temps</h1>}

      {canManageEvents && (
        <form className="calendar-form" onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Titre"
            value={form.title}
            onChange={handleChange}
            required
          />

          <input
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />

          <input
            type="time"
            name="start_time"
            value={form.start_time}
            onChange={handleChange}
            required
          />

          <input
            type="time"
            name="end_time"
            value={form.end_time}
            onChange={handleChange}
            required
          />

          <input
            name="event_type"
            placeholder="Type (cours/examen/réunion)"
            value={form.event_type}
            onChange={handleChange}
            required
          />

          <input
            name="teacher"
            placeholder="Professeur"
            value={form.teacher}
            onChange={handleChange}
          />

          <input
            name="target_group"
            placeholder="Groupe"
            value={form.target_group}
            onChange={handleChange}
          />

          <button className="btn-add" type="submit">
            {editingId ? "Modifier événement" : "Ajouter événement"}
          </button>

          {editingId && (
            <button
              type="button"
              className="btn-cancel"
              onClick={resetForm}
              style={{ marginTop: "10px" }}
            >
              Annuler
            </button>
          )}
        </form>
      )}

      <h2>Liste des événements</h2>

      {events.length === 0 ? (
        <p>Aucun événement trouvé.</p>
      ) : (
        <ul className="events-list">
          {events.map((event) => (
            <li key={event.id} className="event-card">
              <strong>{event.title}</strong> - {event.event_type}
              <br />
              {event.date} | {event.start_time} - {event.end_time}
              <br />
              Prof: {event.teacher || "-"} | Groupe: {event.target_group || "-"}
              <br />
              {event.description}

              {canManageEvents && (
                <div className="event-buttons">
                  <button
                    type="button"
                    className="btn-edit"
                    onClick={() => handleEdit(event)}
                  >
                    Modifier
                  </button>

                  <button
                    type="button"
                    className="btn-delete"
                    onClick={() => handleDelete(event.id)}
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default CalendarPage;