document.addEventListener("DOMContentLoaded", ready, false);

const THEME_PREF_STORAGE_KEY = "theme-preference";
const THEME_TO_ICON_CLASS = {
  dark: "feather-moon",
  light: "feather-sun",
};
const THEME_TO_ICON_TEXT_CLASS = {
  dark: "Dark mode",
  light: "Light mode",
};
const HEADING_TO_TOC_CLASS = {
  H1: "level-1",
  H2: "level-2",
  H3: "level-3",
  H4: "level-4",
};

let toggleIcon = "";
let darkThemeCss = "";

function ready() {
  feather.replace({ "stroke-width": 1, width: 20, height: 20 });
  setThemeByUserPref();

  if (
    document.querySelector("main#content > .container") !== null &&
    document
      .querySelector("main#content > .container")
      .classList.contains("post")
  ) {
    if (document.getElementById("TableOfContents") !== null) {
      fixTocItemsIndent();
      createScrollSpy();
    } else {
      document.querySelector("main#content > .container.post").style.display =
        "block";
    }
  }

  addProgressMarkers();

  const svgsToInject = document.querySelectorAll("img.svg-inject");
  SVGInjector(svgsToInject);

  document
    .getElementById("hamburger-menu-toggle")
    .addEventListener("click", () => {
      const hamburgerMenu =
        document.getElementsByClassName("nav-hamburger-list")[0];
      if (hamburgerMenu.classList.contains("visibility-hidden")) {
        hamburgerMenu.classList.remove("visibility-hidden");
      } else {
        hamburgerMenu.classList.add("visibility-hidden");
      }
    });
}

function addProgressMarkers() {
  const headers = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
  const markerContainer = document.querySelector(".guru");
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight - windowHeight;
  const headerHeight = 60;

  headers.forEach((header) => {
    const markerPosition = Math.min(
      ((header.offsetTop - headerHeight - 33) / documentHeight) * 100,
      100,
    );
    const marker = document.createElement("div");
    marker.className = "vritti";
    marker.style.left = `${markerPosition}%`;

    const tooltip = document.createElement("div");
    tooltip.className = "vritti-tooltip";

    const headerText = header.textContent;
    tooltip.textContent = headerText;

    marker.addEventListener("click", (e) => {
      e.preventDefault();
      document
        .querySelectorAll(".vritti")
        .forEach((m) => m.classList.remove("active"));
      marker.classList.add("active");
      const scrollTarget = header.offsetTop - headerHeight;
      window.scrollTo({
        top: scrollTarget,
        behavior: "smooth",
      });
    });

    marker.addEventListener("mouseenter", () => {
      const tooltipRect = tooltip.getBoundingClientRect();
      if (tooltipRect.right > window.innerWidth) {
        tooltip.style.left = "auto";
        tooltip.style.right = "0";
        tooltip.style.transform = "none";
      }
      if (tooltipRect.left < 0) {
        tooltip.style.left = "0";
        tooltip.style.right = "auto";
        tooltip.style.transform = "none";
      }
    });

    marker.appendChild(tooltip);
    markerContainer.appendChild(marker);
  });
}
window.addEventListener("scroll", () => {
  const progress = document.querySelector(".dharma");
  const gif = document.querySelector(".karma");
  const markers = document.querySelectorAll(".vritti");
  const scrolled = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const percentScrolled = Math.min((scrolled / maxScroll) * 100, 100);

  if (scrolled > 0) {
    progress.style.width = `${percentScrolled}%`;
    gif.style.display = "block";
    const scrollTop = window.scrollY || window.pageYOffset;
    const rotation = scrollTop * 0.7;
    const viewportWidth = document.documentElement.clientWidth;
    const position = (percentScrolled * viewportWidth) / 100;
    gif.style.left = `${position - 7}px`;
    gif.style.transform = `rotate(${rotation}deg)`;
    markers.forEach((marker) => (marker.style.display = "block"));
  } else {
    progress.style.width = "0%";
    gif.style.display = "none";
    markers.forEach((marker) => (marker.style.display = "none"));
  }

  if (
    scrolled + window.innerHeight >=
    document.documentElement.scrollHeight - 1
  ) {
    gif.style.display = "none";
  }

  if (window.innerWidth <= 820) {
    toggleHeaderShadow(50);
  } else {
    toggleHeaderShadow(100);
  }
});

function fixTocItemsIndent() {
  document.querySelectorAll("#TableOfContents a").forEach(($tocItem) => {
    const itemId = $tocItem.getAttribute("href").substring(1);
    $tocItem.classList.add(
      HEADING_TO_TOC_CLASS[document.getElementById(itemId).tagName],
    );
  });
}

function createScrollSpy() {
  var elements = document.querySelectorAll("#toc a");
  document.addEventListener("scroll", function () {
    elements.forEach(function (element) {
      const boundingRect = document
        .getElementById(element.getAttribute("href").substring(1))
        .getBoundingClientRect();
      if (boundingRect.top <= 55 && boundingRect.bottom >= 0) {
        elements.forEach(function (elem) {
          elem.classList.remove("active");
        });
        element.classList.add("active");
      }
    });
  });
}

function toggleHeaderShadow(scrollY) {
  if (window.scrollY > scrollY) {
    document.querySelectorAll(".header").forEach(function (item) {
      item.classList.add("header-shadow");
    });
  } else {
    document.querySelectorAll(".header").forEach(function (item) {
      item.classList.remove("header-shadow");
    });
  }
}

function setThemeByUserPref() {
  darkThemeCss = document.getElementById("dark-theme");
  const savedTheme =
    localStorage.getItem(THEME_PREF_STORAGE_KEY) ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");
  const darkThemeToggles = document.querySelectorAll(".dark-theme-toggle");
  setTheme(savedTheme, darkThemeToggles);
  darkThemeToggles.forEach((el) =>
    el.addEventListener("click", toggleTheme, { capture: true }),
  );
}

function toggleTheme(event) {
  toggleIcon = event.currentTarget.querySelector("a svg.feather");
  if (toggleIcon.classList[1] === THEME_TO_ICON_CLASS.dark) {
    setThemeAndStore("light", [event.currentTarget]);
  } else if (toggleIcon.classList[1] === THEME_TO_ICON_CLASS.light) {
    setThemeAndStore("dark", [event.currentTarget]);
  }
}

function setTheme(themeToSet, targets) {
  darkThemeCss.disabled = themeToSet === "light";
  targets.forEach((target) => {
    target.querySelector("a").innerHTML =
      feather.icons[THEME_TO_ICON_CLASS[themeToSet].split("-")[1]].toSvg();
    target.querySelector(
      ".dark-theme-toggle-screen-reader-target",
    ).textContent = [THEME_TO_ICON_TEXT_CLASS[themeToSet]];
  });
}

function setThemeAndStore(themeToSet, targets) {
  setTheme(themeToSet, targets);
  localStorage.setItem(THEME_PREF_STORAGE_KEY, themeToSet);
}
document.addEventListener("DOMContentLoaded", () => {
  const navAvatar = document.querySelector(".nav-avatar");
  const mainAvatar = document.querySelector(".main-avatar");
  let lastScrollPosition = 0;
  const scrollThreshold = window.innerHeight * 0.05;

  function handleScroll() {
    const scrollPosition = window.scrollY;

    if (
      scrollPosition > scrollThreshold &&
      lastScrollPosition <= scrollThreshold
    ) {
      mainAvatar.classList.add("animate-out");
      mainAvatar.classList.add("animate-in");
      navAvatar.classList.remove("animate-out");
      setTimeout(() => {
        mainAvatar.classList.add("hidden");
        navAvatar.classList.add("visible");
      }, 333);
    } else if (
      scrollPosition <= scrollThreshold &&
      lastScrollPosition > scrollThreshold
    ) {
      navAvatar.classList.add("animate-out");
      setTimeout(() => {
        navAvatar.classList.remove("visible");
        mainAvatar.classList.add("animate-in");
        mainAvatar.classList.remove("hidden");
        mainAvatar.classList.remove("animate-out");
      }, 333);
    }

    lastScrollPosition = scrollPosition;
  }

  let ticking = false;
  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    },
    { passive: true },
  );
});
