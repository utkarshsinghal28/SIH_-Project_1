import { CENTRE_STATUS } from '../models/Centre.js';
import { ROLES } from '../models/User.js';

/**
 * Demo dataset used by `npm run seed`.
 * DEVELOPMENT ONLY - these credentials must never be used in production.
 */
export const DEMO_PASSWORDS = {
  admin: 'Admin@123',
  farmer: 'Farmer@123',
};

export const users = [
  {
    name: 'District Procurement Officer',
    phone: '9999999999',
    email: 'admin@krishi.gov.in',
    password: DEMO_PASSWORDS.admin,
    role: ROLES.ADMIN,
    designation: 'District Procurement Officer',
    district: 'Satara',
    state: 'Maharashtra',
  },
  {
    name: 'Ramesh Patil',
    phone: '9876543210',
    email: 'ramesh.patil@example.com',
    password: DEMO_PASSWORDS.farmer,
    role: ROLES.FARMER,
    village: 'Shirwal',
    district: 'Satara',
    state: 'Maharashtra',
  },
  {
    name: 'Sunita Devi',
    phone: '9812345678',
    email: '',
    password: DEMO_PASSWORDS.farmer,
    role: ROLES.FARMER,
    village: 'Barhi',
    district: 'Hazaribagh',
    state: 'Jharkhand',
  },
];

export const centres = [
  {
    name: 'Satara Taluka Procurement Centre',
    address: 'Krishi Utpanna Bazar Samiti, Powai Naka, Satara',
    district: 'Satara',
    state: 'Maharashtra',
    status: CENTRE_STATUS.ACTIVE,
    inchargeName: 'S. R. Kulkarni',
    contactPhone: '02162 234567',
    commodities: ['Wheat', 'Jowar'],
    counters: 4,
  },
  {
    name: 'Karad Block Procurement Centre',
    address: 'Near Bus Stand Road, Karad, Satara',
    district: 'Satara',
    state: 'Maharashtra',
    status: CENTRE_STATUS.ACTIVE,
    inchargeName: 'A. B. Jadhav',
    contactPhone: '02164 221190',
    commodities: ['Wheat', 'Gram'],
    counters: 3,
  },
  {
    name: 'Baramati Mandi Procurement Centre',
    address: 'MIDC Road, Baramati, Pune',
    district: 'Pune',
    state: 'Maharashtra',
    status: CENTRE_STATUS.ACTIVE,
    inchargeName: 'P. M. Shinde',
    contactPhone: '02112 245001',
    commodities: ['Wheat', 'Maize'],
    counters: 5,
  },
  {
    name: 'Hazaribagh Sadar Procurement Centre',
    address: 'Block Office Campus, Sadar, Hazaribagh',
    district: 'Hazaribagh',
    state: 'Jharkhand',
    status: CENTRE_STATUS.ACTIVE,
    inchargeName: 'R. K. Mahto',
    contactPhone: '06546 223344',
    commodities: ['Paddy'],
    counters: 3,
  },
  {
    name: 'Barhi Panchayat Procurement Centre',
    address: 'NH-33 Junction, Barhi, Hazaribagh',
    district: 'Hazaribagh',
    state: 'Jharkhand',
    status: CENTRE_STATUS.INACTIVE,
    inchargeName: 'N. Kumari',
    contactPhone: '06546 998877',
    commodities: ['Paddy'],
    counters: 2,
  },
  {
    name: 'Karnal Grain Market Procurement Centre',
    address: 'New Grain Market, Sector 3, Karnal',
    district: 'Karnal',
    state: 'Haryana',
    status: CENTRE_STATUS.ACTIVE,
    inchargeName: 'H. S. Dhillon',
    contactPhone: '0184 2251100',
    commodities: ['Wheat', 'Paddy'],
    counters: 6,
  },
  {
    name: 'Ludhiana Central Procurement Centre',
    address: 'Grain Market, Gill Road, Ludhiana',
    district: 'Ludhiana',
    state: 'Punjab',
    status: CENTRE_STATUS.ACTIVE,
    inchargeName: 'J. Singh',
    contactPhone: '0161 2440022',
    commodities: ['Wheat', 'Paddy'],
    counters: 6,
  },
  {
    name: 'Warangal Rural Procurement Centre',
    address: 'Market Yard, Hanamkonda, Warangal',
    district: 'Warangal',
    state: 'Telangana',
    status: CENTRE_STATUS.INACTIVE,
    inchargeName: 'K. Ravi',
    contactPhone: '0870 2551234',
    commodities: ['Paddy', 'Maize'],
    counters: 2,
  },
];

/** Time blocks generated for each active centre, for the next few days. */
export const timeBlocks = [
  ['09:00', '10:00'],
  ['10:00', '11:00'],
  ['11:00', '12:00'],
  ['14:00', '15:00'],
  ['15:00', '16:00'],
];
