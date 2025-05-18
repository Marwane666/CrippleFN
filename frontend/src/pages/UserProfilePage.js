import React from "react";
import UserProfile from "../components/UserProfile";
import { useNavigate } from "react-router-dom";
import "../components/Auth.css";

// Récupère l'utilisateur depuis localStorage (à remplacer par API/backend)
function getUserSession() {
  const user = localStorage.getItem("cripplefn_user");
  return user ? JSON.parse(user) : null;
}
function setUserSession(user) {
  localStorage.setItem("cripplefn_user", JSON.stringify(user));
}

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = React.useState(getUserSession());

  React.useEffect(() => {
    if (!user) navigate("/login");
    // eslint-disable-next-line
  }, [user]);

  // Callback pour la mise à jour du profil
  const handleUpdate = async (fields) => {
    setUserSession(fields);
    setUser(fields);
  };

  if (!user) return null;

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <UserProfile user={user} onUpdate={handleUpdate} />
      </div>
    </div>
  );
};

export default UserProfilePage;
