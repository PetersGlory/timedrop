'use client';

import { Shield, FileCheck, Copyright, Lock, DollarSign, TrendingUp, MessageCircle } from 'lucide-react';

export default function FrameworkPage() {
  return (
    <div className="container mx-auto max-w-4xl py-8 px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="mb-16 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
          <Shield className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Our Framework
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A comprehensive guide to how Timedrop operates, protects users, and maintains market integrity
        </p>
      </div>

      {/* Main Framework Section */}
      <section className="space-y-8 mb-16">
        {/* Card 1 */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">1. Nature of Service & Regulatory Status</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Timedrop is an information aggregation platform, not a securities exchange or a gambling service. Users trade on the outcome of future events based on their knowledge and analysis, transforming information into tangible value. The platform is designed as a closed-loop, peer-to-peer trading environment where no real-world asset ownership is conveyed, and outcomes are determined by verifiable real-world events.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <FileCheck className="w-6 h-6 text-green-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">2. User Agreement & Terms of Service</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All user activity on Timedrop is governed by a comprehensive Terms of Service agreement. By using the platform, users explicitly agree that they are participating in a skill-based information market and not in gambling or securities trading.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-300"></div>
          <div className="relative bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <Copyright className="w-6 h-6 text-purple-500" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">3. Intellectual Property</h2>
                <p className="text-muted-foreground leading-relaxed">
                  All platform software, technology, interfaces, and the "Timedrop" brand are the exclusive intellectual property of Timedrop Markets. Users retain rights to their own analysis and data but grant the platform a license to display their market activity anonymously for aggregation purposes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Protection Section Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-500 mb-4">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-3">User Protection &amp; Market Integrity</h2>
        <p className="text-muted-foreground">Your security, transparency, and trust are our top priorities</p>
      </div>

      {/* Protection Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 mb-16">
        {/* Security Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
          <div className="relative bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold">Security &amp; Data Protection</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              We employ a strict privacy-by-design approach, ensuring that personal information is collected only for necessary purposes and is never sold to third parties.
            </p>
          </div>
        </div>

        {/* Financial Safeguards Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
          <div className="relative bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold">Financial Safeguards</h3>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">Segregated Accounts:</span> All user funds are held in segregated trust accounts with reputable financial institutions, separate from company operational funds.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">Transparent Settlement:</span> All market settlements are automated, transparent, and based on pre-defined, verifiable data sources.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-500 mt-1">•</span>
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">Liquidity Protection:</span> Mechanisms ensure users can enter and exit positions reliably.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Market Stability Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
          <div className="relative bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold">Market Stability</h3>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">Anti-Manipulation Protocols:</span> We actively monitor trading activity for patterns indicative of manipulation, collusion, or fraud.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">Fair Price Discovery:</span> Market mechanics ensure prices reflect collective knowledge and consensus of all participants.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Dispute Resolution Card */}
        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl opacity-0 group-hover:opacity-20 blur transition duration-300"></div>
          <div className="relative bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="text-lg font-semibold">Dispute Resolution</h3>
            </div>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">•</span>
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">Clear Procedures:</span> Formal process for reporting technical issues, disputed trades, or rule violations.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">•</span>
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">Escalation Path:</span> Dedicated support team with escalation to compliance committee.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-500 mt-1">•</span>
                <span className="text-muted-foreground">
                  <span className="font-medium text-foreground">Responsible Trading:</span> Tools for self-imposed limits and educational resources.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

