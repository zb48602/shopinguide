import promisefy from '../utils/promisify'

export const getLocation = promisefy(wx.getLocation)
export const showToast = promisefy(wx.showToast)
export const showModal = promisefy(wx.showModal)