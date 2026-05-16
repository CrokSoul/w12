const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const session = require("express-session");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const methodOverride = require("method-override");

dotenv.config();

const app = express();

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

const dashboardRoutes = require("./routes/dashboardRoutes");
const authRoutes = require("./routes/authRoutes");
const patientRoutes = require("./routes/patientRoutes");
const roomRoutes = require("./routes/roomRoutes");
const priorityRoutes = require("./routes/priorityRoutes");

app.use(helmet());

if (process.env.NODE_ENV === "production") {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: "Too many requests. Please try again later."
  });

  app.use(limiter);
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "temporary_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    }
  })
);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  res.locals.currentUser = req.session.user || null;
  next();
});

app.use("/", dashboardRoutes);
app.use("/", authRoutes);
app.use("/patients", patientRoutes);
app.use("/rooms", roomRoutes);
app.use("/priority", priorityRoutes);

app.use((req, res) => {
  res.status(404).render("errors/404", {
    title: "Page Not Found"
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).render("errors/500", {
    title: "Server Error"
  });
});

const PORT = process.env.PORT || 3045;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});