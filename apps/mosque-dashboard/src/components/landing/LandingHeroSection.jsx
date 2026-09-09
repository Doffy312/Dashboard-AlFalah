import mosqueHeroBg from '../../assets/mosque-hero-bg.jpg';

/**
 * LandingHeroSection — Reusable hero section component for landing pages.
 *
 * Renders a full-width hero with background image, dark gradient overlay,
 * and left-aligned content (matching the Beranda "Istiqlal" style).
 *
 * @param {Object}   props
 * @param {string}   [props.id]            — HTML id for scroll targeting
 * @param {string}   [props.subtitle]      — Small uppercase text above heading
 * @param {React.ReactNode} props.heading  — Main heading (can include JSX)
 * @param {Array}    [props.taglineParts]   — [{text, className}] for multi-color tagline
 * @param {string}   [props.description]   — Paragraph below tagline
 * @param {React.ReactNode} [props.actions] — CTA buttons row
 * @param {boolean}  [props.isSubpage]     — If true, uses shorter 70vh height
 */
export default function LandingHeroSection({
  id,
  subtitle,
  heading,
  taglineParts,
  description,
  actions,
  isSubpage = false,
}) {
  return (
    <section
      id={id}
      className={`hero-istiqlal scroll-mt-0${isSubpage ? ' hero-istiqlal--subpage' : ''}`}
    >
      {/* Background Image */}
      <div className="hero-bg">
        <img
          src={mosqueHeroBg}
          alt="Mosque Hero Background"
          width="1920"
          height="1080"
          fetchpriority={isSubpage ? 'auto' : 'high'}
          decoding="async"
        />
      </div>

      {/* Dark Gradient Overlay */}
      <div className="hero-overlay" />

      {/* Content — Left Aligned */}
      <div className="hero-content">
        <div className="hero-text">
          {/* Decorative Subtitle */}
          {subtitle && (
            <div className="hero-subtitle-line">
              <span>{subtitle}</span>
            </div>
          )}

          {/* Main Heading */}
          <h1 className="hero-heading-istiqlal">
            {heading}
          </h1>

          {/* Italic Tagline */}
          {taglineParts && taglineParts.length > 0 && (
            <p className="hero-tagline">
              {taglineParts.map((part, idx) => (
                <span key={idx} className={part.className}>
                  {part.text}
                </span>
              ))}
            </p>
          )}

          {/* Description */}
          {description && (
            <p className="hero-desc-istiqlal">{description}</p>
          )}

          {/* CTA Buttons */}
          {actions && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto pt-1">
              {actions}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
