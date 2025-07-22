# 🌐 Translation Guide - Manual Editing

## ✅ Complete Translation System Now Working!

Your website now has **REAL translations** - not fake indicators. Every word on the frontend changes language when users visit language URLs.

## 🎯 How It Works

**Language URLs:**
- `/tr/` = Turkish homepage  
- `/tr/bets.io` = Turkish casino page
- `/pl/contact` = Polish contact page
- `/es/spin` = Spanish spin wheel

**What Gets Translated:**
- ✅ Navigation menu (Home, Contact, Terms, etc.)
- ✅ Homepage titles and descriptions  
- ✅ Casino buttons ("Get Bonus" → "Bonus Al")
- ✅ Footer links and copyright
- ✅ Error messages and loading text
- ✅ Search placeholders and filters

## 📝 Manual Editing Guide

### 1. Translation Files Location
```
src/messages/
├── en.json    (English - Master)
├── tr.json    (Turkish)
├── pl.json    (Polish)
└── [add more languages]
```

### 2. Edit Translations

**Example: Change Turkish homepage title**

Edit `src/messages/tr.json`:
```json
{
  "homepage": {
    "title": "NEW TURKISH TITLE HERE",
    "description": "NEW TURKISH DESCRIPTION HERE",
    "welcomeTitle": "Custom Welcome Message"
  }
}
```

**Save file → Changes appear immediately on `/tr/` pages**

### 3. Add New Language

**Step 1:** Copy `src/messages/en.json` to `src/messages/es.json`

**Step 2:** Translate all values to Spanish:
```json
{
  "nav": {
    "home": "Inicio",
    "contact": "Contacto", 
    "terms": "Términos"
  },
  "homepage": {
    "title": "Mejores Bonos de Casino Bitcoin 2025",
    "description": "Encuentra los mejores bonos..."
  }
}
```

**Step 3:** Add to supported languages in `src/contexts/TranslationContext.tsx`:
```typescript
const messages: Record<Locale, Messages> = {
  en: enMessages,
  tr: trMessages,
  pl: plMessages,
  es: esMessages, // Add this line
};
```

**Step 4:** Update language lists in page components:
- `src/app/[slug]/page.tsx` (line ~8)
- `src/app/[slug]/[casino]/page.tsx` (line ~20)  
- `src/app/[slug]/contact/page.tsx` (line ~18)

Change:
```typescript
const supportedLanguages = ['pl', 'tr', 'es', 'pt', 'vi', 'ja', 'ko', 'fr'];
```

## 🔧 Advanced Customization

### Dynamic Content (Variables)
```json
{
  "homepage": {
    "welcomeDescription": "Best bonuses in {year}",
    "trustedBy": "Trusted by {count}+ players"  
  }
}
```

Code automatically replaces `{year}` with current year and `{count}` with player count.

### Section-Specific Translations

**Navigation:**
```json
"nav": {
  "home": "Ana Sayfa",
  "spin": "Çark Çevir",
  "submitBonus": "Bonus Gönder"
}
```

**Casino Pages:**  
```json
"casino": {
  "getBonus": "Bonus Al",
  "copyCode": "Kodu Kopyala",
  "visitSite": "Siteyi Ziyaret Et"
}
```

**Common UI:**
```json
"common": {
  "loading": "Yükleniyor...",
  "search": "Ara",
  "save": "Kaydet"
}
```

## 🚀 Testing Your Changes

1. **Edit translation file** (e.g., `src/messages/tr.json`)
2. **Save file** 
3. **Visit language URL** (e.g., `https://yoursite.com/tr/`)
4. **See changes immediately** - no restart needed!

## 📋 Translation Checklist

**For each new language:**
- [ ] Create `src/messages/[lang].json` file
- [ ] Translate ALL keys from English version  
- [ ] Add language to `TranslationContext.tsx`
- [ ] Update `supportedLanguages` arrays in page components
- [ ] Test key pages: homepage, casino page, contact
- [ ] Verify navigation menu translates
- [ ] Check footer translations

## 🎨 Language-Specific Customization

You can customize more than just text:

**Example: Different homepage layout for Turkish**
```typescript
// In TranslatedHomePage.tsx
const { t, locale } = useTranslation();

{locale === 'tr' && (
  <div className="turkish-specific-banner">
    Special content for Turkish users
  </div>
)}
```

## ❓ Common Issues

**Translation not showing?**
- Check JSON syntax (missing commas, brackets)
- Ensure translation key exists in English file first  
- Verify language is in `supportedLanguages` array

**Page not found for `/tr/page`?**
- Language must be in `supportedLanguages` in that page's component
- Check console for 404 errors

## 🎯 Translation Keys Reference

All available translation keys are defined in `src/messages/en.json`. This is the master list - every key here can be translated in other language files.

**Key sections:**
- `nav.*` - Navigation menu
- `homepage.*` - Homepage content  
- `casino.*` - Casino page buttons/text
- `common.*` - Shared UI elements
- `footer.*` - Footer content

---

**🎉 Your site now has REAL multilingual support! Users see completely translated interfaces when visiting language URLs.** 