import Link from "next/link";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-12">
          <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">Terms of Service</span>
        </div>

        <div className="mb-16">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gray-500 font-medium">
            Legal
          </p>
          <h1 className="text-5xl sm:text-6xl font-bold uppercase tracking-tight text-black mt-3">
            Terms of Service
          </h1>
          <p className="text-sm text-gray-500 mt-4">Last updated: August 2026</p>
        </div>

        <div className="space-y-12">
          {/* 1. Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-black mb-4">
              1. Acceptance of Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using the OAMS website, you accept and agree to be bound by
              these Terms of Service. If you do not agree to these terms, please do not use
              our website or place any orders.
            </p>
          </section>

          {/* 2. Products & Orders */}
          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-black mb-4">
              2. Products & Orders
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                All products displayed on our website are subject to availability. We make
                every effort to display accurate product information, including colors,
                sizes, and pricing. However, we do not warrant that product descriptions
                or other content are error-free.
              </p>
              <p>
                When you place an order, you will receive a confirmation. We reserve the
                right to refuse or cancel any order for reasons including but not limited
                to: product availability, errors in pricing, or suspected fraudulent
                activity.
              </p>
              <p>
                All orders are subject to confirmation by our team. We will contact you
                by phone to confirm your order details and delivery information before
                shipping.
              </p>
            </div>
          </section>

          {/* 3. Pricing & Payment */}
          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-black mb-4">
              3. Pricing & Payment
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                All prices are listed in Moroccan Dirhams (DH) and include applicable
                taxes unless otherwise stated. We reserve the right to change prices at
                any time without prior notice.
              </p>
              <p>
                We offer <strong>Cash on Delivery (COD)</strong> for all orders. No
                prepayment is required. Payment is collected upon delivery of your order.
              </p>
              <p>
                Shipping costs are calculated based on your delivery location:
                <br />- Casablanca: 20 DH (delivery within 24-48h)
                <br />- Outside Casablanca: 40 DH (delivery within 2-4 days)
              </p>
            </div>
          </section>

          {/* 4. Shipping & Delivery */}
          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-black mb-4">
              4. Shipping & Delivery
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We deliver throughout Morocco. Delivery times are estimates and may vary
                depending on your location and external factors beyond our control.
              </p>
              <p>
                Once your order is confirmed, our team will contact you to arrange
                delivery. Please ensure your phone number and delivery address are
                accurate to avoid delays.
              </p>
            </div>
          </section>

          {/* 5. Returns & Exchanges */}
          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-black mb-4">
              5. Returns & Exchanges
            </h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <p>
                We want you to be completely satisfied with your purchase. If you are not
                happy with your order, you may request a return or exchange within
                <strong> 7 days</strong> of delivery, provided the items are:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Unworn, unwashed, and in original condition</li>
                <li>With all original tags attached</li>
                <li>In their original packaging</li>
              </ul>
              <p>
                To initiate a return or exchange, please contact us at{" "}
                <a href="mailto:oasm.contact.me@gmail.com" className="underline hover:text-gray-900">
                  oasm.contact.me@gmail.com
                </a>{" "}
                or call us at +212679122507.
              </p>
            </div>
          </section>

          {/* 6. Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-black mb-4">
              6. Intellectual Property
            </h2>
            <p className="text-gray-700 leading-relaxed">
              All content on this website, including but not limited to text, graphics,
              logos, images, and product designs, is the property of OAMS and is
              protected by intellectual property laws. You may not reproduce, distribute,
              or use any content from this website without our prior written consent.
            </p>
          </section>

          {/* 7. Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-black mb-4">
              7. Limitation of Liability
            </h2>
            <p className="text-gray-700 leading-relaxed">
              OAMS shall not be liable for any indirect, incidental, special, or
              consequential damages arising from the use of our website or the purchase
              of our products. Our total liability shall not exceed the amount paid for
              the products purchased.
            </p>
          </section>

          {/* 8. Privacy */}
          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-black mb-4">
              8. Privacy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We respect your privacy. Any personal information you provide to us,
              including your name, phone number, and delivery address, is used solely
              for the purpose of processing and delivering your orders. We do not sell
              or share your personal information with third parties.
            </p>
          </section>

          {/* 9. Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-black mb-4">
              9. Changes to These Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to update or modify these Terms of Service at any
              time without prior notice. Any changes will be effective immediately upon
              posting on this page. Your continued use of the website after any changes
              constitutes acceptance of the updated terms.
            </p>
          </section>

          {/* 10. Contact */}
          <section>
            <h2 className="text-2xl font-bold uppercase tracking-tight text-black mb-4">
              10. Contact Us
            </h2>
            <div className="space-y-2 text-gray-700 leading-relaxed">
              <p>If you have any questions about these Terms of Service, please contact us:</p>
              <p>
                <strong>Email:</strong>{" "}
                <a href="mailto:oasm.contact.me@gmail.com" className="underline hover:text-gray-900">
                  oasm.contact.me@gmail.com
                </a>
              </p>
              <p>
                <strong>Phone:</strong> +212679122507
              </p>
              <p>
                <strong>Location:</strong> Casa, Morocco
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}