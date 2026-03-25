import { DocLayout, DocSection, DocList, DocHighlight } from "@/components/docs/doc-layout"

export const metadata = {
  title: "Disclaimer | Swopify",
  description: "Important disclaimers regarding the use of the Swopify platform.",
}

export default function DisclaimerPage() {
  return (
    <DocLayout
      title="Disclaimer"
      subtitle="Important information about the limitations of our platform and services."
      breadcrumb="Legal"
      lastUpdated="January 2026"
    >
      <DocSection title="General Disclaimer">
        <p>The information and services provided on Swopify are offered on an "as is" and "as available" basis. While we strive to maintain a safe, reliable, and accurate platform, we make no warranties — express or implied — regarding the completeness, accuracy, or reliability of any content on the platform.</p>
      </DocSection>

      <DocSection title="Marketplace Disclaimer">
        <p>Swopify is a marketplace platform that connects users for the purpose of bartering and trading. We are not a party to any trade or transaction between users. As such:</p>
        <DocList items={[
          "We do not guarantee the quality, safety, or legality of listed items or services",
          "We are not responsible for the accuracy of listing descriptions or photos",
          "We do not verify the condition of items before or after trades",
          "We are not liable for losses arising from trades between users",
          "We do not guarantee that trades will be completed successfully",
        ]} />
      </DocSection>

      <DocSection title="User Content Disclaimer">
        <p>Content posted by users — including listings, reviews, and messages — reflects the views of individual users and not Swopify. We do not endorse any user-generated content and are not responsible for its accuracy or legality.</p>
      </DocSection>

      <DocSection title="Financial Disclaimer">
        <p>Trade Coins and Service Coins are in-platform currencies with no real-world monetary value. They cannot be exchanged for cash or used outside the Swopify platform. We are not a financial institution and do not provide financial advice.</p>
        <DocHighlight>
          Swopify is not responsible for any financial losses arising from trades, coin purchases, or platform use.
        </DocHighlight>
      </DocSection>

      <DocSection title="Third-Party Links">
        <p>Our platform may contain links to third-party websites or services. We are not responsible for the content, privacy practices, or reliability of any third-party sites. Accessing third-party links is at your own risk.</p>
      </DocSection>

      <DocSection title="Availability Disclaimer">
        <p>We do not guarantee that Swopify will be available at all times. The platform may be subject to downtime for maintenance, updates, or unforeseen technical issues. We are not liable for any losses resulting from platform unavailability.</p>
      </DocSection>

      <DocSection title="Limitation of Liability">
        <p>To the fullest extent permitted by applicable law, Swopify and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from:</p>
        <DocList items={[
          "Your use of or inability to use the platform",
          "Any trades or transactions conducted through the platform",
          "Unauthorized access to your account or data",
          "Any errors or omissions in platform content",
          "Any third-party conduct on the platform",
        ]} />
      </DocSection>

      <DocSection title="Governing Law">
        <p>This disclaimer is governed by the laws of the Federal Republic of Nigeria. Any disputes shall be subject to the exclusive jurisdiction of the courts of Lagos State, Nigeria.</p>
      </DocSection>

      <DocSection title="Contact">
        <p>If you have questions about this disclaimer, contact us at <a href="mailto:support@swopify.co" className="text-[#073232] font-medium underline">support@swopify.co</a>.</p>
      </DocSection>
    </DocLayout>
  )
}
