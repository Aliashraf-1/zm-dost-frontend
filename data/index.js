// data/index.js
export { buildings } from "./buildings";
export { employees } from "./employees";
export { sidebarItems } from "./sidebar";

// ✅ Security Data (Dummy)
export const securities = [
  {
    id: 1,
    tenantName: "Muhammad Ahmed",
    unitNo: "101",
    buildingNo: "Building #01",
    amount: 80000,
    status: "Held",
    description: "Security deposit for Unit 101",
    source: "Rental Agreement",
    createdAt: "2026-06-01T10:30:00.000Z",
    returnDate: null,
    returnedAmount: null,
    remarks: "Initial security received",
  },
  {
    id: 2,
    tenantName: "Ali Raza",
    unitNo: "102",
    buildingNo: "Building #01",
    amount: 100000,
    status: "Returned",
    description: "Security deposit for Unit 102",
    source: "Rental Agreement",
    createdAt: "2026-07-15T10:30:00.000Z",
    returnDate: "2026-08-20T10:30:00.000Z",
    returnedAmount: 95000,
    remarks: "Security forfeited due to damages (Rs. 5,000)",
  },
  {
    id: 3,
    tenantName: "Usman Khan",
    unitNo: "201",
    buildingNo: "Building #02",
    amount: 70000,
    status: "Held",
    description: "Security deposit for Unit 201",
    source: "Rental Agreement",
    createdAt: "2026-05-20T09:45:00.000Z",
    returnDate: null,
    returnedAmount: null,
    remarks: "Initial security received",
  },
  {
    id: 4,
    tenantName: "Ahmed Khan",
    unitNo: "104",
    buildingNo: "Building #01",
    amount: 8000,
    status: "Held",
    description: "Security deposit for Desk 104",
    source: "Rental Agreement",
    createdAt: "2026-08-19T10:30:00.000Z",
    returnDate: null,
    returnedAmount: null,
    remarks: "Initial security received for desk",
  },
  {
    id: 5,
    tenantName: "Hassan Ali",
    unitNo: "301",
    buildingNo: "Building #03",
    amount: 120000,
    status: "Held",
    description: "Security deposit for Unit 301",
    source: "Rental Agreement",
    createdAt: "2026-08-01T12:20:00.000Z",
    returnDate: null,
    returnedAmount: null,
    remarks: "Initial security received",
  },
  {
    id: 6,
    tenantName: "Fatima Ali",
    unitNo: "202",
    buildingNo: "Building #02",
    amount: 65000,
    status: "Returned",
    description: "Security deposit for Unit 202",
    source: "Rental Agreement",
    createdAt: "2026-06-30T10:30:00.000Z",
    returnDate: "2026-07-30T10:30:00.000Z",
    returnedAmount: 65000,
    remarks: "Security returned in full - Rental ended",
  },
];

// Helper function to get data by ID
export const getBuildingById = (id) => {
  return buildings.find((b) => b.id === id);
};

export const getEmployeeById = (id) => {
  return employees.find((e) => e.id === id);
};

export const getRoomById = (buildingId, roomId) => {
  const building = getBuildingById(buildingId);
  if (!building) return null;
  return building.rooms?.find((r) => r.id === roomId) || null;
};

// Helper function to get all customers
export const getAllCustomers = () => {
  const customers = [];
  buildings.forEach((building) => {
    building.rooms?.forEach((room) => {
      if (room.status === "Rented" && room.tenant) {
        customers.push({
          ...room.tenant,
          buildingId: building.id,
          buildingNo: building.buildingNo,
          unitId: room.id,
          unitNo: room.unitNo,
          monthlyRent: room.monthlyRent,
          rentStartDate: room.rentStartDate,
          security: room.initialPayment?.securityReceived || 0,
          rentHistory: room.rentHistory || [],
          securityHistory: room.securityHistory || [],
        });
      }
    });
  });
  return customers;
};

// Helper function to get security by ID
export const getSecurityById = (id) => {
  return securities.find((s) => s.id === id);
};

// Helper function to get securities by tenant
export const getSecuritiesByTenant = (tenantName) => {
  return securities.filter((s) => s.tenantName === tenantName);
};

// Helper function to get securities by building
export const getSecuritiesByBuilding = (buildingNo) => {
  return securities.filter((s) => s.buildingNo === buildingNo);
};

// Helper function to get revenue data
export const getRevenueData = () => {
  let totalRevenue = 0;
  let totalExpenses = 0;
  const transactions = [];

  // Income from rent
  buildings.forEach((building) => {
    building.rooms?.forEach((room) => {
      room.rentHistory?.forEach((rent) => {
        if (rent.status === "Paid") {
          totalRevenue += rent.amount;
          transactions.push({
            id: `rent-${rent.id}`,
            type: "Income",
            category: "Rent",
            description: `Rent from ${room.tenant?.name || "Unknown"} - ${building.buildingNo} ${room.unitNo}`,
            amount: rent.amount,
            status: "Received",
            date: rent.paidAt,
            buildingId: building.id,
            unitId: room.id,
          });
        }
      });
    });
  });

  // Expenses from salaries
  employees.forEach((emp) => {
    emp.salaryHistory?.forEach((salary) => {
      if (salary.status === "Paid") {
        totalExpenses += salary.amount;
        transactions.push({
          id: `salary-${salary.id}`,
          type: "Expense",
          category: "Salary",
          description: `Salary payment to ${emp.name}`,
          amount: salary.amount,
          status: "Paid",
          date: salary.paidAt,
          employeeId: emp.id,
        });
      }
    });
  });

  // Securities as income (if held)
  securities.forEach((sec) => {
    if (sec.status === "Held") {
      totalRevenue += sec.amount;
      transactions.push({
        id: `security-${sec.id}`,
        type: "Security",
        category: "Security Deposit",
        description: `Security from ${sec.tenantName} - ${sec.buildingNo} ${sec.unitNo}`,
        amount: sec.amount,
        status: "Held",
        date: sec.createdAt,
        securityId: sec.id,
      });
    }
  });

  return {
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
    transactions,
  };
};