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

function submitForm(jQuery, wufoo, iron, formData, cb) {
  var payload = prepareWufooForm(wufoo.url, wufoo.key, formData)
  var job = prepareJob(iron.codeName, payload)

  jQuery.ajax({ url: iron.url + '/2/projects/' + iron.projectId + '/schedules'
              , type: 'POST'
              , dataType: 'json'
              , data: JSON.stringify(job)
              , headers: { 'Accept': 'application/json'
                         , 'Content-Type': 'application/json'
                         , 'Accept-Encoding': 'gzip/deflate'
                         , 'Authorization': 'OAuth ' + iron.oauth
                         }
              , success: cb
              })
}

/**
 *
 * @param {string} phone
 */
function fixPhoneNumber(phone) {
  return phone.replace(/-|\.|\(|\)|\s/g, '')
}