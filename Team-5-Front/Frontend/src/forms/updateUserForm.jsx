import React, { useState, useEffect } from "react";
// Asegúrate de que la ruta apunte al archivo donde definiste getUserProfile y updateUserProfile
import userService from "../service/userService"; 

const UpdateUserForm = () => {
  const [user, setUser] = useState({
    username: "",
    newUsername: "",
    image: "",
  });

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);

  const defaultImage = "https://via.placeholder.com";

  // 1. CARGAR DATOS INICIALES
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentSessionName = localStorage.getItem("username");
        if (currentSessionName) {
          // LLAMADA AL SERVICIO (GET)
          const data = await userService.getUserProfile(currentSessionName);
          setUser((prev) => ({
            ...prev,
            username: data.username,
            image: data.image,
          }));
        }
      } catch (error) {
        console.error("Connection error:", error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentSessionName = localStorage.getItem("username");

    try {
      const newUserValue = user.newUsername || user.username;

      await userService.updateUserProfile(
        currentSessionName,
        newUserValue,
        file
      );

      alert("¡Profile updated!");

      if (user.newUsername) {
        localStorage.setItem("username", user.newUsername);
        setUser((prev) => ({
          ...prev,
          username: user.newUsername,
          newUsername: "",
        }));
      }
      setPreview(null);
    } catch (error) {
      console.error("Update error:", error);
      alert("Error updating data");
    }
  };

  if (loading) return <p>Loading data...</p>;

  const displayImage =
    preview ||
    (user.image ? `data:image/jpeg;base64,${user.image}` : defaultImage);

  return (
    <div style={containerStyle}>
      <h3>Profile</h3>
      <div style={{ marginBottom: "20px" }}>
        <img src={displayImage} alt="Perfil" style={imageStyle} />
        <p><strong>{user.username}</strong></p>
      </div>

      <form onSubmit={handleSubmit}>
        <div style={inputGroupStyle}>
          <label>Do you wish to change your username?</label>
          <input
            type="text"
            value={user.newUsername}
            onChange={(e) => setUser({ ...user, newUsername: e.target.value })}
            placeholder="Write your new name"
            style={inputStyle}
          />
        </div>

        <div style={inputGroupStyle}>
          <label>Do you wish to change your profile picture?</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ width: "100%", marginTop: "5px" }}
          />
        </div>

        <button type="submit" style={buttonStyle}>Send</button>
      </form>
    </div>
  );
};

const containerStyle = { maxWidth: "400px", margin: "auto", padding: "20px", border: "1px solid #ccc", textAlign: "center", borderRadius: "12px" };
const imageStyle = { width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: "3px solid #007bff" };
const inputGroupStyle = { marginBottom: "15px", textAlign: "left" };
const inputStyle = { width: "100%", marginTop: "5px", padding: "8px", boxSizing: "border-box" };
const buttonStyle = { width: "100%", padding: "10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" };

export default UpdateUserForm;
