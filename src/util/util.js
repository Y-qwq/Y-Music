/**
 * 防抖函数，返回函数连续调用时，空闲时间必须大于或等于 wait，func 才会执行
 *
 * @param  {function} func        回调函数
 * @param  {number}   wait        表示时间窗口的间隔
 * @param  {boolean}  immediate   设置为ture时，是否立即调用函数
 * @return {function}             返回客户调用函数
 */
export function debounce(func, wait = 200, immediate = false) {
    let timer, context, args

    // 延迟执行函数
    const later = () => setTimeout(() => {
        // 延迟函数执行完毕，清空缓存的定时器序号
        timer = null
        // 延迟执行的情况下，函数会在延迟函数中执行
        // 使用到之前缓存的参数和上下文
        if (!immediate) {
            func.apply(context, args)
            context = args = null
        }
    }, wait)

    // 这里返回的函数是每次实际调用的函数
    return function (...params) {
        // 如果没有创建延迟执行函数（later），就创建一个
        if (!timer) {
            timer = later()
            // 如果是立即执行，调用函数
            // 否则缓存参数和调用上下文
            if (immediate) {
                func.apply(this, params)
            } else {
                context = this
                args = params
            }
            // 如果已有延迟执行函数（later），调用的时候清除原来的并重新设定一个
            // 这样做延迟函数会重新计时
        } else {
            clearTimeout(timer)
            timer = later()
            context = this
            args = params
        }
    }
}

// 计算播放时间
export function timeConversion(duration) {
    let minute = new Date(duration).getMinutes();
    let seconds = new Date(duration).getSeconds();
    minute = minute < 10 ? "0" + minute : minute;
    seconds = seconds < 10 ? "0" + seconds : seconds;
    return minute + ':' + seconds;
}




/**
 * 获取 blob
 * @param  {String} url 目标文件地址
 * @return {Promise} 
 */
function getBlob(url) {
    return new Promise(resolve => {
        const xhr = new XMLHttpRequest();

        xhr.open('GET', url, true);
        xhr.responseType = 'blob';
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(xhr.response);
            }
        };

        xhr.send();
    });
}

/**
 * 保存
 * @param  {Blob} blob     
 * @param  {String} filename 想要保存的文件名称
 */
function saveAs(blob, filename) {
    if (window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, filename);
    } else {
        const link = document.createElement('a');
        const body = document.querySelector('body');

        link.href = window.URL.createObjectURL(blob);
        link.download = filename;

        // fix Firefox
        link.style.display = 'none';
        body.appendChild(link);

        link.click();
        body.removeChild(link);

        window.URL.revokeObjectURL(link.href);
    }
}

/**
 * 下载
 * @param  {String} url 目标文件地址
 * @param  {String} filename 想要保存的文件名称
 */
export function download(url, filename) {
    getBlob(url).then(blob => {
        saveAs(blob, filename);
    });
}