const getDefaultConfig = (randomizer, window) => {
    const document = window.document;
    const body = document.body;

    const defaultResizeTypes = [
        'resize',
        'resize',
        'resize',
        'orientationchange',
    ];

    const defaultSizeSelector = () => {
        // 生成随机窗口大小，但保持在合理范围内
        const minWidth = 320;
        const maxWidth = 1920;
        const minHeight = 240;
        const maxHeight = 1080;

        return [
            randomizer.natural({ min: minWidth, max: maxWidth }),
            randomizer.natural({ min: minHeight, max: maxHeight }),
        ];
    };

    const defaultShowAction = (width, height) => {
        const resizeSignal = document.createElement('div');
        resizeSignal.style.zIndex = 2000;
        resizeSignal.style.border = '3px solid blue';
        resizeSignal.style.background = 'rgba(0, 0, 255, 0.1)';
        resizeSignal.style.width = '200px';
        resizeSignal.style.height = '60px';
        resizeSignal.style.position = 'fixed';
        resizeSignal.style.top = '10px';
        resizeSignal.style.right = '10px';
        resizeSignal.style.padding = '10px';
        resizeSignal.style.borderRadius = '5px';
        resizeSignal.style.fontSize = '14px';
        resizeSignal.style.color = 'blue';
        resizeSignal.style.fontWeight = 'bold';
        resizeSignal.style.pointerEvents = 'none';
        resizeSignal.style.webkitTransition = 'opacity 1s ease-out';
        resizeSignal.style.mozTransition = 'opacity 1s ease-out';
        resizeSignal.style.transition = 'opacity 1s ease-out';
        resizeSignal.innerHTML = `窗口大小: ${width} x ${height}`;

        const element = body.appendChild(resizeSignal);
        setTimeout(() => {
            body.removeChild(element);
        }, 2000);
        setTimeout(() => {
            element.style.opacity = 0;
        }, 1500);
    };

    return {
        resizeTypes: defaultResizeTypes,
        sizeSelector: defaultSizeSelector,
        showAction: defaultShowAction,
        log: false,
    };
};

export default (userConfig) => ({ logger, randomizer, window }) => {
    const config = { ...getDefaultConfig(randomizer, window), ...userConfig };

    return () => {
        const resizeType = randomizer.pick(config.resizeTypes);
        const size = config.sizeSelector();
        const width = size[0];
        const height = size[1];

        // 触发窗口大小调整事件
        if (resizeType === 'orientationchange') {
            // 模拟设备方向改变
            const event = document.createEvent('Event');
            event.initEvent('orientationchange', true, true);
            window.dispatchEvent(event);
        } else {
            // 触发窗口大小调整事件
            const resizeEvent = document.createEvent('Event');
            resizeEvent.initEvent('resize', true, true);
            
            // 注意：实际调整窗口大小需要浏览器API支持
            // 这里主要触发resize事件来测试应用响应
            window.dispatchEvent(resizeEvent);
            
            // 如果可能，尝试调整内部容器大小（模拟响应式布局测试）
            const viewport = document.querySelector('meta[name="viewport"]');
            if (viewport) {
                // 触发媒体查询变化
                const mediaQueryEvent = window.matchMedia(`(max-width: ${width}px)`);
                if (mediaQueryEvent.matches) {
                    window.dispatchEvent(new Event('resize'));
                }
            }
        }

        if (typeof config.showAction === 'function') {
            config.showAction(width, height);
        }

        if (logger && config.log) {
            logger.log('gremlin', 'resizer   ', resizeType, 'to', width, 'x', height);
        }
    };
};

