import { useState,useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { createPlaceRequest } from "/src/service/PlaceService";
import "./PlaceForm.css";

export default function CreateCategory() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [besTime, setTime] = useState("");
  const [desc, setDesc] = useState("");
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const navigate = useNavigate();
  
  const [imgFiles, setImgFiles] = useState([]);
  const [imgPreviews, setImgPreviews] = useState([]);  
  useEffect(() => {
    return () => {
      imgPreviews.forEach(URL.revokeObjectURL);
    };
  }, [imgPreviews]);
  
  const onFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) {
      imgPreviews.forEach(URL.revokeObjectURL);
      setImgFiles([]);
      setImgPreviews([]);
      return;
    }

    const MAX_FILES = 10;
    const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    const filtered = files
      .slice(0, MAX_FILES)
      .filter(f => ALLOWED.includes(f.type));

    imgPreviews.forEach(URL.revokeObjectURL);

    const urls = filtered.map(f => URL.createObjectURL(f));

    setImgFiles(filtered);
    setImgPreviews(urls);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Category Name is mandatory");

    const categoryPayload = {
      name: name.trim(),
      bestTime: besTime.trim(),
      location : description.trim(),
      description : desc.trim(),
    };

    try {
      setLoading(true);
      await createPlaceRequest(categoryPayload, imgFiles, location.pathname.slice(location.pathname.lastIndexOf("/")+1));
      navigate("/places"+location.pathname.slice(location.pathname.lastIndexOf("/")), { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "No se pudo crear la categoría.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="PlacePage-Container">
      <div className="formCat">
      <form onSubmit={onSubmit} noValidate>

        <h1>Create Place</h1>

        <input
          placeholder="Place Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          placeholder="Location"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          placeholder="Best Time to visit"
          value={besTime}
          onChange={(e) => setTime(e.target.value)}
        /> 
        <textarea
          className="textareaDesc"
          placeholder="Description"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          rows={4}              // altura base (puedes ajustarla)
        ></textarea>
        <label className="fileLabel">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={onFileChange}
            className="fileInput"
          />
          <span>Select images…</span>
        </label>   
        <div className="thumbsGrid">
          {imgPreviews.map((src, i) => (
            <figure key={i} className="thumbItem" title={`Imagen ${i + 1}`}>
              <img src={src} alt={`Preview ${i + 1}`} loading="lazy" />
            </figure>
          ))}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating…" : "Create Category"}
        </button>

        {error && <div className="error">{error}</div>}

        <Link id="CreateAccount" to={"../home"}>
          Volver
        </Link>
      </form>
      </div>
    </div>
  );
}