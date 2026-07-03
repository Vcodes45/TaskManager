import { FiGithub, FiExternalLink } from 'react-icons/fi';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-surface-elevated/50 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-text-muted text-sm">
            © {currentYear} <span className="font-semibold text-text-secondary">TaskAI</span>. All rights reserved.
          </span>
          <div className="flex items-center gap-4 text-sm">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-text-muted hover:text-text-primary transition-colors no-underline"
            >
              <FiGithub size={14} /> GitHub
            </a>
            <span className="text-text-muted/40">|</span>
            <a href="#" className="text-text-muted hover:text-text-primary transition-colors no-underline">
              Privacy
            </a>
            <span className="text-text-muted/40">|</span>
            <a href="#" className="text-text-muted hover:text-text-primary transition-colors no-underline">
              Terms
            </a>
            <span className="text-text-muted/40">|</span>
            <a href="#" className="flex items-center gap-1 text-text-muted hover:text-text-primary transition-colors no-underline">
              Help <FiExternalLink size={11} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
