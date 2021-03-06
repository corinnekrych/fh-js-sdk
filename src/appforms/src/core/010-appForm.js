var appForm = function(module) {
  module.init = init;

  function init(params, cb) {
    var def = {
      'updateForms': true
    };
    if (typeof cb === 'undefined') {
      cb = params;
    } else {
      for (var key in params) {
        def[key] = params[key];
      }
    }


    //init config module
    var config = def.config || {};
    appForm.config = appForm.models.config;
    appForm.config.init(config, function(err) {
      if (err) {
        $fh.forms.log.e("Form config loading error: ", err);
      }
      appForm.models.log.loadLocal(function(err) {
        if(err){
          console.error("Error loading config from local storage");
        }

        appForm.models.submissions.loadLocal(function(err){
          if(err){
            console.error("Error loading submissions");
          }

          //Loading the current state of the uploadManager for any upload tasks that are still in progress.
          appForm.models.uploadManager.loadLocal(function(err) {
            $fh.forms.log.d("Upload Manager loaded from memory.");
            if (err) {
              $fh.forms.log.e("Error loading upload manager from memory ", err);
            }

            //Starting any uploads that are queued
            appForm.models.uploadManager.start();
            //init forms module
            $fh.forms.log.l("Refreshing Theme.");
            appForm.models.theme.refresh(true, function(err) {
              if (err) {
                $fh.forms.log.e("Error refreshing theme ", err);
              }
              if (def.updateForms === true) {
                $fh.forms.log.l("Refreshing Forms.");
                appForm.models.forms.refresh(true, function(err) {
                  if (err) {
                    $fh.forms.log.e("Error refreshing forms: ", err);
                  }
                  cb();
                });
              } else {
                cb();
              }
            });
          });
        });

      });
    });
  }
  return module;
}(appForm || {});