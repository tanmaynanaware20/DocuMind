import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, Key, Server, CheckCircle2, FileCheck, EyeOff, Globe } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const SecurityPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <section className="pt-16 pb-20 border-b border-slate-200 dark:border-slate-800 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge variant="success" className="mb-3">Security & Compliance First</Badge>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Zero-Retention Architecture for Confidential Data
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
            DocuMind was designed from day one to meet the rigorous security requirements of regulated finance, legal, and healthcare institutions.
          </p>
          <div className="flex items-center justify-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              SOC2 Type II Certified
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              ISO/IEC 27001:2022
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-semibold">
              <Globe className="w-3.5 h-3.5 text-sky-500" />
              GDPR & EU SCCs Compliant
            </span>
          </div>
        </div>
      </section>

      {/* 4 Pillars */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pillar 1 */}
          <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <EyeOff className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">1. Zero-Training Policy Guarantee</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Your documents, search queries, prompts, and extracted entities are strictly isolated within your organization’s encrypted tenant boundary. We legally contractually bind that customer data is never used to train, tune, or evaluate foundational LLM weights.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Key className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">2. Encryption at Rest & In Transit (BYOK)</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              All documents, vector embeddings, and database records are encrypted with AES-256. Network communication uses TLS 1.3 with Perfect Forward Secrecy. Enterprise customers can bring their own keys via AWS KMS or Azure Key Vault for full cryptographic revocation.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400 flex items-center justify-center">
              <Server className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">3. Regional Data Residency & Single-Tenant VPC</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Choose where your document pipeline executes. We offer dedicated hosting in AWS US-East (Virginia) or EU-Central (Frankfurt). For highly sensitive workloads, DocuMind can be deployed in a dedicated VPC with private peering.
            </p>
          </div>

          {/* Pillar 4 */}
          <div className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">4. Immutable Audit Trails & RBAC</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Every query, document upload, modification, and export event is cryptographically timestamped and logged. Export comprehensive audit activity in CSV or JSON format for internal compliance reviews and external regulatory audits.
            </p>
          </div>
        </div>

        {/* Security Whitepaper Download Box */}
        <div className="mt-12 p-8 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h4 className="text-lg font-bold">Download the Complete Security & Governance Whitepaper</h4>
            <p className="text-xs text-slate-400 mt-1">Review our architecture diagrams, threat model, penetration testing results, and SOC2 auditor letters.</p>
          </div>
          <Link to="/app">
            <Button variant="primary" className="shrink-0">
              Access Document in Workspace
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};
