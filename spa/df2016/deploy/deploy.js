var fs = require('fs');
var zip = require('node-zip');
// var path = require('path');
var jsforce = require('jsforce');
//var meta = require('jsforce-metadata-tools');
var keytar = require('keytar');
var options;

function FileListPlugin(opt) {
  options = opt;
}

FileListPlugin.prototype.apply = function(compiler) {
  compiler.plugin('emit', function(compilation, callback) {

    fs.readFile('../../.yo-rc.json', 'utf8', function(err, data) {
      if (err) {
        throw err;
      } // we'll not consider error handling for now
      var obj = JSON.parse(data);

      var pass = keytar.getPassword(
          'yo-force-service',
          obj['generator-force'].project.username
      );

      var conn = new jsforce.Connection({
        username: obj['generator-force'].project.username,
        password: pass
        // instanceUrl: obj.instanceUrl,
        // accessToken: obj.accessToken
      });

      conn.login(obj['generator-force'].project.username, pass, function(err, res) {
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


    });

    callback();
  });
};

module.exports = FileListPlugin;
