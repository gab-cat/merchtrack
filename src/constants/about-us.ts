export const ABOUT_US_CONTENT = {
  title: "About MerchTrack",
  description: "Building the future of merchandise management and tracking.",
  mission: "Our mission is to revolutionize how businesses manage their merchandise with cutting-edge technology and seamless integration.",
  vision: "To be the global standard in merchandise management, empowering businesses of all sizes to thrive in the digital era.",
  sections: [
    {
      title: "Our Story",
      content: `Founded in 2024, MerchTrack emerged from a simple observation: businesses needed a better way to manage their merchandise. What started as a solution for local businesses has grown into a comprehensive platform trusted by organizations worldwide.

Our journey began when our founders, experienced in both retail and technology, recognized the gap between existing inventory solutions and the real needs of modern businesses. They envisioned a platform that would not just track inventory, but transform how businesses interact with their merchandise data.

Today, MerchTrack serves thousands of businesses across multiple industries, maintaining our commitment to innovation, reliability, and customer success.`
    },
    {
      title: "Our Values",
      content: `At MerchTrack, our values guide everything we do:

• Innovation: We continuously push the boundaries of what's possible in merchandise management.
• Reliability: Our platform is built on a foundation of trust and dependability.
• Customer Success: Your success is our success - we're committed to helping your business grow.
• Transparency: We believe in open communication and honest business practices.
• Security: We prioritize the protection of your data through state-of-the-art measures.`
    },
    {
      title: "Our Technology",
      content: `MerchTrack leverages cutting-edge technology to provide:

• Real-time inventory tracking with millisecond accuracy
• Advanced analytics and reporting capabilities
• Machine learning-powered demand forecasting
• Robust API integrations with major e-commerce platforms
• Military-grade security protocols for data protection
• Mobile-first design for accessibility anywhere
• AI-powered insights and predictive analytics
• Scalable cloud infrastructure for reliable performance`
    },
    {
      title: "Our Commitment",
      content: `We're committed to:

• Continuous platform improvement based on user feedback
• Providing exceptional 24/7 customer support
• Maintaining the highest standards of data security
• Supporting sustainable business practices
• Building long-term partnerships with our clients
• Contributing to the open-source community
• Fostering innovation in merchandise management
• Creating positive social impact through technology`
    },
    {
      title: "Industry Recognition",
      content: `MerchTrack has been recognized for:

• Excellence in Technology Innovation (2024)
• Best-in-Class Customer Support
• Leading Security Standards
• Outstanding User Experience
• Commitment to Sustainability

We continue to set industry standards while maintaining our focus on what matters most: helping businesses succeed.`
    }
  ]
};

// Export type for developer
export type Developer = {
  name: string;
  role: string;
  image: string;
  github?: string;
  linkedin?: string;
  bio?: string;
}

// Developer data
export const ABOUT_DEVELOPERS_LEAD: Developer = {
  name: "Gabriel Angelo Catimbang",
  role: "Team Lead",
  image: "/img/dev_gab.JPG",
  linkedin: "gabrielcatimbang",
  bio: "Full-stack developer with expertise in React, Node.js, and cloud infrastructure. Passionate about building scalable web applications and mentoring junior developers."
};

export const ABOUT_DEVELOPERS: Developer[] = [
  {
    name: "John Michael Coronel",
    role: "Full-stack Developer",
    image: "/img/dev_jm.png",
    linkedin: "john-michael-coronel-293a0b30b",
    bio: "Full-stack developer with expertise in database optimization and secure server architectures."
  },
  {
    name: "Kyla Ronquillo",
    role: "Full-stack Developer",
    image: "/img/dev_kyla.jpg",
    linkedin: "kylaronquillo",
    bio: "Full-stack developer with a passion for creating beautiful, responsive interfaces using modern web technologies."
  },
  {
    name: "Reiven Lee",
    role: "Full-stack Developer",
    image: "/img/dev_reiven.png",
    linkedin: "reiven-lee",
    bio: "Infrastructure and deployment specialist. Expert in containerization, CI/CD pipelines, and cloud platforms."
  },
  {
    name: "Miguel Andre Pajarillo",
    role: "Full-stack Developer",
    image: "/img/dev_miguel.jpg",
    linkedin: "miguel-andre-pajarillo-313a08229",
    bio: "Versatile developer working across the stack. Specializes in TypeScript and modern JavaScript frameworks."
  },
];