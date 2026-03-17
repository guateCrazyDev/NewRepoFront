import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { chargeCategory } from "/src/service/CategoryService";
import { chargePlaces } from "/src/service/PlaceService";
import PlaceModal from "./PlaceModal";
import {
  getRole,
} from '../storage/StorageService'
import './Places.css';

const BASE_URL = "http://localhost:8080";

function bytesToBase64(bytes) {
  if (!bytes) return null;
  if (typeof bytes === "string") return bytes;
}

const formatImagePath = (pic) => {
  if (!pic) return "";
  const rawPath = typeof pic === "string" ? pic : pic.path;
  const cleanPath = (rawPath || "").replace(/^[A-Z]:\/uploads\//i, "");
  return `${BASE_URL}/uploads/${cleanPath}`;
};

function PlaceCarousel({ images = [], name = "" }) {
  const [idx, setIdx] = useState(0);
  const hasImages = images && images.length > 0;
  const safeIdx = hasImages ? Math.max(0, Math.min(idx, images.length - 1)) : 0;
  const current = hasImages ? images[safeIdx] : "";

  const next = (e) => {
    e?.stopPropagation?.();
    if (!hasImages) return;
    setIdx((i) => (i + 1) % images.length);
  };
  const prev = (e) => {
    e?.stopPropagation?.();
    if (!hasImages) return;
    setIdx((i) => (i - 1 + images.length) % images.length);
  };

  return (
    
<div className="tile">
  <div className="carousel">
    <img src={current} alt={name || "Place"} loading="lazy" />

    {hasImages && images.length > 1 && (
      <>
        <button className="navBtn prev" aria-label="Anterior" onClick={prev}>‹</button>
        <button className="navBtn next" aria-label="Siguiente" onClick={next}>›</button>
        <div className="dots">
          {images.map((_, i) => (
            <button
              key={i}
              className={`dot ${i === safeIdx ? "active" : ""}`}
              aria-label={`Ir a imagen ${i + 1}`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIdx(i); }}
            />
          ))}
        </div>
      </>
    )}

    <div className="overlay">
      <h3>{name || "Place"}</h3>
    </div>
  </div>
</div>

  );
}

function Places() {
  const { categoryName } = useParams();
  const isAdmin = getRole() === "ADMIN";
  const [category, setCategory] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [activePlaceName, setActivePlaceName] = useState(null);

  const openModal = (name) => {
    setActivePlaceName(name);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setActivePlaceName(null);
  };


  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr("");

        // Carga de la categoría
        const data = await chargeCategory(categoryName);
        const base64 = bytesToBase64(data?.img);
        const mime = "image/jpeg";
        const imageUrl = base64
          ? base64.startsWith("data:")
            ? base64
            : `data:${mime};base64,${base64}`
          : "";
        setCategory({ ...data, imageUrl });

        const dataPlaces = await chargePlaces(categoryName);
        const updatedPlaces = (dataPlaces || []).map((p, idx) => {
          const imgs = Array.isArray(p?.picturesPlace)
            ? p.picturesPlace.map(formatImagePath).filter(Boolean)
            : (p?.picturesPlace ? [formatImagePath(p.picturesPlace)] : []);
          return {
            id: p?.id ?? idx,
            name: p?.name || p?.placeName || "Place",
            description: p?.location || "",
            images: imgs,
          };
        });
        setPlaces(updatedPlaces);
      } catch (e) {
        console.error(e);
        setErr(e?.message || "Failed process");
      } finally {
        setLoading(false);
      }
    })();
  }, [categoryName]);
  
  const COLS = 4;
  const ROW_UNIT = 1;

  const buildSizePalette = (n) => {
    if (n <= 6) {
      return [
        { w: 2, h: 3 * ROW_UNIT },
        { w: 1, h: 2 * ROW_UNIT },
        { w: 2, h: 2 * ROW_UNIT },
        { w: 1, h: 1 * ROW_UNIT },
      ];
    } else if (n <= 12) {
      return [
        { w: 2, h: 2 * ROW_UNIT },
        { w: 1, h: 2 * ROW_UNIT },
        { w: 2, h: 1 * ROW_UNIT },
        { w: 1, h: 1 * ROW_UNIT },
      ];
    }
    return [
      { w: 1, h: 2 * ROW_UNIT },
      { w: 2, h: 1 * ROW_UNIT },
      { w: 1, h: 1 * ROW_UNIT },
      { w: 2, h: 2 * ROW_UNIT },
    ];
  };

  const ensureRows = (grid, rows, cols) => {
    while (grid.length < rows) grid.push(new Array(cols).fill(false));
  };
  const fitsAt = (grid, r, c, w, h, cols) => {
    if (c + w > cols) return false;
    ensureRows(grid, r + h, cols);
    for (let i = r; i < r + h; i++) {
      for (let j = c; j < c + w; j++) {
        if (grid[i][j]) return false;
      }
    }
    return true;
  };
  const placeAt = (grid, r, c, w, h) => {
    for (let i = r; i < r + h; i++) {
      for (let j = c; j < c + w; j++) {
        grid[i][j] = true;
      }
    }
    return { rowStart: r + 1, colStart: c + 1, rowSpan: h, colSpan: w };
  };
  const getMinGapWidth = (grid, cols) => {
    if (grid.length === 0) return cols;
    let minGap = cols;
    for (let r = 0; r < grid.length; r++) {
      let run = 0;
      for (let c = 0; c < cols; c++) {
        if (!grid[r][c]) run++;
        else {
          if (run > 0) minGap = Math.min(minGap, run);
          run = 0;
        }
      }
      if (run > 0) minGap = Math.min(minGap, run);
    }
    return minGap === 0 ? cols : minGap;
  };
  const PALETTE = useMemo(() => buildSizePalette(places.length), [places.length]);
  const chooseAdaptiveSize = (index, minGap) => {
    const base = PALETTE[index % PALETTE.length];
    let w = Math.min(base.w, 2);
    let h = base.h;
    if (minGap === 1) w = 1;
    else if (minGap === 2) w = 2;
    else w = Math.min(w, 2);
    if (h > 1 && index % 3 === 0) h = Math.max(1, h - 1);
    return { w, h };
  };

  const laidOut = useMemo(() => {
    const grid = [];
    const placed = [];
    places.forEach((pl, idx) => {
      const minGap = getMinGapWidth(grid, COLS);
      let { w, h } = chooseAdaptiveSize(idx, minGap);
      const candidates = [
        { w, h },
        { w: 1, h },
        { w: 1, h: 1 },
        ...(grid.length === 0 && places.length <= 6 && idx === 0 ? [{ w: 4, h: 2 }] : []),
      ];
      let placedTile = null;
      for (const cand of candidates) {
        let found = false;
        let r = 0;
        while (!found) {
          ensureRows(grid, r + cand.h, COLS);
          for (let c = 0; c <= COLS - cand.w; c++) {
            if (fitsAt(grid, r, c, cand.w, cand.h, COLS)) {
              placedTile = placeAt(grid, r, c, cand.w, cand.h);
              found = true;
              break;
            }
          }
          if (!found) r++;
          if (r > grid.length + 200) break;
        }
        if (placedTile) break;
      }
      placed.push({ ...pl, ...placedTile });
    });
    return placed;
  }, [places]);

  // Placeholder SVG
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

  if (loading) return <div style={{ padding: 16 }}>Loading category…</div>;
  if (err) return <div style={{ padding: 16, color: "tomato" }}>{err}</div>;
  if (!category) return <div style={{ padding: 16 }}>No category found.</div>;

  return (
    <div>
      {/* Hero de categoría */}
      <div className="home-page">
        <div className="template">
          <div className="image-div">
            {category.imageUrl ? (
              <img src={category.imageUrl} alt={category.categoryName || "Category"} />
            ) : null}
          </div>
        </div>
      </div>

      {/* Grid de places con carrusel */}
      <div className="mainContainer">
        <div className="title">
          <h2>{category.categoryName} places</h2>
        </div>

        <div className="gridContainer">
          {laidOut.map((item) => {
            const images = (item.images && item.images.length > 0) ? item.images : [placeholder];
            return (  
            <div
              key={item.id}
              className="tile"
              style={{
                gridColumn: `${item.colStart} / span ${item.colSpan}`,
                gridRow: `${item.rowStart} / span ${item.rowSpan}`,
                position: "relative", // ✅ necesario para el botón
              }}
              onClick={() => openModal(item.name)}
            >
              {/* ✅ Botón Edit solo para ADMIN */}
              {isAdmin && (
                <button
                  className="edit-place-btn"
                  onClick={(e) => {
                    e.stopPropagation(); // ✅ evita abrir el modal
                    console.log("Edit place:", item);
                    // aquí luego navegas o abres formulario de edición
                    // navigate(`/home/PForm/${item.id}`)
                  }}
                  aria-label={`Edit ${item.name}`}
                >
                  ✎ Edit Place
                </button>
              )}
              <PlaceCarousel images={images} name={item.name} />
            </div>
            );
          })}
        </div>
      </div>
      {modalOpen && (
        <PlaceModal
          key={activePlaceName}
          isOpen={modalOpen}
          placeName={activePlaceName}
          onClose={closeModal}
        />
      )}
    </div>
  );
}

export default Places;