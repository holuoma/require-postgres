require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const client = require("./client");
const app = express();

app.use(bodyParser.json());

// Defining the database connection information explicitely:
// const pool = new Pool({
//   user: process.env.PGUSER,
//   host: process.env.PGHOST,
//   database: process.env.PGDATABASE,
//   password: process.env.PGPASSWORD,
//   port: process.env.PGPORT
// });

app.get("/", (req, res) => {
  // res.send("Welcome to the Jungle!");

  // Using node pg callback syntax:
  // pool.query("SELECT NOW()", (err, sqlResponse) => {
  //   if (err) return res.sendStatus(500);
  //   res.send(sqlResponse.rows[0]);
  // });

  // Using node pg promise syntax:
  client
    .query("SELECT NOW()")
    .then((data) => res.send(data.rows[0]))
    .catch((err) => res.sendStatus(500));
});

app.get("/api/students", (req, res) => {
  client
    .query("SELECT * FROM students")
    .then((data) => res.json(data.rows))
    .catch((err) => console.log(err));
});

app.get("/api/students/:id", (req, res) => {
  const { id } = req.params;
  client
    .query("SELECT * FROM students WHERE id=$1", [id])
    .then((data) => res.json(data.rows))
    .catch((err) => console.log(err));
});

app.post("/api/students", (req, res) => {
  const { first_name, last_name, instructor_id, course_name } = req.body;
  const text =
    "INSERT INTO students(first_name, last_name, instructor_id, course_name) VALUES ($1, $2, $3, $4) RETURNING *";
  const values = [first_name, last_name, instructor_id, course_name];
  client
    .query(text, values)
    .then((data) => res.json(data.rows))
    .catch((err) => console.log(err));
});

app.put("/api/students/:id", (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, instructor_id, course_name } = req.body;
  // 1/ bunch of validations to check the information sent by the client
  // 2/ Check if the student actually exists before updating
  // 3/ Update the student
  const text =
    "UPDATE students SET first_name=$1, last_name=$2, instructor_id=$3, course_name=$4 WHERE id=$5 RETURNING *";
  const values = [first_name, last_name, instructor_id, course_name, id];
  client
    .query(text, values)
    .then((data) => res.json(data.rows))
    .catch((err) => console.log(err));
});

app.delete("/api/students/:id", (req, res) => {
  const { id } = req.params;
  client
    .query("DELETE FROM students WHERE id=$1 RETURNING *", [id])
    .then((data) => res.json(data.rows))
    .catch((err) => console.log(err));
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
