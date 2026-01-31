
import React, { useState, useEffect, useRef } from 'react';
import { View, Shop, Product } from '../types';
import Button from '../components/Button';
import { BrandLogo } from '../components/icons/BrandLogo';
import { firestoreShopsService } from '../services/firestoreShopsService';
import { ToastType } from '../components/Toast';
import { useAuth } from '../contexts/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../services/firebase';
import { firestoreProductsService } from '../services/firestoreProductsService';
import { ZAMBIAN_BANKS, ZAMBIAN_PROVINCES } from '../data/zambianData';

interface ShopOnboardingProps {
  setView: (view: View) => void;
  shopId?: string;
  showToast: (message: string, type: ToastType) => void;
}

// Step labels for the 7-step flow
const STEP_LABELS = [
  'Business Type',
  'Basic Info',
  'Location',
  'Branding',
  'Compliance',
  'Products',
  'Payment'
];

const ShopOnboarding: React.FC<ShopOnboardingProps> = ({ setView, shopId: propShopId, showToast }) => {
  const { userProfile } = useAuth();
  const shopId = propShopId || userProfile?.shopId || '';

  const [currentStep, setCurrentStep] = useState(0);
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadLoading, setUploadLoading] = useState<string | null>(null);

  // Step 0: Business Type
  const [businessType, setBusinessType] = useState<'registered_business' | 'independent_seller' | ''>('');

  // Step 1: Basic Info
  const [step1Data, setStep1Data] = useState({
    name: '',
    category: '',
    description: '',
  });

  // Step 2: Location
  const [step2Data, setStep2Data] = useState({
    address: '',
    city: '',
    region: '',
    phone: '',
    openingHours: '',
  });

  // Step 3: Branding
  const [step3Data, setStep3Data] = useState({
    profilePic: '',
    coverImg: '',
  });

  // Step 4: Compliance Documents
  const [step4Data, setStep4Data] = useState({
    nrcUrl: '',
    pacraUrl: '',
  });

  // Step 5: Products
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    category: '',
    stock: '',
    description: '',
    image: '',
  });
  const [productImagePreview, setProductImagePreview] = useState<string | null>(null);
  const [addingProduct, setAddingProduct] = useState(false);

  // Step 6: Payment
  const [step6Data, setStep6Data] = useState({
    bankName: '',
    accountNumber: '',
    accountName: '',
    mobileMoneyNumber: '',
    mobileMoneyProvider: '',
    tpin: '',
    taxCategory: 'NONE' as 'VAT' | 'TOT' | 'NONE',
  });

  // Validation errors
  const [errors, setErrors] = useState<string[]>([]);

  // Load shop data
  useEffect(() => {
    const loadShop = async () => {
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
          setCurrentStep(shopData.currentSetupStep || 0);

          // Pre-fill form data
          if (shopData.businessType) {
            setBusinessType(shopData.businessType);
          }

          setStep1Data({
            name: shopData.name || '',
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

          setStep4Data({
            nrcUrl: shopData.complianceDocuments?.nrcUrl || '',
            pacraUrl: shopData.complianceDocuments?.pacraUrl || '',
          });

          setStep6Data({
            bankName: shopData.paymentInfo?.bankName || '',
            accountNumber: shopData.paymentInfo?.accountNumber || '',
            accountName: shopData.paymentInfo?.accountName || '',
            mobileMoneyNumber: shopData.paymentInfo?.mobileMoneyNumber || '',
            mobileMoneyProvider: shopData.paymentInfo?.mobileMoneyProvider || '',
            tpin: shopData.tpin || '',
            taxCategory: shopData.taxCategory || 'NONE',
          });

          // Load existing products
          const existingProducts = await firestoreProductsService.getAll(shopId);
          setProducts(existingProducts);
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
  }, [shopId]);

  // Validation functions for each step
  const validateStep = (step: number): string[] => {
    const validationErrors: string[] = [];

    switch (step) {
      case 0: // Business Type
        if (!businessType) {
          validationErrors.push('Please select your business type');
        }
        break;

      case 1: // Basic Info
        if (!step1Data.name || step1Data.name.trim().length < 3) {
          validationErrors.push('Shop name must be at least 3 characters');
        }
        if (!step1Data.category) {
          validationErrors.push('Please select a category');
        }
        if (!step1Data.description || step1Data.description.length < 20) {
          validationErrors.push('Description must be at least 20 characters');
        }
        break;

      case 2: // Location
        if (!step2Data.address) {
          validationErrors.push('Street address is required');
        }
        if (!step2Data.city) {
          validationErrors.push('City is required');
        }
        if (!step2Data.region) {
          validationErrors.push('Province is required');
        }
        if (!step2Data.phone) {
          validationErrors.push('Phone number is required');
        }
        break;

      case 3: // Branding
        if (!step3Data.profilePic) {
          validationErrors.push('Profile picture is required');
        }
        if (!step3Data.coverImg) {
          validationErrors.push('Cover image is required');
        }
        break;

      case 4: // Compliance Documents
        if (!step4Data.nrcUrl) {
          validationErrors.push('NRC document is required');
        }
        if (businessType === 'registered_business' && !step4Data.pacraUrl) {
          validationErrors.push('PACRA certificate is required for registered businesses');
        }
        break;

      case 5: // Products
        if (products.length === 0) {
          validationErrors.push('Please add at least one product');
        }
        break;

      case 6: // Payment
        const hasBankInfo = step6Data.bankName && step6Data.accountNumber && step6Data.accountName;
        const hasMobileInfo = step6Data.mobileMoneyNumber && step6Data.mobileMoneyProvider;
        if (!hasBankInfo && !hasMobileInfo) {
          validationErrors.push('Please provide at least one payment method (Bank or Mobile Money)');
        }
        break;
    }

    return validationErrors;
  };

  // Save step data to Firestore
  const saveStep = async (step: number): Promise<boolean> => {
    setSaving(true);
    try {
      let dataToSave: any = { lastUpdated: new Date().toISOString() };

      switch (step) {
        case 0:
          dataToSave.businessType = businessType;
          break;
        case 1:
          dataToSave = { ...dataToSave, ...step1Data };
          break;
        case 2:
          dataToSave = { ...dataToSave, ...step2Data };
          break;
        case 3:
          dataToSave = { ...dataToSave, ...step3Data };
          break;
        case 4:
          dataToSave.complianceDocuments = {
            ...step4Data,
            submittedAt: new Date().toISOString(),
          };
          break;
        case 5:
          // Products are saved individually, just mark step complete
          break;
        case 6:
          dataToSave.paymentInfo = {
            bankName: step6Data.bankName,
            accountNumber: step6Data.accountNumber,
            accountName: step6Data.accountName,
            mobileMoneyNumber: step6Data.mobileMoneyNumber,
            mobileMoneyProvider: step6Data.mobileMoneyProvider,
          };
          dataToSave.tpin = step6Data.tpin;
          dataToSave.taxCategory = step6Data.taxCategory;
          break;
      }

      await firestoreShopsService.update(shopId, dataToSave);

      // Update setup progress
      const stepKeys = [
        'step0_businessType',
        'step1_basicInfo',
        'step2_location',
        'step3_branding',
        'step4_compliance',
        'step5_products',
        'step6_payment',
      ];
      await firestoreShopsService.updateSetupProgress(
        shopId,
        stepKeys[step] as keyof Shop['setupProgress'],
        true
      );

      // Update current step (move to next)
      await firestoreShopsService.updateCurrentStep(shopId, step + 1);

      return true;
    } catch (error) {
      console.error('Failed to save step:', error);
      showToast('Failed to save progress', 'error');
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Handle Next button
  const handleNext = async () => {
    const validationErrors = validateStep(currentStep);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      showToast(validationErrors[0], 'error');
      return;
    }

    setErrors([]);
    const saved = await saveStep(currentStep);
    if (saved && currentStep < 6) {
      setCurrentStep(currentStep + 1);
      showToast('Progress saved!', 'success');
    }
  };

  // Handle Back button
  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setErrors([]);
    }
  };

  // Image upload handler
  const handleImageUpload = async (file: File, type: 'profile' | 'cover' | 'nrc' | 'pacra' | 'product'): Promise<string | null> => {
    if (!file || !shopId) return null;

    setUploadLoading(type);
    try {
      const storageRef = ref(storage, `shops/${shopId}/${type}_${Date.now()}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      if (type === 'profile') {
        setStep3Data({ ...step3Data, profilePic: downloadURL });
      } else if (type === 'cover') {
        setStep3Data({ ...step3Data, coverImg: downloadURL });
      } else if (type === 'nrc') {
        setStep4Data({ ...step4Data, nrcUrl: downloadURL });
      } else if (type === 'pacra') {
        setStep4Data({ ...step4Data, pacraUrl: downloadURL });
      }

      showToast('File uploaded successfully!', 'success');
      return downloadURL;
    } catch (error: any) {
      console.error('Upload failed:', error);
      console.error('Error code:', error?.code);
      console.error('Error message:', error?.message);

      // Provide more helpful error message
      let errorMessage = 'Failed to upload file';
      if (error?.code === 'storage/unauthorized') {
        errorMessage = 'Upload permission denied. Please sign in again.';
      } else if (error?.code === 'storage/canceled') {
        errorMessage = 'Upload was cancelled';
      } else if (error?.code === 'storage/unknown') {
        errorMessage = 'Upload failed. Please check your internet connection.';
      }

      showToast(errorMessage, 'error');
      return null;
    } finally {
      setUploadLoading(null);
    }
  };

  // Product image upload
  const handleProductImageUpload = async (file: File) => {
    if (!file || !shopId) return;

    setUploadLoading('product');
    try {
      const storageRef = ref(storage, `shops/${shopId}/products/${Date.now()}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      setNewProduct({ ...newProduct, image: downloadURL });
      setProductImagePreview(downloadURL);
      showToast('Product image uploaded!', 'success');
    } catch (error) {
      console.error('Upload failed:', error);
      showToast('Failed to upload image', 'error');
    } finally {
      setUploadLoading(null);
    }
  };

  // Add product handler
  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.category) {
      showToast('Please fill in product name, price, and category', 'error');
      return;
    }

    setAddingProduct(true);
    try {
      const productData = {
        shopId,
        name: newProduct.name,
        price: parseFloat(newProduct.price),
        category: newProduct.category,
        stock: parseInt(newProduct.stock) || 10,
        description: newProduct.description || '',
        image: newProduct.image || 'https://via.placeholder.com/400x400?text=Product',
      };

      await firestoreProductsService.create(productData);

      // Refresh products list
      const updatedProducts = await firestoreProductsService.getAll(shopId);
      setProducts(updatedProducts);

      // Reset form
      setNewProduct({ name: '', price: '', category: '', stock: '', description: '', image: '' });
      setProductImagePreview(null);
      showToast('Product added!', 'success');
    } catch (error) {
      console.error('Failed to add product:', error);
      showToast('Failed to add product', 'error');
    } finally {
      setAddingProduct(false);
    }
  };

  // Go Live handler
  const handleGoLive = async () => {
    // Final validation - check all steps are complete
    const allStepsValid = [0, 1, 2, 3, 4, 5, 6].every(step => validateStep(step).length === 0);

    if (!allStepsValid) {
      showToast('Please complete all required steps before going live', 'error');
      return;
    }

    // Save final step
    const saved = await saveStep(6);
    if (!saved) return;

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

  const progress = Math.round(((currentStep + 1) / 7) * 100);

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
                <p className="text-sm text-gray-500">{shop?.name || 'New Shop'}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-4 overflow-x-auto">
            {STEP_LABELS.map((label, step) => (
              <div key={step} className="flex-1 flex items-center min-w-0">
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
                  <span className={`text-xs mt-2 text-center ${currentStep === step ? 'text-kithly-primary font-bold' : 'text-gray-500'}`}>
                    {label}
                  </span>
                </div>
                {step < 6 && (
                  <div className={`h-1 flex-1 mx-2 ${currentStep > step ? 'bg-green-500' : 'bg-gray-200'}`}></div>
                )}
              </div>
            ))}
          </div>

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

          {/* Validation Errors Alert */}
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
              <h4 className="font-bold text-red-700 mb-2">Please fix the following:</h4>
              <ul className="list-disc list-inside text-red-600 text-sm">
                {errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Step 0: Business Type */}
          {currentStep === 0 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
              <h2 className="text-3xl font-bold text-kithly-dark mb-2">What type of seller are you?</h2>
              <p className="text-gray-600 mb-8">This helps us customize your experience and compliance requirements</p>

              <div className="grid md:grid-cols-2 gap-6">
                <button
                  onClick={() => setBusinessType('registered_business')}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${businessType === 'registered_business'
                    ? 'border-kithly-primary bg-kithly-light'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="text-4xl mb-4">🏢</div>
                  <h3 className="text-xl font-bold text-kithly-dark">Registered Business</h3>
                  <p className="text-gray-600 text-sm mt-2">
                    I have a registered company with PACRA certification
                  </p>
                  <ul className="text-xs text-gray-500 mt-4 space-y-1">
                    <li>• PACRA certificate required</li>
                    <li>• NRC required</li>
                    <li>• Full business verification</li>
                  </ul>
                </button>

                <button
                  onClick={() => setBusinessType('independent_seller')}
                  className={`p-6 rounded-xl border-2 text-left transition-all ${businessType === 'independent_seller'
                    ? 'border-kithly-primary bg-kithly-light'
                    : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <div className="text-4xl mb-4">👤</div>
                  <h3 className="text-xl font-bold text-kithly-dark">Independent Seller</h3>
                  <p className="text-gray-600 text-sm mt-2">
                    I'm an individual selling products or services
                  </p>
                  <ul className="text-xs text-gray-500 mt-4 space-y-1">
                    <li>• NRC required</li>
                    <li>• Personal verification</li>
                    <li>• Simplified process</li>
                  </ul>
                </button>
              </div>
            </div>
          )}

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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-kithly-primary focus:outline-none"
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-kithly-primary focus:outline-none"
                  >
                    <option value="">Select a category</option>
                    <option value="Groceries">Groceries</option>
                    <option value="Restaurant">Restaurant & Food</option>
                    <option value="Gifts">Gifts & Crafts</option>
                    <option value="Fashion">Fashion & Clothing</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Services">Services</option>
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-kithly-primary focus:outline-none"
                    placeholder="Describe your shop, what you sell, and what makes you unique..."
                  />
                  <p className="text-xs text-gray-500 mt-1">{step1Data.description.length} / 20 characters</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
              <h2 className="text-3xl font-bold text-kithly-dark mb-2">Where are you located?</h2>
              <p className="text-gray-600 mb-8">Help customers find and reach you</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address *</label>
                  <input
                    type="text"
                    value={step2Data.address}
                    onChange={(e) => setStep2Data({ ...step2Data, address: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-kithly-primary focus:outline-none"
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                    <input
                      type="text"
                      value={step2Data.city}
                      onChange={(e) => setStep2Data({ ...step2Data, city: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-kithly-primary focus:outline-none"
                      placeholder="Lusaka"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Province *</label>
                    <select
                      value={step2Data.region}
                      onChange={(e) => setStep2Data({ ...step2Data, region: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-kithly-primary focus:outline-none bg-white"
                    >
                      <option value="">Select Province</option>
                      {ZAMBIAN_PROVINCES.map(province => (
                        <option key={province.value} value={province.value}>{province.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={step2Data.phone}
                    onChange={(e) => setStep2Data({ ...step2Data, phone: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-kithly-primary focus:outline-none"
                    placeholder="+260 97X XXX XXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Opening Hours</label>
                  <input
                    type="text"
                    value={step2Data.openingHours}
                    onChange={(e) => setStep2Data({ ...step2Data, openingHours: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-kithly-primary focus:outline-none"
                    placeholder="e.g., 08:00 - 18:00"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Branding */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
              <h2 className="text-3xl font-bold text-kithly-dark mb-2">Brand your shop</h2>
              <p className="text-gray-600 mb-8">Upload images to make your shop stand out</p>

              <div className="space-y-8">
                {/* Profile Picture */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">Profile Picture *</label>
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300">
                      {step3Data.profilePic ? (
                        <img src={step3Data.profilePic} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-3xl">📷</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'profile')}
                        className="hidden"
                        id="profile-upload"
                      />
                      <label
                        htmlFor="profile-upload"
                        className="inline-block px-4 py-2 bg-kithly-primary text-white rounded-lg cursor-pointer hover:bg-kithly-accent transition-colors"
                      >
                        {uploadLoading === 'profile' ? 'Uploading...' : 'Choose File'}
                      </label>
                      <p className="text-xs text-gray-500 mt-2">Square image, min 200x200px</p>
                    </div>
                  </div>
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">Cover Image *</label>
                  <div className="w-full h-48 rounded-xl overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300 relative">
                    {step3Data.coverImg ? (
                      <img src={step3Data.coverImg} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="text-5xl">🖼️</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'cover')}
                      className="hidden"
                      id="cover-upload"
                    />
                    <label
                      htmlFor="cover-upload"
                      className="absolute bottom-4 right-4 px-4 py-2 bg-white/90 text-kithly-dark rounded-lg cursor-pointer hover:bg-white transition-colors shadow"
                    >
                      {uploadLoading === 'cover' ? 'Uploading...' : 'Upload Cover'}
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Recommended: 1200x400px</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Compliance Documents */}
          {currentStep === 4 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
              <h2 className="text-3xl font-bold text-kithly-dark mb-2">Compliance Documents</h2>
              <p className="text-gray-600 mb-8">Upload your verification documents</p>

              <div className="space-y-8">
                {/* NRC Upload */}
                <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-kithly-dark">NRC Document *</h3>
                      <p className="text-sm text-gray-500">National Registration Card (PDF or Image)</p>
                    </div>
                    {step4Data.nrcUrl && (
                      <span className="text-green-500 font-bold">✓ Uploaded</span>
                    )}
                  </div>
                  <div className="mt-4">
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'nrc')}
                      className="hidden"
                      id="nrc-upload"
                    />
                    <label
                      htmlFor="nrc-upload"
                      className="inline-block px-6 py-3 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                      {uploadLoading === 'nrc' ? 'Uploading...' : step4Data.nrcUrl ? 'Replace File' : 'Upload NRC'}
                    </label>
                  </div>
                </div>

                {/* PACRA Upload (only for registered businesses) */}
                {businessType === 'registered_business' && (
                  <div className="p-6 border-2 border-dashed border-gray-300 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-kithly-dark">PACRA Certificate *</h3>
                        <p className="text-sm text-gray-500">Business Registration Certificate</p>
                      </div>
                      {step4Data.pacraUrl && (
                        <span className="text-green-500 font-bold">✓ Uploaded</span>
                      )}
                    </div>
                    <div className="mt-4">
                      <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'pacra')}
                        className="hidden"
                        id="pacra-upload"
                      />
                      <label
                        htmlFor="pacra-upload"
                        className="inline-block px-6 py-3 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors"
                      >
                        {uploadLoading === 'pacra' ? 'Uploading...' : step4Data.pacraUrl ? 'Replace File' : 'Upload PACRA'}
                      </label>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-xl">
                  <p className="text-sm text-blue-700">
                    <strong>Note:</strong> Your documents will be reviewed by our team. This usually takes 1-2 business days.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Products */}
          {currentStep === 5 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
              <h2 className="text-3xl font-bold text-kithly-dark mb-2">Add your products</h2>
              <p className="text-gray-600 mb-8">Add at least one product to get started</p>

              {/* Product Form */}
              <div className="bg-gray-50 p-6 rounded-xl mb-8">
                <h3 className="font-bold text-kithly-dark mb-4">New Product</h3>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Product Image */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Product Image</label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200">
                        {productImagePreview ? (
                          <img src={productImagePreview} alt="Product" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">📷</div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleProductImageUpload(e.target.files[0])}
                        className="hidden"
                        id="product-image-upload"
                      />
                      <label
                        htmlFor="product-image-upload"
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                      >
                        {uploadLoading === 'product' ? 'Uploading...' : 'Choose Image'}
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name *</label>
                    <input
                      type="text"
                      value={newProduct.name}
                      onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-kithly-primary focus:outline-none"
                      placeholder="Product name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price (ZMK) *</label>
                    <input
                      type="number"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-kithly-primary focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category *</label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-kithly-primary focus:outline-none bg-white"
                    >
                      <option value="">Select category</option>
                      <option value="Food">Food</option>
                      <option value="Drinks">Drinks</option>
                      <option value="Clothing">Clothing</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Quantity</label>
                    <input
                      type="number"
                      value={newProduct.stock}
                      onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-kithly-primary focus:outline-none"
                      placeholder="10"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                    <textarea
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-kithly-primary focus:outline-none"
                      placeholder="Brief product description..."
                    />
                  </div>
                </div>

                <Button
                  onClick={handleAddProduct}
                  disabled={addingProduct || !newProduct.name || !newProduct.price || !newProduct.category}
                  className="mt-4 w-full"
                >
                  {addingProduct ? 'Adding...' : '+ Add Product'}
                </Button>
              </div>

              {/* Added Products List */}
              {products.length > 0 && (
                <div>
                  <h3 className="font-bold text-kithly-dark mb-4">Your Products ({products.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {products.map((product) => (
                      <div key={product.id} className="bg-gray-50 rounded-lg p-3">
                        <img
                          src={product.image || 'https://via.placeholder.com/100'}
                          alt={product.name}
                          className="w-full h-24 object-cover rounded-lg mb-2"
                        />
                        <p className="font-semibold text-sm truncate">{product.name}</p>
                        <p className="text-kithly-primary font-bold">ZMK {product.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 6: Payment */}
          {currentStep === 6 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in">
              <h2 className="text-3xl font-bold text-kithly-dark mb-2">Payment Setup</h2>
              <p className="text-gray-600 mb-8">Set up how you'll receive payments</p>

              <div className="space-y-8">
                {/* Bank Details */}
                <div>
                  <h3 className="font-bold text-kithly-dark mb-4">Bank Account</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Bank Name</label>
                      <select
                        value={step6Data.bankName}
                        onChange={(e) => setStep6Data({ ...step6Data, bankName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-kithly-primary focus:outline-none bg-white"
                      >
                        <option value="">Select Bank</option>
                        {ZAMBIAN_BANKS.map(bank => (
                          <option key={bank.value} value={bank.value}>{bank.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Account Name</label>
                      <input
                        type="text"
                        value={step6Data.accountName}
                        onChange={(e) => setStep6Data({ ...step6Data, accountName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-kithly-primary focus:outline-none"
                        placeholder="Account holder name"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Account Number</label>
                      <input
                        type="text"
                        value={step6Data.accountNumber}
                        onChange={(e) => setStep6Data({ ...step6Data, accountNumber: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-kithly-primary focus:outline-none"
                        placeholder="Your bank account number"
                      />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-gray-500 text-sm">OR</span>
                  </div>
                </div>

                {/* Mobile Money */}
                <div>
                  <h3 className="font-bold text-kithly-dark mb-4">Mobile Money</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Provider</label>
                      <select
                        value={step6Data.mobileMoneyProvider}
                        onChange={(e) => setStep6Data({ ...step6Data, mobileMoneyProvider: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-kithly-primary focus:outline-none bg-white"
                      >
                        <option value="">Select Provider</option>
                        <option value="MTN">MTN Mobile Money</option>
                        <option value="Airtel">Airtel Money</option>
                        <option value="Zamtel">Zamtel Kwacha</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                      <input
                        type="tel"
                        value={step6Data.mobileMoneyNumber}
                        onChange={(e) => setStep6Data({ ...step6Data, mobileMoneyNumber: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-kithly-primary focus:outline-none"
                        placeholder="+260 97X XXX XXX"
                      />
                    </div>
                  </div>
                </div>

                {/* Tax Info */}
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="font-bold text-kithly-dark mb-4">Tax Information (Optional)</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">TPIN</label>
                      <input
                        type="text"
                        value={step6Data.tpin}
                        onChange={(e) => setStep6Data({ ...step6Data, tpin: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-kithly-primary focus:outline-none bg-white"
                        placeholder="10-digit TPIN"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Tax Category</label>
                      <select
                        value={step6Data.taxCategory}
                        onChange={(e) => setStep6Data({ ...step6Data, taxCategory: e.target.value as any })}
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:border-kithly-primary focus:outline-none bg-white"
                      >
                        <option value="NONE">Not Registered</option>
                        <option value="TOT">Turnover Tax (4%)</option>
                        <option value="VAT">VAT Registered (16%)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            {currentStep > 0 ? (
              <Button variant="secondary" onClick={handleBack}>
                ← Back
              </Button>
            ) : (
              <div></div>
            )}

            {currentStep < 6 ? (
              <Button onClick={handleNext} disabled={saving}>
                {saving ? 'Saving...' : 'Next →'}
              </Button>
            ) : (
              <Button onClick={handleGoLive} disabled={saving} className="bg-green-600 hover:bg-green-700">
                {saving ? 'Processing...' : '🚀 Go Live!'}
              </Button>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default ShopOnboarding;
