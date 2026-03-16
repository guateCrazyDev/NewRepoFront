import React, { useEffect, useState } from "react";
import api from "../service/AxiosConfig";
import { getUser, setUser, setImgProfile } from "../service/AuthService";

const UserData = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [user, setUserState] = useState(null);

  const [username, setUsernameValue] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [imageSrc, setImageSrc] = useState("");

  const toDataUrl = (value, mime = "image/jpeg") => {
    if (!value) return "";
    const s = String(value).trim();
    if (s.startsWith("data:")) return s;
    return `data:${mime};base64,${s}`;
  };

  // Convierte File → base64 DataURL
  const fileToDataURL = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const storedUser = getUser();

      if (!storedUser) {
        setError("User not found in session.");
        setLoading(false);
        return;
      }

      try {
        const { data } = await api.get(`/auth/user/${storedUser}`);
        setUserState(data);
        setUsernameValue(data.username || "");

        if (data.image) {
          setImageSrc(toDataUrl(data.image, data.imageType || "image/jpeg"));
        } else {
          setImageSrc("https://via.placeholder.com/100");
        }
      } catch (err) {
        setError("Unable to load user data.");
      }

      setLoading(false);
    };

    load();
  }, []);

  const onPickFile = (e) => {
    const file = e.target.files?.[0] || null;
    setAvatarFile(file);
    setAvatarPreview(file ? URL.createObjectURL(file) : "");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError("");
    setSuccess("");

    if (!avatarFile) {
      setError("Image is required.");
      setSaving(false);
      return;
    }

    try {
      const form = new FormData();
      form.append("originalUser", user.username);
      form.append("newUser", username);
      form.append("img", avatarFile);

      // Back responde solamente TRUE
      const { data: ok } = await api.put("/auth/update", form);
      if (!ok) throw new Error("Update failed");

      // ----- ⬇️ Optimistic update (sin esperar GET) -----
      const localDataURL = await fileToDataURL(avatarFile);

      setImageSrc(localDataURL);

      try {
        setImgProfile(localDataURL);
        window.dispatchEvent(new Event("storage"));
      } catch (err) {
        console.error("Error saving image:", err);
        setError("Image too large for localStorage.");
      }

      // Si cambia el username
      if (user.username !== username) {
        setUser(username);
        setUserState((prev) => (prev ? { ...prev, username } : prev));
        window.dispatchEvent(new Event("storage"));
      }

      setAvatarFile(null);
      setAvatarPreview("");
      setSuccess("Profile updated successfully.");
    } catch (e) {
      console.error(e);
      setError("Could not update profile.");
    }

    setSaving(false);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!user) return <p>No user data.</p>;

  const avatarToShow = avatarPreview || imageSrc;

  const initials = (user?.username || "U")
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase())
    .slice(0, 2)
    .join("");

  return (
    <div
      style={{
        textAlign: "center",
        padding: 16,
        maxWidth: 420,
        margin: "0 auto",
      }}
    >
      {avatarToShow && !avatarToShow.includes("placeholder") ? (
        <img
          src={avatarToShow}
          alt="Profile"
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            objectFit: "cover",
          }}
          onError={(e) =>
            (e.currentTarget.src = "https://via.placeholder.com/100")
          }
        />
      ) : (
        <div
          style={{
            width: 100,
            height: 100,
            borderRadius: "50%",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#e6eef6",
            color: "#003262",
            fontWeight: 700,
            fontSize: 32,
          }}
        >
          {initials}
        </div>
      )}

      <h3 style={{ margin: "12px 0" }}>Hi: {user.username}</h3>

      <form onSubmit={onSubmit} style={{ marginTop: 12, textAlign: "left" }}>
        <div style={{ marginBottom: 10 }}>
          <label>New Username</label>
          <input
            value={username}
            onChange={(e) => setUsernameValue(e.target.value)}
            required
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 8,
              border: "1px solid #ccd7e2",
              marginTop: 4,
            }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>New Image (required)</label>
          <input
            type="file"
            accept="image/*"
            onChange={onPickFile}
            style={{ display: "block", marginTop: 4 }}
          />
        </div>

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>

        {success && <p style={{ color: "green" }}>{success}</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </form>
    </div>
  );
};

export default UserData;
