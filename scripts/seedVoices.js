const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedVoices() {
  try {
    console.log('Seeding featured voices...');
    
    const featuredVoices = [
      {
        id: "849bf79c-1d04-4791-bc0b-fea6416762dc",
        provider: "11labs",
        providerId: "bIHbv24MWmeRgasZH58o",
        slug: "will",
        name: "Will",
        gender: "male",
        accent: "",
        previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/bIHbv24MWmeRgasZH58o/8caf8f3d-ad29-4980-af41-53f20c72d7a4.mp3",
        description: "A professional voice perfect for business and conversational use.",
        isPublic: true,
        isDeleted: false,
        isFeatured: false,
        imageUrl: "https://images.ctfassets.net/rrpjq663t5ju/7lhwYwWjihzRnCWv2oy6TM/a2ad46dd5643c31f8945f00159864908/presenter.png",
        bestFor: "Conversational, Healthcare",
        orgId: null,
        createdAt: new Date("2024-07-19T18:40:36.040Z"),
        updatedAt: new Date("2024-07-19T18:40:36.040Z")
      },
      {
        id: "f794a0d7-b5b8-4afd-845e-ecfffc113b85",
        provider: "11labs",
        providerId: "rECOLXj3kZIXXxR3SBqN",
        slug: "road-dawg",
        name: "Road Dawg",
        gender: "male",
        accent: "",
        previewUrl: "https://storage.googleapis.com/eleven-public-prod/UwDtqCF44YaL77wxb8DVQlHT5Gp1/voices/muKelCm8QfG9CxzKVjMX/df47951e-da7b-4a7a-a330-c1e9eccb95b9.mp3",
        description: "A full and deep voice. Good for news and presentations.",
        isPublic: true,
        isDeleted: false,
        isFeatured: true,
        imageUrl: "https://images.ctfassets.net/rrpjq663t5ju/7lhwYwWjihzRnCWv2oy6TM/a2ad46dd5643c31f8945f00159864908/presenter.png",
        bestFor: "Conversational, Healthcare",
        orgId: null,
        createdAt: new Date("2025-01-17T23:37:08.163Z"),
        updatedAt: new Date("2025-01-17T23:37:08.163Z")
      },
      {
        id: "44e6d34b-ead5-4a6f-a144-833834fa0c09",
        provider: "playht",
        providerId: "aurora-voice-id",
        slug: "aurora",
        name: "Aurora",
        gender: "female",
        accent: "british",
        previewUrl: "https://storage.googleapis.com/eleven-public-prod/custom/voices/8N2ng9i2uiUWqstgmWlH/7TvK7CWmBACPLKdPclE6.mp3",
        description: "A warm, comforting, motherly British English woman's voice.",
        isPublic: true,
        isDeleted: false,
        isFeatured: true,
        imageUrl: "https://images.ctfassets.net/rrpjq663t5ju/3UqxLbbK8zP5Zw8wmLxgNp/5a2348fbec27133568bfd401401cfb3e/british.png",
        bestFor: "British, Support",
        orgId: null,
        createdAt: new Date("2024-07-27T18:18:57.837Z"),
        updatedAt: new Date("2024-07-27T18:18:57.837Z")
      },
      {
        id: "a3b45c78-def9-4012-9abc-567890123456",
        provider: "neets",
        providerId: "vits-ara-1-id",
        slug: "vits-ara-1",
        name: "vits-ara-1",
        gender: "male",
        accent: "arabic",
        previewUrl: "https://storage.googleapis.com/sample-voices/arabic/vits-ara-1-sample.mp3",
        description: "Arabic voice with natural pronunciation.",
        isPublic: true,
        isDeleted: false,
        isFeatured: true,
        imageUrl: "https://images.ctfassets.net/rrpjq663t5ju/4hQSw6LZvNn8PisvaR7Xld/dd385cce555be5645a34bc797accd280/arab.png",
        bestFor: "Arabic",
        orgId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "b4c56d89-efab-5123-abcd-678901234567",
        provider: "11labs",
        providerId: "mady-voice-id",
        slug: "mady",
        name: "Mady",
        gender: "female",
        accent: "spanish",
        previewUrl: "https://storage.googleapis.com/sample-voices/spanish/mady-sample.mp3",
        description: "Perfect Spanish voice for commercial and conversational use.",
        isPublic: true,
        isDeleted: false,
        isFeatured: true,
        imageUrl: "https://images.ctfassets.net/rrpjq663t5ju/1IUNQgsOO4LhiZoF2Rwzc2/70a1ca5060c90fd792fb4960560e9173/spanishvoice.png",
        bestFor: "Spanish, Commercial",
        orgId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    // Create voices
    for (const voice of featuredVoices) {
      await prisma.voice.upsert({
        where: { id: voice.id },
        update: voice,
        create: voice
      });
    }

    console.log(`✅ Successfully seeded ${featuredVoices.length} voices`);
    
    // Add more regular voices for pagination testing
    const regularVoices = [];
    for (let i = 1; i <= 200; i++) {
      const providers = ['11labs', 'playht', 'neets'];
      const genders = ['male', 'female'];
      const accents = ['', 'british', 'american', 'australian', 'spanish', 'arabic'];
      
      const provider = providers[i % providers.length];
      const gender = genders[i % genders.length];
      const accent = accents[i % accents.length];
      
      regularVoices.push({
        id: `voice-${i}-${Date.now()}`,
        provider: provider,
        providerId: `provider-id-${i}`,
        slug: `voice-${i}`,
        name: `Voice ${i}`,
        gender: gender,
        accent: accent,
        previewUrl: `https://storage.googleapis.com/sample-voices/voice-${i}.mp3`,
        description: `Sample voice ${i} description`,
        isPublic: true,
        isDeleted: false,
        isFeatured: false,
        imageUrl: null,
        bestFor: i % 2 === 0 ? "Commercial" : "Conversational",
        orgId: null,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    // Bulk insert regular voices
    await prisma.voice.createMany({
      data: regularVoices,
      skipDuplicates: true
    });

    console.log(`✅ Successfully seeded ${regularVoices.length} additional voices for testing`);
    
    const totalVoices = await prisma.voice.count();
    const featuredCount = await prisma.voice.count({ where: { isFeatured: true } });
    
    console.log(`📊 Total voices in database: ${totalVoices}`);
    console.log(`⭐ Featured voices: ${featuredCount}`);
    
  } catch (error) {
    console.error('❌ Error seeding voices:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed
if (require.main === module) {
  seedVoices();
}

module.exports = { seedVoices };
