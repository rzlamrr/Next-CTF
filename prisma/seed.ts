import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  try {
    // Create required users
    const adminPassword = await hash('12345678', 12)
    const userPassword = await hash('12345678', 12)

    const admin = await prisma.user.upsert({
      where: { email: 'admin@localhost' },
      update: {},
      create: {
        name: 'admin',
        email: 'admin@localhost',
        password: adminPassword,
        role: 'ADMIN',
      },
    })

    const user = await prisma.user.upsert({
      where: { email: 'user@localhost' },
      update: {},
      create: {
        name: 'user',
        email: 'user@localhost',
        password: userPassword,
        role: 'USER',
      },
    })

    console.log('Seeded users: admin (ADMIN) and user (USER)')

    // Create sample team
    const team = await prisma.team.upsert({
      where: { name: 'Team Zero' },
      update: {},
      create: {
        name: 'Team Zero',
        description: 'Sample team for testing',
        captainId: admin.id,
      },
    })

    console.log('Team created successfully')

    // Create brackets
    const beginnerBracket = await prisma.bracket.upsert({
      where: { id: '1' },
      update: {},
      create: {
        name: 'Beginner',
        description: 'Challenges for beginners',
      },
    })

    const advancedBracket = await prisma.bracket.upsert({
      where: { id: '2' },
      update: {},
      create: {
        name: 'Advanced',
        description: 'Challenges for advanced players',
      },
    })

    console.log('Brackets created successfully')

    // Create tags
    const tags = await Promise.all([
      prisma.tag.upsert({
        where: { name: 'web' },
        update: {},
        create: {
          name: 'web',
          color: '#3B82F6',
        },
      }),
      prisma.tag.upsert({
        where: { name: 'crypto' },
        update: {},
        create: {
          name: 'crypto',
          color: '#10B981',
        },
      }),
      prisma.tag.upsert({
        where: { name: 'reverse' },
        update: {},
        create: {
          name: 'reverse',
          color: '#F59E0B',
        },
      }),
    ])

    console.log('Tags created successfully')

    // Create topics
    const topics = await Promise.all([
      prisma.topic.upsert({
        where: { name: 'SQL Injection' },
        update: {},
        create: {
          name: 'SQL Injection',
          category: 'Web Security',
        },
      }),
      prisma.topic.upsert({
        where: { name: 'Binary Analysis' },
        update: {},
        create: {
          name: 'Binary Analysis',
          category: 'Reverse Engineering',
        },
      }),
    ])

    console.log('Topics created successfully')

    // Create sample challenges
    const simpleChallenge = await prisma.challenge.upsert({
      where: { id: '1' },
      update: {},
      create: {
        name: 'Simple Flag',
        description:
          'Find the flag for this simple challenge. The flag is hidden in plain sight!',
        category: 'Web',
        difficulty: 'EASY',
        points: 100,
        flag: 'flag{simple_flag}',
        type: 'STANDARD',
        bracketId: beginnerBracket.id,
      },
    })

    const sqlChallenge = await prisma.challenge.upsert({
      where: { id: '2' },
      update: {},
      create: {
        name: 'SQL Injection',
        description:
          'Exploit the SQL vulnerability to find the flag. Try using UNION based SQL injection.',
        category: 'Web',
        difficulty: 'MEDIUM',
        points: 250,
        flag: 'flag{sql_injection_success}',
        type: 'STANDARD',
        connectionInfo: 'http://localhost:8080',
        requirements: 'Basic SQL knowledge',
        bracketId: advancedBracket.id,
      },
    })

    const reverseChallenge = await prisma.challenge.upsert({
      where: { id: '3' },
      update: {},
      create: {
        name: 'Reverse Engineering',
        description:
          'Reverse the binary to find the flag. Use tools like Ghidra or IDA Pro.',
        category: 'Reverse',
        difficulty: 'HARD',
        points: 500,
        flag: 'flag{reverse_engineering_master}',
        type: 'DYNAMIC',
        value: 500,
        decay: 50,
        minimum: 100,
        bracketId: advancedBracket.id,
      },
    })

    console.log('Challenges created successfully')

    // Create sample hints
    await Promise.all([
      prisma.hint.upsert({
        where: { id: '1' },
        update: {},
        create: {
          title: 'General hint',
          content: 'The flag is in the format flag{...}',
          cost: 10,
          challengeId: simpleChallenge.id,
          type: null,
          requirements: null,
        },
      }),
      prisma.hint.upsert({
        where: { id: '2' },
        update: {},
        create: {
          title: 'SQL UNION hint',
          content: 'Try using UNION based SQL injection',
          cost: 25,
          challengeId: sqlChallenge.id,
          type: null,
          requirements: null,
        },
      }),
    ])

    console.log('Hints created successfully')

    // Create sample files
    await Promise.all([
      prisma.file.upsert({
        where: { id: '1' },
        update: {},
        create: {
          location: '/uploads/challenge1.txt',
          challengeId: simpleChallenge.id,
        },
      }),
      prisma.file.upsert({
        where: { id: '2' },
        update: {},
        create: {
          location: '/uploads/challenge3.bin',
          challengeId: reverseChallenge.id,
        },
      }),
    ])

    console.log('Files created successfully')

    // Create sample fields
    const countryField = await prisma.field.upsert({
      where: { id: '1' },
      update: {},
      create: {
        name: 'Country',
        type: 'SELECT',
        required: false,
        description: 'Your country of residence',
      },
    })

    const experienceField = await prisma.field.upsert({
      where: { id: '2' },
      update: {},
      create: {
        name: 'Experience',
        type: 'TEXTAREA',
        required: false,
        description: 'Tell us about your CTF experience',
      },
    })

    console.log('Fields created successfully')

    // Create sample field entries
    await Promise.all([
      prisma.fieldEntry.upsert({
        where: {
          id_fieldId_userId: {
            id: '1',
            fieldId: countryField.id,
            userId: admin.id,
          },
        },
        update: {},
        create: {
          id: '1',
          value: 'Indonesia',
          fieldId: countryField.id,
          userId: admin.id,
        },
      }),
      prisma.fieldEntry.upsert({
        where: {
          id_fieldId_userId: {
            id: '2',
            fieldId: experienceField.id,
            userId: admin.id,
          },
        },
        update: {},
        create: {
          id: '2',
          value: '2 years of CTF experience',
          fieldId: experienceField.id,
          userId: admin.id,
        },
      }),
    ])

    console.log('Field entries created successfully')

    // Create sample comments
    await Promise.all([
      prisma.comment.upsert({
        where: { id: '1' },
        update: {},
        create: {
          content: 'Great challenge! Really enjoyed solving this one.',
          userId: admin.id,
          challengeId: simpleChallenge.id,
        },
      }),
      prisma.comment.upsert({
        where: { id: '2' },
        update: {},
        create: {
          content: 'The SQL injection part was tricky but fun.',
          userId: admin.id,
          challengeId: sqlChallenge.id,
        },
      }),
    ])

    console.log('Comments created successfully')

    // Create sample solution for a challenge
    await prisma.solution.upsert({
      where: { challengeId: sqlChallenge.id },
      update: {},
      create: {
        challengeId: sqlChallenge.id,
        content:
          'Leverage UNION-based injection to exfiltrate the secret table and retrieve the flag.',
        state: 'published',
      },
    })

    console.log('Solutions created successfully')

    // Create sample ratings for aggregate testing
    await Promise.all([
      prisma.rating.create({
        data: {
          userId: admin.id,
          challengeId: sqlChallenge.id,
          value: 4,
          review: 'Nice challenge',
        },
      }),
      prisma.rating.create({
        data: {
          userId: user.id,
          challengeId: sqlChallenge.id,
          value: 5,
          review: 'Loved it',
        },
      }),
    ])

    console.log('Ratings created successfully')

    // Create sample unlocks
    await Promise.all([
      prisma.unlock.upsert({
        where: { id: '1' },
        update: {},
        create: {
          targetId: '1',
          type: 'HINTS',
          userId: admin.id,
        },
      }),
    ])

    console.log('Unlocks created successfully')

    // Create sample pages
    await Promise.all([
      prisma.page.upsert({
        where: { id: '1' },
        update: {},
        create: {
          title: 'About',
          route: '/about',
          content:
            '# About\n\nThis is a CTF platform built with Next.js and Prisma.',
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
          content:
            '# Rules\n\n1. No DoS attacks\n2. No sharing flags\n3. Have fun!',
          draft: false,
          hidden: false,
          authRequired: false,
        },
      }),
    ])

    console.log('Pages created successfully')

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
      prisma.config.upsert({
        where: { key: 'team_mode' },
        update: {},
        create: {
          key: 'team_mode',
          value: 'true',
          type: 'BOOLEAN',
          description: 'Enable team mode',
          editable: true,
        },
      }),
    ])

    console.log('Config created successfully')

    console.log('Database seeded successfully!')
    console.log('Credentials:', {
      admin: { username: 'admin', email: admin.email, password: '12345678' },
      user: { username: 'user', email: user.email, password: '12345678' },
    })
    console.log('Sample team:', { name: team.name, captain: admin.name })
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  }
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
