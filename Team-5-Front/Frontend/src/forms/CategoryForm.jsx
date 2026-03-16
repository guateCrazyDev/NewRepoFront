import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createCategoryRequest } from "/src/service/CategoryService";
import "./CategoryForm.css";

export default function CreateCategory() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    setImgFile(file || null);
    if (file) {
      const url = URL.createObjectURL(file);
      setImgPreview(url);
    } else {
      setImgPreview("");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Category Name is mandatory");
    if (!imgFile) return setError("You need to select a image");

    const categoryPayload = {
      categoryName: name.trim(),
      description: description.trim(),
    };

    try {
      setLoading(true);
      await createCategoryRequest(categoryPayload, imgFile);
      navigate("/home", { replace: true });
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
    <div className="CategoryPage-Container">
      <div className="formCat">
      <form onSubmit={onSubmit} noValidate>

        <h1>Create Category</h1>

        <input
          placeholder="Category Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="fileLabel">
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            className="fileInput"
          />
          <span>Select Image</span>
        </label>

        {imgPreview && (
          <div id="preview">
            <img src={imgPreview} alt="Vista previa" />
          </div>
        )}

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