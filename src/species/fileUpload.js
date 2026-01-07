const getDefaultConfig = (randomizer, window) => {
    const document = window.document;

    const defaultShowAction = (element, fileName) => {
        if (typeof element.attributes['data-old-border'] === 'undefined') {
            element.attributes['data-old-border'] = element.style.border;
        }

        const oldBorder = element.attributes['data-old-border'];
        element.style.border = '2px solid teal';

        setTimeout(() => {
            element.style.border = oldBorder;
        }, 500);
    };

    const defaultCanUpload = () => {
        return true;
    };

    const defaultFileGenerator = () => {
        // 生成模拟文件名
        const extensions = ['txt', 'pdf', 'jpg', 'png', 'doc', 'xls', 'zip'];
        const extension = randomizer.pick(extensions);
        const fileName = `test_file_${randomizer.string({ length: 8 })}.${extension}`;
        return fileName;
    };

    return {
        showAction: defaultShowAction,
        canUpload: defaultCanUpload,
        fileGenerator: defaultFileGenerator,
        maxNbTries: 10,
        log: false,
    };
};

export default (userConfig) => ({ logger, randomizer, window }) => {
    const document = window.document;
    const config = { ...getDefaultConfig(randomizer, window), ...userConfig };

    return () => {
        // 查找所有文件输入元素
        const fileInputs = document.querySelectorAll('input[type="file"]');

        if (fileInputs.length === 0) return;

        let element;
        let nbTries = 0;

        do {
            element = randomizer.pick(fileInputs);
            nbTries++;
            if (nbTries > config.maxNbTries) return;
        } while (!element || !config.canUpload(element));

        const fileName = config.fileGenerator();

        // 创建模拟文件对象
        // 注意：由于浏览器安全限制，无法直接设置文件输入的值
        // 这里主要触发change事件来测试应用的文件处理逻辑
        const fileEvent = document.createEvent('Event');
        fileEvent.initEvent('change', true, true);

        // 尝试设置文件（在某些测试环境中可能有效）
        try {
            // 创建一个模拟的FileList对象
            const dataTransfer = new DataTransfer();
            const file = new File(['test content'], fileName, {
                type: 'text/plain',
            });
            dataTransfer.items.add(file);

            // 如果浏览器支持，设置files属性
            if (element.files !== undefined) {
                Object.defineProperty(element, 'files', {
                    value: dataTransfer.files,
                    writable: false,
                });
            }
        } catch (e) {
            // 如果无法设置文件，至少触发change事件
            // 这在某些测试框架中可能足够
        }

        element.dispatchEvent(fileEvent);

        // 也触发input事件（某些框架监听这个）
        const inputEvent = document.createEvent('Event');
        inputEvent.initEvent('input', true, true);
        element.dispatchEvent(inputEvent);

        if (typeof config.showAction === 'function') {
            config.showAction(element, fileName);
        }

        if (logger && config.log) {
            logger.log('gremlin', 'fileUpload ', 'upload', fileName, 'to', element);
        }
    };
};

