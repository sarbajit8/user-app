import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, Linking, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ADONIK_THEME } from '../../theme/colors';

const FAQS = [
  {
    q: 'How do I track my order?',
    a: 'Go to My Orders → tap the order → tap "Track Order". You will see live shipment status with step-by-step tracking.',
  },
  {
    q: 'Can I cancel or modify my order?',
    a: 'You can cancel orders that are still in "Processing" status. Go to My Orders → select the order → tap "Cancel Order". Once shipped, cancellation is not possible.',
  },
  {
    q: 'What is the return & refund policy?',
    a: 'We offer a 7-day return policy on most products. Refunds are processed to the original payment method within 5-7 business days after the return is received.',
  },
  {
    q: 'How do I apply a coupon code?',
    a: 'On the Checkout screen, scroll down to the "Coupon Code" section. Enter your code and tap "Apply". Valid coupons will show the discount instantly.',
  },
  {
    q: 'Why is my payment failing?',
    a: 'Ensure your card details are correct and has sufficient balance. Try a different payment method. If the issue persists, contact your bank or our support team.',
  },
  {
    q: 'How do I change my delivery address?',
    a: 'Go to Profile → My Addresses to add or edit addresses. You can also change the address during checkout before placing the order.',
  },
  {
    q: 'How do I request an invoice for my order?',
    a: 'Open the Order Detail page and tap "Download Invoice". The PDF invoice will be saved to your device downloads folder.',
  },
  {
    q: 'Is my personal data safe?',
    a: 'Yes. We use industry-standard encryption to protect your data. We never share your personal information with third parties without your consent.',
  },
];

const CONTACT_OPTIONS = [
  {
    icon: 'call-outline',
    title: 'Call Us',
    sub: 'Mon–Sat, 9AM–7PM IST',
    value: '1800-123-4567',
    action: () => Linking.openURL('tel:18001234567'),
    color: '#10B981',
    bg: '#ECFDF5',
  },
  {
    icon: 'mail-outline',
    title: 'Email Support',
    sub: 'Response within 24 hours',
    value: 'support@adonik.com',
    action: () => Linking.openURL('mailto:support@adonik.com?subject=Adonik%20Support%20Request'),
    color: '#3B82F6',
    bg: '#EFF6FF',
  },
  {
    icon: 'chatbubble-outline',
    title: 'Live Chat',
    sub: 'Instant response, 24/7',
    value: 'Start Chat',
    action: () => Alert.alert('Live Chat', 'Our support agent will connect with you shortly. Average wait time: 2 minutes.'),
    color: ADONIK_THEME.primary,
    bg: '#FFFBEB',
  },
];

export default function HelpSupportScreen({ navigation }: any) {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);

  const handleSubmitFeedback = () => {
    if (feedbackRating === 0) { Alert.alert('Rate Us', 'Please select a star rating before submitting.'); return; }
    Alert.alert('Thank You! 🙏', 'Your feedback has been submitted. We appreciate your input and will use it to improve your experience.');
    setFeedbackText('');
    setFeedbackRating(0);
  };

  return (
    <SafeAreaView style={s.safeArea}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={ADONIK_THEME.text} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Help & Support</Text>
      </View>

      <ScrollView
        style={s.scrollView}
        contentContainerStyle={s.content}
        showsVerticalScrollIndicator={true}
        bounces={true}
        alwaysBounceVertical={true}
        scrollEventThrottle={16}
      >

        {/* Hero Banner */}
        <View style={s.heroBanner}>
          <View style={s.heroIconBox}>
            <Ionicons name="headset" size={32} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.heroTitle}>How can we help you?</Text>
            <Text style={s.heroSub}>Our support team is available 24/7 to assist you</Text>
          </View>
        </View>

        {/* Contact Options */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Contact Us</Text>
          <View style={s.contactGrid}>
            {CONTACT_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.title}
                style={[s.contactCard, { backgroundColor: opt.bg }]}
                onPress={opt.action}
                activeOpacity={0.85}
              >
                <View style={[s.contactIconBox, { backgroundColor: opt.color }]}>
                  <Ionicons name={opt.icon as any} size={20} color="#FFFFFF" />
                </View>
                <Text style={s.contactTitle}>{opt.title}</Text>
                <Text style={s.contactSub}>{opt.sub}</Text>
                <Text style={[s.contactValue, { color: opt.color }]}>{opt.value}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quick Help */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Quick Help</Text>
          <View style={s.quickGrid}>
            {[
              { icon: 'cube-outline', label: 'Track Order', onPress: () => navigation.navigate('Orders') },
              { icon: 'return-up-back-outline', label: 'Returns & Refunds', onPress: () => Alert.alert('Returns', 'To initiate a return, go to My Orders and select the order you want to return.') },
              { icon: 'card-outline', label: 'Payment Issues', onPress: () => Alert.alert('Payment Help', 'If your payment failed, please check your bank details and try again. Contact us if the issue persists.') },
              { icon: 'location-outline', label: 'Delivery Issues', onPress: () => Alert.alert('Delivery Help', 'For delivery issues, please contact us with your order number. We will resolve it within 24 hours.') },
              { icon: 'pricetag-outline', label: 'Coupon Help', onPress: () => Alert.alert('Coupon Help', 'Coupons can be applied in the Checkout screen. Each coupon has a minimum order value and validity period.') },
              { icon: 'person-outline', label: 'Account Help', onPress: () => navigation.navigate('Settings') },
            ].map((item) => (
              <TouchableOpacity key={item.label} style={s.quickCard} onPress={item.onPress} activeOpacity={0.8}>
                <View style={s.quickIconBox}>
                  <Ionicons name={item.icon as any} size={22} color={ADONIK_THEME.primary} />
                </View>
                <Text style={s.quickLabel}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Accordion */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Frequently Asked Questions</Text>
          <View style={s.faqContainer}>
            {FAQS.map((faq, idx) => (
              <View key={idx}>
                {idx > 0 && <View style={s.faqDivider} />}
                <TouchableOpacity
                  style={s.faqRow}
                  onPress={() => setOpenFaq(openFaq === idx ? null : idx)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.faqQ, openFaq === idx && { color: ADONIK_THEME.primaryDark }]}>
                    {faq.q}
                  </Text>
                  <Ionicons
                    name={openFaq === idx ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={openFaq === idx ? ADONIK_THEME.primary : '#94A3B8'}
                  />
                </TouchableOpacity>
                {openFaq === idx && (
                  <View style={s.faqAnswer}>
                    <Text style={s.faqAnswerText}>{faq.a}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Rate & Feedback */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Rate Your Experience</Text>
          <View style={s.feedbackCard}>
            <Text style={s.feedbackPrompt}>How would you rate the Adonik app?</Text>

            <View style={s.starRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setFeedbackRating(star)} activeOpacity={0.7}>
                  <Ionicons
                    name={feedbackRating >= star ? 'star' : 'star-outline'}
                    size={34}
                    color={feedbackRating >= star ? '#F59E0B' : '#D1D5DB'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {feedbackRating > 0 && (
              <Text style={s.ratingLabel}>
                {feedbackRating === 5 ? '⭐ Excellent!' : feedbackRating === 4 ? '😊 Good' : feedbackRating === 3 ? '😐 Average' : feedbackRating === 2 ? '😕 Poor' : '😞 Very Poor'}
              </Text>
            )}

            <TextInput
              style={s.feedbackInput}
              value={feedbackText}
              onChangeText={setFeedbackText}
              placeholder="Tell us what you think or how we can improve…"
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity style={s.feedbackSubmitBtn} onPress={handleSubmitFeedback} activeOpacity={0.88}>
              <Ionicons name="send" size={15} color="#FFFFFF" style={{ marginRight: 7 }} />
              <Text style={s.feedbackSubmitText}>Submit Feedback</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info Footer */}
        <View style={s.footerCard}>
          <Ionicons name="shield-checkmark" size={20} color="#10B981" style={{ marginBottom: 6 }} />
          <Text style={s.footerTitle}>Adonik Shopping</Text>
          <Text style={s.footerSub}>Version 2.4.0 • Build 2026.09</Text>
          <Text style={s.footerSub}>CIN: U52100WB2024PTC123456</Text>
          <TouchableOpacity
            onPress={() => Alert.alert('Business Hours', 'Monday – Saturday\n9:00 AM – 7:00 PM IST\n\nSunday: Closed')}
            style={{ marginTop: 8 }}
          >
            <Text style={s.footerLink}>Business Hours & Policies →</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    ...(Platform.OS === 'web'
      ? {
          height: '100vh' as any,
          maxHeight: '100vh' as any,
          minHeight: 0,
          overflow: 'hidden' as any,
        }
      : {
          height: '100%',
        }),
  },
  scrollView: {
    flex: 1,
    width: '100%',
    ...(Platform.OS === 'web'
      ? {
          height: '100%' as any,
          maxHeight: '100%' as any,
          overflowY: 'auto' as any,
          WebkitOverflowScrolling: 'touch' as any,
        }
      : {}),
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#F1F3F5',
  },
  backBtn: { padding: 4, marginRight: 10 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: ADONIK_THEME.text },
  content: { padding: 16, gap: 16, paddingBottom: 80 },

  // Hero
  heroBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: ADONIK_THEME.primary, borderRadius: 16, padding: 18,
  },
  heroIconBox: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center',
  },
  heroTitle: { fontSize: 17, fontWeight: '800', color: '#FFFFFF', marginBottom: 4 },
  heroSub: { fontSize: 12.5, color: 'rgba(255,255,255,0.85)', lineHeight: 17 },

  // Section
  section: { gap: 10 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: ADONIK_THEME.text },

  // Contact
  contactGrid: { flexDirection: 'row', gap: 10 },
  contactCard: {
    flex: 1, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center',
  },
  contactIconBox: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  contactTitle: { fontSize: 12.5, fontWeight: '700', color: ADONIK_THEME.text, textAlign: 'center' },
  contactSub: { fontSize: 10, color: '#64748B', textAlign: 'center', marginTop: 2 },
  contactValue: { fontSize: 11.5, fontWeight: '700', textAlign: 'center', marginTop: 6 },

  // Quick Help
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard: {
    width: '30%', backgroundColor: '#FFFFFF', borderRadius: 12,
    padding: 14, alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: '#E2E8F0',
  },
  quickIconBox: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FFFBEB', alignItems: 'center', justifyContent: 'center',
  },
  quickLabel: { fontSize: 11, fontWeight: '600', color: ADONIK_THEME.text, textAlign: 'center' },

  // FAQ
  faqContainer: {
    backgroundColor: '#FFFFFF', borderRadius: 14,
    borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden',
  },
  faqDivider: { height: 1, backgroundColor: '#F1F5F9' },
  faqRow: {
    flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between',
    padding: 16, gap: 10,
  },
  faqQ: { flex: 1, fontSize: 13.5, fontWeight: '600', color: ADONIK_THEME.text, lineHeight: 20 },
  faqAnswer: { paddingHorizontal: 16, paddingBottom: 14, paddingTop: 0 },
  faqAnswerText: {
    fontSize: 13, color: '#475569', lineHeight: 20,
    backgroundColor: '#FFFBEB', padding: 12, borderRadius: 8,
    borderLeftWidth: 3, borderLeftColor: ADONIK_THEME.primary,
  },

  // Feedback
  feedbackCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14,
    borderWidth: 1, borderColor: '#E2E8F0', padding: 16, gap: 12,
  },
  feedbackPrompt: { fontSize: 14, fontWeight: '600', color: ADONIK_THEME.text, textAlign: 'center' },
  starRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  ratingLabel: { fontSize: 14, fontWeight: '700', color: '#F59E0B', textAlign: 'center' },
  feedbackInput: {
    borderWidth: 1.5, borderColor: '#E2E8F0', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 13.5, color: ADONIK_THEME.text, minHeight: 90,
    backgroundColor: '#FAFBFC',
  },
  feedbackSubmitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: ADONIK_THEME.primary, paddingVertical: 13, borderRadius: 12,
  },
  feedbackSubmitText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },

  // Footer
  footerCard: {
    backgroundColor: '#FFFFFF', borderRadius: 14,
    borderWidth: 1, borderColor: '#E2E8F0', padding: 20, alignItems: 'center',
  },
  footerTitle: { fontSize: 15, fontWeight: '700', color: ADONIK_THEME.text },
  footerSub: { fontSize: 11.5, color: '#64748B', marginTop: 4 },
  footerLink: { fontSize: 12.5, color: ADONIK_THEME.primaryDark, fontWeight: '600' },
});
