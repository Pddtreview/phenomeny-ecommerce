const nauvarahaConfig = {
    brand: {
      name: "Nauvaraha",
      tagline: "Align Your Energy. Attract Your Abundance.",
      email: "hello@nauvaraha.com",
      phone: "+91 9115490001",
      address: "House No 10, Street No 01, Krishna Nagar, Jalandhar, Punjab 144008",
      founded: "2013",
    },
    theme: {
      colors: {
        primary: "#1A1A1A",
        secondary: "#E91E8C",
        accent: "#FFFFFF",
      },
      fonts: {
        heading: "Inter",
        body: "Inter",
      },
    },
    seo: {
      defaultTitle: "Nauvaraha — Align Your Energy. Attract Your Abundance.",
      titleTemplate: "%s | Nauvaraha",
      description:
        "Premium pyrite frames, crystals, and vastu products for wealth, abundance, and positive energy. Trusted by thousands across India.",
      siteUrl: "https://www.nauvaraha.com",
      ogImage: "/images/og-nauvaraha.jpg",
    },
    shipping: {
      freeShippingAbove: 999,
      flatShippingCharge: 79,
      codCharge: 49,
      prepaidDiscount: 75,
    },
    business: {
      gstNumber: process.env.NEXT_PUBLIC_GSTIN || "",
      panNumber: "",
      bankName: "",
      payuMerchantKey: process.env.PAYU_MERCHANT_KEY || "",
    },
    social: {
      instagram: "https://instagram.com/nauvaraha.official",
      facebook: "https://facebook.com/nauvaraha",
      youtube: "https://youtube.com/@nauvaraha",
    },
  } as const;

  export default nauvarahaConfig;
  export type BrandConfig = typeof nauvarahaConfig;
