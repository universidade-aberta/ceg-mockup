((settings) => {
    const constants = {
        cssClass: settings.cssClass,
        paneCssClass: settings.paneCssClass,
    };

    const togglePane = (btn, show, toggle = true) => {
        const paneId = btn.getAttribute("aria-controls");
        const expanded =
            btn.getAttribute("aria-expanded").toLowerCase() === "true";
        const parentEl = btn.closest(`.${constants.paneCssClass}`);
        if (!!paneId && !!parentEl) {
            const pane = parentEl.querySelector(`#${paneId}`);
            if (!!pane) {
                if (show === undefined || show === null) {
                    show = toggle ? !expanded : expanded;
                }
                pane.setAttribute("aria-hidden", !show);
                btn.setAttribute("aria-expanded", show);
                parentEl.classList.toggle("panel-expanded", show);
                parentEl.classList.toggle("panel-collapsed", !show);
            }
        }
    };

    const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
            entry.target.style.setProperty(
                "--height",
                entry.target.scrollHeight + 20 + "px"
            );
        }
    });

    const expandEventHandler = (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        togglePane(ev.currentTarget, null, true);
    };

    document.querySelectorAll(`.${constants.cssClass}`).forEach((accordion) => {
        accordion
            .querySelectorAll(`.${constants.paneCssClass}`)
            .forEach((pane) => {
                const btn = pane.querySelector(
                    ":scope>.card>.card-header>div>button"
                );
                if (!btn || btn?._hasEventListener === true) {
                    return;
                }
                btn._hasEventListener = true;

                togglePane(btn, null, false);
                const paneId = btn.getAttribute("aria-controls");
                const paneContent = pane.querySelector(`#${paneId}`);
                resizeObserver.observe(paneContent);
                paneContent.style.setProperty(
                    "--height",
                    paneContent.scrollHeight + 20 + "px"
                );
                btn.addEventListener("click", expandEventHandler);
            });
    });
})(GutenbergBlockAccordionSettings);
