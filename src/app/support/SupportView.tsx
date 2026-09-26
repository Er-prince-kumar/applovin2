'use client';

import React, { useState } from 'react';
import { HelpCircle, Mail, MessageSquare, Send, CheckCircle2, ShieldAlert, BookOpen } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function SupportView() {
  const { toast } = useToast();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('PAYOUT');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      toast('Support ticket submitted! Ticket #TK-' + Math.floor(10000 + Math.random() * 90000), 'success');
    }, 600);
  }

  return (
    <div className="max-w-4xl space-y-8">
      {/* Help Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-5">
          <BookOpen className="w-6 h-6 text-emerald-400 mb-3" />
          <h4 className="text-sm font-bold text-white mb-1">Traffic Quality Policy</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Ensure your traffic origins comply with our authentic visitor guidelines to maintain high CPC rates.
          </p>
        </div>

        <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-5">
          <Mail className="w-6 h-6 text-blue-400 mb-3" />
          <h4 className="text-sm font-bold text-white mb-1">Direct Support</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Reach out via <span className="text-white font-mono">support@linkearn.com</span> for billing and account inquiries.
          </p>
        </div>

        <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-5">
          <ShieldAlert className="w-6 h-6 text-purple-400 mb-3" />
          <h4 className="text-sm font-bold text-white mb-1">Dispute Resolution</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            Submit a review request if your traffic was erroneously classified as suspicious by defensive filters.
          </p>
        </div>
      </div>

      {/* Ticket Submission Form */}
      <div className="bg-[#151B26] border border-[#232D3F] rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">Open Support Ticket</h3>
        </div>
        <p className="text-xs text-gray-400 mb-6">
          Our publisher support specialists typically respond within 6 to 12 business hours.
        </p>

        {submitted ? (
          <div className="text-center py-10 bg-[#0D121C] border border-emerald-500/30 rounded-xl p-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-white mb-1">Ticket Submitted Successfully</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
              We have received your inquiry regarding <strong>{subject}</strong>. A support agent will email you with resolution updates.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setSubject('');
                setMessage('');
              }}
              className="px-4 py-2 rounded-xl bg-[#1E2638] text-white text-xs font-semibold hover:bg-[#27334a]"
            >
              Submit Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="PAYOUT">Payouts & Disbursements</option>
                  <option value="TRAFFIC">Traffic Quality & Fraud Classification</option>
                  <option value="LINKS">Monetization Links Setup</option>
                  <option value="REFERRAL">Referral Commission Inquiry</option>
                  <option value="OTHER">General Support</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. USDT withdrawal processing time"
                  className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Detailed Message *
              </label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Provide link slugs, dates, transaction IDs, or specific questions..."
                className="w-full bg-[#0D121C] border border-[#232D3F] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Send Message'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
