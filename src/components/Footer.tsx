
import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin } from './icons/SocialIcons';
import { View } from '../types';

interface FooterProps {
  setView: (view: View) => void;
}

const Footer: React.FC<FooterProps> = ({ setView }) => {
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
              <li><button onClick={() => setView('about')} className="hover:text-kithly-accent text-left">About Us</button></li>
              <li><button onClick={() => setView('careers')} className="hover:text-kithly-accent text-left">Careers</button></li>
              <li><button onClick={() => setView('press')} className="hover:text-kithly-accent text-left">Press</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><button onClick={() => setView('terms')} className="hover:text-kithly-accent text-left">Terms of Service</button></li>
              <li><button onClick={() => setView('privacy')} className="hover:text-kithly-accent text-left">Privacy Policy</button></li>
              <li><button onClick={() => setView('cookies')} className="hover:text-kithly-accent text-left">Cookie Policy</button></li>
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
