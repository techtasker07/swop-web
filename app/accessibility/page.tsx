import { DocLayout, DocSection, DocSubSection, DocList, DocHighlight } from "@/components/docs/doc-layout"

export const metadata = {
  title: "Accessibility | Swopify",
  description: "Swopify's commitment to making our platform accessible to everyone.",
}

export default function AccessibilityPage() {
  return (
    <DocLayout
      title="Accessibility"
      subtitle="Our commitment to making Swopify accessible to everyone."
      breadcrumb="Accessibility"
      lastUpdated="January 2026"
    >
      <DocSection title="Our Commitment">
        <p>Swopify is committed to ensuring our platform is accessible to all users, including those with disabilities. We believe that everyone deserves equal access to our marketplace, and we continuously work to improve the accessibility of our web and mobile experiences.</p>
      </DocSection>

      <DocSection title="Accessibility Standards">
        <p>We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. These guidelines help make web content more accessible to people with a wide range of disabilities, including:</p>
        <DocList items={[
          "Visual impairments (blindness, low vision, color blindness)",
          "Hearing impairments",
          "Motor disabilities",
          "Cognitive and learning disabilities",
        ]} />
      </DocSection>

      <DocSection title="Features We've Implemented">
        <DocSubSection title="Visual Accessibility">
          <DocList items={[
            "High contrast color scheme throughout the platform",
            "Text that can be resized without loss of functionality",
            "Alt text on all meaningful images",
            "Clear visual focus indicators for keyboard navigation",
            "Sufficient color contrast ratios for text and UI elements",
          ]} />
        </DocSubSection>
        <DocSubSection title="Navigation">
          <DocList items={[
            "Full keyboard navigation support",
            "Logical tab order throughout pages",
            "Skip navigation links for screen reader users",
            "Descriptive page titles and headings",
            "Consistent navigation across all pages",
          ]} />
        </DocSubSection>
        <DocSubSection title="Screen Reader Support">
          <DocList items={[
            "Semantic HTML structure",
            "ARIA labels and roles where appropriate",
            "Meaningful link text (no 'click here' links)",
            "Form labels associated with their inputs",
            "Error messages that are clearly communicated",
          ]} />
        </DocSubSection>
      </DocSection>

      <DocSection title="Mobile App Accessibility">
        <DocList items={[
          "Support for iOS VoiceOver and Android TalkBack",
          "Touch targets sized appropriately for motor accessibility",
          "Support for system font size preferences",
          "Reduced motion support for users with vestibular disorders",
        ]} />
      </DocSection>

      <DocSection title="Known Limitations">
        <p>While we strive for full accessibility, some areas of our platform are still being improved. Known limitations include:</p>
        <DocList items={[
          "Some older content may not have complete alt text",
          "Complex data tables may not be fully optimized for screen readers",
          "Some third-party embedded content may not meet our accessibility standards",
        ]} />
        <p className="mt-3">We are actively working to address these limitations in upcoming updates.</p>
      </DocSection>

      <DocSection title="Feedback & Support">
        <p>We welcome feedback on the accessibility of Swopify. If you encounter any barriers or have suggestions for improvement, please let us know.</p>
        <DocHighlight>
          Email us at support@swopify.co with the subject "Accessibility Feedback". We aim to respond within 2 business days and will work with you to provide the information or functionality you need.
        </DocHighlight>
      </DocSection>

      <DocSection title="Formal Complaints">
        <p>If you are not satisfied with our response to your accessibility concern, you may contact the relevant regulatory authority in your jurisdiction. In Nigeria, this would be the National Information Technology Development Agency (NITDA).</p>
      </DocSection>
    </DocLayout>
  )
}
