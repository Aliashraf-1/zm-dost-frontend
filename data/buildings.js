export const buildings = [
  {
    id: 1,
    buildingNo: "Building #01",
    reference: "University Road",
    address: "University Road, Sargodha",
    totalUnits: 12,
    status: "Active",

    rooms: [
      {
        id: 101,
        unitNo: "101",
        type: "Office",
        deskNo: null,
        status: "Rented",
        purpose: "Office",
        monthlyRent: 25000,
        rentStartDate: "2026-06-01",
        unitImage: null,

        tenant: {
          name: "Muhammad Ahmed",
          cnic: "37405-1234567-1",
          phone: "0300-1234567",
          reference: "Software wala bacha",
          image: null,
          agreement: [],
          // ✅ Documents array for saved editable documents
          documents: [
            {
              id: "doc-101-1",
              templateId: "hostel-flat-agreement",
              title: "ہاسٹل رہائشی معاہدہ",
              content: "معاہدہ نمبر: 001\nتاریخ: 2026-06-01\n\nیہ معاہدہ زمین دوست گروپ آف کمپنیز اور Muhammad Ahmed کے درمیان طے پایا...",
              type: "rental",
              language: "urdu",
              createdAt: "2026-06-01T10:30:00.000Z",
              updatedAt: "2026-06-01T10:30:00.000Z",
              version: 1
            },
            {
              id: "doc-101-2",
              templateId: "office-agreement",
              title: "دفتر استعمال کا معاہدہ",
              content: "معاہدہ نمبر: 002\nتاریخ: 2026-06-01\n\nیہ معاہدہ زمین دوست گروپ آف کمپنیز اور Muhammad Ahmed کے درمیان طے پایا...",
              type: "office",
              language: "urdu",
              createdAt: "2026-06-01T11:00:00.000Z",
              updatedAt: "2026-06-15T09:00:00.000Z",
              version: 2
            }
          ]
        },

        initialPayment: {
          cashReceived: 105000,
          rentPaid: 25000,
          securityReceived: 80000,
          securityStatus: "Held",
          paymentDateTime: "2026-06-01T10:30:00.000Z",
          rentMonths: 1,
        },

        rentHistory: [
          {
            id: 1,
            month: "2026-06",
            amount: 25000,
            status: "Paid",
            paidAt: "2026-06-01T10:30:00.000Z",
            remarks: "First month rent",
          },
          {
            id: 2,
            month: "2026-07",
            amount: 25000,
            status: "Paid",
            paidAt: "2026-07-01T10:30:00.000Z",
            remarks: "Monthly rent",
          },
        ],

        securityHistory: [
          {
            id: 1,
            type: "received",
            amount: 80000,
            date: "2026-06-01T10:30:00.000Z",
            note: "Initial security received",
          },
        ],

        clearanceHistory: [
          {
            id: 1001,
            type: "Rental Clearance",
            tenantName: "Ali Raza",
            tenantCnic: "37405-7654321-1",
            tenantPhone: "0312-7654321",
            tenantReference: "Previous Tenant",
            tenantImage: null,
            agreement: [
              { name: "agreement_1.pdf", url: "/docs/agreement_1.pdf" },
              { name: "agreement_2.pdf", url: "/docs/agreement_2.pdf" },
            ],
            monthlyRent: 22000,
            securityHeld: 70000,
            returnAmount: 65000,
            forfeitAmount: 5000,
            remarks: "Damage deductions applied - AC repair",
            clearedAt: "2026-05-15T10:30:00.000Z",
          },
          {
            id: 1002,
            type: "Rental Clearance",
            tenantName: "Usman Khan",
            tenantCnic: "37405-1111111-1",
            tenantPhone: "0321-1111111",
            tenantReference: "Business Owner",
            tenantImage: null,
            agreement: [],
            monthlyRent: 20000,
            securityHeld: 60000,
            returnAmount: 60000,
            forfeitAmount: 0,
            remarks: "Security returned in full",
            clearedAt: "2025-12-20T10:30:00.000Z",
          },
        ],

        transactionHistory: [],
      },

      {
        id: 102,
        unitNo: "102",
        type: "Room",
        deskNo: null,
        status: "Available",
        purpose: "Hostel",
        monthlyRent: 30000,
        rentStartDate: null,
        unitImage: null,
        tenant: null,
        initialPayment: null,
        rentHistory: [],
        securityHistory: [],
        clearanceHistory: [
          {
            id: 2001,
            type: "Rental Clearance",
            tenantName: "Ali Raza",
            tenantCnic: "37405-7654321-1",
            tenantPhone: "0312-7654321",
            tenantReference: "Student",
            tenantImage: null,
            agreement: [],
            monthlyRent: 30000,
            securityHeld: 100000,
            returnAmount: 95000,
            forfeitAmount: 5000,
            remarks: "Security forfeited due to damages",
            clearedAt: "2026-07-15T10:30:00.000Z",
          },
        ],
        transactionHistory: [],
      },

      {
        id: 103,
        unitNo: "103",
        type: "Room",
        deskNo: null,
        status: "Available",
        purpose: "Room",
        monthlyRent: 28000,
        rentStartDate: null,
        unitImage: null,
        tenant: null,
        initialPayment: null,
        rentHistory: [],
        securityHistory: [],
        clearanceHistory: [],
        transactionHistory: [],
      },

      // Desk example
      {
        id: 104,
        unitNo: "104",
        type: "Desk",
        deskNo: "D-04",
        status: "Rented",
        purpose: "Workspace",
        monthlyRent: 4000,
        rentStartDate: "2026-08-19",
        unitImage: null,

        tenant: {
          name: "Ahmed Khan",
          cnic: "37405-3333333-1",
          phone: "0300-0000000",
          reference: "Software wala bacha",
          image: null,
          agreement: [],
          // ✅ Documents for this tenant
          documents: [
            {
              id: "doc-104-1",
              templateId: "office-agreement",
              title: "دفتر استعمال کا معاہدہ - 104",
              content: "معاہدہ نمبر: 104-001\nتاریخ: 2026-08-19\n\nیہ معاہدہ زمین دوست گروپ آف کمپنیز اور Ahmed Khan کے درمیان طے پایا...",
              type: "office",
              language: "urdu",
              createdAt: "2026-08-19T10:30:00.000Z",
              updatedAt: "2026-08-19T10:30:00.000Z",
              version: 1
            }
          ]
        },

        initialPayment: {
          cashReceived: 12000,
          rentPaid: 4000,
          securityReceived: 8000,
          securityStatus: "Held",
          paymentDateTime: "2026-08-19T10:30:00.000Z",
          rentMonths: 1,
        },

        rentHistory: [
          {
            id: 1,
            month: "2026-08",
            amount: 4000,
            status: "Paid",
            paidAt: "2026-08-19T10:30:00.000Z",
            remarks: "First month rent for desk",
          },
        ],

        securityHistory: [
          {
            id: 1,
            type: "received",
            amount: 8000,
            date: "2026-08-19T10:30:00.000Z",
            note: "Initial security received",
          },
        ],

        clearanceHistory: [],
        transactionHistory: [],
      },
    ],
  },

  {
    id: 2,
    buildingNo: "Building #02",
    reference: "Satellite Town",
    address: "Satellite Town, Sargodha",
    totalUnits: 16,
    status: "Active",

    rooms: [
      {
        id: 201,
        unitNo: "201",
        type: "Room",
        deskNo: null,
        status: "Rented",
        purpose: "Office",
        monthlyRent: 22000,
        rentStartDate: "2026-05-20",
        unitImage: null,

        tenant: {
          name: "Usman Khan",
          cnic: "37405-1111111-1",
          phone: "0321-1111111",
          reference: "Client",
          image: null,
          agreement: [],
          // ✅ Documents for this tenant
          documents: [
            {
              id: "doc-201-1",
              templateId: "hostel-flat-agreement",
              title: "ہاسٹل رہائشی معاہدہ - 201",
              content: "معاہدہ نمبر: 201-001\nتاریخ: 2026-05-20\n\nیہ معاہدہ زمین دوست گروپ آف کمپنیز اور Usman Khan کے درمیان طے پایا...",
              type: "rental",
              language: "urdu",
              createdAt: "2026-05-20T09:45:00.000Z",
              updatedAt: "2026-05-20T09:45:00.000Z",
              version: 1
            }
          ]
        },

        initialPayment: {
          cashReceived: 92000,
          rentPaid: 22000,
          securityReceived: 70000,
          securityStatus: "Held",
          paymentDateTime: "2026-05-20T09:45:00.000Z",
          rentMonths: 1,
        },

        rentHistory: [
          {
            id: 1,
            month: "2026-05",
            amount: 22000,
            status: "Paid",
            paidAt: "2026-05-20T09:45:00.000Z",
            remarks: "First month rent",
          },
          {
            id: 2,
            month: "2026-06",
            amount: 22000,
            status: "Paid",
            paidAt: "2026-06-20T09:45:00.000Z",
            remarks: "Monthly rent",
          },
          {
            id: 3,
            month: "2026-07",
            amount: 22000,
            status: "Paid",
            paidAt: "2026-07-20T09:45:00.000Z",
            remarks: "Monthly rent",
          },
        ],

        securityHistory: [
          {
            id: 1,
            type: "received",
            amount: 70000,
            date: "2026-05-20T09:45:00.000Z",
            note: "Initial security received",
          },
        ],

        clearanceHistory: [],
        transactionHistory: [],
      },

      {
        id: 202,
        unitNo: "202",
        type: "Room",
        deskNo: null,
        status: "Available",
        purpose: "Room",
        monthlyRent: 25000,
        rentStartDate: null,
        unitImage: null,
        tenant: null,
        initialPayment: null,
        rentHistory: [],
        securityHistory: [],
        clearanceHistory: [
          {
            id: 3001,
            type: "Rental Clearance",
            tenantName: "Fatima Ali",
            tenantCnic: "37405-4444444-1",
            tenantPhone: "0344-4444444",
            tenantReference: "Teacher",
            tenantImage: null,
            agreement: [],
            monthlyRent: 23000,
            securityHeld: 65000,
            returnAmount: 65000,
            forfeitAmount: 0,
            remarks: "Security returned in full - Rental ended",
            clearedAt: "2026-06-30T10:30:00.000Z",
          },
        ],
        transactionHistory: [],
      },
    ],
  },

  {
    id: 3,
    buildingNo: "Building #03",
    reference: "Faisalabad Road",
    address: "Faisalabad Road, Sargodha",
    totalUnits: 20,
    status: "Active",

    rooms: [
      {
        id: 301,
        unitNo: "301",
        type: "Room",
        deskNo: null,
        status: "Rented",
        purpose: "Office",
        monthlyRent: 35000,
        rentStartDate: "2026-08-01",
        unitImage: null,

        tenant: {
          name: "Hassan Ali",
          cnic: "37405-2222222-1",
          phone: "0333-2222222",
          reference: "Software wala bacha",
          image: null,
          agreement: [],
          // ✅ Documents for this tenant
          documents: [
            {
              id: "doc-301-1",
              templateId: "office-agreement",
              title: "دفتر استعمال کا معاہدہ - 301",
              content: "معاہدہ نمبر: 301-001\nتاریخ: 2026-08-01\n\nیہ معاہدہ زمین دوست گروپ آف کمپنیز اور Hassan Ali کے درمیان طے پایا...",
              type: "office",
              language: "urdu",
              createdAt: "2026-08-01T12:20:00.000Z",
              updatedAt: "2026-08-01T12:20:00.000Z",
              version: 1
            },
            {
              id: "doc-301-2",
              templateId: "hostel-flat-agreement",
              title: "ہاسٹل رہائشی معاہدہ - 301",
              content: "معاہدہ نمبر: 301-002\nتاریخ: 2026-08-01\n\nیہ معاہدہ زمین دوست گروپ آف کمپنیز اور Hassan Ali کے درمیان طے پایا...",
              type: "rental",
              language: "urdu",
              createdAt: "2026-08-01T13:00:00.000Z",
              updatedAt: "2026-08-01T13:00:00.000Z",
              version: 1
            }
          ]
        },

        initialPayment: {
          cashReceived: 155000,
          rentPaid: 35000,
          securityReceived: 120000,
          securityStatus: "Held",
          paymentDateTime: "2026-08-01T12:20:00.000Z",
          rentMonths: 1,
        },

        rentHistory: [
          {
            id: 1,
            month: "2026-08",
            amount: 35000,
            status: "Paid",
            paidAt: "2026-08-01T12:20:00.000Z",
            remarks: "First month rent",
          },
        ],

        securityHistory: [
          {
            id: 1,
            type: "received",
            amount: 120000,
            date: "2026-08-01T12:20:00.000Z",
            note: "Initial security received",
          },
        ],

        clearanceHistory: [],
        transactionHistory: [],
      },

      {
        id: 302,
        unitNo: "302",
        type: "Room",
        deskNo: null,
        status: "Available",
        purpose: "Room",
        monthlyRent: 30000,
        rentStartDate: null,
        unitImage: null,
        tenant: null,
        initialPayment: null,
        rentHistory: [],
        securityHistory: [],
        clearanceHistory: [],
        transactionHistory: [],
      },
    ],
  },
];