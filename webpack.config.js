const path = require('path')
const HtmlWebpalckPlugin = require('html-webpack-plugin')

module.exports = {
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'public'),
        filename: 'bundle.js'
    },
    devtool: 'inlin-source-map',
    devServer: {
        contentBase: './public',
        open: true,
        port: 9001
    },
    plugins: [
        new HtmlWebpalckPlugin({
            template: './src/index.html'
        })
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }, {
                test: /\.css$/,
                use: [{
                    loader: "style-loader"
                }, {
                    loader: "css-loader"
                }]
            }, {
                // 问题：默认处理不了html中img图片
                // 处理图片资源
                test: /\.(jpg|png|gif|JPG)$/,
                // 使用一个loader
                // 下载 url-loader file-loader
                loader: 'url-loader',
                options: {
                    // 图片大小小于8kb，就会被base64处理
                    // 优点: 减少请求数量（减轻服务器压力）
                    // 缺点：图片体积会更大（文件请求速度更慢）
                    limit: 8 * 1024,
                    // 问题：因为url-loader默认使用es6模块化解析，而html-loader引入图片是commonjs
                    // 解析时会出问题：[object Module]
                    // 解决：关闭url-loader的es6模块化，使用commonjs解析
                    esModule: false,
                    // 给图片进行重命名
                    // [hash:10]取图片的hash的前10位
                    // [ext]取文件原来扩展名
                    name: '[hash:10].[ext]'
                }
            }
        ]
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js']
    },

}