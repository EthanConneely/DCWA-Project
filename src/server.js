const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose');
const cors = require('cors');
const mysql = require('promise-mysql');
const { check, validationResult } = require('express-validator');

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
    _id: String,
    phone: String,
    email: String,
});

// create the books model
const EmployeeModel = employeesDB.model("employees", employeeSchema);

app.listen(port, () =>
{
    console.log(`Example app listening on port ${port}`)
})

// Home page
app.get('/', (req, res) =>
{
    res.render("home", { errors: undefined })
})

// Employees page
app.get('/employees', (req, res) =>
{
    pool.query("select * from employee").then((d) =>
    {
        res.render("employees", { employees: d })
    }).catch((e) =>
    {
        res.redirect("/")
    })
});

// Edit page
app.get('/employees/edit/:eid',
    (req, res) =>
    {
        pool.query("SELECT * FROM employee e WHERE e.eid = '" + req.params.eid + "'").then((d) =>
        {
            console.log(d);
            res.render("employee", { e: d[0], errors: undefined })
        }).catch((e) =>
        {
            res.redirect("/employees")
        })
    }
);

// Edit endpoint
app.post('/employees/edit/:eid',
    [
        check("name").isLength({ min: 5 }).withMessage("Name must be 5 characters long")
    ],
    [
        check("role").isIn(["Manager", "Employee"]).withMessage("Please select valid Role")
    ],
    [
        check("salary").isFloat({ gt: 0 }).withMessage("Salary must be greater than 0")
    ],
    (req, res) =>
    {
        const errors = validationResult(req)

        console.log(req.body);

        let data = {};
        data.eid = req.params.eid;
        data.ename = req.body.name;
        data.role = req.body.role;
        data.salary = req.body.salary;

        if (!errors.isEmpty())
        {
            res.render("employee", { e: data, errors: errors.errors })
        }
        else
        {
            pool.query(`UPDATE employee SET ename='${req.body.name}', role='${req.body.role}', salary='${req.body.salary}' WHERE eid = '${req.params.eid}'`).then((d) =>
            {
                res.redirect("/employees")
            }).catch((e) =>
            {
                res.redirect("/employees")
            })
        }
    }
);

// Deptartments page
app.get('/depts', (req, res) =>
{
    pool.query("SELECT dept.did,dept.dname,loc.county,dept.budget FROM dept JOIN location AS loc ON loc.lid = dept.lid").then((d) =>
    {
        res.render("departments", { departments: d })
    }).catch((e) =>
    {
        res.redirect("/");
    })
});

// Departments page
app.get('/depts/delete/:did', (req, res) =>
{
    pool.query(`DELETE FROM dept WHERE did = '${req.params.did}';`).then((d) =>
    {
        console.log(d);
    }).catch(() =>
    {
        res.status(400).send(
            `<div style="text-align:center;">
                <h1>Error Message</h1>
                <h2>${req.params.did} has Employees and connot be deleted</h2>
                <a href="/depts">Home</a>
            </div>`)
    })
});

// Employees (Mongodb) page
app.get('/employeesMongoDB', async (req, res) =>
{
    let result = await EmployeeModel.find({})
    console.log(result);
    res.render("Mongodb/employees", { employees: result });
});
