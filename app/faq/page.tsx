"use client"

import { useState } from "react"
import { DocLayout, DocHighlight } from "@/components/docs/doc-layout"
import { ChevronDown } from "lucide-react"

export default function FAQPage() {
  const [openItem, setOpenItem] = useState<string | null>(null)

  const toggle = (key: string) => setOpenItem(openItem === key ? null : key)

  const sections = [
    {
      title: "Getting Started",
      items: [
        {
          q: "What is Swopify?",
          a: "Swopify is Nigeria's leading barter and trade marketplace. It lets you exchange goods, services, and skills with other users — without needing cash. You can also use Trade Coins and Service Coins to bridge value gaps in trades.",
        },
        {
          q: "Is Swopify free to use?",
          a: "Yes, creating an account and browsing listings is completely free. Some premium features are available on paid plans. Check our Pricing page for details.",
        },
        {
          q: "How do I create an account?",
          a: "Download the Swopify app or visit our website, tap \"Sign Up\", and follow the registration steps. You'll need a valid email address and phone number to get started.",
        },
      ],
    },
    {
      title: "Trading & Listings",
      items: [
        {
          q: "How do I propose a trade?",
          a: "Browse listings, find something you want, and tap \"Propose Trade\". Select what you're offering in exchange, add a message, and send your proposal. The other user will accept, decline, or counter-offer.",
        },
        {
          q: "Can I trade services, not just items?",
          a: "Absolutely. Swopify supports service exchanges — from tutoring and design to repairs and cooking. You can also use Time Banking to trade hours of your time.",
        },
        {
          q: "What happens after a trade is accepted?",
          a: "Once both parties agree, you'll be connected via in-app chat to arrange the exchange. You can agree on a safe meeting point or delivery method. After the trade is complete, both parties leave ratings.",
        },
        {
          q: "Can I cancel a trade?",
          a: "Yes, you can cancel a pending trade before it's completed. Frequent cancellations may affect your trust score on the platform.",
        },
      ],
    },
    {
      title: "Trade Coins & Service Coins",
      items: [
        {
          q: "What are Trade Coins?",
          a: "Trade Coins are Swopify's in-platform currency used to bridge value gaps in trades. If what you're offering isn't equal in value to what you want, you can top up with Trade Coins.",
        },
        {
          q: "What are Service Coins?",
          a: "Service Coins are earned by completing service-based trades and can be spent on services offered by other users. They're separate from Trade Coins and specific to the service economy.",
        },
        {
          q: "How do I buy Trade Coins?",
          a: "Go to the Trade Coins section in the app or website, select the amount you want, and complete payment via our supported payment methods including OPay.",
        },
      ],
    },
    {
      title: "Safety & Trust",
      items: [
        {
          q: "How does Swopify keep me safe?",
          a: "We use KYC (Know Your Customer) verification, community ratings, and a reporting system to maintain a safe marketplace. We also recommend using our Safe Zones feature for in-person exchanges.",
        },
        {
          q: "What is KYC verification?",
          a: "KYC is an identity verification process that helps confirm users are who they say they are. Verified users get a badge on their profile, increasing trust with other traders.",
        },
        {
          q: "What should I do if I'm scammed?",
          a: "Report the user immediately using the in-app report feature and contact us at support@swopify.co. Do not complete any further transactions with the user. We investigate all fraud reports.",
        },
      ],
    },
    {
      title: "Account & Settings",
      items: [
        {
          q: "How do I delete my account?",
          a: "Go to Settings → Account → Delete Account. Note that this action is irreversible and all your data, listings, and trade history will be permanently removed.",
        },
        {
          q: "Can I have multiple accounts?",
          a: "No. Each user is allowed one account. Multiple accounts violate our Terms of Service and may result in all accounts being suspended.",
        },
      ],
    },
  ]

  return (
    <DocLayout
      title="Frequently Asked Questions"
      subtitle="Everything you need to know about trading on Swopify."
      breadcrumb="Company"
    >
      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.title}>
            <h2 className="text-xl font-bold text-[#073232] mb-3 pb-2 border-b border-gray-100">
              {section.title}
            </h2>
            <div className="space-y-2">
              {section.items.map((item) => {
                const key = `${section.title}-${item.q}`
                const isOpen = openItem === key
                return (
                  <div
                    key={key}
                    className="border border-gray-100 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => toggle(key)}
                      className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-[#073232]/5 transition-colors"
                      aria-expanded={isOpen}
                    >
                      <span className="text-sm font-semibold text-[#073232]">{item.q}</span>
                      <ChevronDown
                        className={`h-4 w-4 text-[#073232] flex-shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-sm text-gray-700 leading-relaxed border-t border-gray-100 pt-3">
                        {item.a}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <DocHighlight>
          Still have questions? Contact us at support@swopify.co and we'll get back to you within 24 hours.
        </DocHighlight>
      </div>
    </DocLayout>
  )
}
