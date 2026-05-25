'use client';
// PATH: suaraekspor/apps/web/app/marketplace/[id]/page.tsx
// Halaman detail produk untuk BUYER — include Contact Seller + send message
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Send, Globe, ChevronLeft, Star, Package, MessageCircle, CheckCircle2, ShieldCheck, Bookmark } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const LANGUAGES = ['EN', 'ZH', 'AR', 'JA', 'DE', 'ID'];

interface ProductTranslation {
  title: string;
  seller: string;
  province: string;
  price: number;
  priceRange: string;
  desc: string;
  keywords: string[];
  markets: string[];
  score: number;
  emoji: string;
  category: string;
  specs: {
    material: string;
    dimension: string;
    weight: string;
    moq: string;
    productionTime: string;
    certification: string;
  }
}

const PRODUCTS_DETAILS: Record<string, {
  image: string;
  gallery: string[];
  translations: Record<string, ProductTranslation>;
}> = {
  '1': {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBiB8MGKxrm_v_wknhfwq_eNKONy8ObGnve3tcSrbGYKdvNNAulNSDYtHA6UMulOSqr_iYwlNZjL0PojIiUEbPaq1xls_KhtWUyyRLVuShmMMQ3Nwq77Ooy8I74KebuUps5i-AIn8gWg9InHqfdcq7PDaHabUg--HnOilCjUL8ukv6btNX8GSgO2nzdTzq6aGBYPggB0Yd9NWHtvsHReE03tUk7ScAAHjgcP5Amg_B9OP25gEXgJaUjlC320KH7I9ILNIDwjFgmNmsb',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBiB8MGKxrm_v_wknhfwq_eNKONy8ObGnve3tcSrbGYKdvNNAulNSDYtHA6UMulOSqr_iYwlNZjL0PojIiUEbPaq1xls_KhtWUyyRLVuShmMMQ3Nwq77Ooy8I74KebuUps5i-AIn8gWg9InHqfdcq7PDaHabUg--HnOilCjUL8ukv6btNX8GSgO2nzdTzq6aGBYPggB0Yd9NWHtvsHReE03tUk7ScAAHjgcP5Amg_B9OP25gEXgJaUjlC320KH7I9ILNIDwjFgmNmsb',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBNih5WvW4ioy6haKVvzlqaPkDBBfmmROeA0a1mx7Elf3ZL3srzL17ZL273q_l1d5ndEFqTob5bMB3CLUfRhzWLSLWZsLOOUBfgG6nRGddE_Z67ReTLLWGdcKVCAC6G8ijd7DSgTC0Z17WuWousRlbzuNqyCA2paG73h524myEUiBGLHxEhazWXejAfShBVe4_s8Stg9hrvq3AHZuc-BfYJIyM34JV6cQ0PUk3X1WuDAGvMRBpTzAE9ZXh1OyHtXZi4ZHJ71H1aYEFH',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA6TfhvgBRFQjGJDCp_ZCpbo6SZ_vvVqJlXWNZVZJpCUw_MB_tN1Yfa_puduoOndY-_HXdkrAMkjyIRBoDcm0LuevhvYpZmq3T1J1p6Q40TXK2jWZdhUTZ845ixlDFTgE6ePA2zBnru-h1_Tne13kxX9S3gZVI8RwNEoZ65qdSKxve74OkOkYC5v5GQIxTWjpUHStTL52bs4Nq_vwrhRo4lf8l45hFt9gouTDZ4W3iIV2wMLtINc9-UV65uloxhpuUnyA9VtQyQYIGN',
    ],
    translations: {
      en: {
        title: 'Handwoven Rattan Bag',
        seller: 'Pak Budi - Pengrajin Bali',
        province: 'Bali, Indonesia',
        price: 42, priceRange: '38–52',
        desc: 'Premium handwoven rattan bag featuring a sophisticated circular design and natural leather strap. Crafted by skilled artisans in Ubud, Bali using natural Ata grass. The intricate textures of the weave reflect a professional Digital Heritage style.',
        keywords: ['rattan bag', 'handwoven', 'bali artisan', 'natural ata grass', 'leather strap'],
        markets: ['USA', 'Japan', 'Germany', 'UAE', 'Netherlands'],
        score: 92, emoji: '👜', category: 'KERAJINAN TANGAN',
        specs: {
          material: 'Natural Rattan (Ata Grass), Genuine Leather Strap',
          dimension: '20cm x 20cm x 7cm',
          weight: '0.45 Kg',
          moq: '50 Units',
          productionTime: '14 - 21 Business Days',
          certification: 'Wood/Rattan Certificate (SVLK), Halal (Packaging)'
        }
      },
      zh: {
        title: '手工编织藤编包',
        seller: '布迪先生 - 巴厘岛工匠',
        province: '巴厘岛，印度尼西亚',
        price: 42, priceRange: '38–52',
        desc: '优质手工编织藤编包，采用精致的圆形设计 and 天然真皮肩带。由巴厘岛乌布的熟练工匠使用天然阿塔草制作。复杂的编织纹理体现了专业的数字遗产风格。',
        keywords: ['藤编包', '手工编织', '巴厘岛工匠', '天然阿塔草', '真皮肩带'],
        markets: ['China', 'Taiwan', 'Singapore'],
        score: 92, emoji: '👜', category: 'KERAJINAN TANGAN',
        specs: {
          material: '天然藤条 (阿塔草), 天然真皮肩带',
          dimension: '20厘米 x 20厘米 x 7厘米',
          weight: '0.45 公斤',
          moq: '50 件',
          productionTime: '14 - 21 工作日',
          certification: '木材/藤条证书 (SVLK), 清真 (包装)'
        }
      },
      id: {
        title: 'Tas Rotan Anyaman Tangan',
        seller: 'Pak Budi - Pengrajin Bali',
        province: 'Bali, Indonesia',
        price: 42, priceRange: '38–52',
        desc: 'Tas rotan anyaman tangan premium yang menampilkan desain bundar yang elegan dan tali kulit asli. Dibuat oleh pengrajin terampil di Ubud, Bali menggunakan rumput Ata alami. Tekstur anyaman yang rumit mencerminkan gaya warisan budaya yang sangat profesional.',
        keywords: ['tas rotan', 'anyaman tangan', 'pengrajin bali', 'rumput ata alami', 'tali kulit'],
        markets: ['USA', 'Japan', 'Germany'],
        score: 92, emoji: '👜', category: 'KERAJINAN TANGAN',
        specs: {
          material: 'Rotan alami (Ata Grass), Tali Kulit Asli',
          dimension: '20cm x 20cm x 7cm',
          weight: '0.45 Kg',
          moq: '50 Unit',
          productionTime: '14 - 21 Hari Kerja',
          certification: 'Sertifikat Kayu/Rotan (SVLK), Halal (Packaging)'
        }
      }
    }
  },
  '2': {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBprBrBBXUODnTs-brrmKPjKEIs71jWImBarFEwZAu_52Lsobc1tVIxXDbYHb0jaOgwvESRy06v-Pnh5aKTGeJsoAGM2TEJCl0bx4WdEzj2vV7AuxMJ55arUIrD__k1NCir8150urEh_d7oqOKobfcHPQJQcB44meM7Yh1iq7Lnm-GE93S8HI1oc26ojY5i7RlBzSm5oq7R5fYs7jUpFZbClDJcusHannVcPYClgZeKApJTGoxhoUiMeo5ft-uLLSPcloMefM4BWD1J',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBprBrBBXUODnTs-brrmKPjKEIs71jWImBarFEwZAu_52Lsobc1tVIxXDbYHb0jaOgwvESRy06v-Pnh5aKTGeJsoAGM2TEJCl0bx4WdEzj2vV7AuxMJ55arUIrD__k1NCir8150urEh_d7oqOKobfcHPQJQcB44meM7Yh1iq7Lnm-GE93S8HI1oc26ojY5i7RlBzSm5oq7R5fYs7jUpFZbClDJcusHannVcPYClgZeKApJTGoxhoUiMeo5ft-uLLSPcloMefM4BWD1J'
    ],
    translations: {
      en: {
        title: 'Hand-Drawn Batik Silk',
        seller: 'Ibu Ningsih - Batik Solo',
        province: 'Jawa Tengah, Indonesia',
        price: 125, priceRange: '110–140',
        desc: 'Exquisite hand-drawn batik silk scarf, boasting authentic Javanese patterns and premium natural silk thread. Meticulously crafted using traditional canting techniques in Solo, Central Java. High export demand due to its rich cultural expression.',
        keywords: ['batik silk', 'hand-drawn batik', 'solo artisan', 'javanese pattern', 'silk scarf'],
        markets: ['Germany', 'France', 'Singapore', 'Malaysia'],
        score: 88, emoji: '🧣', category: 'TEKSTIL & BATIK',
        specs: {
          material: 'Premium Natural Silk Thread',
          dimension: '200cm x 55cm',
          weight: '0.15 Kg',
          moq: '20 Units',
          productionTime: '30 - 45 Business Days',
          certification: 'Batikmark Certified, Halal'
        }
      },
      zh: {
        title: '手工手绘真丝蜡染',
        seller: '宁西女士 - 索罗蜡染',
        province: '中爪哇省，印度尼西亚',
        price: 125, priceRange: '110–140',
        desc: '精美的手绘真丝蜡染围巾，具有正宗的爪哇图案和优质天然蚕丝。在印尼中爪哇省索罗采用传统的canting技术精心制作。由于其丰富的文化表达，出口需求高。',
        keywords: ['真丝蜡染', '手绘蜡染', '索罗工匠', '爪哇图案', '真丝围巾'],
        markets: ['China', 'Taiwan', 'Hong Kong'],
        score: 88, emoji: '🧣', category: 'TEKSTIL & BATIK',
        specs: {
          material: '高档天然真丝线',
          dimension: '200厘米 x 55厘米',
          weight: '0.15 公斤',
          moq: '20 件',
          productionTime: '30 - 45 工作日',
          certification: 'Batikmark 认证, 清真'
        }
      },
      id: {
        title: 'Batik Tulis Sutera',
        seller: 'Ibu Ningsih - Batik Solo',
        province: 'Jawa Tengah, Indonesia',
        price: 125, priceRange: '110–140',
        desc: 'Syal sutera batik tulis yang sangat indah, menampilkan motif Jawa otentik dan benang sutera alam premium. Dibuat secara teliti menggunakan teknik canting tradisional di Solo, Jawa Tengah.',
        keywords: ['batik sutera', 'batik tulis', 'pengrajin solo', 'motif jawa', 'syal sutera'],
        markets: ['Jerman', 'Prancis', 'Singapura'],
        score: 88, emoji: '🧣', category: 'TEKSTIL & BATIK',
        specs: {
          material: 'Sutra premium alami',
          dimension: '200cm x 55cm',
          weight: '0.15 Kg',
          moq: '20 Unit',
          productionTime: '30 - 45 Hari Kerja',
          certification: 'Sertifikat Batikmark, Halal'
        }
      }
    }
  },
  '3': {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcM6oTXx3DAQ-M18BhYaSoMa9iQWDoqQW9NEzD5K2Txb9aLytHmGL88fukOpOpFpVydugE60AhhqRB8pqhNJ8pylPKvlmD6kE9auxDt8_EBeFk51hB1kjAStxhk5Imgd3H-PeaINzXfua7MrW0R33JlEjrg8yjBGGM5J_2Ufx9bzldrxUmsjC7_j0uLkJxG7mmaL6gZduovcnBMMzcmshEZXMfgYLKLkG51pRgrEI6KHKwelGUjkZpY4O8JSro26fyBXitaD5tS8Po',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCcM6oTXx3DAQ-M18BhYaSoMa9iQWDoqQW9NEzD5K2Txb9aLytHmGL88fukOpOpFpVydugE60AhhqRB8pqhNJ8pylPKvlmD6kE9auxDt8_EBeFk51hB1kjAStxhk5Imgd3H-PeaINzXfua7MrW0R33JlEjrg8yjBGGM5J_2Ufx9bzldrxUmsjC7_j0uLkJxG7mmaL6gZduovcnBMMzcmshEZXMfgYLKLkG51pRgrEI6KHKwelGUjkZpY4O8JSro26fyBXitaD5tS8Po'
    ],
    translations: {
      en: {
        title: 'Single Origin Arabica',
        seller: 'Pak Syarif - Gayo Highland Coffee',
        province: 'Aceh, Indonesia',
        price: 28, priceRange: '24–32',
        desc: 'Premium grade-1 Gayo Arabica coffee beans. Grown at an altitude of 1,500 meters in the volcanic soil of Gayo Highlands, Aceh. Features a complex flavor profile with smooth body, mild acidity, and sweet chocolaty hints.',
        keywords: ['arabica coffee', 'gayo coffee', 'organic beans', 'single origin', 'aceh coffee'],
        markets: ['Japan', 'USA', 'South Korea', 'Germany'],
        score: 95, emoji: '☕', category: 'KOPI & TEH',
        specs: {
          material: '100% Organic Gayo Arabica Coffee Beans',
          dimension: '250g / 500g / 1kg Packaging',
          weight: 'As ordered (min. 250g)',
          moq: '100 Kg',
          productionTime: '5 - 7 Business Days',
          certification: 'Indonesia Organic, Fair Trade, Halal'
        }
      },
      zh: {
        title: '单源阿拉比卡咖啡豆',
        seller: '沙里夫先生 - 加约高地咖啡',
        province: '亚齐，印度尼西亚',
        price: 28, priceRange: '24–32',
        desc: '优质1级加约阿拉比卡咖啡豆。种植在印尼亚齐加约高地海拔1500米的火山土壤中。具有复杂的风味，口感柔滑，酸度温和，并带有甜美的巧克力气息。',
        keywords: ['阿拉比卡咖啡', '加约咖啡', '有机咖啡豆', '单源咖啡', '亚齐咖啡'],
        markets: ['Japan', 'Taiwan', 'China'],
        score: 95, emoji: '☕', category: 'KOPI & TEH',
        specs: {
          material: '100% 有机加约阿拉比卡咖啡豆',
          dimension: '250克 / 500克 / 1公斤 包装',
          weight: '根据订单 (最小 250克)',
          moq: '100 公斤',
          productionTime: '5 - 7 工作日',
          certification: '印尼有机认证, 公平贸易, 清真'
        }
      },
      id: {
        title: 'Kopi Arabika Gayo Single Origin',
        seller: 'Pak Syarif - Kopi Gayo',
        province: 'Aceh, Indonesia',
        price: 28, priceRange: '24–32',
        desc: 'Biji kopi Gayo Arabika premium grade-1. Ditanam di ketinggian 1.500 mdpl di tanah vulkanik Dataran Tinggi Gayo, Aceh. Memiliki rasa kompleks dengan body yang halus, keasaman rendah, dan aroma cokelat manis.',
        keywords: ['kopi arabika', 'kopi gayo', 'biji organik', 'single origin', 'kopi aceh'],
        markets: ['Jepang', 'USA', 'Korea Selatan'],
        score: 95, emoji: '☕', category: 'KOPI & TEH',
        specs: {
          material: '100% Biji Kopi Gayo Arabika Organik',
          dimension: 'Kemasan 250g / 500g / 1kg',
          weight: 'Sesuai pesanan (min. 250g)',
          moq: '100 Kg',
          productionTime: '5 - 7 Hari Kerja',
          certification: 'Organik Indonesia, Fair Trade, Halal'
        }
      }
    }
  },
  '4': {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkrk74WEWxjXWfuui04KjqsBS_CGLA3dgJL4ZtOO2EbiJQyE7PRaBYsEZDggaiLcbButTKofvRO5533N8t_KF22QzNwcwWs3Ssqp5w7EgzqahK8SJW_IUzCbKqdiMQmuxUJnhBxQkgeuepuYXolxi72Q8zKVO9kG9nKvNbuYl7dfap0D2G6TbdHdcz5AJPptWJajoBHHYHI8NWJXJDsIkOWV4HYU2gHuGNdAoJYYpsyvRjbQU77cvrpAjscg-W7k5EDlPPdVbINZYn',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDkrk74WEWxjXWfuui04KjqsBS_CGLA3dgJL4ZtOO2EbiJQyE7PRaBYsEZDggaiLcbButTKofvRO5533N8t_KF22QzNwcwWs3Ssqp5w7EgzqahK8SJW_IUzCbKqdiMQmuxUJnhBxQkgeuepuYXolxi72Q8zKVO9kG9nKvNbuYl7dfap0D2G6TbdHdcz5AJPptWJajoBHHYHI8NWJXJDsIkOWV4HYU2gHuGNdAoJYYpsyvRjbQU77cvrpAjscg-W7k5EDlPPdVbINZYn'
    ],
    translations: {
      en: {
        title: 'Bamboo Zen Lampshade',
        seller: 'Pak Joko - Bambu Lestari',
        province: 'D.I. Yogyakarta, Indonesia',
        price: 55, priceRange: '48–65',
        desc: 'Elegant handcrafted bamboo lampshade designed to create a soothing, warm, and natural ambiance. Carefully woven by Javanese craftspeople in Yogyakarta using sustainable premium bamboo. Ideal for modern eco-friendly cafes and living spaces.',
        keywords: ['bamboo lampshade', 'eco friendly', 'handwoven lamp', 'yogyakarta craft', 'home decor'],
        markets: ['Netherlands', 'Germany', 'Australia', 'Japan'],
        score: 85, emoji: '🏮', category: 'FURNITUR',
        specs: {
          material: 'Premium Apus Bamboo, Brass Fitting',
          dimension: 'Diameter 35cm, Height 45cm',
          weight: '1.2 Kg',
          moq: '30 Units',
          productionTime: '10 - 15 Business Days',
          certification: 'SVLK Certified, Eco-Friendly'
        }
      },
      zh: {
        title: '竹艺禅意灯罩',
        seller: '佐科先生 - 莱斯塔里竹艺',
        province: '日惹，印度尼西亚',
        price: 55, priceRange: '48–65',
        desc: '高雅的手工制作竹灯罩，旨在创造舒缓、温暖和自然的氛围。由印尼日惹的爪哇工匠使用可持续优质竹子精心编制而成。非常适合现代环保咖啡馆和生活空间。',
        keywords: ['竹子灯罩', '环保', '手工编织灯', '日惹手工艺', '家居装饰'],
        markets: ['Germany', 'Australia', 'Japan'],
        score: 85, emoji: '🏮', category: 'FURNITUR',
        specs: {
          material: '优质阿普斯竹子, 黄铜配件',
          dimension: '直径 35厘米, 高度 45厘米',
          weight: '1.2 公斤',
          moq: '30 件',
          productionTime: '10 - 15 工作日',
          certification: 'SVLK 认证, 环保安全'
        }
      },
      id: {
        title: 'Kap Lampu Bambu Zen',
        seller: 'Pak Joko - Bambu Lestari',
        province: 'D.I. Yogyakarta, Indonesia',
        price: 55, priceRange: '48–65',
        desc: 'Kap lampu bambu buatan tangan elegan yang dirancang untuk menciptakan suasana tenang, hangat, dan alami. Dianyam secara teliti oleh pengrajin Jawa di Yogyakarta menggunakan bambu premium lestari.',
        keywords: ['kap lampu bambu', 'ramah lingkungan', 'anyaman bambu', 'kerajinan jogja', 'dekorasi rumah'],
        markets: ['Belanda', 'Jerman', 'Australia'],
        score: 85, emoji: '🏮', category: 'FURNITUR',
        specs: {
          material: 'Bambu Apus premium, Fitting Kuningan',
          dimension: 'Diameter 35cm, Tinggi 45cm',
          weight: '1.2 Kg',
          moq: '30 Unit',
          productionTime: '10 - 15 Hari Kerja',
          certification: 'Sertifikat SVLK, Ramah Lingkungan'
        }
      }
    }
  },
  '5': {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGq48dm5NPUvIc_bm1kWULANlu30X7yJsnHol4zTv1x4mXsH-LAPCVwRcTUQs-CuKivm6qE-VRDiSv8uvo5supl3JVy70zYoBTEak3KDS3JP0omZ0CA8a8Y_mbsh_qiEcRa0XYZ4NkuK1F1LI4XAn067HomkuoJ6Hdpl1hquhUBzdMU88DYg7dkuav_YVz_UOH4HbB-iFhyrHBlPpEfla0KAY9aZrN_g0mciw_VehJWzgL0QTaPEFSxtw5jLE90t2XWoz__E-F97s6',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBGq48dm5NPUvIc_bm1kWULANlu30X7yJsnHol4zTv1x4mXsH-LAPCVwRcTUQs-CuKivm6qE-VRDiSv8uvo5supl3JVy70zYoBTEak3KDS3JP0omZ0CA8a8Y_mbsh_qiEcRa0XYZ4NkuK1F1LI4XAn067HomkuoJ6Hdpl1hquhUBzdMU88DYg7dkuav_YVz_UOH4HbB-iFhyrHBlPpEfla0KAY9aZrN_g0mciw_VehJWzgL0QTaPEFSxtw5jLE90t2XWoz__E-F97s6'
    ],
    translations: {
      en: {
        title: 'Tenun Ikat Sumba',
        seller: 'Mama Maria - Sumba Weaver Group',
        province: 'Nusa Tenggara Timur, Indonesia',
        price: 89, priceRange: '80–110',
        desc: 'Traditional hand-loomed Tenun Ikat fabric from East Sumba. Uses 100% natural organic dyes derived from plants and roots. Each piece takes months to weave, telling stories of ancient Sumba heritage and symbols.',
        keywords: ['tenun ikat', 'sumba fabric', 'natural dye', 'hand loomed', 'heritage textile'],
        markets: ['USA', 'France', 'Netherlands', 'Japan'],
        score: 90, emoji: '🧣', category: 'TEKSTIL & BATIK',
        specs: {
          material: 'Organic Cotton Thread, Natural Dyes',
          dimension: '240cm x 110cm',
          weight: '0.8 Kg',
          moq: '10 Units',
          productionTime: '60 - 90 Business Days',
          certification: 'Geographical Indication (GI) NTT'
        }
      },
      zh: {
        title: '松巴岛手织织物',
        seller: '玛丽亚妈妈 - 松巴编织者协会',
        province: '东努沙登加拉省，印度尼西亚',
        price: 89, priceRange: '80–110',
        desc: '来自东松巴岛的传统手工编织特农蜡染（Tenun Ikat）织物。使用源自植物和根部的100%天然有机染料。每件织物需要数月时间编织，诉说着古老松巴岛遗产和符号的故事。',
        keywords: ['手工织物', '松巴织物', '天然染料', '手织', '传统纺织品'],
        markets: ['USA', 'France', 'Japan'],
        score: 90, emoji: '🧣', category: 'TEKSTIL & BATIK',
        specs: {
          material: '有机棉线, 天然染料',
          dimension: '240厘米 x 110厘米',
          weight: '0.8 公斤',
          moq: '10 件',
          productionTime: '60 - 90 工作日',
          certification: '地理标志 (GI) 认证 NTT'
        }
      },
      id: {
        title: 'Kain Tenun Ikat Sumba',
        seller: 'Mama Maria - Kelompok Penenun Sumba',
        province: 'Nusa Tenggara Timur, Indonesia',
        price: 89, priceRange: '80–110',
        desc: 'Kain Tenun Ikat tradisional alat tenun bukan mesin (ATBM) khas Sumba Timur. Menggunakan 100% pewarna alam organik dari akar dan tanaman. Setiap lembar kain membutuhkan waktu berbulan-bulan untuk ditenun, melambangkan kisah budaya Sumba kuno.',
        keywords: ['tenun ikat', 'kain sumba', 'pewarna alami', 'tenun tangan', 'tekstil adat'],
        markets: ['USA', 'Prancis', 'Jepang'],
        score: 90, emoji: '🧣', category: 'TEKSTIL & BATIK',
        specs: {
          material: 'Benang Katun Organik, Pewarna Alami',
          dimension: '240cm x 110cm',
          weight: '0.8 Kg',
          moq: '10 Unit',
          productionTime: '60 - 90 Hari Kerja',
          certification: 'Indikasi Geografis (IG) NTT'
        }
      }
    }
  },
  '6': {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMl2Ysv8iD2TiD94wJ4ImRdUZwOpzhxb5CsZ6QGMc9thQNcq6UGoZN5BQG9P85D54qABA_bXsxN1WiJW8Xy4mCRUow9e5pc-p7HKkY_fiMZytOFfb5RGpd66-xT_1GEaTHBDfieo7iyWiBzWaa7GWTC2Cumf4am4gTpaAI-NiBXXcw6aMngIrGOhb0uTa3_0tEThJeLpC1Wz9pu9h5M-L5z5ko_MugHCy2t2Yz2h8ewhPStuXz60TmErTEqRppjDDiCaTc-DaUu_dr',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBMl2Ysv8iD2TiD94wJ4ImRdUZwOpzhxb5CsZ6QGMc9thQNcq6UGoZN5BQG9P85D54qABA_bXsxN1WiJW8Xy4mCRUow9e5pc-p7HKkY_fiMZytOFfb5RGpd66-xT_1GEaTHBDfieo7iyWiBzWaa7GWTC2Cumf4am4gTpaAI-NiBXXcw6aMngIrGOhb0uTa3_0tEThJeLpC1Wz9pu9h5M-L5z5ko_MugHCy2t2Yz2h8ewhPStuXz60TmErTEqRppjDDiCaTc-DaUu_dr'
    ],
    translations: {
      en: {
        title: 'Organic Virgin Coconut Oil',
        seller: 'Pak Yusuf - Petani Kelapa Toli-Toli',
        province: 'Sulawesi Tengah, Indonesia',
        price: 18, priceRange: '15–22',
        desc: '100% Organic Virgin Coconut Oil (VCO), cold-pressed from fresh organic coconuts harvested in Central Sulawesi. Unrefined, unbleached, and non-deodorized to preserve the natural nutrients, antioxidant properties, and mild aroma.',
        keywords: ['virgin coconut oil', 'vco', 'organic oil', 'cold pressed', 'natural skincare'],
        markets: ['USA', 'China', 'UAE', 'Singapore'],
        score: 88, emoji: '🥥', category: 'KOSMETIK NATURAL',
        specs: {
          material: '100% Pure Virgin Coconut Oil',
          dimension: '500ml glass bottle / 5L Gallon',
          weight: '0.5 Kg per bottle',
          moq: '200 Bottles',
          productionTime: '7 - 10 Business Days',
          certification: 'USDA Organic, BPOM, Halal'
        }
      },
      zh: {
        title: '有机初榨椰子油',
        seller: '尤素夫先生 - 托利托利椰子农',
        province: '中苏拉威西省，印度尼西亚',
        price: 18, priceRange: '15–22',
        desc: '100%有机初榨椰子油（VCO），冷压自印尼中苏拉威西采摘的新鲜有机椰子。不精炼、不漂白、不脱臭，以保留天然营养素、抗氧化特性和温和的香气。',
        keywords: ['初榨椰子油', '有机椰子油', '冷压椰子油', '天然护肤', '印尼特产'],
        markets: ['USA', 'China', 'Singapore'],
        score: 88, emoji: '🥥', category: 'KOSMETIK NATURAL',
        specs: {
          material: '100% 纯天然初榨椰子油',
          dimension: '500毫升玻璃瓶 / 5升塑料桶',
          weight: '每瓶 0.5 公斤',
          moq: '200 瓶',
          productionTime: '7 - 10 工作日',
          certification: 'USDA 有机认证, BPOM, 清真'
        }
      },
      id: {
        title: 'Minyak Kelapa Dara Organik (VCO)',
        seller: 'Pak Yusuf - Petani Kelapa Toli-Toli',
        province: 'Sulawesi Tengah, Indonesia',
        price: 18, priceRange: '15–22',
        desc: '100% Minyak Kelapa Murni (Virgin Coconut Oil - VCO) organik, diproses secara cold-pressed dari kelapa segar pilihan di Sulawesi Tengah. Tanpa pemanasan tinggi, penjernih kimia, atau pewangi tambahan untuk menjaga khasiat alami.',
        keywords: ['minyak kelapa murni', 'vco', 'minyak kelapa organik', 'cold pressed', 'kecantikan alami'],
        markets: ['USA', 'Tiongkok', 'Singapura'],
        score: 88, emoji: '🥥', category: 'KOSMETIK NATURAL',
        specs: {
          material: '100% Minyak Kelapa Murni Alami',
          dimension: 'Botol kaca 500ml / Galon 5L',
          weight: '0.5 Kg per botol',
          moq: '200 Botol',
          productionTime: '7 - 10 Hari Kerja',
          certification: 'USDA Organic, BPOM, Halal'
        }
      }
    }
  },
  '7': {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD0116unN5GcDIGwcPjo-8Hq5-F7y9gBHY5OFtNlHJyRex84ZU8IL0uy13XU_JTQPhJRqgpvUeJzSWgHYqkoMlFlBn2-_5zfPIhScdZmb627iMpjTJVjSaG7OUnpL8QjN11t1y7kUXfAV4usfo5tgtlC4HLt7NV2-U81nUVaV7kFUVLEG6W6pzcKTwrU3CWpEsJ8DCtR6IqRQej7p7fHdLJxlXWjpds3PDV_vPvHXc5MZCerPKf9l33mT9weWieOCUC9acwCt40rZ_W',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD0116unN5GcDIGwcPjo-8Hq5-F7y9gBHY5OFtNlHJyRex84ZU8IL0uy13XU_JTQPhJRqgpvUeJzSWgHYqkoMlFlBn2-_5zfPIhScdZmb627iMpjTJVjSaG7OUnpL8QjN11t1y7kUXfAV4usfo5tgtlC4HLt7NV2-U81nUVaV7kFUVLEG6W6pzcKTwrU3CWpEsJ8DCtR6IqRQej7p7fHdLJxlXWjpds3PDV_vPvHXc5MZCerPKf9l33mT9weWieOCUC9acwCt40rZ_W'
    ],
    translations: {
      en: {
        title: 'Wayang Kulit Wall Art',
        seller: 'Pak Siswanto - Javanese Puppet Guild',
        province: 'Jawa Tengah, Indonesia',
        price: 210, priceRange: '190–240',
        desc: 'Masterfully carved leather shadow puppet (Wayang Kulit) wall decor depicting heroic characters from classic epics. Made of cured water buffalo hide and painted with gold leaf details by hand in Central Java.',
        keywords: ['wayang kulit', 'leather puppet', 'javanese art', 'wall decor', 'cultural craft'],
        markets: ['USA', 'China', 'Singapore', 'Netherlands'],
        score: 93, emoji: '🎭', category: 'KERAJINAN TANGAN',
        specs: {
          material: 'Premium Buffalo Hide, Horn Handle',
          dimension: 'Height 65cm, Width 40cm',
          weight: '0.9 Kg',
          moq: '5 Units',
          productionTime: '21 - 30 Business Days',
          certification: 'Art Guild Certificate'
        }
      },
      zh: {
        title: '印尼皮影壁挂艺术',
        seller: '西斯万托先生 - 爪哇皮影行会',
        province: '中爪哇省，印度尼西亚',
        price: 210, priceRange: '190–240',
        desc: '精雕细琢的真皮皮影戏偶（Wayang Kulit）墙面装饰，描绘经典史诗中的英雄人物。在中爪哇省由水牛皮制成，并用金箔细节手绘。',
        keywords: ['皮影戏偶', '水牛皮工艺', '爪哇艺术', '壁挂装饰', '文化手工艺'],
        markets: ['USA', 'China', 'Singapore'],
        score: 93, emoji: '🎭', category: 'KERAJINAN TANGAN',
        specs: {
          material: '优质水牛皮, 牛角把手',
          dimension: '高度 65厘米, 宽度 40厘米',
          weight: '0.9 公斤',
          moq: '5 件',
          productionTime: '21 - 30 工作日',
          certification: '艺术行会认证'
        }
      },
      id: {
        title: 'Hiasan Dinding Wayang Kulit',
        seller: 'Pak Siswanto - Sanggar Wayang Jawa',
        province: 'Jawa Tengah, Indonesia',
        price: 210, priceRange: '190–240',
        desc: 'Hiasan dinding wayang kulit tatah sungging halus yang menggambarkan tokoh ksatria dalam pewayangan klasik. Terbuat dari kulit kerbau pilihan dan dipadukan dengan cat prada emas buatan tangan pengrajin legendaris.',
        keywords: ['wayang kulit', 'tatah sungging', 'seni jawa', 'hiasan dinding', 'kerajinan tradisional'],
        markets: ['USA', 'Tiongkok', 'Belanda'],
        score: 93, emoji: '🎭', category: 'KERAJINAN TANGAN',
        specs: {
          material: 'Kulit Kerbau pilihan, Gagang Tanduk',
          dimension: 'Tinggi 65cm, Lebar 40cm',
          weight: '0.9 Kg',
          moq: '5 Unit',
          productionTime: '21 - 30 Hari Kerja',
          certification: 'Sertifikat Sanggar Seni'
        }
      }
    }
  },
  '8': {
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAm1rmy2wRqElvx-tI6arxloke-i3IBxDqWv9QN5VI6Kc2OFOkwTo3-C3xRu06mxGzM2QsfQTaTNIcKIPLAV3_9woNWQ3_Xj9xCEAyHz_pSsyYNILiPgd8QCx5ixJvQ8Bh0qLaV8nh4gZ5ioWAMindMQXEIbm2c3jEM7Off-zEfhtUWyPp2qS0E4DRSFaEfqzulb4NRBYeeFccu8x-Q2uA8IigIe5s6SylzeAHnIZZWx-NOHZWBHgQQUGN4qOOmOzeDijm8rgxuFxdt',
    gallery: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAm1rmy2wRqElvx-tI6arxloke-i3IBxDqWv9QN5VI6Kc2OFOkwTo3-C3xRu06mxGzM2QsfQTaTNIcKIPLAV3_9woNWQ3_Xj9xCEAyHz_pSsyYNILiPgd8QCx5ixJvQ8Bh0qLaV8nh4gZ5ioWAMindMQXEIbm2c3jEM7Off-zEfhtUWyPp2qS0E4DRSFaEfqzulb4NRBYeeFccu8x-Q2uA8IigIe5s6SylzeAHnIZZWx-NOHZWBHgQQUGN4qOOmOzeDijm8rgxuFxdt'
    ],
    translations: {
      en: {
        title: 'Batik Tulis Premium',
        seller: 'Ibu Hartini - Pekalongan Heritage Batik',
        province: 'Jawa Tengah, Indonesia',
        price: 95, priceRange: '85–115',
        desc: 'Premium hand-drawn batik tulis fabric from Pekalongan, featuring colorful coastal patterns and highly detailed floral motifs. Crafted on pure primissima cotton using hot wax resists.',
        keywords: ['batik tulis', 'pekalongan batik', 'cotton fabric', 'coastal batik', 'traditional hand craft'],
        markets: ['Germany', 'Japan', 'Malaysia', 'Singapore'],
        score: 91, emoji: '🧣', category: 'TEKSTIL & BATIK',
        specs: {
          material: 'Fine Primissima Cotton, Hot Wax',
          dimension: '250cm x 115cm',
          weight: '0.35 Kg',
          moq: '15 Units',
          productionTime: '30 - 60 Business Days',
          certification: 'Batikmark Certified'
        }
      },
      zh: {
        title: '高档手工蜡染',
        seller: '哈蒂尼女士 - 佩卡隆岸蜡染',
        province: '中爪哇省，印度尼西亚',
        price: 95, priceRange: '85–115',
        desc: '来自佩卡隆岸的优质手工蜡染（Batik Tulis）面料，具有色彩鲜艳的沿海图案和高度详细的花卉图案。采用热蜡防染技术在纯正的primissima棉布上精制而成。',
        keywords: ['手工蜡染', '佩卡隆岸蜡染', '棉质面料', '沿海风格', '传统手工艺'],
        markets: ['Germany', 'Japan', 'Singapore'],
        score: 91, emoji: '🧣', category: 'TEKSTIL & BATIK',
        specs: {
          material: '优质 Primissima 棉布, 热蜡防染',
          dimension: '250厘米 x 115厘米',
          weight: '0.35 公斤',
          moq: '15 件',
          productionTime: '30 - 60 工作日',
          certification: 'Batikmark 认证优质产品'
        }
      },
      id: {
        title: 'Batik Tulis Premium Pekalongan',
        seller: 'Ibu Hartini - Batik Warisan Pekalongan',
        province: 'Jawa Tengah, Indonesia',
        price: 95, priceRange: '85–115',
        desc: 'Kain batik tulis premium khas Pekalongan, menampilkan motif pesisiran yang cerah dengan detail bunga yang rapat dan indah. Dibuat di atas katun primissima halus menggunakan lilin malam panas tradisional.',
        keywords: ['batik tulis', 'batik pekalongan', 'kain katun', 'batik pesisir', 'kerajinan tradisional'],
        markets: ['Jerman', 'Jepang', 'Singapura'],
        score: 91, emoji: '🧣', category: 'TEKSTIL & BATIK',
        specs: {
          material: 'Katun Primissima Halus, Lilin Malam',
          dimension: '250cm x 115cm',
          weight: '0.35 Kg',
          moq: '15 Unit',
          productionTime: '30 - 60 Hari Kerja',
          certification: 'Sertifikat Batikmark'
        }
      }
    }
  }
};

const SUGGESTED_MESSAGES = [
  'Hi, I\'m interested in ordering 5 pieces. What is the minimum order?',
  'Can you do custom colors or motifs?',
  'What are the shipping options to the US?',
  'Is this product available in bulk for wholesale?',
];

export default function BuyerProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) || '1';
  
  const [lang, setLang] = useState('en');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [showAllLangs, setShowAllLangs] = useState(false);
  const [activeImageState, setActiveImageState] = useState<string | null>(null);

  // Retrieve the correct product by ID from our premium catalog, fallback to '1' (Rattan Bag)
  const productSource = PRODUCTS_DETAILS[id] || PRODUCTS_DETAILS['1'];
  const product = productSource.translations[lang] ?? productSource.translations['en'];
  const gallery = productSource.gallery;
  const activeImage = activeImageState || productSource.image;

  // Reset active image state when the ID in the URL changes
  useEffect(() => {
    setActiveImageState(null);
  }, [id]);

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1200));
    setSending(false);
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-[#fcf9f8] text-[#1c1b1b]" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Navbar />

      <main className="pt-6 md:pt-16 pb-20 md:pb-[120px] px-4 md:px-16 max-w-[1280px] mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 text-[12px] font-bold text-[#414846] uppercase tracking-widest overflow-x-auto whitespace-nowrap pb-2 md:pb-0">
          <Link href="/marketplace" className="hover:text-[#1A3C34] transition-colors">Marketplace</Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="hover:text-[#1A3C34] transition-colors cursor-pointer capitalize">{product.category.toLowerCase()}</span>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-[#1A3C34]">{product.title}</span>
        </nav>

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-8 md:gap-12 items-start">
          {/* Left: Product Images */}
          <div className="space-y-4 md:space-y-6">
            <div className="relative group aspect-square md:aspect-[4/3] rounded-xl overflow-hidden border border-[#c1c8c4]/30 bg-white">
              <img 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                src={activeImage}
                alt={product.title} 
              />
              <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-[#E76F1E] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg font-bold text-[10px] md:text-[12px] flex items-center gap-2 shadow-lg tracking-widest uppercase">
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                EXPORT READY
              </div>
            </div>
            
            <div className="grid grid-cols-5 gap-1.5 md:gap-4">
              {gallery.map((img, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActiveImageState(img)}
                  className={`aspect-square rounded-lg overflow-hidden cursor-pointer transition-colors border-2 ${activeImage === img ? 'border-[#1A3C34] ring-offset-2' : 'border-[#c1c8c4]/30 hover:border-[#1A3C34]'}`}
                >
                  <img src={img} alt={`Gallery ${idx}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Product Info */}
          <div className="bg-white p-4 md:p-8 rounded-xl border border-[#c1c8c4]/30 shadow-sm md:sticky md:top-24">
            <p className="text-[12px] font-bold text-[#E76F1E] tracking-[0.2em] mb-2">{product.category}</p>
            <h1 className="text-[32px] md:text-[40px] font-bold text-[#1A3C34] mb-6 leading-tight tracking-[-0.02em]">{product.title}</h1>
            
            {/* Export Readiness Score */}
            <div className="mb-6 p-4 bg-[#f0eded] rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[16px] font-semibold text-[#1A3C34]">Export Readiness Score</span>
                <span className="text-[16px] font-bold text-[#1A3C34]">{product.score}%</span>
              </div>
              <div className="w-full h-3 bg-white rounded-full overflow-hidden">
                <div className="h-full bg-[#E76F1E] rounded-full" style={{ width: `${product.score}%` }}></div>
              </div>
              <p className="text-[12px] text-[#414846] mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
                AI verified: High quality production & documentation standards met.
              </p>
            </div>

            <div className="mb-6">
              <p className="text-[28px] md:text-[36px] font-bold text-[#E76F1E] flex items-baseline gap-2 flex-wrap">
                ${product.price}.00 USD 
                <span className="text-[14px] md:text-[16px] font-normal text-[#414846]">(~Rp 650.000)</span>
              </p>
            </div>

            {/* Language Switcher */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[12px] font-bold text-[#414846] tracking-widest uppercase">LISTING LANGUAGES</p>
                {!showAllLangs && (
                  <button onClick={() => setShowAllLangs(true)} className="text-[12px] text-[#1A3C34] font-bold hover:underline">
                    Lihat Semua
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {(showAllLangs ? LANGUAGES : LANGUAGES.slice(0, 4)).map(l => (
                  <button 
                    key={l}
                    onClick={() => setLang(l.toLowerCase())}
                    className={`px-4 py-2 rounded-lg text-[16px] font-semibold transition-colors ${
                      lang === l.toLowerCase() 
                        ? 'bg-[#1A3C34] text-white' 
                        : 'bg-[#f0eded] text-[#414846] hover:bg-[#c1c8c4]/30'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Seller Card */}
            <div className="p-4 border border-[#c1c8c4]/20 bg-[#f6f3f2] rounded-lg flex flex-col md:flex-row items-start md:items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-white border border-[#c1c8c4]/30 flex-shrink-0">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwipalOoPmeBDVAjRY46x5N1p1hac-orQdPu4EJdsjJtY76JUbiyN_kmI23LnU665m5P9-MTtVb0USwLDepoTt1Z6HMpriCe3pG9Eat3PY0h6ugJNy-ooPV1CPDbAU7hpQRMIkaMbQuW2sKPNKhHCUrthR8W3jpweMk0TIf65vhAxZQxlZU1EAZUohTZVfu21bIAmu1X3eGzniRercfpOYC9gwRaok2hr-9xSYiFwYVxGd7uFRzPGZGwBbfABmpjTGp7x9otKKHlrx" 
                  alt="Pak Budi" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-[#1A3C34] text-[18px] leading-tight">{product.seller}</h4>
                <p className="text-[16px] text-[#414846]">{product.province} • <span className="text-[#6eae78] font-semibold">Aktif</span></p>
                <div className="flex gap-4 mt-2 text-[12px] font-bold text-[#414846]">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span> Balas &lt; 1 jam</span>
                </div>
              </div>
            </div>

            {/* AI-Powered Communication Feature Badge */}
            <div className="bg-[#c5eadf]/30 border border-[#c5eadf] rounded-xl p-4 flex items-center gap-3 mb-6">
              <ShieldCheck size={24} className="text-[#105226] flex-shrink-0" />
              <div>
                <p className="text-[14px] font-bold text-[#00210a]">AI-Powered Communication</p>
                <p className="text-[12px] text-[#105226] leading-relaxed mt-0.5">Your message will be instantly translated. Seller receives a voice notification in their local language.</p>
              </div>
            </div>

            {/* CONTACT SELLER FORM (Integrated from existing logic) */}
            <div className="bg-[#fcf9f8] rounded-xl p-4 md:p-6 border border-[#c1c8c4]/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MessageCircle size={18} className="text-[#1A3C34]" />
                  <p className="text-[16px] font-bold text-[#1A3C34]">Hubungi Penjual</p>
                </div>
                <Link
                  href={`/marketplace/conversations/${id}`}
                  className="w-8 h-8 rounded-full border border-[#c1c8c4] flex items-center justify-center text-[#1A3C34] hover:bg-[#1A3C34] hover:text-white hover:border-[#1A3C34] transition-all bg-white shadow-sm"
                  title="Direct to Chat"
                >
                  <MessageCircle size={14} />
                </Link>
              </div>

              {sent ? (
                <div className="bg-[#b0f2b7]/20 border border-[#95d69d] rounded-xl p-6 text-center">
                  <CheckCircle2 size={40} className="text-[#105226] mx-auto mb-3" />
                  <p className="text-[#00210a] font-bold text-[18px]">Message Sent!</p>
                  <p className="text-[#105226] text-[14px] mt-2 leading-relaxed max-w-sm mx-auto">AI is translating your message and notifying the seller. You'll receive a reply shortly.</p>
                  <button 
                    onClick={() => router.push('/marketplace/conversations/1')}
                    className="mt-6 w-full bg-[#1A3C34] text-white font-bold py-3.5 rounded-xl text-[16px] hover:opacity-90 transition-opacity"
                  >
                    View Conversation →
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4">
                    <p className="text-[10px] text-[#717976] font-bold tracking-widest mb-3 uppercase">Quick Messages</p>
                    <div className="flex flex-col gap-2">
                      {SUGGESTED_MESSAGES.map((msg, i) => (
                        <button 
                          key={i} 
                          onClick={() => setMessage(msg)}
                          className={`text-left text-[14px] px-4 py-2.5 rounded-xl border transition-all ${
                            message === msg
                              ? 'border-[#1A3C34] bg-[#1A3C34]/5 text-[#1A3C34] font-semibold'
                              : 'border-[#c1c8c4] text-[#414846] hover:bg-white'
                          }`}
                        >
                          {msg}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-[10px] text-[#717976] font-bold tracking-widest mb-3 uppercase">Or Type Your Own</p>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="Type your message in any language..."
                    rows={3}
                    className="w-full border border-[#c1c8c4] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#1A3C34] focus:ring-1 focus:ring-[#1A3C34] resize-none transition-all bg-white"
                  />
                  <div className="flex gap-4 mt-4">
                    <button 
                      onClick={handleSend} 
                      disabled={!message.trim() || sending}
                      className="flex-1 bg-[#E76F1E] text-white font-bold py-4 rounded-xl text-[16px] disabled:opacity-50 transition-all hover:opacity-90 shadow-lg shadow-[#E76F1E]/20 flex items-center justify-center gap-2"
                    >
                      {sending ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Translating...
                        </>
                      ) : (
                        <>
                          <Send size={18} /> Send Message
                        </>
                      )}
                    </button>
                    <button className="px-6 py-4 rounded-xl border-2 border-[#1A3C34] text-[#1A3C34] font-bold text-[18px] hover:bg-[#1A3C34]/5 transition-colors">
                      <Bookmark size={20} />
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

        {/* Detail Sections */}
        <section className="mt-20 md:mt-[160px] grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 md:gap-16">
          <div className="space-y-16">
            
            {/* Deskripsi & Detail Produk */}
            <div>
              <h3 className="text-[24px] font-bold text-[#1A3C34] mb-6 border-b border-[#c1c8c4]/30 pb-3">Product Description</h3>
              <p className="text-[16px] text-[#414846] leading-relaxed mb-6">{product.desc}</p>
              
              <div className="flex flex-wrap gap-2 mb-8">
                {product.keywords.map(k => (
                  <span key={k} className="bg-[#f0eded] text-[#414846] text-[12px] px-3 py-1.5 rounded-full capitalize">{k}</span>
                ))}
              </div>

              <div className="overflow-hidden rounded-xl border border-[#c1c8c4]/30 bg-white">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    <tr className="border-b border-[#c1c8c4]/20">
                      <th className="px-3 md:px-6 py-3 md:py-4 text-[11px] md:text-[12px] font-bold tracking-widest uppercase bg-[#f6f3f2] w-1/3">Material</th>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-[14px] md:text-[16px] text-[#414846]">{product.specs.material}</td>
                    </tr>
                    <tr className="border-b border-[#c1c8c4]/20">
                      <th className="px-3 md:px-6 py-3 md:py-4 text-[11px] md:text-[12px] font-bold tracking-widest uppercase bg-[#f6f3f2]">Dimensi</th>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-[14px] md:text-[16px] text-[#414846]">{product.specs.dimension}</td>
                    </tr>
                    <tr className="border-b border-[#c1c8c4]/20">
                      <th className="px-3 md:px-6 py-3 md:py-4 text-[11px] md:text-[12px] font-bold tracking-widest uppercase bg-[#f6f3f2]">Berat</th>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-[14px] md:text-[16px] text-[#414846]">{product.specs.weight}</td>
                    </tr>
                    <tr className="border-b border-[#c1c8c4]/20">
                      <th className="px-3 md:px-6 py-3 md:py-4 text-[11px] md:text-[12px] font-bold tracking-widest uppercase bg-[#f6f3f2]">MOQ</th>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-[14px] md:text-[16px] text-[#414846]">{product.specs.moq}</td>
                    </tr>
                    <tr className="border-b border-[#c1c8c4]/20">
                      <th className="px-3 md:px-6 py-3 md:py-4 text-[11px] md:text-[12px] font-bold tracking-widest uppercase bg-[#f6f3f2]">Waktu Produksi</th>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-[14px] md:text-[16px] text-[#414846]">{product.specs.productionTime}</td>
                    </tr>
                    <tr>
                      <th className="px-3 md:px-6 py-3 md:py-4 text-[11px] md:text-[12px] font-bold tracking-widest uppercase bg-[#f6f3f2]">Sertifikasi</th>
                      <td className="px-3 md:px-6 py-3 md:py-4 text-[14px] md:text-[16px] text-[#414846]">{product.specs.certification}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* AI Listings Section */}
            <div>
              <h3 className="text-[24px] font-bold text-[#1A3C34] mb-6">Listing Tersedia dalam 6 Bahasa</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { flag: '🇺🇸', lang: 'English', type: 'AI Generated' },
                  { flag: '🇨🇳', lang: 'Chinese', type: 'AI Generated' },
                  { flag: '🇸🇦', lang: 'Arabic', type: 'AI Generated' },
                  { flag: '🇯🇵', lang: 'Japanese', type: 'AI Generated' },
                  { flag: '🇩🇪', lang: 'German', type: 'AI Generated' },
                  { flag: '🇮🇩', lang: 'Bahasa', type: 'MANUAL' },
                ].map((l) => (
                  <div key={l.lang} className="p-4 md:p-6 rounded-xl bg-[#c5eadf]/30 border border-[#c5eadf] flex flex-col items-center text-center">
                    <span className="text-3xl md:text-4xl mb-3">{l.flag}</span>
                    <p className="text-[12px] font-bold tracking-widest uppercase text-[#1A3C34] mb-3">{l.lang}</p>
                    <span className={`bg-white/60 px-2 py-1 rounded text-[10px] font-bold text-[#1A3C34] flex items-center gap-1 uppercase tracking-wider ${l.type === 'MANUAL' ? 'opacity-70' : ''}`}>
                      {l.type === 'AI Generated' && <span className="material-symbols-outlined text-[12px]">auto_awesome</span>}
                      {l.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: Dynamic AI Insights */}
          <aside className="space-y-6">
            <div className="bg-[#1A3C34] p-6 rounded-xl text-white">
              <div className="flex items-center gap-3 mb-4">
                <span className="material-symbols-outlined text-[#E76F1E]">insights</span>
                <h4 className="font-bold text-[18px]">Pasar Potensial</h4>
              </div>
              <p className="text-[16px] mb-6 opacity-90 leading-relaxed">AI kami memprediksi permintaan tinggi di wilayah berikut berdasarkan data ekspor terbaru:</p>
              <ul className="space-y-4">
                <li className="flex items-center justify-between text-[12px] font-bold tracking-widest uppercase">
                  <span>Prancis</span>
                  <span className="text-[#E76F1E]">+12% YoY</span>
                </li>
                <li className="flex items-center justify-between text-[12px] font-bold tracking-widest uppercase">
                  <span>Uni Emirat Arab</span>
                  <span className="text-[#E76F1E]">+8% YoY</span>
                </li>
                <li className="flex items-center justify-between text-[12px] font-bold tracking-widest uppercase">
                  <span>Australia</span>
                  <span className="text-[#E76F1E]">+15% YoY</span>
                </li>
              </ul>
            </div>
            
            <div className="border border-[#c1c8c4]/30 p-6 rounded-xl bg-white">
              <h4 className="font-bold text-[#1A3C34] text-[18px] mb-4">Layanan Pengiriman</h4>
              <div className="flex flex-wrap gap-2">
                {['DHL Express', 'FedEx', 'Pos Indonesia', 'EksporID'].map((shipping) => (
                  <span key={shipping} className="px-3 py-1.5 bg-[#f0eded] rounded-full text-[10px] font-bold tracking-widest text-[#414846] uppercase border border-[#c1c8c4]/30">
                    {shipping}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </section>

        {/* Similar Products */}
        <section className="mt-16 md:mt-[120px]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <h3 className="text-[28px] md:text-[36px] font-bold text-[#1A3C34] leading-tight">Produk Serupa dari UMKM Indonesia</h3>
            <Link href="/marketplace" className="text-[#1A3C34] font-bold flex items-center gap-2 hover:opacity-80 transition-opacity">
              Lihat Semua <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {Object.entries(PRODUCTS_DETAILS)
              .filter(([key]) => key !== id)
              .slice(0, 4)
              .map(([key, value]) => {
                const trans = value.translations[lang] || value.translations['en'];
                return (
                  <Link 
                    key={key} 
                    href={`/marketplace/${key}`}
                    className="group bg-white rounded-xl border border-[#c1c8c4]/30 overflow-hidden hover:shadow-xl hover:border-[#1A3C34] transition-all cursor-pointer block"
                  >
                    <div className="aspect-square relative overflow-hidden bg-white">
                      <img src={value.image} alt={trans.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-bold text-[#1A3C34] border border-[#c1c8c4]/30 uppercase tracking-wider">
                        {trans.category}
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-[12px] font-bold tracking-widest text-[#414846] mb-1 uppercase">{trans.province}</p>
                      <h4 className="font-bold text-[#1A3C34] text-[16px] mb-2 truncate">{trans.title}</h4>
                      <p className="text-[#E76F1E] font-bold text-[18px]">${trans.price.toFixed(2)}</p>
                    </div>
                  </Link>
                );
              })}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}