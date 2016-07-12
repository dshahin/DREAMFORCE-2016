(function() {


window.configSettings = {
    staticPath: '',
    config: {  },
    remoteActions: {
        getSidebar      : '{!$RemoteAction.AlfredHomeController.getSidebar}',
        getUserInfo     : '{!$RemoteAction.AlfredHomeController.getUserInfo}',
        yo              : '{!$Testy.say.yo.me.newell}'
    },
    mocks: {
        // '{!$RemoteAction.AlfredHomeController.getSidebar}' : 'getSidebar',
        // '{!$RemoteAction.AlfredHomeController.getUserInfo}' : 'getUserInfo',
        // '{!$Testy.say.yo.me.newell}': 'products6',
        //String value of your mock matches json object on json-server
        '{!$Testy.say.yo.me.newell.Simple.Object}': {
            timeout : 5000,
            method : function(){
                return {
                    "yo" : "my name is yo"
                };
            }
        }
    }
};





})();
