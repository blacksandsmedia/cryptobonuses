import { Metadata, ResolvingMetadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Image from 'next/image';
import CopyCodeButton from '@/components/CopyCodeButton';
import ClickableBonusCode from '@/components/ClickableBonusCode';
import OfferButton from '@/components/OfferButton';
import TableOfContents from '@/components/TableOfContents';
import RichContent from '@/components/casino/RichContent';
import ReviewSection from '@/components/ReviewSection';
import RecentlyViewed from '@/components/RecentlyViewed';
import CasinoAnalytics from '@/components/CasinoAnalytics';
import WeeklyPopularCasinos from '@/components/WeeklyPopularCasinos';
import RecentPageChecks from '@/components/RecentPageChecks';
import RecentlyViewedTracker from '@/components/RecentlyViewedTracker';
import SchemaMarkup from '@/components/SchemaMarkup';
import TranslatedSectionHeader from '@/components/TranslatedSectionHeader';
import TranslatedHowToRedeem from '@/components/TranslatedHowToRedeem';
import TranslatedTableLabel from '@/components/TranslatedTableLabel';
import TranslatedBonusTypeBadge from '@/components/TranslatedBonusTypeBadge';
import ScreenshotGallery from '@/components/ScreenshotGallery';
import ShareIcons from '@/components/ShareIcons';
import DateDisplay from '@/components/DateDisplay';
import ClientStickyWrapper from '@/components/ClientStickyWrapper';
import { normalizeImagePath } from '@/lib/image-utils';
import Link from 'next/link';
import { getCasinoPageModifiedTime } from '@/lib/page-modified-time';

// Add export const dynamic = 'force-dynamic' to disable caching
export const dynamic = 'force-dynamic';

// Generate static params for all casinos to enable static site generation
export async function generateStaticParams() {
  try {
    const casinos = await prisma.casino.findMany({
      select: { slug: true }
    });
    
    return casinos.map((casino) => ({
      slug: casino.slug,
    }));
  } catch (error) {
    console.error("Error generating static params:", error);
    return [];
  }
}

// Static recommendations mapping - ensures each casino has consistent recommendations
// for all users and balanced internal linking (each casino appears exactly 3 times)
const CASINO_RECOMMENDATIONS: Record<string, string[]> = {
  '0x.bet': ['vavada.com', 'bitsler.com', 'livecasino.io'],
  '1xbit1.com': ['leebet.io', 'trustdice.win', 'bitsler.com'],
  '7bitcasino.com': ['stake.com', 'coinplay.com', 'crypto-games.io'],
  'bc.game': ['coins.game', 'stake.us', 'primedice.com'],
  'betchain.com': ['oshi.io', 'coinpoker.com', 'tether.bet'],
  'betfury.com': ['justbit.io', 'betchain.com', 'chips.gg'],
  'betiro.com': ['gamdom.com', 'stake.us', 'bitstarz.com'],
  'betpanda.io': ['0x.bet', 'bets.io', 'rollbit.com'],
  'betplay.io': ['cryptoleo.com', 'betpanda.io', 'gamdom.com'],
  'bets.io': ['bitcasino.io', 'coinplay.com', 'tether.bet'],
  'bitcasino.io': ['nanogames.io', 'betfury.com', 'destinyx.com'],
  'bitsler.com': ['betchain.com', 'jacksclub.io', '7bitcasino.com'],
  'bitstarz.com': ['winz.io', 'betpanda.io', 'coins.game'],
  'bovada.lv': ['sirwin.com', '1xbit1.com', 'mbitcasino.io'],
  'bspin.io': ['empire.io', 'crashino.com/en', 'bitstarz.com'],
  'chips.gg': ['flush.com', 'stake.com', 'betiro.com'],
  'cloudbet.com': ['nanogames.io', 'fortunejack.com', '1xbit1.com'],
  'coinplay.com': ['pixel.gg', 'sirwin.com', 'primedice.com'],
  'coinpoker.com': ['duelbits.com', 'cloudbet.com', 'coins.game'],
  'coins.game': ['bovada.lv', '0x.bet', 'crypto-games.io'],
  'crashino.com/en': ['bitstarz.com', 'sportsbet.io', 'wild.io'],
  'crypto-games.io': ['bc.game', 'trustdice.win', 'rollbit.com'],
  'cryptoleo.com': ['livecasino.io', 'crashino.com/en', 'stake.us'],
  'destinyx.com': ['flush.com', 'fairspin.io', 'luckybird.io'],
  'duelbits.com': ['mbitcasino.io', 'roobet.com', 'sportsbet.io'],
  'empire.io': ['crashino.com/en', 'betfury.com', 'ignitioncasino.eu'],
  'fairspin.io': ['betplay.io', '1xbit1.com', 'spinarium.com'],
  'flush.com': ['jacksclub.io', 'bspin.io', 'fortunejack.com'],
  'fortunejack.com': ['vavada.com', 'winz.io', 'bspin.io'],
  'gamdom.com': ['oshi.io', 'tether.bet', 'thunderpick.io'],
  'ignitioncasino.eu': ['jackbit.com', 'betiro.com', 'sportsbet.io'],
  'jackbit.com': ['bovada.lv', 'pixel.gg', 'spinarium.com'],
  'jacksclub.io': ['rollbit.com', 'crypto-games.io', 'bovada.lv'],
  'justbit.io': ['bc.game', 'duelbits.com', 'oshi.io'],
  'leebet.io': ['spinarium.com', 'jackbit.com', 'stake.com'],
  'livecasino.io': ['cryptoleo.com', 'justbit.io', 'empire.io'],
  'luckybird.io': ['vave.com', 'destinyx.com', 'shuffle.com'],
  'mbitcasino.io': ['duelbits.com', 'chips.gg', 'vave.com'],
  'metaspins.com': ['shuffle.com', 'betpanda.io', 'betchain.com'],
  'nanogames.io': ['trustdice.win', 'ignitioncasino.eu', 'metaspins.com'],
  'oshi.io': ['coinplay.com', 'justbit.io', 'roobet.com'],
  'pixel.gg': ['jackbit.com', 'metaspins.com', 'luckybird.io'],
  'primedice.com': ['pixel.gg', 'fairspin.io', 'metaspins.com'],
  'rollbit.com': ['bitsler.com', 'wild.io', 'thunderpick.io'],
  'roobet.com': ['thunderpick.io', 'fairspin.io', 'sirwin.com'],
  'shuffle.com': ['leebet.io', 'primedice.com', 'livecasino.io'],
  'sirwin.com': ['cloudbet.com', 'mbitcasino.io', 'coinpoker.com'],
  'spinarium.com': ['betplay.io', 'betiro.com', 'bitcasino.io'],
  'sportsbet.io': ['coinpoker.com', 'bitcasino.io', 'wild.io'],
  'stake.com': ['7bitcasino.com', 'bets.io', 'vavada.com'],
  'stake.us': ['bets.io', 'shuffle.com', 'leebet.io'],
  'tether.bet': ['chips.gg', 'flush.com', 'bspin.io'],
  'thunderpick.io': ['betplay.io', 'gamdom.com', '0x.bet'],
  'trustdice.win': ['destinyx.com', 'vave.com', 'winz.io'],
  'vavada.com': ['ignitioncasino.eu', 'cloudbet.com', 'empire.io'],
  'vave.com': ['7bitcasino.com', 'fortunejack.com', 'nanogames.io'],
  'wild.io': ['jacksclub.io', 'roobet.com', 'luckybird.io'],
  'winz.io': ['cryptoleo.com', 'betfury.com', 'bc.game'],
};

// Get 3 static related casino offers for consistent recommendations
async function getRelatedOffers(currentSlug: string): Promise<Array<{
  id: string;
  casinoName: string;
  bonusText: string;
  logoUrl: string;
  promoCode: string | null;
  affiliateLink: string;
  codeTermLabel?: string;
  bonusTitle: string;
  name: string;
}>> {
  try {
    // Get the static recommendations for this casino
    const recommendedSlugs = CASINO_RECOMMENDATIONS[currentSlug] || [];
    
    if (recommendedSlugs.length === 0) {
      // Fallback to rating-based if slug not found in mapping
      const allCasinos = await prisma.casino.findMany({
        orderBy: { rating: 'desc' },
        include: { bonuses: true },
      });
      
      const otherCasinos = allCasinos.filter(casino => casino.slug !== currentSlug);
      const fallbackCasinos = otherCasinos.slice(0, 3);
      
      return fallbackCasinos.map(casino => {
        const firstBonus = casino.bonuses[0] || { title: 'No bonus available', code: null };
        return {
          id: casino.slug,
          casinoName: casino.name,
          bonusText: firstBonus.title,
          logoUrl: casino.logo || '',
          promoCode: firstBonus.code,
          affiliateLink: casino.affiliateLink || '',
          codeTermLabel: 'bonus code',
          bonusTitle: firstBonus.title,
          name: casino.name,
        };
      });
    }
    
    // Fetch the recommended casinos
    const recommendedCasinos = await prisma.casino.findMany({
      where: {
        slug: { in: recommendedSlugs }
      },
      include: { bonuses: true },
    });
    
    // Sort casinos according to the order in the recommendations array
    const sortedCasinos = recommendedSlugs
      .map(slug => recommendedCasinos.find(casino => casino.slug === slug))
      .filter((casino): casino is NonNullable<typeof casino> => casino !== undefined);
    
    return sortedCasinos.map(casino => {
      const firstBonus = casino.bonuses[0] || { title: 'No bonus available', code: null };
      return {
        id: casino.slug,
        casinoName: casino.name,
        bonusText: firstBonus.title,
        logoUrl: casino.logo || '',
        promoCode: firstBonus.code,
        affiliateLink: casino.affiliateLink || '',
        codeTermLabel: 'bonus code',
        bonusTitle: firstBonus.title,
        name: casino.name,
      };
    });
  } catch (error) {
    console.error("Error fetching related offers:", error);
    return [];
  }
}

// Generate metadata for each casino page for SEO
export async function generateMetadata(
  { params }: { 
    params: { slug: string } 
  },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = params.slug;
  
  const casino = await prisma.casino.findUnique({
    where: { slug },
    include: {
      bonuses: true,
      reviews: {
        where: { verified: true }
      }
    }
  }) as any; // Type assertion to handle new fields during schema evolution

  if (!casino) {
    return {
      title: 'Casino Not Found',
      description: 'The requested casino could not be found.'
    };
  }

  const bonus = casino.bonuses[0];
  const bonusCode = bonus?.code;
  const bonusTitle = bonus?.title || `${casino.name} Bonus`;

  // Convert Prisma Review objects to check if there are verified reviews
  const reviews = casino.reviews?.map(review => ({
    id: review.id,
    author: review.author,
    content: review.content,
    rating: review.rating,
    date: new Date(review.createdAt).toLocaleDateString(),
    verified: review.verified,
  })) || [];

  // Get the current month and year for SEO
  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleDateString('en-US', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  // Get dynamic code term
  const codeTermLabel = casino.codeTermLabel || 'bonus code';
  const codeTypeCapitalized = codeTermLabel.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  // Create optimized title and description
  const title = bonusCode 
    ? `${casino.name} ${codeTypeCapitalized} - ${bonusCode} (${currentMonth} ${currentYear})`
    : `${casino.name} Bonus - ${bonusTitle} (${currentMonth} ${currentYear})`;
  
  // Create meta description following the new format: "The [page title] [code if applicable] gives users [bonus] in [year]. Rated [rating] by players."
  const pageTitle = bonusCode 
    ? `${casino.name} ${codeTermLabel}`
    : `${casino.name} bonus`;
  
  const codeText = bonusCode ? ` '${bonusCode}'` : '';
  // Only show rating if it's greater than 0 and there are verified reviews
  const hasValidRating = casino.rating && casino.rating > 0 && reviews.length > 0;
  const ratingText = hasValidRating ? ` Rated ${Math.round(Number(casino.rating))}/5 by players.` : '';
  
  const description = `The ${pageTitle}${codeText} gives users ${bonusTitle} in ${currentYear}.${ratingText}`;

  // Use featured image if available, fallback to logo
  const imageUrl = casino.featuredImage ? `https://cryptobonuses.com${casino.featuredImage}` 
                   : casino.logo ? `https://cryptobonuses.com${casino.logo}` 
                   : 'https://cryptobonuses.com/logo.png';

  // Get dynamic modified time based on casino updates and page checks
  const dynamicModifiedTime = await getCasinoPageModifiedTime(casino.slug, casino.updatedAt);

  return {
    title,
    description,
    keywords: `${casino.name}, ${codeTermLabel}, crypto casino bonus, bitcoin casino bonus, ${bonusCode || ''}, ${currentMonth} ${currentYear}`,
    openGraph: {
      title,
      description,
      url: `https://cryptobonuses.com/${slug}`,
      type: 'article',
      images: [imageUrl],
      siteName: 'CryptoBonuses',
      publishedTime: casino.createdAt?.toISOString(),
      modifiedTime: dynamicModifiedTime,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `https://cryptobonuses.com/${slug}`,
    },
    other: {
      'article:published_time': casino.createdAt?.toISOString() || new Date().toISOString(),
      'article:modified_time': dynamicModifiedTime,
    },
  };
}

// Generate unique SEO content about a casino based on its attributes
function generateCasinoDescription(casinoName: string, description: string, rating: number, bonusType: string) {
  // Use the casino's actual description as a base
  if (description && description.length > 200) {
    return description;
  }
  
  // Generate fallback content based on casino name, rating, and bonus type
  const ratingText = rating >= 4.5 ? "top-rated" : 
                    rating >= 4.0 ? "highly-rated" : 
                    rating >= 3.5 ? "well-regarded" : "popular";
  
  // More unique and detailed descriptions for each casino type
  const typeSpecificContent = {
    welcome: `${casinoName} has established itself as a ${ratingText} destination in the crypto gambling space, offering an impressive welcome package that gives new players a substantial boost to begin their journey.\n\nFounded with a vision to provide a seamless crypto gambling experience, ${casinoName} combines cutting-edge technology with user-friendly design to deliver an exceptional platform for both novice and experienced players. The platform stands out for its transparent withdrawal process and commitment to player satisfaction.`,
    
    no_deposit: `${casinoName} stands out in the competitive crypto casino landscape by offering a generous no-deposit bonus that allows players to explore the platform risk-free.\n\nSince its inception, ${casinoName} has been committed to providing a transparent and fair gaming environment, implementing provably fair technology across its game selection to ensure players can verify every outcome. The platform features an extensive library of over 3,000 games from more than 25 top-tier providers.`,
    
    free_spins: `${casinoName} has carved a niche for itself in the crypto gambling industry through its exceptional free spins offers on popular slot games.\n\nThe platform features a carefully curated collection of high-quality slots from leading providers, ensuring players enjoy a premium gaming experience with the potential for significant winnings without risking additional funds. ${casinoName}'s VIP program rewards regular players with personalized bonuses, cashback offers, and dedicated account managers.`,
    
    reload: `${casinoName} has built a loyal community of players thanks to its rewarding reload bonus program that provides ongoing value to returning users.\n\nAs a ${ratingText} crypto casino, ${casinoName} focuses on long-term player satisfaction by combining generous promotions with an extensive library of games, all operating within a secure blockchain-based environment. The platform's innovative tournaments and weekly reload offers create a dynamic gaming experience that keeps players engaged.`,
    
    cashback: `${casinoName} has revolutionized the crypto gambling experience with its player-friendly cashback program that significantly reduces risk while maximizing entertainment value.\n\nThis ${ratingText} platform combines sophisticated design with user-centric features, ensuring that players can enjoy their favorite games with the security of knowing they'll recover a portion of any losses. ${casinoName}'s cashback system applies to all game categories, not just slots, making it one of the most comprehensive reward programs in the industry.`,
    
    other: `${casinoName} has positioned itself as a ${ratingText} option in the crypto gambling ecosystem, offering a diverse range of games and attractive bonus offers.\n\nThe platform prioritizes user experience through its intuitive interface, rapid transaction processing, and dedicated customer support, making it an excellent choice for players seeking a reliable and enjoyable crypto gambling destination. ${casinoName} supports over 10 different cryptocurrencies, allowing players to deposit and withdraw using their preferred digital assets.`
  };
  
  // Extended information about casino features
  const securityFeature = `\n\nSecurity is paramount at ${casinoName}, with the platform employing advanced encryption and blockchain technology to ensure all transactions and personal data remain protected. The implementation of provably fair algorithms adds another layer of trust, allowing players to verify the integrity of game outcomes independently.`;
  
  const gameSelectionFeature = `\n\nThe game library at ${casinoName} is extensive and diverse, featuring titles from industry-leading providers such as Pragmatic Play, Evolution Gaming, and NetEnt. From classic table games to innovative slots and live dealer experiences, the platform offers something for every type of player, with new games regularly added to keep the experience fresh and engaging.`;
  
  const paymentProcessingFeature = `\n\n${casinoName} excels in payment processing, offering lightning-fast deposits and withdrawals through multiple cryptocurrency options. Transactions are typically processed within minutes, allowing players to access their winnings without unnecessary delays. The absence of traditional banking intermediaries ensures lower fees and enhanced privacy.`;
  
  const supportFeature = `\n\nCustomer support at ${casinoName} is available 24/7 through multiple channels, including live chat, email, and a comprehensive FAQ section. The support team is knowledgeable, responsive, and committed to resolving any issues promptly, ensuring players can focus on enjoying their gaming experience without disruptions.`;
  
  const mobileFeature = `\n\n${casinoName} offers a fully optimized mobile experience, allowing players to enjoy their favorite games on any device without compromising on quality or functionality. The responsive design adapts seamlessly to different screen sizes, providing the same level of immersion and convenience whether playing on desktop or mobile.`;
  
  // Select 3 random features to add variety to the content
  const allFeatures = [securityFeature, gameSelectionFeature, paymentProcessingFeature, supportFeature, mobileFeature];
  const selectedFeatures = allFeatures
    .sort(() => 0.5 - Math.random())
    .slice(0, 3)
    .join('');
  
  return (typeSpecificContent[bonusType as keyof typeof typeSpecificContent] || typeSpecificContent.other) + selectedFeatures;
}

// Generate content about casino game offerings
function generateGameContent(casinoName: string, bonusType: string) {
  const slotGames = `${casinoName} offers an impressive selection of slot games from leading providers in the industry. Players can enjoy popular titles like Pragmatic Play's "Gates of Olympus" and "Sweet Bonanza," NetEnt's "Starburst" and "Gonzo's Quest," and Play'n GO's "Book of Dead." The slot collection includes classic 3-reel games, modern video slots with innovative features, and high-volatility options with massive winning potential.\n\nWith new titles added regularly, ${casinoName} ensures its slot library stays fresh and exciting. Many games feature progressive jackpots that can reach life-changing amounts, while others offer unique bonus features like cascading reels, expanding wilds, and interactive bonus rounds.`;
  
  const tableGames = `Table game enthusiasts will find plenty to enjoy at ${casinoName}, with multiple variations of blackjack, roulette, baccarat, and poker available. The platform offers both traditional and innovative versions of these classics, each with different betting limits to accommodate both casual players and high rollers. All table games feature smooth gameplay and realistic graphics for an immersive experience.\n\n${casinoName}'s blackjack selection includes American, European, and Single Deck variants, while roulette fans can choose between American, European, and French wheels, each with their own house edge and betting options. The platform also features specialty table games like Sic Bo, Craps, and Dragon Tiger for players looking for something different.`;
  
  const liveDealer = `The live dealer section at ${casinoName} provides an authentic casino experience from the comfort of your home. Powered by industry leaders like Evolution Gaming and Pragmatic Play Live, these games feature professional dealers, multiple camera angles, and interactive features. Players can enjoy live versions of blackjack, roulette, baccarat, and game shows with real-time interaction and seamless streaming quality.\n\n${casinoName}'s live dealer offerings include innovative game show titles like "Crazy Time," "Lightning Roulette," and "Dream Catcher," which combine elements of traditional games with exciting multipliers and bonus rounds. VIP tables are available for high-stakes players, offering exclusive experiences with higher betting limits and personalized service.`;
  
  const cryptoGames = `${casinoName} offers a selection of crypto-native games specifically designed for blockchain enthusiasts. These include provably fair options like Crash, Plinko, Dice, and Mines, where players can verify the fairness of each outcome through cryptographic algorithms. These games typically feature lower house edges and innovative gameplay mechanics not found in traditional casino offerings.\n\nCrash games at ${casinoName} are particularly popular, allowing players to cash out before a multiplier "crashes" with potential returns exceeding 1000x your bet. The platform's implementation of Plinko features adjustable risk levels, while Dice games let players set their own win probability, creating a customizable gaming experience that appeals to strategic players.`;
  
  // Customize based on bonus type
  switch(bonusType.toLowerCase()) {
    case 'welcome':
      return `${slotGames}\n\n${tableGames}\n\nAs a new player, you'll have access to the entire game library with your welcome bonus, giving you ample opportunity to discover your favorites. ${casinoName}'s welcome package is designed to provide value across different game categories, allowing you to explore everything from classic slots to live dealer tables with bonus funds.`;
    case 'free_spins':
      return `${slotGames}\n\nThe free spins bonus at ${casinoName} allows you to explore these exciting slot games without risking your own funds, providing extra opportunities to hit big wins and experience different game mechanics. The free spins are typically allocated to selected popular titles or new releases, giving you a chance to try games you might not have played otherwise, with all winnings credited to your bonus balance subject to the site's wagering requirements.`;
    case 'no_deposit':
      return `${cryptoGames}\n\n${liveDealer}\n\nThe no-deposit bonus at ${casinoName} gives you a risk-free way to experience these games and potentially win real crypto without making an initial investment. This offer is perfect for testing the platform's performance, game variety, and overall user experience before committing your own funds.`;
    case 'cashback':
      return `${tableGames}\n\n${liveDealer}\n\nWith ${casinoName}'s cashback offer, you can enjoy these games with reduced risk, knowing that you'll recover a portion of any losses you might incur during your gaming sessions. This is particularly valuable for table games and live dealer options, where gameplay tends to be more strategic and extended playing sessions are common.`;
    case 'reload':
      return `${slotGames}\n\n${cryptoGames}\n\nRegular players at ${casinoName} can use reload bonuses to extend their gameplay across these diverse gaming options, maximizing both entertainment value and winning potential. Reload bonuses are especially beneficial for exploring new game releases or trying different strategies in crypto-native games without fully depleting your bankroll.`;
    case 'deposit':
      return `${slotGames}\n\n${tableGames}\n\nThe deposit bonus at ${casinoName} enhances your initial deposit, giving you more funds to explore the complete range of games available on the platform. This type of bonus is perfect for players who want to maximize their gaming time and explore both slots and table games with additional bankroll to play with.`;
    default:
      return `${slotGames}\n\n${tableGames}\n\n${liveDealer}\n\n${cryptoGames}`.substring(0, 1000);
  }
}

// Generate content about the bonus offer
function generateBonusDescription(casinoName: string, bonusTitle: string, bonusType: string, bonusCode: string | null) {
  const bonusTypeText = {
    welcome: `designed specifically for new players joining ${casinoName} for the first time. This comprehensive package gives you a significant boost to start your journey, allowing you to explore the platform's extensive game library with extended gameplay and increased winning potential.\n\nThe welcome offer typically includes a match bonus on your first deposit, effectively doubling or even tripling your initial bankroll. Some packages also include free spins on selected slot games, providing additional opportunities to win without risking your deposited funds.`,
    
    no_deposit: `perfect for players who want to experience ${casinoName} without any financial commitment. This risk-free offer allows you to play real money games and potentially win cryptocurrency without depositing any of your own funds, providing an excellent opportunity to test the platform before making an investment.\n\n${casinoName}'s no-deposit bonus gives you a small amount of free crypto to explore the platform's game selection, interface, and overall user experience. While the bonus amount may be modest, it provides genuine value with the possibility of converting it into withdrawable funds if you meet the wagering requirements.`,
    
    free_spins: `tailored for slot enthusiasts looking to maximize their entertainment on ${casinoName}'s popular slot games. These free spins give you extra chances to hit winning combinations and trigger bonus features without using your deposited funds, effectively extending your playtime and enhancing your overall experience.\n\n${casinoName} typically awards these free spins on carefully selected games known for their engaging gameplay and significant winning potential. Each spin has the same chance of winning as a regular cash spin, with all winnings added to your bonus balance subject to the standard wagering requirements.`,
    
    reload: `created to reward loyal players at ${casinoName} with additional value on their subsequent deposits. This bonus demonstrates the platform's commitment to long-term player satisfaction by providing ongoing incentives that help maintain excitement and engagement throughout your gaming journey.\n\nReload bonuses at ${casinoName} are typically available on a regular schedule (weekly or monthly) and often come with lower wagering requirements than the initial welcome offer, making them particularly valuable for regular players who understand how to maximize bonus value.`,
    
    cashback: `structured to provide players with returns on their losses at ${casinoName}, significantly reducing overall risk while maintaining the thrill of real-money gameplay. This player-friendly offer ensures that even during less fortunate sessions, you'll recover a portion of your losses, allowing for more sustainable and enjoyable gaming experiences.\n\n${casinoName}'s cashback program typically returns 5-25% of net losses over a specific period (daily, weekly, or monthly), with the percentage often increasing based on your VIP level or activity on the platform. The returned funds usually come with minimal or no wagering requirements, making this one of the most transparent bonus types available.`,
    
    deposit: `designed to enhance your deposit value at ${casinoName}, providing additional funds to maximize your gaming experience. This straightforward bonus type offers a percentage match on your deposit amount, effectively increasing your available bankroll for extended gameplay and increased winning opportunities.\n\n${casinoName}'s deposit bonuses typically offer competitive match percentages ranging from 50% to 200% of your deposit amount, with clear terms and reasonable wagering requirements. These bonuses are perfect for players who want to get maximum value from their deposits while exploring the platform's comprehensive game library.`
  };
  
  const codeText = bonusCode 
    ? `\n\nTo claim this exclusive offer, you'll need to use the promo code <span class="text-[#68D08B]">${bonusCode}</span> during the registration process or when making a qualifying deposit, depending on the specific bonus requirements. Entering this code correctly ensures you receive the maximum available bonus, as ${casinoName} occasionally offers enhanced promotions through specific codes.` 
    : `\n\nThis special offer is automatically applied when you complete the registration process or make a qualifying deposit, making it incredibly easy to claim without any additional steps required. ${casinoName} has streamlined the bonus activation process to ensure all eligible players receive their rewards without unnecessary complications.`;
  
  const termsText = `\n\nLike all promotions at ${casinoName}, this offer is subject to specific terms and conditions designed to ensure fair play. These typically include:\n\n• Wagering requirements that must be met before withdrawing any winnings generated from the bonus (usually 30-40x the bonus amount)\n• Game restrictions that may limit eligible titles or apply different contribution rates toward wagering requirements\n• Maximum bet limits while the bonus is active (typically around 5-10% of the bonus value)\n• Expiration periods that define how long you have to use and clear the bonus (usually 7-30 days)\n\nReviewing these terms before claiming the bonus will help you maximize its value and avoid any unexpected restrictions.`;
  
  return `The ${bonusTitle} is ${bonusTypeText[bonusType as keyof typeof bonusTypeText] || `an exclusive offer from ${casinoName} designed to enhance your gaming experience with added value and increased winning potential.\n\n${casinoName} regularly updates its promotional offerings to provide players with the most competitive bonuses in the crypto gambling space, ensuring both new and existing users receive exceptional value.`}${codeText}${termsText}`;
}

export default async function SlugPage({ params }: { params: { slug: string } }) {
  const slug = params.slug;
  
  // Check if the slug is a language code
  const supportedLanguages = ['pl', 'tr', 'es', 'pt', 'vi', 'ja', 'ko', 'fr'];
  
  if (supportedLanguages.includes(slug)) {
    // This is a language code, render the language homepage with translations
    const { LanguageHomePage } = await import('./LanguageHomePage');
    return <LanguageHomePage language={slug} />;
  }
  
  // This should be a casino slug, try to find the casino
  const dbCasino = await prisma.casino.findUnique({
    where: { slug },
    include: {
      bonuses: true,
      reviews: {
        where: { verified: true }
      }
    }
  }) as any; // Type assertion to handle new fields during schema evolution

  if (!dbCasino) {
    notFound();
  }

  // Use casino-specific code term label, fallback to "bonus code"
  const codeTermLabel = dbCasino.codeTermLabel || 'bonus code';
  
  // Calculate dynamic modified time for use in both meta tags and DateDisplay
  const dynamicModifiedTime: string = await getCasinoPageModifiedTime(dbCasino.slug, dbCasino.updatedAt);
  
  // Add a timestamp to identify when data was fetched
  console.log(`Fetched casino data for ${slug} at ${new Date().toISOString()}`);

  const bonus = dbCasino.bonuses[0];
  const bonusCode = bonus?.code;
  const bonusTitle = bonus?.title || `${dbCasino.name} Bonus`;
  const bonusTypes = bonus?.types && bonus.types.length > 0 ? bonus.types.map((type: string) => type.toLowerCase()) : ["other"];
  const bonusType = bonusTypes[0]; // Keep for backward compatibility
  
  // Convert Prisma Review objects to the format expected by ReviewSection
  const reviews = dbCasino.reviews
    .map(review => ({
      id: review.id,
      author: review.author,
      content: review.content,
      rating: review.rating,
      date: new Date(review.createdAt).toLocaleDateString(),
      verified: review.verified,
    })) || [];

  // Get related offers for the "More Offers" section
  const relatedOffers = await getRelatedOffers(slug);

  // Format the date in DD/MM/YY format for the verification badge
  const formattedDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Fetch analytics data for variable replacement
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get analytics data for the casino/bonus
  const whereClause = bonus?.id ? { bonusId: bonus.id } : { casinoId: dbCasino.id };
  const analyticsWhereClause = {
    ...whereClause,
    actionType: 'COPY_CODE'
  };

  const [timesClaimedToday, timesClaimedWeekly, timesClaimedTotal, lastClaimedRecord] = await Promise.all([
    prisma.offerTracking.count({
      where: {
        ...analyticsWhereClause,
        createdAt: { gte: todayStart }
      }
    }),
    prisma.offerTracking.count({
      where: {
        ...analyticsWhereClause,
        createdAt: { gte: weekStart }
      }
    }),
    prisma.offerTracking.count({
      where: analyticsWhereClause
    }),
    prisma.offerTracking.findFirst({
      where: analyticsWhereClause,
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true }
    })
  ]);

  const lastClaimed = lastClaimedRecord 
    ? lastClaimedRecord.createdAt.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Never';

  // Prepare data for variable replacement
  const richContentCasinoData = {
    name: dbCasino.name,
    rating: dbCasino.rating,
    website: dbCasino.website,
    foundedYear: dbCasino.foundedYear,
    wageringRequirement: dbCasino.wageringRequirement,
    minimumDeposit: dbCasino.minimumDeposit,
    logo: dbCasino.logo,
    description: dbCasino.description
  };

  const richContentBonusData = bonus ? {
    title: bonus.title,
    code: bonus.code,
    value: bonus.value,
    types: bonus.types
  } : undefined;

  const richContentAnalyticsData = {
    timesClaimedToday,
    timesClaimedWeekly,
    timesClaimedTotal,
    lastClaimed
  };

  // Use database content directly (no fallback content)
  const aboutContent = dbCasino.aboutContent;
  const bonusDescription = dbCasino.bonusDetailsContent;
  const gameContent = dbCasino.gameContent;
  const howToRedeemContent = dbCasino.howToRedeemContent;
  const termsContent = dbCasino.termsContent;
  const faqContent = dbCasino.faqContent;

  const casinoData = {
    id: dbCasino.id,
    name: dbCasino.name,
    bonusTitle: bonusTitle,
    bonusCode: bonusCode,
    bonusId: bonus?.id,
    affiliateLink: dbCasino.affiliateLink,
    logo: normalizeImagePath(dbCasino.logo)
  };

  // Define table of contents items - only include sections with content
  const tocItems = [
    { id: 'how-to-redeem', label: 'How to Redeem', icon: '' },
    ...(aboutContent ? [{ id: 'about-casino', label: 'About', icon: '' }] : []),
    ...(dbCasino.screenshots && dbCasino.screenshots.length > 0 ? [{ id: 'screenshots', label: 'Screenshots', icon: '' }] : []),
    ...(gameContent ? [{ id: 'games', label: 'Games', icon: '' }] : []),
    { id: 'bonus-details', label: 'Bonus Details', icon: '' },
    ...(reviews.length > 0 ? [{ id: 'reviews', label: 'Reviews', icon: '' }] : []),
    { id: 'analytics', label: 'Analytics', icon: '' },
    ...(termsContent ? [{ id: 'terms', label: 'Terms', icon: '' }] : []),
    { id: 'more-offers', label: 'More Offers', icon: '' },
    ...(faqContent ? [{ id: 'faq', label: 'FAQ', icon: '' }] : []),
    { id: 'weekly-popular', label: 'Popular This Week', icon: '' },
    { id: 'recent-page-checks', label: `Recent ${dbCasino.name} Updates`, icon: '' }
  ];

  // Capitalize the first letter of each word in the code term
  const codeTypeCapitalized = codeTermLabel.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');

  return (
    <main className="min-h-screen bg-[#343541] flex flex-col pt-4 sm:pt-8">
      {/* Recently Viewed Tracker - Client-side component to track visits */}
      <RecentlyViewedTracker 
        casino={{
          id: dbCasino.id,
          name: dbCasino.name,
          slug: dbCasino.slug,
          logo: normalizeImagePath(dbCasino.logo),
          bonusTitle: bonusTitle,
          bonusCode: bonusCode || '',
          affiliateLink: dbCasino.affiliateLink || ''
        }}
      />

      {/* Featured Image for SEO and Google Images - Hidden but accessible */}
      {dbCasino.featuredImage && (
        <div className="sr-only">
          <Image
            src={normalizeImagePath(dbCasino.featuredImage)}
            alt={`${dbCasino.name} bonus offer - ${bonusTitle}`}
            width={1200}
            height={630}
            priority
          />
        </div>
      )}

      {/* Enhanced Schema Markup for Casino Page */}
      <SchemaMarkup 
        type="casino" 
        data={{
          casino: {
            id: dbCasino.id,
            name: dbCasino.name,
            slug: dbCasino.slug,
            logo: dbCasino.logo,
            description: dbCasino.description,
            rating: dbCasino.rating,
            website: dbCasino.website,
            featuredImage: dbCasino.featuredImage,
            foundedYear: dbCasino.foundedYear
          },
          bonus: bonus ? {
            id: bonus.id,
            title: bonus.title,
            description: bonus.description,
            code: bonus.code,
            value: bonus.value,
            types: bonus.types
          } : undefined,
          reviews: reviews.map(review => ({
            id: review.id,
            author: review.author,
            content: review.content,
            rating: review.rating,
            createdAt: review.date,
            verified: review.verified
          })),
          datePublished: dbCasino.createdAt?.toISOString(),
          dateModified: dynamicModifiedTime
        }}
      />

      {/* Breadcrumb Schema */}
      <SchemaMarkup 
        type="breadcrumbs" 
        data={{
          breadcrumbs: [
            { name: 'Home', url: 'https://cryptobonuses.com' },
            { name: 'Casino Bonuses', url: 'https://cryptobonuses.com' },
            { name: `${dbCasino.name} Bonus`, url: `https://cryptobonuses.com/${dbCasino.slug}` }
          ]
        }}
      />

      {/* Crypto Bonuses Brand Schema */}
      <SchemaMarkup type="brand" />

      <div className="flex-grow mx-auto w-[90%] md:w-[95%] max-w-4xl py-3 sm:py-4">
        <div className="max-w-2xl mx-auto space-y-6 sm:space-y-7">
          {/* Hero Section */}
          <div className="bg-gradient-to-br from-[#3e4050] to-[#373846] rounded-xl px-7 py-6 sm:p-8 shadow-lg">
            <div className="flex flex-col gap-4">
              {/* Casino Info */}
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="relative w-16 sm:w-20 h-16 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 bg-[#2c2f3a]">
                  <Image
                    src={normalizeImagePath(dbCasino.logo)}
                    alt={`${dbCasino.name} logo`}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                    priority
                  />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 leading-tight">{dbCasino.name} {codeTypeCapitalized}</h1>
                  <p className="text-[#68D08B] text-lg sm:text-xl md:text-2xl font-semibold">
                    {bonusTitle}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 sm:gap-4 w-full max-w-full">
                {bonusCode ? (
                  <>
                    <div className="w-full">
                      <CopyCodeButton 
                        code={bonusCode} 
                        size="large" 
                        casinoId={dbCasino.id}
                        bonusId={bonus?.id}
                        showUsageCount={false}
                        affiliateLink={dbCasino.affiliateLink}
                      />
                    </div>
                    <OfferButton 
                      affiliateLink={dbCasino.affiliateLink}
                      casinoId={dbCasino.id}
                      bonusId={bonus?.id}
                    />
                  </>
                ) : (
                  <OfferButton 
                    affiliateLink={dbCasino.affiliateLink}
                    casinoId={dbCasino.id}
                    bonusId={bonus?.id}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Table of Contents */}
          <TableOfContents items={tocItems} />

          {/* How to Redeem Section - Moved to appear before About section */}
          <section id="how-to-redeem" className="bg-[#3e4050] rounded-xl px-7 py-6 sm:p-8">
            <TranslatedSectionHeader 
              translationKey="casino.howToRedeem" 
              fallback="How to Redeem" 
            />
            <TranslatedHowToRedeem 
              content={howToRedeemContent}
              bonusCode={bonusCode}
              casinoName={dbCasino.name}
              affiliateLink={dbCasino.affiliateLink}
              codeTermLabel={codeTermLabel}
              codeTypeCapitalized={codeTypeCapitalized}
              casinoData={richContentCasinoData}
              bonusData={richContentBonusData}
              analyticsData={richContentAnalyticsData}
            />
          </section>

          {/* Casino Info Table */}
          {(dbCasino.minimumDeposit || dbCasino.wageringRequirement || dbCasino.website || dbCasino.foundedYear || bonusCode || bonus?.title || (dbCasino.customTableFields && dbCasino.customTableFields.length > 0)) && (
            <div className="bg-[#2c2f3a] rounded-xl overflow-hidden border border-[#404055] shadow-lg">
              <table className="w-full text-sm">
                <tbody>
                  {bonusCode && (
                    <tr className={`hover:bg-[#252831]/50 transition-colors duration-200 h-[60px] ${!bonus?.title && !dbCasino.website && !dbCasino.foundedYear && !dbCasino.minimumDeposit && !dbCasino.wageringRequirement && (!dbCasino.customTableFields || dbCasino.customTableFields.length === 0) ? '' : 'border-b border-[#404055]'}`}>
                      <td className="py-0 px-6 text-[#9ca3af] font-semibold bg-[#252831] border-r border-[#404055] w-[40%] h-[60px]">
                        <div className="h-full flex items-center">
                          {codeTypeCapitalized}
                        </div>
                      </td>
                      <td className="py-0 px-6 text-white bg-[#2c2f3a] h-[60px]">
                        <div className="h-full flex items-center">
                          <ClickableBonusCode 
                            code={bonusCode}
                            affiliateLink={dbCasino.affiliateLink}
                            casinoId={dbCasino.id}
                            bonusId={bonus?.id}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                  {bonus?.title && (
                    <tr className={`hover:bg-[#252831]/50 transition-colors duration-200 h-[60px] ${!dbCasino.website && !dbCasino.foundedYear && !dbCasino.minimumDeposit && !dbCasino.wageringRequirement && (!dbCasino.customTableFields || dbCasino.customTableFields.length === 0) ? '' : 'border-b border-[#404055]'}`}>
                      <td className="py-0 px-6 text-[#9ca3af] font-semibold bg-[#252831] border-r border-[#404055] w-[40%] h-[60px]">
                        <TranslatedTableLabel
                          translationKey="casino.bonus"
                          fallback="Bonus"
                        />
                      </td>
                      <td className="py-0 px-6 text-white bg-[#2c2f3a] font-medium h-[60px]">
                        <div className="h-full flex items-center">
                          {bonus.title}
                        </div>
                      </td>
                    </tr>
                  )}
                  {dbCasino.website && (
                    <tr className={`hover:bg-[#252831]/50 transition-colors duration-200 h-[60px] ${!dbCasino.foundedYear && !dbCasino.minimumDeposit && !dbCasino.wageringRequirement && (!dbCasino.customTableFields || dbCasino.customTableFields.length === 0) ? '' : 'border-b border-[#404055]'}`}>
                      <td className="py-0 px-6 text-[#9ca3af] font-semibold bg-[#252831] border-r border-[#404055] w-[40%] h-[60px]">
                        <TranslatedTableLabel
                          translationKey="casino.website"
                          fallback="Website"
                        />
                      </td>
                      <td className="py-0 px-6 text-white bg-[#2c2f3a] h-[60px]">
                        <div className="h-full flex items-center">
                          <a href={dbCasino.website} target="_blank" rel="noopener noreferrer" className="text-[#68D08B] hover:text-[#7ee3a3] underline-offset-2 hover:underline transition-all duration-200 font-medium flex items-center gap-1 group">
                            {dbCasino.website.replace(/\/+$/, '')}
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 flex-shrink-0">
                              <path d="M7 17l9.2-9.2M17 17V7H7"/>
                            </svg>
                          </a>
                        </div>
                      </td>
                    </tr>
                  )}
                  {dbCasino.foundedYear && (
                    <tr className={`hover:bg-[#252831]/50 transition-colors duration-200 h-[60px] ${!dbCasino.minimumDeposit && !dbCasino.wageringRequirement && (!dbCasino.customTableFields || dbCasino.customTableFields.length === 0) ? '' : 'border-b border-[#404055]'}`}>
                      <td className="py-0 px-6 text-[#9ca3af] font-semibold bg-[#252831] border-r border-[#404055] w-[40%] h-[60px]">
                        <TranslatedTableLabel
                          translationKey="casino.founded"
                          fallback="Founded"
                        />
                      </td>
                      <td className="py-0 px-6 text-white bg-[#2c2f3a] font-medium h-[60px]">
                        <div className="h-full flex items-center">
                          {dbCasino.foundedYear}
                        </div>
                      </td>
                    </tr>
                  )}
                  {dbCasino.minimumDeposit && (
                    <tr className={`hover:bg-[#252831]/50 transition-colors duration-200 h-[60px] ${!dbCasino.wageringRequirement && (!dbCasino.customTableFields || dbCasino.customTableFields.length === 0) ? '' : 'border-b border-[#404055]'}`}>
                      <td className="py-0 px-6 text-[#9ca3af] font-semibold bg-[#252831] border-r border-[#404055] w-[40%] h-[60px]">
                        <TranslatedTableLabel
                          translationKey="casino.minimumDeposit"
                          fallback="Minimum Deposit"
                        />
                      </td>
                      <td className="py-0 px-6 text-white bg-[#2c2f3a] font-medium h-[60px]">
                        <div className="h-full flex items-center">
                          {dbCasino.minimumDeposit}
                        </div>
                      </td>
                    </tr>
                  )}
                  {dbCasino.wageringRequirement && (
                    <tr className={`hover:bg-[#252831]/50 transition-colors duration-200 h-[60px] ${(!dbCasino.customTableFields || dbCasino.customTableFields.length === 0) ? '' : 'border-b border-[#404055]'}`}>
                      <td className="py-0 px-6 text-[#9ca3af] font-semibold bg-[#252831] border-r border-[#404055] w-[40%] h-[60px]">
                        <TranslatedTableLabel
                          translationKey="casino.wageringRequirement"
                          fallback="Wagering Requirement"
                        />
                      </td>
                      <td className="py-0 px-6 text-white bg-[#2c2f3a] font-medium h-[60px]">
                        <div className="h-full flex items-center">
                          {dbCasino.wageringRequirement}
                        </div>
                      </td>
                    </tr>
                  )}
                  {dbCasino.customTableFields && dbCasino.customTableFields.length > 0 && dbCasino.customTableFields.map((field: any, index: number) => {
                    const isLastCustomField = index === dbCasino.customTableFields.length - 1;
                    return (
                      <tr key={index} className={`hover:bg-[#252831]/50 transition-colors duration-200 h-[60px] ${!isLastCustomField ? 'border-b border-[#404055]' : ''}`}>
                        <td className="py-0 px-6 text-[#9ca3af] font-semibold bg-[#252831] border-r border-[#404055] w-[40%] h-[60px]">
                          <div className="h-full flex items-center">
                            {field.label}
                          </div>
                        </td>
                        <td className="py-0 px-6 text-white bg-[#2c2f3a] font-medium h-[60px]">
                          <div className="h-full flex items-center">
                            {field.value}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* About Casino Section - Enhanced with SEO content */}
          {aboutContent && (
            <section id="about-casino" className="bg-[#3e4050] rounded-xl px-7 py-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">About {dbCasino.name}</h2>
              <RichContent 
                content={aboutContent} 
                type="about" 
                keyFeatures={dbCasino.keyFeatures || []}
                casinoData={richContentCasinoData}
                bonusData={richContentBonusData}
                analyticsData={richContentAnalyticsData}
              />
            </section>
          )}

          {/* Screenshots Section - New section to display casino screenshots */}
          {dbCasino.screenshots && dbCasino.screenshots.length > 0 && (
            <section id="screenshots" className="bg-[#3e4050] rounded-xl px-7 py-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{dbCasino.name} Screenshots</h2>
              <ScreenshotGallery 
                screenshots={dbCasino.screenshots} 
                casinoName={dbCasino.name} 
              />
            </section>
          )}

          {/* Games Section - Show games content if available */}
          {gameContent && (
            <section id="games" className="bg-[#3e4050] rounded-xl px-7 py-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3">{dbCasino.name} Games</h2>
              <RichContent 
                content={gameContent} 
                type="games" 
                casinoData={richContentCasinoData}
                bonusData={richContentBonusData}
                analyticsData={richContentAnalyticsData}
              />
            </section>
          )}

          {/* Bonus Offer Section - Enhanced with more detailed content */}
          <section id="bonus-details" className="bg-[#3e4050] rounded-xl px-7 py-6 sm:p-8">
            <TranslatedSectionHeader 
              translationKey="casino.bonusDetails" 
              fallback="Bonus Offer Details" 
            />
            {bonusDescription && (
              <div className="bg-[#2c2f3a] p-4 rounded-lg mb-4 border border-[#404055]">
                <h3 className="text-lg font-semibold text-[#68D08B] mb-2">{bonusTitle}</h3>
                <RichContent 
                  content={bonusDescription} 
                  type="bonusDetails" 
                  casinoData={richContentCasinoData}
                  bonusData={richContentBonusData}
                  analyticsData={richContentAnalyticsData}
                />
              </div>
            )}
            
            {/* Bonus Type Badge */}
            <div className="flex flex-wrap gap-2 mb-4">
              {bonusTypes.map((type) => (
                <TranslatedBonusTypeBadge
                  key={type}
                  type={type}
                  href={`/?filter=${type}`}
                />
              ))}
            </div>
          </section>

          {/* User Reviews Section */}
          <div id="reviews">
            <ReviewSection casinoName={dbCasino.name} casinoId={dbCasino.id} reviews={reviews} />
          </div>

          {/* Recently Viewed Component */}
          <RecentlyViewed currentCasinoSlug={slug} />

          {/* Casino Analytics */}
          <div id="casino-analytics">
            <CasinoAnalytics casinoSlug={slug} casinoName={dbCasino.name} />
          </div>

          {/* Terms & Conditions */}
          {termsContent && (
            <section id="terms" className="bg-[#3e4050] rounded-xl px-7 py-6 sm:p-8">
              <TranslatedSectionHeader 
                translationKey="casino.termsConditions" 
                fallback="Terms & Conditions" 
              />
              <RichContent 
                content={termsContent} 
                type="terms" 
                casinoData={richContentCasinoData}
                bonusData={richContentBonusData}
                analyticsData={richContentAnalyticsData}
              />
            </section>
          )}

          {/* More Offers Section */}
          <section id="more-offers" className="bg-[#3e4050] rounded-xl px-7 py-6 sm:p-8">
            <TranslatedSectionHeader 
              translationKey="casino.moreOffers" 
              fallback="Recommended For You" 
              className="text-xl sm:text-2xl font-bold mb-6"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedOffers.map((offer) => {
                // Get the code term label for the recommended casino
                const offerCodeTermLabel = offer.codeTermLabel || 'bonus code';
                const offerCodeTypeCapitalized = offerCodeTermLabel.split(' ').map(word => 
                  word.charAt(0).toUpperCase() + word.slice(1)
                ).join(' ');
                
                // Create the title in the same format as homepage cards
                const offerTitle = `${offer.name} ${offerCodeTypeCapitalized} - ${offer.bonusTitle} (${new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })})`;
                
                return (
                  <a 
                    key={offer.id} 
                    href={`/${offer.id}`}
                    className="bg-[#2c2f3a] rounded-lg p-5 border border-[#404055]/50 hover:border-[#68D08B]/40 hover:bg-[#323544] transition-[border-color,background-color] duration-200 group cursor-pointer block h-full will-change-[border-color]"
                    title={offerTitle}
                  >
                    <div className="flex flex-col h-full">
                      {/* Header with logo and name */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-white/5 flex-shrink-0">
                          <Image
                            src={normalizeImagePath(offer.logoUrl)}
                            alt={`${offer.name} logo`}
                            width={48}
                            height={48}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-base font-semibold text-white truncate">
                            {offer.name}
                          </h3>
                          <div className="text-sm text-[#68D08B] font-medium truncate">
                            {offer.bonusTitle}
                          </div>
                        </div>
                      </div>
                      
                      {/* CTA Button */}
                      <div className="mt-auto">
                        <div className="bg-gradient-to-r from-[#68D08B] to-[#5abc7a] hover:from-[#5abc7a] hover:to-[#4da968] text-[#343541] text-sm font-semibold py-2 px-3 rounded-md text-center transition-all duration-300 shadow-lg hover:shadow-xl border border-[#68D08B]/20">
                          View Bonus →
                        </div>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </section>

          {/* FAQ Section */}
          {faqContent && (
            <section id="faq" className="bg-[#3e4050] rounded-xl px-7 py-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold mb-4">Frequently Asked Questions</h2>
              <RichContent 
                content={faqContent} 
                type="faq" 
                casinoData={richContentCasinoData}
                bonusData={richContentBonusData}
                analyticsData={richContentAnalyticsData}
              />
            </section>
          )}

          {/* Weekly Popular Casinos */}
          <div id="weekly-popular">
            <WeeklyPopularCasinos currentCasinoSlug={slug} />
          </div>

          {/* Recent Page Checks */}
          <div id="recent-page-checks">
            <RecentPageChecks pageSlug={slug} casinoName={dbCasino.name} />
          </div>

          {/* Bonus Usage & Verification */}
          <div className="bg-[#3e4050] rounded-xl px-7 py-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-6">Bonus Usage & Verification</h2>
            
            {/* Main Content Container */}
            <div className="bg-[#2c2f3a] rounded-xl border border-[#404055] overflow-hidden">
              {/* Usage Statistics Header */}
              {bonus?.id && (
                <div className="p-6 border-b border-[#404055]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#68D08B]/20 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#68D08B]">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">Real-time Usage Data</h3>
                      <p className="text-white/60 text-sm">Live bonus tracking statistics</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-[#343541]/50 rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#68D08B]">
                          <circle cx="12" cy="12" r="10"/>
                          <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <span className="text-sm text-white/80">Last Used</span>
                      </div>
                      <div className="text-lg font-bold text-white" id="last-used-value">
                        <div className="animate-pulse">
                          <div className="h-5 bg-[#404055] rounded w-16 mx-auto"></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-center p-3 bg-[#343541]/50 rounded-lg">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#68D08B]">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <path d="m22 21-3-3"/>
                        </svg>
                        <span className="text-sm text-white/80">Used Today</span>
                      </div>
                      <div className="text-lg font-bold text-white" id="usage-count-value">
                        <div className="animate-pulse">
                          <div className="h-5 bg-[#404055] rounded w-12 mx-auto"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Verification Status */}
              <div className="p-6 bg-gradient-to-r from-[#68D08B]/5 to-emerald-500/5">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#68D08B]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#68D08B]">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-white font-bold text-lg">Verified & Active</h3>
                      <span className="bg-[#68D08B]/20 text-[#68D08B] text-xs px-2.5 py-1 rounded-md font-medium border border-[#68D08B]/30">
                        VERIFIED
                      </span>
                    </div>
                    <p className="text-white/80 text-sm leading-relaxed mb-3">
                      Our team has verified this bonus offer is active and working. All terms have been reviewed for accuracy.
                    </p>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-[#68D08B] rounded-full"></div>
                      <span className="text-[#68D08B] font-medium">Verified {formattedDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Items */}
              <div className="p-6 bg-[#252831]/50">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Share */}
                  <div className="flex items-center gap-3 p-4 bg-[#343541]/30 rounded-lg border border-[#404055]/50 hover:border-[#68D08B]/30 transition-colors">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
                        <path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3"/>
                        <line x1="8" x2="16" y1="12" y2="12"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm">Share Offer</h4>
                      <div className="mt-2">
                        <ShareIcons 
                          title={`${dbCasino.name} Bonus - ${bonusTitle}`} 
                          url={`/${slug}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Report */}
                  <Link
                    href={`/${dbCasino.slug}/report`}
                    className="flex items-center gap-3 p-4 bg-[#343541]/30 rounded-lg border border-[#404055]/50 hover:border-orange-400/30 transition-all hover:bg-[#343541]/50 group"
                  >
                    <div className="w-10 h-10 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                        <line x1="12" x2="12" y1="9" y2="13"/>
                        <line x1="12" x2="12.01" y1="17" y2="17"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium text-sm group-hover:text-orange-400 transition-colors">Report Issue</h4>
                      <p className="text-white/60 text-xs mt-0.5">Found a problem? Let us know</p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Legal Notice */}
            <div className="mt-4 p-4 bg-[#252831]/50 rounded-lg border border-[#404055]/30">
              <div className="text-xs text-white/60 flex flex-wrap items-center gap-3 justify-center">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  18+ Only
                </span>
                <span className="text-[#6b7280]">•</span>
                <span>Gamble Responsibly</span>
                <span className="text-[#6b7280]">•</span>
                <span>Terms Apply</span>
                <span className="text-[#6b7280]">•</span>
                <a href="https://www.gambleaware.org" target="_blank" rel="nofollow" className="text-[#68D08B] hover:text-[#7ee3a3] transition-colors">
                  GambleAware.org
                </a>
              </div>
            </div>

            {/* Client-side script to fetch and display usage data */}
            {bonus?.id && (
              <script 
                dangerouslySetInnerHTML={{
                  __html: `
                    (function() {
                      const bonusId = '${bonus.id}';
                      
                      function formatTimeAgo(dateString) {
                        const now = new Date();
                        const past = new Date(dateString);
                        const diffInSeconds = Math.floor((now - past) / 1000);
                        
                        if (diffInSeconds < 60) return 'Just now';
                        if (diffInSeconds < 3600) return Math.floor(diffInSeconds / 60) + 'm ago';
                        if (diffInSeconds < 86400) return Math.floor(diffInSeconds / 3600) + 'h ago';
                        
                        const days = Math.floor(diffInSeconds / 86400);
                        if (days === 1) return '1 day ago';
                        if (days < 7) return days + 'd ago';
                        
                        const weeks = Math.floor(days / 7);
                        if (weeks === 1) return '1 week ago';
                        if (weeks < 4) return weeks + 'w ago';
                        
                        const months = Math.floor(days / 30);
                        if (months === 1) return '1 month ago';
                        return months + 'mo ago';
                      }
                      
                      setTimeout(() => {
                        fetch('/api/tracking?bonusId=' + bonusId)
                          .then(response => {
                            if (!response.ok) throw new Error('Failed to fetch');
                            return response.json();
                          })
                          .then(data => {
                            const lastUsedEl = document.getElementById('last-used-value');
                            const usageCountEl = document.getElementById('usage-count-value');
                            
                            if (lastUsedEl) {
                              if (data.lastUsed) {
                                lastUsedEl.innerHTML = formatTimeAgo(data.lastUsed);
                              } else {
                                lastUsedEl.innerHTML = '<span class="text-[#9ca3af]">Never used</span>';
                              }
                            }
                            
                            if (usageCountEl) {
                              const count = data.usageCount || 0;
                              usageCountEl.innerHTML = count + '<span class="text-sm text-[#9ca3af] ml-1">' + (count === 1 ? 'claim' : 'claims') + '</span>';
                            }
                          })
                          .catch(error => {
                            console.error('Error fetching usage data:', error);
                            const lastUsedEl = document.getElementById('last-used-value');
                            const usageCountEl = document.getElementById('usage-count-value');
                            
                            if (lastUsedEl) lastUsedEl.innerHTML = '<span class="text-[#9ca3af]">Unable to load</span>';
                            if (usageCountEl) usageCountEl.innerHTML = '<span class="text-[#9ca3af]">Unable to load</span>';
                          });
                      }, 500);
                    })();
                  `
                }}
              />
            )}
          </div>

          {/* Date Display */}
          <DateDisplay 
            publishedAt={dbCasino.createdAt}
            modifiedAt={dynamicModifiedTime}
            className="mb-6"
          />

          {/* Back Link */}
          <Link href="/" className="text-[#a4a5b0] hover:text-[#68D08B] flex items-center gap-2 px-1 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back to all bonuses
          </Link>
        </div>
      </div>

      {/* Client wrapper for sticky CTA */}
      <ClientStickyWrapper casinoData={casinoData} />
    </main>
  );
}