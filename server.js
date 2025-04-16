import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mysql from "mysql2/promise";
import { v4 as uuidv4 } from "uuid";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 80;

// Add body parser middleware with increased size limits
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Database configuration matching docker-compose.yml exactly
const dbConfig = {
  host: process.env.DB_HOST || "mysql",
  user: process.env.DB_USER || "user",
  password: process.env.DB_PASSWORD || "password",
  database: process.env.DB_NAME || "cli_pat",
  port: parseInt(process.env.DB_PORT || "3306"),
};

// Create MySQL connection pool
const pool = mysql.createPool(dbConfig);

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
    const connection = await pool.getConnection();

    // Create patients table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS patients (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        age INT NOT NULL,
        sex ENUM('Male', 'Female', 'Other') NOT NULL,
        contact VARCHAR(50),
        diagnosis TEXT,
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create visits table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS visits (
        id VARCHAR(36) PRIMARY KEY,
        patientId VARCHAR(36) NOT NULL,
        date TIMESTAMP NOT NULL,
        diagnosis TEXT,
        prescription TEXT,
        notes TEXT,
        xrayRequired BOOLEAN DEFAULT FALSE,
        fileData LONGTEXT,
        fileName VARCHAR(255),
        fileType VARCHAR(100),
        FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE
      )
    `);

    // Create visit_images table for storing image references
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS visit_images (
        id VARCHAR(36) PRIMARY KEY,
        visitId VARCHAR(36) NOT NULL,
        imageData LONGTEXT NOT NULL,
        FOREIGN KEY (visitId) REFERENCES visits(id) ON DELETE CASCADE
      )
    `);

    connection.release();
    console.log("Database initialized successfully");
    return true;
  } catch (error) {
    console.error("Database initialization error:", error);
    return false;
  }
};

// Parse JSON body
app.use(express.json({ limit: "50mb" }));

// API endpoints
app.get("/api/patients", async (req, res) => {
  try {
    const [patients] = await pool.execute("SELECT * FROM patients");

    // For each patient, get their visits
    const enrichedPatients = await Promise.all(
      patients.map(async (patient) => {
        const [visits] = await pool.execute(
          "SELECT * FROM visits WHERE patientId = ?",
          [patient.id],
        );

        // For each visit, get images
        const enrichedVisits = await Promise.all(
          visits.map(async (visit) => {
            const [images] = await pool.execute(
              "SELECT * FROM visit_images WHERE visitId = ?",
              [visit.id],
            );
            return {
              ...visit,
              date: new Date(visit.date).toISOString(),
              images: images.map((img) => img.imageData),
            };
          }),
        );

        return {
          ...patient,
          createdAt: new Date(patient.createdAt).toISOString(),
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
    const [patients] = await pool.execute(
      "SELECT * FROM patients WHERE id = ?",
      [req.params.id],
    );
    if (patients.length === 0) {
      return res.status(404).json({ error: "Patient not found" });
    }

    const patient = patients[0];

    // Get visits
    const [visits] = await pool.execute(
      "SELECT * FROM visits WHERE patientId = ?",
      [patient.id],
    );

    // For each visit, get images
    const enrichedVisits = await Promise.all(
      visits.map(async (visit) => {
        const [images] = await pool.execute(
          "SELECT * FROM visit_images WHERE visitId = ?",
          [visit.id],
        );
        return {
          ...visit,
          date: new Date(visit.date).toISOString(),
          images: images.map((img) => img.imageData),
        };
      }),
    );

    res.json({
      ...patient,
      createdAt: new Date(patient.createdAt).toISOString(),
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

    // Validate required fields
    if (!name || !age || !sex) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const id = uuidv4();

    // Debug log
    console.log("Creating patient with data:", {
      id,
      name,
      age,
      sex,
      contact,
      diagnosis,
      notes,
    });

    await pool.execute(
      "INSERT INTO patients (id, name, age, sex, contact, diagnosis, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
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

    const setClause = updateFields.map((field) => `${field} = ?`).join(", ");
    const values = updateFields.map((field) => updateData[field]);

    await pool.execute(`UPDATE patients SET ${setClause} WHERE id = ?`, [
      ...values,
      id,
    ]);

    res.json({ success: true });
  } catch (error) {
    console.error("Error updating patient:", error);
    res.status(500).json({ error: "Failed to update patient" });
  }
});

app.delete("/api/patients/:id", async (req, res) => {
  try {
    await pool.execute("DELETE FROM patients WHERE id = ?", [req.params.id]);
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
    } = req.body;
    const visitId = uuidv4();

    await pool.execute(
      "INSERT INTO visits (id, patientId, date, diagnosis, prescription, notes, xrayRequired, fileData, fileName, fileType) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
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
      ],
    );

    // Add images if present
    if (images && images.length > 0) {
      for (const imageData of images) {
        await pool.execute(
          "INSERT INTO visit_images (id, visitId, imageData) VALUES (?, ?, ?)",
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

    const [patients] = await pool.execute(
      "SELECT * FROM patients WHERE LOWER(name) LIKE ? OR LOWER(diagnosis) LIKE ? OR LOWER(notes) LIKE ?",
      [searchQuery, searchQuery, searchQuery],
    );

    // For each patient, get their visits
    const enrichedPatients = await Promise.all(
      patients.map(async (patient) => {
        const [visits] = await pool.execute(
          "SELECT * FROM visits WHERE patientId = ?",
          [patient.id],
        );

        // For each visit, get images
        const enrichedVisits = await Promise.all(
          visits.map(async (visit) => {
            const [images] = await pool.execute(
              "SELECT * FROM visit_images WHERE visitId = ?",
              [visit.id],
            );
            return {
              ...visit,
              date: new Date(visit.date).toISOString(),
              images: images.map((img) => img.imageData),
            };
          }),
        );

        return {
          ...patient,
          createdAt: new Date(patient.createdAt).toISOString(),
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

// Add endpoint to download visit file
app.get("/api/visits/:visitId/file", async (req, res) => {
  try {
    const { visitId } = req.params;
    const [visits] = await pool.execute(
      "SELECT fileData, fileName, fileType FROM visits WHERE id = ?",
      [visitId],
    );

    if (visits.length === 0 || !visits[0].fileData) {
      return res.status(404).json({ error: "File not found" });
    }

    const { fileData, fileName, fileType } = visits[0];

    // Set appropriate headers for file download
    res.setHeader("Content-Type", fileType);
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    // Send base64 decoded file data
    const buffer = Buffer.from(fileData, "base64");
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
