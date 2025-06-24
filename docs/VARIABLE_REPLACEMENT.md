# Variable Replacement System

This system allows you to use dynamic variables in casino page text content that get automatically replaced with real data when the page is rendered.

## Available Variables

### Casino Information
- `[name]` or `[casino_name]` - Casino name (e.g. "BitStarz")
- `[rating]` - Casino rating rounded to nearest whole number (e.g. "4")
- `[rating_stars]` - Star rating display (e.g. "★★★★")
- `[website]` - Casino website URL
- `[founded]` or `[founded_year]` - Year the casino was founded
- `[wagering]` or `[wagering_requirement]` - Wagering requirement (e.g. "35x")
- `[min_deposit]` or `[minimum_deposit]` - Minimum deposit amount

### Bonus Information
- `[bonus]` or `[bonus_title]` - Bonus title (e.g. "5 BTC + 200 Free Spins")
- `[bonus_code]` or `[code]` - Bonus promo code (e.g. "WELCOME100")
- `[bonus_value]` or `[value]` - Bonus value/amount
- `[bonus_type]` - Primary bonus type (e.g. "welcome")
- `[bonus_types]` - All bonus types separated by commas

### Analytics & Popularity
- `[times_claimed_today]` or `[claimed_today]` - Number of times claimed today
- `[times_claimed_weekly]` or `[claimed_this_week]` - Number of times claimed this week
- `[times_claimed_total]` or `[total_claims]` - Total number of times claimed
- `[last_claimed]` - When the bonus was last claimed (formatted date)

### Date & Time
- `[current_date]` or `[today]` - Current date (e.g. "January 15, 2024")
- `[current_month]` or `[this_month]` - Current month (e.g. "January")
- `[current_year]` or `[this_year]` - Current year (e.g. "2024")
- `[current_day]` - Current day of week (e.g. "Monday")

### Dynamic Content
- `[people_online]` or `[users_online]` or `[online_now]` - Random number of people online (50-200)
- `[active_today]` - Random number of active users today (100-600)

## Usage Examples

### Basic Usage
```markdown
Welcome to [name]! This [rating_stars] rated casino was founded in [founded_year] and offers the [bonus] bonus.
```

Output: "Welcome to BitStarz! This ★★★★ rated casino was founded in 2014 and offers the 5 BTC + 200 Free Spins bonus."

### Analytics in Content
```markdown
This popular bonus has been claimed [times_claimed_today] times today and [times_claimed_total] times in total. Last claimed: [last_claimed].
```

Output: "This popular bonus has been claimed 5 times today and 127 times in total. Last claimed: Jan 15, 2024, 2:30 PM."

### Dynamic Content
```markdown
Join [people_online] players currently online at [name] and claim your [bonus] today!
```

Output: "Join 142 players currently online at BitStarz and claim your 5 BTC + 200 Free Spins today!"

### Date-Based Content
```markdown
[name] is offering exclusive bonuses for [current_month] [current_year]. Don't miss out!
```

Output: "BitStarz is offering exclusive bonuses for January 2024. Don't miss out!"

## Where Variables Work

Variables can be used in any of these casino page text sections:
- About Casino content (`aboutContent`)
- How to Redeem content (`howToRedeemContent`)
- Bonus Details content (`bonusDetailsContent`)
- Terms & Conditions content (`termsContent`)
- FAQ content (`faqContent`)
- Key Features text
- Any custom content fields

## Case Sensitivity

All variables are case-insensitive, so `[NAME]`, `[name]`, and `[Name]` all work the same way.

## Fallback Values

If data is not available for a variable:
- Text variables return empty string
- Number variables return "0"
- Date variables show "Never" for last claimed
- Dynamic variables generate random values within reasonable ranges

## Implementation Notes

- Variables are processed before other text processing (links, code detection)
- All variables work in headers, paragraphs, lists, and FAQ content
- Variables are automatically HTML-escaped for security
- The system is designed to be fast and efficient for real-time rendering 