const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Content generation functions (same as in admin)
function generateAboutContent(casinoName, bonusType) {
  const ratingText = "popular";
  
  const typeSpecificContent = {
    WELCOME: `${casinoName} has established itself as a ${ratingText} destination in the crypto gambling space, offering an impressive welcome package that gives new players a substantial boost to begin their journey.

Founded with a vision to provide a seamless crypto gambling experience, ${casinoName} combines cutting-edge technology with user-friendly design to deliver an exceptional platform for both novice and experienced players. The platform stands out for its transparent withdrawal process and commitment to player satisfaction.

💰 Accepts Bitcoin and other cryptocurrencies
🔒 Secure transactions with blockchain technology
🎮 Wide selection of provably fair games
⚡ Fast withdrawals with minimal processing time`,
    
    NO_DEPOSIT: `${casinoName} stands out in the competitive crypto casino landscape by offering a generous no-deposit bonus that allows players to explore the platform risk-free.

Since its inception, ${casinoName} has been committed to providing a transparent and fair gaming environment, implementing provably fair technology across its game selection to ensure players can verify every outcome. The platform features an extensive library of over 3,000 games from more than 25 top-tier providers.

🌐 Available worldwide with few country restrictions
📱 Mobile-friendly platform for on-the-go play
🎁 Regular promotions and loyalty rewards
🔄 Instant deposits with no processing fees`,
    
    FREE_SPINS: `${casinoName} has carved a niche for itself in the crypto gambling industry through its exceptional free spins offers on popular slot games.

The platform features a carefully curated collection of high-quality slots from leading providers, ensuring players enjoy a premium gaming experience with the potential for significant winnings without risking additional funds.

🎰 High-quality slots from leading providers
🎯 Specialized crypto games with low house edge
💬 24/7 customer support via multiple channels
🎮 Premium gaming experience with winning potential`,
    
    RELOAD: `${casinoName} has built a loyal community of players thanks to its rewarding reload bonus program that provides ongoing value to returning users.

As a ${ratingText} crypto casino, ${casinoName} focuses on long-term player satisfaction by combining generous promotions with an extensive library of games, all operating within a secure blockchain-based environment.

🔄 Regular reload bonuses for loyal players
🎁 Extensive library of games
🏆 VIP programs and tournaments
💰 Competitive promotions`,
    
    CASHBACK: `${casinoName} has revolutionized the crypto gambling experience with its player-friendly cashback program that significantly reduces risk while maximizing entertainment value.

This ${ratingText} platform combines sophisticated design with user-centric features, ensuring that players can enjoy their favorite games with the security of knowing they'll recover a portion of any losses.

💸 Player-friendly cashback program
🛡️ Risk reduction features
🎮 Comprehensive game categories
💯 Transparent bonus terms`
  };
  
  return typeSpecificContent[bonusType] || typeSpecificContent.WELCOME;
}

function generateHowToRedeemContent(casinoName, hasCode = false, website = '', affiliateLink = '') {
  if (hasCode) {
    // For casinos WITH bonus codes
    return `**Copy bonus code**
Click on the ${casinoName} code to copy it

**Visit the site**
${affiliateLink 
  ? `Open the [${casinoName} website](${affiliateLink}) and sign up for an account with the code`
  : `Open the ${casinoName} website and sign up for an account with the code`}

**Follow steps to unlock reward**
Complete the registration and deposit process to receive your bonus`;
  } else {
    // For casinos WITHOUT bonus codes
    return `**Redeem the bonus**
Click the ${casinoName} 'Get Bonus' button

**Create an account**
${affiliateLink
  ? `Sign up on the [${casinoName} website](${affiliateLink})`
  : `Sign up on the ${casinoName} website`}

**Follow steps to unlock reward**
Complete the requirements to receive your ${casinoName} bonus`;
  }
}

function generateBonusDetailsContent(casinoName, bonusTitle, bonusType) {
  return `This exclusive ${bonusType.toLowerCase().replace('_', ' ')} package is designed to give players the best possible start at ${casinoName}. The bonus provides substantial additional funds to explore our extensive game library and maximize your winning potential.

Bonus Breakdown:
• Match Percentage: Up to 200% on your first deposit
• Maximum Bonus: Varies by deposit amount
• Minimum Deposit: 0.001 BTC or equivalent
• Wagering Requirement: 35x bonus amount
• Valid For: 30 days from activation

Eligible Games:
• Slots: 100% contribution toward wagering
• Table Games: 10% contribution toward wagering
• Live Dealer: 10% contribution toward wagering
• Crypto Games: 50% contribution toward wagering

Please note that some games may be restricted while bonus funds are active. Check the full terms and conditions for complete details.`;
}

function generateGameContent(casinoName) {
  return `${casinoName} offers an impressive selection of over 3,000 games from the industry's leading providers, ensuring there's something for every type of player.

🎰 Slot Games
Our slot collection features the latest releases and classic favorites from top providers including:
• Pragmatic Play: Gates of Olympus, Sweet Bonanza, The Dog House
• NetEnt: Starburst, Gonzo's Quest, Dead or Alive 2
• Play'n GO: Book of Dead, Reactoonz, Fire Joker
• Microgaming: Mega Moolah, Immortal Romance, Thunderstruck II

🃏 Table Games
Experience the thrill of classic casino games with multiple variants:
• Blackjack: Classic, European, Single Deck, and more
• Roulette: American, European, French, and Lightning variants
• Baccarat: Punto Banco, Mini Baccarat, Speed Baccarat
• Poker: Caribbean Stud, Three Card Poker, Casino Hold'em

🎮 Crypto-Native Games
Unique blockchain-based games designed specifically for crypto players:
• Crash: Watch the multiplier rise and cash out before it crashes
• Plinko: Drop balls through pegs for random multipliers
• Dice: Simple yet exciting with customizable odds
• Mines: Navigate a minefield for increasing rewards

🎥 Live Dealer Games
Immersive live casino experience with professional dealers:
• Live Blackjack with multiple tables and betting limits
• Live Roulette including Lightning and Immersive variants
• Live Baccarat with squeeze and speed options
• Game Shows like Crazy Time, Dream Catcher, and Monopoly Live`;
}

function generateTermsContent(casinoName) {
  return `This bonus offer is subject to the following terms and conditions. Please read carefully before claiming:

General Terms:
• This offer is available to new players only, one per household/IP address
• Players must be 18 years or older to participate
• Bonus funds cannot be withdrawn until wagering requirements are met
• Maximum bet while bonus is active: $5 USD equivalent
• Bonus expires 30 days after activation if wagering is not completed

Wagering Requirements:
• Bonus amount must be wagered 35 times before withdrawal
• Different games contribute differently toward wagering (see bonus details)
• Wagering must be completed within 30 days of bonus activation
• Only real money bets count toward wagering requirements

Restricted Activities:
• Betting on opposite outcomes in the same game is prohibited
• Using betting strategies that guarantee profit is not allowed
• Bonus abuse or fraudulent activity will result in bonus forfeiture

⚠️ Important: ${casinoName} reserves the right to modify or cancel this promotion at any time. For complete terms and conditions, please visit our website.`;
}

function generateFAQContent(casinoName) {
  return `How do I claim the bonus at ${casinoName}?
Simply click the "Get Bonus" button, create your account, make a qualifying deposit, and the bonus will be automatically credited to your account. Make sure to enter any required promo code during the deposit process.

What cryptocurrencies does ${casinoName} accept?
${casinoName} accepts major cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), Litecoin (LTC), Bitcoin Cash (BCH), Dogecoin (DOGE), and several others. Check the deposit page for the complete list of supported currencies.

Are the games at ${casinoName} fair?
Yes, ${casinoName} uses provably fair technology for many of its games, allowing players to verify the fairness of each game outcome. Additionally, all slot games use certified Random Number Generators (RNGs) to ensure fair play.

How long does it take to withdraw winnings from ${casinoName}?
Cryptocurrency withdrawals at ${casinoName} are typically processed within minutes once approved, though the actual time for the funds to reach your wallet depends on blockchain network congestion. Before withdrawing, ensure you've completed any verification requirements and met all bonus wagering conditions to avoid delays.

Is ${casinoName} available in my country?
${casinoName} is available in many countries worldwide, though restrictions may apply in certain jurisdictions. As a crypto casino, it generally offers wider accessibility than traditional online casinos. However, it's your responsibility to verify that online gambling is legal in your location before registering.`;
}

async function regenerateContentForAllCasinos() {
  try {
    console.log('Starting content regeneration for all casinos...');
    
    // Get all casinos with their bonuses
    const casinos = await prisma.casino.findMany({
      include: {
        bonuses: true
      }
    });
    
    console.log(`Found ${casinos.length} casinos to update`);
    
    for (const casino of casinos) {
      try {
        console.log(`Updating content for: ${casino.name}`);
        
        // Get first bonus for type determination
        const firstBonus = casino.bonuses[0];
        const bonusType = firstBonus?.type || 'WELCOME';
        const bonusTitle = firstBonus?.title || 'Welcome Bonus';
        
        // Generate fresh content
        const contentUpdate = {
          aboutContent: generateAboutContent(casino.name, bonusType),
          howToRedeemContent: generateHowToRedeemContent(
            casino.name, 
            !!firstBonus?.code, 
            casino.website || '', 
            casino.affiliateLink || ''
          ),
          bonusDetailsContent: generateBonusDetailsContent(casino.name, bonusTitle, bonusType),
          gameContent: generateGameContent(casino.name),
          termsContent: generateTermsContent(casino.name),
          faqContent: generateFAQContent(casino.name)
        };
        
        // Update casino with new content
        await prisma.casino.update({
          where: { id: casino.id },
          data: contentUpdate
        });
        
        console.log(`✓ Updated content for ${casino.name}`);
        
      } catch (error) {
        console.error(`✗ Failed to update ${casino.name}:`, error.message);
      }
    }
    
    console.log('Content regeneration completed!');
    
  } catch (error) {
    console.error('Error during content regeneration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function regenerateContentForSpecificCasino(slug) {
  try {
    console.log(`Regenerating content for casino with slug: ${slug}`);
    
    const casino = await prisma.casino.findUnique({
      where: { slug },
      include: {
        bonuses: true
      }
    });
    
    if (!casino) {
      console.error(`Casino with slug "${slug}" not found`);
      return;
    }
    
    // Get first bonus for type determination
    const firstBonus = casino.bonuses[0];
    const bonusType = firstBonus?.type || 'WELCOME';
    const bonusTitle = firstBonus?.title || 'Welcome Bonus';
    
    // Generate fresh content
    const contentUpdate = {
      aboutContent: generateAboutContent(casino.name, bonusType),
      howToRedeemContent: generateHowToRedeemContent(
        casino.name, 
        !!firstBonus?.code, 
        casino.website || '', 
        casino.affiliateLink || ''
      ),
      bonusDetailsContent: generateBonusDetailsContent(casino.name, bonusTitle, bonusType),
      gameContent: generateGameContent(casino.name),
      termsContent: generateTermsContent(casino.name),
      faqContent: generateFAQContent(casino.name)
    };
    
    // Update casino with new content
    await prisma.casino.update({
      where: { id: casino.id },
      data: contentUpdate
    });
    
    console.log(`✓ Successfully updated content for ${casino.name}`);
    
  } catch (error) {
    console.error('Error during specific casino content regeneration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Main function
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length > 0) {
    // Regenerate for specific casino
    const slug = args[0];
    await regenerateContentForSpecificCasino(slug);
  } else {
    // Regenerate for all casinos
    await regenerateContentForAllCasinos();
  }
}

// Run the script
main().catch(console.error); 