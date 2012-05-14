raptor.defineClass(
    "packaging.include-types.IncludeType_css",
    function() {
        return {
            aggregate: function(include, manifest, aggregator) {
                var resource = manifest.resolveResource(include.path);
                aggregator.addResourceCode("css", resource);
            }
        };
    });
