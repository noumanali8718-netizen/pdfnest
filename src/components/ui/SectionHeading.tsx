type SectionHeadingProps = {
  title: string;
  subtitle: string;
};

export default function SectionHeading({ title, subtitle }: SectionHeadingProps) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-lg leading-relaxed text-gray-500">{subtitle}</p>
    </div>
  );
}

