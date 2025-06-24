import { CasinoBonus, Review } from '@/types/casino';

// Map casino IDs to their logo URLs
const logoMap: { [key: string]: string } = {
  'bcgame': 'data:image/png;base64,...', // BC Game logo
  'stake': 'data:image/png;base64,...',  // Stake logo
  'bitstarz': 'data:image/png;base64,...', // Bitstarz logo
  // ... add all other logos
};

export const casinoBonuses: CasinoBonus[] = [
  {
    id: 'bcgame',
    casinoName: 'BC Game',
    bonusType: 'other',
    bonusValue: 5,
    bonusText: '5 BTC + $220K',
    logoUrl: '/images/BCGame Logo.png',
    promoCode: 'BCBONUS',
    affiliateLink: 'https://bc.game/?i=bcbonus&s=&c=&utm_source=bcbonus#/login/regist',
    isActive: true,
    reviews: []
  },
  {
    id: 'stake',
    casinoName: 'Stake',
    bonusType: 'free',
    bonusValue: 2000,
    bonusText: '$2K FREE',
    logoUrl: '/images/Stake Logo.png',
    promoCode: 'TOPBONUS',
    affiliateLink: 'https://stake.com/join?entry=EN200DB&offer=TOPBONUS',
    isActive: true,
    reviews: []
  },
  {
    id: 'bitstarz',
    casinoName: 'Bitstarz',
    bonusType: 'other',
    bonusValue: 5,
    bonusText: '5 BTC + 205 FS',
    logoUrl: '/images/BitStarz Logo.png',
    promoCode: 'TOPBONUS',
    affiliateLink: 'https://bs4.direct/b84efcabb',
    isActive: true,
    reviews: []
  },
  {
    id: 'wild-io',
    casinoName: 'Wild.io',
    bonusType: 'deposit',
    bonusValue: 10000,
    bonusText: '$10K + 300 FS',
    logoUrl: '/images/WildIO Logo.png',
    promoCode: 'TOPBONUS',
    affiliateLink: 'https://wildpartners.app/a239cca7a',
    isActive: true
  },
  {
    id: 'winz-io',
    casinoName: 'Winz.io',
    bonusType: 'deposit',
    bonusValue: 5000,
    bonusText: 'WIN $5K',
    logoUrl: '/images/WinzIO Logo.png',
    promoCode: 'WBONUS',
    affiliateLink: '',
    isActive: true
  },
  {
    id: 'betplay-io',
    casinoName: 'Betplay.io',
    bonusType: 'other',
    bonusValue: 1000,
    bonusText: '1,000 USDT',
    logoUrl: '/images/BetplayIO Logo.png',
    affiliateLink: '',
    isActive: true
  },
  {
    id: 'justbit',
    casinoName: 'Justbit',
    bonusType: 'free_spins',
    bonusValue: 750,
    bonusText: '€750 + 75 FS',
    logoUrl: '/images/Justbit Logo.png',
    affiliateLink: 'https://trackingjustbit.io/d8b8f3d14',
    isActive: true
  },
  {
    id: 'betfury',
    casinoName: 'BetFury',
    bonusType: 'deposit',
    bonusValue: 590,
    bonusText: '590% + 225 FS',
    logoUrl: '/images/BetFury Logo.png',
    promoCode: 'BFBONUS',
    affiliateLink: 'https://betfury.bet/d2dc9547f',
    isActive: true
  },
  {
    id: 'gamdom',
    casinoName: 'Gamdom',
    bonusType: 'free',
    bonusValue: 0,
    bonusText: 'FREE CHEST',
    logoUrl: '/images/Gamdom Logo.png',
    promoCode: 'bonusvip',
    affiliateLink: 'https://gamdom.com/r/bonusvip',
    isActive: true
  },
  {
    id: 'shuffle',
    casinoName: 'Shuffle.com',
    bonusType: 'deposit',
    bonusValue: 1000,
    bonusText: '$1K',
    logoUrl: '/images/Shufflecom Logo.png',
    promoCode: 'SBONUS',
    affiliateLink: '',
    isActive: true
  },
  {
    id: 'fortunejack',
    casinoName: 'FortuneJack',
    bonusType: 'other',
    bonusValue: 6.5,
    bonusText: '6.5 BTC + 350 FS',
    logoUrl: '/images/FortuneJack Logo.png',
    promoCode: 'JACKPOT',
    affiliateLink: 'https://tracker-pm2.fortunejackpartners.com/link?btag=3849227_238091',
    isActive: true
  },
  {
    id: 'jackbit',
    casinoName: 'Jackbit',
    bonusType: 'free_spins',
    bonusValue: 100,
    bonusText: '100 FREE SPINS',
    logoUrl: '/images/Jackbit Logo.png',
    promoCode: 'JACKPROMO',
    affiliateLink: 'https://go.affision.com/visit/?bta=41345&brand=jackbit',
    isActive: true
  },
  {
    id: 'mbit',
    casinoName: 'mBit Casino',
    bonusType: 'other',
    bonusValue: 1,
    bonusText: '1 BTC + 100 FS',
    logoUrl: '/images/mBitCasino Logo.png',
    affiliateLink: '',
    isActive: true
  },
  {
    id: 'flush',
    casinoName: 'Flush.com',
    bonusType: 'deposit',
    bonusValue: 1500,
    bonusText: '$1.5K (150%)',
    logoUrl: '/images/FlushCasino Logo.png',
    affiliateLink: '',
    isActive: true
  },
  {
    id: 'coins-game',
    casinoName: 'Coins.Game',
    bonusType: 'deposit',
    bonusValue: 1000,
    bonusText: '$1K + 200 FS',
    logoUrl: '/images/CoinsGame Logo.png',
    promoCode: 'TOPBONUS',
    affiliateLink: 'https://coinsaffs.com/d3c3b30b1',
    isActive: true
  },
  {
    id: 'oshi',
    casinoName: 'Oshi Casino',
    bonusType: 'deposit',
    bonusValue: 100,
    bonusText: '100% + 200 FS',
    logoUrl: '/images/OshiCasino Logo.png',
    affiliateLink: '',
    isActive: true
  },
  {
    id: 'vavada',
    casinoName: 'Vavada',
    bonusType: 'deposit',
    bonusValue: 1000,
    bonusText: '$1K + 100 FS',
    logoUrl: '/images/Vavada Logo.png',
    affiliateLink: 'https://vavadacompartner.com/?promo=fc0bae64-a9d7-4d7a-bf57-69eeb7705462&target=register',
    isActive: true
  },
  {
    id: 'coinplay',
    casinoName: 'Coinplay',
    bonusType: 'deposit',
    bonusValue: 125,
    bonusText: '125% + 40 FS',
    logoUrl: '/images/Coinplay Logo.png',
    promoCode: 'START',
    affiliateLink: 'https://promotioncoinplay.com/L?tag=d_2100567m_57509c_START&site=2100567&ad=57509',
    isActive: true
  },
  {
    id: 'stake-us',
    casinoName: 'Stake.us',
    bonusType: 'other',
    bonusValue: 250000,
    bonusText: '250K GC + $25',
    logoUrl: '/images/StakeUS Logo.png',
    promoCode: 'SBONUS',
    affiliateLink: 'https://stake.us/?c=CCODES',
    isActive: true
  },
  {
    id: 'rollbit',
    casinoName: 'Rollbit',
    bonusType: 'other',
    bonusValue: 85,
    bonusText: '85% REWARDS',
    logoUrl: '/images/Rollbit Logo.png',
    promoCode: 'RBONUS',
    affiliateLink: 'https://rollbit.com/referral/RBONUS',
    isActive: true
  },
  {
    id: 'duelbits',
    casinoName: 'Duelbits',
    bonusType: 'other',
    bonusValue: 0,
    bonusText: 'VIP CLUB',
    logoUrl: '/images/Duelbits Logo.png',
    promoCode: 'bigbonus',
    affiliateLink: 'https://affiliates.duelbits.com/visit/?bta=35091&brand=duelbits',
    isActive: true
  },
  {
    id: 'roobet',
    casinoName: 'Roobet',
    bonusType: 'rakeback',
    bonusValue: 20,
    bonusText: '20% CASHBACK',
    logoUrl: '/images/Roobet Logo.png',
    promoCode: 'rbonus',
    affiliateLink: 'https://roobet.com/?ref=rbonus',
    isActive: true
  },
  {
    id: 'betchain',
    casinoName: 'BetChain',
    bonusType: 'free_spins',
    bonusValue: 25,
    bonusText: '25 FREE SPINS',
    logoUrl: '/images/BetChain Logo.png',
    affiliateLink: 'https://betchainmedia.com/a6d33a609',
    isActive: true
  },
  {
    id: '7bit',
    casinoName: '7Bit Casino',
    bonusType: 'other',
    bonusValue: 5,
    bonusText: '5 BTC + 200 FS',
    logoUrl: '/images/7BitCasino Logo.png',
    promoCode: 'TOPBONUS',
    affiliateLink: 'https://7bit.partners/a540ad78e',
    isActive: true
  },
  {
    id: 'cryptoleo',
    casinoName: 'CryptoLeo',
    bonusType: 'other',
    bonusValue: 2500,
    bonusText: '2,500 USDT',
    logoUrl: '/images/CryptoLeoCasino Logo.png',
    affiliateLink: 'https://track.chillipartners.com/visit/?bta=36797&nci=5507',
    isActive: true
  },
  {
    id: 'primedice',
    casinoName: 'Primedice',
    bonusType: 'rakeback',
    bonusValue: 0,
    bonusText: 'RAKEBACK',
    logoUrl: '/images/Primedice Logo.png',
    affiliateLink: 'https://primedice.com/?c=fYGL9uId',
    isActive: true
  },
  {
    id: '1xbit',
    casinoName: '1xBit',
    bonusType: 'other',
    bonusValue: 7,
    bonusText: '7 BTC',
    logoUrl: '/images/1xBit Logo.png',
    promoCode: '1XBONUS',
    affiliateLink: 'https://refpa9063395.top/L?tag=b_2101147m_3425c_1XBONUS&site=2101147&ad=3425&r=registration/',
    isActive: true
  },
  {
    id: 'sportsbet',
    casinoName: 'Sportsbet.io',
    bonusType: 'other',
    bonusValue: 1.5,
    bonusText: '1.5 BTC',
    logoUrl: '/images/SportsbetIO Logo.png',
    affiliateLink: 'https://aff.partners.io/visit/?bta=1384&nci=5627',
    isActive: true
  },
  {
    id: 'chips-gg',
    casinoName: 'Chips.gg',
    bonusType: 'deposit',
    bonusValue: 2000,
    bonusText: '$2K',
    logoUrl: '/images/ChipsGG Logo.png',
    promoCode: 'vipbonus',
    affiliateLink: 'https://chips.gg/?r=vipbonus',
    isActive: true
  },
  {
    id: 'bspin',
    casinoName: 'Bspin',
    bonusType: 'other',
    bonusValue: 1,
    bonusText: '1 BTC + 20 FS',
    logoUrl: '/images/Bspin Logo.png',
    affiliateLink: 'https://bspin.io/?pid=7ed77',
    isActive: true
  },
  {
    id: 'metaspins',
    casinoName: 'Metaspins',
    bonusType: 'other',
    bonusValue: 1,
    bonusText: '1 BTC + 60% BACK',
    logoUrl: '/images/MetaspinsCasino Logo.png',
    affiliateLink: 'https://metamedialinks.com/e1a8f2b08',
    isActive: true
  },
  {
    id: 'ignition',
    casinoName: 'Ignition Casino',
    bonusType: 'free',
    bonusValue: 0,
    bonusText: 'FREE BTC',
    logoUrl: '/images/IgnitionCasino Logo.png',
    affiliateLink: 'https://record.revenuenetwork.com/_irjOUZ76Mydc9zZIk0ytdGNd7ZgqdRLk/1/',
    isActive: true
  },
  {
    id: 'bovada',
    casinoName: 'Bovada',
    bonusType: 'other',
    bonusValue: 3750,
    bonusText: '$3,750 BTC',
    logoUrl: '/images/Bovada Logo.png',
    affiliateLink: 'https://record.revenuenetwork.com/_irjOUZ76Myf-jkIYC6YAF2Nd7ZgqdRLk/1/',
    isActive: true
  },
  {
    id: 'thunderpick',
    casinoName: 'Thunderpick',
    bonusType: 'other',
    bonusValue: 5,
    bonusText: '5% + VIP',
    logoUrl: '/images/Thunderpick Logo.png',
    affiliateLink: 'https://go.thunder.partners/visit/?bta=35404&nci=5560&campaign=WELCOME&utm_campaign=ccodes',
    isActive: true
  },
  {
    id: 'trustdice',
    casinoName: 'TrustDice',
    bonusType: 'other',
    bonusValue: 3,
    bonusText: '3 BTC + 25 FS',
    logoUrl: '/images/TrustDice Logo.png',
    promoCode: 'bigbonus457297',
    affiliateLink: 'https://trustdice.win?ref=bigbonus457297',
    isActive: true
  },
  {
    id: 'bets-io',
    casinoName: 'Bets.io',
    bonusType: 'other',
    bonusValue: 1,
    bonusText: '1 BTC + 100 FS',
    logoUrl: '/images/BetsIO Logo.png',
    affiliateLink: 'https://betsio.link/h94ba1190',
    isActive: true
  },
  {
    id: 'luckybird',
    casinoName: 'LuckyBird',
    bonusType: 'other',
    bonusValue: 0,
    bonusText: 'VIP CLUB',
    logoUrl: '/images/LuckyBird Logo.png',
    promoCode: 'freevip',
    affiliateLink: 'https://luckybird.io/?c=luckyfree',
    isActive: true
  },
  {
    id: 'cloudbet',
    casinoName: 'Cloudbet',
    bonusType: 'other',
    bonusValue: 5,
    bonusText: '5 BTC',
    logoUrl: '/images/Cloudbet Logo.png',
    affiliateLink: 'https://cldbt.cloud/go/en/bitcoin-bonus?af_token=44553a766a8bc8974320d4703dfd535c&aftm_campaign=cryptobonuses',
    isActive: true
  },
  {
    id: 'nanogames',
    casinoName: 'NanoGames',
    bonusType: 'other',
    bonusValue: 1,
    bonusText: '1 BTC',
    logoUrl: '/images/Nanogames Logo.png',
    promoCode: 'NEWBONUS',
    affiliateLink: 'https://nanogames.io/login/regist/?i=newbonus',
    isActive: true
  },
  {
    id: 'crashino',
    casinoName: 'Crashino',
    bonusType: 'other',
    bonusValue: 1000,
    bonusText: '$1K USDT + 50 FS',
    logoUrl: '/images/Crashino Logo.png',
    affiliateLink: 'https://www.crashino.com/en',
    isActive: true
  },
  {
    id: 'vave',
    casinoName: 'Vave',
    bonusType: 'other',
    bonusValue: 1,
    bonusText: 'UP TO 1 BTC',
    logoUrl: '/images/Vave Logo.png',
    affiliateLink: 'https://top.moxtop.com/redirect.aspx?pid=9385&bid=1481&lpid=198',
    isActive: true
  },
  {
    id: 'cryptogames',
    casinoName: 'CryptoGames',
    bonusType: 'other',
    bonusValue: 20000,
    bonusText: '$20K USDT',
    logoUrl: '/images/Crypto-Games Logo.png',
    promoCode: 'NEWBONUS',
    affiliateLink: 'https://crypto-games.io/en/home?r=NEWBONUS',
    isActive: true
  },
  {
    id: 'betiro',
    casinoName: 'Betiro',
    bonusType: 'deposit',
    bonusValue: 10000,
    bonusText: '€10K',
    logoUrl: '/images/Betiro Logo.png',
    affiliateLink: 'https://www.betiro.com/',
    isActive: true
  },
  {
    id: 'jacks-club',
    casinoName: 'Jacks Club',
    bonusType: 'deposit',
    bonusValue: 20000,
    bonusText: '$20K',
    logoUrl: '/images/JacksClub Logo.png',
    promoCode: 'JACKBONUS',
    affiliateLink: 'https://jacksclub.io?r=jackbonus',
    isActive: true
  },
  {
    id: 'coinpoker',
    casinoName: 'CoinPoker',
    bonusType: 'other',
    bonusValue: 1100,
    bonusText: '$1100 USDT',
    logoUrl: '/images/CoinPoker Logo.png',
    affiliateLink: 'https://record.coinpokeraffiliates.com/_acfZQzI4M4nUOsjNOfgKeWNd7ZgqdRLk/1/',
    isActive: true
  },
  {
    id: 'leebet',
    casinoName: 'Leebet',
    bonusType: 'other',
    bonusValue: 1,
    bonusText: 'WIN 1 BTC',
    logoUrl: '/images/LEEBET Logo.png',
    affiliateLink: 'https://leebet.io/?ref=D240B79A3D06B0C9',
    isActive: true
  },
  {
    id: 'spinarium',
    casinoName: 'Spinarium',
    bonusType: 'deposit',
    bonusValue: 400,
    bonusText: '400% + 200 FS',
    logoUrl: '/images/Spinarium Logo.png',
    affiliateLink: 'https://spinarium.cc/d05e7ddb3',
    isActive: true
  },
  {
    id: 'destinyx',
    casinoName: 'DestinyX',
    bonusType: 'deposit',
    bonusValue: 10000,
    bonusText: '$10K + 6K BXC',
    logoUrl: '/images/DestinyX Logo.png',
    promoCode: '897a7d17a1',
    affiliateLink: 'https://destinyx.com/ref/897a7d17a1',
    isActive: true
  },
  {
    id: 'bitsler',
    casinoName: 'Bitsler',
    bonusType: 'other',
    bonusValue: 2000,
    bonusText: '$2K USDT',
    logoUrl: '/images/Bitsler Logo.png',
    affiliateLink: 'https://www.bitsler.com/?c=r8mpwd3lvbww3vqd',
    isActive: true
  },
  {
    id: 'tether-bet',
    casinoName: 'tether.bet',
    bonusType: 'other',
    bonusValue: 2000,
    bonusText: '$2K USDT',
    logoUrl: '/images/tetherbet Logo.png',
    affiliateLink: 'https://tether.bet/',
    isActive: true
  },
  {
    id: 'fairspin',
    casinoName: 'Fairspin',
    bonusType: 'deposit',
    bonusValue: 200,
    bonusText: '200 TFS + 100%',
    logoUrl: '/images/Fairspin Logo.png',
    affiliateLink: '',
    isActive: true
  },
  {
    id: 'betpanda',
    casinoName: 'Betpanda.io',
    bonusType: 'other',
    bonusValue: 1,
    bonusText: 'UP TO 1 BTC',
    logoUrl: '/images/BetpandaIO Logo.png',
    affiliateLink: '',
    isActive: true
  },
  {
    id: 'bitcasino',
    casinoName: 'Bitcasino.io',
    bonusType: 'other',
    bonusValue: 1500,
    bonusText: '1,500 USDT',
    logoUrl: '/images/BitcasinoIO Logo.png',
    affiliateLink: 'https://aff.partners.io/visit/?bta=1384&brand=empireio',
    isActive: true
  },
  {
    id: 'empire',
    casinoName: 'Empire.io',
    bonusType: 'other',
    bonusValue: 1,
    bonusText: 'UP TO 1 BTC',
    logoUrl: '/images/EmpireCasino Logo.png',
    affiliateLink: 'https://aff.partners.io/visit/?bta=1384&brand=livecasinoio',
    isActive: true
  },
  {
    id: 'livecasino',
    casinoName: 'Livecasino.io',
    bonusType: 'rakeback',
    bonusValue: 20,
    bonusText: '20% CASHBACK',
    logoUrl: '/images/LivecasinoIO Logo.png',
    affiliateLink: 'https://pixel.gg/r/newbonus',
    isActive: true
  },
  {
    id: 'pixel',
    casinoName: 'Pixel.gg',
    bonusType: 'deposit',
    bonusValue: 1000,
    bonusText: '1000%',
    logoUrl: '/images/PixelGG Logo.png',
    promoCode: 'NEWBONUS',
    affiliateLink: 'https://pixel.gg/r/newbonus',
    isActive: true
  },
  {
    id: 'sirwin',
    casinoName: 'Sirwin',
    bonusType: 'deposit',
    bonusValue: 600,
    bonusText: '600% + 400 FS',
    logoUrl: '/images/Sirwin Logo.png',
    promoCode: '7384',
    affiliateLink: 'https://sirwin.com/?aff=7384',
    isActive: true
  }
];

export const bonusTypes = [
  'free',        // No Deposit
  'deposit',     // Deposit Bonus
  'rakeback',    // Rakeback (includes cashback)
  'free_spins',  // Free Spins
  'other'        // Other types
] as const;

export type BonusType = typeof bonusTypes[number];

// Update all remaining crypto bonuses to 'other' type
// ... existing code ... 