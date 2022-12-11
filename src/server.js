const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const cors = require('cors');
const mysql = require('promise-mysql');

const app = express()
const port = 4000

// Remove deprecation warning from console
mongoose.set('strictQuery', true);

/** @type {mysql.Pool} */
var pool;

mysql.createPool({
    connectionLimit: 3,
    user: "umcx0jbxxarkjxfd",
    host: "bn85c5yhtp2agdsayi1q-mysql.services.clever-cloud.com",
    port: 3306,
    password: "s0yIJ9AGFBKgKNjpUWJi",
    database: 'bn85c5yhtp2agdsayi1q'
}).then(p =>
{
    pool = p
}).catch(e =>
{
    console.log("pool error:" + e)
});

app.set('view engine', 'ejs')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(cors());

// Connect to mongodb server
const mongoUsername = "Ethan"
const mongoPass = "ghjk"
const mongodbUri = `mongodb+srv://${mongoUsername}:${mongoPass}@cluster0.n4grbrf.mongodb.net/?retryWrites=true&w=majority`;

mongoose.connect(mongodbUri, { useNewUrlParser: true, useUnifiedTopology: true });

// Get the default connection
const db = mongoose.connection;

// Bind connection to error event (to get notification of connection errors)
db.on("error", console.error.bind(console, "MongoDB connection error:"));

// Connecto to the books database
let employeesDB = db.useDb("employeesDB")

// create a book schema
const employeeSchema = new mongoose.Schema({
    phone: String,
    email: String,
});

// create the books model
const EmployeeModel = employeesDB.model("employees", employeeSchema);

app.listen(port, () =>
{
    console.log(`Example app listening on port ${port}`)
})

app.get('/', (req, res) =>
{
    res.render("home", { errors: undefined })
})

app.get('/employees', async (req, res) =>
{
    let books = await EmployeeModel.find({})
    res.json(books)
});
