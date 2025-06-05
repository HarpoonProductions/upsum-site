// app/faqs/[slug]/page.tsx

// This interface defines the expected props for your page component.
// Next.js App Router passes 'params' directly for dynamic routes.
interface FaqPageProps {
  params: Promise<{
    slug: string }>;
  };
  // If you were using `searchParams` from the URL, you'd add them here too:
  // searchParams?: { [key: string]: string | string[] | undefined };
}

export default async function FaqPage({ params }: FaqPageProps) {
  const { slug } = await params;

  // Your existing data fetching logic for Sanity
  // Example (assuming you have a Sanity client setup):
  // import { client } from '@/lib/sanity'; // Adjust path as needed
  // import { groq } from 'next-sanity';

  // const query = groq`*[_type == "faq" && slug.current == $slug][0]{
  //   _id,
  //   question,
  //   answer,
  //   // ... other fields
  // }`;
  // const faq = await client.fetch(query, { slug });

  // if (!faq) {
  //   return <div>FAQ not found</div>;
  // }

  return (
    <div>
      {/* <h1>{faq.question}</h1> */}
      {/* <p>{faq.answer}</p> */}
      <h1>FAQ Slug: {slug}</h1> {/* Temporarily display slug to confirm it's working */}
      {/* Render your FAQ content here */}
    </div>
  );
}