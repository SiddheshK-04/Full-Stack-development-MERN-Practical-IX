// ==========================================
// PRACTICAL 9: USER MANAGEMENT SYSTEM
// ==========================================

// ==========================================
// FILE: server.js
// BACKEND - EXPRESS + MONGODB
// ==========================================

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/UserDB")
  .then(() => console.log("MongoDB Connected"))
  .catch((error) => console.log(error));

// GET - Retrieve all users
app.get("/users", async (req, res) => {
  try {
    const users = await mongoose.connection.db
      .collection("users").find().toArray();

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// POST - Add a new user
app.post("/users", async (req, res) => {
  try {
    await mongoose.connection.db.collection("users")
      .insertOne(req.body);

    res.json({ message: "User added successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error adding user" });
  }
});

// PUT - Update an existing user
app.put("/users/:id", async (req, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);

    await mongoose.connection.db.collection("users")
      .updateOne(
        { _id: id },
        {
          $set: {
            name: req.body.name,
            email: req.body.email,
            city: req.body.city
          }
        }
      );

    res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating user" });
  }
});

// DELETE - Delete a user
app.delete("/users/:id", async (req, res) => {
  try {
    const id = new mongoose.Types.ObjectId(req.params.id);

    await mongoose.connection.db.collection("users")
      .deleteOne({ _id: id });

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// ==========================================
// FILE: frontend/src/App.jsx
// FRONTEND - REACT + AXIOS
// ==========================================

import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  // Store all users
  const [users, setUsers] = useState([]);

  // Form data
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");

  // Store ID of user being edited
  const [editId, setEditId] = useState(null);

  // Get Users from MongoDB
  const getUsers = () => {
    axios.get("http://localhost:3000/users")
      .then((response) => {
        setUsers(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // Load users when page starts
  useEffect(() => {
    getUsers();
  }, []);

  // Add or Update User
  const saveUser = () => {
    const user = {
      name: name,
      email: email,
      city: city
    };

    // UPDATE existing user
    if (editId) {
      axios.put(`http://localhost:3000/users/${editId}`, user)
        .then((response) => {
          alert(response.data.message);
          clearForm();
          getUsers();
        })
        .catch((error) => {
          console.log(error);
        });
    }

    // ADD new user
    else {
      axios.post("http://localhost:3000/users", user)
        .then((response) => {
          alert(response.data.message);
          clearForm();
          getUsers();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  // Edit User
  const editUser = (user) => {
    setEditId(user._id);
    setName(user.name);
    setEmail(user.email);
    setCity(user.city);
  };

  // Delete User
  const deleteUser = (id) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      axios.delete(`http://localhost:3000/users/${id}`)
        .then((response) => {
          alert(response.data.message);
          getUsers();
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  // Clear Form
  const clearForm = () => {
    setName("");
    setEmail("");
    setCity("");
    setEditId(null);
  };

  return (
    <div>
      <h1>User Management System</h1>

      {/* User Form */}
      <h2>{editId ? "Update User" : "Add User"}</h2>

      <input
        type="text"
        placeholder="Enter Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <br /><br />

      <input
        type="email"
        placeholder="Enter Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />

      <input
        type="text"
        placeholder="Enter City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <br /><br />

      <button onClick={saveUser}>
        {editId ? "Update User" : "Add User"}
      </button>

      {editId && (
        <button onClick={clearForm}>
          Cancel
        </button>
      )}

      <hr />

      {/* Display Users */}
      <h2>User List</h2>

      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>City</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.city}</td>
              <td>
                <button onClick={() => editUser(user)}>
                  Edit
                </button>

                <button onClick={() => deleteUser(user._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;


// ==========================================
// FILE: frontend/src/main.jsx
// REACT ENTRY POINT (VITE DEFAULT)
// ==========================================

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);


// ==========================================
// MONGODB DATABASE SETUP
// DATABASE: UserDB
// COLLECTION: users
// SAMPLE DOCUMENTS
// ==========================================

// Insert these documents in MongoDB Compass
/*
{
  "name": "Radhika Pal",
  "email": "radhika@gmail.com",
  "city": "Mumbai"
}
{
  "name": "Raj Prajapati",
  "email": "raj@gmail.com",
  "city": "Pune"
}
{
  "name": "Luvkush Vish",
  "email": "luvkush@gmail.com",
  "city": "Nashik"
}
*/


// ==========================================
// COMMANDS TO RUN THE PROJECT
// ==========================================

// BACKEND:
// npm init -y
// npm install express mongoose cors
// node server.js

// FRONTEND:
// npm create vite@latest frontend
// Select React -> JavaScript
// cd frontend
// npm install
// npm install axios
// npm run dev
