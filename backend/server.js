const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const { calcAllHours, calcSummary, calcShift } = require("./calculator");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const seedPath = path.join(__dirname, "seed-data.json");
const seedData = JSON.parse(fs.readFileSync(seedPath, "utf-8"));

function validateInput(volumes, config) {
  const errors = [];

  if (!Array.isArray(volumes) || volumes.length !== 24) {
    errors.push("volumes must be an array of exactly 24 numbers");
  } else {
    volumes.forEach((v, i) => {
      if (typeof v !== "number" || v < 0) {
        errors.push(`volumes[${i}] must be a non-negative number`);
      }
    });
  }

  if (!config || typeof config !== "object") {
    errors.push("config must be an object");
  } else {
    if (typeof config.capacity !== "number" || config.capacity <= 0) {
      errors.push("config.capacity must be a positive number");
    }
    if (typeof config.baseRate !== "number" || config.baseRate <= 0) {
      errors.push("config.baseRate must be a positive number");
    }
    if (
      typeof config.underThreshold !== "number" ||
      config.underThreshold <= 0 ||
      config.underThreshold >= 1
    ) {
      errors.push("config.underThreshold must be a number between 0 and 1");
    }
  }

  return errors;
}

app.get("/seed", (req, res) => {
  res.json({
    corridor: seedData.corridor,
    config: {
      capacity: seedData.capacityPerHour,
      baseRate: seedData.baseRate,
      underThreshold: seedData.underThreshold,
    },
    volumes: seedData.hourlyVolumes,
  });
});

app.post("/simulate", (req, res) => {
  const { volumes, config } = req.body;

  const errors = validateInput(volumes, config);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const hourlyResults = calcAllHours(volumes, config);

  res.json({ hourlyResults });
});

app.post("/summary", (req, res) => {
  const { volumes, config } = req.body;

  const errors = validateInput(volumes, config);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const hourlyResults = calcAllHours(volumes, config);
  const summary = calcSummary(hourlyResults);

  res.json({ summary });
});

app.post("/shift", (req, res) => {
  const { volumes, config, shiftPercent } = req.body;

  const errors = validateInput(volumes, config);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  if (
    typeof shiftPercent !== "number" ||
    shiftPercent < 0 ||
    shiftPercent > 100
  ) {
    return res.status(400).json({
      errors: ["shiftPercent must be a number between 0 and 100"],
    });
  }

  const shiftResult = calcShift(volumes, config, shiftPercent);
  const baseResults = calcAllHours(volumes, config);
  const shiftedSummary = calcSummary(shiftResult.hourlyResults);
  const baseSummary = calcSummary(baseResults);

  res.json({
    baseline: {
      summary: baseSummary,
      hourlyResults: baseResults,
    },
    shifted: {
      summary: shiftedSummary,
      hourlyResults: shiftResult.hourlyResults,
      peakHour: shiftResult.peakHour,
      quietHour: shiftResult.quietHour,
      vehiclesMoved: shiftResult.vehiclesMoved,
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});