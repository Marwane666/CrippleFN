import React, { useState } from "react";

/**
 * Formulaire d'inscription utilisateur.
 * Props :
 *   - onSignup: callback({ firstName, lastName, email, password }) appelé à la soumission si validation OK
 */
const SignupForm = ({ onSignup }) => {
  const [fields, setFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validation des champs
  const validate = () => {
    if (!fields.firstName.trim() || !fields.lastName.trim()) {
      setError("Prénom et nom requis.");
      return false;
    }
    if (!fields.email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setError("Adresse email invalide.");
      return false;
    }
    if (fields.password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return false;
    }
    if (!fields.password.match(/[A-Z]/) || !fields.password.match(/[0-9]/)) {
      setError("Le mot de passe doit contenir une majuscule et un chiffre.");
      return false;
    }
    if (fields.password !== fields.confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return false;
    }
    setError("");
    return true;
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      await onSignup({
        firstName: fields.firstName,
        lastName: fields.lastName,
        email: fields.email,
        password: fields.password,
      });
    } catch (err) {
      setError(err.message || "Erreur lors de l'inscription.");
    }
    setLoading(false);
  };

  // Gestion des changements de champs
  const handleChange = (e) => {
    setFields({ ...fields, [e.target.name]: e.target.value });
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} aria-label="Inscription">
      <h2>Inscription</h2>
      <label htmlFor="signup-firstname">Prénom</label>
      <input
        id="signup-firstname"
        name="firstName"
        value={fields.firstName}
        onChange={handleChange}
        required
        disabled={loading}
      />
      <label htmlFor="signup-lastname">Nom</label>
      <input
        id="signup-lastname"
        name="lastName"
        value={fields.lastName}
        onChange={handleChange}
        required
        disabled={loading}
      />
      <label htmlFor="signup-email">Email</label>
      <input
        id="signup-email"
        name="email"
        type="email"
        value={fields.email}
        onChange={handleChange}
        autoComplete="email"
        required
        disabled={loading}
      />
      <label htmlFor="signup-password">Mot de passe</label>
      <input
        id="signup-password"
        name="password"
        type="password"
        value={fields.password}
        onChange={handleChange}
        autoComplete="new-password"
        required
        disabled={loading}
      />
      <label htmlFor="signup-confirm">Confirmer le mot de passe</label>
      <input
        id="signup-confirm"
        name="confirm"
        type="password"
        value={fields.confirm}
        onChange={handleChange}
        autoComplete="new-password"
        required
        disabled={loading}
      />
      {error && <div className="auth-error" role="alert">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? "Inscription..." : "S'inscrire"}
      </button>
    </form>
  );
};

export default SignupForm;
