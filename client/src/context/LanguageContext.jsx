import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const TRANSLATIONS = {
  hi: {
    // Brand & Header
    brand_name: "Smart Cafe",
    brand_tagline: "स्मार्ट कैफे B2B पोर्टल • डिजिटल सेवा केंद्र",
    brand_short_tag: "डिजिटल सेवा केंद्र",
    menu: "मेन्यू",
    close_menu: "मेन्यू बंद करें",
    search_placeholder: "1-क्लिक टूल खोजें (RC, पैन, DL, बिल)...",
    search_no_results: "कोई टूल नहीं मिला।",
    add_money: "+ जोड़ें",
    day_mode: "☀️ दिन",
    night_mode: "🌙 रात",
    day_mode_full: "☀️ दिन मोड",
    night_mode_full: "🌙 रात मोड",
    shopkeeper: "दुकानदार",
    admin: "एडमिन",
    citizen: "नागरिक",
    logout: "लॉगआउट",
    operator: "संचालक",
    staff: "स्टाफ",
    root_admin: "सुपर एडमिन",
    quick_gateway: "⚡ प्रवेश द्वार:",
    offline_alert: "इंटरनेट कनेक्शन बाधित",
    b2b_wallet_title: "संचालक B2B वॉलेट",
    customer_wallet_title: "ग्राहक वॉलेट बैलेंस",
    live_badge: "लाइव",
    add_funds: "+ पैसे जोड़ें",
    search_tools_sidebar: "टूल खोजें: RC, पैन, आधार...",
    live_ready: "● लाइव तैयार",
    register_vle: "नया साइबर कैफ़े जोड़ें (₹299)",

    // Navigation Categories (Pure Hindi)
    cat_dashboard: "1. मुख्य डैशबोर्ड",
    cat_vehicle: "2. वाहन व RTO सेवाएं",
    cat_pan: "3. पैन कार्ड सेवाएं",
    cat_aadhaar: "4. आधार कार्ड सेवाएं",
    cat_voter: "5. वोटर कार्ड सेवाएं",
    cat_welfare: "6. राशन व आयुष्मान सेवाएं",
    cat_utility: "7. बिजली बिल व रसीद सेवाएं",
    cat_edistrict: "8. e-District सत्यापन",
    cat_wallet: "9. वॉलेट एवं पासबुक",
    cat_orders: "10. प्रिंट एवं ऑर्डर हिस्ट्री",
    cat_operator_ctrl: "ऑपरेटर कंट्रोल",

    // Navigation Items
    nav_dashboard: "मुख्य डैशबोर्ड",
    nav_rc: "वाहन RC टू PDF / PVC",
    nav_dl: "ड्राइविंग लाइसेंस PVC",
    nav_challan: "वाहन ई-चालान जांच एवं रसीद",
    nav_pan: "इंस्टेंट पैन कार्ड CR-80 PVC",
    nav_epan: "ई-पैन कार्ड डिजिटल डाउनलोड",
    nav_aadhaar: "एडवांस आधार CR-80 PVC कार्ड",
    nav_voter: "डिजिटल वोटर स्मार्ट कार्ड",
    nav_ayushman: "आयुष्मान भारत गोल्डन कार्ड",
    nav_ration: "राशन कार्ड पर्चा / NFSA स्लिप",
    nav_electricity: "बिजली बिल भुगतान रसीद",
    nav_receipt: "जन सेवा केंद्र बिल रसीद",
    nav_edistrict: "e-District सत्यापन प्रमाण पत्र",
    nav_wallet: "वॉलेट एवं पासबुक विवरण",
    nav_orders: "प्रिंट एवं ऑर्डर हिस्ट्री",
    nav_queue: "लाइव ग्राहक प्रिंट कतार",
    nav_cashbook: "दैनिक रोकड़ बही",
    nav_udhar: "उधार खाता",
    nav_standee: "दुकान QR स्टैन्डी पोस्टर",
    nav_settings: "कैफे सेटिंग्स एवं रेट कार्ड",

    // Dashboard Sections
    instant_tools_heading: "1-क्लिक इंस्टेंट PVC व प्रिंट टूल्स",
    instant_tools_sub: "किसी भी सेवा पर क्लिक करें — तुरंत स्वचालित कार्ड, पर्ची व PDF तैयार करें।",
    category_suites_heading: "विस्तृत सेवा श्रेणियां",
    category_suites_sub: "श्रेणी चुनें — सभी संबंधित टूल्स व विकल्पों के साथ पूर्ण सेवा खुलेगी।",
    wholesale_rate: "थोक",
    retail_rate: "खुदरा",
    wholesale_badge_prefix: "थोक:",
    retail_badge_prefix: "खुदरा:",
    launch_service: "⚡ शुरू करें",
    tools_included: "टूल्स शामिल",
    recent_orders_title: "हाल के सफल कार्ड व प्रिंट ऑर्डर",
    recent_orders_sub: "आपके द्वारा बनाए गए सभी कार्ड यहाँ सुरक्षित हैं। 1-क्लिक में कभी भी निःशुल्क रीप्रिंट करें।",
    free_reprint: "निःशुल्क रीप्रिंट",
    view_all_history: "पूरी हिस्ट्री देखें",
    order_id: "ऑर्डर आईडी",
    service_name: "सेवा नाम",
    customer_name: "ग्राहक नाम",
    charges: "शुल्क",
    date_time: "दिनांक व समय",
    action: "कार्रवाई",
    reprint: "रीप्रिंट",
    no_orders_yet: "अभी तक कोई ऑर्डर नहीं हुआ है।",

    // Customer Home
    welcome_banner_tag: "डिजिटल भारत • आपका स्मार्ट डिजिटल सेवा केंद्र",
    quick_print_btn: "तुरंत प्रिंट निकालें",
    govt_forms_btn: "सरकारी फॉर्म भरवाएं",
    counter_qr_btn: "काउंटर QR कोड",
    card_print_title: "क्विक प्रिंट व ज़ेरॉक्स",
    card_print_desc: "PDF, Word या फ़ोटो अपलोड करें। ब्लैक एंड व्हाइट या रंगीन चुनें और सीधे काउंटर से प्रिंट लें।",
    card_print_action: "प्रिंट शुरू करें",
    card_apply_title: "सरकारी योजनाएं व फॉर्म",
    card_apply_desc: "राशन, आय/जाति/निवास, छात्रवृत्ति, किसान सम्मान निधि व सभी सरकारी ऑनलाइन आवेदन।",
    card_apply_action: "फॉर्म भरवाएं",
    card_track_title: "आवेदन स्थिति ट्रैकर",
    card_track_desc: "अपने आवेदन क्रमांक या मोबाइल नंबर से फॉर्म की वर्तमान स्थिति जांचें।",
    card_track_action: "स्थिति देखें",
    card_rc_title: "RC व वाहन सेवाएं",
    card_rc_desc: "परिवहन RC, ड्राइविंग लाइसेंस PVC स्मार्ट कार्ड व ई-चालान रसीद तुरंत पाएं।",
    card_rc_action: "RC डाउनलोड करें",
    shredder_title: "गोपनीयता सुरक्षा: तत्काल दस्तावेज़ नष्टकर्ता",
    shredder_desc: "प्रिंट पूरा होने के बाद अपना टोकन नंबर दर्ज करें और अपनी संवेदनशील फाइल तुरंत मिटाएं।",
    shred_btn: "दस्तावेज़ नष्ट करें",
    shredding: "नष्ट किया जा रहा है...",

    // Quick Print
    quick_print_title: "क्विक प्रिंट व ज़ेरॉक्स",
    quick_print_sub: "फ़ाइल अपलोड करें, प्रिंट सेटिंग्स चुनें, और काउंटर पर टोकन दिखाकर 1 मिनट में प्रिंट पाएं।",
    qp_superfast_badge: "सुपरफास्ट सेल्फ सर्विस",
    qp_current_rates: "वर्तमान दरें",
    qp_upload_step: "1. फ़ाइल चुनें",
    qp_upload_drag: "यहाँ क्लिक करके फ़ाइल चुनें या ड्रैग करें",
    qp_upload_hint: "PDF, Word, आधार स्कैन, फोटो (अधिकतम 25MB)",
    qp_file_selected: "फ़ाइल चुनी गई",
    qp_change_file: "दूसरी फ़ाइल बदलना चाहते हैं? क्लिक करें",
    qp_live_photo_btn: "📸 फोन कैमरे से सीधा फोटो खींचें",
    qp_print_options_step: "2. प्रिंट विकल्प",
    qp_color_type_label: "रंग चयन",
    qp_bw_option: "ब्लैक एंड व्हाइट",
    qp_bw_sub: "सामान्य प्रिंट",
    qp_color_option: "रंगीन प्रिंट",
    qp_color_sub: "फोटो / आईडी / रंगीन",
    qp_pages_count_label: "पेज संख्या",
    qp_copies_label: "प्रतियां",
    qp_sides_label: "प्रिंट साइड",
    qp_single_side: "1 तरफ",
    qp_double_side: "दोनों तरफ",
    qp_paper_size_label: "कागज़ आकार",
    qp_size_a4: "A4 मानक",
    qp_size_legal: "लीगल कचहरी",
    qp_size_photo: "4×6 फोटो",
    qp_page_range_label: "पेज रेंज",
    qp_page_range_hint: "पेज संख्या दर्ज करें (सभी अथवा 1-5)",
    qp_notes_label: "विशेष निर्देश",
    qp_notes_hint: "विशेष निर्देश (वैकल्पिक)",
    qp_customer_step: "3. आपकी जानकारी",
    qp_name_label: "आपका पूरा नाम",
    qp_name_hint: "आपका पूरा नाम दर्ज करें",
    qp_phone_label: "मोबाइल नंबर",
    qp_phone_hint: "10-अंकीय मोबाइल नंबर दर्ज करें",
    qp_rate_label: "रेट प्रति पेज:",
    qp_total_pages_copies: "कुल पेज × प्रतियां:",
    qp_total_amount_label: "कुल देय राशि:",
    qp_pay_mode_label: "भुगतान का तरीका",
    qp_pay_counter: "काउंटर पर नकद",
    qp_pay_upi: "ऑनलाइन UPI",
    qp_scan_pay: "स्कैन करके भुगतान करें",
    qp_submit_btn: "प्रिंट रिक्वेस्ट भेजें",
    qp_submitting: "प्रिंट रिक्वेस्ट जा रही है...",
    qp_privacy_banner: "🔒 100% डेटा प्राइवेसी: आपके दस्तावेज़ प्रिंट के बाद 24 घंटे में स्वतः नष्ट हो जाते हैं।",

    // Service Page & Tools
    back_btn: "वापस",
    auto_generate: "स्वचालित तैयार करें",
    download_pvc_pdf: "PVC कार्ड PDF डाउनलोड",
    direct_print: "सीधा प्रिंट करें",
    clear_form: "फॉर्म रीसेट",
    preview_card: "कार्ड पूर्वावलोकन",
    card_front: "सामने का भाग",
    card_back: "पीछे का भाग",
    sp_preview_heading: "आधिकारिक ISO CR-80 PVC स्मार्ट कार्ड प्रीव्यू",
    sp_preview_sub: "85.6mm × 54mm मानक आयाम • कटिंग मार्क्स एवं सत्यापित QR कोड सहित",
    sp_card_both: "दोनों तरफ",
    sp_card_front: "सामने का भाग",
    sp_card_back: "पीछे का भाग",
    sp_btn_print: "प्रिंट निकालें",
    sp_btn_download_pdf: "HD PDF डाउनलोड",
    sp_btn_generate: "⚡ 1-क्लिक जनरेट करें",
    sp_generating: "जनरेट हो रहा है...",
    sp_applicant_name: "आवेदक का पूरा नाम",
    sp_father_husband_name: "पिता / पति का नाम",
    sp_dob_label: "जन्म तिथि",
    sp_gender_label: "लिंग",
    sp_gender_male: "पुरुष",
    sp_gender_female: "महिला",
    sp_gender_other: "अन्य",
    sp_address_label: "पूरा स्थायी पता",
    sp_photo_sign_select: "स्मार्ट कार्ड फ़ोटो एवं हस्ताक्षर चयन",
    sp_live_preview: "लाइव कार्ड प्रीव्यू",
    sp_photo_choose: "फ़ोटो चुनें अथवा अपनी अपलोड करें:",
    sp_sign_choose: "हस्ताक्षर:",
    sp_photo_male: "पुरुष",
    sp_photo_female: "महिला",
    sp_photo_senior: "वरिष्ठ",
    sp_upload: "अपलोड",
    sp_sign_1: "मानक 1",
    sp_sign_2: "मानक 2",
    sp_history_title: "प्रिंट एवं ऑर्डर इतिहास",
    sp_history_sub: "पूर्व में जनरेट किए गए कार्ड कभी भी 1-क्लिक में बिना वॉलेट काटे रिप्रिंट करें।",
    sp_search_history_hint: "नंबर या नाम खोजें...",
    sp_no_history: "इस सेवा के लिए अभी तक कोई दस्तावेज़ जनरेट नहीं हुआ है। बायीं तरफ फ़ॉर्म भरकर जनरेट करें।",
    sp_th_order_id: "ऑर्डर ID",
    sp_th_desc: "विवरण",
    sp_th_card_ref: "कार्ड / संदर्भ",
    sp_th_date: "दिनांक",
    sp_th_fee: "शुल्क",
    sp_th_reprint: "निःशुल्क रिप्रिंट",
    sp_btn_reprint: "रिप्रिंट",

    // Bottom Navigation (Mobile)
    bottom_home: "होम",
    bottom_print: "प्रिंट",
    bottom_apply: "फॉर्म",
    bottom_track: "ट्रैकर",
    bottom_rc: "RC कार्ड"
  },

  en: {
    // Brand & Header
    brand_name: "Smart Cafe",
    brand_tagline: "Smart Cafe B2B Portal • Digital Service Hub",
    brand_short_tag: "Digital Service Hub",
    menu: "Menu",
    close_menu: "Close Menu",
    search_placeholder: "Search 1-click tools (RC, PAN, DL, Bill)...",
    search_no_results: "No tools found.",
    add_money: "+ Add",
    day_mode: "☀️ Day",
    night_mode: "🌙 Night",
    day_mode_full: "☀️ Day Mode",
    night_mode_full: "🌙 Night Mode",
    shopkeeper: "Shopkeeper",
    admin: "Admin",
    citizen: "Citizen",
    logout: "Logout",
    operator: "Operator",
    staff: "Staff",
    root_admin: "Super Admin",
    quick_gateway: "⚡ Quick Gateway:",
    offline_alert: "Internet Connection Lost",
    b2b_wallet_title: "Operator B2B Wallet",
    customer_wallet_title: "Customer Wallet Balance",
    live_badge: "Live",
    add_funds: "+ Add Money",
    search_tools_sidebar: "Search tools: RC, PAN, Aadhaar...",
    live_ready: "● Live Ready",
    register_vle: "Register New Cyber Cafe (₹299)",

    // Navigation Categories (Pure English)
    cat_dashboard: "1. Main Dashboard",
    cat_vehicle: "2. Vehicle & RTO Services",
    cat_pan: "3. PAN Card Services",
    cat_aadhaar: "4. Aadhaar Card Services",
    cat_voter: "5. Voter ID Services",
    cat_welfare: "6. Food & Health Welfare",
    cat_utility: "7. Electricity & Receipts",
    cat_edistrict: "8. e-District Verification",
    cat_wallet: "9. Wallet & Passbook",
    cat_orders: "10. Print & Order History",
    cat_operator_ctrl: "Operator Controls",

    // Navigation Items
    nav_dashboard: "Main Dashboard",
    nav_rc: "Vehicle RC to PDF / PVC",
    nav_dl: "Driving Licence PVC",
    nav_challan: "Vehicle e-Challan & Receipt",
    nav_pan: "Instant PAN Card CR-80 PVC",
    nav_epan: "e-PAN Card Digital Download",
    nav_aadhaar: "Advance Aadhaar CR-80 PVC",
    nav_voter: "Digital Voter Smart Card",
    nav_ayushman: "Ayushman Bharat Golden Card",
    nav_ration: "Ration Card / NFSA Slip",
    nav_electricity: "Electricity Bill Receipt",
    nav_receipt: "Cyber Cafe Cash Receipt",
    nav_edistrict: "e-District Verification Slip",
    nav_wallet: "Wallet & Passbook Details",
    nav_orders: "Print & Order History",
    nav_queue: "Live Print Queue",
    nav_cashbook: "Daily Cashbook",
    nav_udhar: "Udhar Register",
    nav_standee: "Shop QR Standee Poster",
    nav_settings: "Cafe Settings & Rate Card",

    // Dashboard Sections
    instant_tools_heading: "1-Click Instant PVC & Print Tools",
    instant_tools_sub: "Click any service — generate instant smart cards, slips, and PDFs automatically.",
    category_suites_heading: "Comprehensive Service Suites",
    category_suites_sub: "Choose a category — opens the full portal with all related tools and options.",
    wholesale_rate: "Wholesale",
    retail_rate: "Retail",
    wholesale_badge_prefix: "Wholesale:",
    retail_badge_prefix: "Retail:",
    launch_service: "⚡ Launch",
    tools_included: "Tools Included",
    recent_orders_title: "Recent Successful Orders",
    recent_orders_sub: "All generated cards are stored securely. 1-click free reprinting anytime.",
    free_reprint: "Free Reprint",
    view_all_history: "View Full History",
    order_id: "Order ID",
    service_name: "Service Name",
    customer_name: "Customer Name",
    charges: "Charges",
    date_time: "Date & Time",
    action: "Action",
    reprint: "Reprint",
    no_orders_yet: "No orders placed yet.",

    // Customer Home
    welcome_banner_tag: "Digital India • Your Smart Digital Service Hub",
    quick_print_btn: "Quick Print Now",
    govt_forms_btn: "Apply Govt Forms",
    counter_qr_btn: "Counter QR Code",
    card_print_title: "Quick Print & Xerox",
    card_print_desc: "Upload PDF, Word or Photo. Choose Black & White or Color and collect prints directly at counter.",
    card_print_action: "Start Printing",
    card_apply_title: "Government Schemes & Forms",
    card_apply_desc: "Ration card, Income/Caste/Domicile certificates, scholarship, and public welfare applications.",
    card_apply_action: "Apply for Forms",
    card_track_title: "Application Status Tracker",
    card_track_desc: "Check live status of your submitted application using your tracking number or mobile.",
    card_track_action: "Track Status",
    card_rc_title: "RC & Vehicle Services",
    card_rc_desc: "Download Parivahan RC, Driving Licence CR-80 PVC cards and official traffic e-challan receipts.",
    card_rc_action: "Download RC",
    shredder_title: "Privacy Shield: Instant Document Shredder",
    shredder_desc: "Enter your print token number to permanently erase uploaded documents immediately after printing.",
    shred_btn: "Shred Document",
    shredding: "Shredding...",

    // Quick Print
    quick_print_title: "Instant Print & Xerox",
    quick_print_sub: "Upload your document, select print preferences, and collect instantly at the counter.",
    qp_superfast_badge: "Superfast Self Service",
    qp_current_rates: "Current Rates",
    qp_upload_step: "1. Choose Document",
    qp_upload_drag: "Click here to browse or drag and drop file here",
    qp_upload_hint: "PDF, Word Documents, Aadhaar Scan, Photos (Max 25MB)",
    qp_file_selected: "File Selected",
    qp_change_file: "Want to change file? Click here",
    qp_live_photo_btn: "📸 Capture Live Document via Camera",
    qp_print_options_step: "2. Print Options",
    qp_color_type_label: "Color Type",
    qp_bw_option: "Black & White",
    qp_bw_sub: "Standard Monochrome",
    qp_color_option: "Color Print",
    qp_color_sub: "Photo / ID / Color",
    qp_pages_count_label: "Page Count",
    qp_copies_label: "Copies",
    qp_sides_label: "Print Side",
    qp_single_side: "Single Sided",
    qp_double_side: "Both Sides",
    qp_paper_size_label: "Paper Size",
    qp_size_a4: "A4 Standard",
    qp_size_legal: "Legal Size",
    qp_size_photo: "4×6 Photo",
    qp_page_range_label: "Page Range",
    qp_page_range_hint: "Enter page numbers (All or 1-5)",
    qp_notes_label: "Special Instructions",
    qp_notes_hint: "Special instructions (optional)",
    qp_customer_step: "3. Customer Information",
    qp_name_label: "Your Full Name",
    qp_name_hint: "Enter your full name",
    qp_phone_label: "Mobile Number",
    qp_phone_hint: "Enter 10-digit mobile number",
    qp_rate_label: "Rate per page:",
    qp_total_pages_copies: "Total pages × copies:",
    qp_total_amount_label: "Total Amount:",
    qp_pay_mode_label: "Payment Method",
    qp_pay_counter: "Cash at Counter",
    qp_pay_upi: "Online UPI",
    qp_scan_pay: "Scan and Pay",
    qp_submit_btn: "Submit Print Request",
    qp_submitting: "Submitting print request...",
    qp_privacy_banner: "🔒 100% Data Privacy: Your documents are permanently deleted after 24 hours.",

    // Service Page & Tools
    back_btn: "Back",
    auto_generate: "Auto Generate",
    download_pvc_pdf: "Download PVC Card PDF",
    direct_print: "Direct Print",
    clear_form: "Reset Form",
    preview_card: "Card Preview",
    card_front: "Front Side",
    card_back: "Back Side",
    sp_preview_heading: "Official ISO CR-80 PVC Smart Card Preview",
    sp_preview_sub: "85.6mm × 54mm Standard CR-80 • Includes Cutting Marks & Verified QR",
    sp_card_both: "Both Sides",
    sp_card_front: "Front Side",
    sp_card_back: "Back Side",
    sp_btn_print: "Print Card",
    sp_btn_download_pdf: "Download HD PDF",
    sp_btn_generate: "⚡ 1-Click Generate",
    sp_generating: "Generating...",
    sp_applicant_name: "Applicant Full Name",
    sp_father_husband_name: "Father / Husband Name",
    sp_dob_label: "Date of Birth",
    sp_gender_label: "Gender",
    sp_gender_male: "Male",
    sp_gender_female: "Female",
    sp_gender_other: "Other",
    sp_address_label: "Full Permanent Address",
    sp_photo_sign_select: "Smart Card Photo & Signature Selection",
    sp_live_preview: "Live Card Preview",
    sp_photo_choose: "Choose preset photo or upload yours:",
    sp_sign_choose: "Signature:",
    sp_photo_male: "Male",
    sp_photo_female: "Female",
    sp_photo_senior: "Senior",
    sp_upload: "Upload",
    sp_sign_1: "Preset 1",
    sp_sign_2: "Preset 2",
    sp_history_title: "Print & Order History",
    sp_history_sub: "Reprint previously generated cards anytime in 1-click at zero additional cost.",
    sp_search_history_hint: "Search by number or name...",
    sp_no_history: "No cards generated for this service yet. Fill the form on the left to generate.",
    sp_th_order_id: "Order ID",
    sp_th_desc: "Description",
    sp_th_card_ref: "Card / Reference",
    sp_th_date: "Date",
    sp_th_fee: "Fee",
    sp_th_reprint: "Free Reprint",
    sp_btn_reprint: "Reprint",

    // Bottom Navigation (Mobile)
    bottom_home: "Home",
    bottom_print: "Print",
    bottom_apply: "Forms",
    bottom_track: "Tracker",
    bottom_rc: "RC Card"
  }
};

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('app_language');
        if (saved === 'hi' || saved === 'en') return saved;
      } catch (e) {}
    }
    return 'hi';
  });

  const setLanguage = (lang) => {
    if (lang !== 'hi' && lang !== 'en') return;
    setLanguageState(lang);
    try {
      localStorage.setItem('app_language', lang);
    } catch (e) {}
  };

  const toggleLanguage = () => {
    setLanguage(language === 'hi' ? 'en' : 'hi');
  };

  const t = (key, fallback = '') => {
    if (!key) return '';
    const dict = TRANSLATIONS[language] || TRANSLATIONS.hi;
    if (dict && dict[key] !== undefined) {
      return dict[key];
    }
    if (TRANSLATIONS.en && TRANSLATIONS.en[key] !== undefined) {
      return TRANSLATIONS.en[key];
    }
    return fallback || key;
  };

  const localize = (val) => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object') {
      return val[language] || val.hi || val.en || '';
    }
    return String(val);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t, localize }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      language: 'hi',
      setLanguage: () => {},
      toggleLanguage: () => {},
      t: (k, fb) => fb || k,
      localize: (v) => (typeof v === 'object' ? (v?.hi || v?.en || '') : v)
    };
  }
  return ctx;
}
