import { DocLayout, DocSection, DocList, DocHighlight } from "@/components/docs/doc-layout"

export const metadata = {
  title: "Community Guidelines | Swopify",
  description: "The rules and values that keep the Swopify community fair, safe, and welcoming.",
}

export default function GuidelinesPage() {
  return (
    <DocLayout
      title="Community Guidelines"
      subtitle="These guidelines exist to keep Swopify fair, safe, and welcoming for everyone."
      breadcrumb="Support"
      lastUpdated="January 2026"
    >
      <DocSection title="Our Community Values">
        <p>Swopify is built on trust, fairness, and mutual respect. Every member of our community — whether you're a buyer, seller, or trader — plays a role in maintaining the quality and safety of the platform. These guidelines outline what we expect from all users.</p>
      </DocSection>

      <DocSection title="What's Allowed">
        <DocList items={[
          "Listing legal goods and services for trade",
          "Proposing fair, honest trades",
          "Communicating respectfully with other users",
          "Leaving honest, constructive reviews",
          "Reporting suspicious or harmful content",
          "Using Trade Coins and Service Coins as intended",
        ]} />
      </DocSection>

      <DocSection title="What's Not Allowed">
        <DocList items={[
          "Listing illegal items (weapons, drugs, counterfeit goods, etc.)",
          "Fraud, scamming, or misrepresenting items",
          "Harassment, hate speech, or threatening behavior",
          "Creating multiple accounts to manipulate ratings",
          "Sharing other users' personal information without consent",
          "Spam, phishing links, or malicious content",
          "Circumventing the platform to avoid fees or protections",
          "Listing adult content or services",
        ]} />
      </DocSection>

      <DocSection title="Listings Standards">
        <DocList items={[
          "Photos must accurately represent the item or service",
          "Descriptions must be honest and complete",
          "Pricing and trade expectations must be clearly stated",
          "Duplicate listings for the same item are not allowed",
          "Listings must be in the correct category",
        ]} />
      </DocSection>

      <DocSection title="Communication Standards">
        <p>All communication on Swopify should be respectful and professional. We do not tolerate:</p>
        <DocList items={[
          "Abusive, offensive, or discriminatory language",
          "Unsolicited promotional messages",
          "Attempts to move conversations off-platform before a trade is agreed",
          "Sharing personal contact details in public listing descriptions",
        ]} />
      </DocSection>

      <DocSection title="Reviews & Ratings">
        <p>Reviews help the community make informed decisions. We expect all reviews to be:</p>
        <DocList items={[
          "Honest and based on your actual experience",
          "Respectful, even if the trade didn't go well",
          "Free from personal attacks or irrelevant content",
          "Not incentivized — don't offer rewards for positive reviews",
        ]} />
      </DocSection>

      <DocSection title="Consequences of Violations">
        <p>Violations of these guidelines may result in:</p>
        <DocList items={[
          "Warning and content removal",
          "Temporary suspension of your account",
          "Permanent ban from the platform",
          "Reporting to relevant authorities for serious violations",
        ]} />
      </DocSection>

      <DocHighlight>
        If you see content that violates these guidelines, please report it. Together, we keep Swopify a great place to trade.
      </DocHighlight>
    </DocLayout>
  )
}
