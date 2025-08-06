import fs from 'fs';
import path from 'path';

export async function getFAQData(slug: string) {
  try {
    const faqDataPath = path.join(process.cwd(), 'public', 'faq-data.json');

    if (!fs.existsSync(faqDataPath)) {
      console.log('FAQ data file not found, skipping FAQ schema');
      return null;
    }

    const faqDataContent = fs.readFileSync(faqDataPath, 'utf-8');
    const faqData = JSON.parse(faqDataContent);

    return faqData[slug]?.questions || null;
  } catch (error) {
    console.error('Error loading FAQ data:', error);
    return null;
  }
} 