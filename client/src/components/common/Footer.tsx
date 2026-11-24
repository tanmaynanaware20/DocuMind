import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-10">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-3">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <FileText className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight">DocuMind</span>
            </Link>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              Enterprise Document Management and Knowledge Assistant. Ingest, organize, search,
              compare, and extract intelligence from your documents from one unified workspace.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-400 text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                All Systems Operational
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-medium">
                <Shield className="w-3 h-3 text-blue-400" />
                SOC 2 Type II
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Product</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/features" className="hover:text-white transition-colors">Document Extraction</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">Semantic RAG &amp; Citations</Link></li>
              <li><Link to="/features" className="hover:text-white transition-colors">Contract Comparison</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing Plans</Link></li>
            </ul>
          </div>

          {/* Solutions */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Solutions</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/solutions#legal" className="hover:text-white transition-colors">Legal Teams</Link></li>
              <li><Link to="/solutions#finance" className="hover:text-white transition-colors">Finance &amp; Private Equity</Link></li>
              <li><Link to="/solutions#hr" className="hover:text-white transition-colors">Human Resources</Link></li>
              <li><Link to="/solutions#operations" className="hover:text-white transition-colors">Operations</Link></li>
              <li><Link to="/solutions#education" className="hover:text-white transition-colors">Education &amp; Research</Link></li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">Trust &amp; Legal</h4>
            <ul className="space-y-1.5 text-xs">
              <li><Link to="/security" className="hover:text-white transition-colors">Security &amp; Zero Retention</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms and Conditions</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© 2026 DocuMind Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms and Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
