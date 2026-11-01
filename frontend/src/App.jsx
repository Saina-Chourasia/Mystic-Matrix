import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { api } from './services/api';
import { sound } from './utils/audioSynth';

// Layout Components
import TopNavbar from './components/TopNavbar';
import AdminSidebar from './components/AdminSidebar';
import CustomerNavbar from './components/CustomerNavbar';
import ParticleCanvas from './components/ParticleCanvas';
import CounterSaleModal from './components/CounterSaleModal';

// Shared & Public Pages
import WelcomePage from './pages/WelcomePage';
import LoginPage from './pages/LoginPage';

// Admin Sanctum Pages
import DashboardPage from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import ForecastingPage from './pages/ForecastingPage';
import DetectPage from './pages/DetectPage';
import RecommendationsPage from './pages/RecommendationsPage';
import SalesAnalyticsPage from './pages/SalesAnalyticsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminSuppliersPage from './pages/admin/AdminSuppliersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminSecurityPage from './pages/admin/AdminSecurityPage';
import AdminDatasetsPage from './pages/admin/AdminDatasetsPage';

// Customer Portal Pages
import UserDashboardPage from './pages/customer/UserDashboardPage';
import UserShopPage from './pages/customer/UserShopPage';
import UserCartPage from './pages/customer/UserCartPage';
import UserOrdersPage from './pages/customer/UserOrdersPage';
import UserProfilePage from './pages/customer/UserProfilePage';

// AI Inventory Agent Components
import AINotificationsCenter from './components/AINotificationsCenter';
import AskMysticAIChat from './components/AskMysticAIChat';
import AIActionApprovalsModal from './components/AIActionApprovalsModal';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { useClerkAuth, AuthenticateWithRedirectCallback } from './context/ClerkAuthContext';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style as StatusBarStyle } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

export default function App() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialTheme = urlParams.get('theme') || localStorage.getItem('hexventory_theme') || 'night';
  const requestedTab = urlParams.get('tab') || 'welcome';

  // Clerk Auth Hook Integration
  const { isClerkConfigured, isSignedIn: isClerkSignedIn, clerkUser, getToken, signOutFromClerk } = useClerkAuth();

  // Authentication State
  const [auth, setAuth] = useState({
    checked: false,
    authenticated: false,
    user: null
  });

  const [activeTab, setActiveTab] = useState(requestedTab);
  const [cartCount, setCartCount] = useState(0);
  const [halloweenMultiplier, setHalloweenMultiplier] = useState(1.0);
  const [salesTimeframe, setSalesTimeframe] = useState(30);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Network Connectivity & Offline Leylines State
  const [isOffline, setIsOffline] = useState(typeof window !== 'undefined' ? !navigator.onLine : false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      showToast('Leylines restored — Connected to Madam Hex\'s Sanctum', 'success');
      api.getHealth().catch(() => {});
    };
    const handleOffline = () => {
      setIsOffline(true);
      showToast('The Leylines are silent — Network connection lost', 'error');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetryConnection = async () => {
    setIsReconnecting(true);
    try {
      await api.getHealth();
      setIsOffline(false);
      showToast('Leylines reconnected successfully!', 'success');
      if (auth.authenticated && auth.user?.role === 'ADMIN') {
        loadProtectedData();
      }
    } catch (err) {
      setIsOffline(true);
      showToast('Leylines are still silent. Please verify server connectivity.', 'error');
    } finally {
      setIsReconnecting(false);
    }
  };

  // AI Inventory Agent (Mystic AI Oracle) State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAiChatOpen, setIsAiChatOpen] = useState(false);
  const [isActionApprovalsOpen, setIsActionApprovalsOpen] = useState(false);
  const [initialOraclePrompt, setInitialOraclePrompt] = useState('');
  const [aiStats, setAiStats] = useState({ total: 0, unread: 0, critical: 0, warning: 0, info: 0 });

  const fetchAiStats = async () => {
    try {
      const res = await api.getAiStats();
      if (res.success && res.stats) {
        setAiStats(res.stats);
      }
    } catch (err) {
      // Non-fatal if unauthenticated or offline
    }
  };

  const handleConsultOracle = (prompt) => {
    setInitialOraclePrompt(prompt || '');
    setIsAiChatOpen(true);
  };

  const handleActionExecuted = async (action) => {
    showToast(`Level 3 Action executed: ${action?.title || 'Restock Order created'}!`, 'success');
    fetchAiStats();
    // Refresh admin data
    loadProtectedData();
  };

  // Day / Night Theme Management
  const [theme, setTheme] = useState(initialTheme);

  useEffect(() => {
    localStorage.setItem('hexventory_theme', theme);
    document.body.className = theme === 'day' ? 'theme-day' : 'theme-night';

    // Synchronize native Android Status Bar with Day/Night Mode
    if (Capacitor.isNativePlatform()) {
      try {
        if (theme === 'day') {
          StatusBar.setStyle({ style: StatusBarStyle.Light });
          StatusBar.setBackgroundColor({ color: '#f8f4eb' });
        } else {
          StatusBar.setStyle({ style: StatusBarStyle.Dark });
          StatusBar.setBackgroundColor({ color: '#0b0416' });
        }
      } catch (e) {
        // Non-fatal on web or mock
      }
    }
  }, [theme]);

  // Core Protected Data State (Admin view)
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [forecasts, setForecasts] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [salesData, setSalesData] = useState(null);

  // Notification Toast State
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // 1. Initial Session Verification on App Mount
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await api.getMe();
        if (res.authenticated && res.user) {
          setAuth({ checked: true, authenticated: true, user: res.user });

          let initialTab = requestedTab;
          if (requestedTab === 'welcome') {
            initialTab = 'welcome';
          } else if (requestedTab === 'login') {
            initialTab = res.user.role === 'ADMIN' ? 'overview' : 'user_dashboard';
          } else {
            const adminTabs = ['overview', 'dashboard', 'inventory', 'forecast', 'detect', 'restock', 'analytics', 'orders', 'suppliers', 'users', 'security', 'datasets'];
            if (adminTabs.includes(requestedTab) && res.user.role !== 'ADMIN') {
              initialTab = 'user_dashboard';
            } else {
              initialTab = requestedTab;
            }
          }
          setActiveTab(initialTab);
          const initialUrl = initialTab === 'welcome' ? '/' : `/?tab=${initialTab}`;
          window.history.replaceState({ tab: initialTab }, '', initialUrl);
        } else {
          setAuth({ checked: true, authenticated: false, user: null });
          if (requestedTab !== 'welcome') {
            setActiveTab('login');
            window.history.replaceState({ tab: 'login' }, '', '/?tab=login');
          } else {
            setActiveTab('welcome');
            window.history.replaceState({ tab: 'welcome' }, '', '/');
          }
        }
      } catch (err) {
        console.error('Session check failed:', err);
        setAuth({ checked: true, authenticated: false, user: null });
        if (requestedTab !== 'welcome') {
          setActiveTab('login');
        }
      }
    }
    checkSession();
  }, []);

  // 1b. Seamless Browser Back & Forward Navigation Listener (popstate)
  useEffect(() => {
    const handlePopState = (event) => {
      setIsSaleModalOpen(false);
      setToast(null);

      const params = new URLSearchParams(window.location.search);
      const poppedTab = event.state?.tab || params.get('tab') || 'welcome';
      const dest = poppedTab === 'dashboard' ? 'overview' : poppedTab;

      if (dest === 'welcome') {
        setActiveTab('welcome');
        return;
      }

      if (!auth.authenticated) {
        setActiveTab('login');
        return;
      }

      const adminTabs = ['overview', 'dashboard', 'inventory', 'forecast', 'detect', 'restock', 'analytics', 'orders', 'suppliers', 'users', 'security', 'datasets'];
      if (adminTabs.includes(dest) && auth.user?.role !== 'ADMIN') {
        setActiveTab('user_dashboard');
        return;
      }

      if (dest === 'login') {
        setActiveTab(auth.user?.role === 'ADMIN' ? 'overview' : 'user_dashboard');
        return;
      }

      setActiveTab(dest);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [auth.authenticated, auth.user?.role]);

  // 1c. Android Native Hardware Back Button & Deep Link Handler
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    // Auto-hide native splash screen once initial auth check completes
    if (auth.checked) {
      SplashScreen.hide().catch(() => {});
    }

    // Android hardware back button handling
    const backHandler = CapApp.addListener('backButton', ({ canGoBack }) => {
      // Priority 1: Close active drawers and modals
      if (isSaleModalOpen) {
        setIsSaleModalOpen(false);
        return;
      }
      if (isAiChatOpen) {
        setIsAiChatOpen(false);
        return;
      }
      if (isNotificationsOpen) {
        setIsNotificationsOpen(false);
        return;
      }
      if (isActionApprovalsOpen) {
        setIsActionApprovalsOpen(false);
        return;
      }
      if (mobileSidebarOpen) {
        setMobileSidebarOpen(false);
        return;
      }

      // Priority 2: Navigate back from subpages to portal dashboard
      const rootTab = auth.authenticated
        ? (auth.user?.role === 'ADMIN' ? 'overview' : 'user_dashboard')
        : 'welcome';

      if (activeTab !== rootTab && activeTab !== 'welcome') {
        setActiveTab(rootTab);
        window.history.pushState({ tab: rootTab }, '', `/?tab=${rootTab}`);
        return;
      }

      // Priority 3: Minimize application if already on root screen
      CapApp.minimizeApp();
    });

    // Deep link callback handler (e.g., mysticmatrix://sso-callback)
    const urlHandler = CapApp.addListener('appUrlOpen', async (data) => {
      try {
        if (data && data.url) {
          const parsed = new URL(data.url);
          const tabParam = parsed.searchParams.get('tab');
          if (tabParam) {
            setActiveTab(tabParam);
            window.history.pushState({ tab: tabParam }, '', `/?tab=${tabParam}`);
          }
        }
      } catch (err) {
        console.warn('Deep link handling warning:', err);
      }
    });

    return () => {
      backHandler.then(h => h.remove()).catch(() => {});
      urlHandler.then(h => h.remove()).catch(() => {});
    };
  }, [
    auth.checked,
    auth.authenticated,
    auth.user?.role,
    activeTab,
    isSaleModalOpen,
    isAiChatOpen,
    isNotificationsOpen,
    isActionApprovalsOpen,
    mobileSidebarOpen
  ]);

  // 2. Fetch Cart Count when Authenticated
  const loadCartCount = useCallback(async () => {
    if (!auth.authenticated) return;
    try {
      const res = await api.getCart();
      if (res.success && res.data) {
        setCartCount(res.data.total_items || 0);
      }
    } catch (e) {
      // Non-blocking
    }
  }, [auth.authenticated]);

  useEffect(() => {
    if (auth.authenticated) {
      loadCartCount();
    }
  }, [auth.authenticated, loadCartCount]);

  // 3. Fetch Protected Apothecary Admin Data (when Admin)
  const loadAdminData = useCallback(async () => {
    if (!auth.authenticated || auth.user?.role !== 'ADMIN') return;
    try {
      setLoading(true);
      const [
        productsRes,
        categoriesRes,
        suppliersRes,
        forecastsRes,
        recsRes,
        dashRes,
        salesRes
      ] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
        api.getSuppliers(),
        api.getForecasts({ halloweenMultiplier }),
        api.getRecommendations({ halloweenMultiplier }),
        api.getDashboardMetrics({ halloweenMultiplier }),
        api.getSalesAnalytics(salesTimeframe)
      ]);

      if (productsRes.success) setProducts(productsRes.data);
      if (categoriesRes.success) setCategories(categoriesRes.data);
      if (suppliersRes.success) setSuppliers(suppliersRes.data);
      if (forecastsRes.success) setForecasts(forecastsRes.data);
      if (recsRes.success) setRecommendations(recsRes.data);
      if (dashRes.success) setDashboardData(dashRes.data);
      if (salesRes.success) setSalesData(salesRes.data);

      // Refresh AI Notification Stats
      fetchAiStats();
    } catch (err) {
      console.error('Error fetching admin data:', err);
      if (err.status === 401) {
        setAuth({ checked: true, authenticated: false, user: null });
        setActiveTab('login');
        window.history.replaceState({ tab: 'login' }, '', '/?tab=login');
      }
    } finally {
      setLoading(false);
    }
  }, [auth.authenticated, auth.user?.role, halloweenMultiplier, salesTimeframe]);

  // Handle Sales Timeframe Toggle
  const handleTimeframeChange = async (days) => {
    setSalesTimeframe(days);
    try {
      const res = await api.getSalesAnalytics(days);
      if (res.success) setSalesData(res.data);
    } catch (err) {
      console.error('Failed to update sales analytics:', err);
    }
  };

  useEffect(() => {
    if (auth.authenticated && auth.user?.role === 'ADMIN') {
      loadAdminData();
    }
  }, [auth.authenticated, auth.user?.role, loadAdminData]);

  // Handle Login Success (from LoginPage or Clerk Sync)
  const handleLoginSuccess = (user) => {
    setAuth({ checked: true, authenticated: true, user });
    showToast(`Welcome to Madam Hex's grimoire, ${user.name}!`, 'success');

    // Role-based redirect with history push
    const dest = user.role === 'ADMIN' ? 'overview' : 'user_dashboard';
    setActiveTab(dest);
    window.history.pushState({ tab: dest }, '', `/?tab=${dest}`);
  };

  // Clerk Authentication Synchronization Effect
  useEffect(() => {
    if (isClerkConfigured && isClerkSignedIn && clerkUser && !auth.authenticated) {
      async function syncClerkSession() {
        try {
          const token = await getToken();
          const email = clerkUser.primaryEmailAddress?.emailAddress || clerkUser.emailAddresses?.[0]?.emailAddress;
          const name = clerkUser.fullName || `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || email.split('@')[0];
          const avatarUrl = clerkUser.imageUrl;

          const res = await api.syncClerkUser({
            clerkId: clerkUser.id,
            email,
            name,
            avatarUrl,
            token
          });

          if (res.success && res.user) {
            handleLoginSuccess(res.user);
          } else if (res.message) {
            showToast(res.message, 'error');
          }
        } catch (err) {
          console.error('Clerk backend synchronization error:', err);
          showToast(err.message || 'Clerk synchronization failed.', 'error');
        }
      }
      syncClerkSession();
    }
  }, [isClerkConfigured, isClerkSignedIn, clerkUser, auth.authenticated]);

  // Handle Logout (Dual Session & Clerk Cleanup)
  const handleLogout = async () => {
    try {
      await api.logout();
      if (isClerkConfigured && isClerkSignedIn) {
        await signOutFromClerk();
      }
      setAuth({ checked: true, authenticated: false, user: null });
      setProducts([]);
      setDashboardData(null);
      setCartCount(0);
      setIsSaleModalOpen(false);
      showToast("Departed Madam Hex's apothecary.", 'info');
      setActiveTab('login');
      window.history.replaceState({ tab: 'login' }, '', '/?tab=login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Navigation Guard with RBAC Protection & Full History Synchronization
  const handleNavigate = (targetTab, { replace = false } = {}) => {
    const dest = targetTab === 'dashboard' ? 'overview' : targetTab;
    let finalTab = dest;

    if (dest === 'welcome') {
      finalTab = 'welcome';
    } else if (!auth.authenticated) {
      finalTab = 'login';
    } else {
      // Role Guard: Users cannot access admin-only tabs
      const adminTabs = ['overview', 'inventory', 'forecast', 'detect', 'restock', 'analytics', 'orders', 'suppliers', 'users', 'security', 'datasets'];
      if (adminTabs.includes(dest) && auth.user?.role !== 'ADMIN') {
        showToast('Access Denied: Administrator privileges required to access private sanctum.', 'error');
        finalTab = 'user_dashboard';
      } else {
        finalTab = dest;
      }
    }

    setActiveTab(finalTab);
    setIsSaleModalOpen(false);

    const targetUrl = finalTab === 'welcome' ? '/' : `/?tab=${finalTab}`;
    const currentUrl = window.location.pathname + window.location.search;

    if (replace || currentUrl === targetUrl) {
      window.history.replaceState({ tab: finalTab }, '', targetUrl);
    } else {
      window.history.pushState({ tab: finalTab }, '', targetUrl);
    }
  };

  // Customer Add to Cart Handler
  const handleAddToCart = async (product, quantity = 1) => {
    try {
      const res = await api.addToCart(product.id, quantity);
      if (res.success) {
        sound.playSparkle();
        setCartCount(res.data.total_items || 0);
        showToast(`Added ${quantity}x ${product.name} to your satchel!`, 'success');
        confetti({ particleCount: 30, spread: 50 });
      }
    } catch (err) {
      showToast(err.message || 'Could not place item into satchel', 'error');
    }
  };

  // Customer Order Placed Handler
  const handleOrderCompleted = (order) => {
    setCartCount(0);
    // Refresh authoritative inventory if admin is also viewing
    if (auth.user?.role === 'ADMIN') {
      loadAdminData();
    }
  };

  // Handle Add Product (Admin)
  const handleAddProduct = async (formData) => {
    try {
      const res = await api.createProduct(formData);
      if (res.success) {
        sound.playSparkle();
        showToast(`Cataloged ${formData.name} in Madam Hex's grimoire!`, 'success');
        confetti({ particleCount: 40, spread: 50 });
        loadAdminData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Update Product (Admin)
  const handleUpdateProduct = async (id, formData) => {
    try {
      const res = await api.updateProduct(id, formData);
      if (res.success) {
        sound.playSparkle();
        showToast(`Updated alchemy properties for ${res.data.name}`, 'success');
        loadAdminData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Delete Product (Admin)
  const handleDeleteProduct = async (id) => {
    try {
      const res = await api.deleteProduct(id);
      if (res.success) {
        sound.playWarningHex();
        showToast('Item banished from apothecary inventory', 'info');
        loadAdminData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Quick Stock Adjustment (Admin)
  const handleAdjustStock = async (id, delta, type, reason) => {
    try {
      const res = await api.adjustStock(id, { adjustment: delta, type, reason });
      if (res.success) {
        sound.playSparkle();
        showToast(res.message, 'success');
        loadAdminData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Reorder/Restock Item (Admin)
  const handleRestockItem = async (productId, quantity = 25, reason = 'Restock replenishment') => {
    try {
      const res = await api.applyRestock(productId, {
        quantity: quantity,
        reorder_quantity: quantity,
        reason: reason,
        notes: reason,
        supplier_id: 1
      });
      if (res.success) {
        sound.playSparkle();
        showToast(res.message || `Replenished +${quantity} units! Shelf stock updated.`, 'success');
        confetti({ particleCount: 50, spread: 60 });
        loadAdminData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Handle Record Counter Sale (Admin)
  const handleRecordSale = async (salePayload) => {
    try {
      const res = await api.recordSale(salePayload);
      if (res.success) {
        sound.playCoinClink();
        const itemName = res.data?.product_name || 'Item';
        const totalGold = res.data?.total_price || res.data?.sale?.total_amount || 0;
        showToast(`Sold ${salePayload.quantity}x ${itemName} for ${totalGold} Gold!`, 'success');
        confetti({ particleCount: 30, spread: 45 });
        loadAdminData();
        return res;
      }
    } catch (err) {
      showToast(err.message, 'error');
      throw err;
    }
  };

  // View Category Checks
  const isCustomerTab = ['user_dashboard', 'user_shop', 'user_cart', 'user_orders', 'user_profile'].includes(activeTab);
  const isAdminTab = ['overview', 'dashboard', 'inventory', 'forecast', 'detect', 'restock', 'analytics', 'orders', 'suppliers', 'users', 'security', 'datasets'].includes(activeTab);

  return (
    <div className="relative min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans transition-colors duration-300">

      {/* Background Particles */}
      <ParticleCanvas />

      {/* Notification Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className={`pixel-card px-4 py-3 shadow-2xl flex items-center gap-3 text-xs font-serif font-bold ${toast.type === 'error' ? 'border-[var(--color-crimson)] text-[var(--color-crimson)]' :
              toast.type === 'success' ? 'border-[var(--color-emerald)] text-[var(--color-emerald)]' :
                'border-[var(--color-gold)] text-[var(--color-gold)]'
            }`}>
            <span className="w-2 h-2 rounded-full bg-[var(--color-gold)] animate-ping" />
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Offline Leylines Notice Banner */}
      {isOffline && (
        <div className="sticky top-0 z-50 bg-[#1e0e2e]/95 border-b-2 border-[#e67e22] text-[#f8f4eb] px-4 py-2.5 shadow-xl backdrop-blur-sm">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-serif">
            <div className="flex items-center gap-2">
              <span className="text-base animate-pulse">⚡</span>
              <span className="font-bold text-[#f39c12]">The Leylines are Silent</span>
              <span className="text-[#a090b8]">— Cannot connect to Madam Hex's Sanctum (Viewing cached inventory)</span>
            </div>
            <button
              onClick={handleRetryConnection}
              disabled={isReconnecting}
              className="pixel-btn text-[10px] px-3 py-1 bg-[#8e44ad] hover:bg-[#9b59b6] text-white font-bold transition-all flex items-center gap-1.5"
            >
              {isReconnecting ? (
                <>
                  <span className="animate-spin text-xs">⏳</span>
                  <span>Chanting...</span>
                </>
              ) : (
                <>
                  <span>🔄</span>
                  <span>Reconnect Leylines</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          1. PUBLIC LANDING PAGE
          ══════════════════════════════════════════════════════════ */}
      {activeTab === 'welcome' && (
        <WelcomePage
          onGetStarted={() => {
            if (auth.authenticated) {
              handleNavigate(auth.user?.role === 'ADMIN' ? 'overview' : 'user_dashboard');
            } else {
              handleNavigate('login');
            }
          }}
          onNavigate={(tab) => handleNavigate(tab)}
          theme={theme}
          setTheme={setTheme}
          onOpenSaleModal={() => {
            if (auth.authenticated && auth.user?.role === 'ADMIN') setIsSaleModalOpen(true);
            else handleNavigate('login');
          }}
        />
      )}

      {/* ══════════════════════════════════════════════════════════
          2. DUAL-PORTAL LOGIN / REGISTER / RECOVERY PAGE
          ══════════════════════════════════════════════════════════ */}
      {activeTab === 'login' && (
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          onBackToHome={() => handleNavigate('welcome')}
          theme={theme}
          setTheme={setTheme}
        />
      )}

      {/* ══════════════════════════════════════════════════════════
          2b. CLERK SSO CALLBACK REDIRECT HANDLER
          ══════════════════════════════════════════════════════════ */}
      {activeTab === 'sso-callback' && (
        <div className="flex-1 flex items-center justify-center min-h-[60vh] p-6 text-center">
          <div className="pixel-card p-8 max-w-md w-full space-y-4">
            <Sparkles className="w-8 h-8 mx-auto text-purple-400 animate-spin" />
            <h2 className="font-serif font-bold text-lg text-purple-200">Authenticating with the Grimoire...</h2>
            <p className="text-xs text-[var(--text-muted)] font-serif">Completing Clerk Google authentication handshake</p>
            {isClerkConfigured && (
              <AuthenticateWithRedirectCallback
                signInForceRedirectUrl="/?tab=login"
                signUpForceRedirectUrl="/?tab=login"
              />
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          3. COMPLETE CUSTOMER USER PORTAL
          ══════════════════════════════════════════════════════════ */}
      {isCustomerTab && auth.authenticated && (
        <div className="flex-1 flex flex-col min-h-screen">
          <CustomerNavbar
            activeTab={activeTab}
            onNavigate={handleNavigate}
            theme={theme}
            setTheme={setTheme}
            user={auth.user}
            cartCount={cartCount}
            onLogout={handleLogout}
            onSwitchToAdmin={() => handleNavigate('overview')}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            {activeTab === 'user_dashboard' && (
              <UserDashboardPage
                user={auth.user}
                onNavigate={handleNavigate}
                onAddToCart={handleAddToCart}
              />
            )}

            {activeTab === 'user_shop' && (
              <UserShopPage
                onAddToCart={handleAddToCart}
              />
            )}

            {activeTab === 'user_cart' && (
              <UserCartPage
                onNavigate={handleNavigate}
                onOrderCompleted={handleOrderCompleted}
              />
            )}

            {activeTab === 'user_orders' && (
              <UserOrdersPage
                onNavigate={handleNavigate}
              />
            )}

            {activeTab === 'user_profile' && (
              <UserProfilePage
                user={auth.user}
                onProfileUpdated={(updated) => setAuth(prev => ({ ...prev, user: updated }))}
                onLogout={handleLogout}
              />
            )}
          </main>

          <footer className="border-t border-[var(--border-card)] bg-[var(--bg-card)] py-4 px-6 text-xs text-[var(--text-muted)] font-serif text-center">
            Madam Hex's 8-Bit Apothecary &bull; Hallowmere Nocturnal Market &bull; Customer Portal
          </footer>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          4. PROTECTED ADMIN PORTAL (SANCTUM)
          ══════════════════════════════════════════════════════════ */}
      {isAdminTab && auth.authenticated && auth.user?.role === 'ADMIN' && (
        <div className="flex-1 flex flex-col min-h-screen">

          <TopNavbar
            activeTab={activeTab === 'dashboard' ? 'overview' : activeTab}
            onNavigate={handleNavigate}
            theme={theme}
            setTheme={setTheme}
            user={auth.user}
            onLogout={handleLogout}
            onToggleSidebar={() => setMobileSidebarOpen(prev => !prev)}
            unreadNotificationsCount={aiStats.unread}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
            onOpenOracleChat={() => {
              setInitialOraclePrompt('');
              setIsAiChatOpen(true);
            }}
            onOpenApprovals={() => setIsActionApprovalsOpen(true)}
          />

          <div className="flex-1 flex relative">
            <AdminSidebar
              activeTab={activeTab === 'dashboard' ? 'overview' : activeTab}
              setActiveTab={handleNavigate}
              user={auth.user}
              onLogout={handleLogout}
              theme={theme}
              setTheme={setTheme}
              onOpenSaleModal={() => setIsSaleModalOpen(true)}
              collapsed={sidebarCollapsed}
              setCollapsed={setSidebarCollapsed}
              mobileOpen={mobileSidebarOpen}
              setMobileOpen={setMobileSidebarOpen}
              onOpenOracleChat={() => {
                setInitialOraclePrompt('');
                setIsAiChatOpen(true);
              }}
            />

            <main className={`flex-1 ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'} transition-all duration-300 flex flex-col justify-between min-h-[calc(100vh-60px)]`}>
              <div className="flex-1 p-4 sm:p-6 lg:p-8">

                {/* 1. Overview Dashboard */}
                {(activeTab === 'overview' || activeTab === 'dashboard') && (
                  <DashboardPage
                    dashboardData={dashboardData}
                    salesData={salesData}
                    loading={loading}
                    onNavigate={handleNavigate}
                    onRestockItem={handleRestockItem}
                  />
                )}

                {/* 2. Inventory Management */}
                {activeTab === 'inventory' && (
                  <InventoryPage
                    products={products}
                    categories={categories}
                    suppliers={suppliers}
                    loading={loading}
                    onAddProduct={handleAddProduct}
                    onUpdateProduct={handleUpdateProduct}
                    onDeleteProduct={handleDeleteProduct}
                    onAdjustStock={handleAdjustStock}
                    theme={theme}
                  />
                )}

                {/* 3. Demand Forecasting */}
                {activeTab === 'forecast' && (
                  <ForecastingPage
                    forecasts={forecasts}
                    loading={loading}
                    halloweenMultiplier={halloweenMultiplier}
                    onMultiplierChange={setHalloweenMultiplier}
                    onRestockItem={handleRestockItem}
                  />
                )}

                {/* 4. Smart Anomaly Detection */}
                {activeTab === 'detect' && (
                  <DetectPage
                    products={products}
                    forecasts={forecasts}
                    onRestockItem={handleRestockItem}
                  />
                )}

                {/* 5. Restock Recommendations */}
                {activeTab === 'restock' && (
                  <RecommendationsPage
                    recommendations={recommendations}
                    loading={loading}
                    onApplyRestock={handleRestockItem}
                  />
                )}

                {/* 6. Sales Analytics */}
                {activeTab === 'analytics' && (
                  <SalesAnalyticsPage
                    salesData={salesData}
                    loading={loading}
                    timeframe={salesTimeframe}
                    onTimeframeChange={handleTimeframeChange}
                    onOpenSaleModal={() => setIsSaleModalOpen(true)}
                  />
                )}

                {/* 7. NEW: Store Customer Orders Overview */}
                {activeTab === 'orders' && (
                  <AdminOrdersPage />
                )}

                {/* 8. NEW: Suppliers & Purchase Orders */}
                {activeTab === 'suppliers' && (
                  <AdminSuppliersPage />
                )}

                {/* 9. NEW: User Directory & Role Governance */}
                {activeTab === 'users' && (
                  <AdminUsersPage currentUser={auth.user} />
                )}

                {/* 10. NEW: Security Audit Logs */}
                {activeTab === 'security' && (
                  <AdminSecurityPage />
                )}

                {/* 11. NEW: Dataset Sources & Real UCI Integration */}
                {activeTab === 'datasets' && (
                  <AdminDatasetsPage />
                )}

              </div>

              {/* Admin Footer */}
              <footer className="border-t border-[var(--border-card)] bg-[var(--bg-card)] py-4 px-6 text-xs text-[var(--text-muted)] font-sans">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-[var(--color-purple)]">Mystic Matrix</span>
                    <span>&bull;</span>
                    <span>Madam Hex's Private Sanctuary</span>
                  </div>
                  <div className="text-[11px] font-mono text-[var(--text-muted)]">
                    Authorized Admin: {auth.user?.email || 'madam.hex@gmail.com'}
                  </div>
                </div>
              </footer>

            </main>
          </div>
        </div>
      )}

      {/* Record Counter Customer Sale Modal */}
      <CounterSaleModal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        products={products}
        onRecordSale={handleRecordSale}
      />

      {/* AI Floating Launcher Button (for Admin) */}
      {isAdminTab && auth.authenticated && auth.user?.role === 'ADMIN' && (
        <button
          id="floating-ask-oracle-btn"
          onClick={() => {
            sound.playSparkle();
            setInitialOraclePrompt('');
            setIsAiChatOpen(true);
          }}
          className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.6)] border-2 border-purple-400 flex items-center justify-center group hover:scale-110 active:scale-95 transition-all cursor-pointer"
          title="Consult Mystic AI — The Inventory Oracle"
          aria-label="Ask Mystic AI"
        >
          <Sparkles className="w-6 h-6 animate-pulse group-hover:rotate-12 transition-transform" />
          {aiStats.unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-mono font-bold flex items-center justify-center border-2 border-[var(--bg-card)] shadow-xs animate-bounce-short">
              {aiStats.unread > 9 ? '!' : aiStats.unread}
            </span>
          )}
        </button>
      )}

      {/* AI Notifications Center Modal */}
      <AINotificationsCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onConsultOracle={handleConsultOracle}
        onNavigateProduct={(id) => handleNavigate('inventory')}
      />

      {/* Ask Mystic AI Oracle Conversational Drawer */}
      <AskMysticAIChat
        isOpen={isAiChatOpen}
        onClose={() => setIsAiChatOpen(false)}
        initialPrompt={initialOraclePrompt}
        onActionExecuted={handleActionExecuted}
      />

      {/* Level 3 AI Action Approvals Modal */}
      <AIActionApprovalsModal
        isOpen={isActionApprovalsOpen}
        onClose={() => setIsActionApprovalsOpen(false)}
        onActionExecuted={handleActionExecuted}
      />

    </div>
  );
}
