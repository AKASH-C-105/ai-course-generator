import {
  Brain,
  Code2,
  Database,
  ShieldCheck,
  Gamepad2,
  Music2,
  Camera,
  Palette,
  BarChart3,
  Languages,
  LineChart,
  CloudCog,
  Cpu,
  BookOpen,
  Dumbbell,
  Stethoscope,
  Globe2,
  Leaf,
  GraduationCap,
  PenTool,
} from "lucide-react";

const CategoryList = [
  // 🔹 Tech & AI
  {
    id: 1,
    name: "AI & Machine Learning",
    icon: <Brain size={40} />,
  },
  {
    id: 2,
    name: "Programming",
    icon: <Code2 size={40} />,
  },
  {
    id: 3,
    name: "Data Science",
    icon: <Database size={40} />,
  },
  {
    id: 4,
    name: "Cybersecurity",
    icon: <ShieldCheck size={40} />,
  },
  {
    id: 5,
    name: "Cloud & DevOps",
    icon: <CloudCog size={40} />,
  },
  {
    id: 6,
    name: "Computer Hardware",
    icon: <Cpu size={40} />,
  },

  // 🔹 Creative & Media
  {
    id: 7,
    name: "Game Development",
    icon: <Gamepad2 size={40} />,
  },
  {
    id: 8,
    name: "Design & Illustration",
    icon: <Palette size={40} />,
  },
  {
    id: 9,
    name: "Photography & Videography",
    icon: <Camera size={40} />,
  },
  {
    id: 10,
    name: "Music & Arts",
    icon: <Music2 size={40} />,
  },
  {
    id: 11,
    name: "Writing & Content Creation",
    icon: <PenTool size={40} />,
  },

  // 🔹 Business, Language & Finance
  {
    id: 12,
    name: "Business & Marketing",
    icon: <BarChart3 size={40} />,
  },
  {
    id: 13,
    name: "Finance & Trading",
    icon: <LineChart size={40} />,
  },
  {
    id: 14,
    name: "Language Learning",
    icon: <Languages size={40} />,
  },

  // 🔹 General Education & Lifestyle
  {
    id: 15,
    name: "Health & Fitness",
    icon: <Dumbbell size={40} />,
  },
  {
    id: 16,
    name: "Medical & Healthcare",
    icon: <Stethoscope size={40} />,
  },
  {
    id: 17,
    name: "Environmental Studies",
    icon: <Leaf size={40} />,
  },
  {
    id: 18,
    name: "Geography & Travel",
    icon: <Globe2 size={40} />,
  },
  {
    id: 19,
    name: "Education & Teaching",
    icon: <BookOpen size={40} />,
  },
  {
    id: 20,
    name: "General Knowledge",
    icon: <GraduationCap size={40} />,
  },
];

export default CategoryList;
