const express = require("express");
const bcrypt = require("bcrypt");
const pool = require("../config/db");

const router = express.Router();

router.get("/login", (req, res) => {
  res.render("auth/login", {
    title: "Login",
    error: null
  });
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [users] = await pool.query(
      "SELECT * FROM hrm_users WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.render("auth/login", {
        title: "Login",
        error: "Invalid email or password."
      });
    }

    const user = users[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.render("auth/login", {
        title: "Login",
        error: "Invalid email or password."
      });
    }

    req.session.user = {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role
    };

    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).render("errors/500", {
      title: "Server Error"
    });
  }
});

router.get("/register", (req, res) => {
  res.render("auth/register", {
    title: "Register",
    error: null
  });
});

router.post("/register", async (req, res) => {
  try {
    const { full_name, email, password, role } = req.body;

    if (!full_name || !email || !password || !role) {
      return res.render("auth/register", {
        title: "Register",
        error: "Please complete all fields."
      });
    }

    const allowedRoles = ["admin", "doctor", "nurse"];

    if (!allowedRoles.includes(role)) {
      return res.render("auth/register", {
        title: "Register",
        error: "Invalid role selected."
      });
    }

    const [existingUsers] = await pool.query(
      "SELECT id FROM hrm_users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.render("auth/register", {
        title: "Register",
        error: "This email is already registered."
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO hrm_users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)",
      [full_name, email, passwordHash, role]
    );

    res.redirect("/login");
  } catch (error) {
    console.error(error);
    res.status(500).render("errors/500", {
      title: "Server Error"
    });
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

module.exports = router;