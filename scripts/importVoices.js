const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Provider avatar images mapping
const providerImages = {
  "11labs": {
    "presenter.png": "https://images.ctfassets.net/rrpjq663t5ju/7lhwYwWjihzRnCWv2oy6TM/a2ad46dd5643c31f8945f00159864908/presenter.png",
    "british.png": "https://images.ctfassets.net/rrpjq663t5ju/3UqxLbbK8zP5Zw8wmLxgNp/5a2348fbec27133568bfd401401cfb3e/british.png",
    "spanishvoice.png": "https://images.ctfassets.net/rrpjq663t5ju/1IUNQgsOO4LhiZoF2Rwzc2/70a1ca5060c90fd792fb4960560e9173/spanishvoice.png",
    "IndianSupport.png": "https://images.ctfassets.net/rrpjq663t5ju/78KGBZ9GjxTYc3HXO7wQEr/b486827f7879f558fbe83b749c05c1d1/IndianSupport.png",
    "KaraSales.png": "https://images.ctfassets.net/rrpjq663t5ju/1km6AwUDUOlvbP1lNBGuzx/9c4bf370509d45183784cc7c2054ca75/KaraSales.png"
  },
  "playht": {
    "british.png": "https://images.ctfassets.net/rrpjq663t5ju/3UqxLbbK8zP5Zw8wmLxgNp/5a2348fbec27133568bfd401401cfb3e/british.png"
  },
  "neets": {
    "arab.png": "https://images.ctfassets.net/rrpjq663t5ju/4hQSw6LZvNn8PisvaR7Xld/dd385cce555be5645a34bc797accd280/arab.png"
  }
};

// Map voice names to avatar images and bestFor descriptions
const voiceMapping = {
  // 11labs voices
  "Road Dawg": { 
    image: providerImages["11labs"]["presenter.png"], 
    bestFor: "Conversational, Healthcare",
    isFeatured: true 
  },
  "Will": { 
    image: providerImages["11labs"]["presenter.png"], 
    bestFor: "Conversational, Healthcare" 
  },
  "Mady": { 
    image: providerImages["11labs"]["spanishvoice.png"], 
    bestFor: "Spanish, Commercial",
    isFeatured: true 
  },
  "Jordan": { 
    image: providerImages["11labs"]["IndianSupport.png"], 
    bestFor: "Commercial, Support" 
  },
  "Piper": { 
    image: providerImages["11labs"]["KaraSales.png"], 
    bestFor: "Conversational, Fun, Friendly" 
  },
  
  // PlayHT voices
  "Aurora": { 
    image: providerImages["playht"]["british.png"], 
    bestFor: "British, Support",
    isFeatured: true 
  },
  
  // NEETS voices
  "vits-ara-1": { 
    image: providerImages["neets"]["arab.png"], 
    bestFor: "Arabic",
    isFeatured: true 
  }
};

async function importVoices() {
  try {
    console.log('Starting voice import...');
    
    // Read voice.json file
    const voiceJsonPath = path.join(__dirname, '../../assistant-admin-panel-frontend/public/voice.json');
    
    if (!fs.existsSync(voiceJsonPath)) {
      console.error('voice.json file not found at:', voiceJsonPath);
      return;
    }
    
    const voiceData = JSON.parse(fs.readFileSync(voiceJsonPath, 'utf-8'));
    console.log(`Found ${voiceData.length} voices in JSON file`);
    
    // Prepare voices for database
    const voicesForDb = voiceData.map(voice => {
      const mappingData = voiceMapping[voice.name] || {};
      
      return {
        id: voice.id,
        provider: voice.provider,
        providerId: voice.providerId,
        slug: voice.slug,
        name: voice.name,
        gender: voice.gender || 'unknown',
        accent: voice.accent || null,
        previewUrl: voice.previewUrl,
        description: voice.description || null,
        isPublic: voice.isPublic !== false, // Default to true
        isDeleted: voice.isDeleted === true, // Default to false
        isFeatured: mappingData.isFeatured === true, // Default to false
        imageUrl: mappingData.image || null,
        bestFor: mappingData.bestFor || null,
        orgId: voice.orgId || null,
        createdAt: voice.createdAt ? new Date(voice.createdAt) : new Date(),
        updatedAt: voice.updatedAt ? new Date(voice.updatedAt) : null
      };
    });
    
    console.log('Importing voices to database...');
    
    // Use createMany with skipDuplicates
    const result = await prisma.voice.createMany({
      data: voicesForDb,
      skipDuplicates: true
    });
    
    console.log(`Successfully imported ${result.count} voices`);
    
    // Log featured voices
    const featuredVoices = await prisma.voice.findMany({
      where: { isFeatured: true },
      select: { name: true, provider: true }
    });
    
    console.log('Featured voices:', featuredVoices.map(v => `${v.name} (${v.provider})`).join(', '));
    
  } catch (error) {
    console.error('Error importing voices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the import
if (require.main === module) {
  importVoices();
}

module.exports = { importVoices };
