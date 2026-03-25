import { DocLayout, DocSection, DocSubSection, DocList, DocHighlight } from "@/components/docs/doc-layout"
import { ShieldCheck, AlertTriangle, MapPin, Eye } from "lucide-react"

export const metadata = {
  title: "Safety Tips | Swopify",
  description: "Stay safe while trading on Swopify. Essential tips for every trader.",
}

export default function SafetyPage() {
  return (
    <DocLayout title="Safety Tips" subtitle="Your safety is our top priority. Follow these guidelines for every trade." breadcrumb="Support">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {[
          { icon: ShieldCheck, label: "Verify Users", text: "Always check for the KYC verification badge before trading." },
          { icon: MapPin, label: "Safe Zones", text: "Use our Safe Zone locations for in-person exchanges." },
          { icon: Eye, label: "Stay Alert", text: "Trust your instincts — if something feels off, don't proceed." },
          { icon: AlertTriangle, label: "Report Issues", text: "Report suspicious activity immediately." },
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

      <DocSection title="Before You Trade">
        <DocList items={[
          "Check the other user's profile, ratings, and reviews",
          "Look for the KYC verification badge on their profile",
          "Read their trade history and feedback from other users",
          "Communicate clearly about what's being exchanged",
          "Agree on all terms before confirming the trade",
          "Never share personal financial information (bank details, PINs)",
        ]} />
      </DocSection>

      <DocSection title="Meeting in Person">
        <DocSubSection title="Choose Safe Locations">
          <p>Always meet in public, well-lit places. Swopify's Safe Zones feature highlights verified safe meeting points such as police stations, shopping malls, and community centers.</p>
        </DocSubSection>
        <DocSubSection title="Bring a Friend">
          <p>Whenever possible, bring someone you trust to in-person exchanges, especially for high-value items.</p>
        </DocSubSection>
        <DocSubSection title="Inspect Items Before Completing the Trade">
          <p>Always inspect items thoroughly before agreeing the trade is complete. Once you mark a trade as done, it's harder to dispute.</p>
        </DocSubSection>
        <DocList items={[
          "Meet during daylight hours when possible",
          "Tell someone where you're going and who you're meeting",
          "Don't invite strangers to your home",
          "Trust your gut — leave if you feel unsafe",
        ]} />
      </DocSection>

      <DocSection title="Online Safety">
        <DocList items={[
          "Keep all communication within the Swopify app",
          "Never move conversations to WhatsApp or other platforms before completing the trade",
          "Don't click suspicious links sent by other users",
          "Never pay outside the platform — use Trade Coins for value gaps",
          "Be wary of deals that seem too good to be true",
        ]} />
      </DocSection>

      <DocSection title="Recognizing Scams">
        <DocSubSection title="Common Red Flags">
          <DocList items={[
            "User asks you to pay cash outside the platform",
            "Pressure to complete the trade quickly",
            "Listing photos that look like stock images",
            "User refuses to video call or meet in person",
            "Requests for your bank account or personal details",
            "Offers that are significantly above market value",
          ]} />
        </DocSubSection>
      </DocSection>

      <DocSection title="Reporting Issues">
        <p>If you encounter suspicious behavior, report it immediately using the in-app report button on any profile or listing. You can also email us at support@swopify.com.</p>
        <DocHighlight>
          Your reports help keep the entire Swopify community safe. We investigate every report and take action within 24 hours.
        </DocHighlight>
      </DocSection>
    </DocLayout>
  )
}
