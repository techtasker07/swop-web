import { DocLayout, DocSection, DocSubSection, DocList, DocHighlight } from "@/components/docs/doc-layout"
import { Search, MessageCircle, BookOpen, ShieldCheck } from "lucide-react"

export const metadata = {
  title: "Help Center | Swopify",
  description: "Find answers, guides, and support for using Swopify.",
}

export default function HelpPage() {
  return (
    <DocLayout title="Help Center" subtitle="Find answers and get support for everything Swopify." breadcrumb="Support">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {[
          { icon: Search, label: "Browse FAQs", text: "Find quick answers to common questions.", href: "/faq" },
          { icon: BookOpen, label: "How It Works", text: "Learn the basics of trading on Swopify.", href: "/how-it-works" },
          { icon: ShieldCheck, label: "Safety Tips", text: "Stay safe while trading.", href: "/safety" },
          { icon: MessageCircle, label: "Contact Support", text: "Reach our team directly.", href: "/contact" },
        ].map(({ icon: Icon, label, text, href }) => (
          <a key={label} href={href} className="flex items-start gap-4 p-5 rounded-xl bg-[#073232]/5 border border-[#073232]/10 hover:border-[#073232]/30 hover:shadow-sm transition-all">
            <div className="h-10 w-10 rounded-full bg-[#32cd32]/20 flex items-center justify-center flex-shrink-0">
              <Icon className="h-5 w-5 text-[#073232]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#073232]">{label}</p>
              <p className="text-xs text-gray-600 mt-0.5">{text}</p>
            </div>
          </a>
        ))}
      </div>

      <DocSection title="Account Help">
        <DocSubSection title="I can't log in to my account">
          <DocList items={[
            "Check that your email and password are correct",
            "Use 'Forgot Password' to reset your password",
            "Make sure your account hasn't been suspended",
            "Contact support if the issue persists",
          ]} />
        </DocSubSection>
        <DocSubSection title="How do I update my profile?">
          <p>Go to your Dashboard → Profile → Edit Profile. You can update your name, bio, location, and profile picture from there.</p>
        </DocSubSection>
        <DocSubSection title="How do I verify my account (KYC)?">
          <p>Go to Settings → Verification and follow the steps to submit your ID. Verification typically takes 24–48 hours.</p>
        </DocSubSection>
      </DocSection>

      <DocSection title="Listings Help">
        <DocSubSection title="How do I create a listing?">
          <p>Tap the "+" button in the app or click "Create Listing" on the website. Fill in the title, description, category, and photos. Choose whether you want to trade for items, services, or coins.</p>
        </DocSubSection>
        <DocSubSection title="Why was my listing removed?">
          <p>Listings may be removed if they violate our Community Guidelines — such as listing prohibited items, using misleading descriptions, or receiving multiple reports. You'll receive a notification explaining the reason.</p>
        </DocSubSection>
      </DocSection>

      <DocSection title="Payments & Coins Help">
        <DocSubSection title="My Trade Coin purchase didn't go through">
          <DocList items={[
            "Check your payment method has sufficient funds",
            "Ensure your internet connection is stable",
            "Try a different payment method",
            "Contact support with your transaction reference",
          ]} />
        </DocSubSection>
        <DocSubSection title="How do I withdraw Trade Coins?">
          <p>Trade Coins are an in-platform currency and cannot currently be withdrawn as cash. They can only be used for trades within Swopify.</p>
        </DocSubSection>
      </DocSection>

      <DocHighlight>
        Can't find what you're looking for? Email us at support@swopify.co and we'll help you out within 24 hours.
      </DocHighlight>
    </DocLayout>
  )
}
