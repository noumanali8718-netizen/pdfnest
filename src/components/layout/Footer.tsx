import Link from "next/link";

function GithubIcon({ className = "h-4 w-4" }: { className? : string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function XIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function LinkedinIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

const footerLinkClass =
  "inline-block rounded-md text-sm text-slate-400 transition-colors duration-150 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400";

type LinkColumnProps = {
  title: string;
  links: { label: string; href: string }[];
};

function LinkColumn({ title, links }: LinkColumnProps) {
  return (
    <nav aria-label={title}>
      <h3 className="text-sm font-semibold leading-6 text-white">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            <Link href={link.href} className={footerLinkClass}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

const toolLinks = [
  { label: "Merge PDF", href: "/merge-pdf" },
  { label: "Split PDF", href: "/split-pdf" },
  { label: "Compress PDF", href: "/compress-pdf" },
  { label: "Rotate PDF", href: "/rotate-pdf" },
  { label: "Protect PDF", href: "/protect-pdf" },
];

const companyLinks = [
  { label: "About", href: "/#features" },
  { label: "Contact", href: "/#faq" },
  { label: "Roadmap", href: "/#tools" },
  { label: "GitHub", href: "/#tools" },
];

const resourceLinks = [
  { label: "Blog", href: "/#how-it-works" },
  { label: "Help Center", href: "/#faq" },
  { label: "Privacy Policy", href: "/#faq" },
  { label: "Terms", href: "/#faq" },
];

const legalLinks = [
  { label: "Privacy", href: "/#faq" },
  { label: "Terms of Service", href: "/#faq" },
  { label: "Cookie Policy", href: "/#faq" },
];

const socialLinks = [
  { label: "GitHub", href: "#", icon: GithubIcon },
  { label: "Twitter", href: "#", icon: XIcon },
  { label: "LinkedIn", href: "#", icon: LinkedinIcon },
];

export default function Footer() {
  return (
    <footer id="footer" className="bg-slate-900 text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:grid-cols-6">
          {/* Column 1 — Brand */}
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white shadow-sm shadow-blue-600/40">
                P
              </div>
              <span className="text-lg font-bold tracking-tight text-white">
                PDFNest
              </span>
            </div>

            <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-400">
              Fast, private and browser-based PDF tools built for everyone.
              Your files never leave your device.
            </p>

            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="rounded-lg bg-slate-800 p-2.5 text-slate-300 transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-700 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-400"
                  >
<Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Link Columns */}
          <LinkColumn title="Tools" links={toolLinks} />
          <LinkColumn title="Company" links={companyLinks} />
          <LinkColumn title="Resources" links={resourceLinks} />
          <LinkColumn title="Legal" links={legalLinks} />
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 border-t border-slate-800 pt-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-slate-500">
              © {new Date().getFullYear()} PDFNest. Built with Next.js and
              PDF-lib.
            </p>
            <p className="text-sm text-slate-500">
              Made with care for a faster, private web.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
