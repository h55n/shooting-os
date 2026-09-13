import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envContent = fs.readFileSync('.env.local', 'utf-8');
const envVars = envContent.split('\n').reduce((acc, line) => {
  if (line.startsWith('#') || !line.includes('=')) return acc;
  const [key, ...rest] = line.split('=');
  acc[key] = rest.join('=').trim().replace(/^"|"$/g, '');
  return acc;
}, {});

const supabaseUrl = envVars['NEXT_PUBLIC_SUPABASE_URL'];
const supabaseServiceKey = envVars['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase env variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createAdmin() {
  const email = 'admin@shooter.com';
  const password = 'ShooterAdmin2024!';
  const name = 'Admin';

  console.log(`Creating user ${email}...`);

  // Create the user and auto-confirm email
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: { name: name }
  });

  if (authError) {
    console.error("Error creating user:", authError.message);
    process.exit(1);
  }

  const userId = authData.user.id;
  console.log(`User created successfully with ID: ${userId}`);

  // Set the user's role to 'operator' or 'admin' in the profiles table if necessary
  // Default is 'father', but we'll set it to 'operator' just in case.
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ role: 'operator' })
    .eq('id', userId);

  if (profileError) {
    console.warn("Could not update role to operator (might not exist yet, or table rules). Error:", profileError.message);
    // Ignore error if profile table is just using defaults or doesn't allow direct update
  } else {
    console.log("Updated profile role to 'operator'");
  }

  console.log("\\n--- Admin Credentials ---");
  console.log("Email:", email);
  console.log("Password:", password);
  console.log("-------------------------\\n");
}

createAdmin();
