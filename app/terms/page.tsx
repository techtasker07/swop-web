import { DocLayout, DocSection, DocSubSection, DocList, DocHighlight } from "@/components/docs/doc-layout"

export const metadata = {
  title: "Terms of Service | Swopify",
  description: "The terms and conditions governing your use of the Swopify platform.",
}

export default function TermsPage() {
  return (
    <DocLayout
      title="Terms of Service"
      subtitle="Please read these terms carefully before using Swopify."
      breadcrumb="Legal"
      lastUpdated="January 2026"
    >
      <DocSection title="Acceptance of Terms">
        <p>By accessing or using Swopify — including our mobile app and website — you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our platform.</p>
      </DocSection>

      <DocSection title="Eligibility">
        <DocList items={[
          "You must be at least 18 years old to use Swopify",
          "You must provide accurate and complete registration information",
          "You may only maintain one account per person",
          "Accounts created by bots or automated means are prohibited",
        ]} />
      </DocSection>

      <DocSection title="User Accounts">
        <DocSubSection title="Account Responsibility">
          <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately at support@swopify.com if you suspect unauthorized access.</p>
        </DocSubSection>
        <DocSubSection title="Account Termination">
          <p>We reserve the right to suspend or terminate accounts that violate these Terms of Service, our Community Guidelines, or applicable laws.</p>
        </DocSubSection>
      </DocSection>

      <DocSection title="Listings & Trades">
        <DocList items={[
          "All listings must accurately represent the item or service offered",
          "You are solely responsible for the content of your listings",
          "Swopify does not guarantee the quality, safety, or legality of listed items",
          "Trades are agreements between users — Swopify is not a party to any trade",
          "We reserve the right to remove listings that violate our guidelines",
        ]} />
      </DocSection>

      <DocSection title="Prohibited Activities">
        <p>You agree not to:</p>
        <DocList items={[
          "List or trade illegal goods or services",
          "Engage in fraud, misrepresentation, or deceptive practices",
          "Harass, threaten, or abuse other users",
          "Attempt to circumvent our platform's security or payment systems",
          "Use the platform for money laundering or other financial crimes",
          "Scrape, copy, or redistribute platform content without permission",
          "Create fake accounts or manipulate ratings",
        ]} />
      </DocSection>

      <DocSection title="Trade Coins & Service Coins">
        <DocList items={[
          "Trade Coins and Service Coins are in-platform currencies with no cash value",
          "Coins cannot be withdrawn or exchanged for real currency",
          "Coin purchases are non-refundable unless required by law",
          "We reserve the right to adjust coin values or discontinue coin systems with notice",
        ]} />
      </DocSection>

      <DocSection title="Intellectual Property">
        <p>Swopify and its content, features, and functionality are owned by Swopify and protected by intellectual property laws. You may not copy, modify, or distribute our platform content without written permission.</p>
        <p>By posting content on Swopify, you grant us a non-exclusive, royalty-free license to use, display, and distribute that content on our platform.</p>
      </DocSection>

      <DocSection title="Limitation of Liability">
        <p>Swopify is provided "as is" without warranties of any kind. To the maximum extent permitted by law, Swopify shall not be liable for any indirect, incidental, or consequential damages arising from your use of the platform.</p>
        <DocHighlight>
          Swopify is a marketplace platform. We are not responsible for the actions of users or the quality of items traded. Always exercise caution and follow our Safety Tips.
        </DocHighlight>
      </DocSection>

      <DocSection title="Governing Law">
        <p>These Terms of Service are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved in the courts of Lagos State, Nigeria.</p>
      </DocSection>

      <DocSection title="Changes to Terms">
        <p>We may update these terms from time to time. We'll notify you of material changes via email or in-app notification. Continued use of Swopify after changes constitutes acceptance of the updated terms.</p>
      </DocSection>

      <DocSection title="Contact">
        <p>For questions about these terms, contact us at <a href="mailto:support@swopify.com" className="text-[#073232] font-medium underline">support@swopify.com</a>.</p>
      </DocSection>
    </DocLayout>
  )
}
