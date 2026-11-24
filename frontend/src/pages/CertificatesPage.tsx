import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Certificate } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  Download,
  Printer,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  X,
  FileCheck2,
} from 'lucide-react';

export const CertificatesPage: React.FC = () => {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCertificates()
      .then(setCertificates)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Certificates & Achievements
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Cryptographically verified credentials awarded for algorithmic excellence and assessment completion.
        </p>
      </div>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {certificates.map((cert) => (
          <div
            key={cert.id}
            className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition duration-200 flex flex-col justify-between group shadow-xl relative overflow-hidden"
          >
            {/* Ambient corner glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-cyan-300 mb-4 shadow-md shadow-indigo-600/10">
                <Award className="w-6 h-6" />
              </div>

              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {cert.grade}
              </span>

              <h3 className="text-lg font-bold text-white mt-3 mb-2 group-hover:text-indigo-300 transition-colors">
                {cert.title}
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Field: {cert.category}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">{cert.credential_id}</span>
              <button
                onClick={() => setSelectedCert(cert)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition active:scale-95"
              >
                View Certificate
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Official Certificate Modal */}
      {selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#080C16] border border-slate-700 rounded-3xl p-6 sm:p-10 shadow-2xl flex flex-col relative overflow-hidden text-center">
            {/* Close Button */}
            <button
              onClick={() => setSelectedCert(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Certificate Canvas Box */}
            <div className="p-8 sm:p-12 rounded-2xl border-4 border-double border-indigo-500/50 bg-gradient-to-b from-[#0B0F1E] to-[#0A0D17] relative shadow-inner">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-400 p-0.5 mx-auto mb-4">
                <div className="w-full h-full bg-[#0B0F1E] rounded-full flex items-center justify-center text-cyan-300">
                  <ShieldCheck className="w-8 h-8" />
                </div>
              </div>

              <p className="text-xs font-mono tracking-widest uppercase text-indigo-400 font-semibold mb-1">
                Official Credential of Completion
              </p>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-6">
                Coding Task Factory
              </h2>

              <p className="text-xs text-slate-400">This certifies that</p>
              <p className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-indigo-200 to-cyan-200 my-2 font-serif">
                {selectedCert.recipient_name || user?.full_name || 'Alex Chen'}
              </p>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed mb-6">
                has successfully completed all rigorous algorithmic benchmarks and automated assessment suites for:
              </p>

              <h4 className="text-base sm:text-lg font-bold text-indigo-300 mb-2">
                {selectedCert.title}
              </h4>
              <p className="text-xs text-emerald-400 font-mono font-semibold mb-8">
                Graduation Grade: {selectedCert.grade}
              </p>

              <div className="pt-6 border-t border-slate-800 grid grid-cols-2 text-left font-mono text-[11px] text-slate-400">
                <div>
                  <p className="text-slate-500">Issued On:</p>
                  <p className="text-white font-semibold">{new Date(selectedCert.issue_date || Date.now()).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500">Credential ID:</p>
                  <p className="text-indigo-400 font-semibold">{selectedCert.credential_id}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition active:scale-95"
              >
                <Printer className="w-4 h-4" />
                Print / Save PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
