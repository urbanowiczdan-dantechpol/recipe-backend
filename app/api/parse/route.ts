import { NextRequest, NextResponse } from 'next/server';
import { parseRecipe } from '@/lib/openai';
import { scrapeContent } from '@/lib/scraper';

export const maxDuration = 60; // 60 seconds timeout (dla Vercel Pro)

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse request body
    const body = await request.json();
    const { url } = body;
    
    console.log(`[${new Date().toISOString()}] Parse request received: ${url}`);
    
    // Validation
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL jest wymagany' },
        { status: 400 }
      );
    }
    
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return NextResponse.json(
        { error: 'Nieprawidłowy format URL - użyj http:// lub https://' },
        { status: 400 }
      );
    }
    
    // Step 1: Scrape content from URL
    console.log('Step 1: Scraping content...');
    const content = await scrapeContent(url);
    
    if (!content || content.length < 50) {
      return NextResponse.json(
        { error: 'Nie udało się pobrać treści ze strony - sprawdź URL' },
        { status: 400 }
      );
    }
    
    console.log(`Content extracted: ${content.length} characters`);
    
    // Step 2: Parse with OpenAI
    console.log('Step 2: Parsing with AI...');
    const recipe = await parseRecipe(content, url);
    
    const duration = Date.now() - startTime;
    console.log(`Recipe parsed successfully in ${duration}ms: "${recipe.title}"`);
    
    // Step 3: Return unified recipe
    const response = NextResponse.json({
      ...recipe,
      _meta: {
        processing_time_ms: duration,
        content_length: content.length,
      }
    }, { status: 200 });
    
    // CORS headers
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    return response;
    
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error(`[ERROR after ${duration}ms]:`, error.message);
    
    const response = NextResponse.json(
      { 
        error: error.message || 'Wystąpił błąd podczas przetwarzania przepisu',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
    
    // CORS headers even for errors
    response.headers.set('Access-Control-Allow-Origin', '*');
    
    return response;
  }
}

// Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
