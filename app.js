const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require("console.table");
require("dotenv").config();

const connection = mysql.createConnection({
    host: "localhost",
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DB,
    multipleStatements: true,
});

connection.connect(function(err) {
    if (err) throw err;
    start();
});

function start() {
    inquirer.prompt({
        name:"action",
        type: "list",
        message: "What would you like to do?",
        choices: [
            "View All Employees",
            "View All Employees by Department",
            "View All Employees by Manager",
            "Add Employee",
            "Remove Employee",
            "Update Employee Role",
            "Update Employee Manager",
            "View All Roles",
            "Add Role",
            "Remove Role",
            "Quit"
        ]
    }).then(function(response) {

        switch(response.action) {
            case "View All Employees":
                allEmployees("ORDER BY ID"); 
                break;
            case "View All Employees by Department":
                employeeByDept();
                break;
        }
    })
}

function allEmployees(request) {

    connection.query(`SELECT e.id AS ID, e.first_name AS 'First Name', e.last_name AS 'Last Name', r.title AS Role, d.name AS Department, r.salary AS Salary, CONCAT(m.first_name,' ',m.last_name) AS Manager FROM employee e LEFT JOIN role r ON e.role_id = r.id LEFT JOIN department d ON r.department_id = d.id LEFT JOIN employee m ON e.manager_id = m.id ${request}`, function(err, res)
        {
            if (err) throw err;
            console.table(res);
            start();
        })      
}

function employeeByDept() {

    inquirer.prompt({
        name:"department",
        type: "list",
        message: "Please select a Department.",
        choices: function() {
            let choiceArray = [];
            connection.query("SELECT name from department", function(err, results) {
                if (err) throw err;
                for (let i = 0; i < results.length; i++) {
                    choiceArray.push(results[i].name);
                }
                return choiceArray;
            })
        }
        // [
        //     "Engineering",
        //     "Product",
        //     "Human Resources",
        //     "Finance"
        // ]
    }).then(function(response) {
    
        allEmployees(`WHERE d.name = "${response.department}"`); 
    })   
}