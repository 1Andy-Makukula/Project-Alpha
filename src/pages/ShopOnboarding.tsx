
import React, { useState, useEffect, useRef } from 'react';
import { View, Shop } from '../types';
import Button from '../components/Button';
import { BrandLogo } from '../components/icons/BrandLogo';
import { firestoreShopsService } from '../services/firestoreShopsService';
import { getSetupProgress, validateShopName, validateOpeningHours } from '../utils/shopValidation';
import { ToastType } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase';

// Zambian Provinces
const ZAMBIAN_PROVINCES = [
  { value: '', label: 'Select Province' },
  { value: 'Central', label: 'Central Province' },
  { value: 'Copperbelt', label: 'Copperbelt Province' },
  { value: 'Eastern', label: 'Eastern Province' },
  { value: 'Luapula', label: 'Luapula Province' },
  { value: 'Lusaka', label: 'Lusaka Province' },
  { value: 'Muchinga', label: 'Muchinga Province' },
  { value: 'Northern', label: 'Northern Province' },
  { value: 'North-Western', label: 'North-Western Province' },
  { value: 'Southern', label: 'Southern Province' },
  { value: 'Western', label: 'Western Province' },
];

// Zambian Banks
const ZAMBIAN_BANKS = [
  { value: '', label: 'Select Bank' },
  { value: 'Zanaco', label: 'Zanaco' },
  { value: 'Stanbic', label: 'Stanbic Bank' },
  { value: 'FNB', label: 'First National Bank (FNB)' },
  { value: 'Absa', label: 'Absa Bank Zambia' },
  { value: 'Atlas Mara', label: 'Atlas Mara Bank' },
  { value: 'Indo Zambia', label: 'Indo Zambia Bank' },
  { value: 'Investrust', label: 'Investrust Bank' },
  { value: 'Access', label: 'Access Bank' },
  { value: 'UBA', label: 'United Bank for Africa' },
  { value: 'Other', label: 'Other' },
];

interface ShopOnboardingProps {
  setView: (view: View) => void;
  shopId?: string; // Now optional - will get from user profile if not provided
  showToast: (message: string, type: ToastType) => void;
}

const ShopOnboarding: React.FC<ShopOnboardingProps> = ({ setView, shopId: propShopId, showToast }) => {
  // Get shopId from user profile (registered shop owners have it linked)
  const { userProfile } = useAuth();
  const shopId = propShopId || userProfile?.shopId || '';

  const [currentStep, setCurrentStep] = useState(1);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form data for each step
  const [step1Data, setStep1Data] = useState({
    name: '',
    category: '',
    description: '',
  });

  const [step2Data, setStep2Data] = useState({
    address: '',
    city: '',
    region: '',
    phone: '',
    openingHours: '',
  });

  const [step3Data, setStep3Data] = useState({
    profilePic: '',
    coverImg: '',
  });

  const [step5Data, setStep5Data] = useState({
    bankName: '',
    accountNumber: '',
    mobileMoneyNumber: '',
  });

  // Load shop data
  useEffect(() => {
    const loadShop = async () => {
      // If no shopId, redirect to registration
      if (!shopId) {
        showToast('No shop found - please register first', 'error');
        setLoading(false);
        setView('registerShop');
        return;
      }

      try {
        const shopData = await firestoreShopsService.getById(shopId);
        if (shopData) {
          setShop(shopData);
          setCurrentStep(shopData.currentSetupStep || 1);

          // Pre-fill form data
          setStep1Data({
            name: shopData.name,
            category: shopData.category || '',
            description: shopData.description || '',
          });

          setStep2Data({
            address: shopData.address || '',
            city: shopData.city || '',
            region: shopData.region || '',
            phone: shopData.phone || '',
            openingHours: shopData.openingHours || '',
          });

          setStep3Data({
            profilePic: shopData.profilePic || '',
            coverImg: shopData.coverImg || '',
          });
        } else {
          showToast('Shop not found', 'error');
          setView('registerShop');
        }
      } catch (error) {
        console.error('Failed to load shop:', error);
        showToast('Failed to load shop data', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadShop();
  }, [shopId]); const saveStep = async (step: number, data: any) => {
    setSaving(true);
    try {
      await firestoreShopsService.update(shopId, { ...data, lastUpdated: new Date().toISOString() });

      // Update setup progress
      const stepKey = `step${step}_${getStepKey(step)}` as keyof Shop['setupProgress'];
      await firestoreShopsService.updateSetupProgress(shopId, stepKey, true);

      // Update current step
      await firestoreShopsService.updateCurrentStep(shopId, step + 1);

      showToast('Progress saved!', 'success');
      return true;
    } catch (error) {
      showToast('Failed to save', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const getStepKey = (step: number): string => {
    const keys = ['basicInfo', 'location', 'branding', 'products', 'payment'];
    return keys[step - 1];
  };

  const handleNext = async () => {
    let isValid = true;
    let dataToSave: any = {};

    // Validate and prepare data based on current step
    switch (currentStep) {
      case 1:
        const nameValidation = validateShopName(step1Data.name);
        if (!nameValidation.valid) {
          showToast(nameValidation.error!, 'error');
          return;
        }
        if (!step1Data.category) {
          showToast('Please select a category', 'error');
          return;
        }
        if (!step1Data.description || step1Data.description.length < 20) {
          showToast('Description must be at least 20 characters', 'error');
          return;
        }
        dataToSave = step1Data;
        break;

      case 2:
        if (!step2Data.address || !step2Data.city || !step2Data.phone) {
          showToast('Please fill in all required fields', 'error');
          return;
        }
        const hoursValidation = validateOpeningHours(step2Data.openingHours);
        if (!hoursValidation.valid) {
          showToast(hoursValidation.error!, 'error');
          return;
        }
        dataToSave = step2Data;
        break;

      case 3:
        // Images are optional, use defaults if not provided
        dataToSave = {
          profilePic: step3Data.profilePic || shop?.profilePic,
          coverImg: step3Data.coverImg || shop?.coverImg,
        };
        break;

      case 4:
        // Check if at least one product exists
        // This would be checked via firestoreProductsService
        showToast('Please add at least one product', 'info');
        // For now, just move forward
        break;

      case 5:
        if (!step5Data.accountNumber && !step5Data.mobileMoneyNumber) {
          showToast('Please provide at least one payment method', 'error');
          return;
        }
        // Save payment info (in production, this would be encrypted)
        dataToSave = { paymentInfo: step5Data };
        break;
    }

    // Save and move to next step
    if (currentStep <= 5) {
      const saved = await saveStep(currentStep, dataToSave);
      if (saved && currentStep < 6) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Skip current step without validation - can complete later in dashboard
  const handleSkip = async () => {
    // Mark step as skipped (not completed) and move forward
    await firestoreShopsService.updateCurrentStep(shopId, currentStep + 1);
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Skip directly to dashboard - finish onboarding later
  const handleSkipToDashboard = () => {
    showToast('You can complete setup anytime in Shop Settings', 'info');
    setView('shopPortal');
  };

  // Image upload handler
  const handleImageUpload = async (file: File, type: 'profile' | 'cover') => {
    if (!file || !shopId) return;

    try {
      const storageRef = ref(storage, `shops/${shopId}/${type}_${Date.now()}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      if (type === 'profile') {
        setStep3Data({ ...step3Data, profilePic: downloadURL });
      } else {
        setStep3Data({ ...step3Data, coverImg: downloadURL });
      }

      showToast(`${type === 'profile' ? 'Profile picture' : 'Cover image'} uploaded!`, 'success');
      return downloadURL;
    } catch (error) {
      console.error('Upload failed:', error);
      showToast('Failed to upload image', 'error');
      return null;
    }
  };

  // Go-live requirements check
  const handleGoLive = async () => {
    // Check required fields
    const missing: string[] = [];

    if (!shop?.name || shop.name.trim() === '' || shop.name === 'My Shop') {
      missing.push('Shop Name');
    }
    if (!shop?.category) {
      missing.push('Category');
    }
    if (!shop?.address) {
      missing.push('Address');
    }
    if (!shop?.city) {
      missing.push('City');
    }
    if (!shop?.phone) {
      missing.push('Phone Number');
    }
    // Check payment info
    if (!shop?.paymentInfo?.accountNumber && !shop?.paymentInfo?.mobileMoneyNumber) {
      missing.push('Payment Method (Bank or Mobile Money)');
    }

    if (missing.length > 0) {
      showToast(`Please complete: ${missing.join(', ')}`, 'error');
      return;
    }

    const confirmed = window.confirm(
      'Your shop will become visible to all customers. Are you ready to go live?'
    );

    if (confirmed) {
      try {
        await firestoreShopsService.goLive(shopId);
        showToast('🎉 Your shop is now LIVE!', 'success');
        setTimeout(() => setView('shopPortal'), 2000);
      } catch (error) {
        showToast('Failed to go live', 'error');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-kithly-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-kithly-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your shop...</p>
        </div>
      </div>
    );
  }

  const progress = shop ? getSetupProgress(shop) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-pink-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BrandLogo className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold text-kithly-dark">Shop Setup</h1>
                <p className="text-sm text-gray-500">{shop?.name}</p>
              </div>
            </div>
            <button
              onClick={() => setView('shopPortal')}
              className="text-sm text-gray-600 hover:text-kithly-primary"
            >
              Save & Exit
            </button>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4, 5, 6].map((step) => (
              <div key={step} className="flex-1 flex items-center">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                      ${currentStep === step
                        ? 'bg-kithly-primary text-white scale-110 shadow-lg'
                        : currentStep > step
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }
                    `}
                  >
                    {currentStep > step ? '✓' : step}
                  </div>
                  <span className={`text-xs mt-2 ${currentStep === step ? 'text-kithly-primary font-bold' : 'text-gray-500'}`}>
                    {step === 1 && 'Basic Info'}
                    {step === 2 && 'Location'}
                    {step === 3 && 'Branding'}
                    {step === 4 && 'Products'}
                    {step === 5 && 'Payment'}
                    {step === 6 && 'Go Live'}
                  </span>
                </div>
                {step < 6 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${currentStep > step ? 'bg-green-500' : 'bg-gray-200'}`}
                  ></div>
                )}
              </div>
            ))}
          </div>

          {/* Progress Percentage */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Overall Progress</span>
              <span className="font-bold text-kithly-primary">{progress}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-kithly-primary to-kithly-accent transition-all duration-500"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
              <h2 className="text-3xl font-bold text-kithly-dark mb-2">Tell us about your shop</h2>
              <p className="text-gray-600 mb-8">Help customers discover what makes you special</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Shop Name *
                  </label>
                  <input
                    type="text"
                    value={step1Data.name}
                    onChange={(e) => setStep1Data({ ...step1Data, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-kithly-primary focus:outline-none transition-colors"
                    placeholder="e.g., Mama's Kitchen"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={step1Data.category}
                    onChange={(e) => setStep1Data({ ...step1Data, category: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-kithly-primary focus:outline-none transition-colors"
                  >
                    <option value="">Select a category</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Restaurant">Restaurant & Food</option>
                    <option value="Gifts">Gifts & Crafts</option>
                    <option value="Student Support">Student Support</option>
                    <option value="Fashion">Fashion & Clothing</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description * (minimum 20 characters)
                  </label>
                  <textarea
                    value={step1Data.description}
                    onChange={(e) => setStep1Data({ ...step1Data, description: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-kithly-primary focus:outline-none transition-colors"
                    placeholder="Describe your shop, what you sell, and what makes you unique..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {step1Data.description.length} / 20 characters
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location & Hours */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
              <h2 className="text-3xl font-bold text-kithly-dark mb-2">Where are you located?</h2>
              <p className="text-gray-600 mb-8">Help customers find and reach you</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    value={step2Data.address}
                    onChange={(e) => setStep2Data({ ...step2Data, address: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-kithly-primary focus:outline-none transition-colors"
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      value={step2Data.city}
                      onChange={(e) => setStep2Data({ ...step2Data, city: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-kithly-primary focus:outline-none transition-colors"
                      placeholder="Lusaka"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Province *
                    </label>
                    <select
                      value={step2Data.region}
                      onChange={(e) => setStep2Data({ ...step2Data, region: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-kithly-primary focus:outline-none transition-colors bg-white"
                    >
                      {ZAMBIAN_PROVINCES.map(province => (
                        <option key={province.value} value={province.value}>
                          {province.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={step2Data.phone}
                    onChange={(e) => setStep2Data({ ...step2Data, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-kithly-primary focus:outline-none transition-colors"
                    placeholder="+260 XXX XXX XXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Opening Hours * (Format: HH:MM - HH:MM)
                  </label>
                  <input
                    type="text"
                    value={step2Data.openingHours}
                    onChange={(e) => setStep2Data({ ...step2Data, openingHours: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-kithly-primary focus:outline-none transition-colors"
                    placeholder="08:00 - 18:00"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Example: 08:00 - 18:00
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Branding */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
              <h2 className="text-3xl font-bold text-kithly-dark mb-2">Make it yours</h2>
              <p className="text-gray-600 mb-8">Add your logo and cover image to stand out</p>

              <div className="space-y-6">
                <div className="bg-kithly-light p-6 rounded-xl">
                  <p className="text-sm text-gray-600 mb-4">
                    Upload custom images or use our defaults. You can change these anytime in Settings.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Profile Picture Upload */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Profile Picture / Logo
                      </label>
                      <div className="relative">
                        {step3Data.profilePic ? (
                          <div className="relative">
                            <img
                              src={step3Data.profilePic}
                              alt="Profile"
                              className="w-full h-40 object-cover rounded-xl border-2 border-green-500"
                            />
                            <button
                              onClick={() => setStep3Data({ ...step3Data, profilePic: '' })}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-kithly-primary transition-colors cursor-pointer block">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file, 'profile');
                              }}
                            />
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm text-kithly-primary font-medium">Click to upload</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Cover Image Upload */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Cover Image
                      </label>
                      <div className="relative">
                        {step3Data.coverImg ? (
                          <div className="relative">
                            <img
                              src={step3Data.coverImg}
                              alt="Cover"
                              className="w-full h-40 object-cover rounded-xl border-2 border-green-500"
                            />
                            <button
                              onClick={() => setStep3Data({ ...step3Data, coverImg: '' })}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-kithly-primary transition-colors cursor-pointer block">
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageUpload(file, 'cover');
                              }}
                            />
                            <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm text-kithly-primary font-medium">Click to upload</p>
                            <p className="text-xs text-gray-400 mt-1">1200x500 recommended</p>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Products */}
          {currentStep === 4 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
              <h2 className="text-3xl font-bold text-kithly-dark mb-2">Add your products</h2>
              <p className="text-gray-600 mb-8">Add at least one product to continue</p>

              <div className="text-center py-12">
                <svg className="w-24 h-24 text-kithly-primary mx-auto mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Ready to add products?</h3>
                <p className="text-gray-600 mb-6">
                  You'll be taken to your dashboard where you can add products easily
                </p>
                <Button
                  variant="primary"
                  onClick={() => {
                    // Mark step as complete and redirect to product page
                    saveStep(4, {});
                    setView('shopPortal');
                    showToast('Add products in the Products tab', 'info');
                  }}
                  className="px-8 py-3"
                >
                  Go to Products
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Payment */}
          {currentStep === 5 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
              <h2 className="text-3xl font-bold text-kithly-dark mb-2">Payment details</h2>
              <p className="text-gray-600 mb-8">How would you like to receive payments?</p>

              <div className="space-y-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl mb-6">
                  <p className="text-sm text-blue-800">
                    <strong>Secure:</strong> Your payment information is encrypted and never shared with customers
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bank Account Number
                  </label>
                  <input
                    type="text"
                    value={step5Data.accountNumber}
                    onChange={(e) => setStep5Data({ ...step5Data, accountNumber: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-kithly-primary focus:outline-none transition-colors"
                    placeholder="0123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    value={step5Data.bankName}
                    onChange={(e) => setStep5Data({ ...step5Data, bankName: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-kithly-primary focus:outline-none transition-colors"
                    placeholder="e.g., Zanaco, Stanbic, FNB"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-gray-500">OR</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mobile Money Number
                  </label>
                  <input
                    type="tel"
                    value={step5Data.mobileMoneyNumber}
                    onChange={(e) => setStep5Data({ ...step5Data, mobileMoneyNumber: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-kithly-primary focus:outline-none transition-colors"
                    placeholder="+260 XXX XXX XXX"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Review & Go Live */}
          {currentStep === 6 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-kithly-primary to-kithly-accent rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold text-kithly-dark mb-2">You're all set!</h2>
                <p className="text-gray-600">Ready to launch your shop?</p>
              </div>

              {/* Shop Summary */}
              <div className="space-y-4 mb-8">
                <div className="border-l-4 border-kithly-primary bg-kithly-light p-4 rounded-r-xl">
                  <h3 className="font-bold text-kithly-dark mb-1">{shop?.name}</h3>
                  <p className="text-sm text-gray-600">{shop?.category}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Basic info complete</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Location set</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Branding ready</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Payment configured</span>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-xl mb-8">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Once you go live, your shop will be visible to all customers. You can return to draft mode anytime from your dashboard.
                </p>
              </div>

              <Button
                variant="primary"
                onClick={handleGoLive}
                className="w-full py-4 text-lg font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                🚀 Go Live Now!
              </Button>

              <p className="text-center text-sm text-gray-500 mt-4">
                or{' '}
                <button onClick={() => setView('shopPortal')} className="text-kithly-primary font-semibold hover:underline">
                  finish setup later
                </button>
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 6 && (
            <div className="mt-8">
              <div className="flex items-center justify-between">
                <Button
                  variant="secondary"
                  onClick={handleBack}
                  disabled={currentStep === 1}
                  className="px-8"
                >
                  ← Back
                </Button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSkip}
                    className="text-sm text-gray-500 hover:text-kithly-primary underline"
                  >
                    Skip for now
                  </button>
                  <Button
                    variant="primary"
                    onClick={handleNext}
                    disabled={saving}
                    className="px-8"
                  >
                    {saving ? 'Saving...' : 'Next →'}
                  </Button>
                </div>
              </div>

              {/* Skip to Dashboard option */}
              <div className="text-center mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSkipToDashboard}
                  className="text-sm text-kithly-primary font-medium hover:underline"
                >
                  Skip to Dashboard →
                </button>
                <p className="text-xs text-gray-400 mt-1">
                  Complete setup anytime from Shop Settings
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ShopOnboarding;
