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
    outcome: 'Learn to set up basic AI tools for business foundations',
    bullets: [
      'Explore payment integrations and processing concepts',
      'Build simple chatbots for handling queries',
      'Understand email automation concepts and workflows'
    ],
    category: 'Build'
  },
  {
    day: 2,
    name: 'Attract',
    theme: 'Drive Traffic',
    outcome: 'Develop strategies for organic traffic generation',
    bullets: [
      'Create AI-assisted content for search engine optimization',
      'Generate social post ideas using AI tools',
      'Learn SEO basics and content distribution methods'
    ],
    category: 'Attract'
  },
  {
    day: 3,
    name: 'Convert',
    theme: 'Turn Leads into Sales',
    outcome: 'Explore conversion optimization techniques',
    bullets: [
      'Landing page optimization principles and design',
      'Lead capture methods and form strategies',
      'Funnel design principles for user journeys'
    ],
    category: 'Convert'
  },
  {
    day: 4,
    name: 'Deliver',
    theme: 'Automate Fulfillment',
    outcome: 'Study fulfillment automation and delivery systems',
    bullets: [
      'Learn automated order processing workflows',
      'Explore customer onboarding automation tools',
      'Build self-service portal concepts and features'
    ],
    category: 'Deliver'
  },
  {
    day: 5,
    name: 'Support',
    theme: 'Handle Customer Needs',
    outcome: 'Build AI support tools and customer service systems',
    bullets: [
      'Develop AI assistant capabilities for common inquiries',
      'Design conversational chatbot experiences',
      'Understand support ticket automation workflows'
    ],
    category: 'Support'
  },
  {
    day: 6,
    name: 'Profit',
    theme: 'Scale Revenue',
    outcome: 'Explore revenue scaling strategies and growth techniques',
    bullets: [
      'Learn upsell techniques and cross-sell methods',
      'Understand affiliate program basics and structure',
      'Pricing strategy concepts and value optimization'
    ],
    category: 'Profit'
  },
  {
    day: 7,
    name: 'Rest',
    theme: 'Prioritize Prosperity',
    outcome: 'Design sustainable workflows for work-life balance',
    bullets: [
      'Dashboard monitoring skills and analytics review',
      'Long-term skill application and continuous learning',
      'Time management with automation and delegation'
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
                    <div className="bg-yellow-900 bg-opacity-40 border-2 border-yellow-500 rounded-lg p-6 mb-6">
                      <p className="text-white text-base md:text-lg font-semibold text-center">
                        <span className="text-yellow-400 font-bold block mb-2">
                          Educational Content Reminder
                        </span>
                        These puzzles teach skills for automation and business concepts. Actual business results vary widely based on individual effort, market conditions, and many external factors.
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
                    ? "Start Your 7-Day Learning Journey FREE"
                    : "Get Tomorrow's Lesson FREE"}
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
