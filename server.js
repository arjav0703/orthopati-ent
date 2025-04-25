import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { Pool } from "pg"; // PostgreSQL driver
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";
import path from "path";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

const PORT = process.env.PORT || 80;

// Add body parser middleware with increased size limits
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "user",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "cli_pat",
  port: parseInt(process.env.DB_PORT || "5432"),
};

// Create PostgreSQL connection pool
const pool = new Pool(dbConfig);

console.log("Using database config:", {
  host: dbConfig.host,
  user: dbConfig.user,
  database: dbConfig.database,
  port: dbConfig.port,
  // Not logging password for security
});

// Initialize database
const initDatabase = async () => {
  try {
    const client = await pool.connect();

    // Create patients table
    await client.query(`
      CREATE TABLE IF NOT EXISTS patients (
        id UUID PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        age INT NOT NULL,
        sex VARCHAR(10) NOT NULL CHECK (sex IN ('Male', 'Female', 'Other')),
        contact VARCHAR(50),
        diagnosis TEXT,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create visits table
    await client.query(`
      CREATE TABLE IF NOT EXISTS visits (
        id UUID PRIMARY KEY,
        patientId UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
        date TIMESTAMP NOT NULL,
        diagnosis TEXT,
        medications JSONB,
        prescription TEXT,
        notes TEXT,
        xrayRequired BOOLEAN DEFAULT FALSE,
        fileData TEXT,
        fileName VARCHAR(255),
        fileType VARCHAR(100)
      )
    `);

    // Create visit_images table for storing image references
    await client.query(`
      CREATE TABLE IF NOT EXISTS visit_images (
        id UUID PRIMARY KEY,
        visitId UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
        imageData TEXT NOT NULL
      )
    `);

    client.release();
    console.log("Database initialized successfully");
    return true;
  } catch (error) {
    console.error("Database initialization error:", error);
    return false;
  }
};

// API endpoints
app.get("/api/patients", async (req, res) => {
  try {
    const { rows: patients } = await pool.query("SELECT * FROM patients");

    // For each patient, get their visits
    const enrichedPatients = await Promise.all(
      patients.map(async (patient) => {
        const { rows: visits } = await pool.query(
          "SELECT * FROM visits WHERE patientId = $1",
          [patient.id],
        );

        // For each visit, get images
        const enrichedVisits = await Promise.all(
          visits.map(async (visit) => {
            const { rows: images } = await pool.query(
              "SELECT * FROM visit_images WHERE visitId = $1",
              [visit.id],
            );
            return {
              ...visit,
              date: new Date(visit.date).toISOString(),
              images: images.map((img) => img.imagedata),
            };
          }),
        );

        return {
          ...patient,
          createdAt: new Date(patient.createdat).toISOString(),
          visits: enrichedVisits,
        };
      }),
    );

    res.json(enrichedPatients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

app.get("/api/patients/:id", async (req, res) => {
  try {
    const { rows: patients } = await pool.query(
      "SELECT * FROM patients WHERE id = $1",
      [req.params.id],
    );
    if (patients.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const patient = patients[0];

    // Get visits
    const { rows: visits } = await pool.query(
      "SELECT * FROM visits WHERE patientId = $1",
      [patient.id],
    );

    // For each visit, get images
    const enrichedVisits = await Promise.all(
      visits.map(async (visit) => {
        const { rows: images } = await pool.query(
          "SELECT * FROM visit_images WHERE visitId = $1",
          [visit.id],
        );
        return {
          ...visit,
          date: new Date(visit.date).toISOString(),
          images: images.map((img) => img.imagedata),
        };
      }),
    );

    res.json({
      ...patient,
      createdAt: new Date(patient.createdat).toISOString(),
      visits: enrichedVisits,
    });
  } catch (error) {
    console.error("Error fetching patient:", error);
    res.status(500).json({ error: "Failed to fetch patient" });
  }
});

app.post("/api/patients", async (req, res) => {
  try {
    const { name, age, sex, contact, diagnosis, notes } = req.body;

    if (!name || !age || !sex) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const id = uuidv4();

    await pool.query(
      "INSERT INTO patients (id, name, age, sex, contact, diagnosis, notes) VALUES ($1, $2, $3, $4, $5, $6, $7)",
      [id, name, age, sex, contact || null, diagnosis || null, notes || null],
    );

    res.status(201).json({ id });
  } catch (error) {
    console.error("Error creating patient:", error);
    res.status(500).json({ error: "Failed to create patient" });
  }
});

app.put("/api/patients/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const updateData = req.body;

    const updateFields = Object.keys(updateData).filter((key) =>
      ["name", "age", "sex", "contact", "diagnosis", "notes"].includes(key),
    );

    if (updateFields.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    const setClause = updateFields
      .map((field, index) => `${field} = $${index + 1}`)
      .join(", ");
    const values = updateFields.map((field) => updateData[field]);

    await pool.query(
      `UPDATE patients SET ${setClause} WHERE id = $${values.length + 1}`,
      [...values, id],
    );

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating patient:", error);
    res.status(500).json({ error: "Failed to update patient" });
  }
});

app.delete("/api/patients/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM patients WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting patient:", error);
    res.status(500).json({ error: "Failed to delete patient" });
  }
});

app.post("/api/patients/:patientId/visits", async (req, res) => {
  try {
    const { patientId } = req.params;
    const {
      date,
      diagnosis,
      prescription,
      notes,
      xrayRequired,
      images,
      fileData,
      fileName,
      fileType,
      medications,
    } = req.body;
    const visitId = uuidv4();

    await pool.query(
      "INSERT INTO visits (id, patientId, date, diagnosis, prescription, notes, xrayRequired, fileData, fileName, fileType, medications) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)",
      [
        visitId,
        patientId,
        new Date(date),
        diagnosis || null,
        prescription || null,
        notes || null,
        xrayRequired || false,
        fileData || null,
        fileName || null,
        fileType || null,
        JSON.stringify(medications),
      ],
    );

    if (images && images.length > 0) {
      for (const imageData of images) {
        await pool.query(
          "INSERT INTO visit_images (id, visitId, imageData) VALUES ($1, $2, $3)",
          [uuidv4(), visitId, imageData],
        );
      }
    }

    res.status(201).json({ id: visitId });
  } catch (error) {
    console.error("Error creating visit:", error);
    res.status(500).json({ error: "Failed to create visit" });
  }
});

app.get("/api/search", async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.json([]);
    }

    const searchQuery = `%${query.toLowerCase()}%`;

    const { rows: patients } = await pool.query(
      "SELECT * FROM patients WHERE LOWER(name) LIKE $1 OR LOWER(diagnosis) LIKE $2 OR LOWER(notes) LIKE $3",
      [searchQuery, searchQuery, searchQuery],
    );

    const enrichedPatients = await Promise.all(
      patients.map(async (patient) => {
        const { rows: visits } = await pool.query(
          "SELECT * FROM visits WHERE patientId = $1",
          [patient.id],
        );

        const enrichedVisits = await Promise.all(
          visits.map(async (visit) => {
            const { rows: images } = await pool.query(
              "SELECT * FROM visit_images WHERE visitId = $1",
              [visit.id],
            );
            return {
              ...visit,
              date: new Date(visit.date).toISOString(),
              medications: JSON.parse(visit.medications || "[]"),
              images: images.map((img) => img.imagedata),
            };
          }),
        );

        return {
          ...patient,
          createdAt: new Date(patient.createdat).toISOString(),
          visits: enrichedVisits,
        };
      }),
    );

    res.json(enrichedPatients);
  } catch (error) {
    console.error("Error searching patients:", error);
    res.status(500).json({ error: "Failed to search patients" });
  }
});

app.get("/api/visits/:visitId/file", async (req, res) => {
  try {
    const { visitId } = req.params;
    const { rows: visits } = await pool.query(
      "SELECT fileData, fileName, fileType FROM visits WHERE id = $1",
      [visitId],
    );

    if (visits.length === 0 || !visits[0].filedata) {
      return res.status(404).json({ error: "File not found" });
    }

    const { filedata, filename, filetype } = visits[0];

    res.setHeader("Content-Type", filetype);
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    const buffer = Buffer.from(filedata, "base64");
    res.send(buffer);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).json({ error: "Failed to download file" });
  }
});

// Initialize database on startup
initDatabase().then((initialized) => {
  console.log(
    "Database initialization status:",
    initialized ? "Success" : "Failed",
  );
});

// Serve static files from the dist directory
app.use(express.static(join(__dirname, "dist")));

// Return the React app for any other requests
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "dist", "index.html"));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
