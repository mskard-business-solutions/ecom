import Navbar from "@/components/navbar";
import SiteFooter from "@/components/site-footer";

export default function AboutPage() {
  return (
    
    <main className="min-h-screen bg-white">
    <Navbar />

    <div className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-medium mb-8 text-center">About Us</h1>

      <div className="prose max-w-none">
        <p>
          Welcome to RAAS The Creation, your destination for premium ethnic wear. We specialize in creating beautiful,
          handcrafted clothing that celebrates traditional craftsmanship with contemporary designs.
        </p>

        <p>
          Our journey began with a passion for preserving the rich textile heritage of India while making it
          accessible to the modern woman. Each piece in our collection is thoughtfully designed and meticulously
          crafted to ensure quality and authenticity.
        </p>

        <p>
          At RAAS, we believe that clothing is more than just fabric—it's an expression of culture, identity, and
          individuality. Our designs blend traditional techniques with modern aesthetics to create pieces that are
          both timeless and trendy.
        </p>

        <p>
          We are committed to ethical practices and supporting local artisans. By choosing RAAS, you're not just
          buying a garment; you're supporting a community of skilled craftspeople and helping preserve traditional art
          forms.
        </p>

        <p>
          Thank you for being a part of our journey. We invite you to explore our collection and experience the beauty
          of authentic Indian craftsmanship.
        </p>
      </div>
    </div>

    <SiteFooter />
  </main>
  );
}
