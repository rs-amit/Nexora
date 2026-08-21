type Props = {
  title: string;
  description: string;
};

function CreateCard({
  title,
  description,
}: Props) {
  return (
    <button
      className="
        w-[280px]
        h-[140px]

        rounded-2xl
        border border-white/10

        bg-[#171925]

        hover:border-white/20
        hover:bg-[#1C2030]

        transition-all
      "
    >
      <div
        className="
          h-full
          flex flex-col
          items-center justify-center
        "
      >
        <div className="text-4xl mb-4">
          +
        </div>

        <h3 className="font-medium">
          {title}
        </h3>

        <p className="text-sm text-white/40 mt-1">
          {description}
        </p>
      </div>
    </button>
  );
}

export default CreateCard;