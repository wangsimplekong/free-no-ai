实现步骤：
1. 安装所需的包
swagger-jsdoc swagger-ui-express
2. 新建文件 swagger.js
const swaggerJSDoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')
const path = require('path')

const swaggerInit = (app, baseUrl) => {
  //options是swaggerJSDoc的配置项
  const options = {
    swagger: '2.0',
    //definition是swagger的配置项
    definition: {
      info: {
        title: 'Node Swagger API',
        version: '1.0.0',
        description: 'Demonstrating how to describe a RESTful API with Swagger',
      },
    },
    // 重点，指定 swagger-jsdoc 去哪个路由下收集 swagger 注释
    apis: [path.join(process.cwd(), '/routes/*.js')],
  }
  const swaggerSpec = swaggerJSDoc(options)


  // 可以访问 xxx/api-docs 看到生成的swagger接口文档
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}

module.exports = swaggerInit
3. 在app.js中引入swagger.js文件
const app = express()

//swagger imports
//这里填你的swagger文件所在路径
const swaggerInit = require('./swagger.js')
swaggerInit(app)
4. 写一个swagger格式的接口
const express = require('express')
const router = express.Router()

/**
 * @swagger
 * /api/getPetList:
 *  get:
 *   tags:
 *     - pet
 *   description: Multiple name values can be provided with comma separated strings
 *   parameters:
 *     - name: name
 *       in: query
 *       description: name values that need to be considered for filter
 *       required: false
 *   responses:
 *     '200':
 *       description: successful operation
 *     '400':
 *       description: Invalid name value
 */
router.get('/api/getPetList', (req, res, next) => {
  const { query } = req
  res.send({
    status: 200,

    data:[ ],

    msg: '请求成功',
  })
})

module.exports = router
