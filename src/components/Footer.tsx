import { Shield, Github, Twitter, Linkedin } from 'lucide-react';
import { Link } from '../router/Router';

export default function Footer() {
  return (
    <footer className="border-t border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950">
      <div className="container-app py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
                <Shield className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold">CyberLearn</span>
            </Link>
            <p className="mt-3 text-sm text-neutral-500">
              Master cybersecurity through hands-on, interactive learning.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700">
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Platform</h3>
            <ul className="mt-3 space-y-2">
              <li><Link to="/courses" className="text-sm text-neutral-500 hover:text-primary-600">Courses</Link></li>
              <li><Link to="/tools" className="text-sm text-neutral-500 hover:text-primary-600">Security Tools</Link></li>
              <li><Link to="/ai-assistant" className="text-sm text-neutral-500 hover:text-primary-600">AI Assistant</Link></li>
              <li><Link to="/news" className="text-sm text-neutral-500 hover:text-primary-600">Security News</Link></li>
              <li><Link to="/forum" className="text-sm text-neutral-500 hover:text-primary-600">Forum</Link></li>
              <li><Link to="/achievements" className="text-sm text-neutral-500 hover:text-primary-600">Achievements</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Resources</h3>
            <ul className="mt-3 space-y-2">
              <li><Link to="/notes" className="text-sm text-neutral-500 hover:text-primary-600">Notes</Link></li>
              <li><Link to="/certificates" className="text-sm text-neutral-500 hover:text-primary-600">Certificates</Link></li>
              <li><Link to="/profile" className="text-sm text-neutral-500 hover:text-primary-600">Profile</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">About</h3>
            <ul className="mt-3 space-y-2">
              <li><a href="#" className="text-sm text-neutral-500 hover:text-primary-600">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-neutral-500 hover:text-primary-600">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-neutral-500 hover:text-primary-600">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-neutral-200 pt-6 dark:border-neutral-800">
          <p className="text-center text-sm text-neutral-500">
            Built with security in mind. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
