import AboutSectionOne from "@/components/home/About/AboutSectionOne";
import AboutSectionTwo from "@/components/home/About/AboutSectionTwo";
import Brands from "@/components/home/Brands";
import ScrollUp from "@/components/Common/ScrollUp";
import Features from "@/components/home/Features";
import Hero from "@/components/home/Hero";
import Video from "@/components/home/Video";
import Header from "@/components/home/Header";

export default function Home() {
  return (
    <>
      <Header />
      <ScrollUp />
      <Hero />
      <Features />
      <Video />
      <Brands />
      <AboutSectionOne />
      <AboutSectionTwo />
    </>
  );
}
