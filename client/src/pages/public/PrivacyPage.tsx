import React from 'react';
import { Shield, Lock, CheckCircle2 } from 'lucide-react';
import { Badge } from '../../components/common/Badge';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div>
          <Badge variant="primary" className="mb-2">Legal &amp; Privacy</Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-500 mt-1">Effective Date: November 24, 2026 • Version 3.2</p>
        </div>

        <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-6 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">1. Zero-Retention &amp; Zero-Training Guarantee</h2>
            <p>
              DocuMind operates under a strict Zero-Data-Retention and Zero-Training policy. Customer documents, vectorized embeddings, extracted information, and conversational prompts are strictly isolated within Customer dedicated tenant boundaries. Customer data is NEVER utilized to train, fine-tune, or evaluate foundational artificial intelligence models.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">2. Information We Collect</h2>
            <p>
              When you use DocuMind, we collect information required to operate your account and deliver document intelligence services:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Account identity: Name, work email address, company name, and encrypted authentication tokens.</li>
              <li>Customer documents: Files uploaded by you (PDF, DOCX, TXT, CSV, XLSX) for parsing, indexing, and comparison.</li>
              <li>Operational logs: Audit logs tracking upload timestamps, query metadata, and system usage.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">3. Data Encryption Standards</h2>
            <p>
              All customer documents and vector representations are encrypted at rest using AES-256 with hardware security module (HSM) key isolation. All network transmissions are strictly encrypted via TLS 1.3 with Perfect Forward Secrecy. Enterprise customers retain the ability to Bring Your Own Key (BYOK) via AWS KMS or Azure Key Vault.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">4. Regional Data Residency</h2>
            <p>
              We provide customer-selectable data residency guarantees across AWS US-East (Northern Virginia) and AWS EU-Central (Frankfurt, Germany) in compliance with the EU General Data Protection Regulation (GDPR) and Standard Contractual Clauses (SCCs Module 2).
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">5. Contact Data Protection Officer</h2>
            <p>
              If you have inquiries regarding our data handling practices or wish to execute an enterprise Business Associate Agreement (BAA) or Data Processing Addendum (DPA), please contact our Data Protection Office at <strong>privacy@documind.io</strong>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
