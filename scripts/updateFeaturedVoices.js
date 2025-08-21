const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateFeaturedVoices() {
  try {
    console.log('🌟 Updating featured voices...');
    
    // First, remove all featured flags
    await prisma.voice.updateMany({
      where: { isFeatured: true },
      data: { isFeatured: false }
    });
    
    // Define featured voices with their details
    const featuredVoices = [
      {
        name: "Jessica",
        imageUrl: "https://images.ctfassets.net/rrpjq663t5ju/7lhwYwWjihzRnCWv2oy6TM/a2ad46dd5643c31f8945f00159864908/presenter.png",
        bestFor: "Commercial, Trendy"
      },
      {
        name: "Will", 
        imageUrl: "https://images.ctfassets.net/rrpjq663t5ju/7lhwYwWjihzRnCWv2oy6TM/a2ad46dd5643c31f8945f00159864908/presenter.png",
        bestFor: "Conversational, Healthcare"
      },
      {
        name: "Aria",
        imageUrl: "https://images.ctfassets.net/rrpjq663t5ju/3UqxLbbK8zP5Zw8wmLxgNp/5a2348fbec27133568bfd401401cfb3e/british.png",
        bestFor: "American, Professional"
      },
      {
        name: "Laura",
        imageUrl: "https://images.ctfassets.net/rrpjq663t5ju/1IUNQgsOO4LhiZoF2Rwzc2/70a1ca5060c90fd792fb4960560e9173/spanishvoice.png",
        bestFor: "Enthusiastic, Quirky"
      }
    ];
    
    let updatedCount = 0;
    
    for (const featured of featuredVoices) {
      const result = await prisma.voice.updateMany({
        where: { 
          name: featured.name,
          isDeleted: false 
        },
        data: { 
          isFeatured: true,
          imageUrl: featured.imageUrl,
          bestFor: featured.bestFor
        }
      });
      
      if (result.count > 0) {
        console.log(`✅ Updated ${result.count} voice(s) named "${featured.name}" as featured`);
        updatedCount += result.count;
      } else {
        console.log(`⚠️  No voice found with name "${featured.name}"`);
      }
    }
    
    // Get final count
    const featuredCount = await prisma.voice.count({ where: { isFeatured: true } });
    console.log(`\n🎉 Total featured voices: ${featuredCount}`);
    
    // Show the featured voices
    const featuredVoicesList = await prisma.voice.findMany({
      where: { isFeatured: true },
      select: { 
        name: true, 
        provider: true, 
        accent: true, 
        imageUrl: true,
        bestFor: true 
      }
    });
    
    console.log('\n⭐ Featured voices:');
    featuredVoicesList.forEach(voice => {
      console.log(`   - ${voice.name} (${voice.provider}) ${voice.accent ? `[${voice.accent}]` : ''}`);
      console.log(`     Best for: ${voice.bestFor}`);
      console.log(`     Image: ${voice.imageUrl ? 'Yes' : 'No'}`);
    });
    
  } catch (error) {
    console.error('❌ Error updating featured voices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the update
if (require.main === module) {
  updateFeaturedVoices();
}

module.exports = { updateFeaturedVoices };
