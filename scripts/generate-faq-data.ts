import { client } from '../src/lib/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const OLLAMA_API_URL = process.env.OLLAMA_API_URL;

interface BlogPost {
  slug: string;
  title: string;
  shortDescription: string;
  content: any;
}

interface FAQData {
  [slug: string]: {
    questions: Array<{
      question: string;
      answer: string;
    }>;
  };
}

async function generateFAQForPost(
  post: BlogPost,
): Promise<Array<{ question: string; answer: string }> | null> {
  try {
    console.log(`Generating AI FAQ for: ${post.title} (${post.slug})`);

    const prompt = `
Based on this blog post, generate 4-5 relevant FAQ questions and answers that readers might have about this topic.

Blog Post Title: ${post.title}
Blog Post Description: ${post.shortDescription}

Generate questions that are:
1. Relevant to the blog post topic
2. Something readers would actually want to know
3. Clear and specific
4. Cover different aspects of the topic

Provide concise but informative answers.

Return ONLY a valid JSON array with this exact structure:
[
  {
    "question": "What is...?",
    "answer": "The answer..."
  }
]

Do not include any other text, just the JSON array.
`;

    const response = await fetch(`${process.env.OLLAMA_API_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3.1:8b',
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
        },
      }),
    });

    console.log('Response', response);

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('data', data);
    const aiResponse = data.response;

    const jsonMatch = aiResponse.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const faqData = JSON.parse(jsonMatch[0]);

      if (
        Array.isArray(faqData) &&
        faqData.every(
          item =>
            typeof item === 'object' &&
            typeof item.question === 'string' &&
            typeof item.answer === 'string',
        )
      ) {
        console.log(`✅ Generated ${faqData.length} FAQ items for ${post.slug}`);
        return faqData;
      }
    }

    console.log('⚠️ Failed to parse AI response, using fallback data');
    return null;
  } catch (error) {
    console.error(`Error generating FAQ for ${post.slug}:`, error);
    return null;
  }
}

async function generateFAQData() {
  try {
    if (!OLLAMA_API_URL) {
      throw new Error('OLLAMA_API_URL is not set');
    }

    console.log('Fetching all blog posts from Contentful...');

    const outputPath = path.join(process.cwd(), 'public', 'faq-data.json');
    let existingFaqData: FAQData = {};

    if (fs.existsSync(outputPath)) {
      try {
        const existingData = fs.readFileSync(outputPath, 'utf8');
        existingFaqData = JSON.parse(existingData);
        console.log(`📁 Loaded existing FAQ data for ${Object.keys(existingFaqData).length} posts`);
      } catch (error) {
        console.log('⚠️ Could not load existing FAQ data, starting fresh');
      }
    }

    const { pageBlogPostCollection } = await client.pageBlogPostCollection({
      locale: 'en-US',
      limit: 100,
    });

    if (!pageBlogPostCollection?.items) {
      throw new Error('No blog posts found');
    }

    const faqData: FAQData = { ...existingFaqData };
    let processedCount = 0;
    let skippedCount = 0;

    console.log(`Found ${pageBlogPostCollection.items.length} blog posts`);

    for (const post of pageBlogPostCollection.items) {
      if (!post?.slug) continue;

      if (existingFaqData[post.slug]) {
        console.log(`⏭️ Skipping ${post.title} (${post.slug}) - FAQ already exists`);
        skippedCount++;
        continue;
      }

      console.log(`Processing: ${post.title} (${post.slug})`);

      const faqItems = await generateFAQForPost({
        slug: post.slug,
        title: post.title || '',
        shortDescription: post.shortDescription || '',
        content: post.content,
      });

      if (faqItems) {
        faqData[post.slug] = {
          questions: faqItems,
        };
        processedCount++;
      }
    }

    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(faqData, null, 2));

    console.log(`✅ FAQ data saved to: ${outputPath}`);
    console.log(`✅ Generated FAQ for ${Object.keys(faqData).length} posts`);
    console.log(`📊 Summary: ${processedCount} new posts processed, ${skippedCount} posts skipped`);

    const sampleSlug = Object.keys(faqData)[0];
    if (sampleSlug) {
      console.log('\n📋 Sample FAQ data:');
      console.log(JSON.stringify(faqData[sampleSlug], null, 2));
    }
  } catch (error) {
    console.error('❌ Error generating FAQ data:', error);
    process.exit(1);
  }
}

generateFAQData();
