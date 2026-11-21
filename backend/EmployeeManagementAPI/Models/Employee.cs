using System.ComponentModel.DataAnnotations;

namespace EmployeeManagementAPI.Models
{
    public class Employee
    {
        public int Id{get;set;}
        [Required]
        [StringLength(50)]
        public string? FirstName{get;set;}
        [Required]
        [StringLength(50)]
        public string? LastName{get;set;}
        [Required]
        [EmailAddress]
        public string? Email{get;set;} = string.Empty;
        public string? Phone{get;set;}
        [Required]
        public string? Department{set;get;}
        [Range(0,10000000)]
        public decimal Salary{get;set;}
        public DateOnly JoiningDate{get;set;}

    }
}