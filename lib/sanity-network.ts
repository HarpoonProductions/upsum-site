// lib/sanity-network.ts - Multi-client configuration for Upsum Network

import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

// Main Upsum client (existing)
export const client = createClient({
  projectId: 'rpufi5bg',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-06-01',
})

// UPF FAQs client - NEW STANDALONE PROJECT
export const upfClient = createClient({
  projectId: 'shxuue68',  // ✅ New standalone project
  dataset: 'production',  // ✅ New dataset
  useCdn: true,
  apiVersion: '2023-05-03', // ✅ Match the API version from UPF-FAQs
})

// Going To Uni FAQs client  
export const uniClient = createClient({
  projectId: 'gzkxsj66',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-06-01',
})

// Image URL builders for each client
const mainBuilder = imageUrlBuilder(client)
const upfBuilder = imageUrlBuilder(upfClient)
const uniBuilder = imageUrlBuilder(uniClient)

// Main Upsum image URL function
export const urlFor = (source: SanityImageSource) => mainBuilder.image(source)

// UPF FAQs image URL function
export const upfUrlFor = (source: SanityImageSource) => upfBuilder.image(source)

// Going To Uni FAQs image URL function  
export const uniUrlFor = (source: SanityImageSource) => uniBuilder.image(source)

// Network configuration
export const networkConfig = {
  upsum: {
    client: client,
    urlFor: urlFor,
    siteUrl: 'https://upsum.info',
    siteName: 'Upsum',
    themeColor: 'blue',
    badge: 'From Upsum',
    badgeIcon: '💡'
  },
  upf: {
    client: upfClient,
    urlFor: upfUrlFor,
    siteUrl: 'https://upffaqs.com',
    siteName: 'UPF FAQs',
    themeColor: 'orange',
    badge: 'From UPF FAQs',
    badgeIcon: '🥪'
  },
  uni: {
    client: uniClient,
    urlFor: uniUrlFor,
    siteUrl: 'https://goingtounifaqs.com',
    siteName: 'Going To Uni FAQs',
    themeColor: 'purple',
    badge: 'From Going To Uni FAQs',
    badgeIcon: '🎓'
  }
} as const

// Helper function to fetch FAQs from any site with error handling
export async function fetchSiteFaqs(site: keyof typeof networkConfig, limit = 3) {
  try {
    const config = networkConfig[site]
    const query = `*[
      _type == "faq" && 
      defined(slug.current) && 
      defined(question) && 
      slug.current != null && 
      question != null
    ] | order(_createdAt desc)[0...${limit}] {
      _id,
      question,
      slug,
      summaryForAI,
      image {
        asset -> { url },
        alt
      },
      publishedAt
    }`
    
    const faqs = await config.client.fetch(query)
    
    return faqs.filter((faq: any) => 
      faq && faq._id && faq.question && faq.slug && faq.slug.current
    ).map((faq: any) => ({
      ...faq,
      site,
      siteUrl: config.siteUrl,
      siteName: config.siteName,
      themeColor: config.themeColor
    }))
  } catch (error) {
    console.error(`❌ Error fetching ${site} FAQs:`, error)
    return []
  }
}

// Fetch all network FAQs with graceful error handling
export async function fetchNetworkFaqs(mainSiteLimit = 6, networkSiteLimit = 3) {
  try {
    const [upsumFaqs, upfFaqs, uniFaqs] = await Promise.allSettled([
      fetchSiteFaqs('upsum', mainSiteLimit),
      fetchSiteFaqs('upf', networkSiteLimit),
      fetchSiteFaqs('uni', networkSiteLimit)
    ])

    return {
      upsum: upsumFaqs.status === 'fulfilled' ? upsumFaqs.value : [],
      network: [
        ...(upfFaqs.status === 'fulfilled' ? upfFaqs.value : []),
        ...(uniFaqs.status === 'fulfilled' ? uniFaqs.value : [])
      ],
      errors: {
        upsum: upsumFaqs.status === 'rejected' ? upsumFaqs.reason : null,
        upf: upfFaqs.status === 'rejected' ? upfFaqs.reason : null,
        uni: uniFaqs.status === 'rejected' ? uniFaqs.reason : null
      }
    }
  } catch (error) {
    console.error('❌ Error fetching network FAQs:', error)
    return {
      upsum: [],
      network: [],
      errors: { upsum: error, upf: error, uni: error }
    }
  }
}

