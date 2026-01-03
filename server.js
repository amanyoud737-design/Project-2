import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== ENV =====
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const SESSION_SECRET = process.env.SESSION_SECRET || "change-this-session-secret";
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || "";
const CURRENCY = process.env.CURRENCY || "USD";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDir = process.cwd();



// Basic middleware
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    name: "sgsid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 12,
    },
  })
);

// Health check for Render
app.get("/health", (req, res) => res.json({ ok: true }));

// Public config for frontend (safe to expose)
app.get("/config.json", (req, res) => {
  res.json({
    PAYPAL_CLIENT_ID,
    CURRENCY,
  });
});

// Admin auth APIs
app.post("/api/admin/login", (req, res) => {
  const password = String(req.body.password || "");
  if (!ADMIN_PASSWORD) {
    return res.status(500).json({ ok: false, error: "ADMIN_PASSWORD not set" });
  }
  if (password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.json({ ok: true });
  }
  return res.status(401).json({ ok: false, error: "Wrong password" });
});

app.post("/api/admin/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get("/api/me", (req, res) => {
  res.json({ isAdmin: !!req.session.isAdmin });
});

// Simple templates API (in-memory demo). Replace with DB later.
let templates = [
  {
    id: "t1",
    name: "Modern Blue",
    price: 5,
    maxSlides: 12,
    thumbnail: "assets/template1.png",
    createdAt: Date.now(),
  },
  {
    id: "t2",
    name: "Dark Pitch",
    price: 8,
    maxSlides: 15,
    thumbnail: "assets/template2.png",
    createdAt: Date.now(),
  },
];

app.get("/api/templates", (req, res) => {
  res.json({ templates });
});

app.post("/api/templates", (req, res) => {
  if (!req.session.isAdmin) return res.status(401).json({ ok: false, error: "Unauthorized" });
  const { name, price, maxSlides, thumbnail } = req.body || {};
  if (!name) return res.status(400).json({ ok: false, error: "name required" });
  const t = {
    id: "t" + Math.random().toString(16).slice(2),
    name: String(name),
    price: Number(price || 0),
    maxSlides: Number(maxSlides || 10),
    thumbnail: String(thumbnail || ""),
    createdAt: Date.now(),
  };
  templates.unshift(t);
  res.json({ ok: true, template: t });
});

app.delete("/api/templates/:id", (req, res) => {
  if (!req.session.isAdmin) return res.status(401).json({ ok: false, error: "Unauthorized" });
  const id = req.params.id;
  templates = templates.filter((t) => t.id !== id);
  res.json({ ok: true });
});

// Serve static frontend
app.use(express.static(frontendDir));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ SlideGenius Clean running on port ${PORT}`);
});
