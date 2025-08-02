const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  await prisma.agentDetails.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.userOrganization.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create organizations
  const mainOrg = await prisma.organization.create({
    data: {
      name: 'Main Organization',
      shortName: 'MainOrg',
    },
  });

  const subOrg1 = await prisma.organization.create({
    data: {
      name: 'Sub Organization 1',
      shortName: 'SubOrg1',
      parentId: mainOrg.id,
    },
  });

  const subOrg2 = await prisma.organization.create({
    data: {
      name: 'Sub Organization 2',
      shortName: 'SubOrg2',
      parentId: mainOrg.id,
    },
  });

  const independentOrg = await prisma.organization.create({
    data: {
      name: 'Independent Org',
      shortName: 'IndOrg',
    },
  });

  console.log('🏢 Created organizations');

  // Create users with hashed passwords
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin',
      surname: 'User',
      email: 'admin@adminpanel.com',
      password: await bcrypt.hash('admin123', 10),
      active: true,
    },
  });

  const johnUser = await prisma.user.create({
    data: {
      name: 'John',
      surname: 'Doe',
      email: 'john.doe@example.com',
      password: await bcrypt.hash('user123', 10),
      active: true,
    },
  });

  const janeUser = await prisma.user.create({
    data: {
      name: 'Jane',
      surname: 'Smith',
      email: 'jane.smith@example.com',
      password: await bcrypt.hash('user123', 10),
      active: true,
    },
  });

  const bobUser = await prisma.user.create({
    data: {
      name: 'Bob',
      surname: 'Johnson',
      email: 'bob.johnson@example.com',
      password: await bcrypt.hash('user123', 10),
      active: true,
    },
  });

  console.log('👥 Created users');

  // Create user-organization relationships
  await prisma.userOrganization.createMany({
    data: [
      { userId: adminUser.id, organizationId: mainOrg.id },
      { userId: johnUser.id, organizationId: mainOrg.id },
      { userId: johnUser.id, organizationId: subOrg1.id },
      { userId: janeUser.id, organizationId: subOrg1.id },
      { userId: bobUser.id, organizationId: subOrg2.id },
    ],
  });

  console.log('🔗 Created user-organization relationships');

  // Create agents
  const mainSupportAgent = await prisma.agent.create({
    data: {
      organizationId: mainOrg.id,
      name: 'Main Support Agent',
      active: true,
    },
  });

  const salesAgent = await prisma.agent.create({
    data: {
      organizationId: mainOrg.id,
      name: 'Sales Agent',
      active: true,
    },
  });

  const subSupportAgent = await prisma.agent.create({
    data: {
      organizationId: subOrg1.id,
      name: 'Sub Support Agent',
      active: true,
    },
  });

  const technicalAgent = await prisma.agent.create({
    data: {
      organizationId: subOrg2.id,
      name: 'Technical Agent',
      active: true,
    },
  });

  const independentAgent = await prisma.agent.create({
    data: {
      organizationId: independentOrg.id,
      name: 'Independent Agent',
      active: true,
    },
  });

  console.log('🤖 Created agents');

  // Create agent details
  await prisma.agentDetails.createMany({
    data: [
      {
        agentId: mainSupportAgent.id,
        firstMessage: 'Hello! How can I help you today?',
        systemPrompt: 'You are a helpful support agent for the main organization.',
        interactionMode: 'agent_speak_first',
      },
      {
        agentId: salesAgent.id,
        firstMessage: 'Welcome! I can help you with sales inquiries.',
        systemPrompt: 'You are a sales agent focused on customer acquisition.',
        interactionMode: 'agent_speak_first',
      },
      {
        agentId: subSupportAgent.id,
        firstMessage: 'Hi there! I\'m here to help with sub-organization issues.',
        systemPrompt: 'You are a support agent for the sub-organization.',
        interactionMode: 'agent_speak_first',
      },
      {
        agentId: technicalAgent.id,
        firstMessage: 'Technical support here. What\'s the issue?',
        systemPrompt: 'You are a technical support agent with deep technical knowledge.',
        interactionMode: 'user_speak_first',
      },
      {
        agentId: independentAgent.id,
        firstMessage: 'Hello from the independent organization!',
        systemPrompt: 'You are an agent for an independent organization.',
        interactionMode: 'agent_speak_first',
      },
    ],
  });

  console.log('⚙️  Created agent details');

  console.log('✅ Database seeded successfully!');
  console.log('\n📊 Sample Data Summary:');
  console.log(`- ${await prisma.organization.count()} organizations`);
  console.log(`- ${await prisma.user.count()} users`);
  console.log(`- ${await prisma.agent.count()} agents`);
  console.log(`- ${await prisma.agentDetails.count()} agent configurations`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 