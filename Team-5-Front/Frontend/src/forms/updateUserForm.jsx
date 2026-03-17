// /src/components/UserProfile.jsx
import { useEffect, useMemo, useState } from "react";
import { getUser, getImgProfile, setUser, setImgProfile } from "/src/service/AuthService";
import { updateUserRequest } from "/src/service/UserService";
import "./Profile.css";

const BASE_URL = "http://localhost:8080";
const formatImagePath = (pic) => {
  if (!pic) return "";
  const rawPath = typeof pic === "string" ? pic : pic.path;
  const cleanPath = (rawPath || "").replace(/^[A-Z]:\/uploads\//i, "");
  return `${BASE_URL}/uploads/${cleanPath}`;
};

export default function updateUserForm() {
  const [originalUser, setOriginalUser] = useState("");
  const [newUser, setNewUser] = useState("");
  const [currentImg, setCurrentImg] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const u = getUser() || "";
    setOriginalUser(u);
    setNewUser(u);

    const stored = getImgProfile();
    if (stored) {
      const isDataUrl = typeof stored === "string" && stored.startsWith("data:");
      const isHttp = typeof stored === "string" && /^https?:\/\//.test(stored);
      setCurrentImg(isDataUrl || isHttp ? stored : formatImagePath(stored));
    }
  }, []);

  const onFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : "");
  };

  const avatarUrl = useMemo(() => preview || currentImg || "", [preview, currentImg]);

  const onSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMsg("");
      const ok = await updateUserRequest(newUser, file, "/user/update");
      if (ok) {
        setMsg("Perfil actualizado correctamente.");
      } else {
        setMsg("No se pudo actualizar el perfil.");
      }
    } catch (err) {
      setMsg(err?.message || "Error al actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  // Placeholder estático “Favoritos”
  const favPlaces = [
    {
      id: 1,
      name: "Ibiza",
      categoryName: "Beach",
      bestTime: "Summer",
      rateAve: 4.8,
      img: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1600&auto=format&fit=crop",
    },
    {
      id: 2,
      name: "Kyoto",
      categoryName: "Historical",
      bestTime: "Spring",
      rateAve: 4.7,
      img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1600&auto=format&fit=crop",
    },
    {
      id: 3,
      name: "Sahara Dunes",
      categoryName: "Desert",
      bestTime: "Autumn",
      rateAve: 4.5,
      img: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1600&auto=format&fit=crop",
    },
    {
      id: 4,
      name: "Swiss Alps",
      categoryName: "Mountain",
      bestTime: "Winter",
      rateAve: 4.9,
      img: "https://images.unsplash.com/photo-1509644851218-985b6f0f85ed?q=80&w=1600&auto=format&fit=crop",
    },
  ];

  return (
    <section className="up-light-bg">
      <div className="mainContainer">
      <div className="up-light-overlay" />
      <div className="up-light-container">
        {/* Columna izquierda: perfil */}
        <aside className="up-card up-profile">
          <div className="up-cover-light">
            <label className="up-upload-light">
              <input type="file" accept="image/*" onChange={onFileChange} className="up-fileInput" />
              <span>Upload new photo</span>
            </label>
          </div>

          <div className="up-avatarWrap-light">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="up-avatar-light" />
            ) : (
              <div className="up-avatar-light fallback">
                {(originalUser || "U").slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>

          <form className="up-form-light" onSubmit={onSave}>
            <div className="up-field-light">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                value={newUser}
                onChange={(e) => setNewUser(e.target.value)}
                placeholder="Username"
                required
              />
            </div>

            <button type="submit" className="up-saveBtn-light" disabled={saving}>
              {saving ? "Loading…" : "Load Changes"}
            </button>

            {msg && <div className="up-msg-light">{msg}</div>}
          </form>
        </aside>

        <main className="up-card up-favs-light">
          <header className="up-favsHeader-light">
            <h2>Your favourite places</h2>
          </header>

          <div className="up-favGrid-light">
            {favPlaces.map((p) => (
              <article className="up-favCard-light" key={p.id}>
                <div className="up-favImgWrap-light">
                  <img src={p.img} alt={p.name} />
                  <div className="up-favBadge-light">{p.categoryName}</div>
                </div>
                <div className="up-favBody-light">
                  <h3 className="up-favTitle-light">{p.name}</h3>
                  <div className="up-favMeta-light">
                    <span className="chip">{p.bestTime}</span>
                    <span className="sep">•</span>
                    <span className="rate">★ {p.rateAve.toFixed(1)}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </main>
      </div>
      </div>
    </section>
  );
}