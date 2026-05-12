const express = require("express");
const app = express();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

let patients = [
  {
    name: "John Smith",
    condition: "Infectious symptoms",
    priority: "High",
    room: "Room 104"
  },
  {
    name: "Emma Jones",
    condition: "Post-surgery monitoring",
    priority: "Medium",
    room: "Pending"
  },
  {
    name: "Michael Brown",
    condition: "General observation",
    priority: "Low",
    room: "Room 212"
  }
];

app.get("/", (req, res) => {
  res.render("index", {
    totalRooms: 40,
    availableRooms: 12,
    occupiedRooms: 28,
    highPriorityPatients: 5,
    patients: patients
  });
});

app.post("/add-patient", (req, res) => {
  const newPatient = {
    name: req.body.name,
    condition: req.body.condition,
    priority: req.body.priority,
    room: req.body.room
  };

  patients.push(newPatient);
  res.redirect("/");
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});