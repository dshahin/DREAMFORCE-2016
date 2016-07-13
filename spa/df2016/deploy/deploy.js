var fs = require('fs');
var zip = require('node-zip');
var jsforce = require('jsforce');
var options;

function FileListPlugin(opt) {
  options = opt;
}

FileListPlugin.prototype.apply = function(compiler) {
  compiler.plugin('emit', function(compilation, callback) {


          ///////////////////
          var conn = new jsforce.Connection({
            username: process.env.SF_DF2016_USERNAME,
            password: process.env.SF_DF2016_PASSWD,
            loginUrl  : process.env.SF_DF2016_URL
          });

          conn.login(process.env.SF_DF2016_USERNAME, process.env.SF_DF2016_PASSWD, function(err, res) {
            var staticResource = new zip();

            for (var filename in compilation.assets) {
              var file = fs.readFileSync(options.path + filename);
              staticResource.file(filename, file);
            }

            var staticResourceZip = staticResource.generate({
              base64: true,
              compression: 'DEFLATE'
            });

            var metaData = {
              fullName: options.name,
              content: staticResourceZip,
              contentType: 'application/x-zip-compressed',
              cacheControl: 'Public'
            };

            conn.metadata.upsert('StaticResource', [metaData], function(err, results) {
              if (err) {
                throw err;
              }

              if (results) {
                console.log('StaticResource: ', results);
              }
            });

            conn.identity(function(err, res) {
              if (err) {
                return console.error(err);
              }
              console.log("user ID: " + res.user_id);
              console.log("organization ID: " + res.organization_id);
              console.log("username: " + res.username);
              console.log("display name: " + res.display_name);
            });

          });




    callback();
  });
};

module.exports = FileListPlugin;
