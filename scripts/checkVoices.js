const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkVoices() {
  try {
    const total = await prisma.voice.count();
    const publicCount = await prisma.voice.count({ where: { isPublic: true } });
    const privateCount = await prisma.voice.count({ where: { isPublic: false } });
    const deletedCount = await prisma.voice.count({ where: { isDeleted: true } });
    const featuredCount = await prisma.voice.count({ where: { isFeatured: true } });
    
    console.log('📊 Voice Statistics:');
    console.log(`Total voices: ${total}`);
    console.log(`Public voices: ${publicCount}`);
    console.log(`Private voices: ${privateCount}`);
    console.log(`Deleted voices: ${deletedCount}`);
    console.log(`Featured voices: ${featuredCount}`);
    
    // Show sample of private voices
    const samplePrivate = await prisma.voice.findMany({
      where: { isPublic: false },
      select: { name: true, provider: true, isPublic: true },
      take: 5
    });
    
    console.log('\n🔒 Sample private voices:');
    samplePrivate.forEach(voice => {
      console.log(`  - ${voice.name} (${voice.provider}) - isPublic: ${voice.isPublic}`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVoices();
