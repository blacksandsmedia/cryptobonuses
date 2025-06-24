"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";

const settingsSchema = z.object({
  faviconUrl: z.string().optional(),
  codeTermLabel: z.string().optional(),
  googleAnalyticsId: z.string().optional(),
  searchDebounceTime: z.number().min(500).max(10000).optional(),
  searchInstantTrack: z.boolean().optional(),
  cryptoTickerSelection: z.array(z.string()).optional(),
  hideCryptoTicker: z.boolean().optional(),
  hideBuyCryptoButton: z.boolean().optional(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

// Available cryptocurrencies with their display names
const availableCryptos = [
  { value: 'BITCOIN', label: 'Bitcoin (BTC)', id: 'bitcoin' },
  { value: 'ETHEREUM', label: 'Ethereum (ETH)', id: 'ethereum' },
  { value: 'CARDANO', label: 'Cardano (ADA)', id: 'cardano' },
  { value: 'POLKADOT', label: 'Polkadot (DOT)', id: 'polkadot' },
  { value: 'DOGECOIN', label: 'Dogecoin (DOGE)', id: 'dogecoin' },
  { value: 'LITECOIN', label: 'Litecoin (LTC)', id: 'litecoin' },
  { value: 'CHAINLINK', label: 'Chainlink (LINK)', id: 'chainlink' },
  { value: 'SOLANA', label: 'Solana (SOL)', id: 'solana' },
  { value: 'POLYGON', label: 'Polygon (MATIC)', id: 'polygon-matic' },
  { value: 'AVALANCHE', label: 'Avalanche (AVAX)', id: 'avalanche-2' },
  { value: 'BINANCE_COIN', label: 'Binance Coin (BNB)', id: 'binancecoin' },
  { value: 'RIPPLE', label: 'Ripple (XRP)', id: 'ripple' },
  { value: 'TETHER', label: 'Tether (USDT)', id: 'tether' },
  { value: 'USDC', label: 'USD Coin (USDC)', id: 'usd-coin' },
  { value: 'TRON', label: 'Tron (TRX)', id: 'tron' },
  { value: 'MONERO', label: 'Monero (XMR)', id: 'monero' },
  { value: 'DASH', label: 'Dash (DASH)', id: 'dash' },
  { value: 'ZCASH', label: 'Zcash (ZEC)', id: 'zcash' },
  { value: 'STELLAR', label: 'Stellar (XLM)', id: 'stellar' },
  { value: 'COSMOS', label: 'Cosmos (ATOM)', id: 'cosmos' },
];

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [selectedCryptos, setSelectedCryptos] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setValue('faviconUrl', data.faviconUrl || '');
      setValue('codeTermLabel', data.codeTermLabel || 'bonus code');
      setValue('googleAnalyticsId', data.googleAnalyticsId || '');
      setValue('searchDebounceTime', data.searchDebounceTime || 2000);
      setValue('searchInstantTrack', data.searchInstantTrack !== false);
      setValue('cryptoTickerSelection', data.cryptoTickerSelection || []);
      setValue('hideCryptoTicker', data.hideCryptoTicker || false);
      setValue('hideBuyCryptoButton', data.hideBuyCryptoButton || false);
      setSelectedCryptos(data.cryptoTickerSelection || [
        'BITCOIN', 'ETHEREUM', 'CARDANO', 'POLKADOT', 'DOGECOIN', 
        'LITECOIN', 'CHAINLINK', 'SOLANA', 'POLYGON', 'AVALANCHE'
      ]);

      // Set favicon preview if one exists
      if (data.faviconUrl) {
        setFaviconPreview(data.faviconUrl);
      }

      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setFormError('Failed to load settings. Please try again.');
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // If there was a previous preview URL that was created with createObjectURL, revoke it
      if (faviconPreview && faviconPreview.startsWith('blob:')) {
        URL.revokeObjectURL(faviconPreview);
      }

      setFaviconFile(file);

      // Create and set preview URL
      const previewUrl = URL.createObjectURL(file);
      setFaviconPreview(previewUrl);
    }
  };

  const handleCryptoChange = (cryptoValue: string, isChecked: boolean) => {
    let newSelection;
    if (isChecked) {
      newSelection = [...selectedCryptos, cryptoValue];
    } else {
      newSelection = selectedCryptos.filter(crypto => crypto !== cryptoValue);
    }
    setSelectedCryptos(newSelection);
    setValue('cryptoTickerSelection', newSelection);
  };

  const handleSelectAllCryptos = () => {
    const allCryptoValues = availableCryptos.map(crypto => crypto.value);
    setSelectedCryptos(allCryptoValues);
    setValue('cryptoTickerSelection', allCryptoValues);
  };

  const handleDeselectAllCryptos = () => {
    setSelectedCryptos([]);
    setValue('cryptoTickerSelection', []);
  };

  const onSubmit = async (data: SettingsForm) => {
    try {
      setFormError(null);
      setSuccessMessage(null);
      
      // Handle image upload first if there's a new file
      if (faviconFile) {
        const formData = new FormData();
        formData.append('file', faviconFile);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload favicon image');
        }
        
        const uploadResult = await uploadResponse.json();
        data.faviconUrl = uploadResult.url; // Use the URL returned from upload
        
        // Update the preview with the new URL
        if (faviconPreview && faviconPreview.startsWith('blob:')) {
          URL.revokeObjectURL(faviconPreview);
        }
        setFaviconPreview(uploadResult.url);
      }

      // Include selected cryptocurrencies in the data
      data.cryptoTickerSelection = selectedCryptos;

      // Save the settings
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save settings');
      }

      setSuccessMessage('Settings saved successfully.');
    } catch (error) {
      console.error('Failed to save settings:', error);
      setFormError('Failed to save settings. Please try again.');
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
      <h2 className="admin-heading">Site Settings</h2>

      <div className="admin-container">
        {formError && (
          <div className="bg-red-500 text-white p-3 rounded-md mb-4 flex items-center">
            {formError}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500 text-white p-3 rounded-md mb-4 flex items-center">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="border-b border-[#404055] pb-6">
            <h3 className="text-xl font-semibold mb-4">Appearance</h3>
            
            <div className="form-group">
              <label htmlFor="favicon" className="form-label">
                Favicon
              </label>
              <div className="flex flex-col md:flex-row items-start gap-4">
                <div className="flex-1">
                  <input
                    type="file"
                    id="faviconFile"
                    accept="image/*,.ico"
                    onChange={handleFileChange}
                    className="w-full"
                  />
                  <input
                    {...register("faviconUrl")}
                    type="hidden"
                    id="faviconUrl"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Upload a new favicon (recommended size: 32x32px or 64x64px).
                    Supported formats: .ico, .png, .svg
                  </p>
                </div>
                {faviconPreview && (
                  <div className="flex-shrink-0">
                    <div className="relative w-16 h-16 rounded-md overflow-hidden bg-white">
                      <Image
                        src={faviconPreview}
                        alt="Favicon preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
              {errors.faviconUrl && (
                <p className="admin-error">{errors.faviconUrl.message}</p>
              )}
            </div>
          </div>

          <div className="border-b border-[#404055] pb-6">
            <h3 className="text-xl font-semibold mb-4">Content Settings</h3>
            
            <div className="form-group">
              <label htmlFor="codeTermLabel" className="form-label">
                Code Term Label
              </label>
              <input
                {...register("codeTermLabel")}
                type="text"
                id="codeTermLabel"
                className="form-input"
                placeholder="e.g., bonus code, promo code, coupon code"
              />
              <p className="text-xs text-gray-400 mt-1">
                This text will be used throughout the site instead of "promo code" (e.g., in titles, descriptions, and forms).
              </p>
              {errors.codeTermLabel && (
                <p className="admin-error">{errors.codeTermLabel.message}</p>
              )}
            </div>
          </div>

          <div className="border-b border-[#404055] pb-6">
            <h3 className="text-xl font-semibold mb-4">Google Analytics Settings</h3>
            
            <div className="form-group">
              <label htmlFor="googleAnalyticsId" className="form-label">
                Google Analytics ID
              </label>
                             <input
                 {...register("googleAnalyticsId")}
                 type="text"
                 id="googleAnalyticsId"
                 className="form-input"
                 placeholder="e.g., G-XXXXXXXXXX or UA-XXXXXXXXX-X"
               />
               <p className="text-xs text-gray-400 mt-1">
                 Enter your Google Analytics tracking ID (GA4: G-XXXXXXXXXX or Universal Analytics: UA-XXXXXXXXX-X) to enable analytics tracking.
               </p>
              {errors.googleAnalyticsId && (
                <p className="admin-error">{errors.googleAnalyticsId.message}</p>
              )}
            </div>
          </div>

          <div className="border-b border-[#404055] pb-6">
            <h3 className="text-xl font-semibold mb-4">Search Analytics Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="form-group">
                <label htmlFor="searchDebounceTime" className="form-label">
                  Search Debounce Time (ms)
                </label>
                <input
                  {...register("searchDebounceTime", { valueAsNumber: true })}
                  type="number"
                  id="searchDebounceTime"
                  className="form-input"
                  min="500"
                  max="10000"
                  step="100"
                  placeholder="2000"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Time in milliseconds to wait after user stops typing before tracking search (500-10000ms).
                </p>
                {errors.searchDebounceTime && (
                  <p className="admin-error">{errors.searchDebounceTime.message}</p>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="searchInstantTrack" className="form-label">
                  Instant Search Tracking
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    {...register("searchInstantTrack")}
                    type="checkbox"
                    id="searchInstantTrack"
                    className="w-4 h-4 text-[#68D08B] bg-[#2c2f3a] border-[#404055] rounded focus:ring-[#68D08B] focus:ring-2"
                  />
                  <span className="text-sm text-gray-300">
                    Track searches immediately on clicks and scroll events
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  When enabled, searches are tracked instantly when users click or scroll, in addition to the debounced tracking.
                </p>
                {errors.searchInstantTrack && (
                  <p className="admin-error">{errors.searchInstantTrack.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="border-b border-[#404055] pb-6">
            <h3 className="text-xl font-semibold mb-4">Cryptocurrency Settings</h3>
            
            <div className="form-group mb-6">
              <label htmlFor="hideCryptoTicker" className="form-label">
                Hide Crypto Ticker
              </label>
              <div className="flex items-center space-x-3">
                <input
                  {...register("hideCryptoTicker")}
                  type="checkbox"
                  id="hideCryptoTicker"
                  className="w-4 h-4 text-[#68D08B] bg-[#2c2f3a] border-[#404055] rounded focus:ring-[#68D08B] focus:ring-2"
                />
                <span className="text-sm text-gray-300">
                  Hide the cryptocurrency price ticker from the website
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                When enabled, the cryptocurrency price ticker will not be displayed on any pages of the website.
              </p>
              {errors.hideCryptoTicker && (
                <p className="admin-error">{errors.hideCryptoTicker.message}</p>
              )}
            </div>

            <div className="form-group mb-6">
              <label htmlFor="hideBuyCryptoButton" className="form-label">
                Hide Buy Crypto Button
              </label>
              <div className="flex items-center space-x-3">
                <input
                  {...register("hideBuyCryptoButton")}
                  type="checkbox"
                  id="hideBuyCryptoButton"
                  className="w-4 h-4 text-[#68D08B] bg-[#2c2f3a] border-[#404055] rounded focus:ring-[#68D08B] focus:ring-2"
                />
                <span className="text-sm text-gray-300">
                  Hide the "Buy Crypto" button from the navigation menu
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                When enabled, the "Buy Crypto" button will not be displayed in the navigation menu on desktop or mobile.
              </p>
              {errors.hideBuyCryptoButton && (
                <p className="admin-error">{errors.hideBuyCryptoButton.message}</p>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="cryptoTickerSelection" className="form-label">
                Select Cryptocurrencies
              </label>
              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={handleSelectAllCryptos}
                  className="text-sm text-gray-400 hover:text-gray-300"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={handleDeselectAllCryptos}
                  className="text-sm text-gray-400 hover:text-gray-300"
                >
                  Deselect All
                </button>
              </div>
              <div className="mt-2">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableCryptos.map((crypto) => (
                    <div key={crypto.value} className="flex items-center space-x-2">
                      <input
                        {...register("cryptoTickerSelection")}
                        type="checkbox"
                        id={`cryptoTickerSelection-${crypto.value}`}
                        value={crypto.value}
                        checked={selectedCryptos.includes(crypto.value)}
                        onChange={(e) => handleCryptoChange(crypto.value, e.target.checked)}
                        className="w-4 h-4 text-[#68D08B] bg-[#2c2f3a] border-[#404055] rounded focus:ring-[#68D08B] focus:ring-2"
                      />
                      <label htmlFor={`cryptoTickerSelection-${crypto.value}`} className="text-sm text-gray-300">
                        {crypto.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Select cryptocurrencies to display in the ticker.
              </p>
              {errors.cryptoTickerSelection && (
                <p className="admin-error">{errors.cryptoTickerSelection.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="admin-button"
            >
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 