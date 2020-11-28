const mysql = require("mysql2");
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
            "Update Employee Role",
            "View All Roles",
            "Add Role",
            "Add Department",
            "Quit"
        ]
    }).then(function(response) {

        switch(response.action) {
            case "View All Employees":
                allEmployees(); 
                break;
            case "View All Employees by Department":
                employeeByDept();
                break;
            case "View All Employees by Manager":
                employeeByManage();
                break;
            case "Add Employee":    
                addEmployee();
                break;  
            case "Update Employee Role":    
                updateRole();
                break;       
            case "View All Roles":    
                viewAllRoles();
                break; 
            case "Add Role":    
                addRole();
                break;     
        }
    })
}

const query = "SELECT e.id AS ID, e.first_name AS 'First Name', e.last_name AS 'Last Name', r.title AS Role, d.name AS Department, r.salary AS Salary, CONCAT(m.first_name,' ',m.last_name) AS Manager FROM employee e LEFT JOIN role r ON e.role_id = r.id LEFT JOIN department d ON r.department_id = d.id LEFT JOIN employee m ON e.manager_id = m.id"


function allEmployees(request) {

    connection.query(query, [request], function(err, res)
        {
            if (err) throw err;
            console.table(res);
            start();
        })      
}


function employeeByDept() {

    const departments = connection.query("SELECT * FROM department");
    console.log(departments);

    inquirer.prompt({
        name:"department",
        type: "list",
        message: "Please select a Department.",
        choices: departments
    });

    deptChoice().then(([rows]) => {
        console.log(rows);
        const departments = rows.map(r => r.name)
        console.log(departments);
        inquirer.prompt({
            name:"department",
            type: "list",
            message: "Please select a Department.",
            choices: departments
            }).then(function(response) {
            console.log(response)
            allEmployees(`WHERE d.name = "${response.department}"`); 
        })
    })
}

function employeeByManage() {

    employeeChoice().then(([rows]) => {
        console.log(rows);
        let employees = rows.map(r => ({name: r.first_name + " " + r.last_name, value: r.id}));
        let managerIds = rows.map(r => r.manager_id);
        let idArr = [...new Set(managerIds)];
        let managers = employees.filter(e => idArr.includes(e.value));
        console.log(managers);

        inquirer.prompt({
        name:"manager",
        type: "list",
        message: "Please select a Manager.",
        choices: managers
        }).then(function(response) {
        console.log(response)
        allEmployees(`WHERE e.manager_id = "${response.manager}"`); 
        })
    })
}

function addEmployee() {
    employeeChoice().then(([rows]) => {
        console.log(rows);
        let roleId = rows.map(r => r.role_id);

        let employees = rows.map(r => r.id);
        employees.push("null");
        inquirer.prompt([
            {
            name:"first_name",
            type:"input",
            message:"What is the employee's first name?"
            },
            {
            name:"last_name",
            type:"input",
            message:"What is the employee's last name?"
            },
            {
            name:"role_id",
            type:"list",
            message:"Please select a role ID",
            choices: roleId
            },
            {
            name:"manager",
            type:"list",
            message:"Please select a manager ID?",
            choices: employees
            }
        ]).then(function(response) {
            createEmployee(response.first_name, response.last_name, response.role_id, response.manager)
        })
    })
}

// Need to figure out how to add a second option of choices 

function updateRole() {
    employeeChoice().then(([rows]) => {
        console.log(rows);
        let employees = rows.map(r => ({name: r.first_name + " " + r.last_name, value: r.id}));
        let employeeName = employees.map(r => r.name);
        inquirer.prompt([
            {
            name:"employee",
            type:"list",
            message:"Which employee which you like to update?",
            choices: employeeName
            }
        ]).then(function(response) {
            console.log(response)
        })
    })
}


function viewAllRoles() {
    roleChoice().then(([rows]) => {
        console.table(rows);
    })
}

// Queries

function deptChoice() {
    return connection.promise().query("SELECT name FROM department")
}

function employeeChoice() {
    return connection.promise().query("SELECT * FROM employee")
}

function roleChoice() {
    return connection.promise().query("SELECT title FROM role")
}

function createEmployee(first_name, last_name, role_id, manager) {
    if (manager === "null") {
        connection.query("INSERT INTO employee (first_name, last_name, role_id) VALUES (?, ?, ?)", [`${first_name}`, `${last_name}`, `${role_id}`], function(err,res) {
            if (err) throw err;
            start();
            }
        )
    } else {
        connection.query("INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)", [`${first_name}`, `${last_name}`, `${role_id}`, `${manager}`], function(err,res) {
            if (err) throw err;
            start();
        })
    }    
}
