import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Logo from "../components/Logo";
import { PUBLIC_NAV_LINKS } from "../components/navLinks";

const sectionLinks = PUBLIC_NAV_LINKS.filter((link) => link.sectionId);
const actionLinks = PUBLIC_NAV_LINKS.filter((link) => !link.sectionId);

export default function PublicLayout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (location.pathname !== "/") {
      setActiveSection("");
      return undefined;
    }

    const sections = sectionLinks
      .map((link) => document.getElementById(link.sectionId))
      .filter(Boolean);

    if (!sections.length) return undefined;

    const headerHeight = document.querySelector(".public-header")?.offsetHeight ?? 0;

    const updateActiveSection = () => {
      const threshold = headerHeight + 8;
      let current = "";

      sectionLinks.forEach((link) => {
        const section = document.getElementById(link.sectionId);
        if (section && section.getBoundingClientRect().top <= threshold) {
          current = link.sectionId;
        }
      });

      setActiveSection(current);
    };

    const observer = new IntersectionObserver(updateActiveSection, {
      rootMargin: `-${headerHeight + 1}px 0px -${Math.max(window.innerHeight - headerHeight - 3, 0)}px 0px`,
      threshold: 0,
    });

    updateActiveSection();
    sections.forEach((section) => observer.observe(section));
    window.addEventListener("resize", updateActiveSection);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [location.pathname]);

  const handleSectionLink = (event, link) => {
    setMenuOpen(false);
    if (location.pathname !== "/") return;

    event.preventDefault();
    document.getElementById(link.sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });

    if (location.hash !== `#${link.sectionId}`) {
      navigate(link.to);
    }
  };

  return (
    <div className="public-shell">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>

      <header className="public-header">
        <div className="container public-header__inner">
          <Logo />

          <nav className="public-nav" aria-label="Main navigation">
            {sectionLinks.map((link) => {
              const isActive = activeSection === link.sectionId;
              return (
                <Link
                  className={isActive ? "is-active" : undefined}
                  to={link.to}
                  aria-current={isActive ? "location" : undefined}
                  onClick={(event) => handleSectionLink(event, link)}
                  key={link.label}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="public-header__actions">
            {actionLinks.map((link) => (
              <Link
                className={`button button--${link.variant} button--small`}
                to={link.to}
                key={link.label}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <button
            className="icon-button public-header__menu"
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="public-mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>

        {menuOpen && (
          <div className="public-mobile-menu" id="public-mobile-menu">
            <nav aria-label="Mobile navigation">
              {sectionLinks.map((link) => {
                const isActive = activeSection === link.sectionId;
                return (
                  <Link
                    className={isActive ? "is-active" : undefined}
                    to={link.to}
                    aria-current={isActive ? "location" : undefined}
                    onClick={(event) => handleSectionLink(event, link)}
                    key={link.label}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="public-mobile-menu__actions">
              {actionLinks.map((link) => (
                <Link
                  className={`button button--${link.variant === "primary" ? "primary" : "secondary"} button--full`}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  key={link.label}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main id="main-content">
        <Outlet />
      </main>

      <footer className="public-footer">
        <div className="container public-footer__inner">
          <div className="public-footer__brand">
            <Logo />
            <p>Healthcare access for Motherson employees.</p>
          </div>

          <nav className="public-footer__links" aria-label="Footer navigation">
            {PUBLIC_NAV_LINKS.map((link) => (
              <Link
                to={link.to}
                onClick={(event) => handleSectionLink(event, link)}
                key={link.label}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="container public-footer__bottom">
          <span>© {new Date().getFullYear()} MediSlot. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
