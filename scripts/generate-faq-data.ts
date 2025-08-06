import { client } from '../src/lib/client';
import fs from 'fs';
import path from 'path';

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

// AI-powered FAQ generation using Ollama
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

    // Call Ollama API
    const response = await fetch('http://127.0.0.1:11434/api/generate', {
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
    console.log('Fetching all blog posts from Contentful...');

    // Fetch all blog posts
    const { pageBlogPostCollection } = await client.pageBlogPostCollection({
      locale: 'en-US',
      limit: 100,
    });

    if (!pageBlogPostCollection?.items) {
      throw new Error('No blog posts found');
    }

    const faqData: FAQData = {};

    console.log(`Found ${pageBlogPostCollection.items.length} blog posts`);

    // Generate FAQ for each post
    for (const post of pageBlogPostCollection.items) {
      if (!post?.slug) continue;

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
      }
    }

    // Ensure the public directory exists
    const publicDir = path.join(process.cwd(), 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // Save to JSON file
    const outputPath = path.join(publicDir, 'faq-data.json');
    fs.writeFileSync(outputPath, JSON.stringify(faqData, null, 2));

    console.log(`✅ FAQ data saved to: ${outputPath}`);
    console.log(`✅ Generated FAQ for ${Object.keys(faqData).length} posts`);

    // Show sample of generated data
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

// Run the script
generateFAQData();
