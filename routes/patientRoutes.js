const express = require("express");
const pool = require("../config/db");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const [patients] = await pool.query(`
      SELECT 
        p.*,
        r.room_number
      FROM hrm_patients p
      LEFT JOIN hrm_rooms r ON p.room_id = r.id
      ORDER BY p.created_at DESC
    `);

    res.render("patients/index", {
      title: "Patient Records",
      patients
    });
  } catch (error) {
    console.error(error);

    res.status(500).render("errors/500", {
      title: "Server Error"
    });
  }
});

router.get("/add", requireAuth, async (req, res) => {
  try {
    const [rooms] = await pool.query(
      "SELECT * FROM hrm_rooms WHERE status = 'Available' ORDER BY room_number ASC"
    );

    res.render("patients/add", {
      title: "Add Patient",
      rooms,
      error: null
    });
  } catch (error) {
    console.error(error);

    res.status(500).render("errors/500", {
      title: "Server Error"
    });
  }
});

router.post("/add", requireAuth, async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      date_of_birth,
      gender,
      contact_number,
      condition_notes,
      infection_status,
      isolation_required,
      isolation_priority,
      room_id
    } = req.body;

    const isolationRequired = isolation_required === "on";
    const selectedRoomId = room_id || null;

    await pool.query(
      `INSERT INTO hrm_patients 
      (first_name, last_name, date_of_birth, gender, contact_number, condition_notes, infection_status, isolation_required, isolation_priority, room_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        date_of_birth || null,
        gender,
        contact_number,
        condition_notes,
        infection_status,
        isolationRequired,
        isolation_priority,
        selectedRoomId
      ]
    );

    if (selectedRoomId) {
      await pool.query(
        "UPDATE hrm_rooms SET status = 'Occupied' WHERE id = ?",
        [selectedRoomId]
      );
    }

    res.redirect("/patients");
  } catch (error) {
    console.error(error);

    res.status(500).render("errors/500", {
      title: "Server Error"
    });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const [patients] = await pool.query(
      `SELECT 
        p.*,
        r.room_number,
        r.room_type
      FROM hrm_patients p
      LEFT JOIN hrm_rooms r ON p.room_id = r.id
      WHERE p.id = ?`,
      [req.params.id]
    );

    if (patients.length === 0) {
      return res.status(404).render("errors/404", {
        title: "Patient Not Found"
      });
    }

    res.render("patients/details", {
      title: "Patient Details",
      patient: patients[0]
    });
  } catch (error) {
    console.error(error);

    res.status(500).render("errors/500", {
      title: "Server Error"
    });
  }
});

router.get("/:id/edit", requireAuth, async (req, res) => {
  try {
    const [patients] = await pool.query(
      "SELECT * FROM hrm_patients WHERE id = ?",
      [req.params.id]
    );

    if (patients.length === 0) {
      return res.status(404).render("errors/404", {
        title: "Patient Not Found"
      });
    }

    const [rooms] = await pool.query(
      `SELECT * FROM hrm_rooms
       WHERE status = 'Available' OR id = ?
       ORDER BY room_number ASC`,
      [patients[0].room_id]
    );

    res.render("patients/edit", {
      title: "Edit Patient",
      patient: patients[0],
      rooms,
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
    const [oldPatients] = await pool.query(
      "SELECT room_id FROM hrm_patients WHERE id = ?",
      [req.params.id]
    );

    if (oldPatients.length === 0) {
      return res.status(404).render("errors/404", {
        title: "Patient Not Found"
      });
    }

    const oldRoomId = oldPatients[0].room_id;

    const {
      first_name,
      last_name,
      date_of_birth,
      gender,
      contact_number,
      condition_notes,
      infection_status,
      isolation_required,
      isolation_priority,
      room_id
    } = req.body;

    const isolationRequired = isolation_required === "on";
    const newRoomId = room_id || null;

    await pool.query(
      `UPDATE hrm_patients
       SET first_name = ?, last_name = ?, date_of_birth = ?, gender = ?, contact_number = ?, 
           condition_notes = ?, infection_status = ?, isolation_required = ?, isolation_priority = ?, room_id = ?
       WHERE id = ?`,
      [
        first_name,
        last_name,
        date_of_birth || null,
        gender,
        contact_number,
        condition_notes,
        infection_status,
        isolationRequired,
        isolation_priority,
        newRoomId,
        req.params.id
      ]
    );

    if (oldRoomId && oldRoomId !== Number(newRoomId)) {
      await pool.query(
        "UPDATE hrm_rooms SET status = 'Available' WHERE id = ?",
        [oldRoomId]
      );
    }

    if (newRoomId) {
      await pool.query(
        "UPDATE hrm_rooms SET status = 'Occupied' WHERE id = ?",
        [newRoomId]
      );
    }

    res.redirect("/patients");
  } catch (error) {
    console.error(error);

    res.status(500).render("errors/500", {
      title: "Server Error"
    });
  }
});

router.post("/:id/delete", requireAuth, async (req, res) => {
  try {
    const [patients] = await pool.query(
      "SELECT room_id FROM hrm_patients WHERE id = ?",
      [req.params.id]
    );

    if (patients.length > 0 && patients[0].room_id) {
      await pool.query(
        "UPDATE hrm_rooms SET status = 'Available' WHERE id = ?",
        [patients[0].room_id]
      );
    }

    await pool.query(
      "DELETE FROM hrm_patients WHERE id = ?",
      [req.params.id]
    );

    res.redirect("/patients");
  } catch (error) {
    console.error(error);

    res.status(500).render("errors/500", {
      title: "Server Error"
    });
  }
});

module.exports = router;