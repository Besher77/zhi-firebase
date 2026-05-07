import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      nav: { home: "HOME", shop: "SHOP", product: "PRODUCT", pages: "PAGES", blog: "BLOG", search: "Rate Your Keyword" },
      hero: { subtitle: "New Collection", title1: "Start Your Day", title2: "With a Black Coffee", explore: "Explore Now" },
      benefits: {
        process: "Our Process", title: "BENEFITS OF COFFEE",
        desc: "Ah, coffee. Whether you're cradling a travel mug on your way to work or dashing out after spin class to refuel with a skinny latte, it's hard to imagine a day without it.",
        l1: "Gives energy and improves thinking", l2: "Promote heart health.", l3: "Coffee Protects Against Depression", l4: "Coffee Contains Antioxidants",
        r1: "Coffee May Give Your Workout a Boost", r2: "May promote weight management", r3: "Could increase energy levels", r4: "Reduced risk of Parkinson's"
      },
      categories: { c1: "Instant Coffee Cappuccino", c2: "Arabica Coffee Beans", c3: "Coffee Making" },
      bestselling: { title: "Best Selling", t1: "Ground Coffee", t2: "Instant Coffee", t3: "Coffee Beans" },
      products: { p1: "Creative Coffee", p2: "Culi Coffee Beans", p3: "Brazilian Coffee Beans", p4: "Instant Espresso" },
      coffeeTypes: {
        arabica: "Arabica Coffee", robusta: "Robusta Coffee",
        arabicaDesc: "Coffea arabica, also known as the Arabic coffee, is a species of flowering plant in the coffee and madder family Rubiaceae. It is believed to be the first species of coffee to have been cultivated and is currently the dominant cultivar, representing about 60% of global production.",
        robustaDesc: "Coffea canephora, commonly known as robusta coffee, is a species of coffee that has its origins in central and western sub-Saharan Africa. It is a species of flowering plant in the family Rubiaceae.",
        altitude: "Altitude", temp: "Temperature", caffeine: "Caffeine", production: "Production"
      },
      why: { title: "WHY CHOOSE US", items: [
        { title: "Premium Quality Beans", desc: "We hand-pick the finest beans from organic farms to ensure a rich and unique coffee experience." },
        { title: "Expert Roasting", desc: "Our master roasters craft every batch with precision, bringing out the perfect flavour profile in every cup." },
        { title: "Sustainable Sourcing", desc: "We work directly with farmers to ensure ethical sourcing and a positive impact on local communities." },
        { title: "Fresh Delivery", desc: "Every order is roasted fresh and delivered quickly so you always enjoy coffee at its peak flavour." }
      ]},
      featured: { tag: "Featured Product", title: "Coffee Machine", product: "Espresso and Cappuccino Machine", desc: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.", s1: "Generate 15 Bar Pressure", s2: "Powerfull 1100W Motor", s3: "58mm Brewing Ground Head", s4: "2L Water Tank Capacity", s5: "2 Years Warranty", buy: "Buy Now", learn: "Learn More" },
      story: { tag: "Our Story", title: "HOW IS COFFEE PREPARED?", desc: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium." },
      testimonials: { tag: "WHAT CUSTOMER SAY ABOUT US", quote: "\"ZHI Coffee beans are a staple in my pantry. They are a healthier alternative to traditional blends, but still satisfy my craving for something rich and crunchy. Chilli garlic flavor is my personal favorite - it's so delicious!\"", user: "Jennifer - From California" },
      footer: { subscribe: "SUBSCRIBE", subDesc: "Sign up for newsletter to receive special offers and exclusive news about ZHI Coffee products", placeholder: "ENTER YOUR EMAIL", btn: "SUBSCRIBE", orders: "ORDERS AND RETURNS", myacct: "MY ACCOUNT", desc: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas sed dui tempor eros porttitor tristique eget eu lectus.", rights: "© 2026 ZHI Coffee. All Rights Reserved.", helpLink: "Help and advice", shippingLink: "Shipping & Returns", termsLink: "Terms and conditions", returnLink: "Return & Exchange Policy", refundLink: "Refund Policy", location: "Taif, Saudi Arabia", commercialReg: "Commercial Registration", licensedBy: "Licensed by Saudi Ministry of Commerce", securePayment: "Secure Payment Methods", login: "Login", register: "Register Account", myOrders: "My Orders", myWishlist: "My Wishlist", myAddresses: "My Addresses" },
      auth: {
        signIn: "Sign In", signUp: "Sign Up", profile: "My Profile",
        name: "Full Name", email: "Email Address", password: "Password", phone: "Phone Number (e.g. 5xxxxxxxx)",
        loginBtn: "Login", registerBtn: "Create Account", logoutBtn: "Log Out",
        noAccount: "Don't have an account?", hasAccount: "Already have an account?",
        welcome: "Welcome back", orders: "My Orders", settings: "Settings",
        adminDash: "Admin Dashboard",
        errors: {
          invalidPhone: "Invalid phone number. Start with 5 and ensure 9 digits.",
          weakPassword: "Password should be at least 6 characters.",
          emailInUse: "Email is already in use.",
          invalidEmail: "Invalid email address.",
          wrongPassword: "Incorrect credentials.",
          userNotFound: "No user found with this email.",
          default: "An error occurred during authentication."
        }
      },
      admin: {
        title: "ZHI ADMIN",
        management: "Management", overview: "Overview", products: "Products", orders: "Orders", users: "Users", settings: "Settings", signOut: "Sign Out",
        loggedInAs: "Logged in as",
        kpis: { users: "Total Users", orders: "Total Orders", revenue: "Revenue", sessions: "Active Sessions", fromLastMonth: "from last month" },
        underConstruction: "This section is under construction.",
        functionalList: "The fully functional list and forms for {{module}} will appear here."
      },
      pages: {
        help: "Help and advice",
        shipping: "Shipping & Returns",
        terms: "Terms and conditions",
        refund: "Refund Policy",
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris. Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor. Ut in nulla enim. Phasellus molestie magna non est bibendum non venenatis nisl tempor. Suspendisse dictum feugiat nisl ut dapibus."
      },
      search: {
        title: "Search Results",
        resultsFor: "Results for",
        noResults: "No products found matching your search.",
        emptyQuery: "Please enter a search term."
      }
    }
  },
  ar: {
    translation: {
      nav: { home: "الرئيسية", shop: "المتجر", product: "المنتجات", pages: "الصفحات", blog: "المدونة", search: "ابحث هنا..." },
      hero: { subtitle: "تشكيلة جديدة", title1: "ابدأ يومك", title2: "بقهوة سوداء", explore: "استكشف الآن" },
      benefits: {
        process: "عمليتنا", title: "فوائد القهوة",
        desc: "آه، القهوة. سواء كنت تحتضن كوب السفر في طريقك إلى العمل أو تندفع بعد النادي لإنعاش طاقتك بلاتيه خفيف، من الصعب تخيل يوم بدونها.",
        l1: "تمنح الطاقة وتحسن التفكير", l2: "تعزز صحة القلب", l3: "تحمي من الاكتئاب", l4: "تحتوي على مضادات أكسدة",
        r1: "قد تعزز أداءك الرياضي", r2: "تساعد في التحكم بالوزن", r3: "تزيد من مستويات النشاط", r4: "تقلل خطر الشلل الرعاش"
      },
      categories: { c1: "كابتشينو سريع التحضير", c2: "حبوب البن العربي كولومبي", c3: "أدوات تحضير القهوة" },
      bestselling: { title: "الأكثر مبيعاً", t1: "القهوة المطحونة", t2: "سريعة التحضير", t3: "حبوب القهوة" },
      products: { p1: "قهوة إبداعية", p2: "حبوب كولي", p3: "بن برازيلي مختص", p4: "اسبريسو سريع التحضير" },
      coffeeTypes: {
        arabica: "القهوة العربية (أرابيكا)", robusta: "قهوة روبوستا",
        arabicaDesc: "البن العربي (أرابيكا) هو نوع من النباتات المزهرة في عائلة الفوة. يُعتقد أنه أول نوع من القهوة يتم زراعته وهو حاليًا الصنف المهيمن، ويمثل حوالي 60٪ من الإنتاج العالمي.",
        robustaDesc: "بن كانيفورا، المعروف باسم قهوة روبوستا، هو نوع من القهوة تعود أصوله إلى وسط وغرب إفريقيا جنوب الصحراء. يتميز بنكهته القوية ومقاومته العالية.",
      },
      why: { title: "لماذا تختارنا", items: [
        { title: "حبوب عالية الجودة", desc: "نحن ننتقي أفضل الحبوب من المزارع العضوية لضمان تجربة قهوة غنية وفريدة لمحبي المذاق الأصيل." },
        { title: "تحميص احترافي", desc: "يصنع محمّصونا المهرة كل دفعة بدقة متناهية لاستخلاص النكهة المثالية في كل كوب." },
        { title: "مصادر مستدامة", desc: "نتعاون مباشرة مع المزارعين لضمان الاستيراد الأخلاقي وتحقيق أثر إيجابي على المجتمعات المحلية." },
        { title: "توصيل طازج", desc: "يُحمَّص كل طلب طازجاً ويُسلَّم بسرعة لتستمتع دائماً بقهوتك في أوج نضارتها." }
      ]},
      featured: { tag: "منتج مميز", title: "آلة تحضير القهوة", product: "آلة اسبريسو وكابتشينو متطورة", desc: "استمتع بتحضير قهوتك المفضلة في المنزل باحترافية وسهولة مع آلتنا المتطورة التي تضمن لك استخلاصاً مثالياً.", s1: "تولد ضغط 15 بار", s2: "محرك قوي 1100 واط", s3: "رأس تخمير 58 ملم", s4: "خزان مياه بسعة 2 لتر", s5: "ضمان لمدة عامين", buy: "اشتري الآن", learn: "اعرف المزيد" },
      story: { tag: "قصتنا", title: "كيف تُحضر القهوة؟", desc: "نأخذك في رحلة ممتعة من قطف حبوب البن وحتى وصول اللذة إلى كوبك المنعش." },
      testimonials: { tag: "ماذا يقول عملاؤنا", quote: "\"قهوة ZHI Coffee أصبحت أساسية في يومي. المذاق الغني والتحميص المثالي يجعل كل صباح تجربة رائعة لا تُنسى. نكهة البندق هي المفضلة لدي حقاً!\"", user: "جينيفر - من كاليفورنيا" },
      footer: { subscribe: "الاشتراك", subDesc: "اشترك في نشرتنا البريدية لتتلقى عروضاً خاصة وأخباراً حصرية حول منتجات ZHI Coffee.", placeholder: "أدخل بريدك الإلكتروني", btn: "اشتراك", orders: "الطلبات والاسترجاع", myacct: "حسابي", desc: "ZHI Coffee هي وجهتك الأولى لاستكشاف عالم القهوة المختصة بأفضل المعايير العالمية. نحن نهتم بكل التفاصيل لأجلك.", rights: "© 2026 ZHI Coffee. جميع الحقوق محفوظة.", helpLink: "المساعدة والنصائح", shippingLink: "الشحن والاسترجاع", termsLink: "الشروط والأحكام", returnLink: "سياسة الاستبدال والاسترجاع", refundLink: "سياسة الاسترداد", location: "الطائف، المملكة العربية السعودية", commercialReg: "السجل التجاري", licensedBy: "مرخص من وزارة التجارة السعودية", securePayment: "طرق دفع آمنة", login: "تسجيل الدخول", register: "إنشاء حساب جديد", myOrders: "طلباتي", myWishlist: "المفضلة", myAddresses: "عناويني" },
      auth: {
        signIn: "تسجيل الدخول", signUp: "حساب جديد", profile: "ملفي الشخصي",
        name: "الاسم الكامل", email: "البريد الإلكتروني", password: "كلمة المرور", phone: "رقم الهاتف (مثال: 5xxxxxxxx)",
        loginBtn: "دخول", registerBtn: "إنشاء حساب", logoutBtn: "تسجيل خروج",
        noAccount: "ليس لديك حساب؟", hasAccount: "لديك حساب بالفعل؟",
        welcome: "مرحباً بعودتك", orders: "طلباتي", settings: "الإعدادات",
        adminDash: "لوحة تحكم الإدارة",
        errors: {
          invalidPhone: "تنسيق رقم الهاتف غير صالح. ابدأ بـ 5 وتأكد من كتابة 9 أرقام.",
          weakPassword: "يجب أن لا تقل كلمة المرور عن 6 أحرف.",
          emailInUse: "البريد الإلكتروني مستخدم بالفعل.",
          invalidEmail: "عنوان البريد الإلكتروني غير صالح.",
          wrongPassword: "بيانات الدخول غير صحيحة.",
          userNotFound: "لم يتم العثور على مستخدم بهذا البريد الإلكتروني.",
          default: "حدث خطأ أثناء المصادقة."
        }
      },
      admin: {
        title: "إدارة ZHI",
        management: "إدارة", overview: "نظرة عامة", products: "المنتجات", orders: "الطلبات", users: "المستخدمين", settings: "الإعدادات", signOut: "تسجيل الخروج",
        loggedInAs: "مسجل الدخول كـ",
        kpis: { users: "إجمالي المستخدمين", orders: "إجمالي الطلبات", revenue: "الإيرادات", sessions: "الجلسات النشطة", fromLastMonth: "عن الشهر الماضي" },
        underConstruction: "هذا القسم قيد الإنشاء.",
        functionalList: "ستظهر القوائم والنماذج الفعالة لـ {{module}} هنا قريباً."
      },
      pages: {
        help: "المساعدة والنصائح",
        shipping: "الشحن والاسترجاع",
        terms: "الشروط والأحكام",
        refund: "سياسة الاسترجاع",
        content: "هذا النص هو مثال لنص يمكن أن يستبدل في نفس المساحة، لقد تم توليد هذا النص من مولد النص العربى، حيث يمكنك أن تولد مثل هذا النص أو العديد من النصوص الأخرى إضافة إلى زيادة عدد الحروف التى يولدها التطبيق. إذا كنت تحتاج إلى عدد أكبر من الفقرات يتيح لك مولد النص العربى زيادة عدد الفقرات كما تريد، النص لن يبدو مقسما ولا يحوي أخطاء لغوية."
      },
      search: {
        title: "نتائج البحث",
        resultsFor: "النتائج لـ",
        noResults: "لم يتم العثور على منتجات تطابق بحثك.",
        emptyQuery: "الرجاء إدخال كلمة للبحث."
      }
    }
  }
};

const savedLanguage = localStorage.getItem('language') || 'ar';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: "ar",
    interpolation: { escapeValue: false }
  });

export default i18n;
