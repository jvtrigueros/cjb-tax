'use strict'

/**
 *
 * @param {string} endpoint
 * @param {string} key
 * @param {string} data
 */
function prepareWufooForm(endpoint, key, data) {
  return { wufoo: {url: endpoint, key: key}, formData: data }
}

function prepareJob(codeName, payload) {
  return { schedules: [ { payload: JSON.stringify(payload) , code_name: codeName } ] }
}



/**
 *
 * @param {string} phone
 */
function fixPhoneNumber(phone) {
  return phone.replace(/-|\.|\(|\)|\s/g, '')
}