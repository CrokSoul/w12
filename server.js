const express = require("express");
const app = express();

app.set("view engine", "ejs");

const patients = [
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
    highPriorityPatients: 5,
    patients: patients
  });
});

app.listen(3045, () => {
  console.log("Example app listening on port 3045");
});