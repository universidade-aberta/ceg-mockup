/* global GutenbergBlockContentsMenuSettings  */
(function () {
    window.addEventListener("DOMContentLoaded", function () {
        const menus = document.querySelectorAll(".gbcm-menu-container");
        if (
            Element.prototype.closest &&
            "forEach" in menus &&
            menus.length > 0
        ) {
            menus.forEach(function (menu) {
                menu.setAttribute("tabindex", "0");
                menu.setAttribute("accesskey", "i");

                const menuTitle = menu.querySelector(".gbcm-title");
                if (menuTitle) {
                    menuTitle.setAttribute("role", "presentation");
                    menuTitle.setAttribute("aria-hidden", true);
                }

                if (
                    !getComputedStyle(menu).getPropertyValue(
                        "--disable-menu-toggling"
                    )
                ) {
                    const menuBtn = document.createElement("span");
                    menuBtn.setAttribute("role", "button");
                    menuBtn.classList.add("gbcm-menu-toggle");
                    menuBtn.setAttribute(
                        "aria-controls",
                        menu.getAttribute("id")
                    );
                    menuBtn.setAttribute("aria-expanded", "false");
                    menuBtn.setAttribute("tabindex", "0");
                    menu.parentNode.insertBefore(menuBtn, menu);
                    menuBtn.menuEl = menuBtn.closest(".gbcm");

                    if (menuBtn.menuEl) {
                        menuBtn.menuEl.setAttribute("aria-expanded", "false");
                        if (
                            menuBtn.menuEl.getAttribute("aria-label")?.length <=
                            0
                        ) {
                            menuBtn.menuEl.setAttribute(
                                "aria-label",
                                GutenbergBlockContentsMenuSettings.label__menu_of_contents
                            );
                        }
                    }

                    if (menu) {
                        menuBtn.menu = menu;

                        menuBtn.updateMenuState = function (state) {
                            this.setAttribute("aria-expanded", state);

                            if (this.menu) {
                                this.menu.classList.toggle(
                                    "menu-expanded",
                                    state
                                );
                                this.menu.classList.toggle(
                                    "menu-collapsed",
                                    !state
                                );
                                this.menu.setAttribute("aria-hidden", !state);
                            }

                            if (this.menuEl && this.menuEl.classList) {
                                this.menuEl.classList.toggle("expanded", state);
                                this.menuEl.classList.toggle(
                                    "collapsed",
                                    !state
                                );
                            }

                            const elExpandLabel = menuBtn.menuEl.getAttribute(
                                "data-expand-menu-label"
                            );
                            const elCollapseLabel = menuBtn.menuEl.getAttribute(
                                "data-collapse-menu-label"
                            );
                            const expandLabel =
                                elExpandLabel?.length <= 0
                                    ? GutenbergBlockContentsMenuSettings.label__expand_menu
                                    : elExpandLabel;
                            const collapseLabel =
                                elCollapseLabel?.length <= 0
                                    ? GutenbergBlockContentsMenuSettings.label__collapse_menu
                                    : elCollapseLabel;

                            menuBtn.setAttribute(
                                "title",
                                state ? collapseLabel : expandLabel
                            );
                            menuBtn.setAttribute(
                                "aria-label",
                                state ? collapseLabel : expandLabel
                            );

                            document.body.classList.toggle(
                                "gbcm-expanded",
                                state
                            );
                            document.body.classList.toggle(
                                "gbcm-collapsed",
                                !state
                            );
                        };

                        menuBtn.toggleMenuState = function () {
                            const state =
                                this.getAttribute("aria-expanded") == "true";
                            this.updateMenuState(!state);
                        };

                        menuBtn.addEventListener(
                            "click",
                            menuBtn.toggleMenuState
                        );

                        menu.parentNode.menuBtn = menuBtn;
                        menu.parentNode.addEventListener("keyup", function (e) {
                            if (e.keyCode === 13) {
                                this.menuBtn.toggleMenuState();
                            }
                        });
                        menu.parentNode.addEventListener(
                            "focusout",
                            function () {
                                this.timer = setTimeout(
                                    function () {
                                        this.menuBtn.updateMenuState(false);
                                        this.timer = null;
                                    }.bind(this),
                                    100
                                );
                            }
                        );
                        menu.parentNode.addEventListener(
                            "focusin",
                            function () {
                                if (this.timer) {
                                    clearTimeout(this.timer);
                                }
                            }
                        );
                        menuBtn.updateMenuState(
                            menuBtn.getAttribute("aria-expanded") == "true"
                        );
                    }
                }
            });
        }

        let menuItems = document.querySelectorAll(
            ".gbcm-menu-container .gbcm-menuitems a"
        );
        if (!!menuItems) {
            menuItems = [].slice.call(menuItems, 0);
            menuItems.reverse();
            const scroll = function () {
                if (menuItems && menuItems.length > 0) {
                    for (let i in menuItems) {
                        const menuItem = menuItems[i];
                        if (menuItem.classList.contains("gbcm-scroll-to-top")) {
                            continue;
                        }
                        const regex = /^#(.+)$/;
                        let match;
                        if (
                            (match = regex.exec(
                                menuItem.getAttribute("href")
                            )) !== null
                        ) {
                            if (match[1]) {
                                const section = document.getElementById(
                                    match[1]
                                );

                                if (
                                    section != null &&
                                    section.getBoundingClientRect().top <
                                        window.innerHeight
                                ) {
                                    if (
                                        !menuItem.classList.contains("active")
                                    ) {
                                        const activeItems =
                                            document.querySelectorAll(
                                                ".gbcm-menu-container .gbcm-menuitems a.active"
                                            );
                                        if (
                                            "forEach" in activeItems &&
                                            activeItems.length > 0
                                        ) {
                                            activeItems.forEach(function (
                                                activeItem
                                            ) {
                                                if (
                                                    "classList" in activeItem &&
                                                    "remove" in
                                                        activeItem.classList
                                                ) {
                                                    activeItem.classList.remove(
                                                        "active"
                                                    );
                                                }
                                            });
                                        }
                                        menuItem.classList.add("active");
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }
            };

            window.addEventListener("scroll", scroll);
            scroll();
        }
    });
})();
