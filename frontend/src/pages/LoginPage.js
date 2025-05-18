import React from "react";
import LoginForm from "../components/LoginForm";
import SignupForm from "../components/SignupForm";
import { useNavigate, useLocation } from "react-router-dom";
import "../components/Auth.css";

// Simule un contexte utilisateur localStorage (à remplacer par API backend)
function setUserSession(user) {
  localStorage.setItem("cripplefn_user", JSON.stringify(user));
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSignup, setShowSignup] = React.useState(false);

  // Message d'incitation si redirigé depuis /verify
  const message = location.state?.message;

  // Callback pour la connexion
  const handleLogin = async ({ email, password }) => {
    // À remplacer par un appel API réel
    if (email === "test@demo.com" && password === "Password1") {
      setUserSession({ email, firstName: "Test", lastName: "Demo" });
      navigate("/dashboard");
    } else {
      throw new Error("Identifiants invalides.");
    }
  };

  // Callback pour l'inscription
  const handleSignup = async ({ firstName, lastName, email, password }) => {
    // À remplacer par un appel API réel
    setUserSession({ email, firstName, lastName });
    navigate("/dashboard");
  };

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {message && (
          <div className="auth-error" role="alert" style={{ marginBottom: 16 }}>{message}</div>
        )}
        {showSignup ? (
          <>
            <SignupForm onSignup={handleSignup} />
            <p style={{ textAlign: "center" }}>
              Déjà inscrit ? <button style={{ background: "none", color: "#1976d2", border: "none", cursor: "pointer" }} onClick={() => setShowSignup(false)}>Se connecter</button>
            </p>
          </>
        ) : (
          <>
            <LoginForm onLogin={handleLogin} />
            <p style={{ textAlign: "center" }}>
              Pas encore de compte ? <button style={{ background: "none", color: "#1976d2", border: "none", cursor: "pointer" }} onClick={() => setShowSignup(true)}>Créer un compte</button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
