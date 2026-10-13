import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  Share,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Ionicons,
  Feather,
  MaterialCommunityIcons,
  MaterialIcons,
} from '@expo/vector-icons';
import { ADONIK_THEME, IMAGES } from '../../theme/colors';
import { useCartStore } from '../../store/authStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useReviewStore } from '../../store/reviewStore';
import { findProductById, findProductByName, CatalogProduct, ALL_PRODUCTS_CATALOG } from '../../constants/productsCatalog';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const HERO_CARD_W = SCREEN_W - 32;
const HERO_CARD_H = 430;

// App Theme colors matching ADONIK_THEME
const BOUTIQUE = {
  primary: ADONIK_THEME.primary,           // #D48806 - Warm Amber Gold
  primaryDark: ADONIK_THEME.primaryDark,   // #B45309 - Deep Gold
  primaryLight: ADONIK_THEME.primaryLight, // #FEF3C7 - Soft Warm Cream
  primaryBorder: ADONIK_THEME.primary,     // #D48806
  badgePink: ADONIK_THEME.primaryLight,    // #FEF3C7 - Pill background for 'Save ₹ 600'
  badgePinkText: ADONIK_THEME.primaryDark, // #B45309 - Text for 'Save ₹ 600'
  discountRed: ADONIK_THEME.error,         // #EF4444 - Discount badge '-20%' on hero
  starGold: ADONIK_THEME.warning,          // #F59E0B - Gold stars
  barBackground: '#F3F4F6',                // Progress track
  textDark: ADONIK_THEME.text,             // #18181B - Headings & Product Title
  textSecondary: ADONIK_THEME.textSecondary, // #64748B - Subtext & Descriptions
  textMuted: ADONIK_THEME.textMuted,       // #94A3B8 - Strikethrough & subtle labels
  borderLight: ADONIK_THEME.borderLight,   // #F1F3F5
  surface: ADONIK_THEME.surface,           // #FFFFFF
};

export default function ProductDetailScreen({ navigation, route }: any) {
  const routeProduct = route?.params?.product;
  const routeProductId = route?.params?.productId || routeProduct?.id;

  const [dynamicProduct, setDynamicProduct] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    const loadDynamicProduct = async () => {
      try {
        // 1. Check local storage if product was seeded/edited by Admin
        if (typeof window !== 'undefined' && window.localStorage) {
          const local = localStorage.getItem('adonik_catalog_products');
          if (local) {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed)) {
              const found = parsed.find(
                (p: any) =>
                  String(p.id) === String(routeProductId) ||
                  (routeProduct?.name && p.name?.toLowerCase() === routeProduct.name.toLowerCase())
              );
              if (found && isMounted) {
                setDynamicProduct(found);
              }
            }
          }
        }

        // 2. Fetch from backend API
        if (routeProductId) {
          const host = typeof window !== 'undefined' && window.location?.hostname ? window.location.hostname : '127.0.0.1';
          const res = await fetch(`http://${host}:8000/api/v1/products/${routeProductId}`);
          if (res.ok) {
            const json = await res.json();
            if (json?.success && json.data && isMounted) {
              setDynamicProduct(json.data);
            }
          }
        }
      } catch {}
    };

    loadDynamicProduct();
    return () => {
      isMounted = false;
    };
  }, [routeProductId, routeProduct?.name]);

  // Resolve product: match by ID or Name
  const matchedCatalogProduct =
    (routeProductId ? findProductById(routeProductId) : undefined) ||
    (routeProduct?.name ? findProductByName(routeProduct.name) : undefined) ||
    (dynamicProduct?.name ? findProductByName(dynamicProduct.name) : undefined) ||
    ALL_PRODUCTS_CATALOG[0];

  const sourceProduct = dynamicProduct || routeProduct || matchedCatalogProduct;

  const rawVendor = sourceProduct?.vendor || matchedCatalogProduct?.vendor || routeProduct?.vendor;
  const vendorName = typeof rawVendor === 'object' && rawVendor !== null
    ? (rawVendor.business_name || rawVendor.name || rawVendor.owner_name || 'Adonik Merchant')
    : (rawVendor || 'Adonik Merchant');

  const rawBrand = sourceProduct?.brand || matchedCatalogProduct?.brand || routeProduct?.brand;
  const brandName = typeof rawBrand === 'object' && rawBrand !== null
    ? (rawBrand.name || vendorName)
    : (rawBrand || vendorName);

  const primaryImage =
    sourceProduct?.image ||
    sourceProduct?.thumbnail ||
    matchedCatalogProduct?.image ||
    routeProduct?.image ||
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';

  const rawImages =
    (Array.isArray(sourceProduct?.images) && sourceProduct.images.length > 0
      ? sourceProduct.images.map((img: any) => (typeof img === 'string' ? img : img.image_path || img.url)).filter(Boolean)
      : undefined) ||
    (Array.isArray(matchedCatalogProduct?.images) && matchedCatalogProduct.images.length > 0
      ? matchedCatalogProduct.images
      : undefined) ||
    [primaryImage];

  const productSpecs: Record<string, string> =
    sourceProduct?.specs ||
    sourceProduct?.details ||
    matchedCatalogProduct?.details ||
    {};

  const productHighlights: string[] =
    sourceProduct?.highlights ||
    matchedCatalogProduct?.highlights ||
    (Object.keys(productSpecs).length > 0
      ? Object.entries(productSpecs).slice(0, 5).map(([k, v]) => `${k}: ${v}`)
      : [
          '100% Genuine and Brand Certified',
          'Comprehensive Quality Tested Product',
          'Safe & Secure Packaging Guaranteed',
          'Fast Dispatch and Delivery',
        ]);

  const productDescription =
    sourceProduct?.description ||
    sourceProduct?.short_description ||
    matchedCatalogProduct?.description ||
    `${sourceProduct?.name || 'Premium product'} delivered with quality assurance and verified authentic craftsmanship.`;

  const productColors =
    (sourceProduct?.colors && sourceProduct.colors.length > 0 ? sourceProduct.colors : undefined) ||
    (matchedCatalogProduct?.colors && matchedCatalogProduct.colors.length > 0 ? matchedCatalogProduct.colors : undefined) ||
    [];

  const productSizes =
    (sourceProduct?.sizes && sourceProduct.sizes.length > 0 ? sourceProduct.sizes : undefined) ||
    (matchedCatalogProduct?.sizes && matchedCatalogProduct.sizes.length > 0 ? matchedCatalogProduct.sizes : undefined) ||
    [];

  const product: CatalogProduct = {
    ...(matchedCatalogProduct || {}),
    ...(sourceProduct || {}),
    id: sourceProduct?.id || routeProductId || 1,
    name: sourceProduct?.name || matchedCatalogProduct?.name || 'Product',
    brand: brandName,
    vendor: vendorName,
    price: Number(sourceProduct?.price || matchedCatalogProduct?.price || 999),
    mrp: Number(sourceProduct?.mrp || sourceProduct?.originalPrice || matchedCatalogProduct?.mrp || sourceProduct?.price || 999),
    discount:
      sourceProduct?.discount ||
      (sourceProduct?.mrp && sourceProduct.price && sourceProduct.mrp > sourceProduct.price
        ? Math.round(((sourceProduct.mrp - sourceProduct.price) / sourceProduct.mrp) * 100)
        : matchedCatalogProduct?.discount || 0),
    rating: Number(sourceProduct?.rating || matchedCatalogProduct?.rating || 4.8),
    reviews: sourceProduct?.reviews || sourceProduct?.review_count || matchedCatalogProduct?.reviews || 120,
    image: primaryImage,
    images: rawImages,
    description: productDescription,
    highlights: productHighlights,
    details: productSpecs,
    colors: productColors,
    sizes: productSizes,
    moreInfo:
      matchedCatalogProduct?.moreInfo ||
      sourceProduct?.moreInfo || [
        { label: 'Authenticity', value: '100% Original Brand Assured', icon: 'ribbon-outline' },
        { label: 'Shipping', value: 'Free Delivery Available', icon: 'cube-outline' },
        { label: 'Returns', value: '7-Day Easy Return & Replacement', icon: 'repeat-outline' },
        { label: 'Payments', value: 'Cash on Delivery & Secure Online Pay', icon: 'card-outline' },
      ],
  };

  const isAssured = Boolean(
    (sourceProduct as any)?.is_assured ||
    (sourceProduct as any)?.is_admin_product ||
    (matchedCatalogProduct as any)?.is_assured ||
    (routeProduct as any)?.is_assured ||
    String(vendorName).toLowerCase().includes('assured') ||
    String(vendorName).toLowerCase().includes('admin') ||
    String(brandName).toLowerCase().includes('assured')
  );

  // Dynamic Options (Colors & Sizes)
  const availableColors =
    product.colors && product.colors.length > 0
      ? product.colors.map((c: any) =>
          typeof c === 'string'
            ? {
                name: c,
                colorHex: '#0F172A',
                borderHex: '#CBD5E1',
                image: product.colorImageMap?.[c],
              }
            : {
                ...c,
                image: c.image || product.colorImageMap?.[c.name],
              }
        )
      : [];

  // Image Gallery combined with any unique color mapped images
  const rawGallery: string[] =
    product.images && product.images.length > 0 ? product.images : [product.image];
  const colorAssignedImages = availableColors.map((c: any) => c.image).filter(Boolean) as string[];
  const galleryImages: string[] = Array.from(new Set([...rawGallery, ...colorAssignedImages]));

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [zoomModalVisible, setZoomModalVisible] = useState(false);

  const [selectedColor, setSelectedColor] = useState(availableColors[0]?.name || 'Default');
  const [selectedColorImage, setSelectedColorImage] = useState<string | null>(
    availableColors[0]?.image || product.colorImageMap?.[availableColors[0]?.name] || null
  );

  const handleSelectColor = (colorName: string) => {
    setSelectedColor(colorName);
    const matchedColorObj = availableColors.find((c: any) => c.name === colorName);
    const targetImage =
      matchedColorObj?.image ||
      product.colorImageMap?.[colorName] ||
      product.variants?.find((v: any) => v.color === colorName && v.image)?.image;

    if (targetImage) {
      setSelectedColorImage(targetImage);
      const existingIdx = galleryImages.findIndex((img) => img === targetImage);
      if (existingIdx !== -1) {
        setActiveImageIndex(existingIdx);
      }
    }
  };

  const availableSizes =
    product.sizes && product.sizes.length > 0
      ? product.sizes
      : [];

  const [selectedSize, setSelectedSize] = useState<string | number>(availableSizes[0] || 'Standard');
  const [quantity, setQuantity] = useState(1);

  // Cart & Wishlist Stores
  const addItem = useCartStore((s) => s.addItem);
  const cartCount = useCartStore((s) => s.totalItems());
  const { isInWishlist, toggleWishlist, totalCount: wishlistCount } = useWishlistStore();
  const isWish = isInWishlist(product.id);

  // Review System Store
  const { getReviews, getStats, addReview, toggleHelpful } = useReviewStore();
  const productReviews = getReviews(product.id);
  const reviewStats = getStats(product.id);

  // Write Review Modal State & Fluid Bottom Sheet Animation
  const [writeModalVisible, setWriteModalVisible] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const sheetAnim = useRef(new Animated.Value(0)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  const openReviewModal = () => {
    sheetAnim.setValue(0);
    backdropAnim.setValue(0);
    setWriteModalVisible(true);

    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 1,
        duration: 240,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(sheetAnim, {
        toValue: 1,
        damping: 24,
        stiffness: 220,
        mass: 0.85,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeReviewModal = () => {
    Animated.parallel([
      Animated.timing(backdropAnim, {
        toValue: 0,
        duration: 180,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(sheetAnim, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setWriteModalVisible(false);
    });
  };

  // Discount & Savings calculations
  const discountPercent =
    product.mrp && product.mrp > product.price
      ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
      : product.discount || 20;

  const savingsAmount =
    product.mrp && product.mrp > product.price
      ? product.mrp - product.price
      : 600;

  useEffect(() => {
    if (availableColors.length > 0) setSelectedColor(availableColors[0].name);
    if (availableSizes.length > 0) setSelectedSize(availableSizes[0]);
    setActiveImageIndex(0);
    setQuantity(1);
  }, [routeProductId]);

  const handleToggleWishlist = () => {
    const nowInWishlist = toggleWishlist({
      id: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      originalPrice: product.mrp,
      rating: reviewStats.averageRating,
      reviewsCount: reviewStats.totalReviews,
      image: galleryImages[activeImageIndex] || product.image,
      vendor: product.vendor,
      brand: product.brand,
    });

    if (nowInWishlist) {
      Alert.alert('Added to Wishlist ❤️', `${product.name} has been saved.`);
    }
  };

  const handleAddToCart = (shouldNavigateToCart = false) => {
    const variantDesc = `(${selectedColor} | ${selectedSize})`;

    addItem({
      id: Number(product.id) || Date.now(),
      product_id: Number(product.id) || Date.now(),
      variant_id: null,
      vendor_id: 1,
      name: `${product.name} ${variantDesc}`.trim(),
      image: galleryImages[activeImageIndex] || product.image,
      price: product.price,
      mrp: product.mrp || product.price,
      quantity: quantity,
      vendor_name: product.vendor || 'Shruti Creation',
      variant_name: variantDesc,
    });

    if (shouldNavigateToCart) {
      navigation.navigate('Cart');
    } else {
      Alert.alert(
        'Added to Cart! 🛍️',
        `${quantity}x "${product.name}" added to your cart.`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => navigation.navigate('Cart') },
        ]
      );
    }
  };

  const handleBuyNow = () => {
    const variantDesc = `(${selectedColor} | ${selectedSize})`;
    const buyNowItem = {
      id: Number(product.id) || Date.now(),
      product_id: Number(product.id) || Date.now(),
      variant_id: null,
      vendor_id: (product as any).vendor_id || 1,
      name: `${product.name} ${variantDesc}`.trim(),
      image: galleryImages[activeImageIndex] || product.image,
      price: product.price,
      mrp: product.mrp || product.price,
      quantity: quantity,
      vendor_name: product.vendor || 'Shruti Creation',
      variant_name: variantDesc,
    };

    // Navigate straight to Checkout exclusively for this product without adding to cart
    navigation.navigate('Checkout', {
      isDirectBuy: true,
      buyNowItem,
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this gorgeous ${product.name} by ${product.brand} for only ₹${product.price.toLocaleString()} on Adonik!`,
      });
    } catch (_) {}
  };

  const handleSubmitReview = () => {
    if (!reviewName.trim()) {
      Alert.alert('Required Field', 'Please enter your name.');
      return;
    }
    if (!reviewComment.trim()) {
      Alert.alert('Required Field', 'Please write a brief review comment.');
      return;
    }

    addReview(product.id, {
      userName: reviewName.trim(),
      rating: reviewRating,
      comment: reviewComment.trim(),
      image: product.image || galleryImages[0],
    });

    setReviewName('');
    setReviewComment('');
    setReviewRating(5);
    closeReviewModal();

    Alert.alert(
      'Review Submitted! 🌟',
      'Thank you for your valuable feedback! Your verified review is now live.'
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ─── Top Boutique Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Home'))}
          style={styles.headerIconBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color={BOUTIQUE.textDark} />
        </TouchableOpacity>

        {/* Center Brand Identity (Lotus Logo + Shruti Creation) */}
        <View style={styles.headerBrandContainer}>
          <MaterialCommunityIcons
            name="flower-tulip-outline"
            size={22}
            color={BOUTIQUE.primary}
            style={{ marginRight: 6 }}
          />
          <View>
            <Text style={styles.brandTitleText}>
              {product.brand || 'Shruti Creation'}
            </Text>
            <Text style={styles.brandSubtitleText}>BOUTIQUE COUTURE</Text>
          </View>
        </View>

        {/* Right Action Icons: Search, Wishlist with badge, Cart with badge */}
        <View style={styles.headerRightIcons}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Search')}
            style={styles.headerIconBtn}
            activeOpacity={0.7}
          >
            <Feather name="search" size={19} color={BOUTIQUE.textDark} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Wishlist')}
            style={styles.headerIconBtn}
            activeOpacity={0.7}
          >
            <View style={{ position: 'relative' }}>
              <Ionicons
                name={isWish ? 'heart' : 'heart-outline'}
                size={21}
                color={isWish ? '#EF4444' : BOUTIQUE.textDark}
              />
              {wishlistCount() > 0 && (
                <View style={styles.badgeCountPill}>
                  <Text style={styles.badgeCountText}>{wishlistCount()}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Cart')}
            style={styles.headerIconBtn}
            activeOpacity={0.7}
          >
            <View style={{ position: 'relative' }}>
              <Feather name="shopping-bag" size={20} color={BOUTIQUE.textDark} />
              {cartCount > 0 && (
                <View style={styles.badgeCountPill}>
                  <Text style={styles.badgeCountText}>{cartCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ─── Hero Product Image Card ─── */}
        <View style={styles.heroCardContainer}>
          <Image
            source={{ uri: selectedColorImage || galleryImages[activeImageIndex] || product.image }}
            style={styles.heroImage}
            resizeMode="cover"
          />

          {/* Top-Left Discount Badge (-20%) */}
          {discountPercent > 0 && (
            <View style={styles.floatingDiscountBadge}>
              <Text style={styles.floatingDiscountText}>-{discountPercent}%</Text>
            </View>
          )}

          {/* Top-Right Circular Floating Wishlist Button */}
          <TouchableOpacity
            style={styles.floatingWishlistBtn}
            onPress={handleToggleWishlist}
            activeOpacity={0.85}
          >
            <Ionicons
              name={isWish ? 'heart' : 'heart-outline'}
              size={21}
              color={isWish ? '#EF4444' : '#374151'}
            />
          </TouchableOpacity>

          {/* Bottom-Right Circular Floating Expand / Zoom Button */}
          <TouchableOpacity
            style={styles.floatingExpandBtn}
            onPress={() => setZoomModalVisible(true)}
            activeOpacity={0.85}
          >
            <MaterialCommunityIcons name="arrow-expand" size={19} color="#374151" />
          </TouchableOpacity>
        </View>

        {/* ─── Thumbnail Preview Row ─── */}
        {galleryImages.length > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailRow}
          >
            {galleryImages.map((uri, idx) => {
              const isActive = (selectedColorImage ? selectedColorImage === uri : activeImageIndex === idx);
              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.thumbnailCard,
                    isActive && styles.thumbnailCardActive,
                  ]}
                  onPress={() => {
                    setActiveImageIndex(idx);
                    setSelectedColorImage(uri);
                  }}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri }} style={styles.thumbnailImage} resizeMode="cover" />
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {/* ─── Product Title & Rating ─── */}
        <View style={styles.titleSection}>
          <View style={styles.titleHeaderWrap}>
            <Text style={styles.productTitleText}>{product.name}</Text>
            {isAssured && (
              <View style={styles.assuredTitleBadge}>
                <Ionicons name="shield-checkmark" size={13} color="#0284C7" />
                <Text style={styles.assuredTitleBadgeText}>Assured</Text>
              </View>
            )}
          </View>

          <View style={styles.starRatingRow}>
            <View style={styles.goldStarsWrap}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Ionicons
                  key={star}
                  name="star"
                  size={14}
                  color={BOUTIQUE.starGold}
                  style={{ marginRight: 2 }}
                />
              ))}
            </View>
            <Text style={styles.ratingNumberText}>
              {reviewStats.averageRating} ({reviewStats.totalReviews} Reviews)
            </Text>
            {isAssured && (
              <View style={styles.assuredVerifiedPill}>
                <Ionicons name="checkmark-circle" size={12} color="#059669" />
                <Text style={styles.assuredVerifiedPillText}>Adonik Assured Guarantee</Text>
              </View>
            )}
          </View>

          {/* ─── Price Row (₹ 2,399 | ₹ 2,999 | Save ₹ 600) ─── */}
          <View style={styles.priceRow}>
            <Text style={styles.mainPriceText}>₹ {product.price.toLocaleString()}</Text>
            {product.mrp && product.mrp > product.price && (
              <Text style={styles.mrpCrossedText}>₹ {product.mrp.toLocaleString()}</Text>
            )}
            {savingsAmount > 0 && (
              <View style={styles.saveBadgePill}>
                <Text style={styles.saveBadgeText}>
                  Save ₹ {savingsAmount.toLocaleString()}
                </Text>
              </View>
            )}
          </View>

          {/* Description Snippet */}
          <Text style={styles.descriptionSnippetText}>{product.description}</Text>
        </View>

        <View style={styles.sectionSeparator} />

        {/* ─── Section: Color Selector ─── */}
        {availableColors.length > 0 && (
          <View style={styles.sectionPad}>
            <Text style={styles.selectorHeadingText}>
              {(product.color_variety_title || 'Color')}: <Text style={styles.selectorHeadingValue}>{selectedColor}</Text>
            </Text>
            <View style={styles.colorSwatchesRow}>
              {availableColors.map((colorObj: any) => {
                const isSelected = selectedColor === colorObj.name;
                return (
                  <TouchableOpacity
                    key={colorObj.name}
                    style={[
                      styles.colorSwatchRing,
                      isSelected && styles.colorSwatchRingActive,
                    ]}
                    onPress={() => handleSelectColor(colorObj.name)}
                    activeOpacity={0.8}
                  >
                    <View
                      style={[
                        styles.colorSwatchCircle,
                        {
                          backgroundColor: colorObj.colorHex,
                          borderColor: colorObj.borderHex || '#CBD5E1',
                        },
                      ]}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ─── Section: Size Selector ─── */}
        {availableSizes.length > 0 && (
          <View style={styles.sectionPad}>
            <Text style={styles.selectorHeadingText}>{(product.text_variety_title || 'Size / Option')}:</Text>
            <View style={styles.sizesRow}>
              {availableSizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <TouchableOpacity
                    key={size.toString()}
                    style={[
                      styles.sizePillBtn,
                      isSelected && styles.sizePillBtnActive,
                    ]}
                    onPress={() => setSelectedSize(size)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.sizePillBtnText,
                        isSelected && styles.sizePillBtnTextActive,
                      ]}
                    >
                      {size}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {/* ─── Section: Quantity ─── */}
        <View style={styles.sectionPad}>
          <View style={styles.quantityRowWrap}>
            <Text style={styles.selectorHeadingText}>Quantity:</Text>
            <View style={styles.qtyPill}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
              >
                <Feather
                  name="minus"
                  size={15}
                  color={quantity <= 1 ? '#D1D5DB' : BOUTIQUE.textDark}
                />
              </TouchableOpacity>

              <Text style={styles.qtyNumberText}>{quantity}</Text>

              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity((q) => Math.min(10, q + 1))}
              >
                <Feather name="plus" size={15} color={BOUTIQUE.textDark} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ─── Action Buttons: Add to Cart & Buy Now ─── */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.addToCartSolidBtn}
            onPress={() => handleAddToCart(false)}
            activeOpacity={0.88}
          >
            <Feather name="shopping-cart" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.addToCartSolidBtnText}>Add to Cart</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.buyNowOutlinedBtn}
            onPress={handleBuyNow}
            activeOpacity={0.88}
          >
            <Ionicons name="flash" size={17} color={BOUTIQUE.primary} style={{ marginRight: 6 }} />
            <Text style={styles.buyNowOutlinedBtnText}>Buy Now</Text>
          </TouchableOpacity>

          {/* Quick Actions Row: Add to Wishlist | Share */}
          <View style={styles.quickActionsRow}>
            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={handleToggleWishlist}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isWish ? 'heart' : 'heart-outline'}
                size={18}
                color={isWish ? '#EF4444' : BOUTIQUE.textDark}
                style={{ marginRight: 6 }}
              />
              <Text style={styles.quickActionText}>
                {isWish ? 'In Wishlist' : 'Add to Wishlist'}
              </Text>
            </TouchableOpacity>

            <View style={styles.quickActionDivider} />

            <TouchableOpacity
              style={styles.quickActionItem}
              onPress={handleShare}
              activeOpacity={0.7}
            >
              <Feather name="share-2" size={17} color={BOUTIQUE.textDark} style={{ marginRight: 6 }} />
              <Text style={styles.quickActionText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionSeparator} />

        {/* ─── Product Highlights ─── */}
        <View style={styles.sectionPad}>
          <Text style={styles.blockTitleText}>Product Highlights</Text>
          <View style={styles.highlightsList}>
            {product.highlights?.map((highlight, index) => (
              <View key={index} style={styles.highlightRow}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={19}
                  color={BOUTIQUE.primary}
                  style={styles.highlightIcon}
                />
                <Text style={styles.highlightText}>{highlight}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionSeparator} />

        {/* ─── Product Details (Key-Value Grid) ─── */}
        <View style={styles.sectionPad}>
          <Text style={styles.blockTitleText}>Product Details</Text>
          <View style={styles.detailsGrid}>
            {Object.entries(product.details || {}).map(([key, val], idx) => (
              <View key={key} style={styles.detailRow}>
                <Text style={styles.detailKey}>{key}</Text>
                <Text style={styles.detailVal}>{val}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionSeparator} />

        {/* ─── More Information ─── */}
        <View style={styles.sectionPad}>
          <Text style={styles.blockTitleText}>More Information</Text>
          <View style={styles.moreInfoList}>
            <View style={styles.moreInfoRow}>
              <View style={styles.moreInfoIconWrap}>
                <MaterialCommunityIcons name="hanger" size={20} color={BOUTIQUE.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.moreInfoLabel}>Occasion</Text>
                <Text style={styles.moreInfoValue}>Wedding / Festival / Party</Text>
              </View>
            </View>

            <View style={styles.moreInfoRow}>
              <View style={styles.moreInfoIconWrap}>
                <Ionicons name="water-outline" size={20} color={BOUTIQUE.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.moreInfoLabel}>Care Instructions</Text>
                <Text style={styles.moreInfoValue}>Dry Clean Only</Text>
              </View>
            </View>

            <View style={styles.moreInfoRow}>
              <View style={styles.moreInfoIconWrap}>
                <Feather name="truck" size={19} color={BOUTIQUE.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.moreInfoLabel}>Shipping</Text>
                <Text style={styles.moreInfoValue}>Free Shipping on Orders Above ₹999</Text>
              </View>
            </View>

            <View style={styles.moreInfoRow}>
              <View style={styles.moreInfoIconWrap}>
                <Ionicons name="repeat-outline" size={20} color={BOUTIQUE.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.moreInfoLabel}>Return & Exchange</Text>
                <Text style={styles.moreInfoValue}>Easy Returns | Cash on Delivery Available</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.sectionSeparator} />

        {/* ─── Seller & Assured Guarantee Section ─── */}
        <View style={styles.sectionPad}>
          <Text style={styles.blockTitleText}>Seller & Fulfillment</Text>
          <View style={styles.sellerCard}>
            <View style={styles.sellerHeaderRow}>
              <View style={[styles.sellerAvatarWrap, isAssured && styles.sellerAvatarWrapAssured]}>
                <Ionicons
                  name={isAssured ? "shield-checkmark" : "storefront"}
                  size={20}
                  color={isAssured ? "#0284C7" : BOUTIQUE.primary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Text style={styles.sellerNameText}>
                    {isAssured ? 'Adonik Assured (Admin Direct)' : (product.vendor || 'Authorized Merchant')}
                  </Text>
                  {isAssured ? (
                    <View style={styles.assuredBadgeInCard}>
                      <Ionicons name="checkmark-circle" size={11} color="#FFFFFF" />
                      <Text style={styles.assuredBadgeInCardText}>ASSURED</Text>
                    </View>
                  ) : (
                    <View style={styles.verifiedSellerPill}>
                      <Text style={styles.verifiedSellerPillText}>Verified Seller</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.sellerSubtitleText}>
                  {isAssured
                    ? '100% Original product directly verified, packed & guaranteed by Adonik official warehouse.'
                    : 'Certified marketplace merchant with fast shipping compliance.'}
                </Text>
              </View>
            </View>

            {isAssured && (
              <View style={styles.assuredPerksGrid}>
                <View style={styles.assuredPerkItem}>
                  <Ionicons name="ribbon-outline" size={15} color="#0284C7" />
                  <Text style={styles.assuredPerkText}>100% Genuine</Text>
                </View>
                <View style={styles.assuredPerkItem}>
                  <Ionicons name="flash-outline" size={15} color="#0284C7" />
                  <Text style={styles.assuredPerkText}>Fast Dispatch</Text>
                </View>
                <View style={styles.assuredPerkItem}>
                  <Ionicons name="shield-checkmark-outline" size={15} color="#0284C7" />
                  <Text style={styles.assuredPerkText}>Strict QC Pass</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        <View style={styles.sectionSeparator} />

        {/* ─── Customer Reviews Section (Fully Working System) ─── */}
        <View style={styles.sectionPad}>
          <View style={styles.reviewHeaderRow}>
            <Text style={styles.blockTitleText}>Customer Reviews</Text>
            <TouchableOpacity
              style={styles.writeReviewTriggerBtn}
              onPress={openReviewModal}
              activeOpacity={0.8}
            >
              <Feather name="edit-3" size={14} color={BOUTIQUE.primary} style={{ marginRight: 4 }} />
              <Text style={styles.writeReviewTriggerText}>Write a Review</Text>
            </TouchableOpacity>
          </View>

          {/* Rating Summary (4.8 ★★★★★ (124 Reviews) + Breakdown Bars) */}
          <View style={styles.reviewSummaryCard}>
            <View style={styles.bigScoreCol}>
              <Text style={styles.bigScoreNumber}>{reviewStats.averageRating}</Text>
              <View style={styles.goldStarsWrap}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name="star"
                    size={14}
                    color={BOUTIQUE.starGold}
                    style={{ marginRight: 2 }}
                  />
                ))}
              </View>
              <Text style={styles.summaryReviewCountText}>
                ({reviewStats.totalReviews} Reviews)
              </Text>
            </View>

            {/* Breakdown Progress Bars (5, 4, 3, 2, 1) */}
            <View style={styles.breakdownBarsCol}>
              {[
                { star: 5, pct: reviewStats.breakdown.star5 },
                { star: 4, pct: reviewStats.breakdown.star4 },
                { star: 3, pct: reviewStats.breakdown.star3 },
                { star: 2, pct: reviewStats.breakdown.star2 },
                { star: 1, pct: reviewStats.breakdown.star1 },
              ].map((item) => (
                <View key={item.star} style={styles.breakdownRow}>
                  <Text style={styles.breakdownStarLabel}>{item.star}</Text>
                  <Ionicons name="star" size={10} color={BOUTIQUE.starGold} style={{ marginRight: 6 }} />
                  <View style={styles.progressTrack}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.max(2, item.pct)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.breakdownPercentText}>{item.pct}%</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Reviews List */}
          <View style={styles.reviewsList}>
            {productReviews.map((rev) => (
              <View key={rev.id} style={styles.reviewCard}>
                <View style={styles.reviewerHeaderRow}>
                  <View style={styles.reviewerAvatar}>
                    <Text style={styles.reviewerAvatarText}>{rev.avatarLetter || 'U'}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewerName}>{rev.userName}</Text>
                    {rev.isVerifiedBuyer && (
                      <View style={styles.verifiedBuyerRow}>
                        <Ionicons name="checkmark-circle" size={12} color="#16A34A" />
                        <Text style={styles.verifiedBuyerText}>Verified Buyer</Text>
                      </View>
                    )}
                  </View>

                  <Text style={styles.reviewDateText}>{rev.date}</Text>
                </View>

                {/* Star Row */}
                <View style={[styles.goldStarsWrap, { marginTop: 8 }]}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Ionicons
                      key={s}
                      name={s <= rev.rating ? 'star' : 'star-outline'}
                      size={13}
                      color={BOUTIQUE.starGold}
                      style={{ marginRight: 2 }}
                    />
                  ))}
                </View>

                {/* Comment */}
                <Text style={styles.reviewCommentText}>{rev.comment}</Text>

                {/* Attached Photo Thumbnail (if present) */}
                {rev.image && (
                  <TouchableOpacity
                    onPress={() => setZoomModalVisible(true)}
                    activeOpacity={0.85}
                  >
                    <Image
                      source={{ uri: rev.image }}
                      style={styles.reviewAttachedThumb}
                      resizeMode="cover"
                    />
                  </TouchableOpacity>
                )}

                {/* Helpful Reaction Button */}
                <View style={styles.reviewFooterRow}>
                  <TouchableOpacity
                    style={[
                      styles.helpfulBtn,
                      rev.userVotedHelpful && styles.helpfulBtnActive,
                    ]}
                    onPress={() => toggleHelpful(product.id, rev.id)}
                    activeOpacity={0.7}
                  >
                    <Feather
                      name="thumbs-up"
                      size={13}
                      color={rev.userVotedHelpful ? BOUTIQUE.primary : '#6B7280'}
                      style={{ marginRight: 5 }}
                    />
                    <Text
                      style={[
                        styles.helpfulBtnText,
                        rev.userVotedHelpful && styles.helpfulBtnTextActive,
                      ]}
                    >
                      Helpful ({rev.helpfulCount})
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ─── Luxury Animated Bottom Sheet "Write a Review" Slider ─── */}
      <Modal
        visible={writeModalVisible}
        animationType="none"
        transparent={true}
        onRequestClose={closeReviewModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          {/* Animated Backdrop with Touch-to-Dismiss */}
          <TouchableWithoutFeedback onPress={closeReviewModal}>
            <Animated.View
              style={[
                styles.modalBackdrop,
                { opacity: backdropAnim },
              ]}
            />
          </TouchableWithoutFeedback>

          {/* Animated Sliding Bottom Sheet Container */}
          <Animated.View
            style={[
              styles.modalContentCard,
              {
                transform: [
                  {
                    translateY: sheetAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [SCREEN_H * 0.75, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* Native Pull Handle Pill */}
            <View style={styles.sheetHandleBar} />

            <View style={styles.modalHeaderRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitleText}>Write a Review</Text>
                <Text style={styles.modalSubtitleText}>Share your genuine experience with other buyers</Text>
              </View>
              <TouchableOpacity
                onPress={closeReviewModal}
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color={BOUTIQUE.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
              {/* Product brief with correct matching product image */}
              <View style={styles.modalProductBrief}>
                <Image
                  source={{ uri: product.image || galleryImages[0] }}
                  style={styles.modalProductThumb}
                  resizeMode="cover"
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalProductName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.modalProductBrand}>{product.brand || product.vendor}</Text>
                </View>
              </View>

              {/* Star Rating Picker with Live Feedback */}
              <Text style={styles.modalInputLabel}>Overall Rating</Text>
              <View style={styles.starPickerBox}>
                <View style={styles.starPickerRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      onPress={() => setReviewRating(star)}
                      style={styles.starTouchItem}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={star <= reviewRating ? 'star' : 'star-outline'}
                        size={36}
                        color={BOUTIQUE.starGold}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.starFeedbackText}>
                  {reviewRating === 5 && '⭐⭐⭐⭐⭐ 5.0 - Excellent quality!'}
                  {reviewRating === 4 && '⭐⭐⭐⭐ 4.0 - Very good, satisfied!'}
                  {reviewRating === 3 && '⭐⭐⭐ 3.0 - Average, meets expectations'}
                  {reviewRating === 2 && '⭐⭐ 2.0 - Fair, needs improvement'}
                  {reviewRating === 1 && '⭐ 1.0 - Poor experience'}
                </Text>
              </View>

              {/* Name Input */}
              <Text style={styles.modalInputLabel}>Your Name</Text>
              <TextInput
                style={styles.modalTextInput}
                placeholder="Enter your name (e.g. Priya Sharma)"
                placeholderTextColor="#9CA3AF"
                value={reviewName}
                onChangeText={setReviewName}
              />

              {/* Comment Input */}
              <Text style={styles.modalInputLabel}>Your Review</Text>
              <TextInput
                style={[styles.modalTextInput, styles.modalTextArea]}
                placeholder="Write your review about the fabric, fit, quality and experience..."
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={4}
                value={reviewComment}
                onChangeText={setReviewComment}
                textAlignVertical="top"
              />

              {/* Submit CTA */}
              <TouchableOpacity
                style={styles.modalSubmitBtn}
                onPress={handleSubmitReview}
                activeOpacity={0.88}
              >
                <Text style={styles.modalSubmitBtnText}>Submit Review</Text>
              </TouchableOpacity>
            </ScrollView>
          </Animated.View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ─── Image Zoom / Fullscreen Modal ─── */}
      <Modal
        visible={zoomModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setZoomModalVisible(false)}
      >
        <View style={styles.zoomModalBackdrop}>
          <TouchableOpacity
            style={styles.zoomCloseBtn}
            onPress={() => setZoomModalVisible(false)}
          >
            <Ionicons name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Image
            source={{ uri: galleryImages[activeImageIndex] || product.image }}
            style={styles.zoomFullImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header matching Screen 1 & Screen 2
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  headerIconBtn: {
    padding: 6,
  },
  headerBrandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 4,
  },
  brandTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: BOUTIQUE.primary,
    letterSpacing: -0.3,
  },
  brandSubtitleText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#6B7280',
    letterSpacing: 0.8,
  },
  headerRightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badgeCountPill: {
    position: 'absolute',
    top: -5,
    right: -7,
    backgroundColor: BOUTIQUE.primary,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeCountText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
  },

  scrollContent: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 20,
  },

  // Hero Card
  heroCardContainer: {
    width: HERO_CARD_W,
    height: HERO_CARD_H,
    alignSelf: 'center',
    marginTop: 14,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  floatingDiscountBadge: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: BOUTIQUE.discountRed,
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  floatingDiscountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  floatingWishlistBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  floatingExpandBtn: {
    position: 'absolute',
    bottom: 14,
    right: 14,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Thumbnails
  thumbnailRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  thumbnailCard: {
    width: 62,
    height: 62,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  thumbnailCardActive: {
    borderColor: BOUTIQUE.primary,
    borderWidth: 2,
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },

  // Title Section
  titleSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  titleHeaderWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  productTitleText: {
    flex: 1,
    fontSize: 20,
    fontWeight: '800',
    color: BOUTIQUE.textDark,
    letterSpacing: -0.3,
  },
  assuredTitleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3.5,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  assuredTitleBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.2,
  },
  starRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: 6,
    gap: 8,
  },
  goldStarsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingNumberText: {
    fontSize: 12.5,
    color: '#6B7280',
    fontWeight: '600',
  },
  assuredVerifiedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    borderWidth: 0.8,
    borderColor: '#A7F3D0',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
  },
  assuredVerifiedPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#059669',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  mainPriceText: {
    fontSize: 22,
    fontWeight: '800',
    color: BOUTIQUE.textDark,
  },
  mrpCrossedText: {
    fontSize: 15,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  saveBadgePill: {
    backgroundColor: BOUTIQUE.badgePink,
    paddingHorizontal: 10,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  saveBadgeText: {
    color: BOUTIQUE.badgePinkText,
    fontSize: 12,
    fontWeight: '700',
  },
  descriptionSnippetText: {
    fontSize: 13,
    color: '#4B5563',
    lineHeight: 19,
    marginTop: 10,
  },

  sectionSeparator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
    marginHorizontal: 16,
  },

  sectionPad: {
    paddingHorizontal: 16,
  },

  // Selectors (Color & Size)
  selectorHeadingText: {
    fontSize: 13.5,
    fontWeight: '700',
    color: BOUTIQUE.textDark,
    marginBottom: 10,
  },
  selectorHeadingValue: {
    fontWeight: '800',
    color: BOUTIQUE.textDark,
  },
  colorSwatchesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorSwatchRing: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorSwatchRingActive: {
    borderColor: BOUTIQUE.primary,
  },
  colorSwatchCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
  },

  sizesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  sizePillBtn: {
    paddingHorizontal: 22,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  sizePillBtnActive: {
    borderColor: BOUTIQUE.primary,
    backgroundColor: BOUTIQUE.primaryLight,
  },
  sizePillBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
  sizePillBtnTextActive: {
    color: BOUTIQUE.primary,
    fontWeight: '800',
  },

  // Quantity Row
  quantityRowWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  qtyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    padding: 3,
    backgroundColor: '#FFFFFF',
  },
  qtyBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyNumberText: {
    fontSize: 14,
    fontWeight: '800',
    color: BOUTIQUE.textDark,
    paddingHorizontal: 16,
  },

  // Action Buttons
  buttonsContainer: {
    paddingHorizontal: 16,
    marginTop: 18,
    gap: 12,
  },
  addToCartSolidBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BOUTIQUE.primary,
    height: 48,
    borderRadius: 12,
  },
  addToCartSolidBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  buyNowOutlinedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: BOUTIQUE.primary,
    height: 48,
    borderRadius: 12,
  },
  buyNowOutlinedBtnText: {
    color: BOUTIQUE.primary,
    fontSize: 14,
    fontWeight: '800',
  },

  quickActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    gap: 16,
  },
  quickActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: BOUTIQUE.textDark,
  },
  quickActionDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#E5E7EB',
  },

  // Highlights
  blockTitleText: {
    fontSize: 16,
    fontWeight: '800',
    color: BOUTIQUE.textDark,
    marginBottom: 12,
  },
  highlightsList: {
    gap: 10,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightIcon: {
    marginRight: 10,
  },
  highlightText: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },

  // Details Grid
  detailsGrid: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailKey: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    width: 130,
  },
  detailVal: {
    fontSize: 13,
    color: BOUTIQUE.textDark,
    fontWeight: '700',
    flex: 1,
    textAlign: 'left',
  },

  // More Information
  moreInfoList: {
    gap: 14,
  },
  moreInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  moreInfoIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: BOUTIQUE.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreInfoLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: BOUTIQUE.textDark,
  },
  moreInfoValue: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 1,
  },

  // Seller & Fulfillment Card
  sellerCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  sellerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  sellerAvatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BOUTIQUE.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sellerAvatarWrapAssured: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  sellerNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: BOUTIQUE.textDark,
  },
  sellerSubtitleText: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 16,
  },
  assuredBadgeInCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#0284C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  assuredBadgeInCardText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  verifiedSellerPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: '#CBD5E1',
  },
  verifiedSellerPillText: {
    color: '#475569',
    fontSize: 9.5,
    fontWeight: '700',
  },
  assuredPerksGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  assuredPerkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  assuredPerkText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0369A1',
  },

  // Reviews System
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  writeReviewTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: BOUTIQUE.primaryLight,
  },
  writeReviewTriggerText: {
    fontSize: 12,
    fontWeight: '700',
    color: BOUTIQUE.primary,
  },
  reviewSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  bigScoreCol: {
    alignItems: 'center',
    paddingRight: 18,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  bigScoreNumber: {
    fontSize: 34,
    fontWeight: '900',
    color: BOUTIQUE.textDark,
  },
  summaryReviewCountText: {
    fontSize: 11,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 3,
  },
  breakdownBarsCol: {
    flex: 1,
    paddingLeft: 16,
    gap: 5,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownStarLabel: {
    fontSize: 11,
    color: '#4B5563',
    fontWeight: '700',
    width: 10,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: BOUTIQUE.barBackground,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: BOUTIQUE.primary,
    borderRadius: 3,
  },
  breakdownPercentText: {
    fontSize: 10.5,
    color: '#6B7280',
    fontWeight: '600',
    width: 32,
    textAlign: 'right',
  },

  reviewsList: {
    marginTop: 16,
    gap: 14,
  },
  reviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reviewerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  reviewerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#6B7280',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  reviewerName: {
    fontSize: 13,
    fontWeight: '700',
    color: BOUTIQUE.textDark,
  },
  verifiedBuyerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 1,
  },
  verifiedBuyerText: {
    fontSize: 10.5,
    color: '#16A34A',
    fontWeight: '600',
  },
  reviewDateText: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  reviewCommentText: {
    fontSize: 12.5,
    color: '#374151',
    lineHeight: 18,
    marginTop: 6,
  },
  reviewAttachedThumb: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginTop: 8,
  },
  reviewFooterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  helpfulBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  helpfulBtnActive: {
    borderColor: BOUTIQUE.primary,
    backgroundColor: BOUTIQUE.primaryLight,
  },
  helpfulBtnText: {
    fontSize: 11.5,
    color: '#6B7280',
    fontWeight: '600',
  },
  helpfulBtnTextActive: {
    color: BOUTIQUE.primary,
    fontWeight: '700',
  },

  // Bottom Sheet Modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.62)',
  },
  modalContentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
    maxHeight: '88%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 24,
  },
  sheetHandleBar: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 14,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalTitleText: {
    fontSize: 18,
    fontWeight: '800',
    color: BOUTIQUE.textDark,
  },
  modalSubtitleText: {
    fontSize: 11.5,
    color: '#6B7280',
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalProductBrief: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 14,
    backgroundColor: '#F9FAFB',
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  modalProductThumb: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  modalProductName: {
    fontSize: 13,
    fontWeight: '700',
    color: BOUTIQUE.textDark,
  },
  modalProductBrand: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  modalInputLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: BOUTIQUE.textDark,
    marginTop: 12,
    marginBottom: 6,
  },
  starPickerBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: 8,
  },
  starPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  starTouchItem: {
    padding: 3,
  },
  starFeedbackText: {
    fontSize: 12,
    fontWeight: '700',
    color: BOUTIQUE.primaryDark,
    marginTop: 6,
  },
  modalTextInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
    fontSize: 13.5,
    color: BOUTIQUE.textDark,
  },
  modalTextArea: {
    height: 90,
    paddingTop: 10,
  },
  modalSubmitBtn: {
    backgroundColor: BOUTIQUE.primary,
    borderRadius: 12,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: BOUTIQUE.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // Zoom Modal
  zoomModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomCloseBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  zoomFullImage: {
    width: SCREEN_W,
    height: SCREEN_W * 1.3,
  },
});
