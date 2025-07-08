const { execSync } = require('child_process');

const migrations = [
  '20250428152410_initial_migration',
  '20250428155505_add_affiliate_link_and_reviews',
  '20250520091154_init',
  '20250522083523_add_casino_display_order',
  '20250522150519_add_offer_tracking',
  '20250524064054_add_screenshots_and_seo_fields',
  '20250524075134_add_settings_model',
  '20250524081656_add_featured_image_and_analytics',
  '20250524082703_add_featured_image',
  '20250524121511_add_user_features',
  '20250524122624_add_nextauth_tables',
  '20250524154019_add_path_to_tracking',
  '20250525182742_add_legal_pages',
  '20250525194600_add_contact_submissions',
  '20250526111649_add_casino_editable_content',
  '20250602174653_add_key_features',
  '20250603095940_add_featured_image_to_casino',
  '20250603112454_add_custom_table_fields',
  '20250607085319_change_bonus_type_to_array',
  '20250607145852_add_slug_redirects',
  '20250607153223_add_code_term_label',
  '20250607154219_add_casino_code_term_label',
  '20250607161437_add_deposit_bonus_type',
  '20250607202222_add_newsletter_model',
  '20250608092831_add_page_checks_and_profile_pictures',
  '20250608093827_add_password_field',
  '20250608104902_add_auto_check_settings',
  '20250608130953_add_user_bio',
  '20250608131917_add_username_field',
  '20250608134146_add_search_tracking',
  '20250608140210_add_search_settings',
  '20250609135121_add_casino_reports',
  '20250609142258_update_report_enums',
  '20250609180244_add_founded_year'
];

console.log('🔄 Marking all migrations as applied...');

migrations.forEach((migration, index) => {
  try {
    console.log(`✅ Marking ${migration} as applied (${index + 1}/${migrations.length})`);
    execSync(`npx prisma migrate resolve --applied "${migration}"`, { stdio: 'pipe' });
  } catch (error) {
    console.log(`⚠️  ${migration} already applied or error:`, error.message);
  }
});

console.log('🎉 All migrations marked as applied!'); 