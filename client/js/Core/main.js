var scHelper = null;
var scKeynodes = null; 


SCWeb.core.Main = {
    
    window_types: [],
    idtf_modes: [],
    menu_commands: {},
    default_cmd_str: "ui_menu_view_full_semantic_neighborhood",
    
    /**
     * Initialize sc-web core and ui
     * @param {Object} params Initializetion parameters.
     * There are required parameters:
     * - menu_container_id - id of dom element, that will contains menu items
     */
    init: function(params) {
        var dfd = new jQuery.Deferred();

        var self = this;
        //SCWeb.ui.Locker.show();

        SCWeb.core.Server._initialize();
        SctpClientCreate().done(function(client) {
        
        window.sctpClient = client;
        window.scHelper = new ScHelper(window.sctpClient);
        window.scKeynodes = new ScKeynodes(window.scHelper);

        window.scKeynodes.init().done(function() {
            window.scHelper.init().done(function() {

                    $.when(SCWeb.ui.TaskPanel.init()).done(function() {
                        SCWeb.core.Server.init(function(data) {
                            self.menu_commands = data.menu_commands;
                            self.user = data.user;

                            data.menu_container_id = params.menu_container_id;

                            SCWeb.core.Translation.fireLanguageChanged(self.user.current_lang);

                            $.when(SCWeb.ui.Core.init(data),
                                SCWeb.core.ComponentManager.init(),
                                SCWeb.core.Translation.update()
                                )
                            .done(function() {
                                    dfd.resolve();
                                
                                    var url = parseURL(window.location.href);

                                    if (url.searchObject) {
                                        var question = url.searchObject['question'];
                                        if (question) {
                                            /// @todo Check question is realy a question
                                            SCWeb.ui.WindowManager.appendHistoryItem(question);
                                            return;
                                        }
                                    }

                                    SCWeb.core.Server.resolveScAddr([params.default_keynode], function(addrs) {
                                        var argumentAddr = addrs[params.default_keynode];
                                        //var window = SCWeb.core.ui.Windows.createWindow(outputAddr);
                                        SCWeb.core.Main.doDefaultCommand([argumentAddr]);
                                        if (params.first_time)
                                            $('#help-modal').modal({"keyboard": true});
                                    });
                
                                
                            });
                        });
                    });
                });

            });
        });
            
        
       
        
        return dfd.promise();
    },

    _initUI: function() {

    },
    
    /**
     * Returns sc-addr of preffered output language for current user
     */
    getDefaultExternalLang: function() {
        return this.user.default_ext_lang;
    },
    
    /**
     * Initiate user interface command
     * @param {String} cmd_addr sc-addr of user command
     * @param {Array} cmd_args Array of sc-addrs with command arguments
     */
    doCommand: function(cmd_addr, cmd_args) {
        SCWeb.core.Server.doCommand(cmd_addr, cmd_args, function(result) {
            if (result.question != undefined) {
                SCWeb.ui.WindowManager.appendHistoryItem(result.question);
            }
        });
    },
    
    /**
     * Initiate default user interface command
     * @param {Array} cmd_args Array of sc-addrs with command arguments
     */
    doDefaultCommand: function(cmd_args) {
        if (!this.default_cmd) {
            var self = this;
            SCWeb.core.Server.resolveScAddr([this.default_cmd_str], function(addrs) {
                self.default_cmd = addrs[self.default_cmd_str];
                if (self.default_cmd) {
                    self.doCommand(self.default_cmd, cmd_args);
                }
            });
        } else {
            this.doCommand(this.default_cmd, cmd_args);
        }
    },
    
};

