import { DocLayout, DocSection, DocSubSection, DocList, DocHighlight } from "@/components/docs/doc-layout"
import { AlertTriangle, Flag, User, FileText } from "lucide-react"

export const metadata = {
  title: "Report an Issue | Swopify",
  description: "Report a user, listing, or issue on Swopify. We take all reports seriously.",
}

export default function ReportPage() {
  return (
    <DocLayout title="Report an Issue" subtitle="Help us keep Swopify safe by reporting problems." breadcrumb="Support">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { icon: User, label: "Report a User", text: "Suspicious, abusive, or fraudulent behavior." },
          { icon: Flag, label: "Report a Listing", text: "Fake, misleading, or prohibited items." },
          { icon: FileText, label: "Report a Trade", text: "Disputes, scams, or incomplete trades." },
        ].map(({ icon: Icon, label, text }) => (
          <div key={label} className="flex flex-col items-center text-center p-5 rounded-xl bg-[#073232]/5 border border-[#073232]/10">
            <div className="h-10 w-10 rounded-full bg-[#32cd32]/20 flex items-center justify-center mb-3">
              <Icon className="h-5 w-5 text-[#073232]" />
            </div>
            <p className="text-sm font-semibold text-[#073232]">{label}</p>
            <p className="text-xs text-gray-600 mt-1">{text}</p>
          </div>
        ))}
      </div>

      <DocSection title="How to Report In-App">
        <DocSubSection title="Reporting a User">
          <DocList items={[
            "Go to the user's profile page",
            "Tap the three-dot menu (⋮) in the top right",
            "Select 'Report User'",
            "Choose the reason and add details",
            "Submit — we'll review within 24 hours",
          ]} />
        </DocSubSection>
        <DocSubSection title="Reporting a Listing">
          <DocList items={[
            "Open the listing you want to report",
            "Tap the flag icon or three-dot menu",
            "Select 'Report Listing'",
            "Choose the reason (fake, prohibited, misleading, etc.)",
            "Submit your report",
          ]} />
        </DocSubSection>
        <DocSubSection title="Reporting a Trade Dispute">
          <DocList items={[
            "Go to your Trade History",
            "Open the relevant trade",
            "Tap 'Dispute Trade'",
            "Describe the issue and attach evidence if available",
            "Our team will mediate within 48 hours",
          ]} />
        </DocSubSection>
      </DocSection>

      <DocSection title="Report via Email">
        <p>If you're unable to report in-app, email us at <a href="mailto:support@swopify.co" className="text-[#073232] font-medium underline">support@swopify.co</a> with:</p>
        <DocList items={[
          "Subject: 'Report: [User/Listing/Trade]'",
          "The username or listing title involved",
          "A clear description of the issue",
          "Screenshots or evidence (if available)",
          "Your account email for follow-up",
        ]} />
      </DocSection>

      <DocSection title="What Happens After You Report">
        <DocList items={[
          "You'll receive a confirmation that your report was received",
          "Our team reviews all reports within 24 hours",
          "We may contact you for additional information",
          "Action is taken based on our Community Guidelines",
          "You'll be notified of the outcome where appropriate",
        ]} />
      </DocSection>

      <DocSection title="Emergency Situations">
        <DocHighlight>
          If you believe you are in immediate danger or have been a victim of a serious crime, please contact local emergency services (112 in Nigeria) first. Then report to us at support@swopify.co with subject "URGENT".
        </DocHighlight>
      </DocSection>

      <DocSection title="False Reports">
        <p>Submitting false or malicious reports is a violation of our Community Guidelines and may result in your account being suspended. Please only report genuine issues.</p>
      </DocSection>
    </DocLayout>
  )
}
