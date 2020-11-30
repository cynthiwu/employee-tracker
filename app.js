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
            "View All Departments",
            "Add Role",
            "Add Department",
            "Quit"
        ]
    }).then(function(response) {

        switch(response.action) {
            case "View All Employees":
                allEmployees("ORDER BY id"); 
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
            case "View All Departments":    
                viewAllDepts();
                break; 
            case "Add Role":    
                addRole();
                break;     
            case "Add Department":    
                addDept();
                break;  
            case "Quit":   
                connection.end(); 
                break;        
        };
    });
};

const query = `SELECT e.id AS ID, e.first_name AS 'First Name', e.last_name AS 'Last Name', r.title AS Role, d.name AS Department, r.salary AS Salary, CONCAT(m.first_name,' ',m.last_name) AS Manager FROM employee e LEFT JOIN role r ON e.role_id = r.id LEFT JOIN department d ON r.department_id = d.id LEFT JOIN employee m ON e.manager_id = m.id`;

// I realize that the way I am doing this is setting me up to be vulnerable to SQL injections. I have been trying to get it to work with placeholders, but I keep getting an error. I will keep it this way for now. 

function allEmployees(request) {

    connection.query(`${query} ${request}`, function(err, res)
        {
            if (err) throw err;
            console.table(res);
            start();
        });      
};

function employeeByDept() {

    deptChoice().then(([rows]) => {
        const departments = rows.map(r => r.name)
        
        inquirer.prompt({
            name:"department",
            type: "list",
            message: "Please select a Department.",
            choices: departments
            }).then(function(response) {
                allEmployees(`WHERE d.name = "${response.department}"`) 
        })
    })
}

function employeeByManage() {

    employeeChoice().then(([rows]) => {
        let employees = rows.map(r => ({name: r.first_name + " " + r.last_name, value: r.id}));
        let managerIds = rows.map(r => r.manager_id);
        let idArr = [...new Set(managerIds)];
        let managers = employees.filter(e => idArr.includes(e.value));
        
        inquirer.prompt({
        name:"manager",
        type: "list",
        message: "Please select a Manager.",
        choices: managers
        }).then(function(response) {
        allEmployees(`WHERE e.manager_id = "${response.manager}"`); 
        });
    });
};

function addEmployee() {
    employeeChoice().then(([rows]) => {
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


function updateRole() {
    
    employeeChoice().then(([rows]) => {
        let employees = rows.map(r => ({name: r.first_name + " " + r.last_name, value: r.id}));

        let roleId = rows.map(r => r.role_id);

        inquirer.prompt([
            {
            name:"employee",
            type:"list",
            message:"Which employee which you like to update?",
            choices: employees
            },
            {
            name:"role_id",
            type:"list",
            message:"Please select a new role ID.",
            choices: roleId 
            }
        ]).then(function(response) {
            updateemployeeRole(response.employee, response.role_id);
        })
    })
}

function viewAllRoles() {
    roleChoice().then(([rows]) => {
        console.table(rows);
        start();
    })
}

function viewAllDepts() {
    deptChoice().then(([rows]) => {
        console.table(rows);
        start();
    })
}

function addRole() {
    deptIdChoice().then(([rows]) => {
        let deptId = rows.map(r => r.id);
        inquirer.prompt([
            {
            name:"title",
            type:"input",
            message:"What is the role title?",
            },
            {
            name:"salary",
            type:"input",
            message:"What is the role's salary?",
            },
            {
            name:"department_id",
            type:"list",
            message:"Select the department ID for this role.",
            choices: deptId
            },

        ]).then(function(response) {
            addNewRole(response.title, response.salary, response.department_id);
        })
    })
}

function addDept() {
    inquirer.prompt([
        {
        name:"name",
        type:"input",
        message:"What is the department name?",
        },
        ]).then(function(response) {
            addNewDept(response.name);
    })   
}

// Queries

function deptChoice() {
    return connection.promise().query("SELECT name FROM department")
}

function deptIdChoice() {
    return connection.promise().query("SELECT id FROM department")
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

function updateemployeeRole(employee_id, role_id) {
    connection.query("UPDATE employee SET role_id = ? WHERE id = ?", [`${role_id}`, `${employee_id}`], function (err, res) {
        if (err) throw err;
        start();
    })
}

function addNewRole(title, salary, department_id) {
    connection.query("INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)", [`${title}`, `${salary}`, `${department_id}`], function (err, res) {
        if (err) throw err;
        start();
    })
}

function addNewDept(name) {
    connection.query("INSERT INTO department (name) VALUES (?)", [`${name}`], function (err, res) {
        if (err) throw err;
        start();
    })
}