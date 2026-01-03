import express from "express";
import session from "express-session";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== ENV =====
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "CHANGE_ME";
const SESSION_SECRET = process.env.SESSION_SECRET || "CHANGE_SESSION_SECRET";
const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || ""; // Sandbox/Live Client ID
const CURRENCY = process.env.CURRENCY || "USD";

// ===== paths =====
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = __dirname;

// Render/Proxy
app.set("trust proxy", 1);

// Security
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());

// Rate limit
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300
  })
);

// Body
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

// Sessions (MUST be before routes)
app.use(
  session({
    name: "sgsid",
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    }
  })
);

// Public config for frontend
app.get("/config.js", (req, res) => {
  res.type("application/javascript");
  res.send(
    `window.__SG_CONFIG__=${JSON.stringify({
      PAYPAL_CLIENT_ID,
      CURRENCY
    })};`
  );
});

// Health
app.get("/health", (req, res) => res.json({ ok: true }));

// Auth helper
function requireAdmin(req, res, next) {
  if (req.session?.isAdmin) return next();
  return res.redirect("/admin-login.html");
}

// Admin APIs
app.post("/api/admin/login", (req, res) => {
  const password = String(req.body.password || "");
  if (password && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.json({ ok: true });
  }
  return res.status(401).json({ ok: false, message: "Wrong password" });
});

app.post("/api/admin/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get("/api/me", (req, res) => {
  res.json({ isAdmin: !!req.session?.isAdmin });
});

// Admin page (protected)
app.get("/admin", requireAdmin, (req, res) => {
  res.sendFile(path.join(publicDir, "admin.html"));
});

// Static
app.use(express.static(publicDir));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(publicDir, "index.html"));
});

app.listen(PORT, () => {
  console.log(`✅ Running on port ${PORT}`);
});

