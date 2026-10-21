import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Database,
  Lock,
  User,
  Server,
  Key,
  CheckCircle2,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { api } from '../services/api.ts';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [dbInfo, setDbInfo] = useState<{ status: string; database: string }>({
    status: 'checking',
    database: 'Checking...',
  });

  useEffect(() => {
    api.checkHealth().then(setDbInfo).catch(() => {
      setDbInfo({ status: 'offline', database: 'Offline' });
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">System & Administrator Configuration</h2>
        <p className="text-xs text-slate-500 mt-1">
          Review administrator credentials, storage topology, and active security controls.
        </p>
      </div>

      {/* Admin Profile */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-800">
          <User className="w-4 h-4 text-blue-600" />
          <span>Active Administrator Identity</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Administrator Name</span>
            <span className="font-bold text-slate-900 text-sm">{user?.name || 'System Administrator'}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Email Address</span>
            <span className="font-bold text-slate-900 text-sm">{user?.email || 'admin@reportmanagement.internal'}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-slate-500 block text-[11px]">Privilege Role</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-100 text-blue-800 mt-0.5">
              Admin Exclusive (RBAC)
            </span>
          </div>
        </div>
      </div>

      {/* Database Topology */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-800">
          <Database className="w-4 h-4 text-blue-600" />
          <span>Database & Persistence Architecture</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <h4 className="font-bold text-slate-900 text-sm">Engine: {dbInfo.database}</h4>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {dbInfo.database.includes('Atlas')
                ? 'Connected directly to external MongoDB Atlas cloud cluster with Mongoose ODM.'
                : 'Operating in High-Reliability Persistent JSON Store mode (.data/reports_db.json). Zero setup required, fully persistent across restarts.'}
            </p>
          </div>

          <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-emerald-700 shrink-0">
            Online & Ready
          </div>
        </div>

        {/* MongoDB Atlas Setup Guide */}
        <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2 text-xs text-blue-950">
          <div className="flex items-center gap-1.5 font-bold text-blue-900">
            <Code2 className="w-4 h-4" />
            <span>How to connect your own MongoDB Atlas Cloud Cluster</span>
          </div>
          <p className="leading-relaxed">
            To connect to MongoDB Atlas, create a free database at{' '}
            <a
              href="https://www.mongodb.com/cloud/atlas"
              target="_blank"
              rel="noreferrer"
              className="underline font-semibold hover:text-blue-700"
            >
              mongodb.com/cloud/atlas
            </a>
            , copy your connection string, and set it in your environment or <code className="bg-blue-100 px-1 py-0.5 rounded font-mono">.env</code>:
          </p>
          <pre className="bg-slate-900 text-slate-100 p-2.5 rounded-lg font-mono text-[11px] overflow-x-auto">
            MONGO_URI="mongodb+srv://&lt;username&gt;:&lt;password&gt;@cluster0.mongodb.net/report_management?retryWrites=true&w=majority"
          </pre>
          <p className="text-[11px] text-blue-800">
            The server automatically tests the connection upon startup and switches to MongoDB Atlas Mongoose models instantly.
          </p>
        </div>
      </div>

      {/* InfinityFree DNS & Custom Domain Configuration */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800">
            <ExternalLink className="w-4 h-4 text-blue-600" />
            <span>Custom Domain & DNS Setup (InfinityFree)</span>
          </div>
          <span className="text-[11px] px-2 py-0.5 bg-blue-100 text-blue-800 font-semibold rounded">
            DNS Integration
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          You can use your domain or free subdomain registered on{' '}
          <a
            href="https://www.infinityfree.com/"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 font-bold underline hover:text-blue-800"
          >
            InfinityFree.com
          </a>{' '}
          to point to this Report Management System via <strong>CNAME Records</strong> or <strong>Nameservers</strong>.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <span className="font-bold text-slate-900 block">Method A: CNAME Record (Recommended)</span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              In your InfinityFree Control Panel (cPanel/VistaPanel) &gt; <strong>CNAME Records</strong>:
            </p>
            <div className="space-y-1 font-mono text-[11px] bg-slate-900 text-slate-200 p-2.5 rounded">
              <div><strong>Source:</strong> reports (or @ for root)</div>
              <div><strong>Type:</strong> CNAME</div>
              <div><strong>Destination:</strong> {window.location.hostname}</div>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <span className="font-bold text-slate-900 block">Method B: InfinityFree Nameservers</span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              If managing your full domain at your registrar, use InfinityFree nameservers:
            </p>
            <div className="space-y-1 font-mono text-[11px] bg-slate-900 text-slate-200 p-2.5 rounded">
              <div>ns1.epizy.com</div>
              <div>ns2.epizy.com</div>
            </div>
            <p className="text-[10px] text-slate-500">
              Then create the CNAME record inside InfinityFree pointing to this application.
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 space-y-1">
          <span className="font-bold block">Important Note on CORS & SSL:</span>
          <p className="text-[11px] leading-relaxed">
            After your InfinityFree DNS propagates, update <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">CLIENT_ORIGIN</code> in your <code className="font-mono bg-amber-100 px-1 py-0.5 rounded">.env</code> to match your InfinityFree domain (e.g. <code className="font-mono">https://yourdomain.epizy.com</code>).
            InfinityFree also provides free SSL Certificates under the <strong>Free SSL Certificates</strong> tab in their client area.
          </p>
        </div>
      </div>

      {/* Security Specifications */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Active Security Protections</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Bcrypt Password Hashing</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Passwords hashed with salt factor 10. Cleartext passwords are never stored.</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Signed JWT Authorization</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Every report CRUD, analytics, and export endpoint is guarded by token verification.</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Login Rate Limiting</span>
              <p className="text-[11px] text-slate-500 mt-0.5">Brute-force protection limits failed login attempts to 10 per minute per IP address.</p>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-900">Zero Public Registrations</span>
              <p className="text-[11px] text-slate-500 mt-0.5">No public sign-up endpoints exist. Admin access is strictly provisioned by server-side seed.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
