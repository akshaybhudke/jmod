//// "lib"
/// This installs a centralized set of javascript modules under
/// the "lib" namespace.

(function() {

    function LibException(msg) {
        this.msg = msg;
        this.toString = function() {
            return this.msg;
        };
    }

    function with_current_protocol(url) {
        var secure = false;
        
        if(document.location.href.substring(0, 5) == 'https')
            secure = true;
        
        return (secure ? 'https' : 'http') + '://' +
            url.replace(/^[^:]*:\/\//, '')
    }

    if(!window.__jmod_lib_url__ || !window.__jmod_lib_commit__) {
        throw new LibException("window.__jmod_lib_url__ and " +
                               "window.__jmod_lib_commit__ are required for " +
                               "the remote jMod libraries");
    }
    else {
        window.__jmod_lib_url__ = with_current_protocol(window.__jmod_lib_url__);
    }

    function jmod_lib_host() {
        // The jMod library url is set to a full url for downloading
        // jMod libraries, but we need just the host for requesting
        // different urls.
        var url = window.__jmod_lib_url__;
        var pattern = /https?:\/\/([^\/]*)\/.*/;
        return pattern.exec(url)[1];
    }

    function jmod_lib_commit() {
        return window.__jmod_lib_commit__;
    }

    function jmod_lib_url() {
        return window.__jmod_lib_url__;
    }

    function minified(url) {
        if(!window.__debug__) {
            return url + '/min';
        }
        return url;
    }
    
    function load_optimized(names, block) {
        // Make a list of module filenames and request them in
        // one single HTTP request (must be supported by the server).
        var minify = !window.__debug__;
        var host = jmod_lib_host();
        
        url = with_current_protocol(host + '/' +
                                    (minify ? 'min/' : '') +
                                    jmod_lib_commit() + '/' +
                                    names.join(','))

        jMod.internal.request_forcefully(
            url,
            block
        );
    }

    function load(names, block) {
        var minify = !window.__debug__;
        var host = jmod_lib_host();
        
        // Make a list of module filenames and request each
        // individually
        for(var i=0; i<names.length; i++) {
            var name = names[i];

            // Strip "lib" off the module name
            var file = name.substr(name.indexOf('.')+1);
            var version = jMod.internal.get_version(name);
            
            if(!version) {
                throw new LibException(
                    "Version error: " + name +
                        " (couldn't find version, and modules from " +
                        "\"lib\" require versions. See `jMod.init'"
                );
            }
            
            file += "-" + version + '.js'
            
            jMod.internal.request(
                names[i],
                with_current_protocol(host + '/' +
                                      (minify ? 'min/' : '') +
                                      'media/lib/' +
                                      file),
                block
            );
        }
    }
    
    // The `lib' namespace dispatches requests for modules off to the
    // centralized repository
    jMod.internal.make_namespace('lib', function(names, block, optimize) {
        if(!window.__debug__ && optimize) {
            load_optimized(names, block);
            return true;
        }
        else {
            load(names, block);
            return false;
        }
    });

})();
