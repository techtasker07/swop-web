import { DocLayout, DocSection, DocSubSection, DocList, DocHighlight } from "@/components/docs/doc-layout"

export const metadata = {
  title: "Cookie Policy | Swopify",
  description: "How Swopify uses cookies and similar tracking technologies.",
}

export default function CookiesPage() {
  return (
    <DocLayout
      title="Cookie Policy"
      subtitle="How we use cookies and similar technologies to improve your experience."
      breadcrumb="Legal"
      lastUpdated="January 2026"
    >
      <DocSection title="What Are Cookies?">
        <p>Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences, keep you logged in, and understand how you use the site.</p>
      </DocSection>

      <DocSection title="How We Use Cookies">
        <DocSubSection title="Essential Cookies">
          <p>These cookies are necessary for the platform to function. They enable core features like account login, security, and session management.</p>
          <DocList items={[
            "Authentication: keep you logged in",
            "Security: protect against fraud and abuse",
            "Session management: remember your preferences during a visit",
          ]} />
        </DocSubSection>

        <DocSubSection title="Performance Cookies">
          <p>These cookies help us understand how users interact with Swopify so we can improve the platform.</p>
          <DocList items={[
            "Analytics: track page views, clicks, and user flows",
            "Error tracking: identify and fix bugs",
            "Performance monitoring: ensure the platform runs smoothly",
          ]} />
        </DocSubSection>

        <DocSubSection title="Functional Cookies">
          <p>These cookies enhance your experience by remembering your choices and preferences.</p>
          <DocList items={[
            "Language preferences",
            "Location settings",
            "Display preferences (dark mode, etc.)",
          ]} />
        </DocSubSection>

        <DocSubSection title="Advertising Cookies">
          <p>We may use cookies to show you relevant ads on other platforms. These cookies track your activity across websites.</p>
          <DocList items={[
            "Retargeting: show you Swopify ads after you leave our site",
            "Ad performance: measure the effectiveness of our campaigns",
          ]} />
        </DocSubSection>
      </DocSection>

      <DocSection title="Third-Party Cookies">
        <p>We work with third-party services that may set their own cookies, including:</p>
        <DocList items={[
          "Google Analytics: for usage analytics",
          "Payment processors: for secure transactions",
          "Social media platforms: for sharing and login features",
        ]} />
        <p className="mt-3">These third parties have their own privacy policies governing their use of cookies.</p>
      </DocSection>

      <DocSection title="Managing Cookies">
        <DocSubSection title="Browser Settings">
          <p>Most browsers allow you to control cookies through their settings. You can:</p>
          <DocList items={[
            "Block all cookies",
            "Block third-party cookies only",
            "Delete cookies after each session",
            "Receive notifications when cookies are set",
          ]} />
          <p className="mt-3">Note that blocking essential cookies may prevent you from using certain features of Swopify.</p>
        </DocSubSection>

        <DocSubSection title="Opt-Out Tools">
          <p>You can opt out of certain types of tracking using these tools:</p>
          <DocList items={[
            "Google Analytics Opt-Out: https://tools.google.com/dlpage/gaoptout",
            "Network Advertising Initiative: https://optout.networkadvertising.org",
          ]} />
        </DocSubSection>
      </DocSection>

      <DocSection title="Mobile App Tracking">
        <p>Our mobile app uses similar tracking technologies, including device identifiers and SDKs. You can manage these through your device settings:</p>
        <DocList items={[
          "iOS: Settings → Privacy → Tracking",
          "Android: Settings → Google → Ads → Opt out of Ads Personalization",
        ]} />
      </DocSection>

      <DocSection title="Updates to This Policy">
        <p>We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date.</p>
      </DocSection>

      <DocHighlight>
        For questions about our use of cookies, contact us at support@swopify.com.
      </DocHighlight>
    </DocLayout>
  )
}
