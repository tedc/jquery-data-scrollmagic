;(function($) {
    'use strict';

    var controller = null;
    
    var TYPE_PIN = "pin",
        TYPE_TWEEN = "tween",
        TYPE_FADEIN = "fadein",
        TYPE_FADEOUT = "fadeout",
        TYPE_CLASS = "class",
        TYPE_PARALLAX = "parallax",
        TYPE_NAVBAR = "navbar";

    $.fn.ScrollMagic = function(options) {
        var scenes = [];
        this.each(function(i, element) {
            scenes = scenes.concat(createMultipleScenes(element, options));
        });
        return scenes.length == 1 ? scenes[0] : scenes;
    };

    $.ScrollMagic = {
        TYPE_PIN: TYPE_PIN,
        TYPE_TWEEN: TYPE_TWEEN,
        TYPE_FADEIN: TYPE_FADEIN,
        TYPE_FADEOUT: TYPE_FADEOUT,
        TYPE_CLASS: TYPE_CLASS,
        TYPE_NAVBAR: TYPE_NAVBAR,
        TYPE_PARALLAX: TYPE_PARALLAX,
        getController: getController,
        destroyController: destroyController
    };

    function getController() {
        if (controller == null) {
            controller = new ScrollMagic.Controller();
        }
        return controller;
    }

    function destroyController(reset) {
        if (controller != null) {
            controller.destroy(reset);
            controller = null;
        }
    }

    function createMultipleScenes(element, options) {
        options || (options = {});
        var $element = $(element);
        var types = (options.type || $element.data("sm") || "").split(",");
        var scenes = [];
        for (var i=0; i<types.length; i++) {
            scenes.push(createSingleScene(element, types[i], options));
        }
        return scenes;
    }

    function createSingleScene(element, type, options) {
        var $dataElement = $(options.dataElement || element);
        switch (type) {
            case TYPE_PIN:
                var pushFollowers = $dataElement.data("smPushFollowers"),
                    spacerClass = $dataElement.data("smPinSpacerClass");
                options = $.extend({
                    triggerElement: $dataElement.data("smPinTrigger"),
                    triggerHook: $dataElement.data("smPinHook"),
                    duration: $dataElement.data("smPinDuration"),
                    settings: {
                        pushFollowers: typeof(pushFollowers) == "undefined" ? true : pushFollowers,
                        spacerClass: spacerClass
                    },
                    classes: $dataElement.data("smPinClasses"),
                    addIndicators: $dataElement.data("smAddIndicators")
                }, options);
                return createPinScene(element, options);
            case TYPE_TWEEN:
                options = $.extend({
                    params: $dataElement.data("smTweenParams"),
                    triggerElement: $dataElement.data("smTweenTrigger"),
                    triggerHook: $dataElement.data("smTweenHook"),
                    duration: $dataElement.data("smTweenDuration"),
                    addIndicators: $dataElement.data("smAddIndicators")
                }, options);
                return createTweenScene(element, options);
            case TYPE_FADEIN:
                options = $.extend({
                    params: {opacity: 1},
                    triggerElement: $dataElement.data("smFadeinTrigger"),
                    triggerHook: $dataElement.data("smFadeinHook"),
                    duration: $dataElement.data("smFadeinDuration"),
                    addIndicators: $dataElement.data("smAddIndicators")
                }, options);
                return createTweenScene(element, options);
            case TYPE_FADEOUT:
                options = $.extend({
                    params: {opacity: 0},
                    triggerElement: $dataElement.data("smFadeoutTrigger"),
                    triggerHook: $dataElement.data("smFadeoutHook"),
                    duration: $dataElement.data("smFadeoutDuration"),
                    addIndicators: $dataElement.data("smAddIndicators")
                }, options);
                return createTweenScene(element, options);
            case TYPE_CLASS:
                options = $.extend({
                    element: $dataElement.data("smClassElement"),
                    classes: $dataElement.data("smClassClasses"),
                    toggle: $dataElement.data("smClassToggle"),
                    triggerElement: $dataElement.data("smClassTrigger"),
                    triggerHook: $dataElement.data("smClassHook"),
                    duration: $dataElement.data("smClassDuration"),
                    addIndicators: $dataElement.data("smAddIndicators")
                }, options);
                return createClassToggleScene(element, options);
            case TYPE_PARALLAX:
                options = $.extend({
                    element: $dataElement.data("smParallaxElement"),
                    params: $dataElement.data("smParallaxParams"),
                    triggerElement: $dataElement.data("smParallaxTrigger"),
                    triggerHook: $dataElement.data("smParallaxHook"),
                    duration: $dataElement.data("smParallaxDuration"),
                    addIndicators: $dataElement.data("smAddIndicators")
                }, options);
                return createParallaxScene(element, options);
            // better use bootstrap's scrollspy
            case TYPE_NAVBAR:
                options = $.extend({
                    element: $dataElement.data("smNavbarElement"),
                    itemSelector: $dataElement.data("smNavbarItemSelector"),
                    activeSelector: $dataElement.data("smNavbarActiveSelector"),
                    classes: $dataElement.data("smNavbarClasses"),
                    triggerElement: $dataElement.data("smNavbarTrigger"),
                    triggerHook: $dataElement.data("smNavbarHook"),
                    duration: $dataElement.data("smNavbarDuration"),
                    addIndicators: $dataElement.data("smAddIndicators")
                }, options);
                return createNavbarScene(element, options);
            default:
                return createScene(element, options);
        }
    }

    function createPinScene(element, options) {
        options.events = $.extend({
            "enter leave": function(e) {
                var method = e.type == "enter" ? "addClass" : "removeClass";
                $(element)[method](options.classes || "sm-pinned");
            }
        }, options.events || {});
        return createScene(element, options)
            .setPin(element, options.settings);
    }

    function createTweenScene(element, options) {
        return createScene(element, options)
            .setTween(element, options.params);
    }

    function createClassToggleScene(element, options) {
        return createScene(element, options)
            .setClassToggle(options.element || element, options.classes, options.toggle);
    }

    function createNavbarScene(element, options) {
        var itemSelector = options.itemSelector || "ul.navbar-nav > li",
            activeSelector = options.activeSelector || "[href=#"+$(element).attr("id")+"]",
            classes = options.classes || "active";
        if (typeof(options.duration) == "undefined") {
            options.duration = "100%";
        }
        options.events = $.extend({
            "leave enter": function(e) {
                var $navbar = $(options.element);
                if (e.type != "leave" || $navbar.find("."+classes.split(" ")[0]+" "+activeSelector).length) {
                    var $items = $navbar.find(itemSelector);
                    $items.removeClass(classes);
                    if (e.type == "enter") {
                        $items.filter(function() {
                            return $(this).find(activeSelector).length > 0;
                        }).addClass(classes);
                    }
                }
            }
        }, options.events || {});
        return createScene(element, options);
    }

    function createParallaxScene(element, options) {
        return createScene(element, options)
            .setParallax(options.element || element, options.params);
    }

    function createScene(element, options) {
        var triggerElement = options.triggerElement || element;
        if (typeof triggerElement == "function") {
            triggerElement = triggerElement.call(element);
        }
        var scene = new ScrollMagic.Scene({
            triggerElement: triggerElement,
            triggerHook: options.triggerHook || 0,
            duration: parseDuration(options.duration || 0, triggerElement)
        });
        if (options.events) {
            for (var event in options.events) {
                scene.on(event, options.events[event]);
            }
        }
        if (options.addIndicators) {
            scene.addIndicators();
        }
        scene.addTo(options.controller || getController());
        return scene;
    }

    function parseDuration(val, triggerElement) {
        if (typeof(val) == "string") {
            if (val.match(/^(\.|\d)*\d+%$/)) {
                // override percentage to refer to triggerElement height
                var perc = parseFloat(val) / 100;
                val = function() {
                    return $(triggerElement).outerHeight(true) * perc;
                }
            }
            else if (val.match(/^(\.|\d)*\d+v$/)) {
                // make use of default percentage implementation, which refers to controller height
                val = val.slice(0, -1) + "%";
            }
        }
        return val;
    }
})(jQuery);