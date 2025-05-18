import React, { useState } from "react";

/**
 * Formulaire de connexion utilisateur.
 * Props :
 *   - onLogin: callback({ email, password }) appelé à la soumission si validation OK
 */
const LoginForm = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Validation simple email/mot de passe
  const validate = () => {
    if (!email.match(/^[^@\s]+@[^@\s]+\.[^@\s]+$/)) {
      setError("Adresse email invalide.");
      return false;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
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
      await onLogin({ email, password });
    } catch (err) {
      setError(err.message || "Erreur lors de la connexion.");
    }
    setLoading(false);
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} aria-label="Connexion">
      <h2>Connexion</h2>
      <label htmlFor="login-email">Email</label>
      <input
        id="login-email"
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        autoComplete="email"
        required
        disabled={loading}
      />
      <label htmlFor="login-password">Mot de passe</label>
      <input
        id="login-password"
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        autoComplete="current-password"
        required
        disabled={loading}
      />
      {error && <div className="auth-error" role="alert">{error}</div>}
      <button type="submit" disabled={loading}>
        {loading ? "Connexion..." : "Se connecter"}
      </button>
    </form>
  );
};

export default LoginForm;
