import { DocLayout, DocSection, DocSubSection, DocList, DocHighlight } from "@/components/docs/doc-layout"

export const metadata = {
  title: "Refund Policy | Swopify",
  description: "Swopify refund policy, escrow refund process, dispute timelines, and support contacts.",
}

export default function RefundPolicyPage() {
  return (
    <DocLayout
      title="Refund Policy"
      subtitle="How Swopify handles refunds, escrow disputes, duplicate payments, and payment reversals."
      breadcrumb="Legal"
      lastUpdated="August 5, 2026"
    >
      <DocSection title="Introduction">
        <p>
          At Swopify, we are committed to fair and transparent transactions between users of our trade-by-barter platform.
          This Refund Policy explains when refunds may be issued, how refund requests are reviewed, and how we prevent
          fraud during payment reversals.
        </p>
        <p>
          This policy applies to transactions processed through Swopify payment gateway partners, including Flutterwave.
        </p>
      </DocSection>

      <DocSection title="When Refunds Are Issued">
        <DocList
          items={[
            "Trade cancellation: both parties mutually cancel a trade before completion. Processing time is 3-5 business days.",
            "Failed trade: the trade cannot be completed because of seller non-performance or item misrepresentation. Processing time is 3-5 business days.",
            "Duplicate payment: a user accidentally makes duplicate payments for the same trade. Processing time is 1-3 business days.",
            "Unauthorized transaction: a payment was made without the user's consent, subject to investigation. Processing time is 7-10 business days.",
            "Technical error: a system issue resulted in an incorrect charge. Processing time is 1-3 business days.",
            "Dispute resolution: Swopify's dispute team determines that a refund is warranted. Processing time is 5-7 business days.",
          ]}
        />
      </DocSection>

      <DocSection title="Escrow and Refund Process">
        <p>
          Swopify may use Flutterwave escrow or other payment infrastructure to securely hold funds during eligible
          user-to-user trades. Funds are released or refunded based on trade status, user confirmations, and dispute
          outcomes.
        </p>
        <DocSubSection title="How Escrow Works">
          <DocList
            items={[
              "The buyer deposits funds for a trade, and the funds are held in escrow where applicable.",
              "Both parties complete the trade and confirm satisfaction.",
              "Funds are released to the seller after the transaction is completed.",
            ]}
          />
        </DocSubSection>
        <DocSubSection title="Refund During Escrow">
          <DocList
            items={[
              "Both parties are notified of the refund request.",
              "Swopify's dispute resolution team investigates the issue.",
              "If approved, funds are released back to the buyer through Flutterwave's payment infrastructure.",
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title="Refund to Original Source Only">
        <DocHighlight>
          Refunds are issued only to the original account, card, wallet, or bank source from which the payment was made.
          Swopify will not issue refunds to third-party accounts.
        </DocHighlight>
        <DocList
          items={[
            "Payments made from an OPay account are refunded to the same OPay account.",
            "Payments made by bank transfer are returned to the originating bank account.",
            "Card payments are reversed to the same card where supported by the payment processor.",
            "USSD payments are returned to the originating bank account where supported.",
            "Requests to send refunds to a different account will be denied.",
          ]}
        />
      </DocSection>

      <DocSection title="How to Request a Refund">
        <p>Users may request refunds through Swopify in-app support or by sending an email to <a href="mailto:refunds@swopify.co" className="text-[#073232] font-medium underline">refunds@swopify.co</a>.</p>
        <DocSubSection title="Information Required">
          <DocList
            items={[
              "Full name matching the account used for payment.",
              "Registered phone number on Swopify.",
              "Email address used for the transaction.",
              "Transaction ID or payment reference number.",
              "Date and amount of the original transaction.",
              "Reason for the refund request.",
              "Supporting evidence such as screenshots or communication records where available.",
            ]}
          />
        </DocSubSection>
        <DocSubSection title="Refund Timeline">
          <DocList
            items={[
              "Request received: Day 0.",
              "Initial acknowledgment: within 24 hours.",
              "Investigation completed: 3-5 business days.",
              "Refund processed if approved: 3-5 business days after approval.",
              "Maximum expected timeframe: 7-10 business days.",
            ]}
          />
        </DocSubSection>
      </DocSection>

      <DocSection title="Refund Processing Fees">
        <p>
          Swopify does not charge users an additional refund processing fee. Where a refund is approved, Swopify absorbs
          applicable Flutterwave transaction fees and standard bank transfer costs, so the approved refund is returned
          without extra refund deductions from the user.
        </p>
      </DocSection>

      <DocSection title="When Refunds May Be Denied">
        <DocList
          items={[
            "The trade was successfully completed and confirmed by both parties.",
            "The user changed their mind after a completed trade.",
            "The dispute is resolved in favor of the seller.",
            "The refund request asks Swopify to pay a third-party account.",
            "The user cannot provide proof of payment or a valid transaction reference.",
            "The request is fraudulent or connected to suspicious activity.",
            "The transaction is more than 90 days old.",
          ]}
        />
      </DocSection>

      <DocSection title="Dispute Resolution">
        <p>
          If a trade is disputed, funds may remain in escrow until the issue is resolved. Swopify reviews evidence from
          both parties, considers transaction history, and implements the final decision based on the available evidence.
        </p>
        <DocList
          items={[
            "Users may escalate eligible payment disputes to Flutterwave's dispute resolution process where applicable.",
            "Users may report unresolved consumer issues to the Federal Competition and Consumer Protection Commission.",
            "Users may report applicable data issues to the Nigeria Data Protection Commission.",
            "Users may seek legal recourse as permitted under Nigerian law.",
          ]}
        />
      </DocSection>

      <DocSection title="Fraud Prevention">
        <DocList
          items={[
            "Refunds are returned only to the original payment source.",
            "Users must complete required KYC before transacting.",
            "Suspicious transactions are monitored and manually reviewed.",
            "Refund requests above NGN 50,000 may receive additional review.",
            "Fraudulent users may be banned and reported to the appropriate authorities.",
          ]}
        />
      </DocSection>

      <DocSection title="Contact Information">
        <DocList
          items={[
            "Refund requests: refunds@swopify.co",
            "Dispute resolution: disputes@swopify.co",
            "Fraud reporting: fraud@swopify.co",
            "General support: support@swopify.co",
            "Phone: +234 814 419 4471",
            "Physical address: FD Mall, New Bodija Area, Ibadan, Oyo State, Nigeria",
          ]}
        />
      </DocSection>

      <DocSection title="Changes to This Policy">
        <p>
          Swopify may update this Refund Policy from time to time. Material changes become effective 30 days after
          posting on the platform, unless a shorter period is required by law or payment partner compliance.
        </p>
      </DocSection>

      <DocSection title="Acknowledgment">
        <p>
          By using Swopify, users acknowledge that they have read, understood, and agree to this Refund Policy. Users
          understand that approved refunds are issued only to the original payment source and that third-party refund
          requests will be denied.
        </p>
      </DocSection>
    </DocLayout>
  )
}