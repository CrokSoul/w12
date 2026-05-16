const express = require("express");
const pool = require("../config/db");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const [rooms] = await pool.query(
      "SELECT * FROM hrm_rooms ORDER BY room_number ASC"
    );

    res.render("rooms/index", {
      title: "Room Availability",
      rooms
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("errors/500", {
      title: "Server Error"
    });
  }
});

router.get("/add", requireAuth, (req, res) => {
  res.render("rooms/add", {
    title: "Add Room",
    error: null
  });
});

router.post("/add", requireAuth, async (req, res) => {
  try {
    const { room_number, room_type, status, notes } = req.body;

    await pool.query(
      "INSERT INTO hrm_rooms (room_number, room_type, status, notes) VALUES (?, ?, ?, ?)",
      [room_number, room_type, status, notes]
    );

    res.redirect("/rooms");
  } catch (error) {
    console.error(error);

    res.render("rooms/add", {
      title: "Add Room",
      error: "Could not add room. Room number may already exist."
    });
  }
});

router.get("/:id/edit", requireAuth, async (req, res) => {
  try {
    const [rooms] = await pool.query(
      "SELECT * FROM hrm_rooms WHERE id = ?",
      [req.params.id]
    );

    if (rooms.length === 0) {
      return res.status(404).render("errors/404", {
        title: "Room Not Found"
      });
    }

    res.render("rooms/edit", {
      title: "Edit Room",
      room: rooms[0],
      error: null
    });
  } catch (error) {
    console.error(error);

    res.status(500).render("errors/500", {
      title: "Server Error"
    });
  }
});

router.post("/:id/edit", requireAuth, async (req, res) => {
  try {
    const { room_number, room_type, status, notes } = req.body;

    await pool.query(
      "UPDATE hrm_rooms SET room_number = ?, room_type = ?, status = ?, notes = ? WHERE id = ?",
      [room_number, room_type, status, notes, req.params.id]
    );

    res.redirect("/rooms");
  } catch (error) {
    console.error(error);

    res.status(500).render("errors/500", {
      title: "Server Error"
    });
  }
});

router.post("/:id/delete", requireAuth, async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM hrm_rooms WHERE id = ?",
      [req.params.id]
    );

    res.redirect("/rooms");
  } catch (error) {
    console.error(error);

    res.status(500).render("errors/500", {
      title: "Server Error"
    });
  }
});

module.exports = router;