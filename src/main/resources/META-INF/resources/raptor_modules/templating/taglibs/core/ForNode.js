/*
 * Copyright 2011 eBay Software Foundation
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

raptor.defineClass(
    'templating.taglibs.core.ForNode',
    'templating.compiler.Node',
    function() {
        "use strict";
        
        var errors = raptor.errors,
            forEachRegEx = /^(.+)\s+in\s+(.+)$/,
            stringify = raptor.require("json.stringify").stringify,
            parseForEach = function(value) {
                var match = value.match(forEachRegEx);
                if (!match) {
                    throw new Error('Invalid each attribute of "' + value + '"');
                }
                return {
                    "var": match[1],
                    "in": match[2]
                };
            };
        
        var ForNode = function(props) {
            ForNode.superclass.constructor.call(this);
            if (props) {
                this.setProperties(props);    
            }
        };

        ForNode.prototype = {
            doGenerateCode: function(template) {
                var each = this.getProperty("each"),
                    separator = this.getProperty("separator"),
                    varStatus = this.getProperty("varStatus");
                
                if (!each) {
                    this.addError('"each" attribute is required');
                    this.generateCodeForChildren(template);
                    return;
                }
                
                var parts;
                try
                {
                    parts = parseForEach(each);
                }
                catch(e) {
                    this.addError(e.message);
                    this.generateCodeForChildren(template);
                    return;
                }
                
                var items = template.makeExpression(parts["in"]);
                var varName = parts["var"];
                if (separator && !varStatus) {
                    varStatus = "__loop";
                }
                
                var forEachParams;
                if (varStatus) {
                    forEachParams = [varName, varStatus];
                    
                    template.addJavaScriptCode(template.getStaticHelperFunction("forEachVarStatus", "fv") + '(' + items + ', function(' + forEachParams.join(",") + '){\n');
                    this.generateCodeForChildren(template, true /* indent */);
                    if (separator) {
                        template.incIndent();
                        template.addJavaScriptCode("if (!" + varStatus + ".isLast()) {\n");
                        template.incIndent();
                        template.addWrite(template.isExpression(separator) ? separator.getExpression() : stringify(separator));
                        template.decIndent();
                        template.addJavaScriptCode("}\n");
                        template.decIndent();
                    }
                    template.addJavaScriptCode('});\n\n');
                }
                else {
                    if (this.getProperty('forLoop') === true) {
                        forEachParams = ["__array", "__index", "__length", varName];
                        template.addJavaScriptCode(template.getStaticHelperFunction("forLoop", "fl") + '(' + items + ', function(' + forEachParams.join(",") + '){\n');
                        template.incIndent();
                            template.addJavaScriptCode('for (;__index<__length;__index++) {\n');
                            template.incIndent();
                            template.addJavaScriptCode(varName + '=__array[__index];\n');
                            this.generateCodeForChildren(template);
                            template.decIndent();
                        template.decIndent();
                        template.addJavaScriptCode('}});\n');
                    }
                    else {
                        forEachParams = [varName];
                        template.addJavaScriptCode(template.getStaticHelperFunction("forEach", "f") + '(' + items + ', function(' + forEachParams.join(",") + ') {\n');                    
                        this.generateCodeForChildren(template, true /* indent */);
                        template.addJavaScriptCode('});\n\n');
                    }
                }
                
                
            }
        
        };
        
        return ForNode;
    });