
import "use client";

export default function BentoBoxItem({ title, description }) {
  return (
    <div className="bento-item text-left">
      <h3 className="text-2xl font-bold text-modern-purple mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
