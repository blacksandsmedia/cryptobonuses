import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim().length < 2) {
      return NextResponse.json({ results: [] });
    }

    const searchTerm = query.trim().toLowerCase();
    
    // Search casinos by name, description, or slug
    const casinos = await prisma.casino.findMany({
      where: {
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          {
            slug: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        description: true,
        rating: true
      },
      orderBy: [
        { rating: 'desc' },
        { name: 'asc' }
      ],
      take: 5 // Reduced to make room for bonus results
    });

    // Search bonuses by title, description, or code
    const bonuses = await prisma.bonus.findMany({
      where: {
        OR: [
          {
            title: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          {
            code: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          }
        ]
      },
      include: {
        casino: {
          select: {
            id: true,
            name: true,
            slug: true,
            logo: true
          }
        }
      },
      orderBy: [
        { title: 'asc' }
      ],
      take: 5 // Limit bonus results
    });

    // Format casino results
    const casinoResults = casinos.map(casino => ({
      id: casino.id,
      name: casino.name,
      slug: casino.slug,
      logo: casino.logo,
      type: 'casino' as const,
      description: casino.description && casino.description.length > 100 
        ? casino.description.substring(0, 100) + '...'
        : casino.description || `View ${casino.name} bonuses and offers`
    }));

    // Format bonus results
    const bonusResults = bonuses.map(bonus => ({
      id: bonus.id,
      name: bonus.code ? `${bonus.title} - ${bonus.code}` : bonus.title,
      slug: bonus.casino.slug,
      logo: bonus.casino.logo,
      type: 'bonus' as const,
      description: bonus.description && bonus.description.length > 80
        ? bonus.description.substring(0, 80) + '...'
        : bonus.description || `${bonus.value} bonus from ${bonus.casino.name}`,
      casinoName: bonus.casino.name,
      bonusCode: bonus.code,
      bonusValue: bonus.value
    }));

    // Combine and sort results (casinos first, then bonuses)
    const allResults = [...casinoResults, ...bonusResults];

    return NextResponse.json({ 
      results: allResults,
      query: searchTerm,
      counts: {
        casinos: casinoResults.length,
        bonuses: bonusResults.length
      }
    });
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json(
      { error: 'Search failed', results: [] },
      { status: 500 }
    );
  }
} 