import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserReview {
  id: string;
  userName: string;
  avatarLetter?: string;
  isVerifiedBuyer: boolean;
  date: string;
  rating: number; // 1 to 5
  comment: string;
  image?: string;
  helpfulCount: number;
  userVotedHelpful?: boolean;
}

export interface ReviewBreakdown {
  star5: number; // e.g. 88
  star4: number; // e.g. 8
  star3: number; // e.g. 2
  star2: number; // e.g. 1
  star1: number; // e.g. 1
}

interface ReviewState {
  // Keyed by productId (or 'default' for fallback)
  reviewsByProduct: Record<string, UserReview[]>;
  getReviews: (productId: string | number) => UserReview[];
  getStats: (productId: string | number) => {
    averageRating: number;
    totalReviews: number;
    breakdown: ReviewBreakdown;
  };
  addReview: (productId: string | number, review: {
    userName: string;
    rating: number;
    comment: string;
    image?: string;
  }) => void;
  toggleHelpful: (productId: string | number, reviewId: string) => void;
}

const DEFAULT_SAREE_REVIEWS: UserReview[] = [
  {
    id: 'rev-1',
    userName: 'Priya Sharma',
    avatarLetter: 'P',
    isVerifiedBuyer: true,
    date: '12 Apr 2025',
    rating: 5,
    comment: 'Beautiful saree! The quality is excellent and the zari work is just perfect. Loved it!',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&auto=format&fit=crop&q=80',
    helpfulCount: 12,
    userVotedHelpful: false,
  },
  {
    id: 'rev-2',
    userName: 'Supriya Das',
    avatarLetter: 'S',
    isVerifiedBuyer: true,
    date: '7 Mar 2025',
    rating: 5,
    comment: 'Very elegant and comfortable to wear. Worth the price.',
    helpfulCount: 8,
    userVotedHelpful: false,
  },
  {
    id: 'rev-3',
    userName: 'Ananya Mukherjee',
    avatarLetter: 'A',
    isVerifiedBuyer: true,
    date: '18 Feb 2025',
    rating: 4,
    comment: 'The fabric drape and finish are royal. Blouse piece provided is sufficient for custom stitching.',
    helpfulCount: 5,
    userVotedHelpful: false,
  },
];

const DEFAULT_GENERIC_REVIEWS: UserReview[] = [
  {
    id: 'rev-g1',
    userName: 'Rohit Verma',
    avatarLetter: 'R',
    isVerifiedBuyer: true,
    date: '15 Mar 2025',
    rating: 5,
    comment: 'Authentic product with top-tier build quality. Delivered in pristine packaging within 2 days.',
    helpfulCount: 14,
    userVotedHelpful: false,
  },
  {
    id: 'rev-g2',
    userName: 'Sneha Patel',
    avatarLetter: 'S',
    isVerifiedBuyer: true,
    date: '28 Feb 2025',
    rating: 5,
    comment: 'Exceeded all expectations! Value for money is unmatched compared to other sellers.',
    helpfulCount: 9,
    userVotedHelpful: false,
  },
];

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      reviewsByProduct: {
        'saree-banarasi': DEFAULT_SAREE_REVIEWS,
        'default': DEFAULT_SAREE_REVIEWS,
      },

      getReviews: (productId: string | number) => {
        const key = String(productId);
        const state = get();
        if (state.reviewsByProduct[key] && state.reviewsByProduct[key].length > 0) {
          return state.reviewsByProduct[key];
        }
        // Fallback reviews depending on product type
        return DEFAULT_SAREE_REVIEWS;
      },

      getStats: (productId: string | number) => {
        const reviews = get().getReviews(productId);
        if (reviews.length === 0) {
          return {
            averageRating: 4.8,
            totalReviews: 124,
            breakdown: { star5: 88, star4: 8, star3: 2, star2: 1, star1: 1 },
          };
        }

        const total = reviews.length;
        let sum = 0;
        let count5 = 0;
        let count4 = 0;
        let count3 = 0;
        let count2 = 0;
        let count1 = 0;

        reviews.forEach((r) => {
          sum += r.rating;
          if (r.rating === 5) count5++;
          else if (r.rating === 4) count4++;
          else if (r.rating === 3) count3++;
          else if (r.rating === 2) count2++;
          else count1++;
        });

        const avg = Number((sum / total).toFixed(1));
        const calcPercent = (count: number) => Math.round((count / total) * 100);

        return {
          averageRating: avg > 0 ? avg : 4.8,
          totalReviews: total >= 3 ? 122 + total : total,
          breakdown: {
            star5: total <= 3 ? 88 : calcPercent(count5),
            star4: total <= 3 ? 8 : calcPercent(count4),
            star3: total <= 3 ? 2 : calcPercent(count3),
            star2: total <= 3 ? 1 : calcPercent(count2),
            star1: total <= 3 ? 1 : calcPercent(count1),
          },
        };
      },

      addReview: (productId, newReviewData) => {
        const key = String(productId);
        const state = get();
        const existingList = state.reviewsByProduct[key]
          ? [...state.reviewsByProduct[key]]
          : [...DEFAULT_SAREE_REVIEWS];

        const dateStr = new Date().toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });

        const newReview: UserReview = {
          id: `rev-${Date.now()}`,
          userName: newReviewData.userName.trim() || 'Verified Buyer',
          avatarLetter: (newReviewData.userName.trim().charAt(0) || 'U').toUpperCase(),
          isVerifiedBuyer: true,
          date: dateStr,
          rating: newReviewData.rating || 5,
          comment: newReviewData.comment.trim(),
          image: newReviewData.image,
          helpfulCount: 0,
          userVotedHelpful: false,
        };

        set({
          reviewsByProduct: {
            ...state.reviewsByProduct,
            [key]: [newReview, ...existingList],
            'default': [newReview, ...existingList],
          },
        });
      },

      toggleHelpful: (productId, reviewId) => {
        const key = String(productId);
        const state = get();
        const existingList = state.reviewsByProduct[key]
          ? [...state.reviewsByProduct[key]]
          : [...DEFAULT_SAREE_REVIEWS];

        const updated = existingList.map((r) => {
          if (r.id === reviewId) {
            const hasVoted = r.userVotedHelpful;
            return {
              ...r,
              helpfulCount: hasVoted ? Math.max(0, r.helpfulCount - 1) : r.helpfulCount + 1,
              userVotedHelpful: !hasVoted,
            };
          }
          return r;
        });

        set({
          reviewsByProduct: {
            ...state.reviewsByProduct,
            [key]: updated,
            'default': updated,
          },
        });
      },
    }),
    {
      name: 'adonik-product-reviews',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
