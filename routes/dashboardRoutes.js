const express = require("express");
const pool = require("../config/db");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const [patientRows] = await pool.query(
      "SELECT COUNT(*) AS total FROM hrm_patients"
    );

    const [availableRoomRows] = await pool.query(
      "SELECT COUNT(*) AS total FROM hrm_rooms WHERE status = 'Available'"
    );

    const [isolationRows] = await pool.query(
      "SELECT COUNT(*) AS total FROM hrm_patients WHERE isolation_required = TRUE"
    );

    res.render("dashboard/index", {
      title: "Dashboard",
      stats: {
        patients: patientRows[0].total,
        availableRooms: availableRoomRows[0].total,
        isolationCases: isolationRows[0].total
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).render("errors/500", {
      title: "Server Error"
    });
  }
});

module.exports = router;