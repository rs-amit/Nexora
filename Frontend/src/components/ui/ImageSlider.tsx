import { useEffect, useState } from "react";

interface Slide {
    image: string;
    title: string;
    description: string;
}

interface HeroSliderProps {
    slides?: Slide[];
    imageShape?: "circle" | "square";
}

const HeroSlider = ({
    slides = [],
    imageShape = "circle",
}: HeroSliderProps) => {

    const [current, setCurrent] = useState(0);

    const nextSlide = () => {
        setCurrent((prev) =>
            prev === slides.length - 1 ? 0 : prev + 1
        );
    };

    const prevSlide = () => {
        setCurrent((prev) =>
            prev === 0 ? slides.length - 1 : prev - 1
        );
    };

    useEffect(() => {
        const interval = setInterval(() => {
            nextSlide();
        }, 4000);

        return () => clearInterval(interval);
    }, [current]);

    if (!slides.length) return null;

    return (
        <div className="w-full flex flex-col items-center">

            {/* Image */}
            <div className="relative w-full flex flex-col items-center justify-center">

                <div
                    className={`
                        max-w-[350px]
                        w-[350px]
                        h-[350px]
                        overflow-hidden
                        bg-[#F5F7FF]
                        flex
                        items-center
                        justify-center
                        transition-all
                        duration-500
                        ${imageShape === "circle"
                            ? "rounded-full"
                            : "rounded-3xl"}
                    `}
                >
                    <img
                        src={slides[current].image}
                        alt={slides[current].title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Controls */}
                <div className="flex justify-between items-center w-full max-w-[350px] mt-6">

                    <button
                        onClick={prevSlide}
                        className="text-4xl text-gray-700"
                    >
                        ‹
                    </button>

                    <div className="flex gap-3">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrent(index)}
                                className={`w-3 h-3 rounded-full transition-all ${current === index
                                        ? "bg-indigo-600 scale-110"
                                        : "bg-gray-300"
                                    }`}
                            />
                        ))}
                    </div>

                    <button
                        onClick={nextSlide}
                        className="text-4xl text-gray-700"
                    >
                        ›
                    </button>
                </div>
            </div>

            {/* Text */}
            <div className="text-center mt-6 max-w-[500px]">
                <h2 className="text-2xl">
                    {slides[current].title}
                </h2>

                <p className="mt-3 text-gray-500 max-w-[300px] leading-relaxed">
                    {slides[current].description}
                </p>
            </div>
        </div>
    );
};

export default HeroSlider;