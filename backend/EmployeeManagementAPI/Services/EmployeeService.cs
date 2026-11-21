using EmployeeManagementAPI.Models;
using EmployeeManagementAPI.Repositories;

namespace EmployeeManagementAPI.Services
{
    public class EmployeeService:IEmployeeService
    {
        private readonly IEmployeeRepository _employeeRepository;

        public EmployeeService(IEmployeeRepository employeeRepository)
        {
            _employeeRepository = employeeRepository;
        }

        // public async Task<IEnumerable<Employee>> GetAllEmployeesAsync()
        // {
        //     return await _employeeRepository.GetAllAsync();
        // }
        public async Task<Employee?> GetEmployeeByIdAsync(int id)
        {
            if(id<=0)
                return null;

            return await _employeeRepository.GetByIdAsync(id);
        }
        public async Task<Employee> AddEmployeeAsync(Employee employee)
        {
            return await _employeeRepository.CreateAsync(employee);
        }
        public async Task<Employee?> UpdateEmployeeAsync(int id, Employee employee)
        {
            if(id<=0)
                return null;
            
            return await _employeeRepository.UpdateAsync(id, employee);
        }
        public async Task<bool> DeleteEmployeeAsync(int id)
        {
            if(id<=0)
                return false;

            return await _employeeRepository.DeleteAsync(id);
        }

        public Task<List<Employee>> GetEmployeesAsync()
        {
            throw new NotImplementedException();
        }

        public async Task<List<Employee>> GetAllEmployeesAsync()
        {
            return await _employeeRepository.GetAllAsync();
        }
    }
}