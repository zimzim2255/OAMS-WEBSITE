"use client";

import { useState } from "react";
import Link from "next/link";

const FORMSPREE_ENDPOINT = "https://formspree.io/f/xvkpooqg";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const data = {
      _subject: `Contact Message from ${form.name}`,
      name: form.name,
      email: form.email,
      message: form.message,
    };

    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      setSent(true);
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setError("Something went wrong sending your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-12">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Contact</span>
        </div>

        <div className="mb-16">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500 font-medium">
            Get in touch
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold uppercase tracking-tight text-black mt-3">
            Contact Us
          </h1>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="border border-black p-8">
            <h2 className="text-xl font-bold uppercase tracking-tight text-black mb-8">
              Send a Message
            </h2>

            {sent ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8 text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <p className="text-lg font-medium text-black mt-4">Message Sent!</p>
                <p className="text-sm text-gray-500 mt-2">
                  Thank you for reaching out. We'll get back to you soon.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-6 px-6 py-3 border border-black text-sm font-bold uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors duration-300"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-4 rounded border border-red-200 bg-red-50 text-red-700 text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-gray-500 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-0 py-2 border-b border-black bg-transparent focus:outline-none focus:border-gray-400 transition-colors text-black"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-gray-500 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-0 py-2 border-b border-black bg-transparent focus:outline-none focus:border-gray-400 transition-colors text-black"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-widest text-gray-500 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full px-0 py-2 border-b border-black bg-transparent focus:outline-none focus:border-gray-400 transition-colors text-black resize-none"
                    placeholder="Tell us what's on your mind..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="cursor-target w-full py-4 border border-black text-sm font-bold uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="border border-black p-8">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                Email
              </h3>
              <p className="text-lg font-medium text-black">oasm.contact.me@gmail.com</p>
            </div>
            <div className="border border-black p-8">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                Phone
              </h3>
              <p className="text-lg font-medium text-black">+212679122507</p>
            </div>
            <div className="border border-black p-8">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                Studio
              </h3>
              <p className="text-lg font-medium text-black">
                Casa
              </p>
            </div>
            <div className="bg-black p-8 text-white">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Custom Orders
              </h3>
              <p className="text-lg font-medium">
                Looking for something unique? We take custom orders for all our pieces.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}