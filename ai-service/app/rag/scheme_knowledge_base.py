"""
SchemeWise AI - Official Scheme Knowledge Base
Comprehensive dataset of Central and State Government Schemes across India.
Each scheme contains verified eligibility criteria, document requirements,
income limits, age brackets, categories, benefits, application steps, and official sources.
"""

from typing import List, Dict, Any
import json
import os

_loaded_schemes = None

def _load_all_schemes() -> List[Dict[str, Any]]:
    global _loaded_schemes
    if _loaded_schemes is not None:
        return _loaded_schemes
        
    schemes = list(OFFICIAL_SCHEMES)
    
    # Try loading the generated TN schemes
    tn_schemes_path = os.path.join(os.path.dirname(__file__), "..", "data", "tn_234_schemes.json")
    if os.path.exists(tn_schemes_path):
        try:
            with open(tn_schemes_path, "r", encoding="utf-8") as f:
                tn_schemes = json.load(f)
                schemes.extend(tn_schemes)
        except Exception as e:
            print(f"Error loading TN schemes: {e}")
            
    _loaded_schemes = schemes
    return _loaded_schemes

OFFICIAL_SCHEMES: List[Dict[str, Any]] = [
    {
        "id": "pcardbpt",
        "name": "Primary Cooperative Agriculture and Rural Development Bank: For Power Tiller",
        "short_name": "PCARDB Power Tiller Loan",
        "ministry": "Co-operation, Food and Consumer Protection Department, Tamil Nadu",
        "state": "Tamil Nadu",
        "category": "Agriculture, Rural & Environment",
        "target_audience": ["Farmers", "Agricultural Workers"],
        "description": "The 'Primary Cooperative Agriculture and Rural Development Bank: Power Tiller' scheme launched by the Co-operation, Food and Consumer Protection Department, Tamil Nadu, aims to provide financial assistance to farmers for purchasing a power tiller, with up to 90% of the cost covered through a loan. Interest rate ranges from 11% to 12.25%.",
        "benefits": "Access to Loan: Up to 90% of the cost of a power tiller. Interest Rate: 11% to 12.25%.",
        "benefit_amount": 180000,
        "eligibility": {
            "occupation": ["Farmer", "Agriculture"],
            "min_age": 18,
            "max_age": 75,
            "state": "Tamil Nadu",
            "gender": "All",
            "caste": "All"
        },
        "required_documents": [
            "Aadhaar Card (Identity & Address Proof)",
            "Land Ownership Documents (Patta / Chitta / Adangal)",
            "Farmer Identity Card / Proof of Farming",
            "Quotation for Power Tiller from Authorized Dealer",
            "Bank Account Passbook / Cancelled Cheque",
            "Passport Size Photographs"
        ],
        "application_procedure": [
            "Visit the nearest Primary Cooperative Agriculture and Rural Development Bank (PCARDB) branch or PACCS.",
            "Collect the application form for the Power Tiller Loan Scheme.",
            "Fill in personal details, land survey numbers, and power tiller dealer quotation.",
            "Attach verified copies of Aadhaar, Patta/Chitta, and Dealer Quotation.",
            "Submit application for field verification and loan sanctioning."
        ],
        "official_source": "https://www.myscheme.gov.in/schemes/pcardbpt",
        "last_updated": "2026-09-18",
        "tags": ["Agriculture And Rural Development Bank", "Farmer", "Farming Equipment", "Loan", "Power Tiller"]
    },
    {
        "id": "pm-vidyalaxmi",
        "name": "PM Vidyalaxmi Scheme",
        "short_name": "PM Vidyalaxmi",
        "ministry": "Ministry of Education",
        "state": "All India",
        "category": "Education",
        "target_audience": ["Students", "Youth"],
        "description": "Financial support for meritorious students securing admission in top 860 higher education institutions in India. Provides collateral-free, guarantor-free education loans with 75% credit guarantee and 3% interest subvention for family income up to ₹8 Lakh.",
        "benefits": "Collateral-free loan up to ₹7.5 Lakh (75% credit guarantee) + 3% interest subvention for family income up to ₹8 Lakh/annum.",
        "benefit_amount": 750000,
        "eligibility": {
            "occupation": ["Student"],
            "max_income": 800000,
            "min_age": 16,
            "max_age": 35,
            "education": ["12th Pass", "Undergraduate", "Postgraduate"],
            "gender": "All",
            "caste": "All"
        },
        "required_documents": [
            "Aadhaar Card",
            "10th & 12th Marksheets",
            "Admission Offer Letter / Fee Structure",
            "Income Certificate (Family income <= 8 LPA)",
            "Bank Account Passbook / Cancelled Cheque",
            "PAN Card (Self or Parent)"
        ],
        "application_procedure": [
            "Register on the unified PM-Vidyalaxmi portal (pmvidyalaxmi.gov.in).",
            "Fill Common Education Loan Application Form (CELAF).",
            "Upload admission letter and verified income certificate.",
            "Choose preferred participating commercial bank."
        ],
        "official_source": "https://www.pmvidyalaxmi.gov.in",
        "last_updated": "2025-01-15",
        "tags": ["education", "student", "loan", "scholarship", "higher education"]
    },
    {
        "id": "tn-pudhumai-penn",
        "name": "Moovalur Ramamirtham Ammaiyar Higher Education Assurance Scheme (Pudhumai Penn)",
        "short_name": "Pudhumai Penn Scheme",
        "ministry": "Department of Social Welfare and Women Empowerment, Tamil Nadu",
        "state": "Tamil Nadu",
        "category": "Women Empowerment & Education",
        "target_audience": ["Female Students", "Women"],
        "description": "Financial incentive of ₹1,000 per month deposited directly into bank accounts of female students who studied from Classes 6 to 12 in Tamil Nadu Government schools, until they complete their undergraduate degree, diploma, or ITI course.",
        "benefits": "₹1,000 monthly financial assistance (₹12,000 per year) directly credited to student's bank account.",
        "benefit_amount": 12000,
        "eligibility": {
            "occupation": ["Student"],
            "state": "Tamil Nadu",
            "gender": "Female",
            "min_age": 17,
            "max_age": 25,
            "education": ["Undergraduate", "Diploma", "ITI"],
            "schooling": "Studied in Tamil Nadu Government Schools from Classes 6 to 12",
            "caste": "All"
        },
        "required_documents": [
            "Aadhaar Card",
            "School Transfer Certificate (TC) confirming Class 6-12 in Govt School",
            "College ID Card & Admission Bona Fide",
            "Bank Passbook linked with Aadhaar",
            "Passport Size Photograph"
        ],
        "application_procedure": [
            "Apply via the Penkalvi portal (penkalvi.tn.gov.in) through college nodal officer.",
            "College verifies EMIS government school attendance records.",
            "Monthly DBT payout approved by Social Welfare Department."
        ],
        "official_source": "https://penkalvi.tn.gov.in",
        "last_updated": "2024-11-20",
        "tags": ["tamil nadu", "women", "female student", "higher education", "dbt", "monthly stipend"]
    },
    {
        "id": "tn-post-matric-scholarship",
        "name": "Tamil Nadu Post Matric Scholarship for SC/ST/SCC Students",
        "short_name": "TN Post Matric Scholarship",
        "ministry": "Adi Dravidar and Tribal Welfare Department, Tamil Nadu",
        "state": "Tamil Nadu",
        "category": "Education & Social Justice",
        "target_audience": ["Students"],
        "description": "Full compulsory tuition fee waiver and maintenance allowance for SC, ST, and Converted Christian students pursuing post-matriculation courses (Class 11 to PhD) in Tamil Nadu with family income <= ₹2.5 Lakh.",
        "benefits": "100% compulsory tuition fees reimbursement + maintenance allowance up to ₹13,500/year.",
        "benefit_amount": 50000,
        "eligibility": {
            "occupation": ["Student"],
            "state": "Tamil Nadu",
            "caste": ["SC", "ST", "SCC"],
            "max_income": 250000,
            "min_age": 15,
            "max_age": 35,
            "education": ["Class 11", "Class 12", "Undergraduate", "Postgraduate", "PhD"]
        },
        "required_documents": [
            "Community / Caste Certificate",
            "Income Certificate (<= ₹2.5 Lakh)",
            "10th / 12th Marksheets",
            "Aadhaar Card",
            "College Fee Receipt & Bona Fide",
            "Bank Passbook"
        ],
        "application_procedure": [
            "Apply through National Scholarship Portal (scholarships.gov.in) or TN e-District.",
            "College verification of original community and income certificates.",
            "District Welfare Officer approval and DBT disbursement."
        ],
        "official_source": "https://scholarships.gov.in",
        "last_updated": "2024-12-05",
        "tags": ["tamil nadu", "scholarship", "sc", "st", "student", "tuition waiver"]
    },
    {
        "id": "pm-kisan",
        "name": "Pradhan Mantri Kisan Samman Nidhi (PM-KISAN)",
        "short_name": "PM-KISAN",
        "ministry": "Ministry of Agriculture and Farmers Welfare",
        "state": "All India",
        "category": "Agriculture",
        "target_audience": ["Farmers", "Landholders"],
        "description": "Direct income support of ₹6,000 per year in three equal instalments of ₹2,000 to all landholding farmer families across India via DBT.",
        "benefits": "₹6,000 per year deposited directly into bank account via DBT (₹2,000 every 4 months).",
        "benefit_amount": 6000,
        "eligibility": {
            "occupation": ["Farmer", "Agriculturist"],
            "min_age": 18,
            "caste": "All",
            "gender": "All"
        },
        "required_documents": [
            "Aadhaar Card (e-KYC completed)",
            "Land Ownership Records / RoR / Khasra-Khatauni (Land Deed)",
            "Aadhaar-linked Bank Account",
            "Active Mobile Number"
        ],
        "application_procedure": [
            "Self-register at pmkisan.gov.in or visit nearest CSC center.",
            "Enter Aadhaar number and cultivable land details.",
            "State Nodal Officer verifies land records for DBT approval."
        ],
        "official_source": "https://pmkisan.gov.in",
        "last_updated": "2025-02-01",
        "tags": ["farmer", "agriculture", "income support", "pm kisan", "dbt", "rural"]
    },
    {
        "id": "ayushman-bharat-pmjay",
        "name": "Ayushman Bharat Pradhan Mantri Jan Arogya Yojana (AB-PMJAY)",
        "short_name": "Ayushman Bharat (PM-JAY)",
        "ministry": "National Health Authority, Ministry of Health and Family Welfare",
        "state": "All India",
        "category": "Healthcare",
        "target_audience": ["Low-income Families", "Senior Citizens (70+)"],
        "description": "World's largest health assurance scheme providing cashless health cover of up to ₹5 Lakh per family per year for secondary and tertiary care hospitalization across 29,000+ empaneled hospitals. Also covers all senior citizens aged 70+ irrespective of income.",
        "benefits": "Cashless in-patient treatment up to ₹5,00,000 per family/individual per year covering 1,900+ medical procedures.",
        "benefit_amount": 500000,
        "eligibility": {
            "max_income": 300000,
            "caste": "All",
            "gender": "All"
        },
        "required_documents": [
            "Aadhaar Card (Mandatory for e-KYC)",
            "Ration Card / Family ID",
            "Active Mobile Number",
            "Age Proof (for 70+ Senior Citizen Card)"
        ],
        "application_procedure": [
            "Check eligibility on beneficiary.nha.gov.in or Ayushman App.",
            "Complete Aadhaar-based e-KYC.",
            "Download instant digital Ayushman Card and present at hospital."
        ],
        "official_source": "https://pmjay.gov.in",
        "last_updated": "2025-01-25",
        "tags": ["healthcare", "hospitalization", "health insurance", "ayushman card", "cashless"]
    },
    {
        "id": "pm-mudra-yojana",
        "name": "Pradhan Mantri MUDRA Yojana (PMMY)",
        "short_name": "PM Mudra Yojana",
        "ministry": "Ministry of Finance",
        "state": "All India",
        "category": "Business & Entrepreneurship",
        "target_audience": ["Entrepreneurs", "Small Business Owners", "Artisans", "Self-employed"],
        "description": "Collateral-free institutional credit up to ₹20 Lakh (Tarun Plus) to micro and small non-corporate, non-farm enterprises for business setup or expansion.",
        "benefits": "Collateral-free business loans: Shishu (up to ₹50,000), Kishore (₹50k-₹5L), Tarun (₹5L-₹10L), Tarun Plus (₹10L-₹20L).",
        "benefit_amount": 1000000,
        "eligibility": {
            "occupation": ["Business Owner", "Self-Employed", "Artisan", "Shopkeeper", "Entrepreneur"],
            "min_age": 18,
            "max_age": 65,
            "caste": "All",
            "gender": "All"
        },
        "required_documents": [
            "Proof of Identity (Aadhaar / Voter ID / Passport)",
            "Business Enterprise Proof (Udyam Registration / GSTIN / Trade License)",
            "Project Report / Business Plan",
            "Bank Statement of last 6 months"
        ],
        "application_procedure": [
            "Apply online through Udyamimitra portal (udyamimitra.in) or any bank branch.",
            "Submit business proposal and identity proof.",
            "Bank sanctions and disburses loan with Mudra Card."
        ],
        "official_source": "https://www.mudra.org.in",
        "last_updated": "2025-01-10",
        "tags": ["business", "loan", "msme", "entrepreneur", "self employed", "mudra"]
    },
    {
        "id": "pm-awas-yojana-urban",
        "name": "Pradhan Mantri Awas Yojana - Urban (PMAY-U 2.0)",
        "short_name": "PMAY-Urban 2.0",
        "ministry": "Ministry of Housing and Urban Affairs",
        "state": "All India",
        "category": "Housing",
        "target_audience": ["Urban Poor", "Middle Class Families"],
        "description": "All-weather pucca houses to eligible urban families belonging to EWS, LIG, and Middle Income Groups (MIG) with interest subsidies on home loans up to ₹1.80 Lakh and direct construction grants.",
        "benefits": "Interest subsidy up to ₹1.80 Lakh on home loan + direct financial assistance up to ₹2.50 Lakh for house construction.",
        "benefit_amount": 250000,
        "eligibility": {
            "min_age": 21,
            "max_age": 70,
            "max_income": 900000
        },
        "required_documents": [
            "Aadhaar Cards of all family members",
            "Income Certificate / Salary Slips / Form 16",
            "Land Ownership Document / Title Deed (for self-construction)",
            "Affidavit declaring no pucca house owned in India"
        ],
        "application_procedure": [
            "Apply online through pmaymis.gov.in or nearest CSC center.",
            "Urban Local Body conducts geo-tagging and field verification.",
            "Subsidy credited via DBT linked to construction milestones."
        ],
        "official_source": "https://pmaymis.gov.in",
        "last_updated": "2024-10-30",
        "tags": ["housing", "urban", "pmay", "home loan", "interest subsidy", "pucca house"]
    },
    {
        "id": "pm-vishwakarma",
        "name": "PM Vishwakarma Scheme",
        "short_name": "PM Vishwakarma",
        "ministry": "Ministry of Micro, Small and Medium Enterprises (MSME)",
        "state": "All India",
        "category": "Artisans & Craftsmen",
        "target_audience": ["Artisans", "Craftspeople", "Traditional Trades"],
        "description": "Holistic support to traditional artisans and craftsmen engaged in 18 identified trades (e.g. carpenter, blacksmith, potter, mason, tailor). Offers skill verification, ₹15,000 tool kit incentive, and collateral-free enterprise loan up to ₹3 Lakh at 5% concessional interest.",
        "benefits": "₹15,000 e-voucher toolkit grant + skill training stipend (₹500/day) + collateral-free loan up to ₹3 Lakh at 5% interest.",
        "benefit_amount": 315000,
        "eligibility": {
            "occupation": ["Artisan", "Craftsman", "Carpenter", "Blacksmith", "Potter", "Sculptor", "Cobbler", "Mason", "Tailor", "Barber", "Washerman"],
            "min_age": 18,
            "caste": "All"
        },
        "required_documents": [
            "Aadhaar Card",
            "Mobile Number linked to Aadhaar",
            "Bank Account Details",
            "Ration Card / Family Proof",
            "Trade Skill Declaration"
        ],
        "application_procedure": [
            "Enroll at nearest CSC center via pmvishwakarma.gov.in.",
            "Gram Panchayat / Urban Local Body verification.",
            "Receive PM Vishwakarma Digital Certificate and ID card.",
            "Complete basic training and receive ₹15,000 toolkit grant."
        ],
        "official_source": "https://pmvishwakarma.gov.in",
        "last_updated": "2025-01-18",
        "tags": ["artisan", "craftsman", "msme", "toolkit", "skill training", "concessional loan"]
    },
    {
        "id": "pm-svanidhi",
        "name": "PM Street Vendor's AtmaNirbhar Nidhi (PM SVANidhi)",
        "short_name": "PM SVANidhi",
        "ministry": "Ministry of Housing and Urban Affairs",
        "state": "All India",
        "category": "Street Vendors & Livelihood",
        "target_audience": ["Street Vendors", "Hawkers"],
        "description": "Special micro-credit facility for urban street vendors providing collateral-free working capital loans of ₹10,000 (1st tranche), ₹20,000 (2nd tranche), and ₹50,000 (3rd tranche) with 7% interest subsidy and cashback on digital transactions.",
        "benefits": "Collateral-free working capital loan up to ₹50,000 with 7% interest subsidy + ₹1,200 annual digital cashback.",
        "benefit_amount": 50000,
        "eligibility": {
            "occupation": ["Street Vendor", "Hawker", "Vendor"],
            "min_age": 18
        },
        "required_documents": [
            "Aadhaar Card",
            "Certificate of Vending / ULB Identity Card / Letter of Recommendation (LoR)",
            "Bank Account Passbook"
        ],
        "application_procedure": [
            "Apply online through pmsvanidhi.mohua.gov.in or through Banking Correspondent / CSC.",
            "Select lending institution.",
            "Loan sanctioned within 15 days directly into vendor account."
        ],
        "official_source": "https://pmsvanidhi.mohua.gov.in",
        "last_updated": "2024-12-10",
        "tags": ["street vendor", "hawker", "micro credit", "working capital", "urban"]
    },
    {
        "id": "stand-up-india",
        "name": "Stand-Up India Scheme",
        "short_name": "Stand-Up India",
        "ministry": "Ministry of Finance",
        "state": "All India",
        "category": "Women & SC/ST Entrepreneurship",
        "target_audience": ["Women Entrepreneurs", "SC/ST Entrepreneurs"],
        "description": "Bank loans between ₹10 Lakh and ₹1 Crore to at least one SC/ST borrower and at least one woman borrower per bank branch for setting up greenfield enterprises in manufacturing, services, agri-allied, or trading sector.",
        "benefits": "Composite loan between ₹10,00,000 and ₹1,00,00,000 covering up to 85% of project cost.",
        "benefit_amount": 5000000,
        "eligibility": {
            "min_age": 18,
            "gender": "Female"
        },
        "required_documents": [
            "Identity & Residence Proof (Aadhaar, Passport, Voter ID)",
            "SC / ST Certificate (if applicable)",
            "Detailed Project Report (DPR)",
            "Company / MSME Registration documents"
        ],
        "application_procedure": [
            "Apply directly through Stand-Up India portal (standupmitra.in).",
            "Connect with handholding agencies for DPR preparation.",
            "Bank branch sanctions composite facility with CGSSI credit guarantee."
        ],
        "official_source": "https://www.standupmitra.in",
        "last_updated": "2025-01-05",
        "tags": ["women entrepreneur", "sc", "st", "business loan", "startup"]
    },
    {
        "id": "sukanya-samriddhi-yojana",
        "name": "Sukanya Samriddhi Yojana (SSY)",
        "short_name": "Sukanya Samriddhi Yojana",
        "ministry": "Ministry of Finance",
        "state": "All India",
        "category": "Girl Child & Savings",
        "target_audience": ["Parents of Girl Child"],
        "description": "Government-backed high-interest small savings scheme for girl children under 'Beti Bachao Beti Padhao'. Offers 8.2% annual interest (tax-free under Section 80C) with maturity after 21 years or marriage.",
        "benefits": "High sovereign interest rate (currently 8.2% p.a.) + full tax deduction under 80C + 100% tax exemption on maturity (EEE).",
        "benefit_amount": 1500000,
        "eligibility": {
            "gender": "Female",
            "max_age": 10
        },
        "required_documents": [
            "Birth Certificate of the Girl Child",
            "Identity Proof of Parent/Guardian (Aadhaar / PAN)",
            "Address Proof of Parent/Guardian",
            "Passport-size Photographs"
        ],
        "application_procedure": [
            "Visit any Post Office branch or authorized commercial bank.",
            "Submit SSY account opening form with initial deposit (min ₹250).",
            "Obtain passbook for ongoing deposits (up to ₹1.5 Lakh per financial year)."
        ],
        "official_source": "https://www.nsiindia.gov.in",
        "last_updated": "2025-01-01",
        "tags": ["girl child", "savings", "tax free", "education fund", "post office"]
    },
    {
        "id": "atal-pension-yojana",
        "name": "Atal Pension Yojana (APY)",
        "short_name": "Atal Pension Yojana",
        "ministry": "Ministry of Finance",
        "state": "All India",
        "category": "Pension & Social Security",
        "target_audience": ["Unorganized Workers", "All Citizens (18-40)"],
        "description": "Guaranteed monthly pension of ₹1,000, ₹2,000, ₹3,000, ₹4,000 or ₹5,000 per month starting from age 60, based on contributions made during the age of 18 to 40 years.",
        "benefits": "Guaranteed lifetime monthly pension of ₹1,000 to ₹5,000 from age 60 + full pension corpus returned to nominee upon spouse demise.",
        "benefit_amount": 60000,
        "eligibility": {
            "min_age": 18,
            "max_age": 40,
            "caste": "All",
            "gender": "All"
        },
        "required_documents": [
            "Aadhaar Card",
            "Savings Bank Account Passbook",
            "Mobile Number linked with Bank"
        ],
        "application_procedure": [
            "Enroll via net banking, mobile banking, or visit your bank branch / post office.",
            "Set auto-debit consent for monthly/quarterly contribution based on target pension."
        ],
        "official_source": "https://www.npscra.nsdl.co.in",
        "last_updated": "2025-01-01",
        "tags": ["pension", "retirement", "social security", "unorganized worker", "atal pension"]
    },
    {
        "id": "pm-fasal-bima",
        "name": "Pradhan Mantri Fasal Bima Yojana (PMFBY)",
        "short_name": "PM Fasal Bima",
        "ministry": "Ministry of Agriculture and Farmers Welfare",
        "state": "All India",
        "category": "Agriculture & Insurance",
        "target_audience": ["Farmers", "Sharecroppers"],
        "description": "Comprehensive crop insurance scheme protecting farmers against non-preventable natural risks from pre-sowing to post-harvest at ultra-low uniform premium rates (1.5% for Rabi, 2% for Kharif, 5% for commercial/horticultural crops).",
        "benefits": "Full sum insured payout for crop loss due to drought, flood, pests, hailstorm, or post-harvest cyclone damage.",
        "benefit_amount": 200000,
        "eligibility": {
            "occupation": ["Farmer", "Agriculturist"],
            "min_age": 18
        },
        "required_documents": [
            "Aadhaar Card",
            "Land Possession Certificate (LPC) / Land Records (RoR)",
            "Sowing Certificate / Crop Declaration",
            "Bank Passbook"
        ],
        "application_procedure": [
            "Enroll via National Crop Insurance Portal (pmfby.gov.in), bank branch, or CSC.",
            "Submit crop sowing certificate before cutoff date.",
            "Claim directly calculated and disbursed via DBT upon crop cutting experiment assessment."
        ],
        "official_source": "https://pmfby.gov.in",
        "last_updated": "2025-01-15",
        "tags": ["farmer", "crop insurance", "agriculture", "fasal bima", "dbt"]
    },
    {
        "id": "pm-ujjwala-yojana",
        "name": "Pradhan Mantri Ujjwala Yojana 2.0 (PMUY)",
        "short_name": "PM Ujjwala 2.0",
        "ministry": "Ministry of Petroleum and Natural Gas",
        "state": "All India",
        "category": "Women & Energy",
        "target_audience": ["Women from Low-income Households"],
        "description": "Deposit-free LPG connection provided in the name of an adult woman of poor households, along with first refill and hotplate (stove) completely free.",
        "benefits": "Free LPG connection + first refill and stove free of cost + ongoing targeted subsidy of ₹300 per cylinder.",
        "benefit_amount": 3600,
        "eligibility": {
            "gender": "Female",
            "min_age": 18,
            "max_income": 200000
        },
        "required_documents": [
            "Aadhaar Card of Applicant & Family Members",
            "Ration Card / Proof of BPL status / Self-Declaration for Migrants",
            "Aadhaar-linked Bank Account Passbook",
            "Passport Size Photograph"
        ],
        "application_procedure": [
            "Apply online through pmuy.gov.in or submit form at nearest LPG distributor (Indane/BharatGas/HP Gas).",
            "Distributor verifies family roster through national LPG portal.",
            "Immediate installation and safety demonstration at beneficiary home."
        ],
        "official_source": "https://www.pmuy.gov.in",
        "last_updated": "2024-12-01",
        "tags": ["women", "lpg", "free gas", "clean energy", "bpl", "ujjwala"]
    },
    {
        "id": "karnataka-yuva-nidhi",
        "name": "Karnataka Yuva Nidhi Scheme",
        "short_name": "Yuva Nidhi",
        "ministry": "Department of Skill Development, Entrepreneurship and Livelihood, Karnataka",
        "state": "Karnataka",
        "category": "Youth & Unemployment Assistance",
        "target_audience": ["Unemployed Graduates", "Diploma Holders"],
        "description": "Financial assistance of ₹3,000 per month for degree holders and ₹1,500 per month for diploma holders who graduated in recent academic years and are unemployed for 6+ months.",
        "benefits": "₹3,000/month for Unemployed Degree Graduates and ₹1,500/month for Diploma Holders for up to 2 years.",
        "benefit_amount": 36000,
        "eligibility": {
            "state": "Karnataka",
            "occupation": ["Unemployed", "Job Seeker", "Graduate"],
            "education": ["Undergraduate", "Postgraduate", "Diploma"],
            "min_age": 18,
            "max_age": 30
        },
        "required_documents": [
            "Karnataka Domicile Proof",
            "Degree / Diploma Marks Cards & Convocation Certificate",
            "Aadhaar Card",
            "Aadhaar-linked Bank Account Passbook",
            "Self-declaration of Unemployment"
        ],
        "application_procedure": [
            "Apply online via Seva Sindhu portal (sevasindhuservices.karnataka.gov.in).",
            "NAD / University database auto-verifies academic credentials.",
            "Monthly DBT deposited directly into candidate's bank account."
        ],
        "official_source": "https://sevasindhuservices.karnataka.gov.in",
        "last_updated": "2024-11-10",
        "tags": ["karnataka", "youth", "unemployment stipend", "graduates", "diploma", "yuva nidhi"]
    },
    {
        "id": "up-kanya-sumangala",
        "name": "Mukhya Mantri Kanya Sumangala Yojana",
        "short_name": "UP Kanya Sumangala",
        "ministry": "Department of Women and Child Development, Uttar Pradesh",
        "state": "Uttar Pradesh",
        "category": "Girl Child & Education",
        "target_audience": ["Parents of Girl Child"],
        "description": "Direct financial aid of ₹25,000 disbursed in 6 staged instalments starting from birth, immunization, admission in Class 1, Class 6, Class 9, and graduation/diploma course.",
        "benefits": "Total ₹25,000 financial assistance across 6 educational and developmental milestones via DBT.",
        "benefit_amount": 25000,
        "eligibility": {
            "state": "Uttar Pradesh",
            "gender": "Female",
            "max_income": 300000,
            "max_age": 25
        },
        "required_documents": [
            "Aadhaar Card of Parent and Girl Child",
            "UP Resident Certificate",
            "Income Certificate (<= ₹3 Lakh)",
            "Birth Certificate / School Admission Proof",
            "Bank Passbook"
        ],
        "application_procedure": [
            "Apply online at mksy.up.gov.in.",
            "Block Development Officer (BDO) / SDM verification.",
            "Staged DBT payments credited upon uploading milestone certificates."
        ],
        "official_source": "https://mksy.up.gov.in",
        "last_updated": "2024-10-15",
        "tags": ["uttar pradesh", "girl child", "education", "dbt", "kanya sumangala"]
    },
    {
        "id": "maharashtra-ladki-bahin",
        "name": "Mukhyamantri Majhi Ladki Bahin Yojana",
        "short_name": "Majhi Ladki Bahin",
        "ministry": "Women and Child Development Department, Maharashtra",
        "state": "Maharashtra",
        "category": "Women Empowerment & Livelihood",
        "target_audience": ["Women", "Homemakers"],
        "description": "Direct financial assistance of ₹1,500 per month (₹18,000 per year) deposited directly into Aadhaar-seeded bank accounts of eligible women aged 21 to 65 years residing in Maharashtra.",
        "benefits": "₹1,500 monthly DBT financial assistance directly credited to beneficiary's bank account.",
        "benefit_amount": 18000,
        "eligibility": {
            "state": "Maharashtra",
            "gender": "Female",
            "min_age": 21,
            "max_age": 65,
            "max_income": 250000
        },
        "required_documents": [
            "Aadhaar Card",
            "Maharashtra Domicile Certificate / Ration Card",
            "Income Certificate (<= ₹2.5 Lakh) or Yellow/Orange Ration Card",
            "Aadhaar-seeded Bank Account Details"
        ],
        "application_procedure": [
            "Apply through Nari Shakti Doot App or ladkibahin.maharashtra.gov.in portal.",
            "Anganwadi Sevika / Ward Officer field verification.",
            "Approved monthly ₹1,500 payment credited via DBT."
        ],
        "official_source": "https://ladkibahin.maharashtra.gov.in",
        "last_updated": "2024-12-20",
        "tags": ["maharashtra", "women", "dbt", "monthly stipend", "ladki bahin"]
    },
    {
        "id": "telangana-rythu-bharosa",
        "name": "Telangana Rythu Bharosa (Farmer Investment Support)",
        "short_name": "Rythu Bharosa",
        "ministry": "Department of Agriculture, Telangana",
        "state": "Telangana",
        "category": "Agriculture & Farmer Welfare",
        "target_audience": ["Farmers", "Pattadar Passbook Holders", "Tenant Farmers"],
        "description": "Financial assistance of ₹15,000 per acre per year distributed in two cropping seasons (Kharif and Rabi) to support agricultural input purchases and farm labor costs.",
        "benefits": "₹15,000 per acre per year direct income support via DBT.",
        "benefit_amount": 15000,
        "eligibility": {
            "state": "Telangana",
            "occupation": ["Farmer", "Agriculture"],
            "landholding": True
        },
        "required_documents": [
            "Aadhaar Card",
            "Pattadar Passbook / Dharani Land Record",
            "Bank Passbook linked with Aadhaar",
            "Mobile Number linked with Aadhaar"
        ],
        "application_procedure": [
            "Register at local Rythu Vedika or online via dharani.telangana.gov.in.",
            "Agriculture Extension Officer (AEO) field verification.",
            "Direct DBT credit before sowing season."
        ],
        "official_source": "https://agri.telangana.gov.in",
        "last_updated": "2025-01-10",
        "tags": ["telangana", "agriculture", "farmer", "rythu bharosa", "dbt"]
    },
    {
        "id": "karnataka-gruha-lakshmi",
        "name": "Karnataka Gruha Lakshmi Scheme",
        "short_name": "Gruha Lakshmi",
        "ministry": "Women and Child Development Department, Karnataka",
        "state": "Karnataka",
        "category": "Women Empowerment & Family Support",
        "target_audience": ["Women Head of Household"],
        "description": "Monthly direct cash transfer of ₹2,000 (₹24,000 per year) to women head of households possessing Antyodaya, BPL, or APL ration cards in Karnataka.",
        "benefits": "₹2,000 monthly direct cash transfer (₹24,000 per year) via DBT.",
        "benefit_amount": 24000,
        "eligibility": {
            "state": "Karnataka",
            "gender": "Female",
            "min_age": 18
        },
        "required_documents": [
            "Aadhaar Card of Woman Head and Husband",
            "Karnataka Ration Card (BPL / APL / AAY)",
            "Aadhaar-seeded Bank Account Passbook",
            "Active Mobile Number"
        ],
        "application_procedure": [
            "Apply via Seva Sindhu portal (sevasindhu.karnataka.gov.in) or Grama One / Karnataka One centers.",
            "Automated Aadhaar-Ration card verification.",
            "Monthly ₹2,000 credited to bank account."
        ],
        "official_source": "https://sevasindhu.karnataka.gov.in",
        "last_updated": "2025-01-05",
        "tags": ["karnataka", "women", "gruha lakshmi", "dbt", "cash assistance"]
    },
    {
        "id": "karnataka-yuva-nidhi",
        "name": "Karnataka Yuva Nidhi Scheme",
        "short_name": "Yuva Nidhi",
        "ministry": "Department of Skill Development, Entrepreneurship and Livelihood, Karnataka",
        "state": "Karnataka",
        "category": "Youth & Unemployment Assistance",
        "target_audience": ["Unemployed Graduates", "Diploma Holders", "Youth"],
        "description": "Unemployment stipend of ₹3,000 per month for degree holders and ₹1,500 per month for diploma holders who graduated in recent academic years and remain unemployed for up to 2 years.",
        "benefits": "₹3,000/month (Graduates) or ₹1,500/month (Diploma) for up to 24 months.",
        "benefit_amount": 36000,
        "eligibility": {
            "state": "Karnataka",
            "min_age": 18,
            "max_age": 30,
            "education": ["Diploma", "Undergraduate", "Postgraduate"]
        },
        "required_documents": [
            "Aadhaar Card",
            "Degree / Diploma Passing Certificate and Marksheets",
            "Karnataka Domicile / Study Certificate (minimum 6 years in Karnataka)",
            "Bank Passbook linked with Aadhaar",
            "Self-declaration of Unemployment"
        ],
        "application_procedure": [
            "Apply online through Seva Sindhu Yuva Nidhi portal.",
            "University / Board certificate verification through DigiLocker / NAD.",
            "Monthly stipend credited with skill training option."
        ],
        "official_source": "https://sevasindhu.karnataka.gov.in",
        "last_updated": "2024-11-20",
        "tags": ["karnataka", "youth", "unemployment", "yuva nidhi", "stipend"]
    },
    {
        "id": "ap-jagananna-vidya-deevena",
        "name": "Andhra Pradesh Jagananna Vidya Deevena (Full Fee Reimbursement)",
        "short_name": "Vidya Deevena",
        "ministry": "Higher Education Department, Andhra Pradesh",
        "state": "Andhra Pradesh",
        "category": "Education & Higher Studies",
        "target_audience": ["College Students", "Youth"],
        "description": "100% complete fee reimbursement paid directly to the mothers of students pursuing ITI, Polytechnic, Degree, Engineering, and Pharmacy courses in Andhra Pradesh.",
        "benefits": "Complete 100% college tuition fee reimbursement paid in quarterly instalments.",
        "benefit_amount": 50000,
        "eligibility": {
            "state": "Andhra Pradesh",
            "occupation": ["Student"],
            "max_income": 250000,
            "education": ["Diploma", "Undergraduate", "Postgraduate"]
        },
        "required_documents": [
            "Aadhaar Card of Student & Mother",
            "Integrated Caste & Income Certificate (<= ₹2.5 Lakh)",
            "Rice Card / Ration Card",
            "College Admission Allotment Letter",
            "Mother's Aadhaar-linked Bank Account"
        ],
        "application_procedure": [
            "Register at Village / Ward Secretariat (Grama Sachivalayam) through Jnanabhumi portal.",
            "College principal and Welfare Education Assistant biometric verification.",
            "Fee credited directly into mother's account."
        ],
        "official_source": "https://jnanabhumi.ap.gov.in",
        "last_updated": "2024-12-15",
        "tags": ["andhra pradesh", "education", "fee reimbursement", "vidya deevena", "students"]
    },
    {
        "id": "wb-lakshmir-bhandar",
        "name": "West Bengal Lakshmir Bhandar Scheme",
        "short_name": "Lakshmir Bhandar",
        "ministry": "Department of Women & Child Development and Social Welfare, West Bengal",
        "state": "West Bengal",
        "category": "Women Empowerment & Social Assistance",
        "target_audience": ["Women", "Homemakers"],
        "description": "Monthly basic income support of ₹1,200 for SC/ST women and ₹1,000 for general category women aged 25 to 60 years in West Bengal.",
        "benefits": "₹1,000 to ₹1,200 monthly financial aid (up to ₹14,400 per year) directly credited via DBT.",
        "benefit_amount": 14400,
        "eligibility": {
            "state": "West Bengal",
            "gender": "Female",
            "min_age": 25,
            "max_age": 60
        },
        "required_documents": [
            "Aadhaar Card",
            "Swasthya Sathi Card",
            "SC/ST Certificate (if applicable for higher tier ₹1,200/month)",
            "Bank Passbook linked with Aadhaar",
            "Passport Size Photograph"
        ],
        "application_procedure": [
            "Collect and submit application form at nearest Duare Sarkar camp or BDO office.",
            "Verification of Swasthya Sathi and Aadhaar linkage.",
            "Direct DBT cash transfer every month."
        ],
        "official_source": "https://socialwelfare.wb.gov.in",
        "last_updated": "2024-11-30",
        "tags": ["west bengal", "women", "lakshmir bhandar", "dbt", "monthly assistance"]
    },
    {
        "id": "odisha-kalia",
        "name": "Odisha KALIA Scheme (Krushak Assistance for Livelihood and Income Augmentation)",
        "short_name": "KALIA Scheme",
        "ministry": "Department of Agriculture & Farmers' Empowerment, Odisha",
        "state": "Odisha",
        "category": "Agriculture & Small Farmers",
        "target_audience": ["Small Farmers", "Marginal Farmers", "Landless Agricultural Laborers"],
        "description": "Comprehensive financial support of ₹10,000 per family for cultivation assistance, alongside ₹12,500 livelihood package for landless agricultural households in Odisha.",
        "benefits": "₹10,000/year for small/marginal farmers + ₹12,500 livelihood package for landless laborers.",
        "benefit_amount": 10000,
        "eligibility": {
            "state": "Odisha",
            "occupation": ["Farmer", "Laborer", "Agriculture"]
        },
        "required_documents": [
            "Aadhaar Card",
            "Ration Card",
            "Land Record (RoR) / Agricultural Laborer proof",
            "Bank Passbook linked with Aadhaar"
        ],
        "application_procedure": [
            "Apply online via kalia.odisha.gov.in or Common Service Centers (Mo Seva Kendra).",
            "Gram Panchayat level verification by Nodal Officer.",
            "DBT disbursement directly to beneficiary accounts."
        ],
        "official_source": "https://kalia.odisha.gov.in",
        "last_updated": "2024-10-25",
        "tags": ["odisha", "agriculture", "farmers", "kalia", "livelihood"]
    },
    {
        "id": "pm-matru-vandana",
        "name": "Pradhan Mantri Matru Vandana Yojana (PMMVY)",
        "short_name": "PMMVY",
        "ministry": "Ministry of Women and Child Development",
        "state": "All India",
        "category": "Maternity Benefit & Women Health",
        "target_audience": ["Pregnant Women", "Lactating Mothers"],
        "description": "Direct maternity benefit cash incentive of ₹5,000 for the first living child (in 2 instalments) and ₹6,000 for the second child if it is a girl, compensating for wage loss during pregnancy and childbirth.",
        "benefits": "₹5,000 to ₹6,000 direct cash benefit via DBT in bank account.",
        "benefit_amount": 6000,
        "eligibility": {
            "gender": "Female",
            "min_age": 19
        },
        "required_documents": [
            "Aadhaar Card of Mother and Husband",
            "Mother and Child Protection (MCP) Card with ANC registration",
            "Child Birth Registration Certificate (for second installment)",
            "Aadhaar-seeded Bank Account Passbook"
        ],
        "application_procedure": [
            "Register at local Anganwadi Centre (AWC) or apply online at pmmvy.wcd.gov.in.",
            "Verification by Anganwadi Worker (AWW) / ANM.",
            "DBT instalments credited to Aadhaar linked bank account."
        ],
        "official_source": "https://pmmvy.wcd.gov.in",
        "last_updated": "2025-01-02",
        "tags": ["central", "women", "maternity", "pmmvy", "health", "infant"]
    },
    {
        "id": "stand-up-india",
        "name": "Stand-Up India Scheme for SC/ST and Women Entrepreneurs",
        "short_name": "Stand-Up India",
        "ministry": "Ministry of Finance (Department of Financial Services)",
        "state": "All India",
        "category": "Business, MSME & Entrepreneurship",
        "target_audience": ["SC/ST Entrepreneurs", "Women Entrepreneurs"],
        "description": "Facilitates bank loans between ₹10 Lakh and ₹1 Crore to at least one SC or ST borrower and at least one woman borrower per bank branch for setting up a greenfield enterprise in manufacturing, services, agri-allied, or trading.",
        "benefits": "Composite bank loan from ₹10 Lakh up to ₹1 Crore with credit guarantee coverage.",
        "benefit_amount": 1000000,
        "eligibility": {
            "min_age": 18,
            "caste": ["SC", "ST"],
            "gender": "Female"
        },
        "required_documents": [
            "Aadhaar Card & PAN Card",
            "Caste Certificate (for SC/ST category)",
            "Detailed Project Report (DPR) for Greenfield Project",
            "Proof of Business Premise / Lease Agreement",
            "Last 6 Months Bank Statement"
        ],
        "application_procedure": [
            "Apply directly at standupmitra.in or at any Scheduled Commercial Bank branch.",
            "Handholding support via SIDBI / NABARD Lead District Managers.",
            "Loan appraisal and sanction by bank manager."
        ],
        "official_source": "https://www.standupmitra.in",
        "last_updated": "2024-09-15",
        "tags": ["central", "business", "women", "sc st", "loan", "entrepreneurship"]
    }
]

def get_all_schemes() -> List[Dict[str, Any]]:
    return _load_all_schemes()

def get_scheme_by_id(scheme_id: str) -> Dict[str, Any]:
    for scheme in _load_all_schemes():
        if scheme["id"] == scheme_id or scheme.get("short_name", "").lower() == scheme_id.lower():
            return scheme
    return {}
