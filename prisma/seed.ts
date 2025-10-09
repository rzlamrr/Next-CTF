import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  // Create sample challenges
  const challenges = await Promise.all([
    prisma.challenge.upsert({
      where: { id: '1' },
      update: {},
      create: {
        name: 'Simple Flag',
        description: 'Find the flag for this simple challenge',
        category: 'Web',
        difficulty: 'EASY',
        points: 100,
        flag: 'flag{simple_flag}',
      },
    }),
    prisma.challenge.upsert({
      where: { id: '2' },
      update: {},
      create: {
        name: 'SQL Injection',
        description: 'Exploit the SQL vulnerability to find the flag',
        category: 'Web',
        difficulty: 'MEDIUM',
        points: 250,
        flag: 'flag{sql_injection_success}',
      },
    }),
    prisma.challenge.upsert({
      where: { id: '3' },
      update: {},
      create: {
        name: 'Reverse Engineering',
        description: 'Reverse the binary to find the flag',
        category: 'Reverse',
        difficulty: 'HARD',
        points: 500,
        flag: 'flag{reverse_engineering_master}',
      },
    }),
  ])

  // Create sample hints
  await Promise.all([
    prisma.hint.upsert({
      where: { id: '1' },
      update: {},
      create: {
        content: 'The flag is in the format flag{...}',
        cost: 10,
        challengeId: '1',
      },
    }),
    prisma.hint.upsert({
      where: { id: '2' },
      update: {},
      create: {
        content: 'Try using UNION based SQL injection',
        cost: 25,
        challengeId: '2',
      },
    }),
  ])

  // Create sample pages
  await Promise.all([
    prisma.page.upsert({
      where: { id: '1' },
      update: {},
      create: {
        title: 'About',
        route: '/about',
        content: '# About\n\nThis is a CTF platform built with Next.js and Prisma.',
        draft: false,
        hidden: false,
        authRequired: false,
      },
    }),
    prisma.page.upsert({
      where: { id: '2' },
      update: {},
      create: {
        title: 'Rules',
        route: '/rules',
        content: '# Rules\n\n1. No DoS attacks\n2. No sharing flags\n3. Have fun!',
        draft: false,
        hidden: false,
        authRequired: false,
      },
    }),
  ])

  // Create sample config
  await Promise.all([
    prisma.config.upsert({
      where: { key: 'site_name' },
      update: {},
      create: {
        key: 'site_name',
        value: 'NextCTF',
        type: 'STRING',
        description: 'Name of the CTF site',
        editable: true,
      },
    }),
    prisma.config.upsert({
      where: { key: 'ctf_start_time' },
      update: {},
      create: {
        key: 'ctf_start_time',
        value: new Date().toISOString(),
        type: 'STRING',
        description: 'Start time of the CTF',
        editable: true,
      },
    }),
    prisma.config.upsert({
      where: { key: 'ctf_end_time' },
      update: {},
      create: {
        key: 'ctf_end_time',
        value: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'STRING',
        description: 'End time of the CTF',
        editable: true,
      },
    }),
    prisma.config.upsert({
      where: { key: 'registration_enabled' },
      update: {},
      create: {
        key: 'registration_enabled',
        value: 'true',
        type: 'BOOLEAN',
        description: 'Enable user registration',
        editable: true,
      },
    }),
  ])

  console.log('Database seeded successfully!')
  console.log('Admin user:', { email: admin.email, password: 'admin123' })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })