'use client';

import PageCheckAdmin from '@/components/admin/PageCheckAdmin';
import PageCheckSettings from '@/components/PageCheckSettings';

export default function PageChecksAdminPage() {
  return (
    <div className="space-y-6">
      {/* Page Check Settings */}
      <PageCheckSettings />
      
      {/* Page Check Admin */}
      <div className="bg-[#292932] shadow-md rounded-lg p-6 border border-[#404055]">
        <PageCheckAdmin />
      </div>
    </div>
  );
} 