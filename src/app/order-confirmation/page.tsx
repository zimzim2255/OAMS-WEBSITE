import Link from "next/link";

export default function OrderConfirmationPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10 text-green-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold uppercase tracking-tight text-black mt-8">
          Order Confirmed
        </h1>
        <p className="text-gray-500 mt-4 leading-relaxed">
          Thank you for your order! We received it and will contact you shortly
          by phone to confirm the delivery details.
        </p>

        <div className="border border-gray-200 rounded-2xl p-6 mt-8 text-left bg-gray-50">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
            What happens next?
          </h2>
          <ol className="space-y-4">
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">1</span>
              <p className="text-sm text-gray-700">
                We review your order and confirm stock availability.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">2</span>
              <p className="text-sm text-gray-700">
                We call you to confirm your delivery details and payment.
              </p>
            </li>
            <li className="flex gap-3">
              <span className="w-6 h-6 rounded-full bg-gray-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">3</span>
              <p className="text-sm text-gray-700">
                Your order ships out — cash on delivery, no prepayment required.
              </p>
            </li>
          </ol>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/products"
            className="inline-block bg-gray-900 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </Link>
          <Link
            href="/"
            className="inline-block border border-gray-900 text-gray-900 px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}