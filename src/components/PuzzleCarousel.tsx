import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { Puzzle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useEffect, useRef } from 'react';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface CarouselSlide {
  day: number;
  name: string;
  theme: string;
  outcome: string;
  bullets: string[];
  category: string;
}

const slides: CarouselSlide[] = [
  {
    day: 1,
    name: 'Build',
    theme: 'Create Your Foundation',
    outcome: 'Launch a complete AI-powered business in under 2 hours',
    bullets: [
      'Set up payment processing in 15 minutes',
      'Deploy AI chatbot that handles 90% of customer questions',
      'Create automated email sequences that sell while you sleep'
    ],
    category: 'Build'
  },
  {
    day: 2,
    name: 'Attract',
    theme: 'Drive Traffic',
    outcome: 'Generate 1,000+ targeted visitors without paid ads',
    bullets: [
      'AI-generated content that ranks on Google in 48 hours',
      'Viral social media posts created in 5 minutes',
      'Automated SEO that brings customers to your door'
    ],
    category: 'Attract'
  },
  {
    day: 3,
    name: 'Convert',
    theme: 'Turn Leads into Sales',
    outcome: 'Convert 15-25% of visitors into paying customers',
    bullets: [
      'AI-optimized landing pages that double conversions',
      'Smart lead magnets that collect emails automatically',
      'Persuasive sales funnels that close deals 24/7'
    ],
    category: 'Convert'
  },
  {
    day: 4,
    name: 'Deliver',
    theme: 'Automate Fulfillment',
    outcome: 'Deliver premium value without lifting a finger',
    bullets: [
      'AI systems that fulfill orders instantly',
      'Automated onboarding that delights customers',
      'Self-service portals that eliminate support tickets'
    ],
    category: 'Deliver'
  },
  {
    day: 5,
    name: 'Support',
    theme: 'Handle Customer Needs',
    outcome: 'Provide 5-star support without hiring anyone',
    bullets: [
      'AI assistants that solve 95% of customer issues',
      'Smart chatbots that feel human and caring',
      'Automated refund and complaint systems'
    ],
    category: 'Support'
  },
  {
    day: 6,
    name: 'Profit',
    theme: 'Scale Revenue',
    outcome: 'Grow from $0 to $10k/month in 90 days',
    bullets: [
      'AI-powered upsells that increase order value by 40%',
      'Automated affiliate programs that recruit promoters',
      'Smart pricing algorithms that maximize profits'
    ],
    category: 'Profit'
  },
  {
    day: 7,
    name: 'Rest',
    theme: 'Prioritize Prosperity',
    outcome: 'Build a business that works without you',
    bullets: [
      'Complete automation dashboard with zero daily tasks',
      'Financial freedom with passive income streams',
      'Time to enjoy life while AI runs your empire'
    ],
    category: 'Rest'
  }
];

interface PuzzleCarouselProps {
  onSignupClick: () => void;
}

export default function PuzzleCarousel({ onSignupClick }: PuzzleCarouselProps) {
  const swiperRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (swiperRef.current) {
        swiperRef.current = null;
      }
    };
  }, []);

  const handleSlideChange = (swiper: any) => {
    if (swiper.activeIndex === slides.length - 1) {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#10B981', '#1E3A8A']
        });
      }, 500);
    }
  };

  return (
    <div className="relative w-full max-w-7xl mx-auto">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={30}
        slidesPerView={1}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true
        }}
        pagination={{
          clickable: true,
          bulletActiveClass: 'swiper-pagination-bullet-active !bg-orange-500'
        }}
        navigation
        loop={true}
        onSlideChange={handleSlideChange}
        onSwiper={(swiper) => { swiperRef.current = swiper; }}
        className="puzzle-carousel"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={slide.day}>
            <div className="bg-blue-900 rounded-2xl p-8 md:p-12 min-h-[500px] flex flex-col justify-between">
              <div className="flex items-start gap-6 flex-col md:flex-row">
                <div className="relative">
                  <div className="bg-orange-500 rounded-2xl w-24 h-24 md:w-32 md:h-32 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10">
                      <Puzzle className="w-full h-full" />
                    </div>
                    <span className="text-5xl md:text-6xl font-bold text-white relative z-10">
                      {slide.day}
                    </span>
                  </div>
                  {index < slides.length - 1 && (
                    <div className="hidden md:block absolute -right-8 top-1/2 transform -translate-y-1/2">
                      <Puzzle className="w-6 h-6 text-green-500" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="mb-4">
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-2">
                      Day {slide.day}: {slide.name}
                    </h3>
                    <p className="text-xl text-orange-500 font-semibold mb-4">
                      {slide.theme}
                    </p>
                    <p className="text-lg md:text-xl text-green-400 font-medium">
                      {slide.outcome}
                    </p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {slide.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <Puzzle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                        <span className="text-white text-base md:text-lg">{bullet}</span>
                      </li>
                    ))}
                  </ul>

                  {index === slides.length - 1 && (
                    <div className="bg-green-500 bg-opacity-20 border-2 border-green-500 rounded-lg p-6 mb-6">
                      <p className="text-white text-xl md:text-2xl font-bold text-center">
                        You just built a complete AI profit machine.
                        <br />
                        <span className="text-green-400">
                          You now own a $10k/mo AI system that runs without you.
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={onSignupClick}
                  className="w-full md:w-auto bg-orange-500 hover:bg-orange-600 text-white text-xl font-bold px-12 py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  {index === slides.length - 1
                    ? "Start Your 7-Day Build FREE"
                    : "Get Tomorrow's Puzzle FREE"}
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        .puzzle-carousel .swiper-button-next,
        .puzzle-carousel .swiper-button-prev {
          color: #F59E0B;
        }
        .puzzle-carousel .swiper-pagination-bullet {
          background: #ffffff;
          opacity: 0.5;
        }
        .puzzle-carousel .swiper-pagination-bullet-active {
          opacity: 1;
        }
      `}</style>
    </div>
  );
}
