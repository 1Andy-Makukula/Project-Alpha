
import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Button from '../components/Button';
import { GiftIcon, GroceriesIcon, SupportIcon, RevenueIcon, DiasporaIcon, CommunityIcon, StarIcon } from '../components/icons/FeatureIcons';
import { ShoppingCartScene, GiftingScene, SendingLoveScene, StudentScene } from '../components/icons/SceneIcons';
import { SearchIcon, UserIcon, PlusCircleIcon } from '../components/icons/NavigationIcons';
import { View } from '../types';

interface LandingPageProps {
  setView: (view: View, shopId?: number, searchQuery?: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ setView }) => {
  const customerBenefits = [
    { icon: <GiftIcon />, title: "Thoughtful Gifting", description: "Send meaningful gifts to loved ones back home, effortlessly." },
    { icon: <GroceriesIcon />, title: "Essential Groceries", description: "Ensure your family has everything they need with reliable grocery delivery." },
    { icon: <SupportIcon />, title: "Student Support", description: "Support students with supplies and necessities directly from local shops." },
  ];

  const shopBenefits = [
    { icon: <RevenueIcon />, title: "Increase Revenue", description: "Tap into a new stream of income from the global diaspora community." },
    { icon: <DiasporaIcon />, title: "Access Diaspora", description: "Connect with customers worldwide who want to support their local communities." },
    { icon: <CommunityIcon />, title: "Strengthen Community", description: "Become a vital link between those abroad and their families at home." },
  ];

  const testimonials = [
    { name: "Adanna E.", rating: 5, comment: "KithLy made it so easy to send my mother a birthday gift. She was overjoyed!", image: "https://picsum.photos/id/1011/100/100" },
    { name: "Michael O.", rating: 5, comment: "I use it for weekly groceries for my parents. It's reliable and gives me peace of mind.", image: "https://picsum.photos/id/1005/100/100" },
    { name: "Chloe S.", rating: 4, comment: "A great platform for supporting local businesses from afar. Highly recommend.", image: "https://picsum.photos/id/1027/100/100" },
  ];

  const lifeScenes = [
    {
      icon: <ShoppingCartScene />,
      title: "Shop for Groceries",
      description: "Adanna, working in London, easily buys weekly groceries for her parents in Lagos, ensuring they always have fresh food."
    },
    {
      icon: <GiftingScene />,
      title: "Send a Thoughtful Gift",
      description: "Michael finds a unique handcrafted gift from a local artisan in Accra for his friend's wedding, all from his home in New York."
    },
    {
      icon: <SendingLoveScene />,
      title: "Celebrate from Afar",
      description: "For her mother's birthday, Chloe orders a beautiful cake and flowers from a neighborhood shop in Nairobi to be delivered."
    },
    {
      icon: <StudentScene />,
      title: "Support a Student",
      description: "David supports his younger cousin's education by purchasing textbooks and supplies directly from a campus store in Johannesburg."
    },
  ]

  return (
    <div className="bg-kithly-background">
      <Header
        onCustomerLogin={() => setView('customerPortal')}
        onShopLogin={() => setView('shopPortal')}
      />

      <main>
        {/* Hero Section */}
        <section
          className="relative flex items-center justify-center text-center bg-cover bg-center min-h-[70vh] py-20"
          style={{ backgroundImage: "url('https://picsum.photos/id/1013/1600/900')" }}
        >
          <div className="relative container mx-auto px-6">
            <div className="max-w-4xl mx-auto bg-white/60 backdrop-blur-2xl rounded-2xl p-8 md:p-12 shadow-2xl border border-white/30">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight text-kithly-dark mb-4">
                Connect Across Continents. <br />
                <span className="gradient-text">Support Locally.</span>
              </h1>
              <p className="text-lg md:text-xl text-kithly-dark/80 max-w-3xl mx-auto mb-8">
                The most thoughtful way for the diaspora to send gifts, groceries, and support to loved ones in Africa, while empowering local shops.
              </p>

              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Button variant="primary" onClick={() => setView('customerPortal')}>Explore Shops</Button>
                <Button variant="secondary" onClick={() => setView('registerShop')}>Become a Partner</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Section */}
        <section id="customers" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">For Our Customers</h2>
              <p className="mt-4 text-lg text-kithly-dark max-w-2xl mx-auto">Who We Are: Your bridge to home, making cross-border care simple, secure, and personal.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center mb-12">
              {customerBenefits.map((item, index) => (
                <div key={index} className="p-8 bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-transform duration-300 hover:-translate-y-1">
                  <div className="inline-block p-4 rounded-full gradient-bg text-white mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm">{item.description}</p>
                </div>
              ))}
            </div>

            {/* Customer Registration Link */}
            <div className="text-center">
              <div className="inline-block bg-white p-2 pr-4 rounded-full shadow-lg border border-gray-100 hover:border-kithly-primary transition-colors">
                <button onClick={() => setView('registerCustomer')} className="flex items-center space-x-3">
                  <span className="bg-kithly-light p-3 rounded-full text-kithly-primary">
                    <UserIcon className="w-6 h-6" />
                  </span>
                  <span className="text-left">
                    <span className="block text-xs text-gray-500 font-semibold uppercase tracking-wide">Ready to send love?</span>
                    <span className="block font-bold text-kithly-dark">Create Customer Account &rarr;</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Animated Scenes Section */}
        <section className="py-20 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">Connecting Lives, One Gift at a Time</h2>
              <p className="mt-4 text-lg text-kithly-dark max-w-3xl mx-auto">See how KithLy makes a difference in everyday moments.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {lifeScenes.map((scene, index) => (
                <div key={index} className="text-center p-6 bg-kithly-background rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] animate-fade-in" style={{ animationDelay: `${index * 150}ms` }}>
                  <div className="relative h-48 mb-4 flex items-center justify-center">
                    <div className="animate-float" style={{ animationDelay: `${index * 200}ms` }}>
                      {scene.icon}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-kithly-dark mb-2">{scene.title}</h3>
                  <p className="text-sm text-gray-500">{scene.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-20 bg-kithly-background">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">What People Are Saying</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="bg-white p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center mb-4">
                    <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full mr-4" />
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <div className="flex">
                        {[...Array(testimonial.rating)].map((_, i) => <StarIcon key={i} className="text-kithly-accent" />)}
                        {[...Array(5 - testimonial.rating)].map((_, i) => <StarIcon key={i} className="text-[#D6D6D8]" />)}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-kithly-dark">"{testimonial.comment}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Shop Section */}
        <section id="shops" className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">For Our Shop Partners</h2>
              <p className="mt-4 text-lg text-kithly-dark max-w-2xl mx-auto">Who We Are to Shops: Your growth partner, connecting you to the global diaspora market.</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 text-center mb-12">
              {shopBenefits.map((item, index) => (
                <div key={index} className="p-8 bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-transform duration-300 hover:-translate-y-1">
                  <div className="inline-block p-4 rounded-full gradient-bg text-white mb-4">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm">{item.description}</p>
                </div>
              ))}
            </div>

            {/* Shop Registration Link */}
            <div className="text-center">
              <div className="inline-block bg-white p-2 pr-4 rounded-full shadow-lg border border-gray-100 hover:border-kithly-primary transition-colors">
                <button onClick={() => setView('registerShop')} className="flex items-center space-x-3">
                  <span className="bg-kithly-light p-3 rounded-full text-kithly-primary">
                    <PlusCircleIcon className="w-6 h-6" />
                  </span>
                  <span className="text-left">
                    <span className="block text-xs text-gray-500 font-semibold uppercase tracking-wide">Own a shop?</span>
                    <span className="block font-bold text-kithly-dark">Register Your Shop &rarr;</span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer setView={setView} />
    </div>
  );
};

export default LandingPage;
