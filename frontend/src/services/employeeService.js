import axios from 'axios';

const API_URL = 'http://localhost:5169/ems/employee';

// GET:get all the employees
export const getEmployees = async() => {
    const response = await axios.get(API_URL);
    return response.data;
}

// POST:Create/Add the employee details.
export const createEmployee = async(employee) => {
    const response = await axios.post(API_URL, employee);
    return response.data;
}

//PUT:Update the exployee
export const updateEmployee = async(id,employee)=>{
    const response = await axios.put(`${API_URL}/${id}`,employee);
    return response.data;
};

//DELET:Delete the employee
export const deleteEmployee = async(id)=>{
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

