import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image } from '@/components/ui/image';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  image?: string;
  content: string;
  rating: number;
  campaign?: string;
}

const defaultTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Donor',
    image: 'https://static.wixstatic.com/media/28ba1c_e65b148d3f194589a156fe167cf061f6~mv2.png?originWidth=192&originHeight=192',
    content: 'Build Bright Fund made it incredibly easy to support causes I care about. The platform is transparent, secure, and user-friendly. I\'ve already set up recurring donations!',
    rating: 5,
    campaign: 'Education Initiative'
  },
  {
    id: '2',
    name: 'Michael Chen',
    role: 'Campaign Organizer',
    image: 'https://static.wixstatic.com/media/28ba1c_b26a46a8a4c4460e9196190f4b58c8ea~mv2.png?originWidth=192&originHeight=192',
    content: 'As a campaign organizer, I appreciate the detailed analytics and donor management tools. The platform helped us reach our fundraising goal 2 weeks ahead of schedule.',
    rating: 5,
    campaign: 'Community Center'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'Nonprofit Director',
    image: 'https://static.wixstatic.com/media/28ba1c_f423cc51ab024a0e97edb1fd8440a120~mv2.png?originWidth=192&originHeight=192',
    content: 'The matching fund feature has been a game-changer for our organization. We\'ve seen a 40% increase in donations since implementing it through Build Bright Fund.',
    rating: 5,
    campaign: 'Healthcare Access'
  },
  {
    id: '4',
    name: 'David Thompson',
    role: 'Team Fundraiser',
    image: 'https://static.wixstatic.com/media/28ba1c_8fedb38285df4ef5b8ff4e629c9d8512~mv2.png?originWidth=192&originHeight=192',
    content: 'Creating a team fundraiser page was so simple. My team loved the leaderboard feature - it motivated everyone to contribute more. Highly recommended!',
    rating: 5,
    campaign: 'Disaster Relief'
  },
  {
    id: '5',
    name: 'Lisa Anderson',
    role: 'Frequent Donor',
    image: 'https://static.wixstatic.com/media/28ba1c_420db5f4a1fb4af496a103f889be8636~mv2.png?originWidth=192&originHeight=192',
    content: 'I love how easy it is to track my donation history and impact. The tax receipts are automatically generated, which saves me so much time during tax season.',
    rating: 5,
    campaign: 'Environmental Conservation'
  },
];

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
  maxDisplay?: number;
}

export default function TestimonialsSection({ 
  testimonials = defaultTestimonials,
  maxDisplay = 3 
}: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const displayedTestimonials = testimonials.slice(0, maxDisplay);
  const totalPages = Math.ceil(testimonials.length / maxDisplay);

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      zIndex: 0,
      x: dir < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      const next = prev + newDirection;
      if (next < 0) return testimonials.length - maxDisplay;
      if (next >= testimonials.length) return 0;
      return next;
    });
  };

  const currentTestimonials = testimonials.slice(currentIndex, currentIndex + maxDisplay);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="space-y-12"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <h2 className="font-heading text-4xl lg:text-5xl font-bold text-primary">
            What Our Community Says
          </h2>
          <p className="font-paragraph text-lg text-primary/70 max-w-2xl mx-auto">
            Real stories from donors, organizers, and fundraisers who trust Build Bright Fund.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="relative">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {currentTestimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-primary/10 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden hover:border-secondary/30"
                >
                  {/* Card Content */}
                  <div className="p-6 space-y-4 h-full flex flex-col">
                    {/* Rating */}
                    <div className="flex gap-1">
                      {Array.from({ length: testimonial.rating }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-amber-400 text-amber-400"
                        />
                      ))}
                    </div>

                    {/* Testimonial Text */}
                    <p className="font-paragraph text-primary/80 leading-relaxed flex-1">
                      "{testimonial.content}"
                    </p>

                    {/* Author Info */}
                    <div className="pt-4 border-t border-primary/10 space-y-3">
                      <div className="flex items-center gap-3">
                        {testimonial.image && (
                          <div className="w-12 h-12 rounded-full overflow-hidden bg-primary/10 flex-shrink-0">
                            <Image
                              src={testimonial.image}
                              alt={testimonial.name}
                              className="w-full h-full object-cover"
                              width={48}
                            />
                          </div>
                        )}
                        <div>
                          <p className="font-heading font-bold text-primary">
                            {testimonial.name}
                          </p>
                          <p className="font-paragraph text-xs text-primary/60">
                            {testimonial.role}
                          </p>
                        </div>
                      </div>
                      {testimonial.campaign && (
                        <p className="font-paragraph text-xs text-secondary font-semibold">
                          Campaign: {testimonial.campaign}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          {testimonials.length > maxDisplay && (
            <>
              <button
                onClick={() => paginate(-1)}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-16 z-10 p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors duration-300 shadow-lg"
                aria-label="Previous testimonials"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={() => paginate(1)}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-16 z-10 p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors duration-300 shadow-lg"
                aria-label="Next testimonials"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Pagination Dots */}
        {testimonials.length > maxDisplay && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex justify-center gap-2"
          >
            {Array.from({ length: totalPages }).map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setDirection(index > currentIndex / maxDisplay ? 1 : -1);
                  setCurrentIndex(index * maxDisplay);
                }}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  Math.floor(currentIndex / maxDisplay) === index
                    ? 'bg-secondary w-8'
                    : 'bg-primary/20 hover:bg-primary/40'
                }`}
                aria-label={`Go to page ${index + 1}`}
              />
            ))}
          </motion.div>
        )}

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-primary/10"
        >
          <div className="text-center">
            <p className="font-heading text-4xl font-bold text-secondary">
              {testimonials.length}+
            </p>
            <p className="font-paragraph text-primary/70 mt-2">
              Happy Donors
            </p>
          </div>
          <div className="text-center">
            <p className="font-heading text-4xl font-bold text-secondary">
              4.9/5
            </p>
            <p className="font-paragraph text-primary/70 mt-2">
              Average Rating
            </p>
          </div>
          <div className="text-center">
            <p className="font-heading text-4xl font-bold text-secondary">
              98%
            </p>
            <p className="font-paragraph text-primary/70 mt-2">
              Satisfaction Rate
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
