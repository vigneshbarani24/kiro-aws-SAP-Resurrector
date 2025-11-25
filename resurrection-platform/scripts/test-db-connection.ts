#!/usr/bin/env ts-node

/**
 * Database Connection Test Script
 * 
 * Tests the PostgreSQL connection and verifies Prisma setup.
 * Run with: npx ts-node scripts/test-db-connection.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

async function testConnection() {
  console.log('🔍 Testing database connection...\n');

  try {
    // Test connection
    await prisma.$connect();
    console.log('✅ Successfully connected to PostgreSQL database');

    // Test query
    const userCount = await prisma.user.count();
    console.log(`✅ Database query successful. Current user count: ${userCount}`);

    // Test all models
    const models = [
      { name: 'User', query: () => prisma.user.count() },
      { name: 'ABAPObject', query: () => prisma.aBAPObject.count() },
      { name: 'Resurrection', query: () => prisma.resurrection.count() },
      { name: 'TransformationLog', query: () => prisma.transformationLog.count() },
      { name: 'QualityReport', query: () => prisma.qualityReport.count() },
      { name: 'HookExecution', query: () => prisma.hookExecution.count() },
      { name: 'SlackNotification', query: () => prisma.slackNotification.count() },
      { name: 'GitHubActivity', query: () => prisma.gitHubActivity.count() },
      { name: 'Redundancy', query: () => prisma.redundancy.count() },
      { name: 'FitToStandardRecommendation', query: () => prisma.fitToStandardRecommendation.count() },
    ];

    console.log('\n📊 Testing all database models:');
    for (const model of models) {
      const count = await model.query();
      console.log(`   ${model.name}: ${count} records`);
    }

    console.log('\n✅ All database models are accessible');
    console.log('✅ Prisma setup is complete and working!\n');

    await prisma.$disconnect();
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Database connection failed:', error.message);
    console.error('\n📋 Troubleshooting steps:');
    console.error('   1. Ensure PostgreSQL is running');
    console.error('   2. Check DATABASE_URL in .env is correct');
    console.error('   3. Verify database "resurrection_platform" exists');
    console.error('   4. Run migrations: npx prisma migrate dev');
    console.error('\n📖 See DATABASE_SETUP.md for detailed setup instructions\n');

    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();
