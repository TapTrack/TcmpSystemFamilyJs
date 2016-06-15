(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define([], factory);
    } else if (typeof exports === 'object') {
        // Node, CommonJS-like
        module.exports = factory();
    } else {
        // Browser globals (root is window)
        root.TappySystemFamily = factory();
    }
}(this, function () {
    var commandFamily = new Uint8Array([0x00,0x00]);
    
    var getMissingMethods = function(instance,methods) {
        var missing = [];
        for(var i = 0; i < methods.length; i++) {
            var method = methods[i];
            if(typeof instance[method] !== "function") {
                missing.push(method);
            }
        }
        return missing;
    };

    var implementsMethods = function(instance,methods) {
        var missingMethods = getMissingMethods(instance,methods);
        if(missingMethods === null || missingMethods.length > 0) {
            return false;
        } else {
            return true;
        }
    };
    
    var arrEquals = function(a1, a2) {
        return (a1.length == a2.length) && a1.every(function(e, i){
            return e === a2[i];
        });
    };

    var cmdMethods = ["getCommandFamily","getCommandCode","getPayload"];

    var c = {};
    
    var CommandCodes = {
        GetHardwareVersion: 0xFE,
        GetFirmwareVersion: 0xFF,
        GetBatteryLevel: 0x02,
        Ping: 0xFD,
        SetConfig: 0x01
    };

    var typeChecker = function(commandCode) {
        return function(cmd) {
            if(typeof cmd !== "object" || cmd === null) {
                throw new Error("Command passed to check type must be an object implementing: "+cmdMethods.join(", "));
            } else if(!implementsMethods(cmd,cmdMethods)) {
                throw new Error("Command passed to check type must also implement: "+
                        getMissingMethods(cmd,cmdMethods).join(", "));
            }
            else {
                return arrEquals(cmd.getCommandFamily(),commandFamily) && cmd.getCommandCode() === commandCode;
            }
        };
    };

    var AbsProto = function(commandCode){
        return {
            getCommandFamily: function() {
                return commandFamily;
            },

            getCommandCode: function() {
                return commandCode; 
            },

            getPayload: function() {
                return [];
            },

            parsePayload: function() {

            },

        };
    };
    
    var gfv = function() {
        
    };
    gfv.prototype = AbsProto(CommandCodes.GetFirmwareVersion);
    gfv.isTypeOf = typeChecker(CommandCodes.GetFirmwareVersion);
    c.GetFirmwareVersion = gfv;
    
    var ghv = function() {
        
    };
    ghv.prototype = AbsProto(CommandCodes.GetHardwareVersion);
    ghv.isTypeOf = typeChecker(CommandCodes.GetHardwareVersion);
    c.GetHardwareVersion = ghv;

    
    var ping = function() {
        
    };
    ping.prototype = AbsProto(CommandCodes.Ping);
    ping.isTypeOf = typeChecker(CommandCodes.Ping);
    c.Ping = ping;
    
    var gbatt = function() {
        
    };
    gbatt.prototype = AbsProto(CommandCodes.GetBatteryLevel);
    gbatt.isTypeOf = typeChecker(CommandCodes.GetBatteryLevel);
    c.GetBatteryLevel = gbatt;
    
    var setCfg = function() {
        if(arguments.length < 2) {
            this.param = 0x01;
            this.value = 0x00;
        }
        else {
            this.param = arguments[0];
            this.value = arguments[1];
        }
    };
    setCfg.prototype = AbsProto(CommandCodes.SetConfig);
    setCfg.isTypeOf = typeChecker(CommandCodes.SetConfig);
    setCfg.prototype.getPayload = function() {
        return [this.param,this.value];
    };
    setCfg.prototype.parsePayload = function(payload) {
        if(payload.length < 2) {
            throw new Error("Set config payloads must be at least two bytes");
        }
        this.param = payload[0];
        this.value = payload[1];
    };
    setCfg.prototype.getParam = function() {
        return this.param;
    };
    setCfg.prototype.getValue = function() {
        return this.value;
    };
    setCfg.prototype.setParam = function(param) {
        this.param = param;
    };
    setCfg.prototype.setValue = function(value) {
        this.value = value;
    };
    c.SetConfigItem = setCfg;
  
    var r = {};
    var ResponseCodes = {
        ConfigItemSuccess: 0x07,
        CrcMismatch: 0x03,
        FirmwareVersion: 0x06,
        HardwareVersion: 0x05,
        BatteryLevel: 0x08,
        ImproperMessageFormat: 0x01,
        LcsMismatch: 0x02,
        LengthMismatch: 0x04,
        Ping: 0xFD,
        SystemError: 0x7F,
    };
    
    r.ConfigItemSuccess = function() {
    };
    r.ConfigItemSuccess.prototype = AbsProto(ResponseCodes.ConfigItemSuccess);
    r.ConfigItemSuccess.isTypeOf = typeChecker(ResponseCodes.ConfigItemSuccess);

    r.CrcMismatch = function() {
    };
    r.CrcMismatch.prototype = AbsProto(ResponseCodes.CrcMismatch);
    r.CrcMismatch.isTypeOf = typeChecker(ResponseCodes.CrcMismatch);

    r.FirmwareVersion = function() {
        if(arguments.length < 2) {
            this.majorVersion = 0;
            this.minorVersion = 0;
        } else {
            this.majorVersion = arguments[0];
            this.minorVersion = arguments[1];
        }
    };
    r.FirmwareVersion.prototype = AbsProto(ResponseCodes.FirmwareVersion);
    r.FirmwareVersion.isTypeOf = typeChecker(ResponseCodes.FirmwareVersion);
    r.FirmwareVersion.prototype.getPayload = function() {
        return new Uint8Array([this.majorVersion,this.minorVersion]);
    };
    r.FirmwareVersion.prototype.parsePayload = function(payload) {
        if(payload.length < 2) {
            throw new Error("Firmware version responses must be at least 2 bytes");
        }
        else {
            this.majorVersion = payload[0];
            this.minorVersion = payload[1];
        }
    };
    r.FirmwareVersion.prototype.getMajorVersion = function() {
        return this.majorVersion;
    };
    r.FirmwareVersion.prototype.getMinorVersion = function() {
        return this.minorVersion;
    };
    r.FirmwareVersion.prototype.setMajorVersion = function(ver) {
        this.majorVersion = ver;
    };
    r.FirmwareVersion.prototype.setMinorVersion = function(ver) {
        this.minorVersion = ver;
    };


    r.BatteryLevel = function() {
        if(arguments.length < 1) {
            this.level = 0;
        } else {
            this.level = arguments[0];
        }
    };
    r.BatteryLevel.prototype = AbsProto(ResponseCodes.BatteryLevel);
    r.BatteryLevel.isTypeOf = typeChecker(ResponseCodes.BatteryLevel);
    r.BatteryLevel.prototype.getPayload = function() {
        return new Uint8Array([this.level]);
    };
    r.BatteryLevel.prototype.parsePayload = function(payload) {
        this.level = payload[0];
    };
    r.BatteryLevel.prototype.getBatteryLevel = function() {
        return this.level;
    };
    r.BatteryLevel.prototype.setBatteryLevel = function(level) {
        this.level = level;
    };


    r.HardwareVersion = function() {
        if(arguments.length < 2) {
            this.majorVersion = 0;
            this.minorVersion = 0;
        } else {
            this.majorVersion = arguments[0];
            this.minorVersion = arguments[1];
        }
    };
    r.HardwareVersion.prototype = AbsProto(ResponseCodes.HardwareVersion);
    r.HardwareVersion.isTypeOf = typeChecker(ResponseCodes.HardwareVersion);
    r.HardwareVersion.prototype.getPayload = function() {
        return new Uint8Array([this.majorVersion,this.minorVersion]);
    };
    r.HardwareVersion.prototype.parsePayload = function(payload) {
        if(payload.length < 2) {
            throw new Error("Hardware version responses must be at least 2 bytes");
        }
        else {
            this.majorVersion = payload[0];
            this.minorVersion = payload[1];
        }
    };
    r.HardwareVersion.prototype.getMajorVersion = function() {
        return this.majorVersion;
    };
    r.HardwareVersion.prototype.getMinorVersion = function() {
        return this.minorVersion;
    };
    r.HardwareVersion.prototype.setMajorVersion = function(ver) {
        this.majorVersion = ver;
    };
    r.HardwareVersion.prototype.setMinorVersion = function(ver) {
        this.minorVersion = ver;
    };
    
    r.ImproperMessageFormat = function() {
    };
    r.ImproperMessageFormat.prototype = AbsProto(ResponseCodes.ImproperMessageFormat);
    r.ImproperMessageFormat.isTypeOf = typeChecker(ResponseCodes.ImproperMessageFormat);

    r.LcsMismatch = function() {
    };
    r.LcsMismatch.prototype = AbsProto(ResponseCodes.LcsMismatch);
    r.LcsMismatch.isTypeOf = typeChecker(ResponseCodes.LcsMismatch);

    r.LengthMismatch = function() {
    };
    r.LengthMismatch.prototype = AbsProto(ResponseCodes.LengthMismatch);
    r.LengthMismatch.isTypeOf = typeChecker(ResponseCodes.LengthMismatch);

    r.Ping = function() {
    };
    r.Ping.prototype = AbsProto(ResponseCodes.Ping);
    r.Ping.isTypeOf = typeChecker(ResponseCodes.Ping);

    r.SystemError = function() {
        if(arguments.length < 3) {
            this.errorCode = 0;
            this.internalErrorCode = 0;
            this.readerStatus = 0;
            this.message = "";
        } else {
            this.errorCode = arguments[0];
            this.internalErrorCode = arguments[1];
            this.readerStatus = arguments[2];
            if(arguments.length > 3) {
                this.message = arguments[3];
            } else {
                this.message = "";
            }
        }
    };
    r.SystemError.isTypeOf = typeChecker(ResponseCodes.SystemError);
    r.SystemError.prototype = AbsProto(ResponseCodes.SystemError);
    r.SystemError.prototype.getPayload = function() {
        //convert string to byte array
        var utf8 = unescape(encodeURIComponent(this.message));
        var arr = [];
        for (var i = 0; i < utf8.length; i++) {
            arr.push(utf8.charCodeAt(i));
        }

        var payload = new Uint8Array(3+arr.length);
        payload[0] = this.errorCode;
        payload[1] = this.internalErrorCode;
        payload[2] = this.readerStatus;
        payload.set(arr,3);
        return payload;
    };

    r.SystemError.prototype.parsePayload = function(payload) {
        if(payload.length < 3) {
            throw new Error("System error payload must be at least 3 bytes");
        } else {
            this.errorCode = payload[0];
            this.internalErrorCode = payload[1];
            this.readerStatus = payload[2];

            if(payload.length > 3) {
                this.message = String.fromCharCode.apply(null, payload.slice(3));
            } else {
                this.message = "";
            }
        }
    };
    r.SystemError.prototype.getErrorCode = function() {
        return this.errorCode;
    };
    r.SystemError.prototype.getInternalErrorCode = function() {
        return this.internalErrorCode;
    };
    r.SystemError.prototype.getReaderStatusCode = function() {
        return this.readerStatus;
    };
    r.SystemError.prototype.getErrorMessage = function() {
        return this.message;
    };
    r.SystemError.prototype.setErrorCode = function(errorCode) {
        this.errorCode = errorCode;
    };
    r.SystemError.prototype.setInternalErrorCode = function(errorCode) {
        this.internalErrorCode = errorCode;
    };
    r.SystemError.prototype.setReaderStatusCode = function(errorCode) {
        this.readerStatus = errorCode;
    };
    r.SystemError.prototype.setErrorMessage = function(msg) {
        this.message = msg;

    };
     

    var e = {
        INVALID_PARAMETER: 0x05,
        UNSUPPORTED_COMMAND_FAMILY: 0x06,
        TOO_FEW_PARAMETERS: 0x07
    };


    var checkCommandValidity = function (cmd) {
        if(typeof cmd !== "object" || cmd === null) {
            throw new Error("Command passed to resolver must be an object implementing: "+cmdMethods.join(", "));
        } else if(!implementsMethods(cmd,cmdMethods)) {
            throw new Error("Error, command passed to resolver must also implement: "+
                    getMissingMethods(cmd,cmdMethods).join(", "));
        } else if(!arrEquals(cmd.getCommandFamily(),commandFamily)){
            return false;
        }
        return true;
    };
    
    var resolver = function() {
        
    };
    
    resolver.prototype.checkFamily = function(cmd) {
        return checkCommandValidity(cmd);
    };

    resolver.prototype.validate = function(cmd) {
        if(checkCommandValidity(cmd)) {
            return true;
        } else {
            throw new Error("Resolver doesn't support command's family");
        }
    };

    resolver.prototype.resolveCommand = function(cmd) {
        var parsed = null;
        if(this.validate(cmd)) {
            switch(cmd.getCommandCode()) {
                case CommandCodes.GetHardwareVersion:
                    parsed = new c.GetHardwareVersion();
                    parsed.parsePayload(cmd.getPayload());
                    break;
                case CommandCodes.GetFirmwareVersion:
                    parsed = new c.GetFirmwareVersion();
                    parsed.parsePayload(cmd.getPayload());
                    break;
                case CommandCodes.GetBatteryLevel:
                    parsed = new c.GetBatteryLevel();
                    parsed.parsePayload(cmd.getPayload());
                    break;
                case CommandCodes.Ping:
                    parsed = new c.Ping();
                    parsed.parsePayload(cmd.getPayload());
                    break;
                case CommandCodes.SetConfig:
                    parsed = new c.SetConfigItem();
                    parsed.parsePayload(cmd.getPayload());
                    break;
            }
        }
        return parsed;
    };

    resolver.prototype.resolveResponse = function(response) {
        var parsed = null;
        if(this.validate(response)) {
            var constructor = null;
            
            switch(response.getCommandCode()) {
                case ResponseCodes.ConfigItemSuccess:
                    constructor = r.ConfigItemSuccess;
                    break;
                case ResponseCodes.CrcMismatch:
                    constructor = r.CrcMismatch;
                    break;
                case ResponseCodes.FirmwareVersion:
                    constructor = r.FirmwareVersion;
                    break;
                case ResponseCodes.HardwareVersion:
                    constructor = r.HardwareVersion;
                    break;
                case ResponseCodes.BatteryLevel:
                    constructor = r.BatteryLevel;
                    break;
                case ResponseCodes.ImproperMessageFormat:
                    constructor = r.ImproperMessageFormat;
                    break;
                case ResponseCodes.LcsMismatch:
                    constructor = r.LcsMismatch;
                    break;
                case ResponseCodes.LengthMismatch:
                    constructor = r.LengthMismatch;
                    break;
                case ResponseCodes.Ping:
                    constructor = r.Ping;
                    break;
                case ResponseCodes.SystemError:
                    constructor = r.SystemError;
                    break;
            }
            
            if(constructor !== null) {
                parsed = new constructor();
                parsed.parsePayload(response.getPayload());
            }
        }

        return parsed;
    };

    return {
        Commands: c,
        Responses: r,
        ErrorCodes: e,
        Resolver: resolver,
        FamilyCode: commandFamily
    };
}));
