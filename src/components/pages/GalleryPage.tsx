import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function GalleryPage() {
  // 13 placeholder images for the gallery
  const galleryImages = [
    {
      id: 1,
      src: 'https://static.wixstatic.com/media/28ba1c_c3462b4a313946bb8d9b9809012b29db~mv2.png?originWidth=384&originHeight=448',
      alt: 'School architecture - Main entrance',
      width: 400,
      height: 500,
    },
    {
      id: 2,
      src: 'https://static.wixstatic.com/media/28ba1c_2f9e3cb1b7cb4c048dad8ad9cbfed7db~mv2.png?originWidth=384&originHeight=448',
      alt: 'School architecture - Classroom wing',
      width: 300,
      height: 400,
    },
    {
      id: 3,
      src: 'https://static.wixstatic.com/media/28ba1c_3108af5f06fc4713a83236daf2578394~mv2.png?originWidth=384&originHeight=448',
      alt: 'School architecture - Library area',
      width: 350,
      height: 450,
    },
    {
      id: 4,
      src: 'https://static.wixstatic.com/media/28ba1c_84398a21a7be42e0bab8a346d4303fc8~mv2.png?originWidth=384&originHeight=448',
      alt: 'School architecture - Sports facility',
      width: 400,
      height: 300,
    },
    {
      id: 5,
      src: 'https://static.wixstatic.com/media/28ba1c_ba9bc3e42b1c4f2caa68f172073368ba~mv2.png?originWidth=384&originHeight=448',
      alt: 'School architecture - Auditorium',
      width: 450,
      height: 350,
    },
    {
      id: 6,
      src: 'https://static.wixstatic.com/media/28ba1c_db366dc582494e36b40b20b737425865~mv2.png?originWidth=384&originHeight=448',
      alt: 'School architecture - Courtyard',
      width: 350,
      height: 400,
    },
    {
      id: 7,
      src: 'https://static.wixstatic.com/media/28ba1c_e2cc385f5c3f4d9ba08c86ab873a716e~mv2.png?originWidth=384&originHeight=448',
      alt: 'School architecture - Laboratory',
      width: 400,
      height: 450,
    },
    {
      id: 8,
      src: 'https://static.wixstatic.com/media/28ba1c_932bcd29417c4325a88f264d5dac4d63~mv2.png?originWidth=384&originHeight=448',
      alt: 'School architecture - Cafeteria',
      width: 350,
      height: 300,
    },
    {
      id: 9,
      src: 'https://static.wixstatic.com/media/28ba1c_00676cc6e7384704a1f0c7afddcd433b~mv2.png?originWidth=384&originHeight=448',
      alt: 'School architecture - Hallway',
      width: 400,
      height: 500,
    },
    {
      id: 10,
      src: 'https://static.wixstatic.com/media/28ba1c_797549ce05e34ff4aaea22115831d8ee~mv2.png?originWidth=384&originHeight=448',
      alt: 'School architecture - Playground',
      width: 450,
      height: 350,
    },
    {
      id: 11,
      src: 'https://static.wixstatic.com/media/28ba1c_dc70332a3818448980731c8cc8b435de~mv2.png?originWidth=384&originHeight=448',
      alt: 'School architecture - Art studio',
      width: 350,
      height: 450,
    },
    {
      id: 12,
      src: 'https://static.wixstatic.com/media/28ba1c_d7779541fc29497fb1afc917ca0a00ea~mv2.png?originWidth=384&originHeight=448',
      alt: 'School architecture - Music room',
      width: 400,
      height: 400,
    },
    {
      id: 13,
      src: 'https://static.wixstatic.com/media/28ba1c_d3a9dd1bc08f40d0b0e34e28c8e51f17~mv2.png?originWidth=384&originHeight=448',
      alt: 'School architecture - Exterior view',
      width: 450,
      height: 400,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  } as const;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-primary/10 shadow-sm">
        <div className="max-w-[120rem] mx-auto px-8 py-6 flex justify-between items-center">
          <Link to="/">
            <Button
              variant="ghost"
              className="text-primary hover:text-secondary transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Campaign
            </Button>
          </Link>
          <nav className="flex items-center gap-8">
            <Link to="/">
              <a className="font-paragraph text-base text-primary hover:text-secondary transition-colors">
                Home
              </a>
            </Link>
            <a href="/#donate" className="font-paragraph text-base text-primary hover:text-secondary transition-colors">
              Donate
            </a>
            <a href="/#progress" className="font-paragraph text-base text-primary hover:text-secondary transition-colors">
              Progress
            </a>
          </nav>
        </div>
      </header>
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-primary/5 to-secondary/5 py-20">
        <div className="max-w-[120rem] mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-4"
          >
            <h1 className="font-heading text-6xl lg:text-7xl font-bold text-primary">
              School <span className="text-secondary italic">Architecture</span>
            </h1>

          </motion.div>
        </div>
      </section>
      {/* Gallery Section */}
      <section className="w-full max-w-[120rem] mx-auto px-8 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
        >
          {galleryImages.map((image) => (
            <motion.div
              key={image.id}
              variants={itemVariants}
              className="break-inside-avoid"
            >
              <div className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer">
                <Image
                  src={image.src}
                  alt={image.alt}
                  width={image.width}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <p className="font-paragraph text-base text-primary-foreground font-semibold">
                    {image.alt}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>
      {/* Call to Action Section */}
      <section className="w-full bg-primary py-20">
        <div className="max-w-[120rem] mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center space-y-6"
          >
            <h2 className="font-heading text-5xl font-bold text-primary-foreground">
              Help Us Build This <span className="text-secondary italic">Vision</span>
            </h2>
            <p className="font-paragraph text-lg text-primary-foreground/80 max-w-2xl mx-auto">
              These architectural designs represent our commitment to providing students with a world-class learning environment. Your donation helps make this dream a reality.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <a href="/#donate">
                <Button
                  size="lg"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-8 py-6 text-lg font-semibold"
                >
                  DONATE NOW
                </Button>
              </a>
              <Link to="/">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary rounded-full px-8 py-6 text-lg font-semibold"
                >
                  BACK TO CAMPAIGN
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-16 border-t border-primary/20">
        <div className="max-w-[120rem] mx-auto px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div className="space-y-4">
              <h3 className="font-heading text-2xl font-bold">SCHOOL CAMPAIGN</h3>
            </div>

            <div className="space-y-4">
              <h4 className="font-heading text-xl font-bold">Quick Links</h4>
              <nav className="flex flex-col gap-3">
                <Link to="/">
                  <a className="font-paragraph text-base text-primary-foreground/80 hover:text-secondary transition-colors">
                    Campaign Details
                  </a>
                </Link>
                <a href="/#donate" className="font-paragraph text-base text-primary-foreground/80 hover:text-secondary transition-colors">
                  Make a Donation
                </a>
                <a href="/#progress" className="font-paragraph text-base text-primary-foreground/80 hover:text-secondary transition-colors">
                  View Progress
                </a>
              </nav>
            </div>

            <div className="space-y-4">
              <h4 className="font-heading text-xl font-bold">Gallery</h4>
              <nav className="flex flex-col gap-3">
                <Link to="/gallery">
                  <a className="font-paragraph text-base text-primary-foreground/80 hover:text-secondary transition-colors">
                    Architecture Gallery
                  </a>
                </Link>
              </nav>
            </div>
          </div>

          <div className="pt-8 border-t border-primary-foreground/20 text-center">
            <p className="font-paragraph text-sm text-primary-foreground/70">
              © {new Date().getFullYear()} School Fundraising Campaign. All rights reserved. | Secure & Trusted Donations
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
