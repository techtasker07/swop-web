import { DocLayout, DocSection, DocSubSection, DocList, DocHighlight } from "@/components/docs/doc-layout"

export const metadata = {
  title: "Privacy Policy | Swopify",
  description: "How Swopify collects, uses, and protects your personal information.",
}

export default function PrivacyPage() {
  return (
    <DocLayout
      title="Privacy Policy"
      subtitle="How we collect, use, and protect your personal information."
      breadcrumb="Legal"
      lastUpdated="January 2026"
    >
      <DocSection title="Introduction">
        <p>Swopify ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform — including our mobile app and website.</p>
        <p>By using Swopify, you agree to the collection and use of information in accordance with this policy.</p>
      </DocSection>

      <DocSection title="Information We Collect">
        <DocSubSection title="Information You Provide">
          <DocList items={[
            "Account information: name, email address, phone number, password",
            "Profile information: bio, location, profile picture",
            "KYC verification data: government ID, selfie photos",
            "Listing content: photos, descriptions, trade preferences",
            "Communications: messages sent through our platform",
            "Payment information: processed securely by our payment partners",
          ]} />
        </DocSubSection>
        <DocSubSection title="Information Collected Automatically">
          <DocList items={[
            "Device information: device type, operating system, app version",
            "Usage data: pages visited, features used, time spent",
            "Location data: approximate location (with your permission)",
            "Log data: IP address, browser type, access times",
            "Cookies and similar tracking technologies",
          ]} />
        </DocSubSection>
      </DocSection>

      <DocSection title="How We Use Your Information">
        <DocList items={[
          "To create and manage your account",
          "To facilitate trades and transactions between users",
          "To verify your identity through KYC",
          "To send notifications about trades, messages, and updates",
          "To improve our platform and develop new features",
          "To detect and prevent fraud and abuse",
          "To comply with legal obligations",
          "To provide customer support",
        ]} />
      </DocSection>

      <DocSection title="Sharing Your Information">
        <p>We do not sell your personal information. We may share your information with:</p>
        <DocList items={[
          "Other users: your public profile, listings, and ratings are visible to other users",
          "Service providers: companies that help us operate the platform (hosting, payments, analytics)",
          "Legal authorities: when required by law or to protect safety",
          "Business transfers: in the event of a merger or acquisition",
        ]} />
      </DocSection>

      <DocSection title="Data Security">
        <p>We implement industry-standard security measures to protect your data, including encryption in transit and at rest, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure.</p>
      </DocSection>

      <DocSection title="Your Rights">
        <DocList items={[
          "Access: request a copy of the personal data we hold about you",
          "Correction: request correction of inaccurate data",
          "Deletion: request deletion of your account and data",
          "Portability: receive your data in a portable format",
          "Objection: object to certain types of data processing",
        ]} />
        <p className="mt-3">To exercise these rights, contact us at support@swopify.com.</p>
      </DocSection>

      <DocSection title="Cookies">
        <p>We use cookies and similar technologies to improve your experience. You can control cookie settings through your browser. See our <a href="/cookies" className="text-[#073232] font-medium underline">Cookie Policy</a> for more details.</p>
      </DocSection>

      <DocSection title="Children's Privacy">
        <p>Swopify is not intended for users under 18 years of age. We do not knowingly collect personal information from minors. If we become aware that a minor has provided us with personal information, we will delete it promptly.</p>
      </DocSection>

      <DocSection title="Changes to This Policy">
        <p>We may update this Privacy Policy from time to time. We'll notify you of significant changes via email or in-app notification. Continued use of Swopify after changes constitutes acceptance of the updated policy.</p>
      </DocSection>

      <DocSection title="Contact Us">
        <DocHighlight>
          For privacy-related questions or requests, email us at support@swopify.com with the subject "Privacy Request".
        </DocHighlight>
      </DocSection>
    </DocLayout>
  )
}
