import { DocLayout, DocSection, DocSubSection, DocList, DocHighlight } from "@/components/docs/doc-layout"
import { ShieldCheck, Star, Lock, Users } from "lucide-react"

export const metadata = {
  title: "Trust & Safety | Swopify",
  description: "How Swopify protects its community through verification, moderation, and safety systems.",
}

export default function TrustSafetyPage() {
  return (
    <DocLayout title="Trust & Safety" subtitle="How we protect every member of the Swopify community." breadcrumb="Support">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {[
          { icon: ShieldCheck, label: "KYC Verification", text: "Identity-verified users earn a trust badge." },
          { icon: Star, label: "Community Ratings", text: "Transparent reviews after every trade." },
          { icon: Lock, label: "Secure Platform", text: "Your data is encrypted and protected." },
          { icon: Users, label: "Moderation Team", text: "24/7 monitoring and rapid response." },
        ].map(({ icon: Icon, label, text }) => (
          <div key={label} className="flex items-start gap-4 p-5 rounded-xl bg-[#073232]/5 border border-[#073232]/10">
            <div className="h-10 w-10 rounded-full bg-[#32cd32]/20 flex items-center justify-center flex-shrink-0">
              <Icon className="h-5 w-5 text-[#073232]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#073232]">{label}</p>
              <p className="text-xs text-gray-600 mt-0.5">{text}</p>
            </div>
          </div>
        ))}
      </div>

      <DocSection title="Our Commitment to Safety">
        <p>At Swopify, trust is the foundation of everything we do. We've built multiple layers of protection to ensure that every trade is safe, fair, and transparent. Our Trust & Safety team works around the clock to monitor the platform and respond to issues.</p>
      </DocSection>

      <DocSection title="Identity Verification (KYC)">
        <DocSubSection title="What is KYC?">
          <p>KYC (Know Your Customer) is our identity verification process. Users who complete KYC receive a verified badge on their profile, signaling to other traders that they are who they claim to be.</p>
        </DocSubSection>
        <DocSubSection title="How to Get Verified">
          <DocList items={[
            "Go to Settings → Verification in the app",
            "Submit a government-issued ID (NIN, passport, or driver's license)",
            "Take a selfie for facial verification",
            "Wait 24–48 hours for review and approval",
          ]} />
        </DocSubSection>
      </DocSection>

      <DocSection title="Community Ratings & Reviews">
        <p>After every completed trade, both parties can leave a rating and review. This creates a transparent track record for every user. We encourage honest, constructive feedback to help the community make informed decisions.</p>
        <DocList items={[
          "Ratings are visible on every user's public profile",
          "Reviews cannot be deleted by the reviewed user",
          "Fake or incentivized reviews violate our guidelines",
          "Disputes about reviews can be raised with our support team",
        ]} />
      </DocSection>

      <DocSection title="Content Moderation">
        <p>Our moderation team reviews reported content and takes action on violations of our Community Guidelines. We use a combination of automated tools and human review to keep the platform clean.</p>
        <DocList items={[
          "Reported listings are reviewed within 12 hours",
          "Reported users are investigated within 24 hours",
          "Serious violations result in immediate account suspension",
          "All moderation decisions can be appealed",
        ]} />
      </DocSection>

      <DocSection title="Data Security">
        <p>We take the security of your personal data seriously. Swopify uses industry-standard encryption and security practices to protect your information.</p>
        <DocList items={[
          "All data is encrypted in transit and at rest",
          "We never sell your personal data to third parties",
          "Payment information is handled by secure, certified processors",
          "You can request deletion of your data at any time",
        ]} />
      </DocSection>

      <DocSection title="Reporting & Escalation">
        <p>If you encounter unsafe behavior, you can report it directly in the app or contact our team. We take all reports seriously.</p>
        <DocHighlight>
          For urgent safety concerns, email support@swopify.com with the subject "URGENT SAFETY" and our team will respond within 2 hours.
        </DocHighlight>
      </DocSection>
    </DocLayout>
  )
}
