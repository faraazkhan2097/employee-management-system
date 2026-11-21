import { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";

import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "./services/employeeService";

import "./App.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const initialFormData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  department: "",
  salary: "",
  joiningDate: "",
};

const chartColors = [
  "#2563eb",
  "#06b6d4",
  "#8b5cf6",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#ec4899",
  "#64748b",
];

function App() {
  // Main states
  const [employees, setEmployees] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ ...initialFormData });

  // Search, filter, sorting and pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [sortField, setSortField] = useState("id");
  const [sortOrder, setSortOrder] = useState("asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // GET: Fetch employees
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Unable to load employees. Check whether the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Open Add Employee form
  const handleAdd = () => {
    setEditingId(null);
    setFormData({ ...initialFormData });
    setShowForm(true);
  };

  // POST: Create employee
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      const employee = {
        ...formData,
        salary: Number(formData.salary),
      };

      await createEmployee(employee);
      alert("Employee created successfully!");

      setShowForm(false);
      setEditingId(null);
      setFormData({ ...initialFormData });
      await fetchEmployees();
      setCurrentPage(1);
    } catch (err) {
      console.error("Create error:", err.response?.data || err);
      alert(err.response?.data?.title || "Unable to create employee.");
    } finally {
      setSaving(false);
    }
  };

  // Open Edit Employee form
  const handleEdit = (employee) => {
    setEditingId(employee.id);
    setFormData({
      firstName: employee.firstName || "",
      lastName: employee.lastName || "",
      email: employee.email || "",
      phone: employee.phone || "",
      department: employee.department || "",
      salary: employee.salary ?? "",
      joiningDate: employee.joiningDate
        ? employee.joiningDate.substring(0, 10)
        : "",
    });
    setShowForm(true);
  };

  // PUT: Update employee
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (editingId === null) return;

    try {
      setSaving(true);
      const employee = {
        ...formData,
        id: editingId,
        salary: Number(formData.salary),
      };

      await updateEmployee(editingId, employee);
      alert("Employee updated successfully!");

      setShowForm(false);
      setEditingId(null);
      setFormData({ ...initialFormData });
      await fetchEmployees();
    } catch (err) {
      console.error("Update error:", err.response?.data || err);
      alert(err.response?.data?.title || "Unable to update employee.");
    } finally {
      setSaving(false);
    }
  };

  // DELETE: Delete employee
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmDelete) return;

    try {
      await deleteEmployee(id);
      alert("Employee deleted successfully!");
      await fetchEmployees();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err);
      alert(err.response?.data?.title || "Unable to delete employee.");
    }
  };

  // Get unique departments
  const departments = [
    "All",
    ...new Set(
      employees.map((employee) => employee.department).filter(Boolean)
    ),
  ];

  // Search and department filtering
  const filteredEmployees = employees.filter((employee) => {
    const search = searchTerm.toLowerCase();
    const fullName =
      `${employee.firstName || ""} ${employee.lastName || ""}`.toLowerCase();

    const matchesSearch =
      fullName.includes(search) ||
      (employee.email || "").toLowerCase().includes(search) ||
      (employee.department || "").toLowerCase().includes(search);

    const matchesDepartment =
      departmentFilter === "All" ||
      employee.department === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  // Sorting
  const sortedEmployees = [...filteredEmployees].sort((a, b) => {
    const valueA = a[sortField];
    const valueB = b[sortField];

    let comparison;
    if (
      typeof valueA === "number" &&
      typeof valueB === "number"
    ) {
      comparison = valueA - valueB;
    } else {
      comparison = String(valueA ?? "").localeCompare(
        String(valueB ?? ""),
        undefined,
        { numeric: true, sensitivity: "base" }
      );
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedEmployees.length / pageSize));
  const paginatedEmployees = sortedEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((previous) => (previous === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  // Keep the current page within the available range
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Dashboard statistics
  const currentYear = new Date().getFullYear();
  const totalDepartments = departments.length - 1;
  const newEmployees = employees.filter((employee) =>
    employee.joiningDate?.startsWith(String(currentYear))
  ).length;

  const salaries = employees
    .map((employee) => Number(employee.salary))
    .filter((salary) => Number.isFinite(salary));

  const averageSalary = salaries.length
    ? salaries.reduce((total, salary) => total + salary, 0) / salaries.length
    : 0;
  const minimumSalary = salaries.length ? Math.min(...salaries) : 0;
  const maximumSalary = salaries.length ? Math.max(...salaries) : 0;

  const formatNumber = (value) =>
    new Intl.NumberFormat("en", {
      maximumFractionDigits: 2,
    }).format(value);

  // Department chart data
  const departmentCounts = departments
    .filter((department) => department !== "All")
    .map((department) => ({
      department,
      count: employees.filter(
        (employee) => employee.department === department
      ).length,
    }));

  const departmentChartData = {
    labels: departmentCounts.map((item) => item.department),
    datasets: [
      {
        label: "Employees",
        data: departmentCounts.map((item) => item.count),
        backgroundColor: departmentCounts.map(
          (_, index) => chartColors[index % chartColors.length]
        ),
        borderRadius: 6,
      },
    ],
  };

  const departmentDoughnutData = {
    labels: departmentCounts.map((item) => item.department),
    datasets: [
      {
        label: "Employees",
        data: departmentCounts.map((item) => item.count),
        backgroundColor: departmentCounts.map(
          (_, index) => chartColors[index % chartColors.length]
        ),
        borderColor: "#ffffff",
        borderWidth: 2,
      },
    ],
  };

  // Joining trend: show the current year month by month.
  // Date strings are split rather than parsed as UTC to avoid date shifts.
  const monthLabels = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  const joiningCounts = Array(12).fill(0);
  employees.forEach((employee) => {
    if (!employee.joiningDate) return;

    const [yearPart, monthPart] = employee.joiningDate
      .substring(0, 10)
      .split("-");

    const year = Number(yearPart);
    const monthIndex = Number(monthPart) - 1;

    if (
      year === currentYear &&
      monthIndex >= 0 &&
      monthIndex < 12
    ) {
      joiningCounts[monthIndex] += 1;
    }
  });

  const joiningTrendData = {
    labels: monthLabels,
    datasets: [
      {
        label: `Employees joined in ${currentYear}`,
        data: joiningCounts,
        borderColor: "#2563eb",
        backgroundColor: "rgba(37, 99, 235, 0.15)",
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const commonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
  };

  const barChartOptions = {
    ...commonChartOptions,
    plugins: {
      ...commonChartOptions.plugins,
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
      },
    },
  };

  const joiningChartOptions = {
    ...commonChartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { precision: 0 },
      },
    },
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <h2>EMS</h2>
        <nav>
          <a className="active" href="#dashboard">Dashboard</a>
          <a href="#employees">Employees</a>
          <a href="#analytics">Analytics</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <h2>Employee Dashboard</h2>
            <p className="topbar-subtitle">Overview of your workforce</p>
          </div>
          <span className="admin-label">Admin</span>
        </header>

        {/* Dashboard Cards */}
        <section className="stats-container">
          <div className="stat-card">
            <h3>Total Employees</h3>
            <h1>{employees.length}</h1>
          </div>

          <div className="stat-card">
            <h3>Departments</h3>
            <h1>{totalDepartments}</h1>
          </div>

          <div className="stat-card">
            <h3>New Employees ({currentYear})</h3>
            <h1>{newEmployees}</h1>
          </div>

          <div className="stat-card">
            <h3>Average Salary</h3>
            <h1>{formatNumber(averageSalary)}</h1>
            <p className="stat-detail">
              Min: {formatNumber(minimumSalary)} · Max: {formatNumber(maximumSalary)}
            </p>
          </div>
        </section>

        {/* Analytics */}
        <section className="analytics-section" id="analytics">
          <div className="analytics-heading">
            <div>
              <h2>Workforce Analytics</h2>
              <p>Charts are automatically updated when employee records change.</p>
            </div>
          </div>

          {employees.length === 0 ? (
            <div className="empty-analytics">
              Add employees to see department, salary and joining trends.
            </div>
          ) : (
            <div className="charts-grid">
              <div className="chart-card">
                <h3>Employees by Department</h3>
                <div className="chart-container">
                  <Bar data={departmentChartData} options={barChartOptions} />
                </div>
              </div>

              <div className="chart-card">
                <h3>Department Distribution</h3>
                <div className="chart-container doughnut-container">
                  <Doughnut
                    data={departmentDoughnutData}
                    options={commonChartOptions}
                  />
                </div>
              </div>

              <div className="chart-card chart-card-wide">
                <h3>Employee Joining Trend ({currentYear})</h3>
                <div className="chart-container">
                  <Line data={joiningTrendData} options={joiningChartOptions} />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Employee Section */}
        <section className="employee-section" id="employees">
          <div className="section-header">
            <div>
              <h2>Employee List</h2>
              <p>Search, filter, sort and manage employee records.</p>
            </div>
            <button onClick={handleAdd}>+ Add Employee</button>
          </div>

          {/* Search and Filters */}
          <div className="table-controls">
            <input
              type="text"
              placeholder="Search name, email or department..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />

            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department === "All" ? "All Departments" : department}
                </option>
              ))}
            </select>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={5}>5 per page</option>
              <option value={10}>10 per page</option>
              <option value={20}>20 per page</option>
            </select>
          </div>

          {loading && <p>Loading employees...</p>}
          {error && <p className="error-message">{error}</p>}

          {!loading && !error && (
            <>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th onClick={() => handleSort("id")}>
                        ID {sortField === "id" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                      </th>
                      <th onClick={() => handleSort("firstName")}>
                        Name {sortField === "firstName" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                      </th>
                      <th>Email</th>
                      <th onClick={() => handleSort("department")}>
                        Department {sortField === "department" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                      </th>
                      <th onClick={() => handleSort("salary")}>
                        Salary {sortField === "salary" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedEmployees.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="empty-message">
                          No employees found.
                        </td>
                      </tr>
                    ) : (
                      paginatedEmployees.map((employee) => (
                        <tr key={employee.id}>
                          <td>{employee.id}</td>
                          <td>{employee.firstName} {employee.lastName}</td>
                          <td>{employee.email}</td>
                          <td>{employee.department}</td>
                          <td>{formatNumber(Number(employee.salary) || 0)}</td>
                          <td className="action-buttons">
                            <button
                              type="button"
                              onClick={() => handleEdit(employee)}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="delete-button"
                              onClick={() => handleDelete(employee.id)}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="pagination">
                <span>
                  Showing{" "}
                  {sortedEmployees.length === 0
                    ? 0
                    : (currentPage - 1) * pageSize + 1}
                  {" - "}
                  {Math.min(currentPage * pageSize, sortedEmployees.length)}
                  {" of "}
                  {sortedEmployees.length} employees
                </span>

                <div className="pagination-buttons">
                  <button
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((previous) => previous - 1)
                    }
                  >
                    Previous
                  </button>
                  <span>Page {currentPage} of {totalPages}</span>
                  <button
                    disabled={currentPage >= totalPages}
                    onClick={() =>
                      setCurrentPage((previous) => previous + 1)
                    }
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </section>

        {/* Add / Edit Employee Modal */}
        {showForm && (
          <div className="modal-overlay">
            <div className="employee-modal">
              <h2>
                {editingId !== null ? "Edit Employee" : "Add New Employee"}
              </h2>

              <form
                onSubmit={
                  editingId !== null ? handleUpdate : handleSubmit
                }
              >
                <input
                  name="firstName"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                />

                <input
                  name="lastName"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />

                <input
                  name="phone"
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={handleChange}
                />

                <input
                  name="department"
                  placeholder="Department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                />

                <input
                  type="number"
                  name="salary"
                  placeholder="Salary"
                  value={formData.salary}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  required
                />

                <label>Joining Date</label>
                <input
                  type="date"
                  name="joiningDate"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  required
                />

                <div className="modal-actions">
                  <button type="submit" disabled={saving}>
                    {saving
                      ? "Saving..."
                      : editingId !== null
                        ? "Update Employee"
                        : "Save Employee"}
                  </button>

                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                      setFormData({ ...initialFormData });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
