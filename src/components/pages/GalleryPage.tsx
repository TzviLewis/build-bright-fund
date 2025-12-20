import { motion } from 'framer-motion';
import { Image } from '@/components/ui/image';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Grid3x3, List, Search, Download, Share2, Eye, ZoomIn } from 'lucide-react';
import { useState, useEffect } from 'react';
import { BaseCrudService } from '@/integrations';
import { GalleryImages } from '@/entities';
import { Input } from '@/components/ui/input';

export default function GalleryPage() {
  const [galleryImages, setGalleryImages] = useState<GalleryImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState<GalleryImages | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);

  useEffect(() => {
    loadGalleryImages();
  }, []);

  const loadGalleryImages = async () => {
    try {
      setLoading(true);
      const { items } = await BaseCrudService.getAll<GalleryImages>('galleryimages');
      // Sort by displayOrder if available
      const sorted = (items || []).sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
      setGalleryImages(sorted);
    } catch (error) {
      console.error('Error loading gallery images:', error);
      setGalleryImages([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = galleryImages.filter(image =>
    (image.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (image.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (image.altText || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = (image: GalleryImages) => {
    if (image.image) {
      const link = document.createElement('a');
      link.href = image.image;
      link.download = image.title || 'image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = (image: GalleryImages) => {
    if (navigator.share) {
      navigator.share({
        title: image.title || 'Gallery Image',
        text: image.description || image.altText || '',
        url: window.location.href,
      }).catch(err => console.log('Error sharing:', err));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-secondary animate-spin mx-auto mb-4" />
          <p className="font-paragraph text-lg text-primary">Loading gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground border-b border-secondary/20 shadow-sm sticky top-0 z-40">
        <div className="max-w-[120rem] mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <Link to="/">
              <Button
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-full px-6 py-2 font-semibold"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Campaign
              </Button>
            </Link>
            <h1 className="font-heading text-3xl font-bold">Gallery</h1>
            <div className="w-32"></div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full bg-gradient-to-r from-primary via-primary/95 to-secondary/20 py-16">
        <div className="max-w-[120rem] mx-auto px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <h2 className="font-heading text-5xl lg:text-6xl font-bold text-primary-foreground">
              Project <span className="text-secondary italic">Gallery</span>
            </h2>
            <p className="font-paragraph text-lg text-primary-foreground/80 max-w-2xl">
              Explore our architectural designs and project vision. {filteredImages.length} images
            </p>
          </motion.div>
        </div>
      </section>

      {/* Controls Section */}
      <section className="w-full bg-white border-b border-primary/10 sticky top-[80px] z-30 shadow-sm">
        <div className="max-w-[120rem] mx-auto px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Bar */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-primary/40" />
                <Input
                  type="text"
                  placeholder="Search gallery..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-primary/20 focus:border-secondary focus:ring-secondary"
                />
              </div>
            </div>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-primary/5 rounded-lg p-1 border border-primary/10">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'grid'
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-primary hover:text-secondary'
                }`}
                title="Grid view"
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-all ${
                  viewMode === 'list'
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-primary hover:text-secondary'
                }`}
                title="List view"
              >
                <List className="w-5 h-5" />
              </button>
            </div>

            {/* Stats */}
            <div className="text-sm text-primary/60 font-paragraph">
              {filteredImages.length} of {galleryImages.length} images
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="w-full max-w-[120rem] mx-auto px-8 py-16">
        {filteredImages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <Eye className="w-16 h-16 text-primary/20 mx-auto mb-4" />
            <p className="font-paragraph text-lg text-primary/60">
              {searchTerm ? 'No images match your search' : 'No gallery images available'}
            </p>
          </motion.div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredImages.map((image, index) => (
              <motion.div
                key={image._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-lg border border-primary/10 hover:border-secondary/30 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer bg-white">
                  {/* Image Container */}
                  <div className="relative overflow-hidden bg-primary/5 aspect-video">
                    <Image
                      src={image.image || ''}
                      alt={image.altText || image.title || 'Gallery image'}
                      width={image.width || 400}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-end justify-between p-4">
                      <div className="flex gap-2 self-end">
                        <button
                          onClick={() => {
                            setSelectedImage(image);
                            setShowLightbox(true);
                          }}
                          className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                          title="View fullscreen"
                        >
                          <ZoomIn className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDownload(image)}
                          className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                          title="Download"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleShare(image)}
                          className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                          title="Share"
                        >
                          <Share2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div>
                        <p className="font-paragraph text-base text-primary-foreground font-semibold">
                          {image.title || image.altText}
                        </p>
                        {image.description && (
                          <p className="font-paragraph text-sm text-primary-foreground/80 mt-1">
                            {image.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="p-4 space-y-2">
                    <h3 className="font-heading text-lg font-bold text-primary">
                      {image.title || 'Untitled'}
                    </h3>
                    {image.altText && (
                      <p className="font-paragraph text-sm text-primary/60">
                        {image.altText}
                      </p>
                    )}
                    {image.width && image.height && (
                      <p className="font-paragraph text-xs text-primary/40">
                        {image.width} × {image.height}px
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          // List View
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {filteredImages.map((image, index) => (
              <motion.div
                key={image._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group flex gap-6 p-6 bg-white rounded-lg border border-primary/10 hover:border-secondary/30 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {/* Thumbnail */}
                <div className="flex-shrink-0 w-32 h-32 rounded-lg overflow-hidden bg-primary/5 border border-primary/10">
                  <Image
                    src={image.image || ''}
                    alt={image.altText || image.title || 'Gallery image'}
                    width={128}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading text-xl font-bold text-primary mb-2">
                      {image.title || 'Untitled'}
                    </h3>
                    {image.altText && (
                      <p className="font-paragraph text-sm text-primary/60 mb-2">
                        {image.altText}
                      </p>
                    )}
                    {image.description && (
                      <p className="font-paragraph text-sm text-primary/50 line-clamp-2">
                        {image.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-primary/40 font-paragraph">
                    {image.width && image.height && (
                      <span>{image.width} × {image.height}px</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex-shrink-0 flex flex-col gap-2">
                  <button
                    onClick={() => {
                      setSelectedImage(image);
                      setShowLightbox(true);
                    }}
                    className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                    title="View fullscreen"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDownload(image)}
                    className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleShare(image)}
                    className="p-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors"
                    title="Share"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Lightbox Modal */}
      {showLightbox && selectedImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowLightbox(false)}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl"
          >
            {/* Close Button */}
            <button
              onClick={() => setShowLightbox(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              ✕
            </button>

            {/* Image */}
            <div className="flex items-center justify-center bg-primary/5 max-h-[80vh]">
              <Image
                src={selectedImage.image || ''}
                alt={selectedImage.altText || selectedImage.title || 'Gallery image'}
                width={selectedImage.width || 800}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Info */}
            <div className="p-6 bg-white space-y-3">
              <h3 className="font-heading text-2xl font-bold text-primary">
                {selectedImage.title || 'Untitled'}
              </h3>
              {selectedImage.altText && (
                <p className="font-paragraph text-sm text-primary/60">
                  {selectedImage.altText}
                </p>
              )}
              {selectedImage.description && (
                <p className="font-paragraph text-base text-primary/70">
                  {selectedImage.description}
                </p>
              )}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => handleDownload(selectedImage)}
                  className="flex-1 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition-colors font-paragraph font-semibold flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => handleShare(selectedImage)}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-paragraph font-semibold flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

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
