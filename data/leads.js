// data/leads.js
export const leads = [
  {
    id: 1,
    customerName: "Ali Hassan",
    customerPhone: "0300-1234567",
    customerEmail: "ali@example.com",
    customerCNIC: "37405-1234567-1",
    type: "Hostel", // Hostel, Office, Shop, Room, Desk
    status: "New", // New, Contacted, Qualified, Lost, Converted
    source: "Referral", // Referral, Website, Walk-in, Social Media, Phone
    remarks: "Interested in hostel accommodation near university",
    assignedTo: 1, // employee ID
    assignedToName: "Ahmed Hassan",
    createdBy: 1, // employee ID who created
    createdAt: "2026-08-25T10:00:00.000Z",
    updatedAt: "2026-08-25T10:00:00.000Z",
    followUpDate: "2026-08-28T10:00:00.000Z",
    convertedToUnit: null, // unit ID if converted
    notes: [
      {
        id: 1,
        text: "Initial contact made, customer interested",
        createdAt: "2026-08-25T10:00:00.000Z",
        createdBy: 1,
      },
      {
        id: 2,
        text: "Follow-up call scheduled for 28th August",
        createdAt: "2026-08-25T14:00:00.000Z",
        createdBy: 1,
      }
    ]
  },
  {
    id: 2,
    customerName: "Sara Khan",
    customerPhone: "0311-9876543",
    customerEmail: "sara@example.com",
    customerCNIC: "37405-7654321-1",
    type: "Office",
    status: "Qualified",
    source: "Website",
    remarks: "Looking for office space for IT company",
    assignedTo: 2, // employee ID
    assignedToName: "Sara Khan",
    createdBy: 2,
    createdAt: "2026-08-24T09:00:00.000Z",
    updatedAt: "2026-08-26T11:00:00.000Z",
    followUpDate: "2026-08-27T14:00:00.000Z",
    convertedToUnit: null,
    notes: [
      {
        id: 1,
        text: "Website inquiry, sent property details",
        createdAt: "2026-08-24T09:00:00.000Z",
        createdBy: 2,
      },
      {
        id: 2,
        text: "Client visited property, interested in Unit 201",
        createdAt: "2026-08-26T11:00:00.000Z",
        createdBy: 2,
      }
    ]
  },
  {
    id: 3,
    customerName: "Usman Malik",
    customerPhone: "0322-5554444",
    customerEmail: "usman@example.com",
    customerCNIC: "37405-3333333-1",
    type: "Shop",
    status: "Lost",
    source: "Walk-in",
    remarks: "Looking for shop in Satellite Town",
    assignedTo: 1,
    assignedToName: "Ahmed Hassan",
    createdBy: 1,
    createdAt: "2026-08-20T10:00:00.000Z",
    updatedAt: "2026-08-23T16:00:00.000Z",
    followUpDate: null,
    convertedToUnit: null,
    notes: [
      {
        id: 1,
        text: "Customer visited, showed available shops",
        createdAt: "2026-08-20T10:00:00.000Z",
        createdBy: 1,
      },
      {
        id: 2,
        text: "Customer found another location, lead lost",
        createdAt: "2026-08-23T16:00:00.000Z",
        createdBy: 1,
      }
    ]
  }
];