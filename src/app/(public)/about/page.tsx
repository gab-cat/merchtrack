import React from "react";
import AboutUsBody from "@/components/public/about-us-body";
import PageAnimation from "@/components/public/page-animation";
import PageTitle from "@/components/public/page-title";
import { ABOUT_US_CONTENT } from "@/constants";

const AboutPage = () => {
  return (
    <PageAnimation className="max-w-4xl">
      <PageTitle
        title={ABOUT_US_CONTENT.title}
        description="Learn about MerchTrack's mission, vision, and the dedicated team behind our innovative merchandise management platform."
      />
      <AboutUsBody />
    </PageAnimation>
  );
};

export default AboutPage;
