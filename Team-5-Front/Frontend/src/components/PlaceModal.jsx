import { useEffect, useMemo, useState, useCallback, Fragment } from "react";
import { chargePlaceUnique } from "/src/service/PlaceService";
import { createCommentRequest } from "/src/service/CommentService";
import {
  getUser
} from '../storage/StorageService'
import "./PlaceModal.css";
import { getImgProfile } from "../service/AuthService";

const BASE_URL = "http://localhost:8080";

const formatImagePath = (pic) => {
  if (!pic) return "";
  const rawPath = typeof pic === "string" ? pic : pic.path;
  const cleanPath = (rawPath || "").replace(/^[A-Z]:\/uploads\//i, "");
  return `${BASE_URL}/uploads/${cleanPath}`;
};

const placeholder =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 600'>
       <defs>
         <linearGradient id='g' x1='0' x2='1'>
           <stop offset='0%' stop-color='#111827'/>
           <stop offset='100%' stop-color='#1f2937'/>
         </linearGradient>
       </defs>
       <rect width='100%' height='100%' fill='url(#g)'/>
       <text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle'
             fill='#9CA3AF' font-family='Verdana' font-size='28'>No image</text>
     </svg>`
  );

function Stars({ value = 0 }) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="pm-stars" aria-label={`Rating ${value.toFixed(1)}/5`}>
      {"★".repeat(full)}
      {half ? "☆" : ""}
      {"✩".repeat(empty)}
      <span className="pm-stars-val">{value ? value.toFixed(1) : "0.0"}</span>
    </span>
  );
}

const fmtDate = (d) => {
  try {
    const date = d instanceof Date ? d : new Date(d);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return "";
  }
};

function Avatar( userp ) {
  const src = userp.user;
  const initial = (getUser()?.[0] || "U").toUpperCase();
  return src ? (
    <img className="cmt-avatar" src={src} alt={getUser()} />
  ) : (
    <div className="cmt-avatar fallback" aria-label={getUser()}>
      {initial}
    </div>
  );
}

export default function PlaceModal({ isOpen, placeName, onClose }) {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState(null);
  const [idx, setIdx] = useState(0);
  const [expandedImg, setExpandedImg] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [cText, setCText] = useState("");
  const [cRate, setCRate] = useState(5);
  const [cFiles, setCFiles] = useState([]);
  const [cPrev, setCPrev] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const images = useMemo(() => {
    const arr = Array.isArray(data?.picturesPlace)
      ? data.picturesPlace.map(formatImagePath).filter(Boolean)
      : [];
    return arr.length ? arr : [placeholder];
  }, [data]);

  const current = images[Math.max(0, Math.min(idx, images.length - 1))];

  const handleKey = useCallback(
    (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowRight" && images.length > 1)
        setIdx((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft" && images.length > 1)
        setIdx((i) => (i - 1 + images.length) % images.length);
    },
    [isOpen, images.length, onClose]
  );

  useEffect(() => {
    if (!isOpen || !placeName) return;
    let ignore = false;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const resp = await chargePlaceUnique(placeName);
        if (ignore) return;
        setData(resp || null);
        setIdx(0);
      } catch (e) {
        if (ignore) return;
        setErr(e?.message || "Failed to load place");
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [isOpen, placeName]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKey);
      document.documentElement.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.documentElement.style.overflow = "";
      cPrev.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [isOpen]);

  const onFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    cPrev.forEach((u) => URL.revokeObjectURL(u));
    const urls = files.map((f) => URL.createObjectURL(f));
    setCFiles(files);
    setCPrev(urls);
  };

  function getCurrentDateISO() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Mes empieza en 0
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const onSubmitComment = async (e) => {
    e.preventDefault();
    if (!cText.trim()) return;

    const commentPayload = {
      text: cText.trim(),
      date: getCurrentDateISO(),
      rate : cRate,
    };

    try {
      setSubmitting(true);
      const resp = await createCommentRequest(commentPayload,cFiles,data.name,getUser());
      const optimistic = {
        text: cText.trim(),
        rate: Number(cRate),
        date: new Date().toISOString(),
        picComms: resp.data,
        user: {
          username: getUser(),
          avatarUrl: getImgProfile(),
        },
        profilePath: getImgProfile(),
        userName: getUser(),
      };

      console.log(resp);

      setData((prev) =>
        prev
          ? { ...prev, comments: [optimistic, ...(prev.comments || [])] }
          : prev
      );

      setCText("");
      setCRate(5);
      setCFiles([]);
      cPrev.forEach((u) => URL.revokeObjectURL(u));
      setCPrev([]);
      setShowForm(false);
    } catch (err) {
      console.error(err);
      alert(err?.message || "No se pudo enviar el comentario");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="pm-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <div className="pm-dialog" onClick={(e) => e.stopPropagation()}>
        <button className="pm-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="pm-left">
          <div className="pm-gallery">
            <div className="pm-main">
              <img
                src={current}
                alt={data?.name || "Place"}
                className="pm-main-img"
                loading="lazy"
              />
              {images.length > 1 && (
                <>
                  <button
                    className="pm-nav prev"
                    onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
                    aria-label="Prev"
                  >
                    ‹
                  </button>
                  <button
                    className="pm-nav next"
                    onClick={() => setIdx((i) => (i + 1) % images.length)}
                    aria-label="Next"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {images.length > 1 && (
              <div className="pm-thumbs">
                {images.map((src, i) => (
                  <button
                    key={i}
                    className={`pm-thumb ${i === idx ? "active" : ""}`}
                    onClick={() => setIdx(i)}
                    aria-label={`Imagen ${i + 1}`}
                  >
                    <img src={src} alt={`Thumb ${i + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="pm-right">
        <div className="pm-right-body">
          {loading && <div className="pm-status">Loading…</div>}
          {err && <div className="pm-status error">{err}</div>}
          {!loading && !err && data && (
            <>
              <header className="pm-header">
                <h2 className="pm-title">{data.name}</h2>
                <div className="pm-meta">
                  <span className="pm-chip">{data.location}</span>
                  <span className="pm-sep">•</span>
                  <span className="pm-chip">Best time: {data.bestTime}</span>
                  <span className="pm-sep">•</span>
                  <span className="pm-chip cat">{data.categoryName}</span>
                </div>
                <Stars value={Number(data.rateAve || 0)} />
              </header>

              <p className="pm-desc">
                {data.description || data.description || ""}
              </p>

              <section className="pm-comments">
                <h3 className="pm-comments-title">Comments</h3>
                <div className="pm-comments-list">
                  {(data.comments || []).map((cmt, i) => (
                    <article key={i} className="cmt-item">
                      <div className="cmt-header">
                        <Avatar user={formatImagePath(cmt.profilePath)} />
                        <div className="cmt-user">
                          <div className="cmt-username">
                            {cmt?.userName || "user"}
                          </div>
                          <div className="cmt-sub">
                            <Stars value={Number(cmt.rate || 0)} />
                            <span className="cmt-date">{fmtDate(cmt.date)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="cmt-text">{cmt.text}</div>

                      {Array.isArray(cmt.picComms) && cmt.picComms.length > 0 && (
                        <div className="cmt-pics">
                {cmt.picComms.map((p, k) => {
                  const rawPath =
                    typeof p === "string"
                      ? p
                      : p?.path || "";

                  const src = rawPath.startsWith("blob:")
                    ? rawPath
                    : formatImagePath(rawPath);
                  return (
                    <img
                      key={k}
                      src={src}
                      alt="comment pic"
                      className="cmt-pic"
                      loading="lazy"
                      onClick={() => setExpandedImg(src)}
                    />
                  );
                })}
                        </div>
                      )}
                    </article>
                  ))}
                  {(!data.comments || data.comments.length === 0) && (
                    <div className="cmt-empty">No comments yet</div>
                  )}
                </div>
              </section>

              {/* ===== Nuevo: barra de agregar comentario ===== */}
              <div className="pm-addbar">
                {!showForm ? (
                  <button className="pm-addbtn" onClick={() => setShowForm(true)}>
                    + Add comment
                  </button>
                ) : (
                  <form className="pm-form" onSubmit={onSubmitComment}>
                    <div className="pm-form-row">
                      <div className="pm-rate">
  
        <span className="pm-rate-label">Your rate:</span>

  <div className="pm-stars-input" role="radiogroup" aria-label="Tu rating">
    {[5,4,3,2,1].map((v) => (
      <Fragment key={v}>
        <input
          type="radio"
          id={`rate-${v}`}
          name="rate"
          value={v}
          checked={Number(cRate) === v}
          onChange={() => setCRate(v)}
        />
        <label htmlFor={`rate-${v}`} title={`${v} estrellas`} aria-label={`${v} estrellas`}>
          ★
        </label>
      </Fragment>
    ))}
  </div>


  <button
    type="button"
    className="pm-cancel"
    onClick={() => {
      setShowForm(false);
      setCText("");
      setCRate(5);
      cPrev.forEach((u) => URL.revokeObjectURL(u));
      setCPrev([]);
      setCFiles([]);
    }}
  >
    Cancel
  </button>
</div>
</div>

                    <textarea
                      className="pm-textarea"
                      placeholder="Write your comment…"
                      value={cText}
                      onChange={(e) => setCText(e.target.value)}
                      maxLength={800}
                      rows={3}
                      required
                    />

                    <div className="pm-uploader">
                      <label className="pm-fileLabel">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={onFilesChange}
                          className="pm-fileInput"
                        />
                        Add images
                      </label>
                      {cPrev.length > 0 && (
                        <div className="pm-previews">
                          {cPrev.map((src, i) => (
                            <figure key={i} className="pm-previewItem">
                              <img src={src} alt={`Adjunto ${i + 1}`} />
                            </figure>
                          ))}
                        </div>
                      )}
                    </div>

                    <button type="submit" className="pm-submit" disabled={submitting}>
                      {submitting ? "Charging…" : "Comment"}
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      </div>
      {expandedImg && (
  <div
    className="pm-img-overlay"
    onClick={(e) => {
      e.stopPropagation(); 
      setExpandedImg(null);
    }}
  >
    <img
      src={expandedImg}
      alt="Expanded"
      className="pm-img-expanded"
      onClick={(e) => e.stopPropagation()}
    />
  </div>
)}
    </div>
  );
}