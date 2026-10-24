const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "ammu@123",
    database: "collabarative_app"
});

pool.connect()
    .then(client => {
        console.log("PostgreSQL connected successfully");
        client.release();
    })
    .catch(err => {
        console.error("PostgreSQL connection failed:", err);
    });

   

// ----------------------
// Create Tables
// ----------------------

async function createTables() {

    try {

        // Users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        ` );

        console.log("Tables ready");

    } catch (error) {

        console.error("Error creating tables:", error);
    }
}

createTables();


// =====================================================
// REGISTER
// =====================================================

app.post("/register", async (req, res) => {

    try {

        const { username, email, password } = req.body;

        // Validate input
        if (!username || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Username and password are required"
            });
        }


        // Check whether username already exists
        const existingUser = await pool.query(`
            
            SELECT id
            FROM users
            WHERE username = $1
            
            `,[username]
        );


        if (existingUser.rows.length > 0) {

            return res.status(409).json({
                success: false,
                message: "Username already exists"
            });
        }


        // Create user
        const result = await pool.query(`
            
            INSERT INTO users (username,email, password)
            VALUES ($1, $2, $3)
            RETURNING id, username
            
            `,[username,email, password]
        );


        return res.status(201).json({

            success: true,

            message: "User registered successfully",

            user: result.rows[0]
        });

    } catch (error) {

        console.error("Registration error:", error);

        return res.status(500).json({

            success: false,

            message: "Something went wrong"
        });
    }
});


// =====================================================
// LOGIN
// =====================================================

app.post("/login", async (req, res) => {

    try {

        const { username, password } = req.body;


        if (!username || !password) {

            return res.status(400).json({

                success: false,

                message: "Username and password are required"
            });
                }
                 // Find user
        const result = await pool.query(`
            
            SELECT id, username, password
            FROM users
            WHERE username = $1
            `,[username]
        );


        // User doesn't exist
        if (result.rows.length === 0) {

            return res.status(401).json({

                success: false,

                message: "Invalid username or password"
            });
        }


        const user = result.rows[0];


        // Check password
        if (password !== user.password) {

            return res.status(401).json({

                success: false,

                message: "Invalid username or password"
            });
        }


        return res.status(200).json({

            success: true,

            message: "Login successful",

            user: {
                id: user.id,
                username: user.username
            }
        });

    } catch (error) {

        console.error("Login error:", error);

        return res.status(500).json({

            success: false,

            message: "Something went wrong"
        });
    }
});


// =====================================================
// START SERVER
// =====================================================

app.listen(3000, () => {

    console.log("Server running on port 3000");

});