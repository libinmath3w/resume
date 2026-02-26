'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useInView, type Variants } from 'framer-motion';
import { Analytics } from '@vercel/analytics/react';
import {
  Globe,
  Clock,
  Building2,
  Award,
  ChevronDown,
  ChevronRight,
  Bot,
  Link2,
  Zap,
  BarChart3,
  Monitor,
  Layers,
  BadgeCheck,
  ExternalLink,
  User,
  Briefcase,
  Code2,
  GraduationCap,
  Rocket,
  Sparkles,
  Share2,
  Code,
  Server,
  Cloud,
  Database,
  Network,
  SlidersHorizontal,
  ShieldCheck,
  Activity,
  type LucideIcon,
} from 'lucide-react';

// ─── Animation Variants ────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

// ─── Brand Icons (SVG) ───────────────────────────────────────────────────────

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

// ─── Data ───────────────────────────────────────────────────────────────────

const NAV_SECTIONS = ['about', 'experience', 'skills', 'education', 'projects'] as const;

const NAV_ICONS: Record<string, LucideIcon> = {
  about: User,
  experience: Briefcase,
  skills: Code2,
  education: GraduationCap,
  projects: Rocket,
};

const SKILLS: Record<string, string[]> = {
  Languages: ['Node.js', 'TypeScript', 'JavaScript', 'Python', 'GoLang', 'Java', 'C#'],
  Backend: ['Express.js', 'NestJS', 'GraphQL', 'REST APIs', 'Microservices'],
  Architecture: ['System design', 'Event-driven', 'Distributed systems', 'API design'],
  AWS: ['EKS', 'ECS', 'Lambda', 'API Gateway', 'IAM', 'S3', 'CloudFormation', 'CDK', 'Bedrock'],
  Azure: ['AKS', 'Functions', 'App Services', 'Blob Storage', 'Event Grid', 'Service Bus', 'Entra ID', 'Intune'],
  Streaming: ['Kafka', 'Redpanda', 'ClickHouse'],
  IaC: ['AWS CDK', 'Terraform', 'CloudFormation', 'ARM Templates'],
  Containers: ['Docker', 'Kubernetes', 'Podman', 'Istio', 'Helm'],
  Monitoring: ['Prometheus', 'Grafana', 'CloudWatch', 'Azure Monitor', 'ELK Stack'],
  'CI/CD': ['Jenkins', 'GitHub Actions', 'GitLab CI', 'Bamboo', 'ArgoCD', 'Azure DevOps'],
  Security: ['HashiCorp Vault', 'EJBCA', 'Certbot', 'ACM', 'OAuth2', 'JWT'],
  Databases: ['MySQL', 'PostgreSQL', 'DynamoDB', 'MongoDB', 'CosmosDB'],
};

const SKILL_CATEGORY_ICONS: Record<string, LucideIcon> = {
  Languages: Code2,
  Backend: Server,
  Architecture: Activity,
  AWS: Cloud,
  Azure: Cloud,
  Streaming: Network,
  IaC: Layers,
  Containers: Server,
  Monitoring: Activity,
  'CI/CD': SlidersHorizontal,
  Security: ShieldCheck,
  Databases: Database,
};

const EXPERIENCES = [
  {
    title: 'Technical Lead',
    company: 'SKOVVY INFORMATION TECHNOLOGY LLC',
    period: 'Oct 2025 – Present',
    current: true,
    bullets: [
      'Leading a cross-functional engineering team, managing delivery timelines, architecture decisions, and best practices across multiple projects.',
      'Designing cloud-native architectures focused on scalability, security, observability, and cost optimization.',
      'Building solutions using AWS Bedrock — AI agent workflows, prompt orchestration, and production-ready integration patterns.',
      'Designing and implementing MCP-based integrations for modular tool/connector workflows and extensible agent capabilities.',
      'Implementing event-driven systems using Kafka / Redpanda and enabling high-performance analytics pipelines with ClickHouse.',
      'Delivering device migration workflows for enterprise environments using Azure Entra ID and Microsoft Intune.',
      'Establishing standards for secure development, CI/CD reliability, monitoring, alerting, and incident response.',
    ],
  },
  {
    title: 'Senior Software Engineer',
    company: 'Quest Global',
    period: '2022 – Aug 2025',
    current: false,
    bullets: [
      'Designed and developed scalable Node.js backend services using TypeScript, improving system throughput by 30%.',
      'Built and maintained cloud infrastructure using AWS CDK, Terraform, and CloudFormation, reducing deployment time by 40%.',
      'Developed CI/CD pipelines with Jenkins, GitHub Actions, Azure DevOps, and ArgoCD — decreasing deployment failures by 50%.',
      'Deployed microservices using Docker on AWS ECS/EKS and serverless patterns on AWS Lambda.',
      'Managed API gateways, ALB configurations, Kubernetes ingress (Istio/Nginx), and certificate management (ACM, Certbot, Vault).',
      'Tuned SQL (MySQL/PostgreSQL) and NoSQL (DynamoDB/MongoDB/CosmosDB) systems, improving query performance by 25%.',
      'Implemented serverless solutions reducing operational costs by 30%.',
      'Reduced latency by 20% through profiling and systematic performance optimization.',
    ],
  },
  {
    title: 'Junior Software Engineer',
    company: 'Nuovosys Technologies',
    period: '2019 – 2022',
    current: false,
    bullets: [
      'Developed native Android applications using Kotlin and Java, increasing user engagement by 35%.',
      'Implemented robust app architectures and complex UI components, reducing UI rendering time by 20%.',
      'Collaborated with design and engineering teams to ensure seamless feature integration and releases.',
      'Used Prometheus and Grafana for monitoring (reducing downtime by 15%) and automated infra with Terraform + Kubernetes.',
    ],
  },
];

const PROJECTS: { title: string; description: string; tags: string[]; Icon: LucideIcon }[] = [
  {
    title: 'AI Agents & Bedrock Solutions',
    description: 'Built AI-driven workflows using AWS Bedrock, enabling intelligent automation and assistant capabilities for complex business processes.',
    tags: ['AWS Bedrock', 'AI Agents', 'LLM'],
    Icon: Bot,
  },
  {
    title: 'MCP Tooling & Integrations',
    description: 'Implemented MCP-based integrations to support extensible agent tools and modular service connectivity across multiple domains.',
    tags: ['MCP', 'Node.js', 'TypeScript'],
    Icon: Link2,
  },
  {
    title: 'Streaming & Real-Time Pipelines',
    description: 'Delivered event-driven architectures using Kafka/Redpanda for scalable ingestion, processing, and near real-time analytics.',
    tags: ['Kafka', 'Redpanda', 'Event-driven'],
    Icon: Zap,
  },
  {
    title: 'ClickHouse Analytics',
    description: 'Implemented high-throughput analytics pipelines and optimized query patterns on ClickHouse for performance-critical reporting.',
    tags: ['ClickHouse', 'Analytics', 'SQL'],
    Icon: BarChart3,
  },
  {
    title: 'Device Migration Automation',
    description: 'Designed workflows for Azure Entra ID + Intune device migrations, improving operational consistency and reducing manual effort.',
    tags: ['Azure', 'Entra ID', 'Intune'],
    Icon: Monitor,
  },
  {
    title: 'Infrastructure as Code & CI/CD',
    description: 'Built AWS CDK stacks in TypeScript to provision cloud resources and automated release pipelines, reducing provisioning time by 50%.',
    tags: ['AWS CDK', 'Terraform', 'GitHub Actions'],
    Icon: Layers,
  },
];

const STATS = [
  { value: '6+', label: 'Yrs Exp', Icon: Clock },
  { value: '3', label: 'Companies', Icon: Building2 },
  { value: 'AWS', label: 'Certified', Icon: Award },
];

const LINKS: { href: string; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { href: 'https://github.com/libinmath3w', label: 'github.com/libinmath3w', Icon: GitHubIcon },
  { href: 'https://linkedin.com/in/libinmath3w', label: 'linkedin.com/in/libinmath3w', Icon: LinkedInIcon },
  { href: 'https://libinmathew.vercel.app', label: 'libinmathew.vercel.app', Icon: Globe },
];

// ─── Sub-Components ─────────────────────────────────────────────────────────

function SectionHeading({ children, icon: Icon }: { children: React.ReactNode; icon?: LucideIcon }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      {Icon && <Icon className="h-3.5 w-3.5 text-emerald-400/70 flex-shrink-0" />}
      <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">
        {children}
      </h2>
    </div>
  );
}

function ScrollSection({
  id,
  children,
  className = '',
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      id={id}
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function ExperienceCard({
  title,
  company,
  period,
  current,
  bullets,
  isExpanded,
  onToggle,
}: {
  title: string;
  company: string;
  period: string;
  current: boolean;
  bullets: string[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-expanded={isExpanded}
      className={`group relative rounded-2xl border bg-slate-900/60 p-5 sm:p-6 cursor-pointer select-none transition-all duration-300 ${
        isExpanded
          ? 'border-emerald-500/30 bg-slate-900/90 shadow-[0_0_20px_rgba(52,211,153,0.06)]'
          : 'border-slate-800 hover:border-slate-600'
      }`}
      onClick={onToggle}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onToggle()}
    >
      {current && (
        <span className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Current
        </span>
      )}

      <div className="flex items-start gap-3 pr-16">
        <div
          className={`mt-1.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border transition-all duration-300 ${
            current
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.15)]'
              : 'border-slate-700 bg-slate-800/60 text-slate-500 group-hover:border-slate-600 group-hover:text-slate-400'
          }`}
        >
          <Briefcase className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-slate-50">{title}</h3>
          <p className="text-sm text-slate-300">{company}</p>
          <p className="mt-0.5 text-xs font-medium text-slate-500 uppercase tracking-wide">{period}</p>
        </div>
      </div>

      <div
        className={`absolute bottom-5 right-5 flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-300 ${
          isExpanded
            ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
            : 'border-slate-700 bg-slate-800/60 text-slate-400'
        }`}
      >
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.25 }}
        >
          <ChevronDown className="h-3.5 w-3.5" />
        </motion.div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <ul className="mt-4 space-y-2 border-t border-slate-800/60 pt-4">
              {bullets.map((bullet, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, duration: 0.3 }}
                  className="flex items-start gap-2 text-sm text-slate-300"
                >
                  <ChevronRight className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-500/70" />
                  {bullet}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function Home() {
  const [activeSection, setActiveSection] = useState<string>('about');
  const [expandedExp, setExpandedExp] = useState<number | null>(0);
  const [activeSkillFilter, setActiveSkillFilter] = useState<string | null>(null);

  useEffect(() => {
    const elements = [...NAV_SECTIONS]
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-35% 0px -60% 0px' }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const filteredSkills = activeSkillFilter
    ? { [activeSkillFilter]: SKILLS[activeSkillFilter] }
    : SKILLS;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 antialiased overflow-x-hidden">
      {/* Ambient background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full bg-emerald-500/[0.04] blur-3xl animate-pulse" />
        <div
          className="absolute -left-32 top-1/3 h-72 w-72 rounded-full bg-emerald-500/[0.03] blur-3xl animate-pulse"
          style={{ animationDelay: '2.5s' }}
        />
        <div
          className="absolute bottom-24 right-1/4 h-64 w-64 rounded-full bg-emerald-500/[0.03] blur-3xl animate-pulse"
          style={{ animationDelay: '5s' }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* Shell card */}
        <div className="relative flex flex-1 flex-col gap-0 rounded-3xl border border-slate-800 bg-slate-900/60 shadow-[0_20px_60px_rgba(15,23,42,0.7)] backdrop-blur lg:flex-row">

          {/* ── Left Sidebar ───────────────────────────────────────────── */}
          <motion.aside
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full shrink-0 space-y-7 border-b border-slate-800 p-6 pb-8 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:w-80 lg:overflow-y-auto lg:self-start lg:border-b-0 lg:border-r lg:p-10 lg:pb-10"
          >
            {/* Identity */}
            <section className="space-y-2.5">
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="text-xs font-medium uppercase tracking-[0.25em] text-emerald-400"
              >
                Backend &amp; Platform Engineer
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                LIBIN{' '}
                <span className="text-emerald-400">MATHEW</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
                className="max-w-xs text-sm leading-relaxed text-slate-300"
              >
                Results-driven Technical Lead specializing in Node.js, TypeScript, cloud-native
                platforms, and DevOps automation across AWS and Azure.
              </motion.p>

              {/* Quick links */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="flex flex-wrap gap-2 pt-1"
              >
                <a
                  href="/infinite"
                  className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/60 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200 transition-colors hover:bg-emerald-500/20"
                >
                  <Sparkles className="h-3 w-3" />
                  Infinite
                </a>
                <a
                  href="/share"
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1 text-xs font-medium text-slate-200 transition-colors hover:border-emerald-500 hover:text-emerald-300"
                >
                  <Share2 className="h-3 w-3" />
                  CodeShare
                </a>
              </motion.div>
            </section>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-3 gap-2"
            >
              {STATS.map(({ value, label, Icon }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1 rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-center transition-colors hover:border-emerald-500/20"
                >
                  <Icon className="h-3.5 w-3.5 text-emerald-400/60" />
                  <p className="text-sm font-bold text-emerald-400 leading-none">{value}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </motion.div>

            {/* External links */}
            <section className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Links</p>
              <div className="space-y-1">
                {LINKS.map(({ href, label, Icon }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-slate-300 transition-all hover:bg-slate-800/40 hover:text-emerald-400"
                  >
                    <Icon className="h-4 w-4 flex-shrink-0 text-slate-500 transition-colors group-hover:text-emerald-400" />
                    <span className="underline-offset-4 group-hover:underline">{label}</span>
                    <ExternalLink className="ml-auto h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-slate-500" />
                  </a>
                ))}
              </div>
            </section>

            {/* Navigation */}
            <section className="space-y-1.5">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Navigate</p>
              <nav className="flex flex-col gap-0.5">
                {NAV_SECTIONS.map((id) => {
                  const NavIcon = NAV_ICONS[id];
                  return (
                    <button
                      key={id}
                      onClick={() => scrollTo(id)}
                      className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-left transition-all duration-200 ${
                        activeSection === id
                          ? 'border border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
                          : 'border border-transparent text-slate-400 hover:border-slate-700/60 hover:bg-slate-800/40 hover:text-slate-200'
                      }`}
                    >
                      <NavIcon
                        className={`h-3.5 w-3.5 flex-shrink-0 transition-colors ${
                          activeSection === id
                            ? 'text-emerald-400'
                            : 'text-slate-600 group-hover:text-slate-400'
                        }`}
                      />
                      {id.charAt(0).toUpperCase() + id.slice(1)}
                      {activeSection === id && (
                        <ChevronRight className="ml-auto h-3 w-3 text-emerald-500" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </section>

            {/* Core Focus */}
            <section className="space-y-2">
              <div className="flex items-center gap-2">
                <Code className="h-3.5 w-3.5 text-slate-500" />
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Core Focus</p>
              </div>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="flex flex-wrap gap-1.5"
              >
                {[
                  'Node.js & TypeScript',
                  'Cloud-native architecture',
                  'AWS & Azure',
                  'DevOps automation',
                  'Microservices',
                  'Event-driven systems',
                  'AI Agents & Bedrock',
                  'MCP integrations',
                ].map((item) => (
                  <motion.span
                    key={item}
                    variants={scaleIn}
                    className="cursor-default rounded-full border border-emerald-500/30 bg-emerald-500/5 px-2.5 py-1 text-xs font-medium text-emerald-200 transition-all hover:border-emerald-500/60 hover:bg-emerald-500/10"
                  >
                    {item}
                  </motion.span>
                ))}
              </motion.div>
            </section>
          </motion.aside>

          {/* ── Right Content ───────────────────────────────────────────── */}
          <div className="min-w-0 flex-1 space-y-12 p-6 lg:p-10 lg:pl-8">

            {/* Professional Summary */}
            <ScrollSection id="about" className="space-y-3 scroll-mt-6">
              <SectionHeading icon={User}>Professional Summary</SectionHeading>
              <p className="text-sm leading-relaxed text-slate-300">
                Results-driven{' '}
                <span className="font-semibold text-slate-50">Backend &amp; Platform Engineer / Technical Lead</span>{' '}
                specializing in{' '}
                <span className="font-semibold text-slate-50">Node.js, TypeScript, cloud architecture, and DevOps automation</span>.
                {' '}Strong experience designing and delivering{' '}
                <span className="font-semibold text-slate-50">scalable microservices, event-driven systems, and cloud-native platforms</span>{' '}
                across AWS and Azure. Skilled in{' '}
                <span className="font-semibold text-slate-50">AWS CDK, CI/CD, Kubernetes, containerization, and secure infrastructure automation</span>.
                {' '}Currently leading teams focused on{' '}
                <span className="font-semibold text-slate-50">AWS Bedrock AI solutions, AI agents, MCP integrations</span>,
                and large-scale{' '}
                <span className="font-semibold text-slate-50">device migration workflows using Azure Entra ID and Microsoft Intune</span>,
                along with data/event platforms like{' '}
                <span className="font-semibold text-slate-50">Kafka, Redpanda, and ClickHouse</span>.
              </p>
            </ScrollSection>

            {/* Professional Experience */}
            <ScrollSection id="experience" className="space-y-3 scroll-mt-6">
              <SectionHeading icon={Briefcase}>Professional Experience</SectionHeading>
              <p className="mb-3 flex items-center gap-1.5 text-xs text-slate-500">
                <ChevronDown className="h-3 w-3" />
                Click any role to expand details
              </p>
              <div className="space-y-3">
                {EXPERIENCES.map((exp, i) => (
                  <ExperienceCard
                    key={exp.company}
                    {...exp}
                    isExpanded={expandedExp === i}
                    onToggle={() => setExpandedExp(expandedExp === i ? null : i)}
                  />
                ))}
              </div>
            </ScrollSection>

            {/* Technical Skills */}
            <ScrollSection id="skills" className="space-y-4 scroll-mt-6">
              <SectionHeading icon={Code2}>Technical Skills</SectionHeading>

              {/* Filter bar */}
              <div className="flex flex-col gap-1.5 rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <SlidersHorizontal className="h-3 w-3" />
                    <span>Filter by area</span>
                    {activeSkillFilter && (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                        Active: {activeSkillFilter}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-600">
                    {Object.values(filteredSkills).reduce((acc, arr) => acc + arr.length, 0)} skills visible
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <button
                    onClick={() => setActiveSkillFilter(null)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${
                      activeSkillFilter === null
                        ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                        : 'border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                    }`}
                  >
                    All
                  </button>
                  {Object.keys(SKILLS).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveSkillFilter(activeSkillFilter === cat ? null : cat)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 ${
                        activeSkillFilter === cat
                          ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                          : 'border border-slate-700 text-slate-400 hover:border-slate-600 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSkillFilter ?? '__all__'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                >
                  {Object.entries(filteredSkills).map(([category, skills]) => {
                    const CatIcon = SKILL_CATEGORY_ICONS[category] ?? Code2;
                    return (
                      <div
                        key={category}
                        className="group rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:border-emerald-500/40 hover:bg-slate-900"
                      >
                        <div className="mb-2.5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-700 bg-slate-900/80 text-slate-400 transition-colors group-hover:border-emerald-500/40 group-hover:bg-emerald-500/10 group-hover:text-emerald-300">
                              <CatIcon className="h-3.5 w-3.5" />
                            </span>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-200">
                              {category}
                            </p>
                          </div>
                          <span className="rounded-full bg-slate-900/90 px-2 py-0.5 text-[10px] text-slate-500">
                            {skills.length} skills
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {skills.map((skill) => (
                            <span
                              key={skill}
                              className="cursor-default rounded-md border border-slate-700/60 bg-slate-800/60 px-2 py-0.5 text-xs text-slate-300 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/5 hover:text-emerald-200"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </ScrollSection>

            {/* Education & Certifications */}
            <ScrollSection id="education" className="scroll-mt-6">
              <div className="grid gap-4 lg:grid-cols-[1.2fr_0.9fr]">
                <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 transition-colors hover:border-slate-700">
                  <SectionHeading icon={GraduationCap}>Education</SectionHeading>
                  <div className="space-y-4 text-sm">
                    {[
                      {
                        degree: 'Master of Computer Applications (MCA)',
                        college: "St. Joseph's College of Engineering and Technology, Palai",
                        year: '2016 – 2019',
                      },
                      {
                        degree: 'Bachelor of Computer Applications (BCA)',
                        college: "St. Joseph's Academy of Higher Education and Research, Moolamattom",
                        year: '2013 – 2016',
                      },
                    ].map(({ degree, college, year }) => (
                      <div key={degree} className="border-l-2 border-emerald-500/30 pl-3">
                        <p className="font-semibold text-slate-50">{degree}</p>
                        <p className="mt-0.5 text-xs text-slate-400">{college}</p>
                        <p className="mt-0.5 text-xs text-emerald-400/80">{year}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 transition-colors hover:border-slate-700">
                  <SectionHeading icon={Award}>Certifications</SectionHeading>
                  <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                        <BadgeCheck className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-50">AWS Certified Developer</p>
                        <p className="text-xs text-emerald-400">Associate</p>
                        <p className="mt-1 text-xs text-slate-500">
                          ID: a662bf56-54a6-41e8-8a5d-22d8413f4297
                        </p>
                        <a
                          href="https://www.credly.com/badges/a662bf56-54a6-41e8-8a5d-22d8413f4297/linked_in_profile"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1.5 inline-flex items-center gap-1 text-xs text-slate-400 underline-offset-4 transition-colors hover:text-emerald-400 hover:underline"
                        >
                          Verify on Credly
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollSection>

            {/* Project Highlights */}
            <ScrollSection id="projects" className="space-y-3 scroll-mt-6">
              <SectionHeading icon={Rocket}>Project Highlights</SectionHeading>
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-60px' }}
                className="grid gap-4 md:grid-cols-2"
              >
                {PROJECTS.map(({ title, description, tags, Icon }) => (
                  <motion.article
                    key={title}
                    variants={fadeUp}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className="group relative cursor-default space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 transition-all duration-300 hover:border-emerald-500/25 hover:bg-slate-900/90 hover:shadow-[0_8px_24px_rgba(52,211,153,0.05)]"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 text-slate-400 transition-all group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 group-hover:text-emerald-400">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="text-sm font-semibold text-slate-50 transition-colors group-hover:text-emerald-300">
                        {title}
                      </h3>
                    </div>
                    <p className="text-xs leading-relaxed text-slate-400">{description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2 py-0.5 text-xs text-emerald-300/80"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </ScrollSection>

            {/* Additional Information */}
            <ScrollSection className="scroll-mt-6">
              <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 sm:p-6 transition-colors hover:border-slate-700">
                <SectionHeading>Additional Information</SectionHeading>
                <ul className="space-y-2.5 text-sm">
                  <li className="flex items-start gap-2.5 text-slate-300">
                    <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500/60" />
                    <span>
                      <span className="font-semibold text-slate-50">Open-Source Contributor:</span>{' '}
                      Active on GitHub with projects in cloud automation and microservices.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5 text-slate-300">
                    <ChevronRight className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500/60" />
                    <span>
                      <span className="font-semibold text-slate-50">Community Engagement:</span>{' '}
                      Regular participant in DevOps and cloud-native meetups; passionate about
                      continuous learning and knowledge sharing.
                    </span>
                  </li>
                </ul>
              </div>
            </ScrollSection>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between text-xs text-slate-600">
          <p>
            Last updated{' '}
            <span className="font-medium text-slate-400">Feb 2026</span>
          </p>
          <p>Built with Next.js · Tailwind · Framer Motion</p>
        </div>
      </div>

      <Analytics />
    </main>
  );
}
