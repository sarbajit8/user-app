import { ALL_PRODUCTS_CATALOG, CatalogProduct } from './productsCatalog';

export type { CatalogProduct };

/**
 * Filter genuine products by subcategory and/or parent category.
 * If no genuine products exist for this subcategory / collection, returns an empty array [].
 * NO DEMO / FAKE PRODUCTS ARE EVER RETURNED.
 */
export function getSubCategoryProducts(
  subCategoryTitle: string = '',
  parentCategory: string = ''
): CatalogProduct[] {
  const query = (subCategoryTitle || '').toLowerCase().trim();
  const parent = (parentCategory || '').toLowerCase().trim();

  // If both empty, return empty
  if (!query && !parent) {
    return [];
  }

  // Filter ONLY from our genuine catalog of authentic products
  const matches = ALL_PRODUCTS_CATALOG.filter((product) => {
    const pName = (product.name || '').toLowerCase();
    const pCat = (product.category || '').toLowerCase();
    const pBrand = (product.brand || '').toLowerCase();
    const pVendor = (product.vendor || '').toLowerCase();
    const pDesc = (product.description || '').toLowerCase();
    const pHighlights = Array.isArray(product.highlights) ? product.highlights.join(' ').toLowerCase() : '';
    const pDetails = product.details
      ? Object.entries(product.details).map(([k, v]) => `${k} ${v}`).join(' ').toLowerCase()
      : '';

    const allProductText = `${pName} ${pCat} ${pBrand} ${pVendor} ${pDesc} ${pHighlights} ${pDetails}`;

    // 1. If searching for all items in a main category
    if (query === 'all' || query === 'all products' || query === 'view all' || query === 'see all') {
      if (parent.includes('mobile')) return pCat.includes('mobile') || pCat.includes('tablet');
      if (parent.includes('electronic')) return pCat.includes('electronic') || pCat.includes('audio');
      if (parent.includes('fashion')) return pCat.includes('fashion') || pCat.includes('shoe') || pCat.includes('men');
      if (parent.includes('home')) return pCat.includes('home') || pCat.includes('furniture');
      if (parent.includes('beauty')) return pCat.includes('beauty') || pCat.includes('wellness');
      if (parent.includes('smart') || parent.includes('gadget')) return pCat.includes('smart') || pCat.includes('watch') || pCat.includes('accessory');
      return true;
    }

    // 2. Mobiles & Tablets
    if (query.includes('iphone') || query.includes('apple') || query.includes('ios')) {
      return pName.includes('iphone') || pBrand.includes('apple');
    }
    if (query.includes('samsung') || query.includes('galaxy') || query.includes('s24')) {
      return pName.includes('samsung') || pName.includes('galaxy');
    }
    if (query.includes('mobile') || query.includes('smartphone') || query.includes('phone') || query.includes('5g')) {
      return pCat.includes('mobile') || pCat.includes('tablet');
    }

    // 3. Shoes & Footwear
    if (query.includes('nike') || query.includes('air force') || query.includes('sneaker') || query.includes('shoe') || query.includes('footwear')) {
      return pCat.includes('shoe') || pCat.includes('footwear') || pName.includes('sneaker') || pBrand.includes('nike');
    }

    // 4. Audio, Headphones, Soundbars
    if (query.includes('soundbar') || query.includes('dolby') || query.includes('subwoofer') || query.includes('speaker') || query.includes('soundkraft')) {
      return pName.includes('soundbar') || pName.includes('soundkraft') || allProductText.includes('soundbar');
    }
    if (query.includes('headphone') || query.includes('anc') || query.includes('earphone') || query.includes('earbud') || query.includes('wireless headphone')) {
      return pName.includes('headphone') || pName.includes('anc') || allProductText.includes('headphone');
    }
    if (query.includes('audio') || query.includes('sound')) {
      return pCat.includes('audio') || pName.includes('soundbar') || pName.includes('headphone');
    }

    // 5. Power banks & Chargers
    if (query.includes('powerbank') || query.includes('power bank') || query.includes('fast-charge') || query.includes('battery pack') || query.includes('charger')) {
      return pName.includes('powerbank') || pCat.includes('accessory') || allProductText.includes('powerbank');
    }

    // 6. Watches & Luxury
    if (query.includes('seiko') || query.includes('watch') || query.includes('automatic watch') || query.includes('wrist watch') || query.includes('chronograph')) {
      return pName.includes('seiko') || pName.includes('watch') || pCat.includes('watch');
    }

    // 7. Men Fashion / Hoodies / Apparel
    if (query.includes('hoodie') || query.includes('sweatshirt') || query.includes('fleece') || query.includes('french terry') || query.includes('oatmeal')) {
      return pName.includes('hoodie') || allProductText.includes('hoodie');
    }
    if (query.includes('men') && (parent.includes('fashion') || query.includes('fashion'))) {
      return pCat.includes('men') || pCat.includes('fashion') || pName.includes('hoodie') || pName.includes('sneakers');
    }

    // 8. Sarees & Ethnic Wear
    if (query.includes('saree') || query.includes('silk') || query.includes('banarasi') || query.includes('ethnic') || query.includes('handloom')) {
      return pName.includes('saree') || pName.includes('silk') || allProductText.includes('saree');
    }

    // 9. Furniture / Chairs
    if (query.includes('chair') || query.includes('office chair') || query.includes('ergonomic') || query.includes('lumbar') || query.includes('mesh chair')) {
      return pName.includes('chair') || pCat.includes('furniture');
    }

    // 10. Beauty / Skincare
    if (query.includes('serum') || query.includes('vitamin c') || query.includes('brightening') || query.includes('skincare') || query.includes('facial')) {
      return pName.includes('serum') || pCat.includes('beauty');
    }

    // Direct category or name substring match
    if (pCat && (pCat.includes(query) || query.includes(pCat))) {
      return true;
    }
    if (pName && (pName.includes(query) || query.includes(pName))) {
      return true;
    }

    return false;
  });

  return matches;
}
