require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const schemes = [
  {
    name: 'PM Kisan Samman Nidhi',
    description: 'Direct income support of ₹6,000 per year for farmer families.',
    department: 'Ministry of Agriculture',
    state: 'All',
    benefit: '₹6,000 / year',
    eligibility_criteria: { occupation: 'Farmer', income_limit: 500000 }
  },
  {
    name: 'Ayushman Bharat PM-JAY',
    description: 'Health insurance cover of ₹5 lakh per family per year.',
    department: 'Ministry of Health',
    state: 'All',
    benefit: '₹5,00,000 Insurance',
    eligibility_criteria: { income_limit: 250000 }
  },
  {
    name: 'Pradhan Mantri Awas Yojana',
    description: 'Financial assistance to build affordable housing for the urban and rural poor.',
    department: 'Ministry of Housing',
    state: 'All',
    benefit: '₹2,67,000 Subsidy',
    eligibility_criteria: { income_limit: 600000 }
  },
  {
    name: 'PM Ujjwala Yojana',
    description: 'Financial support for LPG connections to women of BPL families.',
    department: 'Ministry of Petroleum',
    state: 'All',
    benefit: '₹1,600 Subsidy',
    eligibility_criteria: { income_limit: 100000, gender: 'female' }
  },
  {
    name: 'Sukanya Samriddhi Yojana',
    description: 'High-interest savings scheme for the girl child to fund education and marriage.',
    department: 'Ministry of Finance',
    state: 'All',
    benefit: '8.2% Interest',
    eligibility_criteria: { gender: 'female', max_age: 10 }
  },
  {
    name: 'National Scholarship Portal (Pre-Matric)',
    description: 'Scholarships for minority community students studying in classes 1 to 10.',
    department: 'Ministry of Minority Affairs',
    state: 'All',
    benefit: '₹10,000 / year',
    eligibility_criteria: { occupation: 'Student', income_limit: 100000 }
  },
  {
    name: 'PM Jeevan Jyoti Bima Yojana',
    description: 'Life insurance cover of ₹2 lakh at a premium of just ₹436 per year.',
    department: 'Ministry of Finance',
    state: 'All',
    benefit: '₹2,00,000 Insurance',
    eligibility_criteria: { min_age: 18, max_age: 50 }
  }
];

async function seed() {
  console.log('Seeding schemes...');
  for (const scheme of schemes) {
    const { data, error } = await supabase
      .from('schemes')
      .insert([scheme])
      .select();
    if (error) {
      console.error(`Error inserting ${scheme.name}:`, error.message);
    } else {
      console.log(`Inserted ${scheme.name}`);
    }
  }
  console.log('Done!');
}

seed();
