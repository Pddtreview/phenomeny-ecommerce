import { HOMEPAGE_IMAGES } from "@/lib/homepage-images";

export type PathwayCard = {
  title: string;
  subtitle: string;
  cta: string;
  imageUrl: string;
  examples?: string[];
  icon: "wealth" | "shield" | "love" | "focus";
};

export const pathwayCards: PathwayCard[] = [
  {
    title: "Money & Career",
    subtitle:
      "You work hard, but the growth, opportunities, and financial stability you expected never seem to arrive.",
    cta: "This feels like me",
    imageUrl: HOMEPAGE_IMAGES.pathwayMoneyCareer,
    icon: "wealth",
  },
  {
    title: "Marriage & Relationships",
    subtitle:
      "Everything seems to be moving in the right direction, yet something always goes wrong at the last moment.",
    cta: "This feels like me",
    imageUrl: HOMEPAGE_IMAGES.pathwayMarriageRelationships,
    icon: "love",
  },
  {
    title: "Repeated Setbacks",
    subtitle:
      "The same problems keep coming back, plans fall apart, and nothing seems to move the way it should.",
    cta: "This feels like me",
    imageUrl: HOMEPAGE_IMAGES.pathwayRepeatedSetbacks,
    icon: "shield",
  },
  {
    title: "Life Decisions",
    subtitle:
      "When the decision is important, knowing the right timing can be just as important as making the right choice.",
    examples: [
      "Should I invest in that property?",
      "Should I take that opportunity?",
      "Is this the right time to make a move?",
    ],
    cta: "This feels like me",
    imageUrl: HOMEPAGE_IMAGES.pathwayLifeDecisions,
    icon: "focus",
  },
];
