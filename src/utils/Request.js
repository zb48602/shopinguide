import { Promise } from 'es6-promise'
const fixDomain = require('./domain').fixDomain

const promisify = require('./promisify')
const request = promisify(wx.request)

const methods = ['get', 'post', 'put', 'patch', 'del']

class Request {
  constructor() {
    methods.forEach(
      method =>
        this[method] = (
          url,
          { data, formEncoding = true, formJson, auth } = {}
        ) =>
          new Promise((resolve, reject) => {
            const options = {
              url: fixDomain(url, __ENV__),
              data,
              method,
              header: {}
            }
            const { header } = options
            if (formEncoding) {
              header['Content-Type'] = 'application/x-www-form-urlencoded'
            }
            if (formJson) {
              header['Content-Type'] = 'application/json'
              header['Accept'] = 'application/json'
            }
            request(options).then(
              ({ data: { status, data,message } }) => {
                if (status === 200||status==0) {
                  resolve(data)
                } else {
                  reject(message)
                }
              },
              err => reject(err)
            )
          })
    )
  }
}

export default Request
