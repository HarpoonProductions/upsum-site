// debug-query.js - Run this to test your Sanity queries

export default async function(client) {
  console.log('🔍 Testing Sanity queries...\n');
  
  // Test 1: Check all FAQ documents
  const allFaqs = await client.fetch(`*[_type == "faq"]`);
  console.log(`📊 Total FAQ documents: ${allFaqs.length}`);
  
  // Test 2: Check FAQs with slugs
  const faqsWithSlugs = await client.fetch(`*[_type == "faq" && defined(slug.current)]`);
  console.log(`🔗 FAQs with slugs: ${faqsWithSlugs.length}`);
  
  // Test 3: Your current query
  const currentQuery = `*[_type == "faq" && defined(slug.current)] | order(_createdAt desc)[0...10] {
    _id,
    question,
    slug,
    summaryForAI,
    image {
      asset -> {
        url
      }
    }
  }`;
  
  const currentResult = await client.fetch(currentQuery);
  console.log(`📝 Current query result: ${currentResult.length}`);
  
  // Test 4: Sample data
  if (allFaqs.length > 0) {
    console.log('\n📋 Sample FAQ structure:');
    console.log(JSON.stringify(allFaqs[0], null, 2));
  }
  
  // Test 5: Check for drafts
  const drafts = await client.fetch(`*[_type == "faq" && _id in path("drafts.**")]`);
  console.log(`📝 Draft FAQs: ${drafts.length}`);
  
  // Test 6: Check published FAQs
  const published = await client.fetch(`*[_type == "faq" && !(_id in path("drafts.**"))]`);
  console.log(`✅ Published FAQs: ${published.length}`);
  
  console.log('\n🔍 Detailed results:');
  return {
    total: allFaqs.length,
    withSlugs: faqsWithSlugs.length,
    currentQuery: currentResult.length,
    drafts: drafts.length,
    published: published.length,
    sampleData: allFaqs[0] || null,
    currentQueryResults: currentResult
  };
}