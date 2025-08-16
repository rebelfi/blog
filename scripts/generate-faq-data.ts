import { client } from '../src/lib/client';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import Anthropic from '@anthropic-ai/sdk';
dotenv.config();

const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

const anthropic = new Anthropic({
  apiKey: CLAUDE_API_KEY,
});

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

    const prompt = `Based on this blog post about blockchain and stablecoin infrastructure, generate 4-5 relevant FAQ questions and answers that readers might have.

Blog Post Title: ${post.title}
Blog Post Content: ${post.content}

Context: This is for RebelFi, a company building programmable stablecoin infrastructure that enables yield generation, smart escrow, and automated financial workflows for fintechs and financial institutions.

Generate questions that are:
1. Directly relevant to the blog post topic
2. Address practical implementation concerns (technical, regulatory, business)
3. Connect to broader stablecoin/DeFi adoption challenges when relevant
4. Include at least one question about practical applications or business benefits
5. Are specific enough to be genuinely helpful to someone evaluating this technology

Focus on questions that decision-makers at fintechs, payment companies, or financial institutions would actually ask when considering programmable stablecoin infrastructure.

Provide authoritative, concise answers that demonstrate subject matter expertise while being accessible to non-technical readers.

Return ONLY a valid JSON array with this exact structure:
[
  {
    "question": "What is...?",
    "answer": "The answer..."
  }
]

Do not include any other text, just the JSON array.`;

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-20250514',
      max_tokens: 1000,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt
      }]
    });

    console.log('Claude API response received');

    if (message.content && message.content.length > 0 && message.content[0].type === 'text') {
      const aiResponse = message.content[0].text;
      console.log('AI Response:', aiResponse.substring(0, 200) + '...');

      // Try to extract JSON from the response
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
    }

    console.log(`❌ Failed to generate FAQ for ${post.slug}`);
    return null;
  } catch (error) {
    console.error(`Error generating FAQ for ${post.slug}:`, error);
    return null;
  }
}

async function generateFAQData() {
  try {
    if (!CLAUDE_API_KEY) {
      throw new Error('CLAUDE_API_KEY is not set in environment variables');
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
