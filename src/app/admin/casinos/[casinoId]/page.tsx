"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { normalizeImagePath } from "@/lib/image-utils";

const casinoSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  logo: z.string().optional().or(z.literal("")),
  featuredImage: z.string().optional().or(z.literal("")),
  description: z.string().min(1, "Description is required"),
  affiliateLink: z.string().url().optional().or(z.literal("")),
  website: z.string().url().optional().or(z.literal("")),
  foundedYear: z.number().min(1990).max(new Date().getFullYear()).optional().or(z.nan()),
  screenshots: z.array(z.string()).optional(),
  codeTermLabel: z.string().optional().or(z.literal("")),
  // Bonus fields
  bonusTitle: z.string().min(1, "Bonus title is required"),
  bonusDescription: z.string().min(1, "Bonus description is required"),
  bonusCode: z.string().optional().or(z.literal("")),
  bonusTypes: z.array(z.enum(["WELCOME", "NO_DEPOSIT", "FREE_SPINS", "RELOAD", "CASHBACK", "DEPOSIT"])).min(1, "At least one bonus type is required"),
  bonusValue: z.string().min(1, "Bonus value is required"),
  // Content fields
  aboutContent: z.string().optional().or(z.literal("")),
  howToRedeemContent: z.string().optional().or(z.literal("")),
  bonusDetailsContent: z.string().optional().or(z.literal("")),
  gameContent: z.string().optional().or(z.literal("")),
  termsContent: z.string().optional().or(z.literal("")),
  faqContent: z.string().optional().or(z.literal("")),
});

type CasinoForm = z.infer<typeof casinoSchema>;

interface Casino {
  id: string;
  name: string;
  bonuses?: Bonus[];
  customTableFields?: Array<{label: string, value: string}>;
}

interface Bonus {
  id: string;
  title: string;
  description: string;
  code: string | null;
  types: string[];
  value: string;
}

// Content generation functions (converted from HTML to plain text)
function generateAboutContent(casinoName: string, bonusType: string): string {
  const ratingText = "popular";
  
  const typeSpecificContent = {
    WELCOME: `${casinoName} has established itself as a ${ratingText} destination in the crypto gambling space, offering an impressive welcome package that gives new players a substantial boost to begin their journey.

Founded with a vision to provide a seamless crypto gambling experience, ${casinoName} combines cutting-edge technology with user-friendly design to deliver an exceptional platform for both novice and experienced players. The platform stands out for its transparent withdrawal process and commitment to player satisfaction.

Security is paramount at ${casinoName}, with the platform employing advanced encryption and blockchain technology to ensure all transactions and personal data remain protected. The implementation of provably fair algorithms adds another layer of trust, allowing players to verify the integrity of game outcomes independently.

The game library at ${casinoName} is extensive and diverse, featuring titles from industry-leading providers such as Pragmatic Play, Evolution Gaming, and NetEnt. From classic table games to innovative slots and live dealer experiences, the platform offers something for every type of player, with new games regularly added to keep the experience fresh and engaging.`,
    
    NO_DEPOSIT: `${casinoName} stands out in the competitive crypto casino landscape by offering a generous no-deposit bonus that allows players to explore the platform risk-free.

Since its inception, ${casinoName} has been committed to providing a transparent and fair gaming environment, implementing provably fair technology across its game selection to ensure players can verify every outcome. The platform features an extensive library of over 3,000 games from more than 25 top-tier providers.`,
    
    FREE_SPINS: `${casinoName} has carved a niche for itself in the crypto gambling industry through its exceptional free spins offers on popular slot games.

The platform features a carefully curated collection of high-quality slots from leading providers, ensuring players enjoy a premium gaming experience with the potential for significant winnings without risking additional funds. ${casinoName}'s VIP program rewards regular players with personalized bonuses, cashback offers, and dedicated account managers.`,
    
    RELOAD: `${casinoName} has built a loyal community of players thanks to its rewarding reload bonus program that provides ongoing value to returning users.

As a ${ratingText} crypto casino, ${casinoName} focuses on long-term player satisfaction by combining generous promotions with an extensive library of games, all operating within a secure blockchain-based environment. The platform's innovative tournaments and weekly reload offers create a dynamic gaming experience that keeps players engaged.`,
    
    CASHBACK: `${casinoName} has revolutionized the crypto gambling experience with its player-friendly cashback program that significantly reduces risk while maximizing entertainment value.

This ${ratingText} platform combines sophisticated design with user-centric features, ensuring that players can enjoy their favorite games with the security of knowing they'll recover a portion of any losses. ${casinoName}'s cashback system applies to all game categories, not just slots, making it one of the most comprehensive reward programs in the industry.`
  };
  
  return typeSpecificContent[bonusType as keyof typeof typeSpecificContent] || typeSpecificContent.WELCOME;
}

function generateHowToRedeemContent(casinoName: string, hasCode: boolean = true, website: string = '', affiliateLink: string = ''): string {
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

function generateBonusDetailsContent(casinoName: string, bonusTitle: string, bonusType: string): string {
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

function generateGameContent(casinoName: string): string {
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

function generateTermsContent(casinoName: string): string {
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

function generateFAQContent(casinoName: string): string {
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

export default function EditCasinoPage({
  params,
}: {
  params: { casinoId: string };
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [featuredImageFile, setFeaturedImageFile] = useState<File | null>(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState<string | null>(null);
  const [calculatedRating, setCalculatedRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [bonusId, setBonusId] = useState<string | null>(null);
  const [originalSlug, setOriginalSlug] = useState<string | null>(null);
  const [codeTermLabel, setCodeTermLabel] = useState('bonus code');
  
  // Key features state
  const [keyFeatures, setKeyFeatures] = useState<Array<{emoji: string, text: string}>>([
    { emoji: '💰', text: 'Accepts Bitcoin and other cryptocurrencies' },
    { emoji: '🔒', text: 'Secure transactions with blockchain technology' }
  ]);
  
  // Custom table fields state
  const [customTableFields, setCustomTableFields] = useState<Array<{label: string, value: string}>>([]);
  
  // Screenshot state
  const [screenshotFiles, setScreenshotFiles] = useState<(File | null)[]>([null, null, null]);
  const [screenshotPreviews, setScreenshotPreviews] = useState<(string | null)[]>([null, null, null]);
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CasinoForm>({
    resolver: zodResolver(casinoSchema),
    defaultValues: {
      bonusTypes: ["WELCOME"],
      screenshots: [],
    }
  });

  useEffect(() => {
    if (params.casinoId !== "new") {
      fetchCasino();
    } else {
      setLoading(false);
    }
  }, [params.casinoId]);

  // Fetch settings for code term label
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const settings = await response.json();
          setCodeTermLabel(settings.codeTermLabel || 'bonus code');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    fetchSettings();
  }, []);

  const fetchCasino = async () => {
    try {
      const response = await fetch(`/api/casinos/${params.casinoId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch casino details");
      }
      
      const responseData = await response.json();
      // The API returns data wrapped in { casino: {...} }
      const data = responseData.casino || responseData;
      
      setValue("name", data.name);
      setValue("slug", data.slug);
      setValue("logo", data.logo || "");
      setValue("featuredImage", data.featuredImage || "");
      setValue("description", data.description);
      setValue("affiliateLink", data.affiliateLink || "");
      setValue("website", data.website || "");
      setValue("foundedYear", data.foundedYear || NaN);
      setValue("codeTermLabel", data.codeTermLabel || "bonus code");
      
      // Handle content fields - use existing content or generate if empty
      const casinoName = data.name;
      const bonusType = data.bonuses?.[0]?.types?.[0] || "WELCOME";
      const bonusTitle = data.bonuses?.[0]?.title || "Welcome Bonus";
      
      setValue("aboutContent", data.aboutContent || generateAboutContent(casinoName, bonusType));
      setValue("howToRedeemContent", data.howToRedeemContent || generateHowToRedeemContent(casinoName, !!data.bonuses?.[0]?.code, data.website || "", data.affiliateLink || ""));
      setValue("bonusDetailsContent", data.bonusDetailsContent || generateBonusDetailsContent(casinoName, bonusTitle, bonusType));
      setValue("gameContent", data.gameContent || generateGameContent(casinoName));
      setValue("termsContent", data.termsContent || generateTermsContent(casinoName));
      setValue("faqContent", data.faqContent || generateFAQContent(casinoName));
      
      // Store the calculated rating for display
      setCalculatedRating(data.rating);
      
      // Count verified reviews
      if (data.reviews && Array.isArray(data.reviews)) {
        setReviewCount(data.reviews.filter(review => review.verified).length);
      }
      
      // Set logo preview if one exists
      if (data.logo) {
        // Use the normalized path for the logo preview
        setLogoPreview(normalizeImagePath(data.logo));
      }
      
      // Set featured image preview if one exists
      if (data.featuredImage) {
        setFeaturedImagePreview(normalizeImagePath(data.featuredImage));
      }
      
      // Set screenshots previews if they exist
      if (data.screenshots && Array.isArray(data.screenshots)) {
        setValue("screenshots", data.screenshots);
        
        // Create preview array from existing screenshots
        const previews = [...screenshotPreviews];
        data.screenshots.forEach((url, index) => {
          if (index < 3) {
            // Use the normalized path for screenshot previews
            previews[index] = normalizeImagePath(url);
          }
        });
        setScreenshotPreviews(previews);
      }
      
      // Load key features if they exist
      if (data.keyFeatures && Array.isArray(data.keyFeatures)) {
        setKeyFeatures(data.keyFeatures);
      }
      
      // Load custom table fields if they exist
      if (data.customTableFields && Array.isArray(data.customTableFields)) {
        setCustomTableFields(data.customTableFields);
      }
      
      // Load the first bonus if it exists
      if (data.bonuses && data.bonuses.length > 0) {
        const bonus = data.bonuses[0];
        setBonusId(bonus.id);
        setValue("bonusTitle", bonus.title);
        setValue("bonusDescription", bonus.description);
        setValue("bonusCode", bonus.code || "");
        setValue("bonusTypes", bonus.types || [bonus.type || "WELCOME"]);
        setValue("bonusValue", bonus.value);
      }
      
      // Regenerate howToRedeemContent if needed
      if (data.howToRedeemContent) {
        const hasCode = data.bonuses?.[0]?.code;
        const hasWebsite = data.website;
        const hasAffiliateLink = data.affiliateLink;
        
        if (hasCode !== undefined || hasWebsite || hasAffiliateLink) {
          data.howToRedeemContent = generateHowToRedeemContent(
            data.name, 
            hasCode, 
            hasWebsite ? data.website : '',
            data.affiliateLink || ''
          );
        }
      }
      
      // Set original slug
      setOriginalSlug(data.slug);
      
    } catch (error) {
      console.error("Failed to fetch casino:", error);
      setFormError("Failed to load casino details");
    } finally {
      setLoading(false);
    }
  };

  // Handle logo file change
  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files && e.target.files[0]) {
        setLogoPreview(URL.createObjectURL(e.target.files[0]));
        setLogoFile(e.target.files[0]);
        
        // Don't auto-upload yet - wait for form submission
        console.log("Logo file selected and preview generated");
      }
    } catch (error) {
      console.error("Error handling logo change:", error);
      alert("Error selecting logo file. Please try again.");
    }
  };

  // Upload logo file and get the URL
  const uploadLogo = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      // Get casino name for SEO filename
      const casinoName = (document.getElementById('name') as HTMLInputElement)?.value || 'casino';
      formData.append("context", casinoName);
      formData.append("type", "logo");
      
      // Pass current logo path if editing existing casino (for overwriting)
      const currentLogoPath = (document.getElementById('logo') as HTMLInputElement)?.value;
      if (params.casinoId !== "new" && currentLogoPath) {
        formData.append("currentPath", currentLogoPath);
      }
      
      console.log("Uploading logo file...");
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload logo file");
      }
      
      const data = await response.json();
      
      // Check if the response has the expected structure
      if (!data || !data.url) {
        console.error("Unexpected response format:", data);
        throw new Error("Invalid response from upload API");
      }
      
      console.log("Logo uploaded successfully:", data.url);
      
      // Use cache-busted URL for immediate preview if available
      if (data.displayUrl) {
        setLogoPreview(data.displayUrl);
      }
      
      // Make sure we have a proper image path format (clean URL for database)
      const logoPath = data.url.startsWith('/') ? data.url : `/${data.url}`;
      return logoPath;
    } catch (error) {
      console.error("Error uploading logo:", error);
      throw new Error("Failed to upload logo. Please try again.");
    }
  };

  // Handle featured image file change
  const handleFeaturedImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files && e.target.files[0]) {
        setFeaturedImagePreview(URL.createObjectURL(e.target.files[0]));
        setFeaturedImageFile(e.target.files[0]);
        
        // Don't auto-upload yet - wait for form submission
        console.log("Featured image file selected and preview generated");
      }
    } catch (error) {
      console.error("Error handling featured image change:", error);
      alert("Error selecting featured image file. Please try again.");
    }
  };

  // Upload featured image file and get the URL
  const uploadFeaturedImage = async (file: File): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      // Get casino name for SEO filename
      const casinoName = (document.getElementById('name') as HTMLInputElement)?.value || 'casino';
      formData.append("context", casinoName);
      formData.append("type", "featured");
      
      console.log("Uploading featured image file...");
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload featured image file");
      }
      
      const data = await response.json();
      
      // Check if the response has the expected structure
      if (!data || !data.url) {
        console.error("Unexpected response format:", data);
        throw new Error("Invalid response from upload API");
      }
      
      console.log("Featured image uploaded successfully:", data.url);
      
      // Use cache-busted URL for immediate preview if available
      if (data.displayUrl) {
        setFeaturedImagePreview(data.displayUrl);
      }
      
      // Make sure we have a proper image path format (clean URL for database)
      const imagePath = data.url.startsWith('/') ? data.url : `/${data.url}`;
      return imagePath;
    } catch (error) {
      console.error("Error uploading featured image:", error);
      throw new Error("Failed to upload featured image. Please try again.");
    }
  };

  // Upload screenshot file and get the URL
  const uploadScreenshot = async (file: File, index: number): Promise<string> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      // Get casino name for SEO filename
      const casinoName = (document.getElementById('name') as HTMLInputElement)?.value || 'casino';
      formData.append("context", casinoName);
      formData.append("type", "screenshot");
      formData.append("index", index.toString()); // Add screenshot index
      
      // Pass current screenshot path if editing existing casino (for overwriting)
      if (params.casinoId !== "new" && screenshotPreviews[index] && !screenshotPreviews[index]?.startsWith('blob:')) {
        formData.append("currentPath", screenshotPreviews[index]!);
      }
      
      console.log("Uploading screenshot file...");
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload screenshot file");
      }
      
      const data = await response.json();
      
      // Check if the response has the expected structure
      if (!data || !data.url) {
        console.error("Unexpected response format:", data);
        throw new Error("Invalid response from upload API");
      }
      
      console.log("Screenshot uploaded successfully:", data.url);
      
      // Use cache-busted URL for immediate preview if available
      if (data.displayUrl) {
        const newPreviews = [...screenshotPreviews];
        newPreviews[index] = data.displayUrl;
        setScreenshotPreviews(newPreviews);
      }
      
      // Make sure we have a proper image path format (clean URL for database)
      const imagePath = data.url.startsWith('/') ? data.url : `/${data.url}`;
      return imagePath;
    } catch (error) {
      console.error("Error uploading screenshot:", error);
      throw new Error("Failed to upload screenshot. Please try again.");
    }
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      // If there was a previous preview URL that was created with createObjectURL, revoke it
      if (screenshotPreviews[index] && screenshotPreviews[index]?.startsWith('blob:')) {
        URL.revokeObjectURL(screenshotPreviews[index]!);
      }
      
      // Update the file at the specific index
      const newFiles = [...screenshotFiles];
      newFiles[index] = file;
      setScreenshotFiles(newFiles);
      
      // Create and set preview URL
      const previewUrl = URL.createObjectURL(file);
      const newPreviews = [...screenshotPreviews];
      newPreviews[index] = previewUrl;
      setScreenshotPreviews(newPreviews);
    }
  };

  const removeScreenshot = (index: number) => {
    // Remove the preview if it exists
    if (screenshotPreviews[index] && screenshotPreviews[index]?.startsWith('blob:')) {
      URL.revokeObjectURL(screenshotPreviews[index]!);
    }
    
    // Update the arrays
    const newFiles = [...screenshotFiles];
    newFiles[index] = null;
    setScreenshotFiles(newFiles);
    
    const newPreviews = [...screenshotPreviews];
    newPreviews[index] = null;
    setScreenshotPreviews(newPreviews);
  };

  // Key features handlers
  const addKeyFeature = () => {
    setKeyFeatures([...keyFeatures, { emoji: '✨', text: '' }]);
  };

  const updateKeyFeature = (index: number, field: 'emoji' | 'text', value: string) => {
    const updated = [...keyFeatures];
    updated[index] = { ...updated[index], [field]: value };
    setKeyFeatures(updated);
  };

  const removeKeyFeature = (index: number) => {
    setKeyFeatures(keyFeatures.filter((_, i) => i !== index));
  };

  // Custom table fields handlers
  const addCustomTableField = () => {
    setCustomTableFields([...customTableFields, { label: '', value: '' }]);
  };

  const updateCustomTableField = (index: number, field: 'label' | 'value', value: string) => {
    const updated = [...customTableFields];
    updated[index] = { ...updated[index], [field]: value };
    setCustomTableFields(updated);
  };

  const removeCustomTableField = (index: number) => {
    setCustomTableFields(customTableFields.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: CasinoForm) => {
    try {
      setFormError(null);
      
      // Handle image upload first if there's a new file
      if (logoFile) {
        const logoUrl = await uploadLogo(logoFile);
        data.logo = logoUrl;
        
        // Update the preview with the new URL (add cache busting)
        if (logoPreview && logoPreview.startsWith('blob:')) {
          URL.revokeObjectURL(logoPreview);
        }
        const cacheBustedLogoUrl = `${logoUrl}?v=${Date.now()}`;
        setLogoPreview(cacheBustedLogoUrl);
      }
      
      // Handle featured image upload if there's a new file
      if (featuredImageFile) {
        const featuredImageUrl = await uploadFeaturedImage(featuredImageFile);
        data.featuredImage = featuredImageUrl;
        
        // Update the preview with the new URL (add cache busting)
        if (featuredImagePreview && featuredImagePreview.startsWith('blob:')) {
          URL.revokeObjectURL(featuredImagePreview);
        }
        const cacheBustedFeaturedUrl = `${featuredImageUrl}?v=${Date.now()}`;
        setFeaturedImagePreview(cacheBustedFeaturedUrl);
      }
      
      // Handle screenshot uploads properly
      const screenshotUrls: string[] = [];
      
      // First, add any existing screenshots that weren't changed
      for (let i = 0; i < screenshotPreviews.length; i++) {
        if (screenshotPreviews[i] && !screenshotFiles[i]) {
          // This is an existing screenshot that wasn't changed
          // Make sure it's not a blob URL (which shouldn't happen with existing screenshots)
          if (!screenshotPreviews[i]!.startsWith('blob:')) {
            screenshotUrls.push(screenshotPreviews[i]!);
          }
        }
      }
      
      // Then upload any new screenshots
      for (let i = 0; i < screenshotFiles.length; i++) {
        const file = screenshotFiles[i];
        if (file !== null) {
          try {
            const screenshotUrl = await uploadScreenshot(file, i);
            screenshotUrls.push(screenshotUrl);
            
            // Update the preview with the new URL and clean up blob URL (add cache busting)
            if (screenshotPreviews[i] && screenshotPreviews[i]!.startsWith('blob:')) {
              URL.revokeObjectURL(screenshotPreviews[i]!);
            }
            const newPreviews = [...screenshotPreviews];
            const cacheBustedScreenshotUrl = `${screenshotUrl}?v=${Date.now()}`;
            newPreviews[i] = cacheBustedScreenshotUrl;
            setScreenshotPreviews(newPreviews);
          } catch (error) {
            console.error(`Failed to upload screenshot ${i + 1}:`, error);
            throw new Error(`Failed to upload screenshot ${i + 1}. Please try again.`);
          }
        }
      }
      
      // Update the form data with the screenshot URLs
      data.screenshots = screenshotUrls;
      
      // Auto-generate howToRedeemContent if website is provided
      const hasCode = Boolean(data.bonusCode && data.bonusCode.trim() !== '');
      const hasWebsite = Boolean(data.website && data.website.trim() !== '');
      
      if (hasWebsite || !data.howToRedeemContent) {
        // Generate fresh howToRedeemContent based on current data
        data.howToRedeemContent = generateHowToRedeemContent(
          data.name, 
          hasCode, 
          hasWebsite ? data.website : '',
          data.affiliateLink || ''
        );
      }
      
      const method = params.casinoId === "new" ? "POST" : "PUT";
      const url = params.casinoId === "new" ? "/api/casinos" : `/api/casinos/${params.casinoId}`;

      // Get the current casino data if editing
      let currentDisplayOrder = 0;
      if (params.casinoId !== "new") {
        const response = await fetch(`/api/casinos/${params.casinoId}`);
        if (response.ok) {
          const responseData = await response.json();
          // Handle wrapped response structure from API
          const currentData = responseData.casino || responseData;
          currentDisplayOrder = currentData.displayOrder || 0;
        }
      }

      // Prepare casino data including bonus data
      const casinoData = {
        name: data.name,
        slug: data.slug,
        logo: data.logo,
        featuredImage: data.featuredImage,
        description: data.description,
        affiliateLink: data.affiliateLink,
        website: data.website,
        foundedYear: (data.foundedYear && !isNaN(data.foundedYear)) ? data.foundedYear : null,
        codeTermLabel: data.codeTermLabel || "bonus code",
        screenshots: data.screenshots,
        displayOrder: currentDisplayOrder,
        // Add key features
        keyFeatures: keyFeatures,
        // Add custom table fields
        customTableFields: customTableFields,
        // Add content fields
        aboutContent: data.aboutContent,
        howToRedeemContent: data.howToRedeemContent,
        bonusDetailsContent: data.bonusDetailsContent,
        gameContent: data.gameContent,
        termsContent: data.termsContent,
        faqContent: data.faqContent,
        // Add bonus data directly to the casino update request
        bonusId: bonusId,
        bonusTitle: data.bonusTitle,
        bonusDescription: data.bonusDescription,
        bonusCode: data.bonusCode,
        bonusTypes: data.bonusTypes,
        bonusValue: data.bonusValue
      };

      // Save the casino with bonus data included
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include credentials for auth
        body: JSON.stringify(casinoData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save casino");
      }

      const savedCasino = await response.json();

      // Create slug redirect if slug has changed
      if (params.casinoId !== "new" && originalSlug && originalSlug !== data.slug) {
        try {
          const redirectResponse = await fetch("/api/redirects", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
              oldSlug: originalSlug,
              newSlug: data.slug,
              entityType: "casino"
            }),
          });

          if (!redirectResponse.ok) {
            console.warn("Failed to create slug redirect, but casino was saved successfully");
          } else {
            console.log("Slug redirect created successfully");
          }
        } catch (error) {
          console.warn("Error creating slug redirect:", error);
        }
      }

      // Bonus creation is now handled by the casino API, so no separate bonus creation needed

      // On success, navigate back to the casinos list
      router.push("/admin/casinos");
    } catch (error) {
      console.error("Failed to save casino:", error);
      setFormError("Failed to save casino. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="admin-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h2 className="admin-heading">
        {params.casinoId === "new" ? "Add New Casino" : "Edit Casino"}
      </h2>

      <div className="admin-container">
        {formError && (
          <div className="bg-red-500 text-white p-3 rounded-md mb-4 flex items-center">
            {formError}
          </div>
        )}
        
        {params.casinoId !== "new" && calculatedRating !== null && (
          <div className="bg-[#2A2B37] p-4 rounded-md mb-6">
            <h3 className="text-lg font-semibold mb-2">Rating Information</h3>
            <p className="text-[#a4a5b0]">
              Current rating: <span className="text-white font-semibold">
                {reviewCount > 0 ? `${calculatedRating.toFixed(1)}/5` : '0.0/5'}
              </span> 
              {reviewCount > 0 && (
                <span className="ml-2 text-sm">
                  (Based on {reviewCount} verified {reviewCount === 1 ? 'review' : 'reviews'})
                </span>
              )}
            </p>
            <p className="text-xs text-[#a4a5b0] mt-2">
              Note: Rating is automatically calculated from verified reviews and cannot be manually edited.
            </p>
          </div>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="border-b border-[#404055] pb-6">
            <h3 className="text-xl font-semibold mb-4">Casino Information</h3>
            
            <div className="form-group">
              <label
                htmlFor="name"
                className="form-label"
              >
                Name
              </label>
              <input
                {...register("name")}
                type="text"
                id="name"
              />
              {errors.name && (
                <p className="admin-error">{errors.name.message}</p>
              )}
            </div>

            <div className="form-group">
              <label
                htmlFor="slug"
                className="form-label"
              >
                Slug
              </label>
              <input
                {...register("slug")}
                type="text"
                id="slug"
              />
              {errors.slug && (
                <p className="admin-error">{errors.slug.message}</p>
              )}
            </div>

            <div className="form-group">
              <label
                htmlFor="logo"
                className="form-label"
              >
                Logo Image
              </label>
              <div className="flex flex-col md:flex-row items-start gap-4">
                <div className="flex-1">
                  <input
                    type="file"
                    id="logoFile"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="w-full"
                  />
                  <input
                    {...register("logo")}
                    type="hidden"
                    id="logo"
                  />
                  <p className="text-xs text-gray-400 mt-1">Upload a new logo image or keep the existing one.</p>
                </div>
                {logoPreview && (
                  <div className="flex-shrink-0">
                    <div className="relative w-24 h-24 rounded-md overflow-hidden bg-[#1E1E27]">
                      <Image
                        src={logoPreview}
                        alt="Logo preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
              {errors.logo && (
                <p className="admin-error">{errors.logo.message}</p>
              )}
            </div>

            <div className="form-group">
              <label
                htmlFor="featuredImage"
                className="form-label"
              >
                Featured Image
              </label>
              <div className="flex flex-col md:flex-row items-start gap-4">
                <div className="flex-1">
                  <input
                    type="file"
                    id="featuredImageFile"
                    accept="image/*"
                    onChange={handleFeaturedImageChange}
                    className="w-full"
                  />
                  <input
                    {...register("featuredImage")}
                    type="hidden"
                    id="featuredImage"
                  />
                  <p className="text-xs text-gray-400 mt-1">Upload a featured image for SEO and Google Images visibility. Recommended: 1200x630px for optimal social sharing.</p>
                </div>
                {featuredImagePreview && (
                  <div className="flex-shrink-0">
                    <div className="relative w-24 h-24 rounded-md overflow-hidden bg-[#1E1E27]">
                      <Image
                        src={featuredImagePreview}
                        alt="Featured image preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>
              {errors.featuredImage && (
                <p className="admin-error">{errors.featuredImage.message}</p>
              )}
            </div>

            <div className="form-group">
              <label
                htmlFor="website"
                className="form-label"
              >
                Casino Website
              </label>
              <input
                {...register("website")}
                type="url"
                id="website"
                placeholder="https://casino-name.com"
              />
              {errors.website && (
                <p className="admin-error">{errors.website.message}</p>
              )}
            </div>

            <div className="form-group">
              <label
                htmlFor="foundedYear"
                className="form-label"
              >
                Founded Year
              </label>
              <input
                {...register("foundedYear", { 
                  setValueAs: (value) => value === '' ? NaN : parseInt(value) 
                })}
                type="number"
                id="foundedYear"
                min="1990"
                max={new Date().getFullYear()}
                placeholder="e.g., 2018"
              />
              <p className="text-xs text-gray-400 mt-1">
                Year the casino was founded. Leave empty to auto-populate from domain WHOIS data.
              </p>
              {errors.foundedYear && (
                <p className="admin-error">{errors.foundedYear.message}</p>
              )}
            </div>

            <div className="form-group">
              <label
                htmlFor="codeTermLabel"
                className="form-label"
              >
                Code Term Label
              </label>
              <input
                {...register("codeTermLabel")}
                type="text"
                id="codeTermLabel"
                placeholder="e.g., bonus code, promo code, coupon code"
              />
              <p className="text-xs text-gray-400 mt-1">
                Customize the terminology used for codes on this casino's pages (e.g., "bonus code", "promo code", "coupon code"). Leave empty to use "bonus code" as default.
              </p>
              {errors.codeTermLabel && (
                <p className="admin-error">{errors.codeTermLabel.message}</p>
              )}
            </div>

            <div className="form-group">
              <label
                htmlFor="affiliateLink"
                className="form-label"
              >
                Affiliate Link
              </label>
              <input
                {...register("affiliateLink")}
                type="url"
                id="affiliateLink"
                placeholder="https://cryptobonuses.com/go/casino-name"
              />
              {errors.affiliateLink && (
                <p className="admin-error">{errors.affiliateLink.message}</p>
              )}
            </div>

            <div className="form-group">
              <label
                htmlFor="description"
                className="form-label"
              >
                Description
              </label>
              <textarea
                {...register("description")}
                id="description"
                rows={6}
              />
              {errors.description && (
                <p className="admin-error">
                  {errors.description.message}
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">
                Key Features
              </label>
              <p className="text-sm text-gray-400 mb-4">
                Add key features that will be displayed on the casino page. Each feature has an emoji and descriptive text.
              </p>
              
              <div className="space-y-3">
                {keyFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-[#2A2B37] rounded-md">
                    <input
                      type="text"
                      value={feature.emoji}
                      onChange={(e) => updateKeyFeature(index, 'emoji', e.target.value)}
                      placeholder="💰"
                      className="w-16 text-center text-2xl bg-[#1E1E27] border border-[#404055] rounded-md p-2"
                    />
                    <input
                      type="text"
                      value={feature.text}
                      onChange={(e) => updateKeyFeature(index, 'text', e.target.value)}
                      placeholder="Feature description"
                      className="flex-1 bg-[#1E1E27] border border-[#404055] rounded-md p-2 text-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeKeyFeature(index)}
                      className="text-red-400 hover:text-red-300 p-2"
                      title="Remove feature"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addKeyFeature}
                  className="w-full p-3 border-2 border-dashed border-[#404055] rounded-md text-gray-400 hover:text-white hover:border-[#68D08B] transition-colors"
                >
                  + Add Key Feature
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Custom Table Fields
              </label>
              <p className="text-sm text-gray-400 mb-4">
                Add custom fields that will be displayed in the casino information table on the casino page. These appear as additional rows in the table alongside website, promo code, bonus amount, etc.
              </p>
              
              <div className="space-y-3">
                {customTableFields.map((field, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-[#2A2B37] rounded-md">
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateCustomTableField(index, 'label', e.target.value)}
                      placeholder="Field Label (e.g., Wagering Requirement)"
                      className="w-1/3 bg-[#1E1E27] border border-[#404055] rounded-md p-2 text-white"
                    />
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) => updateCustomTableField(index, 'value', e.target.value)}
                      placeholder="Field Value (e.g., 35x)"
                      className="flex-1 bg-[#1E1E27] border border-[#404055] rounded-md p-2 text-white"
                    />
                    <button
                      type="button"
                      onClick={() => removeCustomTableField(index)}
                      className="text-red-400 hover:text-red-300 p-2"
                      title="Remove field"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addCustomTableField}
                  className="w-full p-3 border-2 border-dashed border-[#404055] rounded-md text-gray-400 hover:text-white hover:border-[#68D08B] transition-colors"
                >
                  + Add Custom Table Field
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-[#404055] pb-6">
            <h3 className="text-xl font-semibold mb-4">Screenshots (Up to 3)</h3>
            <p className="text-sm text-gray-400 mb-4">Upload screenshots of the casino to show users what the platform looks like.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <div key={index} className="form-group">
                  <label className="form-label">
                    Screenshot {index + 1}
                  </label>
                  <div className="flex flex-col items-start gap-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleScreenshotChange(e, index)}
                      className="w-full"
                    />
                    {screenshotPreviews[index] ? (
                      <div className="w-full">
                        <div className="relative w-full h-32 rounded-md overflow-hidden bg-[#1E1E27]">
                          <Image
                            src={screenshotPreviews[index]!}
                            alt={`Screenshot ${index + 1} preview`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeScreenshot(index)}
                          className="mt-2 text-sm text-red-400 hover:text-red-300"
                        >
                          Remove Screenshot
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400">No screenshot selected</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="border-b border-[#404055] pb-6">
            <h3 className="text-xl font-semibold mb-4">Casino Bonus</h3>
            
            <div className="form-group">
              <label
                htmlFor="bonusTitle"
                className="form-label"
              >
                Bonus Title
              </label>
              <input
                {...register("bonusTitle")}
                type="text"
                id="bonusTitle"
                placeholder="e.g. Welcome Bonus"
              />
              {errors.bonusTitle && (
                <p className="admin-error">{errors.bonusTitle.message}</p>
              )}
            </div>
            
            <div className="form-group">
              <label
                htmlFor="bonusValue"
                className="form-label"
              >
                Bonus Value
              </label>
              <input
                {...register("bonusValue")}
                type="text"
                id="bonusValue"
                placeholder="e.g. 100% up to 1 BTC"
              />
              {errors.bonusValue && (
                <p className="admin-error">{errors.bonusValue.message}</p>
              )}
            </div>
            
            <div className="form-group">
              <label
                htmlFor="bonusTypes"
                className="form-label"
              >
                Bonus Types
              </label>
              <p className="text-sm text-gray-400 mb-4">
                Select the types of bonuses offered by the casino.
              </p>
              
              <div className="space-y-3">
                {["WELCOME", "NO_DEPOSIT", "FREE_SPINS", "RELOAD", "CASHBACK", "DEPOSIT"].map((type) => (
                  <div key={type} className="flex items-center gap-3 p-3 bg-[#2A2B37] rounded-md">
                    <input
                      type="checkbox"
                      value={type}
                      {...register("bonusTypes")}
                      className="w-4 h-4 text-blue-600 bg-[#2A2B37] border border-[#404055] rounded-md"
                    />
                    <label
                      htmlFor={`bonusTypes.${type}`}
                      className="text-sm text-white"
                    >
                      {type}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="bonusCode" className="form-label">
                {codeTermLabel || 'Bonus Code'} (Optional)
              </label>
              <input
                {...register("bonusCode")}
                type="text"
                id="bonusCode"
                className="form-input"
                placeholder={`Enter ${codeTermLabel || 'bonus code'} if available`}
              />
            </div>
            
            <div className="form-group">
              <label
                htmlFor="bonusDescription"
                className="form-label"
              >
                Bonus Description
              </label>
              <textarea
                {...register("bonusDescription")}
                id="bonusDescription"
                rows={4}
                placeholder="Describe the bonus details and any requirements"
              />
              {errors.bonusDescription && (
                <p className="admin-error">
                  {errors.bonusDescription.message}
                </p>
              )}
            </div>
          </div>

          {/* Content Sections */}
          <div className="border-b border-[#404055] pb-6">
            <h3 className="text-xl font-semibold mb-4">Content Sections</h3>
            <p className="text-sm text-gray-400 mb-6">
              These sections control the content displayed on the individual casino page. 
              Content has been auto-populated based on your casino info but can be customized.
            </p>
            
            <div className="space-y-6">
              <div className="form-group">
                <label
                  htmlFor="aboutContent"
                  className="form-label"
                >
                  About Content
                </label>
                <textarea
                  {...register("aboutContent")}
                  id="aboutContent"
                  rows={8}
                  placeholder="Description of the casino, its features, and what makes it unique..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  This content appears in the "About Casino" section. Use bullet points with • for features.
                </p>
                {errors.aboutContent && (
                  <p className="admin-error">{errors.aboutContent.message}</p>
                )}
              </div>

              <div className="form-group">
                <label
                  htmlFor="howToRedeemContent"
                  className="form-label"
                >
                  How to Redeem Content
                </label>
                <textarea
                  {...register("howToRedeemContent")}
                  id="howToRedeemContent"
                  rows={8}
                  placeholder="Step-by-step instructions on how to claim the bonus..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  Use numbered steps (1. 2. 3.) for instructions. This appears in the "How to Redeem" section.
                </p>
                {errors.howToRedeemContent && (
                  <p className="admin-error">{errors.howToRedeemContent.message}</p>
                )}
              </div>

              <div className="form-group">
                <label
                  htmlFor="bonusDetailsContent"
                  className="form-label"
                >
                  Bonus Details Content
                </label>
                <textarea
                  {...register("bonusDetailsContent")}
                  id="bonusDetailsContent"
                  rows={8}
                  placeholder="Detailed information about the bonus offer, requirements, and conditions..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  This content appears in the "Bonus Offer Details" section. Use bullet points with • for terms.
                </p>
                {errors.bonusDetailsContent && (
                  <p className="admin-error">{errors.bonusDetailsContent.message}</p>
                )}
              </div>

              <div className="form-group">
                <label
                  htmlFor="gameContent"
                  className="form-label"
                >
                  Games & Features Content
                </label>
                <textarea
                  {...register("gameContent")}
                  id="gameContent"
                  rows={8}
                  placeholder="Information about the casino's game selection and features..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  This content appears in the "Games & Features" section. Use emojis (🎰 🃏 🎮) for game categories.
                </p>
                {errors.gameContent && (
                  <p className="admin-error">{errors.gameContent.message}</p>
                )}
              </div>

              <div className="form-group">
                <label
                  htmlFor="termsContent"
                  className="form-label"
                >
                  Terms & Conditions Content
                </label>
                <textarea
                  {...register("termsContent")}
                  id="termsContent"
                  rows={8}
                  placeholder="Terms and conditions for the bonus offer..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  This content appears in the "Terms & Conditions" section. Use bullet points with • for terms.
                </p>
                {errors.termsContent && (
                  <p className="admin-error">{errors.termsContent.message}</p>
                )}
              </div>

              <div className="form-group">
                <label
                  htmlFor="faqContent"
                  className="form-label"
                >
                  FAQ Content
                </label>
                <textarea
                  {...register("faqContent")}
                  id="faqContent"
                  rows={8}
                  placeholder="Frequently asked questions and answers about the casino..."
                />
                <p className="text-xs text-gray-400 mt-1">
                  This content appears in the "FAQ" section. Use questions ending with "?" followed by answers.
                </p>
                {errors.faqContent && (
                  <p className="admin-error">{errors.faqContent.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={() => router.push("/admin/casinos")}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 