const getDefaultConfig = (randomizer, window) => {
    const document = window.document;

    const defaultFocusActions = [
        'focus',
        'focus',
        'blur',
        'focusblur',
    ];

    const defaultShowAction = (element, action) => {
        if (typeof element.attributes['data-old-outline'] === 'undefined') {
            element.attributes['data-old-outline'] = element.style.outline;
        }

        const oldOutline = element.attributes['data-old-outline'];
        const color = action === 'focus' ? 'blue' : 'red';
        element.style.outline = `2px solid ${color}`;

        setTimeout(() => {
            element.style.outline = oldOutline;
        }, 500);
    };

    const defaultCanFocus = () => {
        return true;
    };

    return {
        focusActions: defaultFocusActions,
        showAction: defaultShowAction,
        canFocus: defaultCanFocus,
        maxNbTries: 10,
        log: false,
    };
};

export default (userConfig) => ({ logger, randomizer, window }) => {
    const document = window.document;
    const config = { ...getDefaultConfig(randomizer, window), ...userConfig };

    return () => {
        // 查找所有可聚焦的元素
        const focusableSelectors = [
            'input',
            'textarea',
            'select',
            'button',
            'a[href]',
            '[tabindex]:not([tabindex="-1"])',
        ];
        const focusableElements = document.querySelectorAll(focusableSelectors.join(','));

        if (focusableElements.length === 0) return;

        let element;
        let nbTries = 0;

        do {
            element = randomizer.pick(focusableElements);
            nbTries++;
            if (nbTries > config.maxNbTries) return;
        } while (!element || !config.canFocus(element));

        const focusAction = randomizer.pick(config.focusActions);

        if (focusAction === 'focus') {
            // 聚焦元素
            if (typeof element.focus === 'function') {
                element.focus();
            }
            const focusEvent = document.createEvent('Event');
            focusEvent.initEvent('focus', true, true);
            element.dispatchEvent(focusEvent);
        } else if (focusAction === 'blur') {
            // 失焦元素
            if (typeof element.blur === 'function') {
                element.blur();
            }
            const blurEvent = document.createEvent('Event');
            blurEvent.initEvent('blur', true, true);
            element.dispatchEvent(blurEvent);
        } else if (focusAction === 'focusblur') {
            // 先聚焦再失焦
            if (typeof element.focus === 'function') {
                element.focus();
            }
            const focusEvent = document.createEvent('Event');
            focusEvent.initEvent('focus', true, true);
            element.dispatchEvent(focusEvent);

            setTimeout(() => {
                if (typeof element.blur === 'function') {
                    element.blur();
                }
                const blurEvent = document.createEvent('Event');
                blurEvent.initEvent('blur', true, true);
                element.dispatchEvent(blurEvent);
            }, 100);
        }

        if (typeof config.showAction === 'function') {
            config.showAction(element, focusAction);
        }

        if (logger && config.log) {
            logger.log('gremlin', 'focusBlur ', focusAction, 'on', element);
        }
    };
};

