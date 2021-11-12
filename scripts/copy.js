const fs = require('fs');
const path = require('path')

let template = []
/*
 * 复制目录、子目录，及其中的文件
 * @param src {String} 要复制的目录
 * @param dist {String} 复制到目标目录
 */
function copyDir(src, dist, callback) {
    fs.access(dist, function (err) {
        if (err) {
            // 目录不存在时创建目录
            fs.mkdirSync(dist);
        }
        _copy(null, src, dist);
    });

    function _copy(err, src, dist) {
        if (err) {
            callback(err);
        } else {
            fs.readdir(src, function (err, paths) {
                if (err) {
                    callback(err)
                } else {
                    paths.forEach(function (path) {
                        var _src = src + '/' + path;
                        var _dist = dist + '/' + path;
                        fs.stat(_src, function (err, stat) {
                            if (err) {
                                callback(err);
                            } else {
                                // 判断是文件还是目录
                                if (stat.isFile()) {
                                    if(src !== './source') {
                                        fs.writeFileSync(_dist, fs.readFileSync(_src.trim()));
                                        // console.log(_src)
                                        if (!isImage(_src) && !isKey(_src)) {
                                            setTemplate(_src)
                                        }
                                    }
                                } else if (stat.isDirectory()) {
                                    // 当是目录是，递归复制
                                    if (path.split('.')[0].length === 3) {  
                                        copyDir(_src, _dist, callback)
                                    }
                                }
                            }
                        })
                    })
                }
            })
        }
    }
}

function isImage(path) {
    return ['.png', '.jpg', '.jpeg'].some((ext) => {
        return path.endsWith(ext)
    })
}

function isKey(path) {
    return ['.key'].some((ext) => {
        return path.endsWith(ext)
    })
}

function setTemplate(path) {
    const [relative, src, first, second] = path.split('/')
    template.push(`/chanlun/${first}/${second}`)
}

copyDir('./source', './docs/chanlun', (err) => { 
    console.log(err)
})

let timer = setTimeout(() => {
    // console.log(template)
    template.sort()
    template = JSON.stringify(template)

    let sidebar = fs
        .readFileSync(
            path.resolve(process.cwd(), 'scripts/template.txt'),
            'utf-8',
        )
        .replace(/__CHANLUN_TEMPLATE__/g, template);
    fs.writeFileSync(
        path.resolve(process.cwd(), './docs/.vuepress/sidebar.js'),
        sidebar,
        'utf-8',
    );

    clearTimeout(timer)
}, 2000)