import { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ADONIK_THEME } from '../../theme/colors';

export default function OtpScreen({ route, navigation }: any) {
  const emailOrPhone = route?.params?.target || 'your registered number';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputsRef = useRef<Array<TextInput | null>>([]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleChange = (text: string, index: number) => {
    const clean = text.replace(/[^0-9]/g, '');
    if (clean.length > 1) {
      const digits = clean.slice(0, 6).split('');
      const updated = [...otp];
      digits.forEach((d, idx) => {
        if (idx < 6) updated[idx] = d;
      });
      setOtp(updated);
      const nextIdx = Math.min(5, digits.length - 1);
      inputsRef.current[nextIdx]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = clean;
    setOtp(newOtp);

    if (clean && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length < 6) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Login');
    }, 1000);
  };

  const handleResend = () => {
    setResending(true);
    setTimeout(() => {
      setResending(false);
    }, 1500);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color={ADONIK_THEME.text} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Verification Code</Text>
          <Text style={styles.subtitle}>
            Please enter the 6-digit code sent to {emailOrPhone}
          </Text>
        </View>

        {/* OTP Input Boxes */}
        <View style={styles.otpRow}>
          {otp.map((digit, i) => (
            <TextInput
              key={i}
              ref={(ref) => { inputsRef.current[i] = ref; }}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
              keyboardType="number-pad"
              maxLength={1}
              value={digit}
              onChangeText={(text) => handleChange(text, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.verifyBtn}
          onPress={handleVerify}
          disabled={loading || otp.join('').length < 6}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.verifyBtnText}>Verify OTP</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Didn't receive code? </Text>
          <TouchableOpacity onPress={handleResend} disabled={resending}>
            <Text style={styles.resendLink}>
              {resending ? 'Sending...' : 'Resend'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: ADONIK_THEME.surface },
  container: { flex: 1, padding: 24 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', marginBottom: 20 },
  header: { marginBottom: 32 },
  title: { fontSize: 26, fontWeight: '600', color: ADONIK_THEME.text },
  subtitle: { fontSize: 14, color: ADONIK_THEME.textSecondary, marginTop: 6, lineHeight: 20 },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpBox: {
    width: 46,
    height: 54,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: ADONIK_THEME.border,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: ADONIK_THEME.text,
    minWidth: 40,
    maxWidth: 48,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  otpBoxFilled: {
    borderColor: ADONIK_THEME.primary,
    backgroundColor: ADONIK_THEME.primaryLight,
  },
  verifyBtn: {
    backgroundColor: ADONIK_THEME.primary,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifyBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  resendText: { color: ADONIK_THEME.textSecondary, fontSize: 14 },
  resendLink: { color: ADONIK_THEME.primary, fontSize: 14, fontWeight: '700' },
});
