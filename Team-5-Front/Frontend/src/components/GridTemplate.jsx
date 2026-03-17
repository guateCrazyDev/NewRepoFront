import "./GridTemplate.css";
import { Link, useNavigate } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import {
  getRole,
} from '../storage/StorageService'
import { chargeCategories } from "/src/service/CategoryService";

const slugify = (s = "") =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

function bytesToBase64(bytes) {
  if (!bytes) return null;
  if (typeof bytes === "string") {
    return bytes;
  }

  try {
    const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
    let binary = "";
    const chunkSize = 0x8000;
    for (let i = 0; i < arr.length; i += chunkSize) {
      const chunk = arr.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, chunk);
    }
    return btoa(binary);
  } catch (e) {
    console.error("No se pudo convertir bytes a base64:", e);
    return null;
  }
}

function GridTemplate() {
  const [images, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const navigate = useNavigate();
  const isAdmin = getRole() === "ADMIN";

  const COLS = 4;
  const ROW_UNIT = 1;

  useEffect(() => {

    (async () => {
      try {
        setLoading(true);
        setLoadError("");

        const resp = await chargeCategories();
        const raw = Array.isArray(resp) ? resp : resp?.data || [];

        const mapped = raw.map((c, idx) => {
          const base64 = bytesToBase64(c?.img);
          const mime = "image/jpeg";
          const url = base64
            ? base64.startsWith("data:")
              ? base64 
              : `data:${mime};base64,${base64}`
            : "";

          const title = c?.categoryName || "Category";
          return {
            id: c?.id ?? idx,
            url,
            title,
            description: c?.description || "",
            slug: slugify(title),
          };
        });

        setCategories(mapped);
      } catch (err) {
        console.error(err);
        setLoadError(
          err?.response?.data?.message ||
            err?.message ||
            "No se pudieron cargar las categorías."
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

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

  const PALETTE = useMemo(() => buildSizePalette(images.length), [images.length]);

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
        if (!grid[r][c]) {
          run++;
        } else {
          if (run > 0) minGap = Math.min(minGap, run);
          run = 0;
        }
      }
      if (run > 0) minGap = Math.min(minGap, run);
    }
    return minGap === 0 ? cols : minGap;
  };

  const chooseAdaptiveSize = (index, minGap) => {
    const base = PALETTE[index % PALETTE.length];
    let w = Math.min(base.w, 2);
    let h = base.h;

    if (minGap === 1) w = 1;
    else if (minGap === 2) w = 2;
    else w = Math.min(w, 2);

    if (h > 1 && index % 3 === 0) {
      h = Math.max(1, h - 1);
    }
    return { w, h };
  };

  const laidOut = useMemo(() => {
    const grid = [];
    const placed = [];

    images.forEach((img, idx) => {
      const minGap = getMinGapWidth(grid, COLS);
      let { w, h } = chooseAdaptiveSize(idx, minGap);

      const candidates = [
        { w, h },
        { w: 1, h },
        { w: 1, h: 1 },
        ...(grid.length === 0 && images.length <= 6 && idx === 0
          ? [{ w: 4, h: 2 }]
          : []),
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

      placed.push({ ...img, ...placedTile });
    });

    return placed;
  }, [images, COLS, PALETTE]);

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
               fill='#9CA3AF' font-family='Verdana' font-size='28'>Sin imagen</text>
       </svg>`
    );

  return (
    <div className="mainContainer">
      <div className="title">
        <h2>Categories</h2>
      </div>

      {loading && <div className="status">Loading Categories…</div>}
      {loadError && <div className="status error">{loadError}</div>}

      <div className="gridContainer">
        {laidOut.map((item) => (
          <div
            key={item.id}
            className="tile"
            style={{
              gridColumn: `${item.colStart} / span ${item.colSpan}`,
              gridRow: `${item.rowStart} / span ${item.rowSpan}`,
            }}
          > 
          {isAdmin && (
            <button
              className="edit-category-btn"
              onClick={(e) => {
                e.stopPropagation();
                console.log("Edit category:");
                // luego puedes navegar a:
                // navigate(`/home/CForm/${category.id}`)
              }}
            >
              ✎ Edit Category
            </button>
          )}
            <Link to={`/places/${item.title}`}>
              <img
                src={item.url || placeholder}
                alt={item.title || "Category"}
                loading="lazy"
              />
            <div className="overlay">
              <h3>{item.title || "Category"}</h3>
              <p>{item.description || ""}</p>
            </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

export default GridTemplate;