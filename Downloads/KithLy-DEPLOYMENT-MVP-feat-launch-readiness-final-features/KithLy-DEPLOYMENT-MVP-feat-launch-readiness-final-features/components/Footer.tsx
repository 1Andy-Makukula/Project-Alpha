
import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from './icons/SocialIcons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-kithly-dark text-kithly-light">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4"><span className="gradient-text">KithLy</span></h3>
            <p className="text-sm">Connecting diaspora with local shops for seamless gifting and support.</p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-kithly-accent">About Us</a></li>
              <li><a href="#" className="hover:text-kithly-accent">Careers</a></li>
              <li><a href="#" className="hover:text-kithly-accent">Press</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-kithly-accent">Terms of Service</a></li>
              <li><a href="#" className="hover:text-kithly-accent">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-kithly-accent">Cookie Policy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-kithly-light hover:text-kithly-accent"><Facebook /></a>
              <a href="#" className="text-kithly-light hover:text-kithly-accent"><Twitter /></a>
              <a href="#" className="text-kithly-light hover:text-kithly-accent"><Instagram /></a>
              <a href="#" className="text-kithly-light hover:text-kithly-accent"><Linkedin /></a>
            </div>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-gray-600 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} KithLy Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;