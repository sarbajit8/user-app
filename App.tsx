import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';

import BottomTabNavigator from './src/navigation/BottomTabNavigator';
import AuthNavigator from './src/navigation/AuthNavigator';
import CheckoutScreen from './src/screens/checkout/CheckoutScreen';
import OrdersScreen from './src/screens/orders/OrdersScreen';
import OrderDetailScreen from './src/screens/orders/OrderDetailScreen';
import WishlistScreen from './src/screens/wishlist/WishlistScreen';
import ProductDetailScreen from './src/screens/product/ProductDetailScreen';
import ProductListScreen from './src/screens/product/ProductListScreen';
import ShopBySellerScreen from './src/screens/home/ShopBySellerScreen';
import VendorStoreScreen from './src/screens/home/VendorStoreScreen';
import WalletPaymentsScreen from './src/screens/profile/WalletPaymentsScreen';
import AddressManageScreen from './src/screens/profile/AddressManageScreen';
import SettingsScreen from './src/screens/profile/SettingsScreen';
import HelpSupportScreen from './src/screens/profile/HelpSupportScreen';
import SearchScreen from './src/screens/search/SearchScreen';
import OnboardingScreen from './src/screens/auth/OnboardingScreen';
import WelcomeStartingScreen from './src/screens/auth/WelcomeStartingScreen';
import { Platform } from 'react-native';
import { useAuthStore } from './src/store/authStore';

// Remove default browser focus outlines and black borders on web
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const styleId = 'rn-web-outline-reset';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      input, textarea, select {
        outline: none !important;
        outline-style: none !important;
        box-shadow: none !important;
      }
      input:focus, textarea:focus, select:focus {
        outline: none !important;
        outline-style: none !important;
        box-shadow: none !important;
      }
      [data-focusable="true"]:focus {
        outline: none !important;
      }
    `;
    document.head.appendChild(style);
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 5 * 60 * 1000, retry: 1 },
  },
});

const RootStack = createStackNavigator();

function RootNavigator() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <RootStack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={isAuthenticated ? 'Main' : 'StartingPage'}
    >
      {/* Luxury Starting Page for unregistered users */}
      <RootStack.Screen name="StartingPage" component={WelcomeStartingScreen} />
      <RootStack.Screen name="Main" component={BottomTabNavigator} />
      <RootStack.Screen name="Auth" component={AuthNavigator} />
      <RootStack.Screen name="Checkout" component={CheckoutScreen} />
      <RootStack.Screen name="Orders" component={OrdersScreen} />
      <RootStack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <RootStack.Screen name="Wishlist" component={WishlistScreen} />
      <RootStack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <RootStack.Screen name="ProductList" component={ProductListScreen} />
      <RootStack.Screen name="Search" component={SearchScreen} />
      <RootStack.Screen name="ShopBySeller" component={ShopBySellerScreen} />
      <RootStack.Screen name="VendorStore" component={VendorStoreScreen} />
      <RootStack.Screen name="WalletPayments" component={WalletPaymentsScreen} />
      <RootStack.Screen name="AddressManage" component={AddressManageScreen} />
      <RootStack.Screen name="Settings" component={SettingsScreen} />
      <RootStack.Screen name="HelpSupport" component={HelpSupportScreen} />
      <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
    </RootStack.Navigator>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <RootNavigator />
      </NavigationContainer>
    </QueryClientProvider>
  );
}
