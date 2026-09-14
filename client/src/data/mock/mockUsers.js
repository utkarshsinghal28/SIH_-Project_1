import { ROLES } from '../../utils/constants.js';

/**
 * DEVELOPMENT-ONLY accounts.
 *
 * Passwords are stored in plain text here purely so the Part 1 demo can log in
 * without a backend. Part 2 replaces this with bcrypt-hashed users in MongoDB.
 */
export const mockUsers = [
  {
    id: 'usr_farmer_001',
    role: ROLES.FARMER,
    name: 'Ramesh Patil',
    phone: '9876543210',
    email: 'ramesh.patil@example.com',
    password: 'farmer123',
    village: 'Shirwal',
    district: 'Satara',
    state: 'Maharashtra',
    createdAt: '2026-01-06T09:12:00.000Z',
  },
  {
    id: 'usr_farmer_002',
    role: ROLES.FARMER,
    name: 'Sunita Devi',
    phone: '9812345678',
    email: '',
    password: 'farmer123',
    village: 'Barhi',
    district: 'Hazaribagh',
    state: 'Jharkhand',
    createdAt: '2026-01-11T06:40:00.000Z',
  },
  {
    id: 'usr_admin_001',
    role: ROLES.ADMIN,
    name: 'District Procurement Officer',
    phone: '9000000001',
    email: 'admin@krishi.gov.in',
    password: 'admin123',
    designation: 'District Procurement Officer',
    district: 'Satara',
    state: 'Maharashtra',
    createdAt: '2025-12-01T05:00:00.000Z',
  },
];
