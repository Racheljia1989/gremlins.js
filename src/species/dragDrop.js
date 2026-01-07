const getDefaultConfig = (randomizer, window) => {
    const document = window.document;
    const body = document.body;

    const defaultDragTypes = [
        'drag',
        'drag',
        'drag',
        'dragdrop',
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

    const defaultShowAction = (startPos, endPos) => {
        // 显示拖拽路径
        const dragSignal = document.createElement('div');
        dragSignal.style.zIndex = 2000;
        dragSignal.style.border = '2px dashed green';
        dragSignal.style.position = 'absolute';
        dragSignal.style.pointerEvents = 'none';
        dragSignal.style.width = Math.abs(endPos[0] - startPos[0]) + 'px';
        dragSignal.style.height = Math.abs(endPos[1] - startPos[1]) + 'px';
        dragSignal.style.left = Math.min(startPos[0], endPos[0]) + 'px';
        dragSignal.style.top = Math.min(startPos[1], endPos[1]) + 'px';
        dragSignal.style.opacity = '0.3';
        dragSignal.style.background = 'rgba(0, 255, 0, 0.1)';

        const element = body.appendChild(dragSignal);
        setTimeout(() => {
            body.removeChild(element);
        }, 1000);
        setTimeout(() => {
            element.style.opacity = 0;
        }, 800);
    };

    const defaultCanDrag = () => {
        return true;
    };

    return {
        dragTypes: defaultDragTypes,
        positionSelector: defaultPositionSelector,
        showAction: defaultShowAction,
        canDrag: defaultCanDrag,
        maxNbTries: 10,
        maxDragDistance: 300,
        log: false,
    };
};

export default (userConfig) => ({ logger, randomizer, window }) => {
    const document = window.document;
    const config = { ...getDefaultConfig(randomizer, window), ...userConfig };

    return () => {
        let startPosition;
        let startX;
        let startY;
        let startElement;
        let nbTries = 0;

        // 找到起始元素
        do {
            startPosition = config.positionSelector();
            startX = startPosition[0];
            startY = startPosition[1];
            startElement = document.elementFromPoint(startX, startY);
            nbTries++;
            if (nbTries > config.maxNbTries) return;
        } while (!startElement || !config.canDrag(startElement));

        // 生成结束位置
        const dragDistance = randomizer.natural({
            max: config.maxDragDistance,
        });
        const angle = randomizer.floating({ min: 0, max: 2 * Math.PI });
        const endX = Math.max(
            0,
            Math.min(
                document.documentElement.clientWidth - 1,
                startX + Math.cos(angle) * dragDistance
            )
        );
        const endY = Math.max(
            0,
            Math.min(
                document.documentElement.clientHeight - 1,
                startY + Math.sin(angle) * dragDistance
            )
        );
        const endElement = document.elementFromPoint(endX, endY);

        const dragType = randomizer.pick(config.dragTypes);

        // 创建拖拽事件序列
        const createMouseEvent = (type, x, y, element) => {
            const evt = document.createEvent('MouseEvents');
            evt.initMouseEvent(
                type,
                true,
                true,
                window,
                0,
                0,
                0,
                x,
                y,
                false,
                false,
                false,
                false,
                0,
                null
            );
            return evt;
        };

        // 触发拖拽开始
        const dragStartEvent = createMouseEvent('mousedown', startX, startY, startElement);
        startElement.dispatchEvent(dragStartEvent);

        // 触发拖拽事件
        const dragEvent = createMouseEvent('drag', startX, startY, startElement);
        startElement.dispatchEvent(dragEvent);

        // 触发拖拽结束
        setTimeout(() => {
            const dragEndEvent = createMouseEvent('mouseup', endX, endY, endElement || startElement);
            (endElement || startElement).dispatchEvent(dragEndEvent);

            // 触发drop事件
            if (endElement && endElement !== startElement) {
                const dropEvent = createMouseEvent('drop', endX, endY, endElement);
                endElement.dispatchEvent(dropEvent);
            }
        }, 50);

        if (typeof config.showAction === 'function') {
            config.showAction([startX, startY], [endX, endY]);
        }

        if (logger && config.log) {
            logger.log(
                'gremlin',
                'dragDrop  ',
                dragType,
                'from',
                startX,
                startY,
                'to',
                endX,
                endY
            );
        }
    };
};

