const getDefaultConfig = (randomizer, window) => {
    const document = window.document;
    const body = document.body;

    const defaultMenuActions = [
        'contextmenu',
        'contextmenu',
        'contextmenu',
    ];

    const defaultPositionSelector = () => {
        return [
            randomizer.natural({
                max: Math.max(0, document.documentElement.clientWidth - 1),
            }),
            randomizer.natural({
                max: Math.max(0, document.documentElement.clientHeight - 1),
            }),
        ];
    };

    const defaultShowAction = (x, y) => {
        const menuSignal = document.createElement('div');
        menuSignal.style.zIndex = 2000;
        menuSignal.style.border = '3px solid purple';
        menuSignal.style['border-radius'] = '50%'; // Chrome
        menuSignal.style.borderRadius = '50%'; // Mozilla
        menuSignal.style.width = '40px';
        menuSignal.style.height = '40px';
        menuSignal.style['box-sizing'] = 'border-box';
        menuSignal.style.position = 'absolute';
        menuSignal.style.webkitTransition = 'opacity 1s ease-out';
        menuSignal.style.mozTransition = 'opacity 1s ease-out';
        menuSignal.style.transition = 'opacity 1s ease-out';
        menuSignal.style.left = x - 20 + 'px';
        menuSignal.style.top = y - 20 + 'px';
        menuSignal.style.background = 'rgba(128, 0, 128, 0.2)';

        const element = body.appendChild(menuSignal);
        setTimeout(() => {
            body.removeChild(element);
        }, 1000);
        setTimeout(() => {
            element.style.opacity = 0;
        }, 50);
    };

    const defaultCanShowMenu = () => {
        return true;
    };

    return {
        menuActions: defaultMenuActions,
        positionSelector: defaultPositionSelector,
        showAction: defaultShowAction,
        canShowMenu: defaultCanShowMenu,
        maxNbTries: 10,
        log: false,
    };
};

export default (userConfig) => ({ logger, randomizer, window }) => {
    const document = window.document;
    const config = { ...getDefaultConfig(randomizer, window), ...userConfig };

    return () => {
        let position;
        let posX;
        let posY;
        let targetElement;
        let nbTries = 0;

        do {
            position = config.positionSelector();
            posX = position[0];
            posY = position[1];
            targetElement = document.elementFromPoint(posX, posY);
            nbTries++;
            if (nbTries > config.maxNbTries) return;
        } while (!targetElement || !config.canShowMenu(targetElement));

        const menuAction = randomizer.pick(config.menuActions);

        // 创建右键菜单事件
        const evt = document.createEvent('MouseEvents');
        evt.initMouseEvent(
            'contextmenu',
            true,
            true,
            window,
            0,
            0,
            0,
            posX,
            posY,
            false,
            false,
            false,
            false,
            2, // 右键按钮
            null
        );

        // 阻止默认行为（如果可能）
        evt.preventDefault = () => {};
        targetElement.dispatchEvent(evt);

        if (typeof config.showAction === 'function') {
            config.showAction(posX, posY);
        }

        if (logger && config.log) {
            logger.log('gremlin', 'contextMenu', menuAction, 'at', posX, posY);
        }
    };
};

