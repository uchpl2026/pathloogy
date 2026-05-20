export const pathologiesData = [
  { id: 1, name: 'Complete Blood Count', code: 'CBC-001', category: 'Hematology',    turnaround: '4 hrs', price: '₹350', status: 'Active'   },
  { id: 2, name: 'Lipid Profile',         code: 'LIP-002', category: 'Biochemistry',  turnaround: '6 hrs', price: '₹600', status: 'Active'   },
  { id: 3, name: 'Thyroid Function Test', code: 'TFT-003', category: 'Endocrinology', turnaround: '8 hrs', price: '₹900', status: 'Active'   },
  { id: 4, name: 'Liver Function Test',   code: 'LFT-004', category: 'Biochemistry',  turnaround: '6 hrs', price: '₹750', status: 'Inactive' },
  { id: 5, name: 'HbA1c',                 code: 'DIA-005', category: 'Diabetes',      turnaround: '4 hrs', price: '₹450', status: 'Active'   },
];

export const collectorsData = [
  { id: 1, name: 'Ravi Kumar',   empId: 'EMP-101', phone: '+91 9800012345', zone: 'North Kolkata', samples: 142, status: 'On Duty'  },
  { id: 2, name: 'Priya Sinha',  empId: 'EMP-102', phone: '+91 9800023456', zone: 'South Kolkata', samples: 98,  status: 'On Duty'  },
  { id: 3, name: 'Anil Das',     empId: 'EMP-103', phone: '+91 9800034567', zone: 'East Kolkata',  samples: 76,  status: 'Off Duty' },
  { id: 4, name: 'Sunita Roy',   empId: 'EMP-104', phone: '+91 9800045678', zone: 'West Kolkata',  samples: 115, status: 'On Duty'  },
  { id: 5, name: 'Manoj Ghosh',  empId: 'EMP-105', phone: '+91 9800056789', zone: 'Central',       samples: 63,  status: 'Leave'    },
];

export const testOrdersData = [
  { id: 1, orderId: 'TO-20240601', patient: 'Anjali Sharma',   test: 'CBC-001', doctor: 'Dr. P. Mehta', date: '01 Jun 2024', priority: 'Urgent',  status: 'Pending'    },
  { id: 2, orderId: 'TO-20240602', patient: 'Bikash Paul',     test: 'LIP-002', doctor: 'Dr. S. Bose',  date: '01 Jun 2024', priority: 'Routine', status: 'Processing' },
  { id: 3, orderId: 'TO-20240603', patient: 'Chandana Dey',    test: 'TFT-003', doctor: 'Dr. R. Gupta', date: '02 Jun 2024', priority: 'Routine', status: 'Completed'  },
  { id: 4, orderId: 'TO-20240604', patient: 'Debashis Nag',    test: 'DIA-005', doctor: 'Dr. M. Khan',  date: '02 Jun 2024', priority: 'Urgent',  status: 'Pending'    },
  { id: 5, orderId: 'TO-20240605', patient: 'Esha Mukherjee',  test: 'LFT-004', doctor: 'Dr. P. Mehta', date: '03 Jun 2024', priority: 'Routine', status: 'Cancelled'  },
];

export const collectionOrdersData = [
  { id: 1, orderId: 'CO-20240601', patient: 'Anjali Sharma',  collector: 'Ravi Kumar',  address: '12 Lake Road, North Kolkata',  scheduled: '02 Jun 2024, 7:00 AM',  status: 'Scheduled'  },
  { id: 2, orderId: 'CO-20240602', patient: 'Bikash Paul',    collector: 'Priya Sinha', address: '45 Park St, South Kolkata',    scheduled: '02 Jun 2024, 8:30 AM',  status: 'In Transit' },
  { id: 3, orderId: 'CO-20240603', patient: 'Chandana Dey',   collector: 'Anil Das',    address: '8 Salt Lake, East Kolkata',    scheduled: '01 Jun 2024, 9:00 AM',  status: 'Collected'  },
  { id: 4, orderId: 'CO-20240604', patient: 'Debashis Nag',   collector: 'Sunita Roy',  address: '33 Howrah Road, West Kolkata', scheduled: '03 Jun 2024, 7:30 AM',  status: 'Scheduled'  },
  { id: 5, orderId: 'CO-20240605', patient: 'Esha Mukherjee', collector: 'Manoj Ghosh', address: '2 Central Ave, Kolkata',       scheduled: '01 Jun 2024, 10:00 AM', status: 'Failed'     },
];
