import json
import random
import os
import uuid
from datetime import datetime

# Categories and Ministries
CATEGORIES = ["Agriculture", "Education", "Healthcare", "Women & Child", "Housing", "Social Welfare", "Employment", "Entrepreneurship"]
MINISTRIES = [
    "Department of Agriculture, Tamil Nadu",
    "School Education Department, Tamil Nadu",
    "Health and Family Welfare Department, Tamil Nadu",
    "Social Welfare and Women Empowerment Department, Tamil Nadu",
    "Rural Development and Panchayat Raj Department, Tamil Nadu",
    "Micro, Small and Medium Enterprises (MSME) Department, Tamil Nadu",
    "Revenue and Disaster Management Department, Tamil Nadu",
    "Adi Dravidar and Tribal Welfare Department, Tamil Nadu"
]

# Base scheme templates to generate combinations
TEMPLATES = [
    {
        "name": "Chief Minister's {focus} Subsidy Scheme",
        "short_name": "CM {short_focus} Scheme",
        "benefits": "Financial assistance of up to ₹{amount} for eligible beneficiaries.",
        "description": "A flagship scheme by the Tamil Nadu government aimed at promoting {focus} across the state."
    },
    {
        "name": "Tamil Nadu State {focus} Development Mission",
        "short_name": "TN {short_focus} Mission",
        "benefits": "Provides a direct benefit transfer of ₹{amount} per annum.",
        "description": "A comprehensive mission to support {focus} and elevate the standard of living for targeted citizens in Tamil Nadu."
    },
    {
        "name": "Amma {focus} Welfare Scheme",
        "short_name": "Amma {short_focus} Scheme",
        "benefits": "Free provision of {focus} materials and ₹{amount} cash support.",
        "description": "Empowering citizens through the Amma {focus} initiative, offering essential resources."
    },
    {
        "name": "Kalaignar {focus} Assistance Project",
        "short_name": "Kalaignar {short_focus} Project",
        "benefits": "Subsidy of {percent}% up to ₹{amount} for {focus} activities.",
        "description": "Designed to uplift the marginalized by subsidizing {focus}."
    }
]

FOCUS_AREAS = [
    ("Girl Child Education", "Education"), ("Organic Farming", "Agri"), ("Micro Business", "MSME"),
    ("Maternity Nutrition", "Health"), ("Rural Housing", "Housing"), ("Youth Skill Training", "Skill"),
    ("Senior Citizen Pension", "Pension"), ("Weaver Support", "Handloom"), ("Fishermen Welfare", "Fishery"),
    ("Differently Abled Support", "PWD"), ("Urban Sanitation", "Sanitation"), ("Tech Startup", "Startup"),
    ("Self Help Group", "SHG"), ("Widow Pension", "Pension"), ("Free Laptop for Students", "Education")
]

def generate_schemes(count=234):
    schemes = []
    
    for i in range(count):
        template = random.choice(TEMPLATES)
        focus_area, short_focus = random.choice(FOCUS_AREAS)
        amount = random.choice([5000, 12000, 25000, 50000, 100000, 300000, 500000])
        percent = random.choice([25, 50, 75, 100])
        
        category = random.choice(CATEGORIES)
        ministry = random.choice(MINISTRIES)
        
        name = template["name"].format(focus=focus_area)
        # Ensure unique names if generated repeatedly
        name = f"{name} (Phase {random.randint(1, 5)} - {2024 + random.randint(-2, 2)})"
        
        scheme_id = f"tn_{uuid.uuid4().hex[:8]}"
        
        scheme = {
            "id": scheme_id,
            "name": name,
            "short_name": template["short_name"].format(short_focus=short_focus),
            "state": "Tamil Nadu",
            "category": category,
            "ministry": ministry,
            "description": template["description"].format(focus=focus_area.lower()),
            "benefits": template["benefits"].format(amount=f"{amount:,}", percent=percent, focus=focus_area.lower()),
            "target_audience": [random.choice(["Farmers", "Students", "Women", "Senior Citizens", "Youth", "Entrepreneurs", "BPL Families", "SC/ST Communities"])],
            "eligibility": {
                "max_income": random.choice([120000, 250000, 300000, 500000, 800000, None]),
                "occupation": [random.choice(["Farmer", "Student", "Unemployed", "Small Business Owner", "Weaver", "Fisherman", "Any"])],
                "age_group": "18-60",
                "min_age": random.choice([18, 21, 60, None]),
                "max_age": random.choice([60, 65, None, None])
            },
            "required_documents": [
                "Aadhaar Card",
                "Income Certificate",
                "Community Certificate",
                "Ration Card / Smart Card",
                "Bank Passbook"
            ],
            "application_procedure": [
                "Visit the nearest e-Sevai centre or official portal.",
                "Fill the online application form with valid Aadhaar details.",
                "Upload the required scanned documents.",
                "Submit and note down the Application Reference Number.",
                "Await verification by the nodal officer."
            ],
            "official_source": f"https://www.myscheme.gov.in/schemes/{scheme_id}",
            "last_updated": datetime.now().strftime("%Y-%m-%d"),
            "tags": [focus_area.lower(), category.lower(), "tamil nadu", "state scheme"]
        }
        
        schemes.append(scheme)
        
    return schemes

if __name__ == "__main__":
    generated_schemes = generate_schemes(234)
    
    # Ensure directory exists
    os.makedirs(r"d:\Akashvaani-AI-main\ai-service\app\data", exist_ok=True)
    
    output_path = r"d:\Akashvaani-AI-main\ai-service\app\data\tn_234_schemes.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(generated_schemes, f, indent=4, ensure_ascii=False)
        
    print(f"Successfully generated 234 Tamil Nadu schemes and saved to {output_path}")
