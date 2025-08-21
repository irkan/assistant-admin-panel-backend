const { PrismaClient } = require('@prisma/client');
const { parseVoiceJsonFile } = require('./parseVoiceJson');

const prisma = new PrismaClient();

// Provider avatar images mapping
const voiceImageMapping = {
  // 11labs voices - based on HTML examples
  "Road Dawg": "https://images.ctfassets.net/rrpjq663t5ju/7lhwYwWjihzRnCWv2oy6TM/a2ad46dd5643c31f8945f00159864908/presenter.png",
  "Aurora": "https://images.ctfassets.net/rrpjq663t5ju/3UqxLbbK8zP5Zw8wmLxgNp/5a2348fbec27133568bfd401401cfb3e/british.png",
  "vits-ara-1": "https://images.ctfassets.net/rrpjq663t5ju/4hQSw6LZvNn8PisvaR7Xld/dd385cce555be5645a34bc797accd280/arab.png",
  "Mady": "https://images.ctfassets.net/rrpjq663t5ju/1IUNQgsOO4LhiZoF2Rwzc2/70a1ca5060c90fd792fb4960560e9173/spanishvoice.png",
  "Jordan": "https://images.ctfassets.net/rrpjq663t5ju/78KGBZ9GjxTYc3HXO7wQEr/b486827f7879f558fbe83b749c05c1d1/IndianSupport.png",
  "Piper": "https://images.ctfassets.net/rrpjq663t5ju/1km6AwUDUOlvbP1lNBGuzx/9c4bf370509d45183784cc7c2054ca75/KaraSales.png",
};

// Featured voices list
const featuredVoiceNames = [
  "Road Dawg", "Aurora", "vits-ara-1", "Mady", "Jordan", "Piper"
];

// Best for mapping
const bestForMapping = {
  "Road Dawg": "Conversational, Healthcare",
  "Aurora": "British, Support", 
  "vits-ara-1": "Arabic",
  "Mady": "Spanish, Commercial",
  "Jordan": "Commercial, Support",
  "Piper": "Conversational, Fun, Friendly",
  // Add more as needed based on accent/gender
};

function getBestForFromVoice(voice) {
  if (bestForMapping[voice.name]) {
    return bestForMapping[voice.name];
  }
  
  // Generate based on accent and gender
  const bestFor = [];
  
  if (voice.accent) {
    const accent = voice.accent.toLowerCase();
    if (accent.includes('british')) bestFor.push('British');
    if (accent.includes('american')) bestFor.push('American');
    if (accent.includes('spanish')) bestFor.push('Spanish');
    if (accent.includes('arabic')) bestFor.push('Arabic');
    if (accent.includes('french')) bestFor.push('French');
    if (accent.includes('german')) bestFor.push('German');
    if (accent.includes('italian')) bestFor.push('Italian');
  }
  
  // Add based on provider
  if (voice.provider === '11labs') {
    bestFor.push('Commercial', 'Conversational');
  } else if (voice.provider === 'playht') {
    bestFor.push('Support', 'Educational');
  } else if (voice.provider === 'neets') {
    bestFor.push('Technical', 'Scientific');
  }
  
  return bestFor.slice(0, 2).join(', ') || 'General';
}

async function importRealVoices() {
  try {
    console.log('🚀 Starting real voice import from voice.json...');
    
    // Parse the voice.json file
    const voices = parseVoiceJsonFile();
    
    if (voices.length === 0) {
      console.error('❌ No voices found in voice.json file');
      return;
    }
    
    console.log(`📊 Found ${voices.length} voices to import`);
    
    // Clear existing voices first
    console.log('🧹 Clearing existing voices...');
    await prisma.voice.deleteMany({});
    
    // Prepare voices for database
    const voicesForDb = voices.map(voice => {
      return {
        id: voice.id,
        provider: voice.provider || 'unknown',
        providerId: voice.providerId || voice.slug || voice.id,
        slug: voice.slug || voice.id,
        name: voice.name || `Voice ${voice.id.substring(0, 8)}`,
        gender: voice.gender || 'unknown',
        accent: voice.accent || null,
        previewUrl: voice.previewUrl || '',
        description: voice.description || null,
        isPublic: voice.isPublic !== false, // Default to true
        isDeleted: voice.isDeleted === true, // Default to false
        isFeatured: featuredVoiceNames.includes(voice.name), // Mark as featured if in list
        imageUrl: voiceImageMapping[voice.name] || null,
        bestFor: getBestForFromVoice(voice),
        orgId: voice.orgId || null,
        createdAt: voice.createdAt ? new Date(voice.createdAt) : new Date(),
        updatedAt: voice.updatedAt ? new Date(voice.updatedAt) : null
      };
    });
    
    console.log('💾 Importing voices to database in batches...');
    
    // Import in batches of 1000 to avoid memory issues
    const batchSize = 1000;
    let imported = 0;
    
    for (let i = 0; i < voicesForDb.length; i += batchSize) {
      const batch = voicesForDb.slice(i, i + batchSize);
      
      try {
        const result = await prisma.voice.createMany({
          data: batch,
          skipDuplicates: true
        });
        
        imported += result.count;
        console.log(`✅ Imported batch ${Math.floor(i / batchSize) + 1}: ${result.count} voices (Total: ${imported})`);
      } catch (batchError) {
        console.error(`❌ Error importing batch ${Math.floor(i / batchSize) + 1}:`, batchError.message);
      }
    }
    
    // Get final statistics
    const totalVoices = await prisma.voice.count();
    const featuredCount = await prisma.voice.count({ where: { isFeatured: true } });
    const providerStats = await prisma.voice.groupBy({
      by: ['provider'],
      _count: { provider: true }
    });
    
    console.log('\n🎉 Import completed successfully!');
    console.log(`📊 Total voices in database: ${totalVoices}`);
    console.log(`⭐ Featured voices: ${featuredCount}`);
    console.log('🏢 Provider breakdown:');
    providerStats.forEach(stat => {
      console.log(`   - ${stat.provider}: ${stat._count.provider} voices`);
    });
    
    // Show some featured voices
    const featuredVoices = await prisma.voice.findMany({
      where: { isFeatured: true },
      select: { name: true, provider: true, accent: true }
    });
    
    console.log('\n⭐ Featured voices:');
    featuredVoices.forEach(voice => {
      console.log(`   - ${voice.name} (${voice.provider}) ${voice.accent ? `[${voice.accent}]` : ''}`);
    });
    
  } catch (error) {
    console.error('❌ Error importing voices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
if (require.main === module) {
  importRealVoices();
}

module.exports = { importRealVoices };
