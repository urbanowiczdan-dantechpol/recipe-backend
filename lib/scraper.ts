import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeContent(url: string): Promise<string> {
  console.log(`Scraping URL: ${url}`);
  
  try {
    // Detect source type and route to appropriate scraper
    if (url.includes('instagram.com')) {
      return await scrapeInstagram(url);
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return await scrapeYouTube(url);
    } else {
      return await scrapeBlog(url);
    }
  } catch (error: any) {
    console.error('Scrape error:', error.message);
    throw new Error(`Nie udało się pobrać treści: ${error.message}`);
  }
}

/**
 * Scrape generic blog/website
 */
async function scrapeBlog(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      timeout: 20000,
      maxRedirects: 5,
    });
    
    const $ = cheerio.load(response.data);
    
    // Remove unwanted elements
    $('script, style, nav, footer, header, aside, .advertisement, .ad, .popup, .modal, .social-share, .comments, iframe').remove();
    
    let content = '';
    
    // Try recipe-specific selectors first
    const recipeSelectors = [
      '[itemtype*="Recipe"]',           // Schema.org Recipe markup
      '.recipe-content',
      '.recipe-body',
      '.recipe-instructions',
      '.recipe',
      '[class*="recipe"]',
      'article',
      '.post-content',
      '.entry-content',
      '.content',
      'main',
    ];
    
    for (const selector of recipeSelectors) {
      const element = $(selector).first();
      if (element.length > 0) {
        const text = element.text().trim();
        if (text.length > 300) {
          content = text;
          console.log(`Found content using selector: ${selector}`);
          break;
        }
      }
    }
    
    // Fallback: extract structured data (JSON-LD)
    if (content.length < 300) {
      $('script[type="application/ld+json"]').each((_, elem) => {
        try {
          const jsonData = JSON.parse($(elem).html() || '{}');
          if (jsonData['@type'] === 'Recipe' || jsonData.recipeIngredient) {
            content = JSON.stringify(jsonData, null, 2);
            console.log('Found structured recipe data (JSON-LD)');
          }
        } catch (e) {
          // Ignore JSON parse errors
        }
      });
    }
    
    // Last resort: full body text
    if (content.length < 300) {
      content = $('body').text();
      console.log('Using full body content (fallback)');
    }
    
    // Clean up whitespace
    content = content
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n')
      .trim();
    
    console.log(`Scraped content length: ${content.length} characters`);
    
    if (content.length < 100) {
      throw new Error('Zbyt mało treści - sprawdź czy strona jest dostępna');
    }
    
    return content;
    
  } catch (error: any) {
    if (error.code === 'ENOTFOUND') {
      throw new Error('Nie można połączyć się ze stroną - sprawdź URL');
    } else if (error.code === 'ETIMEDOUT') {
      throw new Error('Przekroczono czas oczekiwania - strona nie odpowiada');
    } else {
      throw error;
    }
  }
}

/**
 * Instagram scraper
 * Note: Instagram requires authentication for most endpoints
 */
async function scrapeInstagram(url: string): Promise<string> {
  // Instagram Graph API approach (requires access token)
  // For MVP: instrukcja dla użytkownika aby skopiował treść posta
  
  throw new Error(
    'Instagram wymaga autoryzacji. ' +
    'Możliwe rozwiązania:\n' +
    '1. Użyj Instagram Graph API (wymaga Facebook App)\n' +
    '2. Skopiuj ręcznie treść posta i wklej jako tekst\n' +
    '3. Użyj zewnętrznego serwisu (Apify, RapidAPI)'
  );
}

/**
 * YouTube scraper - extract description and transcript
 */
async function scrapeYouTube(url: string): Promise<string> {
  try {
    // Extract video ID
    const videoId = extractYouTubeVideoId(url);
    if (!videoId) {
      throw new Error('Nieprawidłowy URL YouTube');
    }
    
    console.log(`YouTube video ID: ${videoId}`);
    
    // Option 1: Scrape video page (gets description)
    const pageResponse = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      timeout: 15000,
    });
    
    const $ = cheerio.load(pageResponse.data);
    
    // Extract description from meta tags
    let description = $('meta[name="description"]').attr('content') || '';
    
    // Try to find ytInitialData (contains full description)
    const scripts = $('script').toArray();
    for (const script of scripts) {
      const scriptContent = $(script).html() || '';
      if (scriptContent.includes('ytInitialData')) {
        // Extract ytInitialData JSON
        const match = scriptContent.match(/var ytInitialData = ({.+?});/);
        if (match) {
          try {
            const data = JSON.parse(match[1]);
            // Navigate to description (path varies)
            const videoDetails = data?.contents?.twoColumnWatchNextResults?.results?.results?.contents?.[0]?.videoPrimaryInfoRenderer;
            if (videoDetails) {
              description = videoDetails.description?.runs?.map((r: any) => r.text).join('') || description;
            }
          } catch (e) {
            // Ignore JSON parse errors
          }
        }
        break;
      }
    }
    
    console.log(`YouTube description length: ${description.length}`);
    
    if (description.length < 100) {
      throw new Error(
        'Nie znaleziono opisu przepisu w filmie. ' +
        'Upewnij się, że film zawiera szczegółowy opis przepisu.'
      );
    }
    
    return description;
    
  } catch (error: any) {
    console.error('YouTube scrape error:', error);
    throw new Error(`YouTube: ${error.message}`);
  }
}

/**
 * Extract YouTube video ID from various URL formats
 */
function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
    /youtube\.com\/embed\/([^&\n?#]+)/,
    /youtube\.com\/v\/([^&\n?#]+)/,
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}
