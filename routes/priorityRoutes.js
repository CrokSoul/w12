const express = require("express");
const pool = require("../config/db");
const { requireAuth } = require("../middleware/authMiddleware");

const router = express.Router();

function calculatePriority(
  symptomsSeverity,
  infectiousDiseaseSuspected,
  immuneRisk,
  breathingDifficulty
) {
  let score = 0;

  if (symptomsSeverity === "High") score += 3;
  if (symptomsSeverity === "Medium") score += 2;
  if (symptomsSeverity === "Low") score += 1;

  if (infectiousDiseaseSuspected) score += 4;

  if (immuneRisk === "High") score += 3;
  if (immuneRisk === "Medium") score += 2;
  if (immuneRisk === "Low") score += 1;

  if (breathingDifficulty) score += 3;

  let priorityLevel = "Low";

  if (score >= 10) {
    priorityLevel = "Critical";
  } else if (score >= 7) {
    priorityLevel = "High";
  } else if (score >= 4) {
    priorityLevel = "Medium";
  }

  const isolationRequired = score >= 7;

  return {
    score,
    priorityLevel,
    isolationRequired
  };
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const [patients] = await pool.query(
      "SELECT id, first_name, last_name FROM hrm_patients ORDER BY last_name ASC"
    );

    res.render("priority/index", {
      title: "Isolation Priority",
      patients,
      error: null
    });
  } catch (error) {
    console.error(error);

    res.status(500).render("errors/500", {
      title: "Server Error"
    });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const {
      patient_id,
      symptoms_severity,
      infectious_disease_suspected,
      immune_risk,
      breathing_difficulty
    } = req.body;

    const infectiousDiseaseSuspected = infectious_disease_suspected === "yes";
    const breathingDifficultyValue = breathing_difficulty === "yes";

    const result = calculatePriority(
      symptoms_severity,
      infectiousDiseaseSuspected,
      immune_risk,
      breathingDifficultyValue
    );

    await pool.query(
      `INSERT INTO hrm_isolation_assessments
      (patient_id, symptoms_severity, infectious_disease_suspected, immune_risk, breathing_difficulty, priority_score, priority_level, isolation_required)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        patient_id,
        symptoms_severity,
        infectiousDiseaseSuspected,
        immune_risk,
        breathingDifficultyValue,
        result.score,
        result.priorityLevel,
        result.isolationRequired
      ]
    );

    await pool.query(
      `UPDATE hrm_patients
       SET isolation_required = ?, isolation_priority = ?, infection_status = ?
       WHERE id = ?`,
      [
        result.isolationRequired,
        result.priorityLevel,
        infectiousDiseaseSuspected ? "Suspected" : "None",
        patient_id
      ]
    );

    const [patients] = await pool.query(
      "SELECT * FROM hrm_patients WHERE id = ?",
      [patient_id]
    );

    res.render("priority/result", {
      title: "Priority Result",
      patient: patients[0],
      result
    });
  } catch (error) {
    console.error(error);

    res.status(500).render("errors/500", {
      title: "Server Error"
    });
  }
});

module.exports = router;