'use strict';

// index.html page to dist folder
import '!!file-loader?name=[name].[ext]!../favicon.ico';

// main App module
import "./index.module";

import "../assets/styles/sass/index.scss";

angular.element(document).ready(function () {
  angular.bootstrap(document, ['dreamCards'], {
    strictDi: true
  });
});
