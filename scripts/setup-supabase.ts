#!/usr/bin/env tsx

/**
 * Supabase Setup Script for Next-CTFd
 *
 * This TypeScript script automates the setup process for Supabase integration.
 * It replaces the bash script functionality with improved maintainability.
 *
 * Run with: tsx scripts/setup-supabase.ts
 * Options:
 *   --help, -h     Show this help message
 *   --dry-run      Run through the setup without making changes
 */

import { execSync, spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { createInterface } from 'readline';
import { join } from 'path';

// Parse command line arguments
const args = process.argv.slice(2);
const showHelp = args.includes('--help') || args.includes('-h');
const dryRun = args.includes('--dry-run');

// Show help and exit
if (showHelp) {
  console.log(`
Supabase Setup Script for Next-CTFd

This script automates the setup process for Supabase integration.

Usage:
  tsx scripts/setup-supabase.ts [options]

Options:
  --help, -h     Show this help message
  --dry-run      Run through the setup without making changes

Examples:
  tsx scripts/setup-supabase.ts          # Run the full setup
  tsx scripts/setup-supabase.ts --dry-run  # Preview what would be done
`);
  process.exit(0);
}

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Helper functions for colored output
const printSuccess = (message: string) => {
  console.log(`${colors.green}✓${colors.reset} ${message}`);
};

const printError = (message: string) => {
  console.log(`${colors.red}✗${colors.reset} ${message}`);
};

const printWarning = (message: string) => {
  console.log(`${colors.yellow}⚠${colors.reset} ${message}`);
};

const printInfo = (message: string) => {
  console.log(`${colors.blue}ℹ${colors.reset} ${message}`);
};

const printHeader = (title: string) => {
  console.log('');
  console.log(`${colors.blue}========================================${colors.reset}`);
  console.log(`${colors.blue}${title}${colors.reset}`);
  console.log(`${colors.blue}========================================${colors.reset}`);
  console.log('');
};

// Utility functions
const commandExists = (command: string): boolean => {
  try {
    execSync(`which ${command}`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};

const runCommand = (command: string, options: { silent?: boolean } = {}): { success: boolean; output?: string; error?: string } => {
  if (dryRun) {
    printInfo(`[DRY-RUN] Would execute: ${command}`);
    return { success: true };
  }
  
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit'
    });
    return { success: true, output: options.silent ? output : undefined };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

const promptUser = async (question: string): Promise<boolean> => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(`${question} [y/N] `, (answer) => {
      rl.close();
      resolve(answer.match(/^[Yy]$/) ? true : false);
    });
  });
};

const promptInput = async (question: string): Promise<string> => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
};

// Main setup function
async function main() {
  printHeader(`Next-CTFd Supabase Setup${dryRun ? ' (DRY RUN)' : ''}`);

  try {
    // Step 1: Check prerequisites
    printInfo("Step 1/9: Checking prerequisites...");
    await checkPrerequisites();

    // Step 2: Check environment file
    printInfo("Step 2/9: Checking environment configuration...");
    await checkEnvFile();

    // Step 3: Install Supabase CLI
    printInfo("Step 3/9: Checking Supabase CLI...");
    await checkSupabaseCli();

    // Step 4: Login to Supabase
    printInfo("Step 4/9: Authenticating with Supabase...");
    await supabaseLogin();

    // Step 5: Link project
    printInfo("Step 5/9: Linking Supabase project...");
    await linkProject();

    // Step 6: Run migrations
    printInfo("Step 6/9: Running database migrations...");
    await runMigrations();

    // Step 7: Seed database
    printInfo("Step 7/9: Seeding database with sample data...");
    await seedDatabase();

    // Step 8: Create storage bucket
    printInfo("Step 8/9: Setting up storage bucket...");
    await setupStorage();

    // Step 9: Generate TypeScript types
    printInfo("Step 9/9: Generating TypeScript types...");
    await generateTypes();

    printHeader("Setup Complete! 🎉");
    printSuccess("Your Supabase integration is ready to use.");
    console.log("");
    printInfo("Next steps:");
    console.log("  1. Run 'yarn dev' to start the development server");
    console.log("  2. Login with the default admin credentials (see below)");
    console.log("  3. Explore the sample challenges and users");
    console.log("");
    printSuccess("🔐 Default Admin Credentials:");
    console.log("   Email: admin@next.ctf");
    console.log("   Password: admin123");
    console.log("");
    printInfo("Sample users (password: password123):");
    console.log("   - user1@next.ctf");
    console.log("   - user2@next.ctf");
    console.log("");
    printWarning("⚠️  Remember to change the admin password in production!");
    console.log("");
    printInfo("For more information, see SUPABASE_SETUP.md");

  } catch (error) {
    printError(`Setup failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

// Check prerequisites
async function checkPrerequisites(): Promise<void> {
  const missingDeps: string[] = [];

  if (!commandExists('node')) {
    missingDeps.push('Node.js');
  } else {
    try {
      const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
      printSuccess(`Node.js ${nodeVersion} installed`);
    } catch {
      missingDeps.push('Node.js');
    }
  }

  if (!commandExists('npm')) {
    missingDeps.push('npm');
  } else {
    try {
      const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();
      printSuccess(`npm ${npmVersion} installed`);
    } catch {
      missingDeps.push('npm');
    }
  }

  if (!commandExists('git')) {
    missingDeps.push('git');
  } else {
    printSuccess('git installed');
  }

  if (missingDeps.length > 0) {
    printError(`Missing required dependencies: ${missingDeps.join(', ')}`);
    printInfo('Please install the missing dependencies and try again.');
    process.exit(1);
  }
}

// Check environment file
async function checkEnvFile(): Promise<void> {
  if (!existsSync('.env')) {
    printWarning('.env file not found');
    
    if (existsSync('.env.example')) {
      const shouldCreate = await promptUser('Would you like to create .env from .env.example?');
      if (shouldCreate) {
        try {
          const envExample = readFileSync('.env.example', 'utf8');
          writeFileSync('.env', envExample);
          printSuccess('Created .env file');
          printWarning('Please update the .env file with your Supabase credentials:');
          printInfo('  - SUPABASE_URL');
          printInfo('  - SUPABASE_SERVICE_ROLE_KEY');
          printInfo('  - NEXT_PUBLIC_SUPABASE_URL');
          printInfo('  - NEXT_PUBLIC_SUPABASE_ANON_KEY');
          console.log('');
          printInfo('Get these from: https://app.supabase.com/project/_/settings/api');
          console.log('');
          
          // Wait for user to update the file
          await promptInput('Please update the .env file with your Supabase credentials and press Enter to continue...');
          
          const hasUpdated = await promptUser('Have you updated the .env file with your credentials?');
          if (hasUpdated) {
            printSuccess('Environment file ready');
          } else {
            printError('Please update .env file and run this script again');
            process.exit(1);
          }
        } catch (error) {
          printError('Failed to create .env file');
          process.exit(1);
        }
      } else {
        printError('Cannot proceed without .env file');
        process.exit(1);
      }
    } else {
      printError('.env.example file not found');
      process.exit(1);
    }
  } else {
    printSuccess('.env file exists');

    // Check for required variables
    const requiredVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];
    const missingVars: string[] = [];
    
    try {
      const envContent = readFileSync('.env', 'utf8');
      
      for (const varName of requiredVars) {
        const regex = new RegExp(`^${varName}=`, 'm');
        if (!regex.test(envContent) || envContent.match(regex)?.[0].includes('your-')) {
          missingVars.push(varName);
        }
      }
    } catch (error) {
      printError('Failed to read .env file');
      process.exit(1);
    }

    if (missingVars.length > 0) {
      printWarning('Missing or incomplete environment variables:');
      for (const varName of missingVars) {
        printWarning(`  - ${varName}`);
      }
      console.log('');
      printInfo('Please update your .env file with valid Supabase credentials');
      printInfo('Get them from: https://app.supabase.com/project/_/settings/api');
      console.log('');
      
      const hasUpdated = await promptUser('Have you updated the .env file?');
      if (!hasUpdated) {
        printError('Please update .env file and run this script again');
        process.exit(1);
      }
    }
  }
}

// Check and install Supabase CLI
async function checkSupabaseCli(): Promise<void> {
  if (commandExists('supabase')) {
    try {
      const version = execSync('supabase --version', { encoding: 'utf8' }).trim();
      printSuccess(`Supabase CLI ${version} installed`);
    } catch {
      printWarning('Supabase CLI not found');
      await installSupabaseCli();
    }
  } else {
    printWarning('Supabase CLI not found');
    const shouldInstall = await promptUser('Would you like to install Supabase CLI?');
    if (shouldInstall) {
      await installSupabaseCli();
    } else {
      printError('Supabase CLI is required. Install it manually:');
      printInfo('  npm install -g supabase');
      printInfo('  or visit: https://supabase.com/docs/guides/cli');
      process.exit(1);
    }
  }
}

// Install Supabase CLI
async function installSupabaseCli(): Promise<void> {
  printInfo('Installing Supabase CLI globally...');
  const result = runCommand('npm install -g supabase');
  
  if (result.success) {
    printSuccess('Supabase CLI installed successfully');
  } else {
    printError('Failed to install Supabase CLI');
    printInfo('Try installing manually:');
    printInfo('  npm install -g supabase');
    printInfo('  or visit: https://supabase.com/docs/guides/cli');
    process.exit(1);
  }
}

// Login to Supabase
async function supabaseLogin(): Promise<void> {
  // Check if already logged in
  const checkResult = runCommand('supabase projects list', { silent: true });
  
  if (checkResult.success) {
    printSuccess('Already authenticated with Supabase');
  } else {
    printInfo('Please login to Supabase');
    printInfo('This will open a browser window for authentication');
    console.log('');
    
    const ready = await promptUser('Ready to login?');
    if (ready) {
      const loginResult = runCommand('supabase login');
      
      if (loginResult.success) {
        printSuccess('Successfully authenticated with Supabase');
      } else {
        printError('Failed to authenticate with Supabase');
        printInfo("Try running 'supabase login' manually");
        process.exit(1);
      }
    } else {
      printError('Authentication required to continue');
      process.exit(1);
    }
  }
}

// Link Supabase project
async function linkProject(): Promise<void> {
  // Check if already linked
  let isLinked = existsSync('supabase/config.toml') || existsSync('.supabase/config.toml');
  if (isLinked) {
    printSuccess('Project already linked to Supabase');
    return;
  }
  // Fallback: detect link via Supabase CLI (handles cases where config.toml isn't present locally)
  const cliLinkedCheck = runCommand('supabase gen types typescript --linked', { silent: true });
  if (cliLinkedCheck.success) {
    printSuccess('Project already linked to Supabase (detected via CLI)');
    return;
  }

  printInfo('Available Supabase projects:');
  runCommand('supabase projects list');
  console.log('');

  const projectRef = await promptInput('Enter your project reference ID (e.g., abcdefghijklmnop): ');

  if (!projectRef) {
    printError('Project reference ID is required');
    process.exit(1);
  }

  printInfo('Linking project...');
  const linkResult = runCommand(`supabase link --project-ref ${projectRef}`);
  
  if (linkResult.success) {
    printSuccess('Successfully linked to Supabase project');
  } else {
    printError('Failed to link project');
    printInfo(`Try running 'supabase link --project-ref YOUR_PROJECT_REF' manually`);
    process.exit(1);
  }
}

// Run database migrations
async function runMigrations(): Promise<void> {
  if (!existsSync('supabase/migrations')) {
    printError('Migration directory not found: supabase/migrations');
    process.exit(1);
  }

  try {
    const migrationFiles = execSync('ls -1 supabase/migrations/*.sql 2>/dev/null | wc -l', {
      encoding: 'utf8',
      shell: '/bin/bash'
    }).trim();
    
    const migrationCount = parseInt(migrationFiles, 10);

    if (migrationCount === 0) {
      printWarning('No migration files found in supabase/migrations/');
      return;
    }

    printInfo(`Found ${migrationCount} migration file(s)`);

    const shouldMigrate = await promptUser('Apply migrations to your Supabase database?');
    if (shouldMigrate) {
      printInfo('Pushing database changes to the linked Supabase project...');
      // Prefer pushing to the linked remote; fall back to default push for older CLI versions
      const migrateResult = runCommand('supabase db push --linked');
      
      if (migrateResult.success) {
        printSuccess('Migrations applied successfully');
      } else {
        printError('Failed to apply migrations');
        printWarning('You can also apply migrations manually via Supabase Dashboard:');
        printInfo('  1. Go to SQL Editor in Supabase Dashboard');
        printInfo('  2. Copy contents of supabase/migrations/20250101000000_initial_schema.sql');
        printInfo('  3. Execute the SQL');
        
        const shouldContinue = await promptUser('Continue with setup?');
        if (!shouldContinue) {
          process.exit(1);
        }
      }
    } else {
      printWarning('Skipping migrations');
      printInfo('Remember to apply migrations manually later');
    }
  } catch (error) {
    printError('Failed to check migration files');
    process.exit(1);
  }
}

// Seed database with sample data
async function seedDatabase(): Promise<void> {
  if (!existsSync('scripts/seed.ts')) {
    printWarning('Seed script not found: scripts/seed.ts');
    printInfo('Skipping database seeding');
    return;
  }

  // Ensure remote schema is up to date before seeding
  printInfo('Ensuring remote schema is up to date...');
  const pushResult = runCommand('supabase db push --linked');
  if (pushResult.success) {
    printSuccess('Remote schema confirmed (migrations applied)');
  } else {
    printWarning('Could not confirm remote schema via CLI; proceeding with seeding anyway');
    printInfo('If seeding fails with "Could not find the table \'public.users\' in the schema cache", re-run migrations:');
    printInfo('  supabase db push --linked');
  }

  printInfo('The seed script will create:');
  console.log('   - 1 admin account (admin@next.ctf / admin123)');
  console.log('   - 2 sample users (password: password123)');
  console.log('   - 3 sample challenges across various categories');
  console.log('   - Sample pages (Rules)');
  console.log('   - Basic configuration');
  console.log('');

  const shouldSeed = await promptUser('Would you like to seed the database with sample data?');
  if (shouldSeed) {
    printInfo('Running seed script...');

    // Check if tsx is available
    if (!commandExists('tsx') && !commandExists('npx')) {
      printWarning('tsx not found. Installing dependencies first...');
      if (commandExists('yarn')) {
        runCommand('yarn install');
      } else {
        runCommand('npm install');
      }
    }

    // Run the seed script
    let seedResult: { success: boolean };
    if (commandExists('yarn')) {
      seedResult = runCommand('yarn db:seed');
    } else {
      seedResult = runCommand('npx tsx scripts/seed.ts');
    }

    if (seedResult.success) {
      printSuccess('Database seeded successfully!');
      console.log('');
      printSuccess('✅ Created admin account:');
      console.log('   Email: admin@next.ctf');
      console.log('   Password: admin123');
      console.log('');
      printInfo('Also created 2 sample users and 3 challenges');
    } else {
      printError('Failed to seed database');
      const command = commandExists('yarn') ? 'yarn db:seed' : 'npm run db:seed';
      printInfo(`You can run the seed manually later with: ${command}`);
      
      const shouldContinue = await promptUser('Continue with setup?');
      if (!shouldContinue) {
        process.exit(1);
      }
    }
  } else {
    printWarning('Skipping database seeding');
    const command = commandExists('yarn') ? 'yarn db:seed' : 'npm run db:seed';
    printInfo(`You can seed the database later with: ${command}`);
    printWarning('⚠️  You\'ll need to manually create an admin account');
  }
}

// Setup storage bucket
async function setupStorage(): Promise<void> {
  const bucketName = process.env.SUPABASE_BUCKET || 'challenge-files';

  printInfo(`Checking storage bucket: ${bucketName}`);

  // Check if bucket exists
  const checkResult = runCommand('supabase storage ls', { silent: true });
  
  if (checkResult.success && checkResult.output?.includes(bucketName)) {
    printSuccess(`Storage bucket '${bucketName}' already exists`);
  } else {
    printInfo(`Storage bucket '${bucketName}' not found`);
    const shouldCreate = await promptUser('Would you like to create the storage bucket?');
    
    if (shouldCreate) {
      printInfo('Creating bucket...');
      // Note: supabase CLI doesn't have direct bucket creation command
      // Users need to create it manually via dashboard
      printWarning('Please create the bucket manually:');
      printInfo('  1. Go to Storage in Supabase Dashboard');
      printInfo('  2. Click \'Create bucket\'');
      printInfo(`  3. Name it: ${bucketName}`);
      printInfo('  4. Set permissions as needed (public or private)');
      console.log('');
      
      await promptInput('Press Enter when you\'ve created the bucket...');
      printSuccess('Storage bucket setup complete');
    } else {
      printWarning('Skipping storage bucket creation');
      printInfo('Remember to create it manually later if you need file uploads');
    }
  }
}

// Generate TypeScript types
async function generateTypes(): Promise<void> {
  const shouldGenerate = await promptUser('Generate TypeScript types from your database schema?');
  
  if (shouldGenerate) {
    printInfo('Generating types...');

    const typesDir = 'src/lib/db';
    const typesFile = join(typesDir, 'types.ts');

    if (!existsSync(typesDir)) {
      mkdirSync(typesDir, { recursive: true });
      printInfo(`Created directory: ${typesDir}`);
    }

    const genResult = runCommand(`supabase gen types typescript --linked > ${typesFile}`);
    
    if (genResult.success) {
      printSuccess('TypeScript types generated successfully');
      printSuccess(`Types saved to: ${typesFile}`);
    } else {
      printWarning('Failed to generate types automatically');
      printInfo('You can generate types manually:');
      printInfo(`  supabase gen types typescript --linked > ${typesFile}`);
      printInfo('Or using project ID:');
      printInfo(`  supabase gen types typescript --project-id YOUR_PROJECT_REF > ${typesFile}`);
    }
  } else {
    printWarning('Skipping type generation');
    printInfo('You can generate types later with:');
    printInfo('  supabase gen types typescript --linked > src/lib/db/types.ts');
  }
}

// Run the main function
main().catch(error => {
  printError(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});