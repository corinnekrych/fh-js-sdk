var logger =require("./logger");
var cloud = require("./waitForCloud");
var fhparams = require("./fhparams");
var ajax = require("./ajax");
var handleError = require("./handleError");
var appProps = require("./appProps");
var _ = require('underscore');

function doActCall(opts, success, fail){
  var cloud_host = cloud.getCloudHost();
  var url = cloud_host.getActUrl(opts.act);
  var params = opts.req || {};
  params = fhparams.addFHParams(params);
  var headers = fhparams.getFHHeaders();
  if (opts.headers) {
    headers = _.extend(headers, opts.headers);
  }
  return ajax({
    "url": url,
    "tryJSONP": true,
    "type": "POST",
    "dataType": "json",
    "data": JSON.stringify(params),
    "headers": headers,
    "contentType": "application/json",
    "timeout": opts.timeout || appProps.timeout,
    "success": success,
    "error": function(req, statusText, error){
      return handleError(fail, req, statusText, error);
    }
  });
}

module.exports = function(opts, success, fail){
  logger.debug("act is called");
  if(!fail){
    fail = function(msg, error){
      logger.debug(msg + ":" + JSON.stringify(error));
    };
  }

  if(!opts.act){
    return fail('act_no_action', {});
  }

  cloud.ready(function(err, cloudHost){
    logger.debug("Calling fhact now");
    if(err){
      return fail(err.message, err);
    } else {
      doActCall(opts, success, fail);
    }
  });
};