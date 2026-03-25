import { DocLayout, DocSection, DocSubSection, DocList, DocHighlight } from "@/components/docs/doc-layout"
import { Heart, Users, Globe, Sparkles, Target, Lightbulb } from "lucide-react"

export const metadata = {
  title: "About Us | Swopify",
  description: "The story of Swopify — a modern marketplace built for bartering, trading, and community exchange.",
}

export default function AboutPage() {
  return (
    <DocLayout
      title="The Story of Swopify"
      subtitle="How a simple idea became Nigeria's leading barter and trade platform."
      breadcrumb="Company"
    >
      {/* Mission Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { icon: Heart, label: "Our Mission", text: "Empower communities through fair, sustainable exchange." },
          { icon: Globe, label: "Our Vision", text: "A world where value flows freely between people." },
          { icon: Target, label: "Our Goal", text: "10 million trades by 2026 across Africa." },
        ].map(({ icon: Icon, label, text }) => (
          <div key={label} className="flex flex-col items-center text-center p-5 rounded-xl bg-[#073232]/5 border border-[#073232]/10">
            <div className="h-10 w-10 rounded-full bg-[#32cd32]/20 flex items-center justify-center mb-3">
              <Icon className="h-5 w-5 text-[#073232]" />
            </div>
            <p className="text-sm font-semibold text-[#073232] mb-1">{label}</p>
            <p className="text-xs text-gray-600">{text}</p>
          </div>
        ))}
      </div>

      <DocSection title="Who We Are">
        <p>
          Swopify is Nigeria's premier barter and trade marketplace, connecting individuals and businesses who want to exchange goods and services without the friction of traditional cash transactions. We believe that everyone has something of value to offer, and that communities thrive when people trade fairly with one another.
        </p>
        <p>
          Founded with a deep passion for sustainable living and community empowerment, Swopify was built to solve a real problem: millions of Nigerians have items they no longer need, skills they want to share, and needs they can't always afford to meet with cash. We bridge that gap.
        </p>
      </DocSection>

      <DocSection title="Our Story">
        <p>
          The idea for Swopify was born out of a simple observation — markets and communities have always thrived on exchange. Long before money existed, people traded what they had for what they needed. Swopify is a modern reimagining of that ancient, human tradition.
        </p>
        <p>
          Our founders noticed that while digital marketplaces had transformed how people buy and sell, the art of bartering had been left behind. They set out to build a platform that would bring bartering into the digital age — making it safe, simple, and scalable.
        </p>
        <DocHighlight>
          "We didn't just build an app. We built a community where trust, fairness, and creativity drive every exchange." — Swopify Founders
        </DocHighlight>
        <p>
          Starting in Lagos, Nigeria, Swopify quickly grew as users discovered the joy of trading items they no longer needed for things they truly wanted. From electronics and fashion to professional services and time banking, the platform evolved to meet the diverse needs of its growing community.
        </p>
      </DocSection>

      <DocSection title="What We Offer">
        <DocSubSection title="Barter Marketplace">
          <p>Browse thousands of listings and propose trades directly with other users. Our smart matching system helps you find the best swap opportunities based on your interests and location.</p>
        </DocSubSection>
        <DocSubSection title="Service Exchange">
          <p>Trade skills and services — from tutoring and graphic design to plumbing and cooking. Time Banking lets you earn and spend time credits within the community.</p>
        </DocSubSection>
        <DocSubSection title="Trade Coins & Service Coins">
          <p>Our in-platform currency systems make it easy to assign value to trades, bridge value gaps, and participate in the broader Swopify economy.</p>
        </DocSubSection>
        <DocSubSection title="B2B Trading">
          <p>Businesses can list products and services for bulk trade, opening new channels for commercial exchange without traditional payment barriers.</p>
        </DocSubSection>
      </DocSection>

      <DocSection title="Our Values">
        <DocList items={[
          "Fairness — every trade should benefit both parties equally",
          "Trust — verified profiles and community ratings build confidence",
          "Sustainability — giving items a second life reduces waste",
          "Inclusion — everyone deserves access to a fair marketplace",
          "Community — we grow stronger together through meaningful exchange",
          "Innovation — we continuously improve to serve our users better",
        ]} />
      </DocSection>

      <DocSection title="Our Impact">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-4">
          {[
            { value: "10K+", label: "Active Traders" },
            { value: "50K+", label: "Items Traded" },
            { value: "₦300M+", label: "Value Exchanged" },
            { value: "4.9★", label: "User Rating" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center p-4 rounded-xl bg-gradient-to-br from-[#073232]/5 to-[#32cd32]/5 border border-[#073232]/10">
              <p className="text-2xl font-bold text-[#073232]">{value}</p>
              <p className="text-xs text-gray-600 mt-1">{label}</p>
            </div>
          ))}
        </div>
        <p>
          Every trade on Swopify represents more than an exchange of goods — it's a connection between people, a step toward sustainability, and a contribution to a more equitable economy.
        </p>
      </DocSection>

      <DocSection title="Join Our Community">
        <p>
          Whether you're looking to declutter your home, find a great deal, offer your skills, or build business relationships, Swopify has a place for you. Join thousands of Nigerians who are already trading smarter.
        </p>
        <DocHighlight>
          Download the Swopify app or sign up on our website to start your trading journey today. Your next great swap is just a few taps away.
        </DocHighlight>
      </DocSection>

      <DocSection title="Contact Us">
        <DocList items={[
          "Email: support@swopify.co",
          "Phone: +234 801 234 5678",
          "Location: Lagos, Nigeria",
          "Twitter: @swopifyxchange",
          "Instagram: @swopifyxchange",
        ]} />
      </DocSection>
    </DocLayout>
  )
}
