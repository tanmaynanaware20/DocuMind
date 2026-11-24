import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, X, Shield, ArrowRight, HelpCircle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';

export const PricingPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

  const tiers = [
    {
      name: 'Starter',
      description: 'Ideal for solo attorneys, compliance researchers, and small boutique consultancies.',
      monthlyPrice: 49,
      yearlyPrice: 39,
      cta: 'Start 14-Day Free Trial',
      highlighted: false,
      features: [
        'Up to 100 documents / month',
        '5 GB encrypted cloud storage',
        'Single-document Q&A with citations',
        'Standard clause difference view',
        'Community & email support (48h SLA)',
      ]
    },
    {
      name: 'Professional',
      description: 'Engineered for legal teams, private equity analysts, and corporate operations.',
      monthlyPrice: 119,
      yearlyPrice: 99,
      cta: 'Start Free Trial with Pro',
      highlighted: true,
      badge: 'Recommended',
      features: [
        'Unlimited documents & queries',
        '50 GB encrypted cloud storage',
        'Multi-document cross-collection RAG',
        'Automated redlining & side-by-side diff',
        'Unlimited collections & tag workflows',
        'Full activity audit logs & CSV export',
        'Priority email & chat support (4h SLA)',
      ]
    },
    {
      name: 'Enterprise',
      description: 'For multinational enterprises with custom security, VPC, and governance requirements.',
      monthlyPrice: 'Custom',
      yearlyPrice: 'Custom',
      cta: 'Contact Enterprise Sales',
      highlighted: false,
      features: [
        'Custom document capacity & storage limits',
        'Bring Your Own Key (BYOK) AES-256 KMS',
        'Dedicated single-tenant VPC deployment',
        'EU & US data residency guarantees',
        'Custom fine-tuned OCR & legal models',
        'Dedicated customer success manager & 99.99% SLA',
      ]
    }
  ];

  const featureMatrix = [
    {
      category: 'Core Document Intelligence',
      rows: [
        { feature: 'Supported formats (PDF, DOCX, TXT, CSV, MD)', starter: true, pro: true, enterprise: true },
        { feature: 'Neural Layout-Aware OCR (tables & footnotes)', starter: true, pro: true, enterprise: true },
        { feature: 'Exact page & bounding-box citations', starter: true, pro: true, enterprise: true },
        { feature: 'Cross-document multi-file synthesis', starter: false, pro: true, enterprise: true },
        { feature: 'Contract clause diff & semantic redline', starter: 'Basic', pro: 'Advanced', enterprise: 'Custom Rules' },
      ]
    },
    {
      category: 'Security & Enterprise Governance',
      rows: [
        { feature: 'Zero-Retention LLM training guarantee', starter: true, pro: true, enterprise: true },
        { feature: 'SOC2 Type II & ISO 27001 certified', starter: true, pro: true, enterprise: true },
        { feature: 'Role-based access controls (RBAC)', starter: false, pro: true, enterprise: true },
        { feature: 'Automated PII / Sensitive data redaction', starter: false, pro: true, enterprise: true },
        { feature: 'Bring Your Own Key (BYOK) KMS encryption', starter: false, starterText: 'No', pro: 'Add-on', enterprise: true },
        { feature: 'Single-Tenant VPC deployment', starter: false, pro: false, enterprise: true },
        { feature: 'Regional Data Residency (US / EU Frankfurt)', starter: false, pro: true, enterprise: true },
      ]
    },
    {
      category: 'Support & SLAs',
      rows: [
        { feature: 'Uptime SLA', starter: '99.5%', pro: '99.9%', enterprise: '99.99%' },
        { feature: 'Support channel', starter: 'Email (48h)', pro: 'Priority Chat (4h)', enterprise: '24/7 Dedicated Slack/Phone' },
        { feature: 'Dedicated Solutions Architect', starter: false, pro: false, enterprise: true },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Hero */}
      <section className="pt-16 pb-16 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Badge variant="primary" className="mb-3">Predictable SaaS Pricing</Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
          Invest in High-Velocity Document Decisions
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8">
          Simple, transparent pricing. Every plan includes our zero-retention privacy promise and SOC 2 Type II compliance.
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className={`text-sm ${billingCycle === 'monthly' ? 'font-bold' : 'text-slate-500'}`}>Monthly</span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="w-12 h-6 bg-slate-300 dark:bg-slate-700 rounded-full p-1 transition-colors relative"
          >
            <div
              className={`w-4 h-4 rounded-full bg-indigo-600 transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-sm flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'font-bold' : 'text-slate-500'}`}>
            Annual (Save 20%)
          </span>
        </div>
      </section>

      {/* Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-20">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`p-8 rounded-2xl flex flex-col justify-between ${
                tier.highlighted
                  ? 'border-2 border-indigo-600 bg-white dark:bg-slate-900 shadow-xl relative'
                  : 'border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'
              }`}
            >
              {tier.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-indigo-600 text-white text-[11px] font-bold tracking-wide uppercase">
                  {tier.badge}
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold">{tier.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 h-10">{tier.description}</p>
                <div className="my-6">
                  {typeof tier.monthlyPrice === 'number' ? (
                    <div>
                      <span className="text-4xl font-extrabold">
                        ${billingCycle === 'yearly' ? tier.yearlyPrice : tier.monthlyPrice}
                      </span>
                      <span className="text-xs text-slate-500"> / user / month</span>
                      {billingCycle === 'yearly' && (
                        <div className="text-[11px] text-emerald-600 font-medium mt-1">Billed annually</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-3xl font-extrabold py-1">{tier.monthlyPrice}</div>
                  )}
                </div>

                <ul className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link to="/register" className="mt-8">
                <Button variant={tier.highlighted ? 'primary' : 'outline'} className="w-full">
                  {tier.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>

        {/* Feature Comparison Table */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Detailed Plan Comparison</h3>
            <p className="text-xs text-slate-500 mt-1">Compare technical capabilities across Starter, Professional, and Enterprise.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 font-semibold text-xs text-slate-500 uppercase tracking-wider">
                  <th className="p-4 w-1/2">Capability</th>
                  <th className="p-4 text-center">Starter</th>
                  <th className="p-4 text-center text-indigo-600 dark:text-indigo-400">Professional</th>
                  <th className="p-4 text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {featureMatrix.map((cat, cIdx) => (
                  <React.Fragment key={cIdx}>
                    <tr className="bg-slate-50/70 dark:bg-slate-900/40">
                      <td colSpan={4} className="p-3 font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        {cat.category}
                      </td>
                    </tr>
                    {cat.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                        <td className="p-4 text-xs font-medium text-slate-800 dark:text-slate-200">{row.feature}</td>
                        <td className="p-4 text-center text-xs">
                          {row.starter === true ? (
                            <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                          ) : row.starter === false ? (
                            <X className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                          ) : (
                            <span className="font-medium text-slate-600 dark:text-slate-300">{row.starter}</span>
                          )}
                        </td>
                        <td className="p-4 text-center text-xs">
                          {row.pro === true ? (
                            <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mx-auto" />
                          ) : row.pro === false ? (
                            <X className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                          ) : (
                            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{row.pro}</span>
                          )}
                        </td>
                        <td className="p-4 text-center text-xs">
                          {row.enterprise === true ? (
                            <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                          ) : row.enterprise === false ? (
                            <X className="w-4 h-4 text-slate-300 dark:text-slate-600 mx-auto" />
                          ) : (
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{row.enterprise}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
