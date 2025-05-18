import React, { useState } from "react";

/**
 * Affichage et édition du profil utilisateur.
 * Props :
 *   - user: { firstName, lastName, email, avatar, bio }
 *   - onUpdate: callback(userData) appelé à la sauvegarde
 */
const UserProfile = ({ user, onUpdate }) => {
  const [edit, setEdit] = useState(false);
  const [fields, setFields] = useState({
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    avatar: user.avatar || "",
    bio: user.bio || "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Validation simple
  const validate = () => {
    if (!fields.firstName.trim() || !fields.lastName.trim()) {
      setError("Prénom et nom requis.");
      return false;
    }
    if (!fields.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setError("Adresse email invalide.");
      return false;
    }
    setError("");
    return true;
  };

  // Gestion des changements de champs
  const handleChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  // Sauvegarde des modifications
  const handleSave = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await onUpdate(fields);
      setSuccess("Profil mis à jour !");
      setEdit(false);
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour.");
    }
    setLoading(false);
  };

  return (
    <div className="user-profile" aria-label="Profil utilisateur">
      <h2>Mon profil</h2>
      <div className="profile-avatar">
        <img
          src={fields.avatar || "https://ui-avatars.com/api/?name=" + encodeURIComponent(fields.firstName + " " + fields.lastName)}
          alt="Avatar utilisateur"
          style={{ width: 80, height: 80, borderRadius: "50%" }}
        />
      </div>
      {!edit ? (
        <div className="profile-view">
          <p><strong>Nom :</strong> {fields.firstName} {fields.lastName}</p>
          <p><strong>Email :</strong> {fields.email}</p>
          <p><strong>Bio :</strong> {fields.bio || <em>Aucune bio</em>}</p>
          <button onClick={() => setEdit(true)}>Modifier</button>
        </div>
      ) : (
        <form className="profile-edit" onSubmit={handleSave}>
          <label htmlFor="profile-firstname">Prénom</label>
          <input
            id="profile-firstname"
            name="firstName"
            value={fields.firstName}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <label htmlFor="profile-lastname">Nom</label>
          <input
            id="profile-lastname"
            name="lastName"
            value={fields.lastName}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <label htmlFor="profile-email">Email</label>
          <input
            id="profile-email"
            name="email"
            type="email"
            value={fields.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
          <label htmlFor="profile-avatar">Avatar (URL)</label>
          <input
            id="profile-avatar"
            name="avatar"
            value={fields.avatar}
            onChange={handleChange}
            disabled={loading}
          />
          <label htmlFor="profile-bio">Bio</label>
          <textarea
            id="profile-bio"
            name="bio"
            value={fields.bio}
            onChange={handleChange}
            rows={3}
            disabled={loading}
          />
          {error && <div className="auth-error" role="alert">{error}</div>}
          {success && <div className="auth-success" role="status">{success}</div>}
          <button type="submit" disabled={loading}>
            {loading ? "Sauvegarde..." : "Sauvegarder"}
          </button>
          <button type="button" onClick={() => setEdit(false)} disabled={loading}>
            Annuler
          </button>
        </form>
      )}
    </div>
  );
};

export default UserProfile;
