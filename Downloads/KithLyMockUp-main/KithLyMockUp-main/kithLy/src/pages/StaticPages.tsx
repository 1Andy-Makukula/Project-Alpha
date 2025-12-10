
import React from 'react';
import Header from '../components/components/Header';
import Footer from '../components/components/Footer';
import Button from '../components/components/Button';
import { View } from '../types';
import { GiftIcon, CommunityIcon, SupportIcon, StarIcon, DiasporaIcon } from '../components/components/icons/FeatureIcons';
import { ShieldCheckIcon, DocumentTextIcon, QRIcon, MapPinIcon } from '../components/components/icons/NavigationIcons';
import AnimatedBackButton from '../components/components/AnimatedBackButton';

interface StaticPageProps {
  setView: (view: View) => void;
}

const StaticPageLayout: React.FC<{ title: string; subtitle?: string; children: React.ReactNode; setView: (view: View) => void }> = ({ title, subtitle, children, setView }) => (
  <div className="bg-kithly-background min-h-screen flex flex-col relative overflow-hidden selection:bg-kithly-primary selection:text-white">
    {/* Decorative Background Elements */}
    <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-orange-50/80 to-transparent -z-10 pointer-events-none"></div>
    <div className="absolute -top-24 -right-24 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float -z-10 pointer-events-none"></div>
    <div className="absolute top-48 -left-24 w-72 h-72 bg-yellow-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float -z-10 pointer-events-none" style={{animationDelay: '2s'}}></div>

    <Header onCustomerLogin={() => setView('customerPortal')} onShopLogin={() => setView('shopPortal')} />
    
    <main className="flex-grow pt-32 pb-20">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="mb-16 text-center animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-bold text-kithly-dark mb-6 tracking-tight leading-tight">{title}</h1>
            {subtitle && <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto font-light leading-relaxed">{subtitle}</p>}
        </div>
        
        <div className="animate-fade-in" style={{animationDelay: '0.2s'}}>
            {children}
        </div>
      </div>
    </main>
    
    <div className="fixed bottom-4 left-4 md:bottom-8 md:left-8 z-50">
        <AnimatedBackButton onClick={() => setView('landing')} label="Home" className="shadow-xl shadow-orange-900/10" />
    </div>

    <Footer setView={setView} />
  </div>
);

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <h3 className="text-2xl md:text-3xl font-bold text-kithly-dark mb-6 flex items-center gap-3">
        {children}
    </h3>
);

export const AboutUs: React.FC<StaticPageProps> = ({ setView }) => (
  <StaticPageLayout title="About Us" subtitle="Bringing You Closer, One Gift at a Time." setView={setView}>
    <div className="space-y-20">
      {/* Story Section */}
      <section className="grid md:grid-cols-2 gap-12 items-center">
        <div className="prose prose-lg text-gray-600 leading-relaxed">
            <p className="text-lg">
             At <span className="font-bold text-kithly-dark">Kithly</span>, we believe that distance should never get in the way of care. The name "Kithly" is born from the phrase "Kith and Kin"—meaning your friends, neighbors, and family.
            </p>
            <p>
             We started Kithly to solve a simple but painful problem: the difficulty of sending meaningful support to loved ones back home. Sending cash is often impersonal, and shipping physical goods is expensive.
            </p>
        </div>
        <div className="relative">
             <div className="absolute inset-0 bg-gradient-to-tr from-kithly-primary to-kithly-accent rounded-2xl transform rotate-3 opacity-20"></div>
             <img src="https://picsum.photos/id/1060/800/600" alt="Community" className="relative rounded-2xl shadow-lg transform -rotate-2 transition-transform hover:rotate-0 duration-500" />
        </div>
      </section>

      {/* Mission Banner */}
      <section className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100 relative overflow-hidden group hover:shadow-2xl transition-all duration-300">
        <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
            <DiasporaIcon className="w-64 h-64 text-kithly-primary"/>
        </div>
        <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h3 className="text-sm font-bold text-kithly-primary uppercase tracking-widest mb-4">Our Mission</h3>
            <p className="text-3xl md:text-4xl font-bold text-kithly-dark leading-tight">
                "To bridge the gap between the Diaspora and local communities by making gifting <span className="gradient-text">instant, transparent, and trustworthy.</span>"
            </p>
        </div>
      </section>

      {/* How It Works */}
      <section>
        <SectionTitle>How It Works</SectionTitle>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
             <p className="text-lg text-gray-600 leading-relaxed">
                We connect international buyers directly with local shops in Zambia. Whether you are in London, New York, or just a different town in Zambia, you can buy groceries, a birthday cake, or essential supplies from a trusted local vendor. Your loved one receives a secure code instantly to collect it.
            </p>
        </div>
      </section>

      {/* Values */}
      <section>
        <SectionTitle>Our Values</SectionTitle>
        <div className="grid md:grid-cols-3 gap-6">
          {[
              { title: 'Trust', icon: <ShieldCheckIcon className="w-8 h-8"/>, desc: "We ensure the money you spend goes exactly where you intended—to the gift itself." },
              { title: 'Community', icon: <CommunityIcon className="w-8 h-8"/>, desc: "We support local Zambian businesses by giving them a digital storefront to the world." },
              { title: 'Simplicity', icon: <QRIcon className="w-8 h-8"/>, desc: "No apps to download for the recipient. No complex shipping. Just scan and go." }
          ].map((value, idx) => (
              <div key={idx} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className="w-14 h-14 bg-orange-50 rounded-xl flex items-center justify-center text-kithly-primary mb-6">
                    {value.icon}
                </div>
                <h4 className="text-xl font-bold text-kithly-dark mb-3">{value.title}</h4>
                <p className="text-gray-600">{value.desc}</p>
              </div>
          ))}
        </div>
      </section>
    </div>
  </StaticPageLayout>
);

export const Careers: React.FC<StaticPageProps> = ({ setView }) => (
  <StaticPageLayout title="Careers" subtitle="Build the Future of Social Commerce in Africa." setView={setView}>
    <div className="space-y-16">
       <div className="max-w-3xl mx-auto text-center">
          <p className="text-xl text-gray-600 leading-relaxed mb-6">
            Kithly is a small team with a massive vision. We are building the digital infrastructure to connect the Global Diaspora with African local commerce.
          </p>
          <p className="text-gray-500">
            We are currently in our Founding Phase. We aren't just looking for employees; we are looking for builders, problem solvers, and people who care deeply about connecting communities.
          </p>
       </div>

      <section>
        <SectionTitle>Current Openings</SectionTitle>
        <div className="grid gap-6">
            {[
                { title: "Founding Full-Stack Engineer", type: "Engineering", loc: "Remote / Lusaka", desc: "Help us build the core 'Trust Loop' engine using Next.js and Laravel." },
                { title: "Shop Onboarding Specialist", type: "Operations", loc: "Lusaka, Zambia", desc: "Be the face of Kithly to our vendor partners and ensure their success." }
            ].map((job, idx) => (
                <div key={idx} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center group hover:border-kithly-primary/30 transition-all">
                    <div className="mb-4 md:mb-0">
                        <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold text-xl text-kithly-dark">{job.title}</h4>
                            <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-semibold">{job.type}</span>
                        </div>
                        <p className="text-gray-600 mb-2">{job.desc}</p>
                        <div className="flex items-center text-sm text-gray-400 gap-2">
                            <MapPinIcon className="w-4 h-4"/>
                            {job.loc}
                        </div>
                    </div>
                    <Button variant="secondary" className="whitespace-nowrap">View Role</Button>
                </div>
            ))}
        </div>
      </section>

      <div className="bg-gradient-to-br from-kithly-dark to-gray-800 text-white p-10 rounded-3xl text-center shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="relative z-10">
            <h3 className="text-2xl font-bold mb-4">Don’t see a role that fits?</h3>
            <p className="mb-8 text-gray-300 max-w-xl mx-auto">If you are passionate about what we are building, we want to hear from you. Send us your portfolio.</p>
            <a href="mailto:careers@kithly.com" className="inline-block bg-white text-kithly-dark font-bold py-3 px-8 rounded-xl hover:bg-gray-100 transition-colors shadow-lg">
                Email careers@kithly.com
            </a>
        </div>
      </div>
    </div>
  </StaticPageLayout>
);

export const Press: React.FC<StaticPageProps> = ({ setView }) => (
  <StaticPageLayout title="Press" subtitle="Kithly Media Resources." setView={setView}>
    <div className="space-y-16">
      <div className="text-center max-w-3xl mx-auto">
         <p className="text-xl text-gray-600 leading-relaxed">
            Kithly is redefining remittance by shifting the focus from "Sending Cash" to "Sending Care." We are the first platform in Zambia dedicated to "Click & Collect" cross-border gifting.
        </p>
      </div>

      <section>
        <SectionTitle>Fast Facts</SectionTitle>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                <span className="block text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Founded</span>
                <span className="font-black text-4xl text-kithly-dark gradient-text">2025</span>
            </div>
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                <span className="block text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">HQ</span>
                <span className="font-black text-3xl text-kithly-dark">Lusaka, Zambia</span>
            </div>
            <div className="p-8 bg-white rounded-2xl shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
                <span className="block text-xs text-gray-400 uppercase tracking-widest font-bold mb-2">Core Technology</span>
                <span className="font-black text-xl text-kithly-dark">QR "Trust Loop"</span>
            </div>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-8">
        <section className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-kithly-dark mb-4">Media Contact</h3>
            <p className="text-gray-600 mb-6">
                For interviews, comments, or high-resolution assets, please contact our press team.
            </p>
             <a href="mailto:press@kithly.com" className="text-kithly-primary font-bold hover:underline text-lg">press@kithly.com</a>
        </section>
        
        <section className="bg-kithly-light p-8 rounded-2xl border border-kithly-primary/10">
            <h3 className="text-xl font-bold text-kithly-dark mb-4">Brand Assets</h3>
            <p className="text-gray-600 mb-6 text-sm">Includes our signature "Woven Basket" mark, wordmark, and product mockups.</p>
            <button className="w-full flex items-center justify-center space-x-2 bg-white text-kithly-dark font-semibold border border-gray-200 px-6 py-3 rounded-xl hover:border-kithly-primary hover:text-kithly-primary transition-all shadow-sm">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                <span>Download Logo Pack</span>
            </button>
        </section>
      </div>
    </div>
  </StaticPageLayout>
);

const LegalPageLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100 prose prose-lg max-w-none text-gray-700 prose-headings:text-kithly-dark prose-a:text-kithly-primary hover:prose-a:text-kithly-secondary">
        {children}
    </div>
);

export const TermsOfService: React.FC<StaticPageProps> = ({ setView }) => (
  <StaticPageLayout title="Terms of Service" setView={setView}>
    <LegalPageLayout>
      <p className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-8">Last Updated: November 2025</p>

      <h3 className="text-xl font-bold text-kithly-dark mb-2">1. Introduction</h3>
      <p>
        Welcome to Kithly. By accessing our website or using our services, you agree to be bound by these Terms. Kithly is a platform that facilitates the purchase of goods from third-party Vendors ("Shops") for collection by a designated Recipient.
      </p>

      <h3 className="text-xl font-bold text-kithly-dark mb-2">2. The Service</h3>
      <p>
        Kithly acts as an intermediary. We are not the seller of the goods. When you purchase an item, you are buying a "Collection Token" (QR Code) that allows the Recipient to claim that item from the specific Shop listed.
      </p>

      <h3 className="text-xl font-bold text-kithly-dark mb-2">3. Refunds & Cancellations</h3>
      <ul>
          <li><strong>Uncollected Gifts:</strong> Orders can be cancelled for a full refund (minus processing fees) if the Recipient has not yet collected the item and the Code has not been scanned.</li>
          <li><strong>Defective Goods:</strong> If the Recipient collects an item and it is spoiled or incorrect, the dispute must be resolved directly with the Shop at the point of collection. Kithly will assist in mediating but is not liable for the quality of goods.</li>
      </ul>

      <h3 className="text-xl font-bold text-kithly-dark mb-2">4. Code Expiration</h3>
      <p>
        To ensure fair inventory management for our Shops, Collection Codes are valid for 30 days from the date of purchase. Uncollected codes after this time may be voided without refund.
      </p>

      <h3 className="text-xl font-bold text-kithly-dark mb-2">5. User Conduct</h3>
      <p>
        You agree not to use Kithly for any fraudulent purposes, including using stolen credit cards or generating fake redemption codes.
      </p>
    </LegalPageLayout>
  </StaticPageLayout>
);

export const PrivacyPolicy: React.FC<StaticPageProps> = ({ setView }) => (
  <StaticPageLayout title="Privacy Policy" setView={setView}>
    <LegalPageLayout>
      <p className="text-sm text-gray-400 uppercase tracking-widest font-bold mb-8">Last Updated: November 2025</p>

      <h3 className="text-xl font-bold text-kithly-dark mb-2">1. What Information We Collect</h3>
      <p>To facilitate your order, we collect:</p>
      <ul>
          <li><strong>Sender:</strong> Name, Email, Payment Information (Processed securely via Flutterwave; we do not store card details).</li>
          <li><strong>Recipient:</strong> Name and Phone Number (Required to send the SMS notification).</li>
      </ul>

      <h3 className="text-xl font-bold text-kithly-dark mb-2">2. How We Use Your Information</h3>
      <ul>
          <li>To generate the unique secure QR code for your order.</li>
          <li>To send transaction receipts and collection notifications via SMS/Email.</li>
          <li>To prevent fraud and ensure the security of the platform.</li>
      </ul>

      <h3 className="text-xl font-bold text-kithly-dark mb-2">3. Information Sharing</h3>
      <p>
        We share only essential details with the Shop (Recipient Name and Order Contents) to verify the collection. We never sell your personal data to third-party advertisers.
      </p>

      <h3 className="text-xl font-bold text-kithly-dark mb-2">4. Data Security</h3>
      <p>
        We use industry-standard encryption (SSL) and work with PCI-DSS compliant payment processors (Flutterwave) to protect your financial data.
      </p>

      <h3 className="text-xl font-bold text-kithly-dark mb-2">5. Your Rights</h3>
      <p>
        You have the right to request a copy of the data we hold about you or request its deletion by contacting <a href="mailto:privacy@kithly.com">privacy@kithly.com</a>.
      </p>
    </LegalPageLayout>
  </StaticPageLayout>
);

export const CookiePolicy: React.FC<StaticPageProps> = ({ setView }) => (
  <StaticPageLayout title="Cookie Policy" subtitle="How We Use Cookies." setView={setView}>
    <LegalPageLayout>
      <p>
        Kithly uses cookies (small text files stored on your device) to make our website work and to improve your experience.
      </p>

      <h3 className="text-xl font-bold text-kithly-dark mb-2">Types of Cookies We Use</h3>
      <div className="grid gap-4 not-prose my-6">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <span className="font-bold text-kithly-dark block mb-2 text-lg">Essential Cookies</span>
              <p className="text-gray-600">These are required for the website to function (e.g., keeping items in your cart while you shop, or keeping you logged in).</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <span className="font-bold text-kithly-dark block mb-2 text-lg">Functional Cookies</span>
               <p className="text-gray-600">These remember your preferences, such as your language or recent shop searches.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <span className="font-bold text-kithly-dark block mb-2 text-lg">Analytics Cookies</span>
              <p className="text-gray-600">We use anonymous data to see which shops are most popular so we can improve our app.</p>
          </div>
      </div>

      <h3 className="text-xl font-bold text-kithly-dark mb-2">Managing Cookies</h3>
      <p>
        You can choose to disable cookies in your browser settings, but please note that core parts of Kithly (like the Checkout) will not work without them.
      </p>
    </LegalPageLayout>
  </StaticPageLayout>
);
