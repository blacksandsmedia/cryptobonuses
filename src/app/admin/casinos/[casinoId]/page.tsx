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

// AUTO-GENERATION FUNCTIONS REMOVED TO PREVENT DUPLICATE CONTENT
// All casino content must now be manually created and unique for each casino
// Use the admin interface to add specific, researched content for each casino

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
      
      // Handle content fields - only use existing content, no auto-generation
      const casinoName = data.name;
      const bonusType = data.bonuses?.[0]?.types?.[0] || "WELCOME";
      const bonusTitle = data.bonuses?.[0]?.title || "Welcome Bonus";
      
      // Only use existing content from database - no auto-generation
      setValue("aboutContent", data.aboutContent || "");
      setValue("howToRedeemContent", data.howToRedeemContent || "");
      setValue("bonusDetailsContent", data.bonusDetailsContent || "");
      setValue("gameContent", data.gameContent || "");
      setValue("termsContent", data.termsContent || "");
      setValue("faqContent", data.faqContent || "");
      
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
      
      // Auto-generation removed - content must be manually created
      
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

  // Clear content handlers
  const clearField = (fieldName: keyof CasinoForm) => {
    setValue(fieldName, '' as any);
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
      
      // Auto-generation removed - all content must be manually created
      
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
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="description"
                  className="form-label mb-0"
                >
                  Description
                </label>
                <button
                  type="button"
                  onClick={() => clearField('description')}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                  title="Clear description"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear
                </button>
              </div>
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
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="bonusDescription"
                  className="form-label mb-0"
                >
                  Bonus Description
                </label>
                <button
                  type="button"
                  onClick={() => clearField('bonusDescription')}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                  title="Clear bonus description"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Clear
                </button>
              </div>
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
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="aboutContent"
                    className="form-label mb-0"
                  >
                    About Content
                  </label>
                  <button
                    type="button"
                    onClick={() => clearField('aboutContent')}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                    title="Clear about content"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear
                  </button>
                </div>
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
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="howToRedeemContent"
                    className="form-label mb-0"
                  >
                    How to Redeem Content
                  </label>
                  <button
                    type="button"
                    onClick={() => clearField('howToRedeemContent')}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                    title="Clear how to redeem content"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear
                  </button>
                </div>
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
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="bonusDetailsContent"
                    className="form-label mb-0"
                  >
                    Bonus Details Content
                  </label>
                  <button
                    type="button"
                    onClick={() => clearField('bonusDetailsContent')}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                    title="Clear bonus details content"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear
                  </button>
                </div>
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
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="gameContent"
                    className="form-label mb-0"
                  >
                    Games & Features Content
                  </label>
                  <button
                    type="button"
                    onClick={() => clearField('gameContent')}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                    title="Clear games content"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear
                  </button>
                </div>
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
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="termsContent"
                    className="form-label mb-0"
                  >
                    Terms & Conditions Content
                  </label>
                  <button
                    type="button"
                    onClick={() => clearField('termsContent')}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                    title="Clear terms content"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear
                  </button>
                </div>
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
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="faqContent"
                    className="form-label mb-0"
                  >
                    FAQ Content
                  </label>
                  <button
                    type="button"
                    onClick={() => clearField('faqContent')}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1"
                    title="Clear FAQ content"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear
                  </button>
                </div>
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