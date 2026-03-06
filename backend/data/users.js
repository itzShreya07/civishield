// In-memory user store (mock data for hackathon MVP)
// Passwords are bcrypt hashes of the plaintext shown in comments

const users = [
  {
    id: 'u1',
    name: 'Alice Chen',
    email: 'alice@civishield.io',
    // password: citizen123
    password: '$2a$10$YKKm4MK2KN3sRrmh4FVexudPSHn0XN5WlMUXnAMJvfnpYu/Y0BVbC',
    role: 'Citizen',
    zone: null,
  },
  {
    id: 'u2',
    name: 'Officer Raj',
    email: 'raj@civishield.io',
    // password: officer123
    password: '$2a$10$YKKm4MK2KN3sRrmh4FVexudPSHn0XN5WlMUXnAMJvfnpYu/Y0BVbC',
    role: 'FieldOfficer',
    zone: 'Ward 5',
  },
  {
    id: 'u3',
    name: 'Officer Priya',
    email: 'priya@civishield.io',
    // password: officer123
    password: '$2a$10$YKKm4MK2KN3sRrmh4FVexudPSHn0XN5WlMUXnAMJvfnpYu/Y0BVbC',
    role: 'FieldOfficer',
    zone: 'Ward 9',
  },
  {
    id: 'u4',
    name: 'Admin Kumar',
    email: 'kumar@civishield.io',
    // password: admin123
    password: '$2a$10$YKKm4MK2KN3sRrmh4FVexudPSHn0XN5WlMUXnAMJvfnpYu/Y0BVbC',
    role: 'DepartmentAdmin',
    zone: null,
  },
  {
    id: 'u5',
    name: 'Super Admin',
    email: 'superadmin@civishield.io',
    // password: super123
    password: '$2a$10$YKKm4MK2KN3sRrmh4FVexudPSHn0XN5WlMUXnAMJvfnpYu/Y0BVbC',
    role: 'SuperAdmin',
    zone: null,
  },
];

module.exports = { users };
