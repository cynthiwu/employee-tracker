USE company_DB;

INSERT INTO department(name) 
VALUES ('Engineering'), ('Product'), ('Human Resources'), ('Finance');

INSERT INTO role(title, salary, department_id) 
VALUES ('Software Engineer', 150000, 1), ('Engineering Director', 200000, 1), ('Quality Assurance Engineer', 115000, 1), ('Product Manager', 120000, 2), ('Product Director', 180000, 2), ('Product Assistant', 750000, 2), ('HR Business Partner', 800000, 3), ('HR Director', 120000,3), ('HR Assistant', 60000, 3), ('Accounts Payable Specialist', 70000, 4), ('Financial Analyst', 90000, 4), ('Finance Director', 160000, 4);

INSERT INTO employee(first_name, last_name, role_id, manager_id) 
VALUES ('Kritin', 'Vij', 1, 2), ('Bridget', 'Smith', 2, null), ('Galen', 'Parker', 3, 2), ('Nick', 'Yang', 4, 5), ('Steven', 'Horgan', 5, null), ('Celeste', 'Jones', 6, 5), ('Erica', 'Young', 7, 8), ('Jamie', 'Myers', 8, null), ('Daniel', 'Shen', 9, 8), ('Brittany', 'Peters', 10, 12), ('Eric','Weir', 11, 12), ('Joseph', 'Marx', 12, null);