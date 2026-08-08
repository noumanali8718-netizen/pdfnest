type SectionHeadingProps = {
  title: string;
  subtitle: string;
  eyebrow?: string;
};

export default function SectionHeading({
  title,
  subtitle,
  eyebrow,
}: SectionHeadingProps) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow ? (
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-1 text-sm font-semibold text-blue-700">
          {eyebrow}
        </span>
      ) : null}
      <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl lg:text-[40px] lg:leading-[1.15]">
        {title}
      </h2>
      <p className="mt-4 text-lg leading-relaxed text-slate-600 lg:text-xl">
        {subtitle}
      </p>
    </div>
  );
}

