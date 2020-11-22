const mysql = require("mysql");
require("dotenv").config();

const connection = mysql.createConnection({
    host: "localhost",
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DB,
    multipleStatements: true,
});

connection.connect(err => {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    createDept();
    createRole();
    createEmployee();
    connection.end();
    
});

function createDept() {
    let query = "INSERT INTO department(name) VALUES ('Engineering'), ('Product'), ('Human Resources'), ('Finance')"

    connection.query(query, function(err, res) {
        if (err) throw err;
        console.log(res);
    });
}

function createRole() {
    let query = "INSERT INTO role(title, salary, department_id) VALUES ('Software Engineer', 150.00, 1), ('Engineering Director', 200.00, 1), ('Quality Assurance Engineer', 115.00, 1), ('Product Manager', 120.00, 2), ('Product Director', 180.00, 2), ('Product Assistant', 750.00, 2), ('HR Business Partner', 800.00, 3), ('HR Director', 120.00,3), ('HR Assistant', 60.00, 3), ('Accounts Payable Specialist', 70.00, 4), ('Financial Analyst', 90.00, 4), ('Finance Director', 160.00, 4)"

    connection.query(query, function(err, res) {
        if (err) throw err;
        console.log(res);
    })
}

function createEmployee() {
    let query = "INSERT INTO employee(first_name, last_name, role_id, manager_id) VALUES ('Kritin', 'Vij', 1, 2), ('Bridget', 'Smith', 2, null), ('Galen', 'Parker', 3, 2), ('Nick', 'Yang', 4, 5), ('Steven', 'Horgan', 5, null), ('Celeste', 'Jones', 6, 5), ('Erica', 'Young', 7, 8), ('Jamie', 'Myers', 8, null), ('Daniel', 'Shen', 9, 8), ('Brittany', 'Peters', 10, 12), ('Eric','Weir', 11, 12), ('Joseph', 'Marx', 12, null)"

    connection.query(query, function(err, res) {
        if (err) throw err;
        console.log(res);
    })
}


 




