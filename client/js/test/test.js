function _unit_test_sctp_common() {
    window.sctpClient.create_node(sc_type_node_abstract).done(function(res) {
        console.log('node: ' + res.result);
        var addr = res.result;
        window.sctpClient.check_element(addr).done(function(res) {
            console.log('exist');
            window.sctpClient.get_element_type(addr).done(function(res) {
                console.log(res.result);
                console.log(sc_type_node_abstract);
                console.log('check type: ' + (res.result & sc_type_node_abstract));
            });
        }).fail(function() {
            console.log('not exist');
        });

        window.sctpClient.create_link().done(function(res) {
            var addr2 = res.result;
            window.sctpClient.create_arc(sc_type_arc_pos_const_perm, addr, addr2).done(function(res) {
                console.log('arc: ' + res.result);
            });
        });
    });
}

function _unit_test_sctp_links() {
    var link_tests = [56, -78, 34.565, -78.232, 'a', 'test', new String('test2')];
    var link_types = ['int', 'int', 'float', 'float', 'string', 'string', 'string']
    for (var i = 0; i < link_tests.length; ++i) {
        (function(v, t) {
            window.sctpClient.create_link().done(function(res) {
                var addr = res.result;
                window.sctpClient.set_link_content(addr, v).done(function() {
                    window.sctpClient.get_link_content(addr, t).done(function(res) {
                        console.log('Integet test: ' + v + ' -> ' + res.result + ' [' + (v == res.result ? 'ok' : 'fail') + ']');
                    });
                });
            });
        })(link_tests[i], link_types[i]);
    }
}

window._unit_tests = function() {
    // test
    console.log('--- Unit testing ---');
    _unit_test_sctp_links();
};