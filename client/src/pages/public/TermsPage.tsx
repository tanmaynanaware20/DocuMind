import React from 'react';
import { Badge } from '../../components/common/Badge';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <Badge variant="primary" className="mb-2">Terms of Service</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Terms and Conditions</h1>
          <p className="text-xs text-slate-500 mt-1">Last Updated: November 24, 2026 • DocuMind SaaS Master Agreement</p>
        </div>

        <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Master Subscription Agreement</h2>
            <p>
              These Terms and Conditions govern your access to and use of the DocuMind platform and related document intelligence services. By accessing or using DocuMind, you agree to be bound by these terms on behalf of your organization.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Customer Data Ownership</h2>
            <p>
              You retain full, exclusive ownership of all title, rights, and intellectual property in and to all documents, files, and text uploaded to DocuMind. DocuMind acquires no intellectual property rights in your customer documents.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Service Level Agreement (SLA)</h2>
            <p>
              DocuMind guarantees a Monthly Uptime Percentage of at least 99.9% for Professional tiers and 99.99% for Enterprise accounts, subject to scheduled maintenance windows announced in advance.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Acceptable Use Policy</h2>
            <p>
              You agree not to upload malware, malicious executables, or materials that violate applicable law. You are solely responsible for ensuring you have requisite authority to process confidential documents uploaded to your workspace.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">5. Governing Law and Dispute Resolution</h2>
            <p>
              This Agreement is governed by the laws of the State of Delaware without regard to conflict of law principles. Any dispute arising under this Agreement shall be resolved through binding commercial arbitration in accordance with AAA rules.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
