const { supabase } = require('../config/supabaseClient');

const runDemoCitizen = async (req, res, next) => {
  try {
    // Only include columns that exist in the current DB schema
    const demoData = {
      name: 'Arjun Kumar',
      email: 'demo@civicassist.ai',
      age: 35,
      occupation: 'Farmer',
      income: 150000,
      state: 'Tamil Nadu',
      district: 'Thanjavur',
      education: '10th Pass',
    };

    // 1. Try upsert (update if email exists, insert if not)
    const { data: upserted, error: upsertError } = await supabase
      .from('users')
      .upsert([demoData], { onConflict: 'email' })
      .select();

    let user = upserted?.[0];

    // 2. If upsert returned nothing (or error), fetch existing user
    if (!user || upsertError) {
      const { data: existing, error: fetchErr } = await supabase
        .from('users')
        .select('*')
        .eq('email', demoData.email)
        .single();

      if (fetchErr || !existing) {
        // Last resort: plain insert
        const { data: inserted, error: insertErr } = await supabase
          .from('users')
          .insert([demoData])
          .select();
        if (insertErr) throw new Error(`DB error: ${insertErr.message}`);
        user = inserted?.[0];
      } else {
        user = existing;
      }
    }

    if (!user) throw new Error('Could not create or find demo user.');

    // 3. Fetch all schemes from DB
    const { data: allSchemes, error: schemesError } = await supabase
      .from('schemes')
      .select('*');

    if (schemesError) throw new Error(`Schemes fetch error: ${schemesError.message}`);

    const schemes = allSchemes || [];

    // 4. Eligibility matching — supports both eligibility_rules and eligibility_criteria column names
    const eligibleSchemes = schemes.filter(scheme => {
      const rules = scheme.eligibility_rules || scheme.eligibility_criteria || null;
      if (!rules) return true;
      const income_max = rules.income_max || rules.income_limit;
      if (income_max && user.income > income_max) return false;
      if (rules.min_age && user.age < rules.min_age) return false;
      if (rules.max_age && user.age > rules.max_age) return false;
      return true;
    });

    // 5. Total benefit calculation
    const totalBenefits = eligibleSchemes.reduce((acc, s) => {
      const num = parseInt(String(s.benefit || '').replace(/[^0-9]/g, ''), 10);
      return isNaN(num) ? acc : acc + num;
    }, 0);

    res.status(200).json({
      citizen_profile: user,
      eligible_schemes: eligibleSchemes,
      total_benefits: totalBenefits,
    });

  } catch (error) {
    console.error('Demo error:', error.message);
    next(error);
  }
};

module.exports = { runDemoCitizen };
