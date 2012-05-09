raptorBuilder.addLoader(function(raptor) {

    var stacktraces = raptor.stacktraces,
        global = raptor.global;
    
    /**
     * This class servers a logger that sends all output to the "console" object (if it exists).
     * 
     * @class
     * @constructor Creates a new ConsoleLogger with the provided logging level and logger name
     * @param {number} level The log level
     * @param {string} loggerName The logger name
     * 
     * @name logging_Console-ConsoleLogger
     */
    var ConsoleLogger = function(level, loggerName) {
        this._loggerName = loggerName;
        this._logLevel = level;
    };

    
    ConsoleLogger.prototype = /** @lends logging_Console-ConsoleLogger.prototype */ {
        
        /**
         * 
         */
        isDebugEnabled: function()
        {
            return this._logLevel === 0;
        },
        
        /**
         * 
         */
        isInfoEnabled: function()
        {
            return this._logLevel <= 1;
        },
        
        /**
         * 
         */
        isWarnEnabled: function()
        {
            return this._logLevel <= 2;
        },
        
        /**
         * 
         */
        isErrorEnabled: function()
        {
            return this._logLevel <= 3;
        },
        
        /**
         * 
         */
        isFatalEnabled: function()
        {
            return this._logLevel <= 4;
        },
        
        /**
         * 
         */
        dump: function(obj, desc, allProps)
        {
            if (!this.isDebugEnabled()) return;
            
            if (desc)
            {
                desc = 'Object dump (' + desc + '):';
            }
            else
            {
                desc = 'Object dump:';
            }
            
            this._log('debug', [desc]);
            if (console && console.debug)
            {
                console.debug(obj);
            }
        },
        
        /**
         * 
         */
        debug: function(message, exception)
        {
            if (!this.isDebugEnabled()) return;
            this._log('debug', message, exception);
        },
        
        /**
         * 
         */
        info: function(message, exception)
        {
            if (!this.isInfoEnabled()) return;
            this._log('info', message, exception);
        },
        
        /**
         * 
         */
        warn: function(message, exception)
        {
            if (!this.isWarnEnabled()) return;
            this._log('warn', message, exception);
        },
        
        /**
         * 
         */
        error: function(message, exception, includeStackTrace)
        {
            
            
            if (!this.isErrorEnabled()) return;
            this._log('error', message, exception, includeStackTrace !== false);
        },
        
        /**
         * 
         */
        fatal: function(message, exception)
        {
            if (!this.isFatalEnabled()) return;
            this._log('fatal', message, exception, true);
        },
        
        /**
         * 
         */
        _log: function(level, message, exception, includeStackTrace)
        {
            if (global.console && console[level])
            {
                

                try
                {
                    
                    var out = level.toUpperCase() + " " + this._loggerName + ": " + ( message != null ? message : '');

                    if (exception != null)
                    {
                        out += '\n\n' + stacktraces.trace(exception);
                    }
                    else if (message instanceof Error)
                    {
                        out += '\n\n' + stacktraces.trace(message);
                    }
                    
                    
                    console[level](out);
                                  
                }
                catch(e) {
                    
                    console.log('LOG EXCEPTION: ' + e, e.stack);
                    console.error(e);
                }
            }
        },
        
        /**
         * 
         */
        trace: function(message)
        {
            if (this.isDebugEnabled())
            {
                if (global.console && console.trace)
                {
                    if (message)
                    {
                        this.debug(message);
                    }
                    console.trace();
                }
                else
                {
                    var stackTrace = stacktraces ? stacktraces.trace() : "(stack trace not available)";
                    this.debug((message ? message + "\n": "") + stackTrace);
                }
            }
        }
    };
    
    /**
     * @extension Console
     */
    raptor.extendCore('logging', {
        
        /**
         * @type logging_Console-ConsoleLogger
         */
        ConsoleLogger: ConsoleLogger
    });

});