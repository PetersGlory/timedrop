'use client';

export default function FrameworkPage() {
  return (
    <div className="container mx-auto max-w-3xl space-y-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Framework</h1>
      </header>

      <section className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">1. Nature of Service & Regulatory Status</h2>
          <p className="text-muted-foreground">
            Timedrop is an information aggregation platform, not a securities exchange or a gambling service. Users trade on the outcome of future events based on their knowledge and analysis, transforming information into tangible value. The platform is designed as a closed-loop, peer-to-peer trading environment where no real-world asset ownership is conveyed, and outcomes are determined by verifiable real-world events.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">2. User Agreement & Terms of Service</h2>
          <p className="text-muted-foreground">
            All user activity on Timedrop is governed by a comprehensive Terms of Service agreement. By using the platform, users explicitly agree that they are participating in a skill-based information market and not in gambling or securities trading.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-semibold">3. Intellectual Property</h2>
          <p className="text-muted-foreground">
            All platform software, technology, interfaces, and the "Timedrop" brand are the exclusive intellectual property of Stride Markets. Users retain rights to their own analysis and data but grant the platform a license to display their market activity anonymously for aggregation purposes.
          </p>
        </div>
      </section>

      <hr className="border-muted" />

      <section className="space-y-6">
        <header>
          <h2 className="text-2xl font-bold tracking-tight">User Protection &amp; Market Integrity</h2>
        </header>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">1. Security &amp; Data Protection</h3>
          <p className="text-muted-foreground">
            We implement bank-grade security protocols, including end-to-end encryption, two-factor authentication (2FA), and regular third-party security audits. User data is handled in strict accordance with the Nigerian Data Protection Act (NDPA). We employ a strict privacy-by-design approach, ensuring that personal information is collected only for necessary purposes and is never sold to third parties.
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">2. Financial Safeguards</h3>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>
              <span className="font-medium text-foreground">Segregated Accounts:</span> All user funds are held in segregated trust accounts with reputable Nigerian financial institutions, separate from company operational funds.
            </li>
            <li>
              <span className="font-medium text-foreground">Transparent Settlement:</span> All market settlements are automated, transparent, and based on pre-defined, verifiable data sources to prevent any manual intervention or bias.
            </li>
            <li>
              <span className="font-medium text-foreground">Liquidity Protection:</span> Mechanisms are in place to manage low-liquidity markets and ensure that users can enter and exit positions reliably.
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">3. Market Stability Mechanisms</h3>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>
              <span className="font-medium text-foreground">Anti-Manipulation Protocols:</span> We actively monitor trading activity for patterns indicative of market manipulation, collusion, or fraud. Any user found engaging in such activity will face immediate suspension and account forfeiture.
            </li>
            <li>
              <span className="font-medium text-foreground">Fair Price Discovery:</span> Our market mechanics are designed to ensure that prices reflect the collective knowledge and consensus of all participants, not the influence of malicious actors.
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold">4. Dispute Resolution &amp; User Support</h3>
          <ul className="list-disc pl-6 text-muted-foreground space-y-2">
            <li>
              <span className="font-medium text-foreground">Clear Procedures:</span> A formal, transparent process is in place for users to report technical issues, disputed trades, or potential rule violations.
            </li>
            <li>
              <span className="font-medium text-foreground">Escalation Path:</span> Disputes are first reviewed by our dedicated support team. Unresolved issues can be escalated to an internal compliance committee for a final and binding decision.
            </li>
            <li>
              <span className="font-medium text-foreground">Responsible Trading:</span> We provide users with tools to manage their participation, including optional self-imposed trading limits and access to educational resources on risk management.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}


