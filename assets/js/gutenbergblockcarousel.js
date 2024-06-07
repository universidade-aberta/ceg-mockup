document.addEventListener("DOMContentLoaded", () => {
    //const { __ } = wp.i18n;

    const __ = (en) => GutenbergBlockCarouselSettings?.translations?.[en];

    /* debounce function to execute a function only once within a time interval */
    const debounce = (func, timeout = 300) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                func.apply(this, args);
            }, timeout);
        };
    };

    /* given and object replace the placeholders in a string */
    const replacePlaceholders = (placeholders, str) =>
        str.replace(
            new RegExp(Object.keys(placeholders).join("|"), "g"),
            (matched) => placeholders[matched]
        );

    document
        .querySelectorAll(".wp-block-c3-framew-gutenberg-carousel")
        .forEach((carousel) => {
            const container = carousel.querySelector(".gbt-carousel-slides");
            const slides = Array.from(
                container.querySelectorAll(":scope > .gbt-carousel-slide")
            );

            /* no slides or there's no slider container, so no further processing is required */
            if (!container || !slides || slides.length < 1) {
                return;
            }

            /* create the indicators menu */
            const indicatorsMenu = document.createElement("ol");
            indicatorsMenu.classList.add("gbt-carousel-indicators");
            indicatorsMenu.setAttribute(
                "aria-label",
                __("Slide Selectors", "C3_FrameW")
            );
            if (!!container.id) {
                indicatorsMenu.setAttribute(
                    "aria-controls",
                    "#" + container.id
                );
            }

            const createIndicator = (
                title,
                href,
                ariaControls,
                classes,
                isAriaCurrent
            ) => {
                const indicator = document.createElement("li");
                indicator.classList.add(
                    "gbt-carousel-indicator",
                    ...(classes || [])
                );
                const indicatorLink = document.createElement("a");
                indicatorLink.setAttribute("title", title);
                indicatorLink.setAttribute("aria-label", title);
                indicatorLink.setAttribute("aria-current", isAriaCurrent);
                indicatorLink.setAttribute("role", "button");
                indicatorLink.setAttribute("href", href ?? "#");

                if (!!ariaControls) {
                    indicatorLink.setAttribute("aria-controls", ariaControls);
                }
                indicator.appendChild(indicatorLink);
                return indicator;
            };

            const indicators = Array.from(slides).map((slide, index) => {
                const href = "#" + slide.id || "";
                let title =
                    slide.querySelector(".gbt-carousel-slide-title")
                        ?.innerText ?? "";
                const indicator = createIndicator(
                    replacePlaceholders(
                        {
                            "%s": title ?? "",
                            "%d": index + 1,
                        },
                        __("Go to slide %s (%d)", "C3_FrameW")
                    ),
                    href,
                    "#" + container.id,
                    ["direct-step"],
                    index === 0
                );

                if (!!indicator) {
                    if (carousel.dataset?.hideIndicators == "true") {
                        indicator.style.display = "none";
                    } else {
                        indicator.style.opacity = "0";
                        setTimeout(() => {
                            indicator.style.removeProperty("display");
                            indicator.style.removeProperty("opacity");
                        }, 50 * (index + 1));
                    }
                    indicatorsMenu.appendChild(indicator);
                }

                return indicator;
            });

            if (indicators.length <= 1) return;

            // Previous and next slide buttons
            if (carousel.dataset?.hidePreviousAndNext != "true") {
                indicators.unshift(
                    indicatorsMenu.insertBefore(
                        createIndicator(
                            __("Previous Slide", "C3_FrameW"),
                            "#",
                            null,
                            ["go-to-previous", "step-control"],
                            false
                        ),
                        indicatorsMenu.firstChild
                    )
                );
                indicators.push(
                    indicatorsMenu.appendChild(
                        createIndicator(
                            __("Next Slide", "C3_FrameW"),
                            "#",
                            null,
                            ["go-to-next", "step-control"],
                            false
                        )
                    )
                );
            }

            container.parentElement.insertBefore(indicatorsMenu, container);

            let cycleTimer = null;
            const selectPage = (indicator) => {
                indicator.dispatchEvent(
                    new MouseEvent("click", {
                        view: indicator.ownerDocument.defaultView || window,
                        bubbles: true,
                        cancelable: true,
                        relatedTarget: indicator,
                    })
                );
            };

            const getCurrentIndicatorParent = () => {
                return carousel.querySelector(
                    `.gbt-carousel-indicators li.direct-step a[aria-current="true"]`
                )?.parentElement;
            };

            const resetInterval = (carousel) => {
                if (
                    carousel.dataset?.autoplay == "false" ||
                    isNaN(parseInt(carousel.dataset?.interval))
                )
                    return;

                if (cycleTimer !== null) {
                    clearInterval(cycleTimer);
                }
                cycleTimer = setInterval(
                    (carousel) => {
                        if (
                            !carousel.dataset.cycling ||
                            isNaN(parseInt(carousel.dataset.interval))
                        )
                            return;

                        const currentIndicatorParent =
                            getCurrentIndicatorParent();
                        const indicatorsParentChildren =
                            currentIndicatorParent.parentElement.children;
                        let nextIndex, direction;
                        for (let i = 1; i <= 2; i++) {
                            direction = carousel.dataset.slideDirection =
                                parseInt(
                                    carousel.dataset?.slideDirection ?? "1"
                                );
                            nextIndex =
                                direction * 1 +
                                Array.from(indicatorsParentChildren).indexOf(
                                    currentIndicatorParent
                                );
                            if (
                                !indicatorsParentChildren[nextIndex] ||
                                !indicatorsParentChildren[
                                    nextIndex
                                ].classList.contains("direct-step")
                            ) {
                                carousel.dataset.slideDirection =
                                    direction * -1;
                            }
                        }
                        const nextIndicator =
                            indicatorsParentChildren[nextIndex];
                        if (
                            !(
                                !nextIndicator ||
                                !nextIndicator.classList.contains("direct-step")
                            )
                        ) {
                            selectPage(nextIndicator.querySelector(":scope>a"));
                        }
                    },
                    carousel.dataset.interval,
                    carousel
                );
            };

            /* // Hook click event */
            indicators.forEach((indicator) => {
                indicator.addEventListener("click", (event) => {
                    const link = event.target;
                    const href = link.getAttribute("href");
                    const indicator = link.parentElement;

                    if (!indicator) return;

                    /* // Handle previous and next buttons triggering */
                    if (
                        indicator.classList.contains("go-to-previous") ||
                        indicator.classList.contains("go-to-next")
                    ) {
                        const currentIndicatorParent =
                            getCurrentIndicatorParent();
                        const indicatorsSet = Array.from(
                            indicator.parentElement.querySelectorAll(
                                "li.direct-step"
                            )
                        );
                        const goToIndicator =
                            indicatorsSet?.[
                                indicatorsSet.indexOf(currentIndicatorParent) +
                                    (indicator.classList.contains(
                                        "go-to-previous"
                                    )
                                        ? -1
                                        : 1)
                            ];
                        if (!!goToIndicator) {
                            selectPage(goToIndicator.querySelector(":scope>a"));
                        }
                        event.preventDefault();
                        return;
                    }

                    if (!href || href === "#") return;
                    const slide = container.querySelector(href);
                    if (!slide) return;

                    if (!container) return;

                    carousel.dataset.cycling = true;

                    slide.style.removeProperty("scrollSnapAlign");
                    container.scrollTo({
                        top: 0,
                        left:
                            slide.offsetLeft -
                            Math.floor(
                                container.offsetWidth / slide.offsetWidth / 2
                            ) *
                                slide.offsetWidth,
                        behavior: "smooth",
                    });
                    const carouselChildren = Array.from(
                        slide.parentElement.children
                    );
                    const slideIndex = carouselChildren.indexOf(slide);
                    slides.forEach((s, index) => {
                        s.setAttribute("aria-current", slideIndex === index);
                        const sIndex = carouselChildren.indexOf(s);
                        s.classList.toggle("prev-sibling", sIndex < slideIndex);
                        s.classList.toggle(
                            "prev-close-sibling",
                            sIndex === slideIndex - 1
                        );
                        s.classList.toggle("next-sibling", sIndex > slideIndex);
                        s.classList.toggle(
                            "next-close-sibling",
                            sIndex === slideIndex + 1
                        );
                    });

                    event.preventDefault();

                    resetInterval(carousel);
                });
            });

            const setIndicatorColor = (indicator, slide = null) => {
                if (
                    carousel.dataset?.hideIndicators == "true" &&
                    carousel.dataset?.hidePreviousAndNext == "true"
                )
                    return;

                if (!!slide) {
                    slide =
                        carousel.querySelector(
                            indicator.getAttribute("href") ?? "null"
                        ) ?? null;
                }
                if (!!slide) {
                    indicator
                        .closest(".gbt-carousel-indicators")
                        .style.setProperty(
                            "--slide-color",
                            getComputedStyle(slide).getPropertyValue(
                                "--slide-color"
                            ) ?? "#fff"
                        );
                }
            };

            /* // Observe slide intersection and set the active indicator accordingly */
            const deferredUpdate = debounce((indicator) => {
                const currentIndicator = carousel.querySelector(
                    `.gbt-carousel-indicators li.direct-step > a[aria-current="true"]`
                );
                if (!!currentIndicator) {
                    selectPage(currentIndicator);
                }
            }, 500);
            if (slides.length > 0 && !!container) {
                const observer = new IntersectionObserver(
                    (entries, observer) => {
                        entries.forEach((entry) => {
                            const indicator = carousel.querySelector(
                                `.gbt-carousel-indicators a[href="#${entry.target.id}"]`
                            );
                            if (!indicator) return;
                            indicator.setAttribute(
                                "aria-current",
                                entry.isIntersecting
                            );

                            if (entry.isIntersecting) {
                                setIndicatorColor(indicator, entry.target);
                            }

                            deferredUpdate(
                                entry.isIntersecting ? indicator : null
                            );
                        });
                    },
                    {
                        root: container,
                        rootMargin: `1px`,
                        threshold: 1.0,
                    }
                );

                slides.forEach((slide) => {
                    observer.observe(slide);
                });
            }

            /* // Set the default click on the slides which are not active to activate them */
            slides.forEach((slide) => {
                const link = slide.querySelector(":scope>a");
                if (!!link) {
                    link.addEventListener("click", (ev) => {
                        const slide = link.parentElement;
                        const indicator = carousel.querySelector(
                            '.gbt-carousel-indicators li a[href="#' +
                                slide?.id +
                                '"]'
                        );
                        if (
                            !!slide &&
                            slide.getAttribute("aria-current") !== "true" &&
                            !!indicator &&
                            !!slide.id &&
                            slide.id.length > 0
                        ) {
                            selectPage(indicator);
                            ev.preventDefault();
                        }
                    });
                }
            });

            /* Pause the cycling on mouse over  */
            const observer = new IntersectionObserver(
                (entries, obs) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            /* // Cycle */
                            if (
                                carousel.dataset?.autoplay != "false" ||
                                !isNaN(carousel.dataset.interval)
                            ) {
                                carousel.dataset.cycling = true;
                                carousel.addEventListener(
                                    "mouseenter",
                                    (event) =>
                                        (carousel.dataset.cycling = false),
                                    false
                                );
                                carousel.addEventListener(
                                    "mouseleave",
                                    (event) =>
                                        (carousel.dataset.cycling = true),
                                    false
                                );
                            }
                            /* //selectPage(indicators[0]); */
                        }
                    });
                },
                {
                    root: null,
                    rootMargin: "0%",
                    threshold: 0.25,
                }
            );
            observer.observe(carousel);

            /* // Select first page */
            const firstIndicator = carousel.querySelector(
                `.gbt-carousel-indicators li.direct-step > a`
            );
            if (!!firstIndicator) {
                selectPage(firstIndicator);
            }
        });
});
