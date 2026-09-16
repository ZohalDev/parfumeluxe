import { useParams, Link } from "react-router";
import { ChevronRight } from "lucide-react";

export default function Legal() {
  const { section } = useParams();

  const tabs = [
    { id: "shipping", label: "Shipping & Delivery" },
    { id: "returns", label: "Returns & Exchanges" },
    { id: "faq", label: "FAQ" },
    { id: "privacy", label: "Privacy Policy" },
    { id: "terms", label: "Terms of Service" },
  ];

  const currentTab = section || "privacy";

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1 space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-6">
            Legal & Support
          </h2>
          <div className="flex flex-col space-y-1">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                to={`/legal/${tab.id}`}
                className={`flex items-center justify-between px-4 py-3 text-sm rounded-lg transition-colors ${
                  currentTab === tab.id
                    ? "bg-foreground text-background font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.label}
                {currentTab === tab.id && <ChevronRight className="h-4 w-4" />}
              </Link>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="prose dark:prose-invert max-w-none">
            {currentTab === "privacy" && (
              <>
                <h1>Privacy Policy</h1>
                <p>Last updated: {new Date().toLocaleDateString()}</p>
                <p>
                  At Oud Royale, we take your privacy seriously. This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from our website.
                </p>
                <h2>Information We Collect</h2>
                <p>
                  When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device.
                </p>
                <h2>How We Use Your Information</h2>
                <p>
                  We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations).
                </p>
              </>
            )}

            {currentTab === "terms" && (
              <>
                <h1>Terms of Service</h1>
                <p>Last updated: {new Date().toLocaleDateString()}</p>
                <p>
                  Welcome to Oud Royale. By accessing or using our website, you agree to be bound by these Terms of Service and all applicable laws and regulations.
                </p>
                <h2>Products and Services</h2>
                <p>
                  All products are subject to availability. We reserve the right to discontinue any product at any time. Prices for our products are subject to change without notice.
                </p>
                <h2>Accuracy of Billing and Account Information</h2>
                <p>
                  We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order.
                </p>
              </>
            )}

            {currentTab === "faq" && (
              <>
                <h1>Frequently Asked Questions</h1>
                <h2>Are your fragrances authentic?</h2>
                <p>Yes, all our fragrances are 100% authentic and sourced directly from the brands or their authorized distributors.</p>
                
                <h2>How long does a fragrance typically last?</h2>
                <p>The longevity of a fragrance depends on its concentration (Eau de Parfum vs Eau de Toilette) and your skin type. Typically, our Eau de Parfums last between 6 to 12 hours.</p>

                <h2>Do you offer samples?</h2>
                <p>Currently, we include complimentary samples with every full-sized purchase, allowing you to discover new scents.</p>
              </>
            )}

            {currentTab === "shipping" && (
              <>
                <h1>Shipping & Delivery</h1>
                <h2>Domestic Shipping</h2>
                <p>We offer complimentary standard shipping on all orders over $150. For orders under $150, a flat rate of $15 applies. Standard delivery typically takes 3-5 business days.</p>
                
                <h2>International Shipping</h2>
                <p>We ship worldwide. International shipping rates vary by location and are calculated at checkout. Please note that international orders may be subject to import duties and taxes.</p>
              </>
            )}

            {currentTab === "returns" && (
              <>
                <h1>Returns & Exchanges</h1>
                <p>We want you to be completely satisfied with your purchase. If you are not entirely happy, you can return your unused and unopened products within 30 days of receipt.</p>
                
                <h2>Return Process</h2>
                <p>To initiate a return, please contact our support team with your order number. We will provide you with a return shipping label and instructions.</p>

                <h2>Refunds</h2>
                <p>Once we receive your return and verify its condition, we will process your refund to the original payment method within 5-7 business days.</p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
