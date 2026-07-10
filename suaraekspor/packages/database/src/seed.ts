import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

type ListingInput = {
  languageCode: string;
  languageName: string;
  title: string;
  description: string;
  keywords: string[];
};

type ProductInput = {
  sellerPhone: string;
  category: string;
  photoUrls: string[];
  recommendedPriceUsd: number;
  priceRangeMin: number;
  priceRangeMax: number;
  targetMarkets: string[];
  exportReadinessScore: number;
  status: 'active' | 'processing' | 'inactive';
  originalTranscript: string;
  detectedLanguage: string;
  listings: ListingInput[];
};

async function main() {
  console.log('Seeding database...');

  const sellers = await Promise.all([
    prisma.user.upsert({
      where: { phone: '+6281234567890' },
      update: {},
      create: {
        phone: '+6281234567890',
        name: 'Pak Slamet',
        role: 'seller',
        province: 'Jawa Tengah',
        localLanguage: 'jv',
        businessName: 'Batik Slamet Pekalongan',
        isVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { phone: '+6281234567891' },
      update: {},
      create: {
        phone: '+6281234567891',
        name: 'Bu Sari',
        role: 'seller',
        province: 'Jawa Barat',
        localLanguage: 'su',
        businessName: 'Anyaman Sari Tasikmalaya',
        isVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { phone: '+6281234567892' },
      update: {},
      create: {
        phone: '+6281234567892',
        name: 'Pak Budi',
        role: 'seller',
        province: 'Aceh',
        localLanguage: 'id',
        businessName: 'Kopi Gayo Budi',
        isVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { phone: '+6281234567893' },
      update: {},
      create: {
        phone: '+6281234567893',
        name: 'Ito Marpaung',
        role: 'seller',
        province: 'Sumatera Utara',
        localLanguage: 'btk',
        businessName: 'Ulos Marpaung Samosir',
        isVerified: true,
      },
    }),
    prisma.user.upsert({
      where: { phone: '+6281234567894' },
      update: {},
      create: {
        phone: '+6281234567894',
        name: 'Mas Joko',
        role: 'seller',
        province: 'D.I. Yogyakarta',
        localLanguage: 'jv',
        businessName: 'Gerabah Joko Kasongan',
        isVerified: true,
      },
    }),
  ]);

  const [slamet, sari, budi, ito, joko] = sellers;

  // Satu buyer contoh supaya percakapan demo bisa langsung dites tanpa perlu daftar dulu
  const buyer = await prisma.user.upsert({
    where: { phone: '+15551234567' },
    update: {},
    create: {
      phone: '+15551234567',
      name: 'Sarah Mitchell',
      role: 'buyer',
      localLanguage: 'en',
      isVerified: true,
    },
  });

  const products: ProductInput[] = [
    {
      sellerPhone: slamet.phone,
      category: 'batik & tekstil',
      photoUrls: ['https://images.unsplash.com/photo-1605388031580-4ecb273d6bb6?w=800'],
      recommendedPriceUsd: 95,
      priceRangeMin: 78,
      priceRangeMax: 115,
      targetMarkets: ['Jepang', 'Jerman', 'Amerika Serikat'],
      exportReadinessScore: 88,
      status: 'active',
      originalTranscript: 'Ini batik tulis premium, motif parang klasik Pekalongan, dibuat dengan pewarna alami dari daun indigo.',
      detectedLanguage: 'jv',
      listings: [
        { languageCode: 'id', languageName: 'Bahasa Indonesia', title: 'Batik Tulis Premium Motif Parang', description: 'Batik tulis asli Pekalongan dengan motif parang klasik, dikerjakan tangan menggunakan pewarna alami dari daun indigo. Setiap lembar membutuhkan waktu 3 minggu pengerjaan.', keywords: ['batik tulis', 'motif parang', 'pewarna alami', 'pekalongan'] },
        { languageCode: 'en', languageName: 'English', title: 'Premium Hand-Drawn Batik — Parang Motif', description: 'Authentic hand-drawn batik from Pekalongan featuring the classic parang pattern, colored with natural indigo dye. Each piece takes three weeks to complete by a single artisan.', keywords: ['hand-drawn batik', 'parang motif', 'natural dye', 'pekalongan'] },
        { languageCode: 'zh', languageName: '中文', title: '高级手绘蜡染布 — 帕朗图案', description: '来自北加浪岸的正宗手绘蜡染布，采用经典的帕朗图案，使用天然靛蓝染料上色。每件作品由一位工匠耗时三周完成。', keywords: ['手绘蜡染', '帕朗图案', '天然染料', '北加浪岸'] },
      ],
    },
    {
      sellerPhone: slamet.phone,
      category: 'batik & tekstil',
      photoUrls: ['https://images.unsplash.com/photo-1544816155-12df9643f363?w=800'],
      recommendedPriceUsd: 42,
      priceRangeMin: 32,
      priceRangeMax: 55,
      targetMarkets: ['Australia', 'Singapura'],
      exportReadinessScore: 65,
      status: 'active',
      originalTranscript: 'Batik cap motif mega mendung, lebih terjangkau, cocok untuk pemula yang mau coba batik asli.',
      detectedLanguage: 'jv',
      listings: [
        { languageCode: 'id', languageName: 'Bahasa Indonesia', title: 'Batik Cap Motif Mega Mendung', description: 'Batik cap dengan motif mega mendung khas pesisir utara Jawa, harga terjangkau tanpa mengurangi kualitas kain katun primisima.', keywords: ['batik cap', 'mega mendung', 'katun primisima'] },
        { languageCode: 'en', languageName: 'English', title: 'Stamped Batik — Mega Mendung Cloud Motif', description: 'Affordable stamped batik featuring the iconic mega mendung cloud motif from Java\'s north coast, made from quality primisima cotton.', keywords: ['stamped batik', 'cloud motif', 'primisima cotton'] },
        { languageCode: 'zh', languageName: '中文', title: '印花蜡染布 — 云纹图案', description: '实惠的印花蜡染布，采用爪哇北海岸标志性的云纹图案，选用优质原色棉布制作。', keywords: ['印花蜡染', '云纹图案', '棉布'] },
      ],
    },
    {
      sellerPhone: sari.phone,
      category: 'kerajinan tangan',
      photoUrls: ['https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800'],
      recommendedPriceUsd: 42,
      priceRangeMin: 35,
      priceRangeMax: 50,
      targetMarkets: ['Amerika Serikat', 'Prancis'],
      exportReadinessScore: 92,
      status: 'active',
      originalTranscript: 'Tas rotan anyaman tangan, model tote bag, kuat dan ringan, biasa dipakai ke pantai atau pasar.',
      detectedLanguage: 'su',
      listings: [
        { languageCode: 'id', languageName: 'Bahasa Indonesia', title: 'Tas Rotan Anyaman Tangan', description: 'Tas tote rotan anyaman tangan dari pengrajin Tasikmalaya, ringan namun kokoh, cocok dipakai sehari-hari maupun ke pantai.', keywords: ['tas rotan', 'anyaman tangan', 'tote bag'] },
        { languageCode: 'en', languageName: 'English', title: 'Handwoven Rattan Tote Bag', description: 'A lightweight yet sturdy handwoven rattan tote bag crafted by artisans in Tasikmalaya — perfect for everyday use or a day at the beach.', keywords: ['handwoven rattan', 'tote bag', 'artisan craft'] },
        { languageCode: 'zh', languageName: '中文', title: '手工编织藤编手提包', description: '来自打西马拉雅工匠手工编织的藤编手提包，轻便耐用，适合日常使用或海滩出行。', keywords: ['藤编手提包', '手工编织', '手工艺品'] },
      ],
    },
    {
      sellerPhone: sari.phone,
      category: 'furnitur & dekor',
      photoUrls: ['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800'],
      recommendedPriceUsd: 58,
      priceRangeMin: 45,
      priceRangeMax: 70,
      targetMarkets: ['Jerman'],
      exportReadinessScore: 40,
      status: 'processing',
      originalTranscript: 'Lampu hias dari bambu, bentuk bulat, cahaya lembut, cocok buat kamar tidur atau ruang tamu.',
      detectedLanguage: 'su',
      listings: [
        { languageCode: 'id', languageName: 'Bahasa Indonesia', title: 'Lampu Hias Bambu Bentuk Bulat', description: 'Lampu hias dari anyaman bambu alami, menghasilkan cahaya lembut dengan motif bayangan unik, cocok untuk kamar tidur maupun ruang tamu.', keywords: ['lampu bambu', 'lampu hias', 'dekorasi rumah'] },
        { languageCode: 'en', languageName: 'English', title: 'Round Bamboo Zen Lampshade', description: 'A natural woven bamboo lampshade that casts soft, patterned shadows — a calming addition to any bedroom or living room.', keywords: ['bamboo lamp', 'zen decor', 'home lighting'] },
        { languageCode: 'zh', languageName: '中文', title: '圆形竹编装饰灯罩', description: '天然竹编灯罩，投射出柔和独特的光影效果，适合卧室或客厅使用。', keywords: ['竹灯', '装饰灯罩', '家居装饰'] },
      ],
    },
    {
      sellerPhone: budi.phone,
      category: 'kopi & rempah',
      photoUrls: ['https://images.unsplash.com/photo-1559525839-b184a4d698c7?w=800'],
      recommendedPriceUsd: 28,
      priceRangeMin: 22,
      priceRangeMax: 34,
      targetMarkets: ['Jepang', 'Amerika Serikat', 'Korea Selatan'],
      exportReadinessScore: 95,
      status: 'active',
      originalTranscript: 'Kopi arabika gayo single origin, dipetik dari ketinggian 1400 meter, rasa fruity dengan after taste karamel.',
      detectedLanguage: 'id',
      listings: [
        { languageCode: 'id', languageName: 'Bahasa Indonesia', title: 'Kopi Arabika Gayo Single Origin', description: 'Biji kopi arabika Gayo dari ketinggian 1400 mdpl, diproses secara semi-wash, memiliki rasa fruity dengan sentuhan karamel di akhir tegukan.', keywords: ['kopi gayo', 'arabika single origin', 'aceh'] },
        { languageCode: 'en', languageName: 'English', title: 'Single Origin Gayo Arabica Coffee', description: 'Grown at 1,400 meters above sea level and semi-washed, this Gayo arabica delivers bright fruity notes with a smooth caramel finish.', keywords: ['gayo coffee', 'single origin arabica', 'aceh'] },
        { languageCode: 'zh', languageName: '中文', title: '亚齐加约单一产地阿拉比卡咖啡', description: '种植于海拔1400米高地，半水洗处理，带有明亮的果香和顺滑的焦糖余韵。', keywords: ['加约咖啡', '单一产地', '阿拉比卡'] },
      ],
    },
    {
      sellerPhone: budi.phone,
      category: 'kopi & rempah',
      photoUrls: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800'],
      recommendedPriceUsd: 14,
      priceRangeMin: 10,
      priceRangeMax: 18,
      targetMarkets: ['Belanda', 'Uni Emirat Arab'],
      exportReadinessScore: 55,
      status: 'active',
      originalTranscript: 'Bubuk pala Aceh kualitas ekspor, biasa dipakai buat masakan dan kue.',
      detectedLanguage: 'id',
      listings: [
        { languageCode: 'id', languageName: 'Bahasa Indonesia', title: 'Bubuk Pala Aceh Kualitas Ekspor', description: 'Bubuk pala pilihan dari kebun rakyat Aceh, digiling halus, cocok untuk bumbu masakan maupun campuran kue tradisional.', keywords: ['pala aceh', 'rempah ekspor', 'bumbu masak'] },
        { languageCode: 'en', languageName: 'English', title: 'Export-Grade Aceh Nutmeg Powder', description: 'Finely ground nutmeg powder from smallholder farms in Aceh, ideal for both savory cooking and traditional baking.', keywords: ['aceh nutmeg', 'export spice', 'cooking spice'] },
        { languageCode: 'zh', languageName: '中文', title: '亚齐出口级肉豆蔻粉', description: '精选自亚齐小农园的肉豆蔻研磨而成，适用于烹饪调味及传统糕点制作。', keywords: ['肉豆蔻粉', '出口香料', '烹饪香料'] },
      ],
    },
    {
      sellerPhone: ito.phone,
      category: 'batik & tekstil',
      photoUrls: ['https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=800'],
      recommendedPriceUsd: 89,
      priceRangeMin: 70,
      priceRangeMax: 110,
      targetMarkets: ['Amerika Serikat', 'Tiongkok'],
      exportReadinessScore: 78,
      status: 'active',
      originalTranscript: 'Kain ulos tenun tangan dari Samosir, motif ragidup, biasa dipakai acara adat Batak.',
      detectedLanguage: 'btk',
      listings: [
        { languageCode: 'id', languageName: 'Bahasa Indonesia', title: 'Kain Ulos Tenun Tangan Motif Ragidup', description: 'Ulos tenun tangan asli Samosir dengan motif ragidup, ditenun menggunakan benang katun dan pewarna alami, biasa digunakan dalam upacara adat Batak.', keywords: ['ulos', 'tenun tangan', 'batak', 'ragidup'] },
        { languageCode: 'en', languageName: 'English', title: 'Handwoven Ulos Cloth — Ragidup Motif', description: 'A handwoven ulos textile from Samosir Island featuring the ragidup pattern, made with cotton thread and natural dyes, traditionally worn at Batak ceremonies.', keywords: ['ulos textile', 'handwoven', 'batak culture'] },
        { languageCode: 'zh', languageName: '中文', title: '手工编织乌罗斯布 — 拉吉杜普图案', description: '来自沙摩西岛的手工编织乌罗斯布，采用拉吉杜普图案，使用棉线和天然染料制作，传统上用于巴塔克族仪式。', keywords: ['乌罗斯布', '手工编织', '巴塔克文化'] },
      ],
    },
    {
      sellerPhone: joko.phone,
      category: 'kerajinan tangan',
      photoUrls: ['https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800'],
      recommendedPriceUsd: 36,
      priceRangeMin: 28,
      priceRangeMax: 45,
      targetMarkets: ['Italia', 'Jepang'],
      exportReadinessScore: 70,
      status: 'active',
      originalTranscript: 'Gerabah keramik motif etnik dari Kasongan, bisa buat vas bunga atau pajangan meja.',
      detectedLanguage: 'jv',
      listings: [
        { languageCode: 'id', languageName: 'Bahasa Indonesia', title: 'Gerabah Keramik Motif Etnik Kasongan', description: 'Vas keramik gerabah khas Kasongan dengan ukiran motif etnik, dibakar tradisional, cocok sebagai vas bunga maupun pajangan meja.', keywords: ['gerabah kasongan', 'keramik', 'vas bunga'] },
        { languageCode: 'en', languageName: 'English', title: 'Ethnic-Motif Ceramic Vase from Kasongan', description: 'A traditionally fired ceramic vase from Kasongan carved with ethnic motifs — beautiful as a flower vase or standalone table decor.', keywords: ['kasongan ceramic', 'ethnic vase', 'table decor'] },
        { languageCode: 'zh', languageName: '中文', title: '卡颂干民族图案陶瓷花瓶', description: '来自卡颂干的传统烧制陶瓷花瓶，雕刻民族图案，可作花瓶或桌面装饰品。', keywords: ['卡颂干陶瓷', '民族花瓶', '桌面装饰'] },
      ],
    },
    {
      sellerPhone: budi.phone,
      category: 'kosmetik natural',
      photoUrls: ['https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800'],
      recommendedPriceUsd: 18,
      priceRangeMin: 14,
      priceRangeMax: 24,
      targetMarkets: ['Uni Emirat Arab', 'Tiongkok', 'Amerika Serikat'],
      exportReadinessScore: 60,
      status: 'active',
      originalTranscript: 'Minyak kelapa murni organik, diproses dingin tanpa bahan kimia, biasa dipakai buat kulit dan rambut.',
      detectedLanguage: 'id',
      listings: [
        { languageCode: 'id', languageName: 'Bahasa Indonesia', title: 'Minyak Kelapa Murni Organik (VCO)', description: 'VCO diproses dengan metode cold-press tanpa bahan kimia tambahan, menjaga kandungan alami untuk perawatan kulit dan rambut.', keywords: ['vco', 'minyak kelapa murni', 'organik'] },
        { languageCode: 'en', languageName: 'English', title: 'Organic Virgin Coconut Oil (VCO)', description: 'Cold-pressed virgin coconut oil made without added chemicals, retaining its natural nutrients for skin and hair care.', keywords: ['virgin coconut oil', 'organic', 'cold pressed'] },
        { languageCode: 'zh', languageName: '中文', title: '有机初榨椰子油', description: '冷压工艺制作，不添加任何化学成分，保留天然营养成分，适合护肤护发使用。', keywords: ['初榨椰子油', '有机', '冷压'] },
      ],
    },
    {
      sellerPhone: sari.phone,
      category: 'batik & tekstil',
      photoUrls: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800'],
      recommendedPriceUsd: 0,
      priceRangeMin: 0,
      priceRangeMax: 0,
      targetMarkets: [],
      exportReadinessScore: 0,
      status: 'processing',
      originalTranscript: 'Tenun ikat motif geometris, masih diproses AI.',
      detectedLanguage: 'su',
      listings: [],
    },
  ];

  for (const p of products) {
    const seller = sellers.find((s) => s.phone === p.sellerPhone)!;
    const product = await prisma.product.create({
      data: {
        sellerId: seller.id,
        status: p.status,
        photoUrls: p.photoUrls,
        originalTranscript: p.originalTranscript,
        detectedLanguage: p.detectedLanguage,
        category: p.category,
        recommendedPriceUsd: p.recommendedPriceUsd || null,
        priceRangeMin: p.priceRangeMin || null,
        priceRangeMax: p.priceRangeMax || null,
        targetMarkets: p.targetMarkets,
        exportReadinessScore: p.listings.length ? p.exportReadinessScore : null,
        aiPipelineStage: p.listings.length ? 'done' : 'vision',
        listings: p.listings.length
          ? { create: p.listings.map((l) => ({ ...l })) }
          : undefined,
      },
    });

    if (product.status === 'active') {
      const conversationSeed = product.category === 'kopi & rempah' || product.sellerId === budi.id;
      if (conversationSeed) {
        const conversation = await prisma.conversation.create({
          data: {
            productId: product.id,
            sellerId: seller.id,
            buyerId: buyer.id,
            buyerName: buyer.name,
            buyerLang: 'en',
          },
        });
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderRole: 'buyer',
            originalText: 'Hi, is this coffee available for a 50kg wholesale order? What is the lead time?',
            originalLang: 'en',
            aiGenerated: false,
          },
        });
        await prisma.message.create({
          data: {
            conversationId: conversation.id,
            senderRole: 'seller',
            originalText: 'Hello! Yes, 50kg wholesale orders are available. Lead time is about 2 weeks including roasting and export documentation.',
            originalLang: 'en',
            aiGenerated: true,
            summaryForSeller: 'Buyer dari luar negeri menanyakan apakah bisa pesan kopi 50kg untuk grosir, dan berapa lama waktu pengiriman.',
          },
        });
      }
    }
  }

  console.log(`Seeded ${sellers.length} sellers and ${products.length} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
