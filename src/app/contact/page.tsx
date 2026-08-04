import Link from "next/link";

export default function ContactPage() {
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
            <form className="space-y-6">
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-gray-500 mb-2">
                  Name
                </label>
                <input
                  type="text"
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
                  className="w-full px-0 py-2 border-b border-black bg-transparent focus:outline-none focus:border-gray-400 transition-colors text-black resize-none"
                  placeholder="Tell us what's on your mind..."
                />
              </div>
              <button
                type="submit"
                className="cursor-target w-full py-4 border border-black text-sm font-bold uppercase tracking-widest text-black hover:bg-black hover:text-white transition-colors duration-300"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* Contact Info */}
          <div className="space-y-8">
            <div className="border border-black p-8">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                Email
              </h3>
              <p className="text-lg font-medium text-black">hello@vlomcust.com</p>
            </div>
            <div className="border border-black p-8">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                Phone
              </h3>
              <p className="text-lg font-medium text-black">+1 (555) 123-4567</p>
            </div>
            <div className="border border-black p-8">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                Studio
              </h3>
              <p className="text-lg font-medium text-black">
                123 Fashion District
                <br />
                New York, NY 10001
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