const nauvarahConfig = {
    brand: {
      name: "Nauvarah",
      tagline: "Align Your Energy. Attract Your Abundance.",
      email: "support@nauvarah.com",
      phone: "+91 9990377727",
      address: "Ludhiana, Punjab, India",
      founded: "2026",
    },
    theme: {
      colors: {
        primary: "#1B3A6B",
        secondary: "#C8860A",
        accent: "#FFFFFF",
      },
      fonts: {
        heading: "Cormorant Garamond",
        body: "Inter",
      },
    },
    seo: {
      defaultTitle: "Nauvarah — Align Your Energy. Attract Your Abundance.",
      titleTemplate: "%s | Nauvarah",
      description:
        "Premium pyrite frames, crystals, and vastu products for wealth, abundance, and positive energy. Trusted by thousands across India.",
      siteUrl: "https://nauvarah.com",
      ogImage: "/images/og-nauvarah.jpg",
    },
    shipping: {
      freeShippingAbove: 999,
      flatShippingCharge: 79,
      codCharge: 49,
      prepaidDiscount: 75,
    },
    business: {
      gstNumber: "",
      panNumber: "",
      bankName: "",
      razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",
    },
    social: {
      instagram: "https://instagram.com/nauvarah.official",
      facebook: "https://facebook.com/nauvarah",
      youtube: "https://youtube.com/@nauvarah",
    },
  } as const;
  
  export default nauvarahConfig;
  export type BrandConfig = typeof nauvarahConfig;