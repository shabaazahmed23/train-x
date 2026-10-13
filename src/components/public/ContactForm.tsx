'use client';

import { useState } from 'react';
import { Send, CheckCircle2 } from 'lucide-react';

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    // Simulate instantaneous concierge logging
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  if (submitted) {
    return (
      <div className="card-luxury p-8 border-emerald-800/40 bg-emerald-950/20 text-center space-y-3">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400" />
        <h3 className="text-lg font-bold text-[#F5F5F0]">Enquiry Received by Concierge</h3>
        <p className="text-xs text-[#A0A09B] max-w-md mx-auto">
          Thank you for reaching out to FITLIFE. Our Senior Member Concierge will contact you within 4 hours to arrange your private VIP club tour.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="mt-4 text-xs font-semibold text-[#C8A96B] underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="card-luxury p-6 sm:p-8 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0A09B] mb-1.5">
            Full Name
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Vikram Singhania"
            className="w-full rounded bg-[#111] border border-[#282828] px-3.5 py-2.5 text-xs text-[#F5F5F0] focus:outline-none focus:border-[#C8A96B]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0A09B] mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            required
            placeholder="vikram@example.com"
            className="w-full rounded bg-[#111] border border-[#282828] px-3.5 py-2.5 text-xs text-[#F5F5F0] focus:outline-none focus:border-[#C8A96B]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0A09B] mb-1.5">
            Phone Number
          </label>
          <input
            type="tel"
            required
            placeholder="+91 98000 00000"
            className="w-full rounded bg-[#111] border border-[#282828] px-3.5 py-2.5 text-xs text-[#F5F5F0] focus:outline-none focus:border-[#C8A96B]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0A09B] mb-1.5">
            Area of Interest
          </label>
          <select className="w-full rounded bg-[#111] border border-[#282828] px-3.5 py-2.5 text-xs text-[#F5F5F0] focus:outline-none focus:border-[#C8A96B]">
            <option value="membership">Annual Membership Inquiry</option>
            <option value="training">Personal Athletic Coaching</option>
            <option value="recovery">Infrared Sauna & Recovery Tour</option>
            <option value="corporate">Corporate Executive Wellness</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#A0A09B] mb-1.5">
          Your Message or Specific Goals
        </label>
        <textarea
          rows={4}
          required
          placeholder="Tell us about your fitness background and desired schedule..."
          className="w-full rounded bg-[#111] border border-[#282828] px-3.5 py-2.5 text-xs text-[#F5F5F0] focus:outline-none focus:border-[#C8A96B]"
        ></textarea>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-[#111111] font-bold text-xs uppercase tracking-wider py-3 px-4 transition-all disabled:opacity-50"
      >
        {loading ? (
          'Submitting...'
        ) : (
          <>
            Request VIP Consultation <Send className="h-3.5 w-3.5" />
          </>
        )}
      </button>
    </form>
  );
}
