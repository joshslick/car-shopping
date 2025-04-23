var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
var multer = require("multer");
var path = require("path");
var fs = require("fs");

var app = express();
var port = 3000; // Define your desired port
var host = "127.0.0.1"; // Define your desired host

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads")); // Serve images statically

// Database connection
const mysql = require("mysql2");
const db = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "password1!",
  database: "secoms3190",
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed: " + err.message);
  } else {
    console.log("Connected to the database");
  }
});

// Set up multer for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save images in the 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  },
});
const upload = multer({ storage: storage });

// Ensure "uploads" folder exists
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
  console.log("Created 'uploads' folder.");
}



// API endpoint
app.get("/contact", (req, res) => {
  try {
    db.query("SELECT * FROM contact", (err, result) => {
      if (err) {
        console.error("Error reading all contacts:", err);
        return res.status(500).send({ error: "Error reading all contacts" });
      }
      res.status(200).send(result);
    });
  } catch (err) {
    console.error("An unexpected error occurred:", err);
    res.status(500).send({ error: "An unexpected error occurred" });
  }
});

app.post("/contact", upload.single("image"), (req, res) => {
  const { contact_name, phone_number, message } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  const query = "INSERT INTO contact (contact_name, phone_number, message, image_url) VALUES (?, ?, ?, ?)";
  const checkQuery = "SELECT * FROM contact WHERE contact_name = ?";

  // First, check if the contact name already exists
  db.query(checkQuery, [contact_name], (checkErr, checkResult) => {
    if (checkErr) {
      console.error("Database error during validation:", checkErr);
      return res.status(500).send({ error: "Error checking contact name: " + checkErr.message });
    }

    if (checkResult.length > 0) {
      // If contact_name exists, send a conflict response
      return res.status(409).send({ error: "Contact name already exists." });
    }

    // Proceed with inserting the contact if the name doesn't exist
    db.query(query, [contact_name, phone_number, message, imageUrl], (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).send({ error: "Error adding contact: " + err });
      } else {
        return res.status(201).send("Contact added successfully");
      }
    });
  });
});

app.delete("/contact/:id", (req, res) => {
  const id = req.params.id;

  const query = "DELETE FROM contact WHERE id = ?";
  
  db.query(query, [id], (err, result) => {
    if (err) {
      console.error("Error deleting contact:", err);
      return res.status(500).send({ error: "Error deleting contact" });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).send({ error: "Contact not found" });
    }
    
    return res.status(200).send("Contact deleted successfully");
  });
});

app.put("/contact/:id", (req, res) => {
  const id = req.params.id;
  const { contact_name, phone_number, message } = req.body; // Extract values from request body

  const query = `
    UPDATE contact
    SET contact_name = ?, phone_number = ?, message = ?
    WHERE id = ?
  `;
  
  db.query(query, [contact_name, phone_number, message, id], (err, result) => {
    if (err) {
      console.error("Error updating contact:", err);
      return res.status(500).send({ error: "Error updating contact" });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).send({ error: "Contact not found" });
    }
    
    return res.status(200).send("Contact updated successfully");
  });
});


app.get("/contact/name", (req, res) => { 
  const { contact_name } = req.query;

  // Check if the contact_name query parameter is provided
  if (!contact_name) {
    return res.status(400).send({ error: "contact_name is required" });
  }

  // Query to search for exact or partial matches, case-insensitive
  const query = "SELECT * FROM contact WHERE LOWER(contact_name) LIKE LOWER(?)";
  const searchValue = `%${contact_name}%`; // Add wildcards for partial match

  db.query(query, [searchValue], (err, result) => {
    if (err) {
      console.error("Error fetching contacts:", err);
      return res.status(500).send({ error: "Error fetching contacts" });
    }

    // Send the result as the response
    res.status(200).send(result);
  });
});

app.post("/contact/login", (req, res) => {
  const { username, password } = req.body;

  // Check for missing username or password
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password are required." });
  }

  // SQL query to check the username and password
  const query = "SELECT role FROM user WHERE user = ? AND password = ?";

  db.query(query, [username, password], (err, results) => {
    if (err) {
      console.error("Database error during login:", err);
      return res.status(500).json({ error: "An error occurred. Please try again." });
    }

    // Check if no results are returned
    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid username or password." });
    }

    // Respond with the role if login is successful
    const { role } = results[0];
    return res.status(200).json({ role });
  });
});

app.get('/contact/messages/:contactId', (req, res) => { 
  const { contactId } = req.params;

  const query = "SELECT * FROM message WHERE contact_id = ? ORDER BY message_timestamp DESC";

  // Database query
db.query(query,[contactId],(err,results)=>{
  if (err){
  console.error("Error fetching Messages:", err);
  return res.status(500).send({ error: "Error fetching Messages"+err });
  }
  console.log(results);
  res.status(200).json(results);
  });
});
  
app.post('/contact/messages', (req, res) => {
  try {
    const { contactId, message } = req.body;

    const query = "INSERT INTO message (contact_id, message, message_timestamp) VALUES (?, ?, NOW())";

    db.query(query, [contactId, message], (err, results) => {
      if (err) {
        // Log the error and send a 409 response
        console.error("Error in /contact/messages", err);
        res.status(409).send({ error: "Error adding message: " + err });
      } else {
        // Send a success response
        res.status(201).send("Message added successfully");
      }
    });
  } catch (err) {
    // Catch unexpected errors
    console.error("Unexpected error in /contact/messages", err);
    res.status(500).send({ error: 'Unexpected error: ' + err });
  }
});

app.get('/contact/profile_picture/:contact_name', (req, res) => { 
  try{
  const contact_name = req.params.contact_name;
  const query = "SELECT image_url FROM contact WHERE contact_name = ?";
  db.query(query, [contact_name], (err, result)=>{
    if (err) {
    console.log({error:"Error in Profile Picture"});
    return res.status(500).send({ error: "Error fetching Profile Picture :"+err });
    } else if (result.length) {
    console.log(result);
    res.json({ picture: result[0].image_url }); // return local url
    } else {
    res.status(404).send({ error: 'Profile picture not found' });
    }
    });
  }catch (err) {
    console.error("Error fetching profile picture:", err);
    res.status(500).send({ error: 'Error fetching profile picture :'+ err });
    }
    
 });

// Start the server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});