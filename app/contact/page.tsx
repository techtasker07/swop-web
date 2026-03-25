import { DocLayout, DocSection, DocHighlight, DocList } from "@/components/docs/doc-layout"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export const metadata = {
  title: "Contact Us | Swopify",
  description: "Get in touch with the Swopify team. We're here to help.",
}

export default function ContactPage() {
  return (
    <DocLayout title="Contact Us" subtitle="We'd love to hear from you. Reach out anytime." breadcrumb="Company">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {[
          { icon: Mail, label: "Email", value: "support@swopify.co", href: "mailto:support@swopify.co" },
          { icon: Phone, label: "Phone", value: "+234 801 234 5678", href: "tel:+2348012345678" },
          { icon: MapPin, label: "Location", value: "Lagos, Nigeria", href: null },
          { icon: Clock, label: "Support Hours", value: "Mon–Fri, 9am–6pm WAT", href: null },
        ].map(({ icon: Icon, label, value, href }) => (
          <div key={label} className="flex items-start gap-4 p-5 rounded-xl bg-[#073232]/5 border border-[#073232]/10">
            <div className="h-10 w-10 rounded-full bg-[#32cd32]/20 flex items-center justify-center flex-shrink-0">
              <Icon className="h-5 w-5 text-[#073232]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#073232]">{label}</p>
              {href ? (
                <a href={href} className="text-sm text-gray-600 hover:text-[#073232] transition-colors">{value}</a>
              ) : (
                <p className="text-sm text-gray-600">{value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <DocSection title="General Inquiries">
        <p>For general questions about Swopify, how the platform works, or partnership opportunities, email us at <a href="mailto:support@swopify.co" className="text-[#073232] font-medium underline">support@swopify.co</a>. We typically respond within 24 hours on business days.</p>
      </DocSection>

      <DocSection title="Technical Support">
        <p>Experiencing a bug or technical issue? Please include your device type, app version, and a description of the problem when contacting us. This helps us resolve your issue faster.</p>
        <DocHighlight>For urgent issues, mention "URGENT" in your email subject line and we'll prioritize your request.</DocHighlight>
      </DocSection>

      <DocSection title="Report a User or Listing">
        <p>If you need to report a suspicious user or listing, please use the in-app report feature or email us with the relevant details. We take all reports seriously and investigate promptly.</p>
        <DocList items={[
          "Use the 'Report' button on any listing or profile",
          "Email: support@swopify.co with subject 'Report: [issue]'",
          "Include screenshots or evidence where possible",
          "We aim to respond to reports within 12 hours",
        ]} />
      </DocSection>

      <DocSection title="Business & Partnerships">
        <p>Interested in partnering with Swopify or exploring B2B opportunities? We're always open to collaborations that align with our mission of fair, sustainable exchange.</p>
        <p>Reach out to us at <a href="mailto:support@swopify.co" className="text-[#073232] font-medium underline">support@swopify.co</a> with the subject line "Partnership Inquiry".</p>
      </DocSection>

      <DocSection title="Social Media">
        <DocList items={[
          "Twitter / X: @swopifyxchange",
          "Instagram: @swopifyxchange",
          "Response time on social: within 48 hours",
        ]} />
      </DocSection>
    </DocLayout>
  )
}
