import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { UseSoonView } from './components/UseSoonView';
import { AddProductModal } from './components/AddProductModal';
import { DatabaseViewerModal } from './components/DatabaseViewerModal';
import { ProductDetailModal } from './components/ProductDetailModal';
import { NotificationsModal } from './components/NotificationsModal';
import { SettingsModal } from './components/SettingsModal';
import { EditProductModal } from './components/EditProductModal';
import { Product, NotificationItem } from './types';
import { WifiOff } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'products' | 'usesoon' | 'settings'>('dashboard');
  const [products, setProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDatabaseOpen, setIsDatabaseOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Dark Mode Theme (Section 66)
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('expirybox_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('expirybox_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('expirybox_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  // Online / Offline Detection (Section 72)
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Fetch Products & Notifications with retry logic
  const loadData = useCallback(async (retries = 3) => {
    try {
      const [prodRes, notifRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/notifications'),
      ]);

      if (prodRes.ok) {
        const prodData = await prodRes.json();
        setProducts(prodData.products || []);
      }

      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData.notifications || []);
        setUnreadCount(notifData.unreadCount || 0);
      }
      setLoading(false);
    } catch (err) {
      if (retries > 0) {
        setTimeout(() => loadData(retries - 1), 1200);
      } else {
        console.warn('ExpiryBox API connection recovering...');
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    loadData();
    // Poll every 30 seconds for reminder changes
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Product Actions
  const handleSaveProduct = async (productData: any) => {
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    });
    if (res.ok) {
      await loadData();
    }
  };

  const handleUpdateProduct = async (id: string, updatedData: Partial<Product>) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData),
    });
    if (res.ok) {
      await loadData();
      if (selectedProduct && selectedProduct.id === id) {
        setSelectedProduct((prev) => (prev ? { ...prev, ...updatedData } : null));
      }
    }
  };

  const handleUpdateStatus = async (id: string, status: Product['status']) => {
    const res = await fetch(`/api/products/${id}/status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      await loadData();
      if (selectedProduct && selectedProduct.id === id) {
        setSelectedProduct((prev) => (prev ? { ...prev, status } : null));
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) {
      await loadData();
      if (selectedProduct && selectedProduct.id === id) {
        setSelectedProduct(null);
      }
    }
  };

  const handleResetSeed = async () => {
    try {
      await fetch('/api/seed/reset', { method: 'POST' });
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  // Notification Actions
  const handleMarkAsRead = async (id: string) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllAsRead = async () => {
    await fetch('/api/notifications/read-all', { method: 'POST' });
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  const handleRequestBrowserNotifications = () => {
    if ('Notification' in window) {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          new Notification('ExpiryBox Reminders Enabled', {
            body: 'You will receive 5-day expiry alerts directly on your device.',
            icon: '/favicon.ico',
          });
        }
      });
    }
  };

  // Count expiring soon (within 5 days) for badges
  const expiringCount = products.filter(
    (p) =>
      p.status !== 'CONSUMED' &&
      p.status !== 'DISCARDED' &&
      p.daysUntilExpiry >= 0 &&
      p.daysUntilExpiry <= 5
  ).length;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors">
      {/* Offline Banner (Section 72) */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs font-semibold px-4 py-2 flex items-center justify-center space-x-2">
          <WifiOff className="w-4 h-4" />
          <span>You are currently offline. Viewing cached products.</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={(view) => {
          if (view === 'settings') {
            setIsSettingsOpen(true);
          } else {
            setCurrentView(view);
          }
        }}
        onOpenAdd={() => setIsAddOpen(true)}
        onOpenDatabase={() => setIsDatabaseOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadCount={unreadCount}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onResetSeed={handleResetSeed}
        expiringCount={expiringCount}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20 md:pb-12">
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Loading your freshness tracker...
            </p>
          </div>
        ) : (
          <div className="w-full">
            {currentView === 'dashboard' && (
              <div key="dashboard-view">
                <DashboardView
                  products={products}
                  onOpenAdd={() => setIsAddOpen(true)}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  onUpdateStatus={handleUpdateStatus}
                  onViewAllProducts={() => setCurrentView('products')}
                  onViewUseSoon={() => setCurrentView('usesoon')}
                />
              </div>
            )}

            {currentView === 'products' && (
              <div key="products-view">
                <ProductsView
                  products={products}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  onOpenAdd={() => setIsAddOpen(true)}
                  onUpdateStatus={handleUpdateStatus}
                />
              </div>
            )}

            {currentView === 'usesoon' && (
              <div key="usesoon-view">
                <UseSoonView
                  products={products}
                  onSelectProduct={(p) => setSelectedProduct(p)}
                  onUpdateStatus={handleUpdateStatus}
                  onOpenAdd={() => setIsAddOpen(true)}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation (Section 49) */}
      <BottomNav
        currentView={currentView}
        setCurrentView={(view) => {
          if (view === 'settings') {
            setIsSettingsOpen(true);
          } else {
            setCurrentView(view);
          }
        }}
        onOpenAdd={() => setIsAddOpen(true)}
        expiringCount={expiringCount}
      />

      {/* Modals */}
      <AddProductModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSaveProduct={handleSaveProduct}
      />

      <DatabaseViewerModal
        isOpen={isDatabaseOpen}
        onClose={() => setIsDatabaseOpen(false)}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onUpdateStatus={handleUpdateStatus}
        onDeleteProduct={handleDeleteProduct}
        onEditProduct={(prod) => setEditingProduct(prod)}
      />

      <EditProductModal
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onUpdateProduct={handleUpdateProduct}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
        onRequestBrowserNotifications={handleRequestBrowserNotifications}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onResetSeed={handleResetSeed}
      />
    </div>
  );
}
